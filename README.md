# SSAEMS Backend

This folder contains a Node.js + Express backend for the SSAEMS project (Smart Subject Allocation & Elective Management System).

Quick start

1. cd into backend
2. npm install
3. copy `.env` and set `MONGO_URI`, `JWT_SECRET`, and optionally `ADMIN_EMAIL`, `EMAIL_USER`, `EMAIL_PASS`
4. npm run seed    # creates an admin user and some sample subjects
5. npm run dev

Useful endpoints (HTTP)

- POST /api/auth/signup — signup (body: name,email,password,role)
- POST /api/auth/login — login (body: email,password) returns JWT

Admin-only endpoints (require Authorization: Bearer <token> for an admin user):
- POST /api/admin/upload-students — multipart form file field `file` (CSV)
- POST /api/admin/subjects — create a subject
- GET  /api/admin/subjects — list subjects
- PUT  /api/admin/subjects/:id — update subject
- DELETE /api/admin/subjects/:id — delete subject
- GET /api/admin/export-allotments — export subject-wise allocation CSVs (zipped)

Faculty endpoints (require faculty token):
- GET /api/faculty/my-subjects — list subjects assigned to the faculty
- GET /api/faculty/subjects/:subjectId/allocations — download allocations CSV for subject (faculty or admin)

Student endpoints (require student token):
- GET /api/students/me — profile
- PUT /api/students/preferences — submit preferences (max 5)
- GET /api/students/allocation — check allocation result
- GET /api/students/allocation/slip — download PDF confirmation slip

Run tests

npm test

Notes
- The allocation algorithm is a simple greedy allocator (merit-based by CGPA). Replace `utils/allocationAlgorithm.js` with advanced logic if needed.
- CSV expected headers when uploading students: name,rollNumber,email,department,year,cgpa

If you want, I can continue and implement more features (sections per subject, waitlists, UI, stronger allocation algorithm, unit tests). 
