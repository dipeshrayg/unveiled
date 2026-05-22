from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import signal, lens
import uvicorn

app = FastAPI(
    title="UNVEILED API",
    description="Reality Pollution + Algorithmic Opportunity Auditor",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(signal.router, prefix="/api/signal", tags=["SIGNAL Engine"])
app.include_router(lens.router, prefix="/api/lens", tags=["LENS Engine"])


@app.get("/")
def root():
    return {
        "project": "UNVEILED",
        "mission": "See what's real. See what's hidden.",
        "engines": ["SIGNAL - Reality Purity Scorer", "LENS - Opportunity Auditor"],
        "cost": "$0.00/month",
        "github": "https://github.com/dipeshrayg/unveiled",
        "docs": "/docs"
    }


@app.get("/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
