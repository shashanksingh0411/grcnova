// src/App.jsx
import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Flex, Box, Heading, Text, useColorModeValue } from "@chakra-ui/react";
import PolicyManagement from "./pages/policy/policymanagement";
import { useAuth } from "./context/AuthContext";
import ClientOnboarding from "./ClientOnboarding/ClientOnboarding";
import Login from "./auth/Login";
import Signup from "./auth/Signup";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import ProtectedRoute from "./auth/ProtectedRoute";
import PolicyAnalyzer from "./pages/policy/policyanalyser";
import VendorOnboardingDetail from "./pages/VendorManagement/VendorOnboardingDetails";
import Dashboard from "./pages/Dashboard";
import PolicyEditor from "./pages/policy/PolicyEditor";
import EvidenceCenter from "./pages/EvidenceCenter";
import RisksManagementDashboard from "./pages/RiskManagement/RisksManagementDashboard";
import Risk from "./pages/RiskManagement/Risk";
import ControlData from "./pages/ControlData";
import CreatePolicyModal from "./pages/CreatePolicyModal";
import ISO27001 from "./pages/Controls/ISO27001";
import ControlsDashboard from "./pages/Controls/ControlsDashboard";
import AuditReadinessDashboard from "./pages/AuditReadinessDashboard";
import ReportsAnalytics from "./pages/ReportsAnalytics";
import CloudIntegrations from "./pages/CloudIntegrations";
import AdminPanel from "./pages/rbac/AdminPanel";
import VendorModule from "./pages/VendorManagement/VendorModule";
import VendorOnboarding from "./pages/VendorManagement/VendorOnboarding";
import VendorDirectory from "./pages/VendorManagement/VendorDirectory";
import DueDiligenceForms from "./pages/VendorManagement/DueDiligenceForms";
import VendorRiskDashboard from "./pages/VendorManagement/VendorRiskDashboard";
import Departments from "./pages/Departments";
import MyTasks from "./pages/MyTasks";

function App() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, organization } = useAuth();
  const bgColor = useColorModeValue("gray.50", "gray.900");

  return (
    <Flex direction="column" minH="100vh" bg={bgColor}>
      {/* Header */}
      {user && (
        <Header 
          toggleSidebar={() => setSidebarCollapsed(!isSidebarCollapsed)} 
          user={user}
          organization={organization}
        />
      )}
      
      <Flex flex={1}>
        {/* Sidebar */}
        {user && (
          <Box 
            flexShrink={0} 
            w={isSidebarCollapsed ? "60px" : "220px"}
            transition="width 0.3s ease"
          >
            <Sidebar isCollapsed={isSidebarCollapsed} />
          </Box>
        )}
        
        {/* Main content */}
        <Box flex={1} minH="calc(100vh - 60px)" overflow="auto">
          <Box p={4} mx="auto" maxW="1200px">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
              <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <Signup />} />
              <Route path="/ClientOnboarding" element={<ClientOnboarding />} />
              
              {/* Redirect root to dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" />} />
              
              {/* Convenience redirects to fix the warnings */}
              <Route path="/ControlsDashboard" element={<Navigate to="/controls/ControlsDashboard" />} />
              <Route path="/RiskManagement/RisksManagementDashboard" element={<Navigate to="/riskmanagement/dashboard" />} />

              {/* Protected routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/policy-management" element={
                <ProtectedRoute roles={['admin', 'super_admin', 'auditor', 'user']}>
                  <PolicyManagement />
                </ProtectedRoute>
              } />
              
              <Route path="/policy/policyanalyser" element={
                <ProtectedRoute>
                  <PolicyAnalyzer />
                </ProtectedRoute>
              } />

              <Route path="/policy/Policy-Editor" element={
                <ProtectedRoute>
                  <Risk />
                </ProtectedRoute>
              } />

              <Route path="/policy-editor" element={
                <ProtectedRoute roles={['admin', 'super_admin', 'auditor','user']}>
                  <PolicyEditor />
                </ProtectedRoute>
              } />

              <Route path="/evidence-center" element={
                <ProtectedRoute>
                  <EvidenceCenter />
                </ProtectedRoute>
              } />

              <Route path="/riskmanagement/dashboard" element={
                <ProtectedRoute>
                  <RisksManagementDashboard />
                </ProtectedRoute>
              } />

              <Route path="/riskmanagement/risk" element={
                <ProtectedRoute>
                  <Risk />
                </ProtectedRoute>
              } />

              <Route path="/iso27001" element={
                <ProtectedRoute>
                  <ISO27001 />
                </ProtectedRoute>
              } />

              <Route path="/controls/ControlsDashboard" element={
                <ProtectedRoute>
                  <ControlsDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/control-data" element={
                <ProtectedRoute>
                  <ControlData />
                </ProtectedRoute>
              } />

              <Route path="/vendor-management" element={
                <ProtectedRoute>
                  <VendorModule />
                </ProtectedRoute>
              }>
                <Route index element={<VendorDirectory />} />
                <Route path="vendor/:id" element={<VendorOnboardingDetail />} />
                <Route path="onboarding" element={<VendorOnboarding />} />
                <Route path="directory" element={<VendorDirectory />} />
                <Route path="due-diligence" element={<DueDiligenceForms />} />
                <Route path="risk-dashboard" element={<VendorRiskDashboard />} />
              </Route>

              <Route path="/audit-readiness" element={
                <ProtectedRoute>
                  <AuditReadinessDashboard />
                </ProtectedRoute>
              } />

              <Route path="/reports-analytics" element={
                <ProtectedRoute>
                  <ReportsAnalytics />
                </ProtectedRoute>
              } />

              <Route path="/cloud-integrations" element={
                <ProtectedRoute roles={['admin', 'super_admin']}>
                  <CloudIntegrations />
                </ProtectedRoute>
              } />
              
              <Route path="/AdminPanel" element={
                <ProtectedRoute roles={['user', 'admin', 'super_admin']}>
                  <AdminPanel />
                </ProtectedRoute>
              } />
              <Route path="/Departments" element={
                <ProtectedRoute >
                  <Departments />
                </ProtectedRoute>
              } /><Route path="/MyTasks" element={
                <ProtectedRoute >
                  <MyTasks />
                </ProtectedRoute>
              } />

              <Route path="/unauthorized" element={
                <Box p={8} textAlign="center">
                  <Heading mb={4}>Unauthorized Access</Heading>
                  <Text>You don't have permission to view this page.</Text>
                </Box>
              } />
              
              {/* 404 Page for any unmatched routes */}
              <Route path="*" element={
                <Box p={8} textAlign="center">
                  <Heading mb={4}>Page Not Found</Heading>
                  <Text>The page you're looking for doesn't exist.</Text>
                </Box>
              } />
            </Routes>
          </Box>
        </Box>
      </Flex>
    </Flex>
  );
}

export default App;