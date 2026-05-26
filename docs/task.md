# Campus ANPR — Registration Overhaul Task Tracker

## Backend Tasks

- [x] Create `backend/migration_registration_token.sql`
- [x] Update `backend/app/models/user.py` — add registration_token, id_photo_path, orcr_photo_path, qr_code_path columns
- [x] Update `backend/requirements.txt` — add `qrcode[pil]`
- [x] Install `qrcode` via pip
- [x] Overhaul `backend/app/api/auth.py` — multipart/form-data registration with file uploads, QR generation
- [x] Create `backend/app/api/registration.py` — admin-only file retrieval endpoints
- [x] Update `backend/app/main.py` — register new registration router
- [x] Create `backend/secure_uploads/` directory with `.gitkeep`
- [x] Add `backend/secure_uploads/` to `.gitignore`

## Frontend Tasks

- [x] Create `QRCodeModal.jsx` — post-registration QR code modal component
- [x] Create `qr-modal.css` — QR modal styling
- [x] Update `index.css` — import qr-modal.css
- [x] Update `ReviewStep.jsx` — add uploaded documents accordion section
- [x] Update `VehicleDetailsStep.jsx` — add optional OR/CR file upload field
- [x] Update `Register.jsx` — FormData submission, QR modal integration, OR/CR state

## Verification

- [ ] Run database migration
- [ ] Test backend endpoint with multipart form data
- [ ] Test full registration flow in browser
- [ ] Verify QR code is scannable
- [ ] Verify files are saved securely
