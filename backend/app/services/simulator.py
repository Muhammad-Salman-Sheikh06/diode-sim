"""
SPICE simulation service.

Generates SPICE netlists via direct string construction, invokes ngspice as a
subprocess for DC operating-point analysis, and parses node voltages and branch
currents from the output.
"""

from __future__ import annotations

import os
import re
import subprocess
import tempfile
from typing import Dict, List, Tuple

# Terminal IDs per component type — must match frontend componentDefs.js
_COMPONENT_NODES: Dict[str, List[str]] = {
    "resistor":       ["A", "B"],
    "capacitor":      ["+", "-"],
    "led":            ["A", "K"],
    "voltage_source": ["+", "-"],
    "ground":         ["GND"],
    "npn_transistor": ["B", "C", "E"],
    "switch":         ["A", "B"],
    "potentiometer":  ["A", "W", "B"],
    "junction":       ["J"],
}


# ── Union-Find ────────────────────────────────────────────────────────────────

def _build_nets(components: list, wires: list) -> Dict[Tuple[str, str], str]:
    parent: Dict[Tuple, Tuple] = {}

    def find(x: Tuple) -> Tuple:
        if x not in parent:
            parent[x] = x
        if parent[x] != x:
            parent[x] = find(parent[x])
        return parent[x]

    def union(a: Tuple, b: Tuple) -> None:
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[ra] = rb

    all_terms: List[Tuple[str, str]] = []
    for c in components:
        for nid in _COMPONENT_NODES.get(c["type"], []):
            key = (c["id"], nid)
            find(key)
            all_terms.append(key)

    for w in wires:
        union(
            (w["fromComponentId"], w["fromNode"]),
            (w["toComponentId"],   w["toNode"]),
        )

    gnd_root = None
    for c in components:
        if c["type"] == "ground":
            gnd_root = find((c["id"], "GND"))
            break

    root_net: Dict[Tuple, str] = {}
    counter = 1
    for key in all_terms:
        root = find(key)
        if root not in root_net:
            if gnd_root and root == gnd_root:
                root_net[root] = "0"
            else:
                root_net[root] = f"net{counter}"
                counter += 1

    return {key: root_net[find(key)] for key in all_terms}


# ── Netlist builder ───────────────────────────────────────────────────────────

def _build_netlist(
    components: list, wires: list
) -> Tuple[str, Dict, Dict[str, str]]:
    """
    Return (spice_netlist, nets, elem_to_comp).

    elem_to_comp maps lowercase SPICE element names (e.g. 'r1', 'v1') to the
    component ID they originated from, so branch currents can be linked back.
    """
    nets = _build_nets(components, wires)
    type_count: Dict[str, int] = {}
    elem_to_comp: Dict[str, str] = {}   # 'r1' -> component_id
    lines = ["* diode-sim generated netlist\n"]

    has_led = any(c["type"] == "led" for c in components)
    bjt_model_lines: list = []  # per-transistor .model lines (supports different hFE values)

    for c in components:
        t = c["type"]
        type_count[t] = type_count.get(t, 0) + 1
        idx = type_count[t]
        cid = c["id"]
        state = c.get("state") or {}
        props = c.get("props") or {}

        def net(nid: str, _cid: str = cid) -> str:
            return nets.get((_cid, nid), "0")

        if t == "resistor":
            resistance = max(1e-3, float(props.get("resistance", 1000)))
            elem = f"R{idx}"
            lines.append(f"{elem} {net('A')} {net('B')} {resistance:.6g}\n")
            elem_to_comp[elem.lower()] = cid

        elif t == "capacitor":
            capacitance_uf = max(1e-6, float(props.get("capacitance", 10)))
            elem = f"C{idx}"
            lines.append(f"{elem} {net('+')} {net('-')} {capacitance_uf:.6g}u\n")
            elem_to_comp[elem.lower()] = cid

        elif t == "led":
            elem = f"D{idx}"
            lines.append(f"{elem} {net('A')} {net('K')} DLED\n")
            elem_to_comp[elem.lower()] = cid

        elif t == "voltage_source":
            voltage = float(props.get("voltage", 5))
            elem = f"V{idx}"
            lines.append(f"{elem} {net('+')} {net('-')} DC {voltage:.6g}\n")
            elem_to_comp[elem.lower()] = cid

        elif t == "npn_transistor":
            # Each transistor gets its own model so hFE can differ per instance
            hfe = max(1.0, float(props.get("hfe", 100)))
            model_name = f"NPN_Q{idx}"
            elem = f"Q{idx}"
            lines.append(f"{elem} {net('C')} {net('B')} {net('E')} {model_name}\n")
            elem_to_comp[elem.lower()] = cid
            bjt_model_lines.append(
                f".model {model_name} NPN(Is=1e-14 Bf={hfe:.1f} Vaf=74.3)\n"
            )

        elif t == "switch":
            # Closed → near-short (0.001 Ω); open → near-open (1 GΩ)
            # "Rsw" prefix avoids element-name collision with resistor "R{idx}" names
            r_val = "0.001" if state.get("closed", False) else "1e9"
            elem = f"Rsw{idx}"
            lines.append(f"{elem} {net('A')} {net('B')} {r_val}\n")
            elem_to_comp[elem.lower()] = cid

        elif t == "potentiometer":
            total_r = max(1.0, float(props.get("totalResistance", 1000)))
            ratio = float(state.get("ratio", 0.5))
            ratio = max(0.001, min(0.999, ratio))
            r_aw = ratio * total_r
            r_wb = (1 - ratio) * total_r
            ea, eb = f"R{idx}a", f"R{idx}b"
            lines.append(f"{ea} {net('A')} {net('W')} {r_aw:.6g}\n")
            lines.append(f"{eb} {net('W')} {net('B')} {r_wb:.6g}\n")
            elem_to_comp[ea.lower()] = cid
            elem_to_comp[eb.lower()] = cid

        elif t in ("ground", "junction"):
            pass  # pure net reference; no SPICE element needed

    if has_led:
        lines.append(".model DLED D(Is=1e-20 N=1.5)\n")
    for bjt_line in bjt_model_lines:
        lines.append(bjt_line)

    # Collect non-ground net names for voltage prints
    net_names = sorted({n for n in nets.values() if n != "0"})
    v_prints = " ".join(f"v({n})" for n in net_names)
    i_prints = " ".join(f"i({e})" for e in elem_to_comp)

    # Use a .control block so we can print both voltages and branch currents
    lines.append(".control\n")
    lines.append("op\n")
    if v_prints:
        lines.append(f"print {v_prints}\n")
    if i_prints:
        lines.append(f"print {i_prints}\n")
    lines.append("exit\n")
    lines.append(".endc\n")
    lines.append(".end\n")

    return "".join(lines), nets, elem_to_comp


