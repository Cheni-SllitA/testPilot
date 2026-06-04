from pydantic import BaseModel
from typing import Optional

class TestRequest(BaseModel):
    url: str
    browser: str
    test_type: str

class TestResponse(BaseModel):
    status: str
    score: int
    report_id: str

    