import { Switch, Route, Redirect } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/common/Layout';
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';
import Dashboard from './components/dashboard/Dashboard';
import EventList from './components/events/EventList';
import TicketList from './components/tickets/TicketList';
import AssignmentList from './components/assignments/AssignmentList';
import CouponList from './components/coupons/CouponList';
import QRScanner from './components/scanner/QRScanner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Switch>
          <Route path="/login" component={LoginForm} />
          <Route path="/signup" component={SignupForm} />
          <Route path="/dashboard">
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          </Route>
          <Route path="/events">
            <ProtectedRoute>
              <Layout>
                <EventList />
              </Layout>
            </ProtectedRoute>
          </Route>
          <Route path="/tickets">
            <ProtectedRoute>
              <Layout>
                <TicketList />
              </Layout>
            </ProtectedRoute>
          </Route>
          <Route path="/assignments">
            <ProtectedRoute>
              <Layout>
                <AssignmentList />
              </Layout>
            </ProtectedRoute>
          </Route>
          <Route path="/coupons">
            <ProtectedRoute>
              <Layout>
                <CouponList />
              </Layout>
            </ProtectedRoute>
          </Route>
          <Route path="/scanner">
            <ProtectedRoute>
              <Layout>
                <QRScanner />
              </Layout>
            </ProtectedRoute>
          </Route>
          <Route path="/">
            <Redirect to="/dashboard" />
          </Route>
        </Switch>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;