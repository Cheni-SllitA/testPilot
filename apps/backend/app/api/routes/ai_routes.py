from fastapi import APIRouter
from app.schemas.ai_schema import AIRequest
from app.services.llm_service import generate_ai_response

router = APIRouter()

@router.post("/generate")
async def generate(request: AIRequest):
    response_text = generate_ai_response(
        prompt=request.prompt,
        url=request.url,
        title=request.title,
        html=request.html
    )
    return {"result": response_text}