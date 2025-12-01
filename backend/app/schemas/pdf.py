from typing import List
from pydantic import BaseModel

class TextHit(BaseModel):
    page: int
    span_text: str
    found_text: str
    bbox: list[float]
    font: str | None = None
    size: float | None = None
    color: int | None = None

class FindTextResponse(BaseModel):
    hits: List[TextHit]

class ReplaceTextRequest(BaseModel):
    page_num: int
    hit_index: int
    old_text: str
    new_text: str

class ReplaceTextResponse(BaseModel):
    success: bool