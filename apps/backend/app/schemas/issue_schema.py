from pydantic import BaseModel


class Issue(BaseModel):
    title: str
    severity: str
    description: str