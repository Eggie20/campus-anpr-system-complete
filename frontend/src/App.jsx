import { BrowserRouter, HashRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { PrivacyProvider } from './contexts/PrivacyContext';
import AppRoutes from './routes/AppRoutes';
import isElectron from './utils/isElectron';

// Use HashRouter for Electron (file:// protocol) and BrowserRouter for web
const Router = isElectron() ? HashRouter : BrowserRouter;

const routerFuture = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
};

function App() {
  return (
    <Router future={routerFuture}>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <PrivacyProvider>
              <AppRoutes />
            </PrivacyProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;

