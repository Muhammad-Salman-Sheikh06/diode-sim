# Diode Sim

A self-hosted 3D circuit simulator. Place components on an interactive 3D board, wire them together, run DC or transient SPICE simulations via ngspice, and watch voltage-coded wire colors, LED glow, and current-flow arrows update in real time.

---

## Screenshots

> _Add screenshots or a GIF here._

---

## Features

- **3D canvas** — React Three Fiber scene with orbit/zoom/pan; components sit on a PCB grid with snap-to-1-unit placement
- **12 components** — resistor, capacitor, inductor, potentiometer, LED (5 color variants), NPN transistor, N-MOSFET, op-amp, voltage source, ground, switch, junction
- **Wire drawing** — click a node sphere to start a wire; auto-snaps to the nearest node within range
- **DC simulation** — ngspice operating-point analysis; node voltages and branch current returned as JSON
- **Transient simulation** — configurable stop time and step; multi-net waveform viewer (Recharts) with collapsible panel and per-net toggle
- **Voltage-coded wires** — wire tube color lerps between ground (black) → positive (green) / negative (red) based on node voltage
- **Current-flow arrows** — animated cone arrows travel along each wire; speed scales with √(mA); only shown after simulation
- **LED glow** — emissive intensity driven by forward voltage Vf; each of 5 colors has its own ngspice diode model (different Is)
- **Node voltage labels** — displayed above each node after DC simulation
- **Component properties** — inline panel: resistance, capacitance, voltage, hFE, Vth, gain, inductance, LED color picker
- **Switch & potentiometer controls** — live open/close toggle and wiper slider update the SPICE netlist on next simulate
- **Undo / Redo** — 50-step history
- **Save / Load** — circuit exported as JSON; load from file or choose a built-in example
- **Dark / Light mode** — toggle persisted to `localStorage`; all UI, canvas, grid, and waveform panel switch together

---

## Tech Stack

| Layer     | Technology                                              |
|-----------|---------------------------------------------------------|
| Frontend  | Vite · React 18 · React Three Fiber · Three.js · Zustand |
| UI        | Recharts (waveform) · CSS custom properties (theming)   |
| Backend   | FastAPI · Uvicorn · Pydantic v2                         |
| Simulator | ngspice (subprocess, batch mode `-b`)                   |
| Infra     | Docker Compose                                          |

---

## Project Structure

```
diode-sim/
├── frontend/
│   ├── src/
│   │   ├── components/        # Sidebar, Toast
│   │   ├── scenes/            # CircuitEditor, ComponentMesh, WireComponent,
│   │   │   │                  #   WaveformPanel, NodeVoltageLabel, SwitchMesh
│   │   │   ├── meshes/        # Per-component 3D meshes
│   │   │   └── componentDefs.js
│   │   ├── store/
│   │   │   └── circuitStore.js  # Zustand store — all app state
│   │   ├── data/
│   │   │   └── exampleCircuits.js
│   │   ├── theme.css          # CSS custom properties (dark / light)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js
│   └── Dockerfile
├── backend/
│   ├── app/
│   │   ├── models/            # Pydantic schemas
│   │   ├── routers/           # FastAPI route handlers
│   │   ├── services/
│   │   │   └── simulator.py   # Netlist builder + ngspice runner + output parser
│   │   └── main.py
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## Running the App

### Docker (recommended)

Requires Docker Desktop.

```bash
docker compose up --build
```

| Service      | URL                          |
|--------------|------------------------------|
| Frontend     | http://localhost:5173        |
| Backend API  | http://localhost:8000        |
| API docs     | http://localhost:8000/docs   |

### Local dev (without Docker)

ngspice must be installed separately (`apt install ngspice` / `brew install ngspice` / Windows installer).

**Backend**

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server proxies `/api/*` to `localhost:8000`, so no CORS config is needed.

---

## Component Library

| Component       | SPICE element | Nodes          | Configurable property      |
|-----------------|---------------|----------------|----------------------------|
| Resistor        | R             | A, B           | Resistance (Ω)             |
| Capacitor       | C             | +, −           | Capacitance (µF)           |
| Inductor        | L             | A, B           | Inductance (mH)            |
| Potentiometer   | R×2           | A, W, B        | Total resistance (Ω), wiper % |
| LED             | D             | A (anode), K (cathode) | Color (Red / Green / Yellow / Blue / White) |
| NPN Transistor  | Q             | B, C, E        | hFE (gain)                 |
| N-MOSFET        | M             | G, D, S        | Threshold voltage Vth (V)  |
| Op-Amp          | E + Rin       | IN+, IN−, OUT, V+, V− | Open-loop gain        |
| Voltage Source  | V             | +, −           | DC voltage (V)             |
| Ground          | _(net 0)_     | GND            | —                          |
| Switch          | R (0.001 Ω / 1 GΩ) | A, B     | Open / Closed              |
| Junction        | _(net node)_  | J              | —                          |

**LED color models**

| Color  | Hex       | ngspice Is |
|--------|-----------|------------|
| Red    | `#ff2200` | 1e-20      |
| Green  | `#00ff44` | 1e-25      |
| Yellow | `#ffee00` | 1e-22      |
| Blue   | `#4488ff` | 1e-30      |
| White  | `#ffffff` | 1e-32      |

---

## Keyboard Shortcuts

| Key               | Action                                              |
|-------------------|-----------------------------------------------------|
| `R`               | Rotate placement ghost (45° steps) or selected component |
| `Delete` / `Backspace` | Remove selected component or selected wire     |
| `Ctrl+Z`          | Undo                                                |
| `Ctrl+Y` / `Ctrl+Shift+Z` | Redo                                      |
| `Escape`          | Cancel placement / cancel wiring / deselect         |

---

## API

| Method | Path             | Description                        |
|--------|------------------|------------------------------------|
| GET    | `/api/health`    | Health check                       |
| POST   | `/api/simulate/` | Run DC or transient simulation     |

The POST body is `{ components, wires, params: { mode, tran_stop, tran_step } }`.  
Response includes `nodeVoltages`, `branchCurrents` (DC) or `transientTime`, `transientNets`, `transientNodes` (transient).

---

## Known Limitations

- **Node positions after rotation** — when a component with vertical nodes (e.g. capacitor, voltage source) is rotated 90°, the node spheres and wire attachment points may not align correctly with the rotated mesh. Horizontal components (resistor, inductor) rotate correctly.

- **Current arrow direction with a single ground** — all branch currents are derived from the single voltage source current (`i(v1)`). In circuits where conventional current should flow in different directions on different branches, the arrows may all point the same way. Parallel branches are not individually resolved.

- **No AC analysis** — only DC operating point and time-domain transient are supported. Frequency-domain (`.ac`) simulation is not implemented.

- **Single ground node** — the circuit must have exactly one Ground component. Multiple grounds are merged into net `0`; floating sub-circuits will cause ngspice to error.

- **ngspice required at runtime** — the Docker image includes ngspice. Running locally without it installed will return an error from the simulate endpoint.
