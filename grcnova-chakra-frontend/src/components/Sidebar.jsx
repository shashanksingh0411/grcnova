import { Box, VStack, IconButton, Tooltip, Text, Flex, Collapse } from "@chakra-ui/react";
import { 
  FiHome, 
  FiFileText, 
  FiDatabase, 
  FiAlertTriangle, 
  FiUsers,
  FiCheckSquare,
  FiBarChart2,
  FiCloud,
  FiShield,
  FiChevronDown, 
  FiChevronRight,
  FiClipboard,
  FiList,
  FiGrid,
  FiUserPlus,
  FiBook,
  FiShieldOff,
  FiActivity,
  FiSettings,
  FiLock,
  FiAward,
  FiPieChart,
  FiAlertCircle
} from "react-icons/fi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

const Sidebar = ({ isCollapsed = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [openMenus, setOpenMenus] = useState({
    vendors: location.pathname.includes("/vendor-management"),
    controls: location.pathname.includes("/ControlsDashboard") || 
              location.pathname.includes("/ISO27001") ||
              location.pathname.includes("/ControlData"),
    risks: location.pathname.includes("/RiskManagement") // Added risk management menu state
  });

  const navItems = [
    { icon: FiHome, label: "Dashboard", path: "/dashboard" },
    { icon: FiFileText, label: "Policies", path: "/policy-editor" },
    { icon: FiDatabase, label: "Evidence", path: "/evidence-center" },
    
    // Updated Risk Management as a module with submodules
    { 
      icon: FiAlertTriangle, 
      label: "Risk Management", 
      mainPath: "/RisksManagementDashboard",
      subItems: [
        { icon: FiPieChart, label: "Risk Dashboard", path: "/RiskManagement/RisksManagementDashboard" },
        { icon: FiAlertCircle, label: "Risks", path: "/RiskManagement/Risk" },
      ],
      menuKey: "risks"
    },
    
    { 
      icon: FiShield, 
      label: "Controls & Checklist", 
      mainPath: "/ControlsDashboard",
      subItems: [
        { icon: FiActivity, label: "Control Dashboard", path: "/ControlsDashboard" },
        { icon: FiCheckSquare, label: "Control Checklist", path: "/ISO27001" },
        { icon: FiGrid, label: "Control Data", path: "/ControlData" },
      ],
      menuKey: "controls"
    },
    
    { 
      icon: FiUsers, 
      label: "Vendors Management", 
      mainPath: "/vendor-management/directory",
      subItems: [
        { icon: FiUserPlus, label: "Vendor Onboarding", path: "/vendor-management/onboarding" },
        { icon: FiList, label: "Vendor Directory", path: "/vendor-management/directory" },
        { icon: FiClipboard, label: "Due Diligence", path: "/vendor-management/due-diligence" },
        { icon: FiShieldOff, label: "Risk Dashboard", path: "/vendor-management/risk-dashboard" }
      ],
      menuKey: "vendors"
    },
    { icon: FiAward, label: "Audit Readiness", path: "/AuditReadinessDashboard" },
    { icon: FiBarChart2, label: "Reports & Analytics", path: "/ReportsAnalytics" },
    { icon: FiCloud, label: "Cloud Integrations", path: "/CloudIntegrations" },
    { icon: FiSettings, label: "VAPT Tool", path: "" },
  ];

  const handleMenuClick = (item) => {
    if (item.subItems) {
      if (isCollapsed) {
        navigate(item.mainPath);
      } else {
        setOpenMenus(prev => ({
          ...prev,
          [item.menuKey]: !prev[item.menuKey]
        }));
        if (!openMenus[item.menuKey]) {
          navigate(item.mainPath);
        }
      }
    }
  };

  return (
    <Box 
      bg="#3a0b48ff" 
      w={isCollapsed ? "60px" : "250px"} 
      h="100%"
      p={3} 
      color="white"
      transition="width 0.3s ease"
    >
      <VStack spacing={2} align="stretch" h="100%">
        {navItems.map((item) => (
          <Box key={item.path || item.mainPath}>
            <Tooltip label={item.label} placement="right" isDisabled={!isCollapsed}>
              <Flex
                as={item.subItems ? 'div' : Link}
                to={!item.subItems ? item.path : undefined}
                align="center"
                p={2}
                borderRadius="md"
                bg={
                  (item.subItems 
                    ? location.pathname.includes(item.mainPath)
                    : location.pathname === item.path)
                    ? "rgba(255, 255, 255, 0.16)" 
                    : "transparent"
                }
                _hover={{ bg: "rgba(255,255,255,0.1)" }}
                onClick={() => item.subItems && handleMenuClick(item)}
                cursor="pointer"
              >
                <IconButton
                  icon={<item.icon />}
                  isRound
                  variant="ghost"
                  aria-label={item.label}
                  color="white"
                  _hover={{ bg: "transparent" }}
                  mr={isCollapsed ? 0 : 3}
                />
                {!isCollapsed && (
                  <>
                    <Text fontSize="sm" fontWeight="medium" flex={1}>
                      {item.label}
                    </Text>
                    {item.subItems && (
                      openMenus[item.menuKey] ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />
                    )}
                  </>
                )}
              </Flex>
            </Tooltip>

            {!isCollapsed && item.subItems && (
              <Collapse in={openMenus[item.menuKey]}>
                <VStack spacing={1} align="stretch" pl="44px">
                  {item.subItems.map((subItem) => (
                    <Link 
                      key={subItem.path} 
                      to={subItem.path}
                      style={{ textDecoration: 'none' }}
                    >
                      <Flex
                        align="center"
                        p={2}
                        borderRadius="md"
                        bg={location.pathname === subItem.path ? "rgba(255,255,255,0.2)" : "transparent"}
                        _hover={{ bg: "rgba(255,255,255,0.1)" }}
                      >
                        <IconButton
                          icon={<subItem.icon />}
                          isRound
                          variant="ghost"
                          aria-label={subItem.label}
                          color="white"
                          _hover={{ bg: "transparent" }}
                          mr={3}
                          size="xs"
                        />
                        <Text fontSize="sm">
                          {subItem.label}
                        </Text>
                      </Flex>
                    </Link>
                  ))}
                </VStack>
              </Collapse>
            )}
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default Sidebar;