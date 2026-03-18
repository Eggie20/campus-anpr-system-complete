# Application Map & Pages Inventory

This document lists all pages in the Campus ANPR System, grouped by user role and functionality.

## 🔐 Authentication Pages (Public)

These pages are accessible to everyone and serve as the entry points to the system.

| Page Name               | Route              | Description                                       | Status         |
| :---------------------- | :----------------- | :------------------------------------------------ | :------------- |
| **Student/Staff Login** | `/login`           | Main login for students and faculty.              | ✅ Implemented |
| **Admin Login**         | `/admin-login`     | Dedicated login portal for system administrators. | ✅ Implemented |
| **Security Login**      | `/security-login`  | Dedicated login for security guards.              | ✅ Implemented |
| **Register**            | `/register`        | Registration form for new users (with OCR).       | ✅ Implemented |
| **Forgot Password**     | `/forgot-password` | Password recovery page.                           | ✅ Implemented |

---

## 🛡️ Admin Portal

Accessible only to users with the `admin` role. Nested under `/admin`.

| Page Name          | Route              | Description                               | Status         |
| :----------------- | :----------------- | :---------------------------------------- | :------------- |
| **Dashboard**      | `/admin/dashboard` | Main overview with statistics and charts. | ✅ Implemented |
| **Users**          | `/admin/users`     | User management (add, edit, delete).      | 🚧 Planned     |
| **Vehicles**       | `/admin/vehicles`  | All registered vehicles database.         | 🚧 Planned     |
| **Cameras**        | `/admin/cameras`   | ANPR camera management and status.        | 🚧 Planned     |
| **Security Staff** | `/admin/security`  | Manage security guard accounts.           | 🚧 Planned     |
| **Analytics**      | `/admin/analytics` | detailed system reports and logs.         | 🚧 Planned     |
| **System Logs**    | `/admin/logs`      | Technical and audit logs.                 | 🚧 Planned     |
| **Settings**       | `/admin/settings`  | Global system configuration.              | 🚧 Planned     |

---

## 🎓 Student & Faculty Portal

Accessible to `student` and `faculty` roles. Nested under `/`.

| Page Name         | Route            | Description                                     | Status         |
| :---------------- | :--------------- | :---------------------------------------------- | :------------- |
| **Dashboard**     | `/dashboard`     | Personal overview (vehicle status, violations). | ✅ Implemented |
| **My Vehicles**   | `/vehicles`      | List of registered vehicles.                    | 🚧 Planned     |
| **Entry Logs**    | `/logs`          | History of campus entries/exits.                | 🚧 Planned     |
| **Notifications** | `/notifications` | Alerts and system messages.                     | 🚧 Planned     |
| **Profile**       | `/profile`       | User profile settings.                          | 🚧 Planned     |

---

## 👮 Security Guard Portal

Accessible only to `security` role.

| Page Name        | Route                 | Description                          | Status     |
| :--------------- | :-------------------- | :----------------------------------- | :--------- |
| **Dashboard**    | `/security/dashboard` | Main guard interface for monitoring. | 🚧 Planned |
| **Live Monitor** | `/security/live`      | Real-time camera feed and detection. | 🚧 Planned |

---

## 🧭 System Pages

| Page Name        | Route           | Description                           | Status         |
| :--------------- | :-------------- | :------------------------------------ | :------------- |
| **Not Found**    | `*`             | 404 Error page for unknown routes.    | ✅ Implemented |
| **Unauthorized** | `/unauthorized` | 403 Error page for permission issues. | ✅ Implemented |
