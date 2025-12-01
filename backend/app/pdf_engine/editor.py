from typing import Dict, Any, List
import fitz
from .finder import find_text_hits

def _compute_hits_on_page(page: "fitz.Page", query: str, page_num: int) -> List[Dict[str, Any]]:
    text_dict  = page.get_text("dict")
    hits: List[Dict[str, Any]] = []

    for block in text_dict.get("blocks", []):
        if block.get("type") != 0:
            continue
        for line in block.get("lines", []):
            for span in line.get("spans", []):
                span_text = span.get("text", "") or ""
                if not span_text or query not in span_text:
                    continue

                bbox = span.get("bbox")
                total_chars = len(span_text)
                if total_chars == 0:
                    continue

                start = 0
                while True:
                    idx = span_text.find(query, start)
                    if idx == -1:
                        break

                    proportion_start = idx / total_chars
                    proportion_end = (idx + len(query)) / total_chars

                    x0 = bbox[0] + (bbox[2] - bbox[0]) * proportion_start
                    x1 = bbox[0] + (bbox[2] - bbox[0]) * proportion_end
                    y0 = bbox[1]
                    y1 = bbox[3]

                    hits.append(
                        {
                            "page": page_num,
                            "span_text": span_text,
                            "found_text": query,
                            "bbox": [x0, y0, x1, y1],
                            "font": span.get("font"),
                            "size": span.get("size"),
                            "color": span.get("color"),
                        }
                    )

                    start = idx + len(query)

    return hits

def replace_text_in_pdf(
        pdf_bytes: bytes,
        page_num: int,
        hit_index: int,
        old_text: str,
        new_text: str,
) -> bytes:
    if not old_text:
        raise ValueError("old_text cannot be empty")
    
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    try:
        page = doc[page_num - 1]
    except IndexError:
        doc.close()
        raise ValueError("Invalid page number")
    
    hits = _compute_hits_on_page(page, old_text, page_num)
    if hit_index < 0 or hit_index >= len(hits):
        doc.close()
        raise ValueError("Invalid hit_index")
    
    hit = hits[hit_index]
    x0, y0, x1, y1 = hit["bbox"]
    font_name = hit.get("font") or "Times-Roman"
    font_size = hit.get("size") or 12
    color_int = hit.get("color")

    if color_int is None:
        color = (0, 0, 0)
    else:
        r = (color_int >> 16) & 0xFF
        g = (color_int >> 8) & 0xFF
        b = color_int & 0xFF
        color = (r / 255.0, g / 255.0, b / 255.0)

    expand = 0.5 * font_size
    redact_rect = fitz.Rect(x0, y0 - expand, x1, y1 + expand)
    page.add_redact_annot(redact_rect, fill=(1, 1, 1))
    page.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE)

    insert_point = fitz.Point(x0, y1 - (font_size * 0.2))
    try:
        page.insert_text(
            insert_point,
            new_text,
            fontsize=font_size,
            fontname=font_name,
            fill=color,
        )
    except Exception: 
        page.insert_text(
            insert_point,
            new_text,
            fontsize=font_size,
            fill=color,
        )
 
    out_bytes = doc.write(garbage=4, deflate=True)
    doc.close()
    return out_bytes