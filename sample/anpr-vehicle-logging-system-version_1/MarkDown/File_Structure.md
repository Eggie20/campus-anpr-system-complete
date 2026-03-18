campus-anpr-system/
│
├── backend/                                    # Python FastAPI Backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                            # FastAPI app entry point
│   │   ├── config.py                          # Configuration settings
│   │   │
│   │   ├── api/                               # API Routes/Endpoints
│   │   │   ├── __init__.py
│   │   │   ├── deps.py                        # Dependencies (auth, db)
│   │   │   ├── auth.py                        # Login, register, token
│   │   │   ├── users.py                       # User CRUD
│   │   │   ├── students.py                    # Student-specific endpoints
│   │   │   ├── vehicles.py                    # Vehicle management
│   │   │   ├── entry_logs.py                  # Entry/exit logs
│   │   │   ├── dashboard.py                   # Dashboard statistics
│   │   │   ├── notifications.py               # Notifications
│   │   │   └── admin.py                       # Admin-only endpoints
│   │   │
│   │   ├── models/                            # SQLAlchemy Database Models
│   │   │   ├── __init__.py
│   │   │   ├── base.py                        # Base model with timestamps
│   │   │   ├── user.py                        # User model
│   │   │   ├── vehicle.py                     # Vehicle model
│   │   │   ├── entry_log.py                   # Entry log model
│   │   │   ├── notification.py                # Notification model
│   │   │   └── camera.py                      # Camera/gate model
│   │   │
│   │   ├── schemas/                           # Pydantic Schemas (validation)
│   │   │   ├── __init__.py
│   │   │   ├── user.py                        # User schemas (create, response)
│   │   │   ├── vehicle.py                     # Vehicle schemas
│   │   │   ├── entry_log.py                   # Entry log schemas
│   │   │   ├── auth.py                        # Token schemas
│   │   │   └── dashboard.py                   # Dashboard response schemas
│   │   │
│   │   ├── services/                          # Business Logic Layer
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py                # Authentication logic
│   │   │   ├── user_service.py                # User operations
│   │   │   ├── vehicle_service.py             # Vehicle operations
│   │   │   ├── entry_log_service.py           # Entry log operations
│   │   │   ├── anpr_service.py                # ANPR processing logic
│   │   │   ├── notification_service.py        # Notification logic
│   │   │   └── dashboard_service.py           # Dashboard statistics
│   │   │
│   │   ├── iot/                               # IoT Integration Layer
│   │   │   ├── __init__.py
│   │   │   ├── mqtt_client.py                 # MQTT client handler
│   │   │   ├── camera_handler.py              # Camera integration
│   │   │   ├── plate_processor.py             # Plate recognition processing
│   │   │   └── device_manager.py              # IoT device management
│   │   │
│   │   ├── websocket/                         # WebSocket for Real-time
│   │   │   ├── __init__.py
│   │   │   ├── manager.py                     # WebSocket connection manager
│   │   │   └── handlers.py                    # WebSocket event handlers
│   │   │
│   │   ├── utils/                             # Utility Functions
│   │   │   ├── __init__.py
│   │   │   ├── database.py                    # Database connection
│   │   │   ├── security.py                    # Password hashing, JWT
│   │   │   ├── email.py                       # Email sending
│   │   │   └── helpers.py                     # General helpers
│   │   │
│   │   └── middleware/                        # Custom Middleware
│   │       ├── __init__.py
│   │       ├── auth.py                        # Auth middleware
│   │       └── logging.py                     # Request logging
│   │
│   ├── alembic/                               # Database Migrations
│   │   ├── versions/                          # Migration files
│   │   ├── env.py
│   │   └── alembic.ini
│   │
│   ├── tests/                                 # Unit & Integration Tests
│   │   ├── __init__.py
│   │   ├── conftest.py                        # Pytest configuration
│   │   ├── test_api/
│   │   │   ├── test_auth.py
│   │   │   ├── test_vehicles.py
│   │   │   └── test_logs.py
│   │   ├── test_services/
│   │   │   ├── test_auth_service.py
│   │   │   └── test_vehicle_service.py
│   │   └── test_utils/
│   │       └── test_security.py
│   │
│   ├── .env                                   # Environment variables
│   ├── .env.example                           # Example env file
│   ├── .gitignore                             # Git ignore file
│   ├── requirements.txt                       # Python dependencies
│   ├── requirements-dev.txt                   # Dev dependencies
│   ├── README.md                              # Backend documentation
│   └── pyproject.toml                         # Python project config
│
├── frontend/                                  # React Frontend
│   ├── public/
│   │   ├── favicon.ico
│   │   ├── logo.png
│   │   └── images/                            # Static images
│   │
│   ├── src/
│   │   ├── assets/                            # Assets
│   │   │   ├── css/
│   │   │   │   ├── shared/
│   │   │   │   │   ├── reset.css
│   │   │   │   │   ├── tokens.css
│   │   │   │   │   ├── themes.css
│   │   │   │   │   ├── layout.flex.css
│   │   │   │   │   ├── components.base.css
│   │   │   │   │   └── dashboard.widgets.css
│   │   │   │   ├── student/
│   │   │   │   │   └── student.dashboard.css
│   │   │   │   └── admin/
│   │   │   │       └── admin.dashboard.css
│   │   │   │
│   │   │   ├── images/
│   │   │   │   ├── logo.svg
│   │   │   │   └── icons/
│   │   │   │
│   │   │   └── fonts/
│   │   │
│   │   ├── components/                        # Reusable Components
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.jsx               # Sidebar navigation
│   │   │   │   ├── Header.jsx                # Top header
│   │   │   │   ├── Footer.jsx                # Footer
│   │   │   │   ├── Layout.jsx                # Main layout wrapper
│   │   │   │   └── MobileMenu.jsx            # Mobile navigation
│   │   │   │
│   │   │   ├── widgets/                       # Dashboard Widgets
│   │   │   │   ├── StatWidget.jsx            # Statistics card
│   │   │   │   ├── ProfileSummary.jsx        # Profile card
│   │   │   │   ├── VehicleCard.jsx           # Vehicle display card
│   │   │   │   ├── ActivityFeed.jsx          # Activity feed widget
│   │   │   │   ├── NotificationCard.jsx      # Notification card
│   │   │   │   ├── QuickActions.jsx          # Quick action buttons
│   │   │   │   └── ChartWidget.jsx           # Chart display
│   │   │   │
│   │   │   ├── common/                        # Common UI Components
│   │   │   │   ├── Button.jsx                # Button component
│   │   │   │   ├── Badge.jsx                 # Badge component
│   │   │   │   ├── Avatar.jsx                # Avatar component
│   │   │   │   ├── Card.jsx                  # Card component
│   │   │   │   ├── Modal.jsx                 # Modal dialog
│   │   │   │   ├── Input.jsx                 # Form input
│   │   │   │   ├── Select.jsx                # Select dropdown
│   │   │   │   ├── Table.jsx                 # Data table
│   │   │   │   ├── Pagination.jsx            # Pagination
│   │   │   │   ├── Loading.jsx               # Loading spinner
│   │   │   │   ├── Toast.jsx                 # Toast notification
│   │   │   │   └── Dropdown.jsx              # Dropdown menu
│   │   │   │
│   │   │   ├── forms/                         # Form Components
│   │   │   │   ├── LoginForm.jsx             # Login form
│   │   │   │   ├── RegisterForm.jsx          # Registration form
│   │   │   │   ├── VehicleForm.jsx           # Add/edit vehicle
│   │   │   │   └── ProfileForm.jsx           # Profile edit form
│   │   │   │
│   │   │   └── realtime/                      # Real-time Components
│   │   │       ├── LiveFeed.jsx              # Live detection feed
│   │   │       └── RealtimeNotification.jsx  # Real-time alerts
│   │   │
│   │   ├── pages/                             # Page Components
│   │   │   ├── Home.jsx                       # Landing page
│   │   │   │
│   │   │   ├── auth/                          # Authentication Pages
│   │   │   │   ├── Login.jsx                 # Login page
│   │   │   │   ├── Register.jsx              # Register page
│   │   │   │   └── ForgotPassword.jsx        # Password reset
│   │   │   │
│   │   │   ├── student/                       # Student Pages
│   │   │   │   ├── Dashboard.jsx             # Student dashboard
│   │   │   │   ├── Vehicles.jsx              # My vehicles page
│   │   │   │   ├── VehicleDetail.jsx         # Vehicle details
│   │   │   │   ├── EntryLogs.jsx             # Entry logs page
│   │   │   │   ├── Notifications.jsx         # Notifications page
│   │   │   │   └── Profile.jsx               # Profile page
│   │   │   │
│   │   │   ├── admin/                         # Admin Pages
│   │   │   │   ├── Dashboard.jsx             # Admin dashboard
│   │   │   │   ├── Users.jsx                 # User management
│   │   │   │   ├── UserDetail.jsx            # User details
│   │   │   │   ├── Vehicles.jsx              # All vehicles
│   │   │   │   ├── Cameras.jsx               # Camera management
│   │   │   │   ├── EntryLogs.jsx             # All entry logs
│   │   │   │   ├── Reports.jsx               # Reports & analytics
│   │   │   │   └── Settings.jsx              # System settings
│   │   │   │
│   │   │   ├── security/                      # Security Guard Pages
│   │   │   │   ├── Dashboard.jsx             # Security dashboard
│   │   │   │   ├── LiveMonitor.jsx           # Live monitoring
│   │   │   │   └── ManualEntry.jsx           # Manual entry form
│   │   │   │
│   │   │   └── errors/                        # Error Pages
│   │   │       ├── NotFound.jsx              # 404 page
│   │   │       └── Unauthorized.jsx          # 403 page
│   │   │
│   │   ├── services/                          # API Service Layer
│   │   │   ├── api.js                         # Axios instance config
│   │   │   ├── authService.js                 # Auth API calls
│   │   │   ├── userService.js                 # User API calls
│   │   │   ├── vehicleService.js              # Vehicle API calls
│   │   │   ├── entryLogService.js             # Entry log API calls
│   │   │   ├── notificationService.js         # Notification API calls
│   │   │   ├── dashboardService.js            # Dashboard API calls
│   │   │   └── websocket.js                   # WebSocket service
│   │   │
│   │   ├── hooks/                             # Custom React Hooks
│   │   │   ├── useAuth.js                     # Authentication hook
│   │   │   ├── useUser.js                     # User data hook
│   │   │   ├── useVehicles.js                 # Vehicles hook
│   │   │   ├── useEntryLogs.js                # Entry logs hook
│   │   │   ├── useWebSocket.js                # WebSocket hook
│   │   │   ├── useNotifications.js            # Notifications hook
│   │   │   ├── useTheme.js                    # Theme toggle hook
│   │   │   └── useLocalStorage.js             # Local storage hook
│   │   │
│   │   ├── context/                           # React Context
│   │   │   ├── AuthContext.jsx                # Authentication context
│   │   │   ├── ThemeContext.jsx               # Theme context
│   │   │   ├── NotificationContext.jsx        # Notification context
│   │   │   └── WebSocketContext.jsx           # WebSocket context
│   │   │
│   │   ├── utils/                             # Utility Functions
│   │   │   ├── constants.js                   # App constants
│   │   │   ├── helpers.js                     # Helper functions
│   │   │   ├── validators.js                  # Form validators
│   │   │   ├── formatters.js                  # Data formatters
│   │   │   └── storage.js                     # Storage helpers
│   │   │
│   │   ├── routes/                            # Routing Configuration
│   │   │   ├── index.jsx                      # Main router
│   │   │   ├── PrivateRoute.jsx               # Protected route wrapper
│   │   │   └── RoleRoute.jsx                  # Role-based route
│   │   │
│   │   ├── App.jsx                            # Main App component
│   │   ├── main.jsx                           # Entry point
│   │   └── index.css                          # Global styles
│   │
│   ├── .env                                   # Environment variables
│   ├── .env.example                           # Example env file
│   ├── .gitignore                             # Git ignore
│   ├── package.json                           # NPM dependencies
│   ├── vite.config.js                         # Vite configuration
│   ├── tailwind.config.js                     # Tailwind config
│   ├── postcss.config.js                      # PostCSS config
│   ├── index.html                             # HTML template
│   ├── README.md                              # Frontend docs
│   └── jsconfig.json                          # JavaScript config
│
├── iot-devices/                               # IoT Device Code
│   ├── camera-client/                         # ANPR Camera Client
│   │   ├── main.py                            # Main camera script
│   │   ├── plate_recognition.py               # Plate detection logic
│   │   ├── mqtt_publisher.py                  # MQTT publishing
│   │   ├── config.py                          # Camera configuration
│   │   ├── requirements.txt                   # Python dependencies
│   │   └── README.md                          # Setup instructions
│   │
│   ├── raspberry-pi/                          # Raspberry Pi Code
│   │   ├── gate_controller.py                 # Gate control
│   │   ├── sensor_reader.py                   # Sensor reading
│   │   └── requirements.txt
│   │
│   ├── simulators/                            # Testing Simulators
│   │   ├── simulate_camera.py                 # Camera simulator
│   │   ├── simulate_traffic.py                # Traffic simulator
│   │   └── test_mqtt.py                       # MQTT test script
│   │
│   └── docs/                                  # IoT Documentation
│       ├── HARDWARE.md                        # Hardware requirements
│       ├── SETUP.md                           # Setup guide
│       └── TROUBLESHOOTING.md                 # Common issues
│
├── docker/                                    # Docker Configuration
│   ├── backend/
│   │   └── Dockerfile                         # Backend Dockerfile
│   ├── frontend/
│   │   └── Dockerfile                         # Frontend Dockerfile
│   ├── nginx/
│   │   ├── Dockerfile                         # Nginx Dockerfile
│   │   └── nginx.conf                         # Nginx config
│   ├── docker-compose.yml                     # Docker Compose
│   ├── docker-compose.dev.yml                 # Dev environment
│   └── docker-compose.prod.yml                # Production environment
│
├── scripts/                                   # Utility Scripts
│   ├── setup.sh                               # Initial setup script
│   ├── seed_database.py                       # Database seeding
│   ├── backup_database.sh                     # Database backup
│   ├── deploy.sh                              # Deployment script
│   └── test_all.sh                            # Run all tests
│
├── docs/                                      # Project Documentation
│   ├── API.md                                 # API documentation
│   ├── SETUP.md                               # Setup guide
│   ├── ARCHITECTURE.md                        # System architecture
│   ├── DATABASE.md                            # Database schema
│   ├── DEPLOYMENT.md                          # Deployment guide
│   ├── SECURITY.md                            # Security considerations
│   ├── USER_GUIDE.md                          # User manual
│   └── CONTRIBUTING.md                        # Contribution guide
│
├── .github/                                   # GitHub Configuration
│   ├── workflows/
│   │   ├── ci.yml                             # CI pipeline
│   │   ├── deploy.yml                         # Deployment pipeline
│   │   └── tests.yml                          # Test automation
│   └── ISSUE_TEMPLATE/
│       ├── bug_report.md
│       └── feature_request.md
│
├── .gitignore                                 # Global git ignore
├── .editorconfig                              # Editor configuration
├── README.md                                  # Main project README
├── LICENSE                                    # License file
└── CHANGELOG.md                               # Version changelog


