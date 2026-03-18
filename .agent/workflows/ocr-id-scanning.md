---
description: How to use and test the OCR ID scanning feature
---

# OCR ID Scanning Feature

This feature allows automatic extraction of personal information from Philippine Driver's Licenses during vehicle registration.

## Prerequisites

### 1. Install Tesseract OCR (REQUIRED)

**Windows Installation:**
1. Download from: https://github.com/UB-Mannheim/tesseract/wiki
2. Run the installer
3. **IMPORTANT**: Check "Add Tesseract to system PATH" during installation
4. Default install path: `C:\Program Files\Tesseract-OCR`
5. Restart your terminal/command prompt after installation

**Verify Installation:**
```bash
tesseract --version
```

### 2. Python Dependencies (Already in requirements.txt)
```
pytesseract
Pillow
opencv-python-headless
```

## Testing the OCR Feature

### Quick Test via API

// turbo
1. Start the backend server:
```bash
cd d:\ANPR-Login\campus-anpr-system\backend
uvicorn app.main:app --reload --port 8000
```

2. Test OCR status:
```bash
curl http://localhost:8000/api/v1/ocr/status
```

3. Test with sample ID images:
```bash
curl http://localhost:8000/api/v1/ocr/test-sample
```

### Test via Frontend

1. Navigate to `http://localhost:3000/register`
2. The OCR modal auto-opens on page load
3. Upload front and back of a Driver's License
4. Click "Scan & Verify"
5. Review extracted data with confidence scores
6. Confirm to auto-fill the registration form

## Extracted Fields (Philippine Driver's License)

### Front of ID
| Field | Example | Pattern |
|-------|---------|---------|
| Last Name | MANDAS | Text after "Last Name" |
| First Name | ANNEL | Text after "First Name" |
| Middle Name | TRESFUENTES | Text after "Middle Name" |
| Nationality | PHL/Filipino | "PHL" keyword |
| Sex | M/F | "M" or "F" near nationality |
| Date of Birth | 1977/04/15 | YYYY/MM/DD format |
| Weight | 80 kg | Number after "Weight" |
| Height | 1.64 m | Number after "Height" |
| Address | P-2 LA FORTUNA BUHANG... | Text after "Address" |
| License No. | K14-19-008838 | X##-##-###### pattern |
| Expiration Date | 2034/04/15 | Last YYYY/MM/DD date |
| Blood Type | O+, A-, etc. | Text after "Blood Type" |
| Eyes Color | BLACK, BROWN | Text after "Eyes Color" |
| DL Codes | A,A1,B,B1,B2 | Comma-separated codes |
| Conditions | NONE | Text after "Conditions" |

### Back of ID
| Field | Example | Pattern |
|-------|---------|---------|
| Emergency Contact | CHERY ROSE C. MANDAS | After "EMERGENCY NOTIFY" |
| Contact Address | PUROK 2 BUHANG MAGALLANES | After contact name |
| Contact Tel. | 0985639736 | Phone number pattern |
| Serial Number | 431707603 | 9-digit number |

## API Endpoints

### POST /api/v1/ocr/scan-id
Upload ID images for scanning.

**Request:**
- `front`: Front image file (required)
- `back`: Back image file (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "lastName": "MANDAS",
    "firstName": "ANNEL",
    "middleName": "TRESFUENTES",
    "licenseNumber": "K14-19-008838",
    "birthDate": "1977-04-15",
    "expiryDate": "2034-04-15",
    "address": "P-2 LA FORTUNA BUHANG MAGALLANES ADN",
    "sex": "M",
    "nationality": "Filipino",
    "serialNumber": "431707603"
  },
  "confidence": {
    "licenseNumber": 0.95,
    "lastName": 0.85,
    "firstName": 0.85,
    "birthDate": 0.85
  },
  "rawText": "..."
}
```

### GET /api/v1/ocr/status
Check if Tesseract OCR is installed.

### GET /api/v1/ocr/test-sample
Test OCR with sample ID images from `ID_card/` folder.

## Troubleshooting

### "Tesseract not found" Error
1. Ensure Tesseract is installed
2. Add to PATH: `C:\Program Files\Tesseract-OCR`
3. Restart your terminal and backend server

### Poor OCR Accuracy
- Use high-quality images (300 DPI recommended)
- Ensure good lighting with no glare
- Image should be straight (not tilted/rotated)
- Both front and back should be uploaded

### Empty Results
- Check if the image is readable
- Try re-taking the photo with better lighting
- Ensure the entire ID is visible in the frame

## File Structure

```
backend/
├── app/
│   ├── api/
│   │   └── ocr.py          # OCR API endpoints
│   └── utils/
│       └── ocr.py          # OCR processing logic
├── ID_card/
│   ├── front_ID.jpg        # Sample front ID
│   └── back_ID.jpg         # Sample back ID
```
