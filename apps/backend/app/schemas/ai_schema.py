from pydantic import BaseModel

class AIRequest(BaseModel):
    prompt: str
    #url : str
    title: str
    html : str
    