# SUMMARY OF STRUCTURE

## Backend (Python FastAPI)
- app/api/           → REST API endpoints
- app/models/        → Database models (SQLAlchemy)
- app/schemas/       → Request/response validation (Pydantic)
- app/services/      → Business logic
- app/iot/           → MQTT & IoT integration
- app/websocket/     → Real-time WebSocket
- app/utils/         → Utilities (auth, database)

## Frontend (React)
- src/components/    → Reusable UI components
- src/pages/         → Page components (routes)
- src/services/      → API calls & WebSocket
- src/hooks/         → Custom React hooks
- src/context/       → Global state management
- src/utils/         → Helper functions

## IoT Devices
- camera-client/     → ANPR camera integration
- simulators/        → Testing tools

## DevOps
- docker/            → Containerization
- scripts/           → Automation scripts
- .github/           → CI/CD pipelines

## Documentation
- docs/              → All project documentation
- README.md          → Main documentation

# KEY FILES TO START WITH

1. backend/app/main.py                    # Backend entry point
2. backend/app/config.py                  # Configuration
3. backend/app/models/user.py             # User model
4. backend/app/api/auth.py                # Authentication
5. frontend/src/App.jsx                   # Frontend entry point
6. frontend/src/services/api.js           # API client
7. frontend/src/pages/student/Dashboard.jsx  # Main dashboard
8. iot-devices/simulators/simulate_camera.py # Test camera
9. docker/docker-compose.yml              # Docker setup
10. README.md                             # Project overview