# ── Output parser ─────────────────────────────────────────────────────────────

def _parse_output(
    output: str,
) -> Tuple[Dict[str, float], Dict[str, float]]:
    """
    Parse ngspice output.  Returns (voltages, currents).
    voltages: {net_name: volts}
    currents: {element_name_lower: amps}   e.g. {'r1': 0.005}
    """
    voltages: Dict[str, float] = {}
    currents: Dict[str, float] = {}

    # ── ASCII table: "Node  Voltage" ─────────────────────────────────────────
    in_table = False
    for line in output.splitlines():
        stripped = line.strip()
        if re.match(r"node\s+voltage", stripped, re.IGNORECASE):
            in_table = True
            continue
        if in_table:
            if re.match(r"^[-\s]+$", stripped):
                continue
            if not stripped:
                in_table = False
                continue
            parts = stripped.split()
            if len(parts) >= 2:
                try:
                    voltages[parts[0].strip("()")] = float(parts[-1])
                except ValueError:
                    in_table = False

    # ── "v(node) = value" or "v(node)   value" (print command output) ────────
    for m in re.finditer(
        r"v\((\w+)\)\s*(?:=\s*)?([\-\d.eE+]+)", output, re.IGNORECASE
    ):
        try:
            voltages[m.group(1)] = float(m.group(2))
        except ValueError:
            pass

    # ── "i(elem) = value" or "i(elem)   value" ───────────────────────────────
    for m in re.finditer(
        r"i\((\w+)\)\s*(?:=\s*)?([\-\d.eE+]+)", output, re.IGNORECASE
    ):
        try:
            currents[m.group(1).lower()] = float(m.group(2))
        except ValueError:
            pass

    return voltages, currents


# ── Public API ────────────────────────────────────────────────────────────────

def run_simulation(components: list, wires: list) -> dict:
    if not components:
        return {"success": False, "error": "No components in circuit."}

    if not any(c["type"] == "ground" for c in components):
        return {
            "success": False,
            "error": "Add a Ground component to define the reference node (net 0).",
        }

    if not any(c["type"] == "voltage_source" for c in components):
        return {
            "success": False,
            "error": "Add at least one Voltage Source for DC operating-point analysis.",
        }

    try:
        netlist, nets, elem_to_comp = _build_netlist(components, wires)
    except Exception as exc:
        return {"success": False, "error": f"Netlist generation failed: {exc}"}

    tmp = tempfile.NamedTemporaryFile(
        mode="w", suffix=".sp", prefix="diodesim_", delete=False
    )
    try:
        tmp.write(netlist)
        tmp.close()

        try:
            proc = subprocess.run(
                ["ngspice", "-b", tmp.name],
                capture_output=True, text=True, timeout=30,
            )
        except FileNotFoundError:
            return {
                "success": False,
                "error": (
                    "ngspice not found. Run via Docker (ngspice is installed in the image) "
                    "or install manually: apt-get install ngspice / brew install ngspice"
                ),
            }
        except subprocess.TimeoutExpired:
            return {"success": False, "error": "ngspice timed out after 30 s."}

        raw = proc.stdout + "\n" + proc.stderr
        net_voltages, elem_currents = _parse_output(raw)

        # ── Map back to "componentId:nodeId" → voltage ────────────────────────
        node_voltages: Dict[str, float] = {}
        for (cid, nid), net_name in nets.items():
            if net_name == "0":
                node_voltages[f"{cid}:{nid}"] = 0.0
            elif net_name in net_voltages:
                node_voltages[f"{cid}:{nid}"] = net_voltages[net_name]

        # ── Map branch currents back to component IDs ─────────────────────────
        # ngspice reports current INTO the positive terminal (or element convention).
        # We store the absolute value in mA for display.
        branch_currents: Dict[str, float] = {}
        for elem_lower, amps in elem_currents.items():
            if elem_lower in elem_to_comp:
                branch_currents[elem_to_comp[elem_lower]] = amps

        if not net_voltages and proc.returncode != 0:
            err = (proc.stderr or proc.stdout or "unknown error")[:600]
            return {
                "success": False,
                "error": f"ngspice error (exit {proc.returncode}): {err}",
                "netlist": netlist,
            }

        return {
            "success": True,
            "nodeVoltages": node_voltages,
            "netVoltages": net_voltages,
            "branchCurrents": branch_currents,
            "netlist": netlist,
        }

    finally:
        try:
            os.unlink(tmp.name)
        except OSError:
            pass
