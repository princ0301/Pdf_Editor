from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from fastapi.responses import StreamingResponse
from typing import List

from app.pdf_engine import storage, finder, editor
from app.schemas.pdf import TextHit, FindTextResponse, ReplaceTextRequest, ReplaceTextResponse

router = APIRouter()

@router.post("/upload", response_model=dict)
async def upload_pdf(file: UploadFile = File(...)):
    if file.content_type != "application/pdf" and not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    pdf_bytes = await file.read()
    file_id = storage.save_pdf_bytes(pdf_bytes)
    return {"file_id": file_id, "filename": file.filename}

@router.get("/{file_id}/download")
def download_pdf(file_id: str):
    try:
        pdf_bytes = storage.load_pdf_bytes(file_id)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="PDF not found")
    
    return StreamingResponse(
        iter([pdf_bytes]),
        media_type="application/pdf",
        headers={"Content-Disposition": f'inline; filename="{file_id}.pdf"'},
    )

@router.get("/{file_id}/find", response_model=FindTextResponse)
def find_text(
    file_id: str,
    page_num: int = Query(..., ge=1),
    query: str = Query(..., min_length=1),
):
    try:
        pdf_bytes = storage.load_pdf_bytes(file_id)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="PDF not found")
    
    try:
        hits_raw = finder.find_text_hits(pdf_bytes, page_num, query)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    hits = [TextHit(**h) for h in hits_raw]
    return FindTextResponse(hits=hits)

@router.post("/{file_id}/replace", response_model=ReplaceTextResponse)
def replace_text(file_id: str, body: ReplaceTextRequest):
    try:
        pdf_bytes = storage.load_pdf_bytes(file_id)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="PDF not found")
    
    try:
        new_bytes = editor.replace_text_in_pdf(
            pdf_bytes=pdf_bytes,
            page_num=body.page_num,
            hit_index=body.hit_index,
            old_text=body.old_text,
            new_text=body.new_text,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    storage.save_pdf_bytes(new_bytes, file_id=file_id)
    return ReplaceTextResponse(success=True)