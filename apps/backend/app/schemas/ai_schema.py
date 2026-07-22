from pydantic import BaseModel
from typing import Optional


class AIRequest(BaseModel):
    prompt: str
    url: str                       # live URL the tests run against (--base-url)
    title: str
    html: str
