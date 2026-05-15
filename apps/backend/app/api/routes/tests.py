from fastapi import APIRouter

router = APIRouter()

@router.get("/test")
async def run_test():
    return {"status": "success"}