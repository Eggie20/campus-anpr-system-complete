
import os
import sys
import cv2
import numpy as np
from paddleocr import PaddleOCR

def test_ocr():
    print("Initializing PaddleOCR...")
    try:
        ocr = PaddleOCR(use_angle_cls=True, lang='en', enable_mkldnn=False)
        print("PaddleOCR initialized successfully.")
    except Exception as e:
        print(f"Failed to initialize PaddleOCR: {e}")
        return

    # Paths to sample images
    # Assuming we are in the backend directory
    base_path = os.path.dirname(os.getcwd())
    id_card_path = os.path.join(base_path, "ID_card")
    front_path = os.path.join(id_card_path, "front_ID.jpg")

    print(f"Checking for image at: {front_path}")
    if not os.path.exists(front_path):
        print(f"Image not found at {front_path}")
        return

    print(f"Reading image {front_path}...")
    img = cv2.imread(front_path)
    if img is None:
        print("Failed to read image with cv2.imread")
        return
    
    print("Running OCR on image...")
    try:
        result = ocr.ocr(img)
        print("OCR completed.")
        
        if not result or not result[0]:
            print("OCR returned no results.")
            return
            
        print("\n--- OCR RESULTS ---")
        for i, line in enumerate(result[0]):
            text = line[1][0]
            confidence = line[1][1]
            print(f"Line {i+1}: '{text}' (conf: {confidence:.2f})")
        print("-------------------\n")

    except Exception as e:
        print(f"Error during OCR execution: {e}")

if __name__ == "__main__":
    test_ocr()
