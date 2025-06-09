import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import game

# Create FastAPI app
app = FastAPI(
    title="Python Snake Game API",
    description="A FastAPI backend for the Snake game supporting both CLI and web interfaces",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Add CORS middleware for web interface
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(game.router, prefix="/api/v1")


@app.get("/")
def read_root():
    return {
        "message": "Welcome to the Python Snake Game API!",
        "version": "0.1.0",
        "author": "kako-jun",
        "endpoints": {"docs": "/docs", "redoc": "/redoc", "game": "/api/v1/game/", "health": "/health"},
    }


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "python-snake-game-api", "version": "0.1.0"}


def main():
    """Run the API server"""
    uvicorn.run("src.api.main:app", host="0.0.0.0", port=8000, reload=True, log_level="info")


if __name__ == "__main__":
    main()
