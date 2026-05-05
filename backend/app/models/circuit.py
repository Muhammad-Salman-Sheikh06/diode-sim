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


class CircuitPayload(BaseModel):
    components: List[ComponentPayload]
    wires: List[WirePayload]


class SimulationResponse(BaseModel):
    success: bool
    nodeVoltages: Optional[Dict[str, float]] = None
    netVoltages: Optional[Dict[str, float]] = None
    branchCurrents: Optional[Dict[str, float]] = None   # compId → amps
    netlist: Optional[str] = None
    error: Optional[str] = None
