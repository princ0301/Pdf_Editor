from typing import List, Dict, Any
import fitz

def find_text_hits(pdf_bytes: bytes, page_num: int, query: str) -> List[Dict[str, Any]]:
    if not query:
        return []
    
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    try:
        page = doc[page_num - 1]
    except IndexError:
        raise ValueError("Invalid page number")
    
    text_dict = page.get_text("dict")
    hits: List[Dict[str, Any]] = []

    for block in text_dict.get("blocks", []):
        if block.get("type") != 0:
            continue

        for line in block.get("lines", []):
            for span in line.get("spans", []):
                span_text = span.get("text", "") or ""
                if not span_text:
                    continue
                if query not in span_text:
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

                    x0 = bbox[0] + (bbox[2] - bbox[1]) * proportion_start
                    x1 = bbox[0] + (bbox[2] - bbox[1]) * proportion_end
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

    doc.close()
    return hits