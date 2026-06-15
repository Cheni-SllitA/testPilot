from fastapi import APIRouter
from app.schemas.ai_schema import AIRequest
from app.services.llm_service import generate_ai_response

router = APIRouter()

@router.post("/generate")
async def generate(request: AIRequest):
    response = generate_ai_response(request.prompt)

    return {
        "success": True,
        "response": response
    }