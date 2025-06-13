# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router as api_router

app = FastAPI(
    title="AI Page Chat Backend",
    description="FastAPI backend for chat-enabled Chrome extension",
    version="1.0.0"
)

# Allow extension or frontend to call this API (adjust origin if needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can limit this to ["chrome-extension://<id>"] later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api")
