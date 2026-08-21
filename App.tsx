import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Venues from "./pages/Venues";
import Layout from "./components/Layout";
import VenueDetail from "./pages/VenueDetail";
import Payments from "./pages/Payments";
import Register from "./pages/Register";
import PaymentSettings from "./pages/PaymentSettings";

/**
 * Protects routes that require authentication.
 */
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
  path="/settings/payments"
  element={
    <PrivateRoute>
      <PaymentSettings />
    </PrivateRoute>
  }
/>
          <Route
            path="/venues"
            element={
              <PrivateRoute>
                <Venues />
              </PrivateRoute>
            }
          />
          <Route
            path="/payments"
            element={
              <PrivateRoute>
              <Payments />
              </PrivateRoute>
            }
          />
          <Route
               path="/venues/:id"
               element={
               <PrivateRoute>
               <VenueDetail />
               </PrivateRoute>
          }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}