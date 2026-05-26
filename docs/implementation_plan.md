# Campus ANPR — Registration Overhaul: Secure Storage, Review, & QR Code Modal

## Background

The current registration flow saves all data via a single JSON POST to `/api/v1/auth/register`. ID photos are embedded as base64 data URLs in the JSON body and stored inline in the `ocr_scans` table. There is no randomized registration token, no secure server-side file storage, and no post-registration QR code.

This plan transforms the registration into a production-grade workflow with:
- **Registration tokens** (UUID) as the primary registration identifier
- **Secure server-side file storage** for ID photos (Government/School ID, OR/CR)
- **Enhanced Final Review** showing uploaded document filenames
- **Post-Registration QR Code Modal** with scannable QR and digital access card styling

---

## User Review Required

### File upload approach
The current system sends ID photos as base64 strings inside the JSON payload. The new approach will use **multipart/form-data** to upload actual files to a secure backend folder (`backend/secure_uploads/`), referenced by registration token. This is a **breaking change** to the registration API — both frontend and backend will need coordinated updates.

### QR Code Content
The QR will encode JSON containing: Full Name, Plate Number, Driver's License Number, and Registration Token.

### OR/CR Upload
Marked as optional in the requirements. The UI field will be added but it won't be required for submission. The backend will store it identically to the ID photo if provided.

---

## Proposed Changes

### 1. Database Migration

#### [NEW] migration_registration_token.sql

Add a `registration_token` column to the `users` table and add `id_photo_path`, `orcr_photo_path`, and `qr_code_path` columns:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS registration_token UUID DEFAULT uuid_generate_v4() UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS id_photo_path TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS orcr_photo_path TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS qr_code_path TEXT;
UPDATE users SET registration_token = uuid_generate_v4() WHERE registration_token IS NULL;
```

---

### 2. Backend — Model Updates

#### [MODIFY] user.py (`backend/app/models/user.py`)

Add 4 new columns to the User model:
- `registration_token` — UUID, unique, auto-generated
- `id_photo_path` — TEXT, server-side file path
- `orcr_photo_path` — TEXT, server-side file path
- `qr_code_path` — TEXT, server-side file path

---

### 3. Backend — Registration Endpoint Overhaul

#### [MODIFY] auth.py (`backend/app/api/auth.py`)

1. Change `/register` to accept `multipart/form-data` instead of JSON
2. Generate a `registration_token` (UUID) for each registration
3. Save uploaded ID photo to `backend/secure_uploads/{token}_id.{ext}`
4. Save uploaded OR/CR to `backend/secure_uploads/{token}_orcr.{ext}` (optional)
5. Generate QR code image and save to `backend/secure_uploads/{token}_qr.png`
6. Store file paths in the user record
7. Return the registration token + QR code as base64 in the response

#### [NEW] registration.py (`backend/app/api/registration.py`)

New endpoint for secure file retrieval (audit-only):
- `GET /api/v1/registration/{token}/id-photo` — requires admin auth
- `GET /api/v1/registration/{token}/qr-code` — requires admin auth

---

### 4. Backend — Dependencies

#### [MODIFY] requirements.txt — Add `qrcode[pil]`
#### [MODIFY] main.py — Register the new `registration` router

---

### 5. Frontend — Review Step Enhancement

#### [MODIFY] ReviewStep.jsx

Add a new **"Uploaded Documents"** accordion section showing:
- Government/School ID: filename (or "Not uploaded")
- OR/CR Document: filename (or "Not uploaded — optional")

---

### 6. Frontend — Registration Form Submission Changes

#### [MODIFY] Register.jsx

- Build `FormData` instead of JSON
- Append file uploads
- Show QR Code Modal on success

---

### 7. Frontend — QR Code Modal

#### [NEW] QRCodeModal.jsx — Post-registration QR modal
#### [NEW] qr-modal.css — Modal styles
#### [MODIFY] index.css — Import qr-modal.css

---

### 8. VehicleDetailsStep — OR/CR Upload Field

#### [MODIFY] VehicleDetailsStep.jsx — Add optional OR/CR file upload

---

## Verification Plan

### Automated Tests
1. Backend: Test `/api/v1/auth/register` with multipart form data
2. Frontend: Complete registration flow end-to-end

### Manual Verification
- Walk through complete registration flow in browser
- Verify files saved in `backend/secure_uploads/`
- Verify QR code is scannable and contains correct data
