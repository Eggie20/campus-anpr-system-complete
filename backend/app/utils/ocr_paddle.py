"""
OCR Utility Functions - PaddleOCR Edition
Uses PaddleOCR for much faster and highly accurate document scanning.
"""
import os
os.environ["FLAGS_enable_pir_api"] = "0"
os.environ["FLAGS_use_mkldnn"] = "0"

from PIL import Image
import cv2
import numpy as np
import io
import os
from .ocr import parse_philippine_drivers_license, is_valid_drivers_license

# Lazy load PaddleOCR to avoid slowing down fastAPI startup if it's never used
_paddle_model = None

def get_paddle_ocr():
    global _paddle_model
    if _paddle_model is None:
        from paddleocr import PaddleOCR
        import logging
        logging.getLogger('ppocr').setLevel(logging.ERROR)
        # We don't strictly need use_gpu unless CUDA is available, Paddle handles this gracefully.
        _paddle_model = PaddleOCR(use_angle_cls=True, lang='en', enable_mkldnn=False)
    return _paddle_model

def extract_text_paddle(image_bytes: bytes, on_progress=None) -> tuple[str, list, str]:
    """
    Extract text using PaddleOCR.
    PaddleOCR is highly accurate and doesn't need aggressive preprocessing.
    """
    ocr = get_paddle_ocr()
    if on_progress: on_progress("PaddleOCR engine loaded, extracting...")
    
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # PaddleOCR expects a numpy array
    result = ocr.ocr(img)
    
    lines = []
    # Paddle returns a list of results, where each result is a list of blocks
    # block format: [[box coords], (text, confidence)]
    if result and result[0]:
        for idx in range(len(result[0])):
            res = result[0][idx]
            text = res[1][0]
            lines.append(text.strip())
            
    full_text = "\n".join(lines)
    return full_text, lines, full_text

def process_id_scan_paddle(front_image: bytes, back_image: bytes = None, on_progress=None) -> dict:
    """
    Main entry point for ID scanning using PaddleOCR.
    """
    def log(msg):
        print(msg)
        if on_progress:
            on_progress(msg)

    try:
        log(f"Processing Front ID ({len(front_image)} bytes) with PaddleOCR...")
        front_text, front_lines, front_raw = extract_text_paddle(front_image, on_progress=on_progress)
        log(f"  -> Extracted {len(front_text)} chars from front")

        # --- VALIDATION LAYER ---
        is_valid, message = is_valid_drivers_license(front_text)
        if not is_valid:
            log(f"  ✗ Validation Failed: {message}")
            raise ValueError(message)
        log(f"  ✓ Validation Passed: {message}")

        back_text = ""
        back_raw = ""
        if back_image:
            log(f"Processing Back ID ({len(back_image)} bytes) with PaddleOCR...")
            back_text, _, back_raw = extract_text_paddle(back_image, on_progress=on_progress)
            log(f"  -> Extracted {len(back_text)} chars from back")

        log("Parsing extracted text with enhanced parser...")
        # We reuse the excellent parser built for Tesseract!
        parsed = parse_philippine_drivers_license(front_text, back_text, raw_text=front_raw)

        # Log extraction summary
        filled = sum(1 for v in parsed["data"].values() if v)
        total = len(parsed["data"])
        log(f"  -> Filled {filled}/{total} fields")

        return {
            "success": True,
            **parsed,
            "scan_id": "paddle_" + os.urandom(4).hex()
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {
            "success": False,
            "error": str(e),
            "data": {},
            "confidence": {},
            "rawText": ""
        }
