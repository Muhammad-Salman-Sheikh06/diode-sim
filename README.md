# Diode Sim

A self-hosted 3D circuit simulator built with React Three Fiber on the frontend and FastAPI + ngspice on the backend.

## Stack

| Layer     | Technology                                     |
|-----------|------------------------------------------------|
| Frontend  | Vite · React 18 · React Three Fiber · Three.js |
| Backend   | FastAPI · Uvicorn · Pydantic v2                |
| Simulator | ngspice (planned)                              |
| Infra     | Docker Compose                                 |

## Project Structure

```
diode-sim/
├── frontend/
│   ├── src/
│   │   ├── components/   # reusable UI components
│   │   ├── scenes/       # R3F scene graphs
│   │   ├── hooks/        # custom React hooks
│   │   ├── store/        # global state (Zustand, later)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── Dockerfile
├── backend/
│   ├── app/
│   │   ├── models/       # Pydantic schemas
│   │   ├── routers/      # FastAPI route handlers
│   │   └── main.py
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## Getting Started

### With Docker (recommended)

```bash
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API docs: http://localhost:8000/docs

### Without Docker

**Backend**

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
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

## API

| Method | Path             | Description              |
|--------|------------------|--------------------------|
| GET    | `/api/health`    | Health check             |
| POST   | `/api/simulate/` | Run a circuit simulation |

Interactive docs available at `http://localhost:8000/docs` when the backend is running.

## Roadmap

- [ ] 3D circuit canvas with drag-and-drop components
- [ ] SPICE netlist generation from canvas state
- [ ] ngspice integration for transient / DC / AC analysis
- [ ] Real-time waveform viewer
- [ ] Save / load circuits
