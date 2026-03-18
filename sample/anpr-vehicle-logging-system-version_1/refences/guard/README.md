# Enhanced Security Camera System

A professional security camera monitoring system for school security guards with authentication, duty time restrictions, and an intuitive monitoring interface.

## Features

### 1. Authentication System

- **Professional Login Interface**: Clean, modern design with CSU branding.
- **Security**: Email/password validation, simulated secure login.
- **Social Login**: Visual integration for future expansion.
- **Theme Support**: Dark/Light mode toggle.

### 2. Duty Time Restriction

- **8-Hour Shift Limit**: Automatic tracking of duty hours.
- **Smart Notifications**:
  - Warning at 7.5 hours (30 mins remaining).
  - Mandatory "End of Shift" modal at 8 hours.
- **Overtime Request**: Integrated workflow for requesting overtime.

### 3. Camera Monitoring Interface

- **Layout**: Optimized split-screen design.
  - **Left Sidebar**: 4-camera grid with live status.
  - **Main Display**: Expanded view for selected camera.
  - **Bottom Panel**: Notifications and Vehicle Counter.
- **Interactive Elements**:
  - Click camera thumbnails to switch main view.
  - "Simulate Detection" for testing alerts.
  - Fullscreen mode support.

### 4. Notification System

- **Real-time Feed**: Color-coded alerts (Green/Yellow/Red).
- **Vehicle Counter**: Live tracking of Cars, Vans, Motorcycles, and Trucks.
- **Simulation**: Test various alert types (Unregistered, Unauthorized, etc.).

## Project Structure

```
/security-camera-system/
├── index.html              # Login Page
├── camera.html             # Main Interface
├── /assets/
│   ├── /css/
│   │   ├── reset.css       # CSS Reset
│   │   ├── variables.css   # Theme & Colors
│   │   ├── auth.css        # Login Styles
│   │   ├── camera.css      # Interface Styles
│   │   ├── components.css  # Reusable UI
│   │   ├── animations.css  # Keyframes
│   │   └── responsive.css  # Mobile Support
│   ├── /js/
│   │   ├── auth.js         # Login Logic
│   │   ├── duty-timer.js   # Shift Tracking
│   │   ├── camera.js       # Camera Logic
│   │   ├── notifications.js# Alert System
│   │   ├── theme-toggle.js # Dark Mode
│   │   └── utils.js        # Helpers
```

## Getting Started

1. Open `index.html` in a modern browser.
2. Login with any valid email (e.g., `guard@csu.edu.ph`) and password (min 6 chars).
3. Explore the camera interface.
4. Use "Simulate Detection" to see alerts in action.
5. Toggle Dark Mode for night shifts.

## Browser Support

- Chrome (Latest)
- Edge (Latest)
- Firefox (Latest)
- Safari (Latest)
