from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import simulate

app = FastAPI(title="Diode Sim API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(simulate.router, prefix="/api")


@app.get("/api/health")
def health():
    return {"status": "healthy"}


@app.get("/")
def root():
    return {"message": "Diode Sim API", "version": "0.1.0"}
