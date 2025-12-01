from pathlib import Path
import uuid

BASE_DIR = Path(__file__).resolve().parent.parent.parent
PDF_STORAGE_DIR = BASE_DIR / "pdf_storage"
PDF_STORAGE_DIR.mkdir(exist_ok=True)

def generate_file_id() -> str:
    return str(uuid.uuid4())

def get_pdf_path(file_id: str) -> Path:
    return PDF_STORAGE_DIR / f"{file_id}.pdf"

def save_pdf_bytes(pdf_bytes: bytes, file_id: str | None = None) -> str:
    if file_id is None:
        file_id = generate_file_id()
    path = get_pdf_path(file_id)
    with path.open("wb") as f:
        f.write(pdf_bytes)
    return file_id

def load_pdf_bytes(file_id: str) -> bytes:
    path = get_pdf_path(file_id)
    if not path.exists():
        raise FileNotFoundError(f"PDF with id {file_id} not found")
    return path.read_bytes()