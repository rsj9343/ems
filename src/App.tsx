import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';
import EmployeeList from './components/Employees/EmployeeList';
import EmployeeForm from './components/Employees/EmployeeForm';
import EmployeeDetail from './components/Employees/EmployeeDetail';
import DepartmentList from './components/Departments/DepartmentList';
import DepartmentForm from './components/Departments/DepartmentForm';
import LeaveList from './components/Leaves/LeaveList';
import LeaveForm from './components/Leaves/LeaveForm';
import PerformanceList from './components/Performance/PerformanceList';
import PerformanceForm from './components/Performance/PerformanceForm';
import ReportsPage from './components/Reports/ReportsPage';
import Profile from './components/Profile/Profile';
import Layout from './components/Layout/Layout';
import LoadingSpinner from './components/Common/LoadingSpinner';
import Toast from './components/Common/Toast';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin } = useAuth();

  return user && isAdmin ? <>{children}</> : <Navigate to="/dashboard" />;
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route 
        path="/login" 
        element={user ? <Navigate to="/dashboard" /> : <Login />} 
      />
      <Route path="/" element={<Navigate to="/dashboard" />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        
        {/* Employee Management Routes */}
        <Route path="employees" element={
          <AdminRoute>
            <EmployeeList />
          </AdminRoute>
        } />
        <Route path="employees/:id" element={
          <AdminRoute>
            <EmployeeDetail />
          </AdminRoute>
        } />
        <Route path="employees/new" element={
          <AdminRoute>
            <EmployeeForm />
          </AdminRoute>
        } />
        <Route path="employees/:id/edit" element={
          <AdminRoute>
            <EmployeeForm />
          </AdminRoute>
        } />
        
        {/* Department Management Routes */}
        <Route path="departments" element={
          <AdminRoute>
            <DepartmentList />
          </AdminRoute>
        } />
        <Route path="departments/new" element={
          <AdminRoute>
            <DepartmentForm />
          </AdminRoute>
        } />
        <Route path="departments/:id/edit" element={
          <AdminRoute>
            <DepartmentForm />
          </AdminRoute>
        } />
        
        {/* Leave Management Routes */}
        <Route path="leaves" element={<LeaveList />} />
        <Route path="leaves/new" element={<LeaveForm />} />
        <Route path="leaves/:id" element={<LeaveForm />} />
        
        {/* Performance Management Routes */}
        <Route path="performance" element={
          <AdminRoute>
            <PerformanceList />
          </AdminRoute>
        } />
        <Route path="performance/new" element={
          <AdminRoute>
            <PerformanceForm />
          </AdminRoute>
        } />
        <Route path="performance/:id" element={
          <AdminRoute>
            <PerformanceForm />
          </AdminRoute>
        } />
        <Route path="performance/:id/edit" element={
          <AdminRoute>
            <PerformanceForm />
          </AdminRoute>
        } />
        
        {/* Reports Routes */}
        <Route path="reports" element={
          <AdminRoute>
            <ReportsPage />
          </AdminRoute>
        } />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <AppRoutes />
          <Toast />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;