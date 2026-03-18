/**
 * Footer - Simple app footer with copyright and version
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="app-footer app-footer--styled">
      <div className="app-footer__content">
        <p className="app-footer__copyright">
          © {currentYear} CampusSecure ANPR System
        </p>
        <span className="app-footer__version">v1.0.0</span>
      </div>
    </footer>
  );
}
