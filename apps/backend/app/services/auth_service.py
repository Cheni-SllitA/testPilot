import bcrypt
from fastapi import APIRouter, HTTPException
from app.services.database_service import supabase
from app.services import database_service
from app.models.userModel import RegisterUser, LoginUser

router = APIRouter()


# REGISTER
@router.post("/register")
def register(user: RegisterUser):

    # Check if user already exists
    existing_user = (
        supabase.table("users")
        .select("*")
        .eq("email", user.email)
        .execute()
    )

    if existing_user.data:
        raise HTTPException(status_code=400, detail="Email already exists")

    # Hash password
    hashed_password = bcrypt.hashpw(
        user.password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    # Insert user
    new_user = {
        "name": user.name,
        "email": user.email,
        "password": hashed_password
    }

    result = supabase.table("users").insert(new_user).execute()

    return {
        "message": "User registered successfully",
        "user": result.data
    }


# LOGIN
@router.post("/login")
def login(user: LoginUser):

    result = (
        supabase.table("users")
        .select("*")
        .eq("email", user.email)
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=401, detail="Invalid email")

    db_user = result.data[0]

    # Verify password
    valid_password = bcrypt.checkpw(
        user.password.encode("utf-8"),
        db_user["password"].encode("utf-8")
    )

    if not valid_password:
        raise HTTPException(status_code=401, detail="Invalid password")

    return {
        "message": "Login successful",
        "user": {
            "id": db_user["id"],
            "name": db_user["name"],
            "email": db_user["email"]
        }
    }

