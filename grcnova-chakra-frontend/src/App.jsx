// src/App.jsx
import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Flex, Box } from "@chakra-ui/react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import PolicyEditor from "./pages/PolicyEditor";
import EvidenceCenter from "./pages/EvidenceCenter";
import RisksManagementDashboard from "./pages/RiskManagement/RisksManagementDashboard";
import Risk from "./pages/RiskManagement/Risk";
import Header from "./components/Header";
import ControlData from "./pages/ControlData";
import ISO27001 from "./pages/Controls/ISO27001";
import ControlsDashboard from "./pages/Controls/ControlsDashboard";
import AuditReadinessDashboard from "./pages/AuditReadinessDashboard";
import ReportsAnalytics from "./pages/ReportsAnalytics";
import CloudIntegrations from "./pages/CloudIntegrations";
// Vendor Management Imports
import VendorModule from "./pages/VendorManagement/VendorModule";
import VendorOnboarding from "./pages/VendorManagement/VendorOnboarding";
import VendorDirectory from "./pages/VendorManagement/VendorDirectory";
import DueDiligenceForms from "./pages/VendorManagement/DueDiligenceForms";
import VendorRiskDashboard from "./pages/VendorManagement/VendorRiskDashboard";

function App() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <Flex direction="column" minH="100vh" bg="gray.50">
      <Header toggleSidebar={() => setSidebarCollapsed(!isSidebarCollapsed)} />
      
      <Flex flex={1}>
        <Box 
          flexShrink={0} 
          w={isSidebarCollapsed ? "60px" : "220px"}
          transition="width 0.3s ease"
        >
          <Sidebar isCollapsed={isSidebarCollapsed} />
        </Box>
        
        <Box flex={1} minH="calc(100vh - 60px)" overflow="auto">
          <Box p={4} mx="auto" maxW="1200px">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/policy-editor" element={<PolicyEditor />} />
              <Route path="/evidence-center" element={<EvidenceCenter />} />
             <Route path="/RiskManagement">
  <Route path="RisksManagementDashboard" element={<RisksManagementDashboard />} />
  <Route path="Risk" element={<Risk />} />
</Route>
              <Route path="/ISO27001" element={<ISO27001 />} />
              <Route path="/ControlsDashboard" element={<ControlsDashboard />} />
              {/* Vendor Management Routes */}
              <Route path="/vendor-management" element={<VendorModule />}>
                <Route index element={<VendorDirectory />} />
                <Route path="onboarding" element={<VendorOnboarding />} />
                <Route path="directory" element={<VendorDirectory />} />
                <Route path="due-diligence" element={<DueDiligenceForms />} />
                <Route path="risk-dashboard" element={<VendorRiskDashboard />} />
              </Route>
              <Route path="/ControlData" element={<ControlData />} />
              <Route path="/AuditReadinessDashboard" element={<AuditReadinessDashboard />} />
<Route path="/ReportsAnalytics" element={<ReportsAnalytics />} />
<Route path="/CloudIntegrations" element={<CloudIntegrations />} />

              
            </Routes>
          </Box>
        </Box>
      </Flex>
    </Flex>
  );
}

export default App;