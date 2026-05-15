import os

from fastapi import FastAPI
import supabase
from app.api.routes import tests
from app.models.userModel import User
from app.config.supabase import load_dotenv

load_dotenv()

supabase = supabase.create_client(
    supabase_url=os.getenv("SUPABASE_URL"),
    supabase_key=os.getenv("SUPABASE_KEY")
)

app = FastAPI()

@app.get("/users")
def get_users():

    response = (
        supabase
        .table("users")
        .select("*")
        .execute()
    )

    return response.data

