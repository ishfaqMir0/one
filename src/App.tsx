import { Suspense, lazy, type ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import { useAuth } from './contexts/AuthContext';
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Fields = lazy(() => import('./pages/Fields'));
const Profile = lazy(() => import('./pages/Profile'));
const SkuastAdvisory = lazy(() => import('./pages/SkuastAdvisory'));
const SoilTestAdvisory = lazy(() => import('./pages/SoilTestAdvisory'));
const FinancialLedger = lazy(() => import('./pages/FinancialLedger'));
const OrchardDoctor = lazy(() => import('./pages/OrchardDoctor'));
const TreeScouting = lazy(() => import('./pages/TreeScouting'));
const Calendar = lazy(() => import('./pages/Calendar'));
const TeamManagement = lazy(() => import('./pages/TeamManagement'));
const AcceptInvitation = lazy(() => import('./pages/AcceptInvitation'));
const Pricing = lazy(() => import('./pages/Pricing'));
const PaymentPage = lazy(() => import('./pages/PaymentPage'));


const RequireAuth = ({ children }: { children: ReactNode }) => {
  const { session, loading } = useAuth();

  // OPTIMIZED: Simpler loading screen for mobile performance
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900">
        <div className="text-center px-4">
          {/* Simplified loading animation */}
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="text-white text-lg font-semibold">
              Loading AppleKul One...
            </div>
            <div className="text-emerald-200 text-sm mt-2">
              Please wait
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    // Unauthenticated users land on the pricing page first
    return <Navigate to="/pricing" replace />;
  }

  return <>{children}</>;
};

const RouteLoader = () => (
  <div className="min-h-[40vh] grid place-items-center px-4 text-sm text-gray-600">
    <div className="text-center">
      <div className="w-8 h-8 mx-auto mb-3 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      <p>Loading page...</p>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Suspense fallback={<RouteLoader />}>
      <Routes>
        {/* Public landing — pricing card shown on first open */}
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="fields" element={<Fields />} />
          <Route path="finance" element={<FinancialLedger />} />
          <Route path="orchard-doctor" element={<OrchardDoctor />} />
          <Route path="profile" element={<Profile />} />
          <Route path="skuast-advisory" element={<SkuastAdvisory />} />
          <Route path="soil-test-advisory" element={<SoilTestAdvisory />} />
          <Route path="tree-scouting" element={<TreeScouting />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="/teammanagement" element={<TeamManagement />} />
          <Route path="/accept-invitation" element={<AcceptInvitation />} />
        </Route>
      </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
