from pydantic import BaseModel
from typing import List


class AIAnalysisResponse(BaseModel):
    summary: str
    recommendations: List[str]