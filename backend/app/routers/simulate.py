from fastapi import APIRouter
from app.models.circuit import CircuitPayload, SimulationResponse
from app.services.simulator import run_simulation

router = APIRouter(prefix="/simulate", tags=["simulate"])


@router.post("/", response_model=SimulationResponse)
def simulate(payload: CircuitPayload) -> SimulationResponse:
    components = [c.model_dump() for c in payload.components]
    wires      = [w.model_dump() for w in payload.wires]
    result     = run_simulation(components, wires)
    return SimulationResponse(**result)
