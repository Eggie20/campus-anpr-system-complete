import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth token on mount
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials, roleArg) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: credentials.email || credentials.identifier,
          password: credentials.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle Pydantic validation errors (array) or direct detail strings
        const errorDetail = Array.isArray(data.detail)
          ? data.detail[0].msg
          : data.detail;
        throw new Error(errorDetail || 'Login failed');
      }

      // Role Verification
      const requiredRole = roleArg; // Only use explicit roleArg for strict verification
      const userRole = data.user.role;

      // Strict role check only for admin/security logins (when roleArg is explicitly passed)
      if (requiredRole && userRole !== requiredRole) {
        throw new Error(`Unauthorized: This portal is for ${requiredRole}s only.`);
      }

      // For main portal: prevent admin/security from using the regular login
      // They should use their dedicated portals
      const selectedRole = credentials.role;
      if (selectedRole && (userRole === 'admin' || userRole === 'security')) {
        throw new Error(`Please use the ${userRole === 'admin' ? 'Admin' : 'Security'} login portal.`);
      }

      setUser(data.user);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.access_token);

      return { success: true, user: data.user };
    } catch (error) {
      console.error('Login error:', error);
      let message = error.message;
      if (error instanceof TypeError && message.includes('fetch')) {
        message = "Server is unreachable. Please ensure the backend is running.";
      }
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
