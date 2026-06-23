from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.services.auth_service import router as auth_router
from app.api.routes import ai_routes

app = FastAPI()

# Allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "chrome-extension://dhjeljpfkoiokbapnkbkbkanbbjbdkmf",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],

)

app.include_router(auth_router, prefix="/api/auth")


@app.get("/")
def root():
    return {"message": "API running"}

app.include_router(
    ai_routes.router,
    prefix="/api/ai",
    tags=["AI"]
)