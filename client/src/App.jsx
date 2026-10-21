import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute, { AdminRoute } from "./components/ProtectedRoute.jsx";
import AppShell from "./components/AppShell.jsx";
import AccessManagementPage from "./pages/AccessManagementPage.jsx";
import CustomersPage from "./pages/CustomersPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import EnquiriesPage from "./pages/EnquiriesPage.jsx";
import InvoicesPage from "./pages/InvoicesPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import OrdersPage from "./pages/OrdersPage.jsx";
import ProductsPage from "./pages/ProductsPage.jsx";
import QuotationsPage from "./pages/QuotationsPage.jsx";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public route — already-authenticated users are sent to dashboard */}
        <Route path="/login" element={<LoginPage />} />

        {/* All routes inside require a valid session */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="enquiries" element={<EnquiriesPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="quotations" element={<QuotationsPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="invoices" element={<InvoicesPage />} />
            <Route path="products" element={<ProductsPage />} />

            {/* Admin-only section — non-admins see a 403 message */}
            <Route element={<AdminRoute />}>
              <Route path="access-management" element={<AccessManagementPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
import App from './app/App';

export default App;
