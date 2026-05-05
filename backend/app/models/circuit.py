from pydantic import BaseModel
from typing import Any, Dict, List, Optional


class ComponentPayload(BaseModel):
    id: str
    type: str
    position: List[float]
    state: Optional[Dict[str, Any]] = None   # switch: {closed}, pot: {ratio}
    props: Optional[Dict[str, Any]] = None   # resistor: {resistance}, cap: {capacitance}, etc.


class WirePayload(BaseModel):
    id: str
    fromComponentId: str
    fromNode: str
    toComponentId: str
    toNode: str


class SimParams(BaseModel):
    mode: str = "dc"        # "dc" | "transient"
    tran_stop: str = "1m"   # e.g. "1m" = 1 ms, "100u" = 100 µs
    tran_step: str = "1u"   # e.g. "1u" = 1 µs, "100n" = 100 ns


class CircuitPayload(BaseModel):
    components: List[ComponentPayload]
    wires: List[WirePayload]
    params: SimParams = SimParams()


class SimulationResponse(BaseModel):
    success: bool
    # DC results
    nodeVoltages: Optional[Dict[str, float]] = None
    netVoltages: Optional[Dict[str, float]] = None
    branchCurrents: Optional[Dict[str, float]] = None
    # Transient results
    transientTime: Optional[List[float]] = None
    transientNets: Optional[Dict[str, List[float]]] = None   # net_name → [v0, v1, …]
    transientNodes: Optional[Dict[str, List[float]]] = None  # compId:nodeId → [v0, v1, …]
    # Shared
    netlist: Optional[str] = None
    error: Optional[str] = None
