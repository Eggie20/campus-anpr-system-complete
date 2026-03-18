# Driver's License OCR Implementation Plan

## 1. Overview
The goal is to automate the extraction of user data (Name, Address, License No, etc.) from a Driver's License image during registration. This reduces manual entry errors and speeds up the process.

## 2. Technology Stack & Recommendation
We will use a **Hybrid Computer Vision approach** using Python.

*   **Backend Framework**: **FastAPI** (Python)
    *   *Why?* High performance, native async support for I/O bound tasks (image upload), and automatic data validation with Pydantic.
*   **OCR Engine**: **Tesseract OCR** (via `pytesseract`)
    *   *Why?* Open-source, runs locally (no API costs), and highly configurable for specific document structures.
*   **Image Processing**: **OpenCV** (`opencv-python`)
    *   *Why?* Essential for preprocessing images (thresholding, denoising, perspective correction) to improve OCR accuracy.
*   **Data Parsing**: **Regular Expressions (Regex)**
    *   *Why?* Driver's Licenses have strict formats (e.g., `L02-12-123456`). Regex is the most reliable way to extract these structured patterns.

### Why not Deep Learning (YOLO/PaddleOCR)?
While PaddleOCR is powerful, adding heavy deep learning models increases deployment complexity and server resource usage. For standardized ID cards with clear text, **Tesseract + Regex** is significantly faster, lighter, and easier to maintain.

---

## 3. Architecture Flow

1.  **Capture (Frontend)**:
    *   User uploads Front and Back ID images via `OCRModal`.
    *   Images are sent as `FormData` to `/api/v1/ocr/scan-id`.

2.  **Preprocessing (Backend)**:
    *   **Grayscale & Denoise**: Remove background noise.
    *   **Adaptive Thresholding**: Handle varying lighting conditions (glare/shadows).
    *   **Upscaling**: Resize image to 300 DPI equivalent for better char recognition.

3.  **Text Extraction (OCR)**:
    *   Run Tesseract with `Page Segmentation Mode (PSM) 3` (Auto) and `6` (Block).
    *   Extract raw text blocks.

4.  **Intelligent Parsing (Logic)**:
    *   Identify "Anchors" (keywords like "Name", "Address", "License No").
    *   Use Regex to validate extracted values.
    *   Clean up common OCR errors (e.g., confusing `0` (zero) with `O` (letter), `1` with `I`).

5.  **Verification (Frontend)**:
    *   Return JSON data to React.
    *   User verifies the auto-filled data in `VerificationModal` before it populates the main form.

---

## 4. Implementation Details

### Step 1: External Dependency
You must install Tesseract OCR on the server/host machine:
*   **Windows**: Download installer from [UB Mannheim](https://github.com/UB-Mannheim/tesseract/wiki).
    *   *Path check*: The backend looks for `C:\Program Files\Tesseract-OCR\tesseract.exe`.
*   **Linux/Mac**: `sudo apt install tesseract-ocr` / `brew install tesseract`

### Step 2: Backend Logic (`backend/app/utils/ocr.py`)
This file handles the heavy lifting.
*   `preprocess_for_ocr(image_bytes)`: Creates multiple versions of the image (Normal, High Contrast, Inverted) to maximize hit rate.
*   `parse_philippine_drivers_license(text)`: Contains specific regex patterns for:
    *   **License No**: `[A-Z]\d{2}-\d{2}-\d{6}`
    *   **Nationality**: `PHL`
    *   **Dates**: `YYYY/MM/DD`

### Step 3: Frontend Integration (`OCRModal.jsx`)
*   Uploads images to the Python `localhost:8000` endpoint.
*   Maps the API response fields (snake_case or camelCase) to the React form state.

---

## 5. Verification & Testing

### Test Plan
1.  **Start Backend**:
    ```bash
    cd backend
    venv\Scripts\activate
    uvicorn app.main:app --reload
    ```
2.  **Test Endpoint**:
    *   Go to `http://localhost:8000/docs` (Swagger UI).
    *   Use `/api/v1/ocr/scan-id` to upload a sample ID image.
    *   Verify the returned JSON structure.
3.  **Frontend Test**:
    *   Click "Scan Driver's License" in the register form.
    *   Upload images.
    *   Confirm the loading spinner appears.
    *   Confirm the `VerificationModal` populates with correct data.

## 6. Next Steps
*   Ensure **Tesseract** is installed on your development machine.
*   Test with real ID images under different lighting to tune the OpenCV parameters (e.g., adjust `threshold` values).
