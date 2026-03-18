# Handover Guide

A guide for future administrators and developers.

---

## Quick Start

1. Open `index.html` in a modern browser
2. Click any portal card to access role dashboards
3. All data is stored in localStorage (mock API)

---

## Key Files to Modify

### Adding/Editing Components

- **Buttons, Cards, Forms**: `/css/shared/components.base.css`
- **Colors, Spacing**: `/css/shared/tokens.css`
- **Dark/Light themes**: `/css/shared/themes.css`

### Modifying Mock Data

- **Users, Vehicles, Cameras**: `/js/shared/mock-api.js`
- See the `data` object at the top of the file

### Adding New Pages

1. Copy an existing HTML page (e.g., `student.html`)
2. Update the CSS/JS includes
3. Modify the content structure
4. Link from `index.html`

---

## Safe-to-Modify Zones

| File            | Safe Zones            | Caution Zones     |
| --------------- | --------------------- | ----------------- |
| `tokens.css`    | Color values, spacing | Variable names    |
| `mock-api.js`   | Sample data           | Method signatures |
| Role dashboards | Content, layout       | Script includes   |

---

## Browser Support

- Chrome 90+
- Edge 90+
- Firefox 88+
- Safari 14+

---

## Known Limitations

1. **No real backend** - uses localStorage
2. **No actual CCTV feeds** - placeholder graphics
3. **Mock authentication** - no password validation

---

## Future Improvements

- [ ] Connect to real PHP/Node backend
- [ ] Integrate actual camera feeds
- [ ] Add WebSocket for real-time updates
- [ ] Implement proper authentication
- [ ] Add print stylesheets for reports
