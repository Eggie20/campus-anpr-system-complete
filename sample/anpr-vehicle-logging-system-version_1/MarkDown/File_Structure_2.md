# Complete ANPR System - React File Structure

```
campus-anpr-system/
│
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   ├── favicon.ico
│   │   ├── logo.png
│   │   ├── manifest.json
│   │   ├── robots.txt
│   │   └── assets/
│   │       └── images/
│   │           ├── anpr-logo.png
│   │           ├── anpr-logo-2.png
│   │           ├── placeholder-avatar.png
│   │           ├── placeholder-vehicle.png
│   │           └── icons/
│   │               ├── car.svg
│   │               ├── motorcycle.svg
│   │               ├── truck.svg
│   │               └── van.svg
│   │
│   ├── src/
│   │   ├── index.js                           # Entry point
│   │   ├── App.jsx                            # Main App component
│   │   ├── index.css                          # Base styles imports
│   │   │
│   │   ├── assets/                            # STATIC ASSETS & GLOBAL STYLES
│   │   │   ├── css/                           # [Separated] Centralized Styles
│   │   │   │   ├── core/
│   │   │   │   │   ├── variables.css          # Design tokens (Colors, Fonts)
│   │   │   │   │   ├── reset.css              # Normalize/Reset
│   │   │   │   │   ├── typography.css         # Text styles
│   │   │   │   │   ├── utilities.css          # Helper classes
│   │   │   │   │   └── animations.css         # Keyframes
│   │   │   │   │
│   │   │   │   ├── layouts/                   # Layout Styles
│   │   │   │   │   ├── main-layout.css
│   │   │   │   │   ├── auth-layout.css
│   │   │   │   │   ├── dashboard-layout.css
│   │   │   │   │   ├── header.css
│   │   │   │   │   ├── sidebar.css
│   │   │   │   │   └── footer.css
│   │   │   │   │
│   │   │   │   ├── pages/                     # Page Specific Styles
│   │   │   │   │   ├── login.css
│   │   │   │   │   ├── register.css
│   │   │   │   │   ├── dashboard.css
│   │   │   │   │   ├── vehicles.css
│   │   │   │   │   ├── logs.css
│   │   │   │   │   └── profile.css
│   │   │   │   │
│   │   │   │   └── components/                # Component Styles
│   │   │   │       ├── buttons.css
│   │   │   │       ├── inputs.css
│   │   │   │       ├── cards.css
│   │   │   │       ├── modals.css
│   │   │   │       ├── tables.css
│   │   │   │       ├── widgets.css
│   │   │   │       └── navigation.css
│   │   │   │
│   │   │   ├── js/                            # [Separated] Global Scripts (Non-React)
│   │   │   │   ├── bootstrap-init.js          # Library initializers
│   │   │   │   ├── chart-defaults.js          # Global Chart.js configuration
│   │   │   │   └── theme-loader.js            # Theme preference loader
│   │   │   │
│   │   │   ├── images/
│   │   │   │   ├── logo.svg
│   │   │   │   ├── logo-dark.svg
│   │   │   │   └── backgrounds/
│   │   │   │       ├── login-bg.jpg
│   │   │   │       └── hero-bg.jpg
│   │   │   │
│   │   │   └── fonts/
│   │   │       └── Poppins/
│   │   │           ├── Poppins-Regular.ttf
│   │   │           ├── Poppins-Medium.ttf
│   │   │           ├── Poppins-SemiBold.ttf
│   │   │           └── Poppins-Bold.ttf
│   │   │
│   │   ├── components/                        # REACT COMPONENTS (Pure JSX)
│   │   │   │
│   │   │   ├── layouts/                       # Layout Components
│   │   │   │   ├── MainLayout/
│   │   │   │   │   └── MainLayout.jsx
│   │   │   │   │
│   │   │   │   ├── AuthLayout/
│   │   │   │   │   └── AuthLayout.jsx
│   │   │   │   │
│   │   │   │   ├── DashboardLayout/
│   │   │   │   │   └── DashboardLayout.jsx
│   │   │   │   │
│   │   │   │   ├── Header/
│   │   │   │   │   ├── Header.jsx
│   │   │   │   │   └── components/
│   │   │   │   │       ├── Logo.jsx
│   │   │   │   │       ├── SearchBar.jsx
│   │   │   │   │       ├── NotificationBell.jsx
│   │   │   │   │       ├── UserMenu.jsx
│   │   │   │   │       └── ThemeToggle.jsx
│   │   │   │   │
│   │   │   │   ├── Sidebar/
│   │   │   │   │   ├── Sidebar.jsx
│   │   │   │   │   └── components/
│   │   │   │   │       ├── SidebarHeader.jsx
│   │   │   │   │       ├── SidebarMenu.jsx
│   │   │   │   │       ├── SidebarMenuItem.jsx
│   │   │   │   │       └── SidebarFooter.jsx
│   │   │   │   │
│   │   │   │   ├── Footer/
│   │   │   │   │   └── Footer.jsx
│   │   │   │   │
│   │   │   │   └── MobileMenu/
│   │   │   │       └── MobileMenu.jsx
│   │   │   │
│   │   │   ├── common/                        # Common UI Components
│   │   │   │   ├── Button/
│   │   │   │   │   └── Button.jsx
│   │   │   │   │
│   │   │   │   ├── Input/
│   │   │   │   │   └── Input.jsx
│   │   │   │   │
│   │   │   │   ├── Select/
│   │   │   │   │   └── Select.jsx
│   │   │   │   │
│   │   │   │   ├── Textarea/
│   │   │   │   │   └── Textarea.jsx
│   │   │   │   │
│   │   │   │   ├── Checkbox/
│   │   │   │   │   └── Checkbox.jsx
│   │   │   │   │
│   │   │   │   ├── Radio/
│   │   │   │   │   └── Radio.jsx
│   │   │   │   │
│   │   │   │   ├── Switch/
│   │   │   │   │   └── Switch.jsx
│   │   │   │   │
│   │   │   │   ├── FileUpload/
│   │   │   │   │   └── FileUpload.jsx
│   │   │   │   │
│   │   │   │   ├── DatePicker/
│   │   │   │   │   └── DatePicker.jsx
│   │   │   │   │
│   │   │   │   ├── Modal/
│   │   │   │   │   └── Modal.jsx
│   │   │   │   │
│   │   │   │   ├── Toast/
│   │   │   │   │   ├── Toast.jsx
│   │   │   │   │   └── ToastContainer.jsx
│   │   │   │   │
│   │   │   │   ├── Badge/
│   │   │   │   │   └── Badge.jsx
│   │   │   │   │
│   │   │   │   ├── Avatar/
│   │   │   │   │   └── Avatar.jsx
│   │   │   │   │
│   │   │   │   ├── Card/
│   │   │   │   │   └── Card.jsx
│   │   │   │   │
│   │   │   │   ├── Table/
│   │   │   │   │   ├── Table.jsx
│   │   │   │   │   └── components/
│   │   │   │   │       ├── TableHeader.jsx
│   │   │   │   │       ├── TableBody.jsx
│   │   │   │   │       ├── TableRow.jsx
│   │   │   │   │       └── TableCell.jsx
│   │   │   │   │
│   │   │   │   ├── Pagination/
│   │   │   │   │   └── Pagination.jsx
│   │   │   │   │
│   │   │   │   ├── Loading/
│   │   │   │   │   ├── Loading.jsx
│   │   │   │   │   ├── Spinner.jsx
│   │   │   │   │   └── Skeleton.jsx
│   │   │   │   │
│   │   │   │   ├── EmptyState/
│   │   │   │   │   └── EmptyState.jsx
│   │   │   │   │
│   │   │   │   ├── ErrorBoundary/
│   │   │   │   │   └── ErrorBoundary.jsx
│   │   │   │   │
│   │   │   │   ├── Dropdown/
│   │   │   │   │   └── Dropdown.jsx
│   │   │   │   │
│   │   │   │   ├── Tabs/
│   │   │   │   │   └── Tabs.jsx
│   │   │   │   │
│   │   │   │   ├── Breadcrumb/
│   │   │   │   │   └── Breadcrumb.jsx
│   │   │   │   │
│   │   │   │   └── Tooltip/
│   │   │   │       └── Tooltip.jsx
│   │   │   │
│   │   │   ├── widgets/                       # Dashboard Widgets
│   │   │   │   ├── StatCard/
│   │   │   │   │   └── StatCard.jsx
│   │   │   │   │
│   │   │   │   ├── ChartWidget/
│   │   │   │   │   ├── ChartWidget.jsx
│   │   │   │   │   └── components/
│   │   │   │   │       ├── LineChart.jsx
│   │   │   │   │       ├── BarChart.jsx
│   │   │   │   │       ├── PieChart.jsx
│   │   │   │   │       └── DoughnutChart.jsx
│   │   │   │   │
│   │   │   │   ├── ActivityFeed/
│   │   │   │   │   ├── ActivityFeed.jsx
│   │   │   │   │   └── ActivityItem.jsx
│   │   │   │   │
│   │   │   │   ├── QuickActions/
│   │   │   │   │   ├── QuickActions.jsx
│   │   │   │   │   └── QuickActionButton.jsx
│   │   │   │   │
│   │   │   │   ├── ProfileSummary/
│   │   │   │   │   └── ProfileSummary.jsx
│   │   │   │   │
│   │   │   │   ├── VehicleCard/
│   │   │   │   │   └── VehicleCard.jsx
│   │   │   │   │
│   │   │   │   ├── NotificationCard/
│   │   │   │   │   └── NotificationCard.jsx
│   │   │   │   │
│   │   │   │   ├── CalendarWidget/
│   │   │   │   │   └── CalendarWidget.jsx
│   │   │   │   │
│   │   │   │   └── ProgressWidget/
│   │   │   │       ├── ProgressWidget.jsx
│   │   │   │
│   │   │   ├── forms/                         # Form Components
│   │   │   │   ├── LoginForm/
│   │   │   │   │   └── LoginForm.jsx
│   │   │   │   │
│   │   │   │   ├── RegisterForm/
│   │   │   │   │   └── RegisterForm.jsx
│   │   │   │   │
│   │   │   │   ├── ProfileForm/
│   │   │   │   │   └── ProfileForm.jsx
│   │   │   │   │
│   │   │   │   ├── VehicleForm/
│   │   │   │   │   └── VehicleForm.jsx
│   │   │   │   │
│   │   │   │   ├── ChangePasswordForm/
│   │   │   │   │   └── ChangePasswordForm.jsx
│   │   │   │   │
│   │   │   │   └── FilterForm/
│   │   │   │       └── FilterForm.jsx
│   │   │   │
│   │   │   ├── registration/                  # Registration Specific
│   │   │   │   ├── RegistrationSidebar/
│   │   │   │   │   ├── RegistrationSidebar.jsx
│   │   │   │   │   └── components/
│   │   │   │   │       ├── SidebarHeader.jsx
│   │   │   │   │       ├── InfoItem.jsx
│   │   │   │   │       └── SidebarFooter.jsx
│   │   │   │   │
│   │   │   │   ├── ProgressIndicator/
│   │   │   │   │   ├── ProgressIndicator.jsx
│   │   │   │   │   └── ProgressStep.jsx
│   │   │   │   │
│   │   │   │   ├── OwnerInfoStep/
│   │   │   │   │   ├── OwnerInfoStep.jsx
│   │   │   │   │   └── components/
│   │   │   │   │       ├── ScanIDButton.jsx
│   │   │   │   │       ├── PersonalInfoSection.jsx
│   │   │   │   │       ├── ContactInfoSection.jsx
│   │   │   │   │       └── DocumentUploadSection.jsx
│   │   │   │   │
│   │   │   │   ├── VehicleDetailsStep/
│   │   │   │   │   ├── VehicleDetailsStep.jsx
│   │   │   │   │   └── components/
│   │   │   │   │       ├── VehicleTypeSelector.jsx
│   │   │   │   │       ├── VehicleTypeOption.jsx
│   │   │   │   │       ├── PlateNumberInput.jsx
│   │   │   │   │       └── VehicleSpecsSection.jsx
│   │   │   │   │
│   │   │   │   ├── ReviewStep/
│   │   │   │   │   ├── ReviewStep.jsx
│   │   │   │   │   └── components/
│   │   │   │   │       ├── ReviewSection.jsx
│   │   │   │   │       ├── TermsAndConditions.jsx
│   │   │   │   │       ├── TermsScrollTracker.jsx
│   │   │   │   │       ├── TermsCheckbox.jsx
│   │   │   │   │       └── CaptchaSection.jsx
│   │   │   │   │
│   │   │   │   ├── OCRModal/
│   │   │   │   │   ├── OCRModal.jsx
│   │   │   │   │   └── components/
│   │   │   │   │       ├── OCRHeader.jsx
│   │   │   │   │       ├── DualUploadSection.jsx
│   │   │   │   │       ├── DropZone.jsx
│   │   │   │   │       ├── ProcessingOverlay.jsx
│   │   │   │   │       └── OCRFooter.jsx
│   │   │   │   │
│   │   │   │   ├── VerificationModal/
│   │   │   │   │   ├── VerificationModal.jsx
│   │   │   │   │   └── components/
│   │   │   │   │       ├── VerificationBanner.jsx
│   │   │   │   │       ├── DocumentPreview.jsx
│   │   │   │   │       ├── ExtractedDataList.jsx
│   │   │   │   │       └── VerificationFooter.jsx
│   │   │   │   │
│   │   │   │   ├── FormActions/
│   │   │   │   │   ├── FormActions.jsx
│   │   │   │   │   └── components/
│   │   │   │   │       ├── BackButton.jsx
│   │   │   │   │       ├── NextButton.jsx
│   │   │   │   │       ├── SubmitButton.jsx
│   │   │   │   │       └── LoginPrompt.jsx
│   │   │   │   │
│   │   │   │   ├── Captcha/
│   │   │   │   │   ├── Captcha.jsx
│   │   │   │   │   └── CaptchaCanvas.jsx
│   │   │   │   │
│   │   │   │   └── SuccessMessage/
│   │   │   │       ├── SuccessMessage.jsx
│   │   │   │
│   │   │   ├── vehicles/                      # Vehicle Components
│   │   │   │   ├── VehicleList/
│   │   │   │   │   └── VehicleList.jsx
│   │   │   │   │
│   │   │   │   ├── VehicleGrid/
│   │   │   │   │   └── VehicleGrid.jsx
│   │   │   │   │
│   │   │   │   ├── VehicleDetail/
│   │   │   │   │   └── VehicleDetail.jsx
│   │   │   │   │
│   │   │   │   ├── VehicleStatus/
│   │   │   │   │   └── VehicleStatus.jsx
│   │   │   │   │
│   │   │   │   └── PlateDisplay/
│   │   │   │       └── PlateDisplay.jsx
│   │   │   │
│   │   │   ├── logs/                          # Log Components
│   │   │   │   ├── LogTable/
│   │   │   │   │   └── LogTable.jsx
│   │   │   │   │
│   │   │   │   ├── LogFilters/
│   │   │   │   │   └── LogFilters.jsx
│   │   │   │   │
│   │   │   │   ├── LogDetail/
│   │   │   │   │   └── LogDetail.jsx
│   │   │   │   │
│   │   │   │   └── LogTimeline/
│   │   │   │       └── LogTimeline.jsx
│   │   │   │
│   │   │   ├── realtime/                      # Real-time Components
│   │   │   │   ├── LiveFeedGrid/
│   │   │   │   │   └── LiveFeedGrid.jsx
│   │   │   │   │
│   │   │   │   ├── CameraFeed/
│   │   │   │   │   └── CameraFeed.jsx
│   │   │   │   │
│   │   │   │   ├── DetectionAlert/
│   │   │   │   │   └── DetectionAlert.jsx
│   │   │   │   │
│   │   │   │   └── RealtimeNotification/
│   │   │   │       └── RealtimeNotification.jsx
│   │   │   │
│   │   │   ├── admin/                         # Admin Components
│   │   │   │   ├── UserManagementTable/
│   │   │   │   │   └── UserManagementTable.jsx
│   │   │   │   │
│   │   │   │   ├── CameraManagement/
│   │   │   │   │   └── CameraManagement.jsx
│   │   │   │   │
│   │   │   │   ├── SystemStats/
│   │   │   │   │   └── SystemStats.jsx
│   │   │   │   │
│   │   │   │   └── ReportGenerator/
│   │   │   │       └── ReportGenerator.jsx
│   │   │   │
│   │   │   ├── pages/                             # Page Components
│   │   │   │   │
│   │   │   │   ├── public/                        # Public Pages
│   │   │   │   │   ├── Home/
│   │   │   │   │   │   ├── Home.jsx
│   │   │   │   │   │   └── components/
│   │   │   │   │   │       ├── Hero.jsx
│   │   │   │   │   │       ├── Features.jsx
│   │   │   │   │   │       └── CallToAction.jsx
│   │   │   │   │   │
│   │   │   │   │   ├── Login/
│   │   │   │   │   │   └── Login.jsx
│   │   │   │   │   │
│   │   │   │   │   ├── Register/
│   │   │   │   │   │   └── Register.jsx
│   │   │   │   │   │
│   │   │   │   │   └── ForgotPassword/
│   │   │   │   │       └── ForgotPassword.jsx
│   │   │   │   │
│   │   │   │   ├── student/                       # Student Pages
│   │   │   │   │   ├── Dashboard/
│   │   │   │   │   │   ├── Dashboard.jsx
│   │   │   │   │   │   └── components/
│   │   │   │   │   │       ├── WelcomeBanner.jsx
│   │   │   │   │   │       ├── StatsOverview.jsx
│   │   │   │   │   │       └── RecentActivity.jsx
│   │   │   │   │   │
│   │   │   │   │   ├── MyVehicles/
│   │   │   │   │   │   ├── MyVehicles.jsx
│   │   │   │   │   │   └── components/
│   │   │   │   │   │       ├── VehicleListView.jsx
│   │   │   │   │   │       ├── VehicleGridView.jsx
│   │   │   │   │   │       └── AddVehicleButton.jsx
│   │   │   │   │   │
│   │   │   │   │   ├── VehicleDetails/
│   │   │   │   │   │   ├── VehicleDetails.jsx
│   │   │   │   │   │   └── components/
│   │   │   │   │   │       ├── VehicleInfo.jsx
│   │   │   │   │   │       ├── VehicleHistory.jsx
│   │   │   │   │   │       └── VehicleActions.jsx
│   │   │   │   │   │
│   │   │   │   │   ├── EntryLogs/
│   │   │   │   │   │   ├── EntryLogs.jsx
│   │   │   │   │   │   └── components/
│   │   │   │   │   │       ├── LogsFilter.jsx
│   │   │   │   │   │       └── LogsTable.jsx
│   │   │   │   │   │
│   │   │   │   │   ├── Notifications/
│   │   │   │   │   │   ├── Notifications.jsx
│   │   │   │   │   │   └── components/
│   │   │   │   │   │       ├── NotificationList.jsx
│   │   │   │   │   │       └── NotificationItem.jsx
│   │   │   │   │   │
│   │   │   │   │   └── Profile/
│   │   │   │   │       ├── Profile.jsx
│   │   │   │   │       └── components/
│   │   │   │   │           ├── ProfileHeader.jsx
│   │   │   │   │           ├── ProfileInfo.jsx
│   │   │   │   │           ├── SecuritySettings.jsx
│   │   │   │   │           └── AccountSettings.jsx
│   │   │   │   │
│   │   │   │   ├── admin/                         # Admin Pages
│   │   │   │   │   ├── Dashboard/
│   │   │   │   │   │   ├── Dashboard.jsx
│   │   │   │   │   │   └── components/
│   │   │   │   │   │       ├── SystemOverview.jsx
│   │   │   │   │   │       ├── LiveStats.jsx
│   │   │   │   │   │       └── RecentDetections.jsx
│   │   │   │   │   │
│   │   │   │   │   ├── UserManagement/
│   │   │   │   │   │   ├── UserManagement.jsx
│   │   │   │   │   │   └── components/
│   │   │   │   │   │       ├── UserTable.jsx
│   │   │   │   │   │       ├── AddUserModal.jsx
│   │   │   │   │   │       ├── EditUserModal.jsx
│   │   │   │   │   │       └── UserFilters.jsx
│   │   │   │   │   │
│   │   │   │   │   ├── VehicleManagement/
│   │   │   │   │   │   ├── VehicleManagement.jsx
│   │   │   │   │   │   └── components/
│   │   │   │   │   │       ├── AdminVehicleTable.jsx
│   │   │   │   │   │       ├── VehicleApprovalModal.jsx
│   │   │   │   │   │       ├── FlagVehicleModal.jsx
│   │   │   │   │   │
│   │   │   │   │   ├── Reports/
│   │   │   │   │   │   ├── Reports.jsx
│   │   │   │   │   │   └── components/
│   │   │   │   │   │       ├── ReportFilters.jsx
│   │   │   │   │   │       ├── ReportCharts.jsx
│   │   │   │   │   │       └── ExportButtons.jsx
│   │   │   │   │   │
│   │   │   │   │   └── Settings/
│   │   │   │   │       ├── Settings.jsx
│   │   │   │   │       └── components/
│   │   │   │   │           ├── GeneralSettings.jsx
│   │   │   │   │           ├── CameraSettings.jsx
│   │   │   │   │           ├── NotificationSettings.jsx
│   │   │   │   │           └── UserRolesSettings.jsx
│   │   │   │   │
│   │   │   │   └── security/                      # Security Guard Pages
│   │   │   │       ├── Dashboard/
│   │   │   │       │   ├── SecurityDashboard.jsx
│   │   │   │       │   └── components/
│   │   │   │       │       ├── LiveMonitoring.jsx
│   │   │   │       │       ├── RecentEntryFeed.jsx
│   │   │   │       │       └── ManualEntryForm.jsx
│   │   │   │       │
│   │   │   │       ├── Logs/
│   │   │   │       │   ├── SecurityLogs.jsx
│   │   │   │       │   └── components/
│   │   │   │       │       ├── LogTable.jsx
│   │   │   │       │       └── LogDetails.jsx
│   │   │   │       │
│   │   │   │       └── ShiftReport/
│   │   │   │           └── ShiftReport.jsx
│   │   │   │
│   │   │   ├── hooks/                             # Custom React Hooks
│   │   │   │   ├── useAuth.js                     # Authentication logic
│   │   │   │   ├── useTheme.js                    # Theme switching
│   │   │   │   ├── useNotification.js             # Toast notifications
│   │   │   │   ├── useForm.js                     # Form handling & validation
│   │   │   │   ├── useFetch.js                    # API data fetching
│   │   │   │   ├── useSocket.js                   # WebSocket connections
│   │   │   │   ├── useDebounce.js                 # Input debouncing
│   │   │   │   ├── useMediaQuery.js               # Responsive checks
│   │   │   │   ├── useLocalStorage.js             # Local storage persistence
│   │   │   │   ├── useCamera.js                   # Camera feed handling
│   │   │   │   └── useOCR.js                      # OCR processing logic
│   │   │   │
│   │   │   ├── contexts/                          # React Contexts
│   │   │   │   ├── AuthContext.jsx                # User session state
│   │   │   │   ├── ThemeContext.jsx               # Theme state
│   │   │   │   ├── NotificationContext.jsx        # Global notifications
│   │   │   │   ├── SocketContext.jsx              # WebSocket instance
│   │   │   │   └── SidebarContext.jsx             # Sidebar toggle state
│   │   │   │
│   │   │   ├── services/                          # API & Business Logic
│   │   │   │   ├── api.js                         # Axios/Fetch instance
│   │   │   │   ├── authService.js                 # Login/Register endpoints
│   │   │   │   ├── userService.js                 # User CRUD
│   │   │   │   ├── vehicleService.js              # Vehicle CRUD
│   │   │   │   ├── logService.js                  # Entry/Exit logs
│   │   │   │   ├── reportService.js               # Report data fetching
│   │   │   │   ├── cameraService.js               # Camera stream management
│   │   │   │   ├── ocrService.js                  # OCR integration
│   │   │   │   └── websocketService.js            # Real-time event handling
│   │   │   │
│   │   │   ├── utils/                             # Helper Functions
│   │   │   │   ├── constants.js                   # App-wide constants
│   │   │   │   ├── validators.js                  # Form validation rules
│   │   │   │   ├── formatDate.js                  # Date formatting utilities
│   │   │   │   ├── formatCurrency.js              # Currency formatting
│   │   │   │   ├── roles.js                       # Role-based permissions
│   │   │   │   └── exportUtils.js                 # PDF/CSV export helpers
│   │   │   │
│   │   │   └── routes/                            # Routing Configuration
│   │   │       ├── AppRoutes.jsx                  # Main routing logic
│   │   │       ├── PrivateRoute.jsx               # Protected route guard
│   │   │       ├── PublicRoute.jsx                # Public route guard
│   │   │       ├── RoleRoute.jsx                  # Role-based access guard
│   │   │       └── routes.js                      # Route definitions
│   │   │
│   │   ├── .env                                   # Environment variables
│   │   ├── .eslintrc.json                         # Linting config
│   │   ├── .prettierrc                            # Formatting config
│   │   ├── package.json                           # Dependencies
│   │   └── README.md                              # Project documentation
```

### Key Architectural Decisions

1.  **Strict Assets Separation**:

    - **Centralized CSS**: All stylesheets are located in `src/assets/css`, organized by directory (core, layouts, components, pages) to prevent cluttering the component tree.
    - **Global JS**: Vanilla JS scripts (global utils, init scripts) are kept in `src/assets/js`.
    - **Component Purity**: React component directories contain ONLY JSX files and sub-components. Styles are imported from the centralized `assets` folder.

2.  **Component Separation**:

    - **Layouts**: Dedicated layout components wrap pages to ensure consistent structure without duplication.
    - **Commons**: Highly reusable UI atoms are isolated in `common/`.
    - **Features**: Complex features are grouped into their own directories.

3.  **State Management**:

    - **Context API**: Used for global states like Authentication and Theme.
    - **Custom Hooks**: Logic extracted into hooks (`useAuth`, `useFetch`, `useOCR`) to keep UI components focused on rendering.

4.  **Services Layer**:

    - **API Abstraction**: All API calls are abstracted into `services/` to decouple UI from API status and endpoints.

5.  **Routing**:
    - **Centralized Configuration**: Routing managed in `routes/` with guarded access control.
