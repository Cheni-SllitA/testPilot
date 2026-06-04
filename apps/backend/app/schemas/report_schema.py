from pydantic import BaseModel
from typing import List

from app.schemas.issue_schema import Issue


class ReportResponse(BaseModel):
    report_id: str
    url: str
    score: int
    issues: List[Issue]