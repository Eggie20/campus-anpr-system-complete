# Campus ANPR — Registration Overhaul Walkthrough

## Summary

This walkthrough documents the complete overhaul of the Campus ANPR vehicle registration flow to include:
1. **Randomized registration tokens** (UUID) as primary identifiers
2. **Secure server-side file storage** for ID photos and OR/CR documents
3. **Enhanced Final Review** showing uploaded document information
4. **Post-Registration QR Code Modal** with scannable QR and digital access card

---

## Changes Made

### Backend

#### 1. Database Migration (`backend/migration_registration_token.sql`)
- New `registration_token` UUID column on `users` table (unique, auto-generated)
- New `id_photo_path`, `orcr_photo_path`, `qr_code_path` TEXT columns for server-side file paths
- Backfill query for existing users

#### 2. User Model (`backend/app/models/user.py`)
- Added 4 new columns: `registration_token`, `id_photo_path`, `orcr_photo_path`, `qr_code_path`
- Token is auto-generated UUID, unique per registration

#### 3. Registration Endpoint Overhaul (`backend/app/api/auth.py`)
- **Breaking change**: `/api/v1/auth/register` now accepts `multipart/form-data` instead of JSON
- All form fields mapped via `Form(...)` parameters
- File uploads: `idPhoto` (required), `orcrPhoto` (optional) via `File(None)`
- OCR scan data sent as JSON string in `ocrScanJson` form field
- Generates UUID registration token per registration
- Saves uploaded files to `backend/secure_uploads/{token}_id.{ext}` and `{token}_orcr.{ext}`
- Generates QR code containing `{ full_name, plate_number, drivers_license, registration_token }`
- QR saved to `backend/secure_uploads/{token}_qr.png`
- Returns `registration_token` and `qr_code_base64` in response

#### 4. Admin File Retrieval (`backend/app/api/registration.py`)
- `GET /api/v1/registration/{token}/id-photo` — admin-only, returns ID photo
- `GET /api/v1/registration/{token}/orcr-photo` — admin-only, returns OR/CR
- `GET /api/v1/registration/{token}/qr-code` — admin-only, returns QR image
- All endpoints require admin authentication

#### 5. Dependencies
- `qrcode[pil]` added to `requirements.txt` and installed
- `registration` router registered in `main.py`

#### 6. Infrastructure
- `backend/secure_uploads/` directory created (not publicly accessible)
- Added to `.gitignore`

---

### Frontend

#### 1. QR Code Modal (`frontend/src/components/pages/public/Register/modals/QRCodeModal.jsx`)
- Displays scannable QR code from base64 data
- Digital access card section showing: Full Name, Plate Number, License No., Registration Token
- Download QR button (saves as PNG)
- Go to Login button
- Premium styling with glassmorphism effects

#### 2. QR Modal CSS (`frontend/src/assets/css/pages/Register/qr-modal.css`)
- Full-screen overlay with backdrop blur
- Gradient glow around QR code frame
- Card layout with grid fields
- Responsive design for mobile
- Consistent with existing dark theme

#### 3. ReviewStep Enhancement (`frontend/src/components/pages/public/Register/steps/ReviewStep.jsx`)
- New "Uploaded Documents" accordion section (4th section)
- Shows Government/School ID filename with ✓ indicator
- Shows OR/CR Document filename or "Not uploaded — optional"
- Added License No. and Address to Owner Information section

#### 4. VehicleDetailsStep OR/CR Upload (`frontend/src/components/pages/public/Register/steps/VehicleDetailsStep.jsx`)
- New drag-and-drop style upload area for OR/CR document
- "OPTIONAL" badge on label
- Accepts images and PDFs
- Shows filename with remove button when uploaded

#### 5. Register.jsx Submission Overhaul
- Builds `FormData` instead of JSON for `multipart/form-data`
- Appends `idPhoto` and `orcrPhoto` file uploads
- Sends OCR scan data as `ocrScanJson` JSON string
- On success: stores result, shows QR Code Modal instead of simple success overlay
- Added `orcrFile` to form state, `showQRModal` and `registrationResult` state

---

## How to Run the Migration

```sql
-- Connect to your PostgreSQL database and run:
\i backend/migration_registration_token.sql
```

Or via psql:
```bash
psql -U postgres -d campus_anpr -f backend/migration_registration_token.sql
```

---

## Testing

1. **Start backend**: `cd backend && venv\Scripts\activate && uvicorn app.main:app --reload --port 8000`
2. **Start frontend**: `cd frontend && npm run dev`
3. Navigate to `http://localhost:3000/register`
4. Complete the registration flow
5. On successful submission, the QR Code Modal should appear with:
   - Scannable QR code image
   - Your name, plate number, license, and registration token
   - Download QR and Go to Login buttons
6. Check `backend/secure_uploads/` for saved files

---

## Architecture Notes

- **File security**: Uploaded files are stored in `backend/secure_uploads/` which is NOT served statically. Files are only retrievable through authenticated admin endpoints.
- **Registration token**: Uses UUID v4 — non-sequential, non-guessable. This is the primary identifier exposed externally.
- **QR code format**: Encodes JSON with 4 fields. Scannable by any standard QR reader (Google Lens, phone cameras, dedicated apps).
- **Backward compatibility**: The OCR scan modal still works — scanned data is now sent as a JSON string in the form data instead of a nested object.
