import cv2
import pytesseract
import numpy as np
import os
from PIL import Image

# Setup Tesseract
TESSERACT_PATHS = [
    r"C:\Users\COMLAB\AppData\Local\Programs\Tesseract-OCR\tesseract.exe",
    r"C:\Program Files\Tesseract-OCR\tesseract.exe",
    r"D:\Program Files\Tesseract-OCR\tesseract.exe",
]
for path in TESSERACT_PATHS:
    if os.path.exists(path):
        pytesseract.pytesseract.tesseract_cmd = path
        break

def test_ocr(image_path):
    print(f"Testing {os.path.basename(image_path)}...")
    img = cv2.imread(image_path)
    if img is None:
        print("Failed to load image!")
        return
        
    # Variant 1: Original
    print("\n--- ORIGINAL (PSM 3) ---")
    print(pytesseract.image_to_string(img, config='--psm 3')[:200].replace('\n', ' '))
    
    # Preprocessing
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Resize if too small to improve OCR
    h, w = gray.shape
    if w < 1000:
        gray = cv2.resize(gray, None, fx=2.0, fy=2.0, interpolation=cv2.INTER_CUBIC)
    
    print("\n--- GRAYSCALED + UPSCALED (PSM 3) ---")
    print(pytesseract.image_to_string(gray, config='--psm 3')[:200].replace('\n', ' '))
    print("\n--- GRAYSCALED + UPSCALED (PSM 6) ---")
    print(pytesseract.image_to_string(gray, config='--psm 6')[:200].replace('\n', ' '))
    print("\n--- GRAYSCALED + UPSCALED (PSM 11) ---")
    print(pytesseract.image_to_string(gray, config='--psm 11')[:200].replace('\n', ' '))
    
    # Thresholding
    blur = cv2.GaussianBlur(gray, (3, 3), 0)
    _, thresh = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    
    print("\n--- OTSU THRESHOLD (PSM 6) ---")
    print(pytesseract.image_to_string(thresh, config='--psm 6')[:200].replace('\n', ' '))
    
    # CLAHE
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(gray)
    
    print("\n--- CLAHE (PSM 6) ---")
    print(pytesseract.image_to_string(enhanced, config='--psm 6')[:200].replace('\n', ' '))
    print("-" * 50)

if __name__ == "__main__":
    test_ocr("../ID_card/front_ID.jpg")
