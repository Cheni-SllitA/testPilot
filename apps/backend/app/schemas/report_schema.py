from pydantic import BaseModel
from typing import List, Optional

from app.schemas.issue_schema import Issue


class ReportResponse(BaseModel):
    report_id: str
    url: str
    score: int
    issues: List[Issue]


class TestResult(BaseModel):
    name: str
    outcome: str
    message: str = ""


class RunSummary(BaseModel):
    total: int
    passed: int
    failed: int
    error: int
    skipped: int


class RunTestsResponse(BaseModel):
    report_id: str
    url: str
    status: str            # completed | error | timeout
    score: int             # 0-100
    summary: RunSummary
    issues: List[Issue]
    tests: List[TestResult]
    generated_script: str
    logs: Optional[str] = None
