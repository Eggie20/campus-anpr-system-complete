# ANPR Login System

A secure, modern login system with role-based authentication for the ANPR Vehicle Access Control project.

## Features

- **3 Separate Login Pages**

  - `index.html` - Faculty & Student login
  - `admin-login.html` - Administrator login
  - `security-login.html` - Security personnel login

- **Dark Mode** - Toggle with localStorage persistence
- **Responsive Design** - Mobile-first with 3 breakpoints
- **Form Validation** - Real-time email/password validation
- **Password Strength Indicator** - Visual feedback
- **Rate Limiting** - Max 5 attempts before lockout
- **Accessibility** - WCAG 2.1 AA compliant
- **Animations** - Smooth micro-interactions

## File Structure

```
/ANPR-Login
├── /css
│   ├── styles.css       # Main styles & variables
│   ├── responsive.css   # Media queries
│   ├── animations.css   # Keyframes & transitions
│   └── dark-mode.css    # Dark theme
├── /js
│   ├── utils.js         # Helper functions
│   ├── validation.js    # Form validation
│   ├── dark-mode.js     # Theme toggle
│   ├── animations.js    # UI animations
│   └── auth.js          # Authentication logic
├── /assets
│   ├── /images
│   └── /icons
├── index.html           # Faculty/Student login
├── admin-login.html     # Admin login
├── security-login.html  # Security login
├── forgot-password.html # Password reset
└── README.md
```

## Test Credentials

| Role     | Email                | Password     |
| -------- | -------------------- | ------------ |
| Faculty  | faculty@example.com  | Faculty@123  |
| Student  | student@example.com  | Student@123  |
| Admin    | admin@example.com    | Admin@123    |
| Security | security@example.com | Security@123 |

## Getting Started

1. Open `index.html` in a web browser
2. Use test credentials above to test login
3. Toggle dark mode with the sun/moon button
4. Test validation with invalid inputs

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Technologies

- HTML5 (semantic markup)
- CSS3 (Flexbox, CSS Variables)
- JavaScript ES6+ (no dependencies)
