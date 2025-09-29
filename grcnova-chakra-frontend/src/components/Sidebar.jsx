import { Box, VStack, Text, Flex, Tooltip, Icon, Collapse } from "@chakra-ui/react";
import {
  FiHome, FiFileText, FiDatabase, FiAlertTriangle, FiUsers,
  FiCheckSquare, FiBarChart2, FiCloud, FiShield, FiChevronDown, FiChevronRight,
  FiClipboard, FiList, FiGrid, FiUserPlus, FiShieldOff, FiAward, FiSettings,
  FiPieChart, FiAlertCircle, FiKey, FiUserCheck, FiUserX, FiMenu, FiLogOut, FiUser
} from "react-icons/fi";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../supabase"; 

const brandColor = "#8B5CF6"; // Brighter purple for better contrast
const hoverColor = "#A78BFA"; // Lighter purple for hover states
const bgColor = "#0F0B1D"; // Dark background
const groupBg = "rgba(255,255,255,0.03)"; // Slightly more visible group background
const textColor = "#E2E8F0"; // Softer white for text
const mutedTextColor = "#A0AEC0"; // Muted text color

const Sidebar = ({ isCollapsed = false, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [openMenus, setOpenMenus] = useState({
    vendors: location.pathname.includes("/vendor-management"),
    controls:
      location.pathname.includes("/ControlsDashboard") ||
      location.pathname.includes("/ISO27001") ||
      location.pathname.includes("/ControlData"),
    risks: location.pathname.includes("/RiskManagement"),
    settings: false,
  });

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      navigate("/login");
    }
  };

  const menuItems = [
    { icon: FiHome, label: "Dashboard", path: "/dashboard" },
    { icon: FiFileText, label: "Policies", path: "/policy-editor" },
    { icon: FiDatabase, label: "Evidence", path: "/evidence-center" },
    {
      icon: FiAlertTriangle,
      label: "Risk Management",
      mainPath: "/RiskManagement/RisksManagementDashboard",
      subItems: [
        { icon: FiPieChart, label: "Risk Dashboard", path: "/RiskManagement/RisksManagementDashboard" },
        { icon: FiAlertCircle, label: "Risks", path: "/RiskManagement/Risk" },
      ],
      menuKey: "risks",
    },
    {
      icon: FiShield,
      label: "Controls & Checklist",
      mainPath: "/ControlsDashboard",
      subItems: [
        { icon: FiGrid, label: "Control Dashboard", path: "/ControlsDashboard" },
        { icon: FiCheckSquare, label: "Control Checklist", path: "/ISO27001" },
        { icon: FiList, label: "Control Data", path: "/ControlData" },
      ],
      menuKey: "controls",
    },
    {
      icon: FiUsers,
      label: "Vendors Management",
      mainPath: "/vendor-management/directory",
      subItems: [
        { icon: FiUserPlus, label: "Vendor Onboarding", path: "/vendor-management/onboarding" },
        { icon: FiClipboard, label: "Vendor Directory", path: "/vendor-management/directory" },
        { icon: FiShieldOff, label: "Due Diligence", path: "/vendor-management/due-diligence" },
        { icon: FiAlertCircle, label: "Risk Dashboard", path: "/vendor-management/risk-dashboard" },
      ],
      menuKey: "vendors",
    },
    { icon: FiAward, label: "Audit Readiness", path: "/AuditReadinessDashboard" },
    { icon: FiBarChart2, label: "Reports & Analytics", path: "/reports-analytics" },
    { icon: FiCloud, label: "Cloud Integrations", path: "/CloudIntegrations" },
    { icon: FiSettings, label: "Admin Panel", path: "/AdminPanel" },
    { icon: FiSettings, label: "Task", path: "/MyTasks" },
    { icon: FiSettings, label: "Departments", path: "/Departments" },
    {
      icon: FiKey,
      label: "Super Admin",
      mainPath: "/super-admin",
      subItems: [
        { icon: FiUserCheck, label: "Onboard Client", path: "/super-admin/onboard-client" },
        { icon: FiUserX, label: "Client List", path: "/super-admin/client-list" },
      ],
      menuKey: "superadmin",
      requiredRole: "super_admin"
    },
    {
      icon: FiSettings,
      label: "Settings",
      mainPath: "/settings",
      subItems: [
        { icon: FiUser, label: "Profile", path: "/profile" },
        { icon: FiLogOut, label: "Logout", action: handleLogout },
      ],
      menuKey: "settings",
    },
  ];

  const getUserRole = () => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData).role : null;
    } catch {
      return null;
    }
  };

  const userRole = getUserRole();

  const handleMenuClick = (item) => {
    if (item.subItems) {
      if (isCollapsed) {
        navigate(item.mainPath);
      } else {
        setOpenMenus((prev) => ({
          ...prev,
          [item.menuKey]: !prev[item.menuKey],
        }));
        if (!openMenus[item.menuKey]) {
          navigate(item.mainPath);
        }
      }
    }
  };

  return (
    <Box
      bg={bgColor}
      w={isCollapsed ? "70px" : "260px"}
      h="calc(100vh - 60px)"
      p={isCollapsed ? 2 : 4}
      color={textColor}
      transition="all 0.3s ease"
      position="fixed"
      top="60px"
      left="0"
      borderRight="1px solid rgba(255,255,255,0.1)"
      overflowY="auto"
      zIndex="10"
      boxShadow="xl"
      css={{
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(255,255,255,0.15)',
          borderRadius: '3px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: 'rgba(255,255,255,0.25)',
        },
      }}
    >
      {/* Collapse Toggle Button */}
      {!isCollapsed && (
        <Flex 
          justify="flex-end" 
          mb={4} 
          display={{ base: "flex", md: "none" }}
        >
          <Icon 
            as={FiMenu} 
            boxSize={5} 
            onClick={onToggle} 
            cursor="pointer"
            color="gray.400"
            _hover={{ color: "white", transform: "scale(1.1)" }}
            transition="all 0.2s ease"
          />
        </Flex>
      )}

      <VStack spacing={1} align="stretch">
        {menuItems.map((item) => {
          if (item.requiredRole && userRole !== item.requiredRole) {
            return null;
          }
          
          const isActive = item.subItems
            ? location.pathname.includes(item.mainPath)
            : location.pathname === item.path;

          return (
            <Box key={item.path || item.mainPath}>
              <Tooltip 
                label={item.label} 
                placement="right" 
                isDisabled={!isCollapsed}
                hasArrow
                bg={brandColor}
                color="white"
                fontSize="xs"
                px={2}
                py={1}
                borderRadius="md"
              >
                <Flex
                  as={item.subItems ? "div" : NavLink}
                  to={!item.subItems ? item.path : undefined}
                  align="center"
                  p={3}
                  borderRadius="lg"
                  position="relative"
                  bg={isActive ? "rgba(139, 92, 246, 0.15)" : "transparent"}
                  _hover={{
                    bg: isActive ? "rgba(139, 92, 246, 0.2)" : "rgba(255,255,255,0.05)",
                  }}
                  transition="all 0.2s ease"
                  onClick={() => item.subItems && handleMenuClick(item)}
                  cursor="pointer"
                  sx={{
                    "&::before": isActive ? {
                      content: '""',
                      position: "absolute",
                      left: "0",
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "4px",
                      height: "70%",
                      bg: brandColor,
                      borderRadius: "0 2px 2px 0",
                    } : {}
                  }}
                >
                  <Icon 
                    as={item.icon} 
                    boxSize={5} 
                    mr={isCollapsed ? 0 : 3} 
                    color={isActive ? brandColor : mutedTextColor} 
                    transition="all 0.2s ease"
                    _groupHover={{ color: brandColor }}
                  />
                  {!isCollapsed && (
                    <>
                      <Text 
                        fontSize="sm" 
                        fontWeight="medium" 
                        flex={1} 
                        color={isActive ? "white" : textColor}
                        transition="color 0.2s ease"
                      >
                        {item.label}
                      </Text>
                      {item.subItems && (
                        <Icon
                          as={openMenus[item.menuKey] ? FiChevronDown : FiChevronRight}
                          boxSize={4}
                          color={isActive ? brandColor : mutedTextColor}
                          transition="all 0.2s ease"
                        />
                      )}
                    </>
                  )}
                </Flex>
              </Tooltip>

              {!isCollapsed && item.subItems && (
                <Collapse in={openMenus[item.menuKey]} animateOpacity>
                  <Box 
                    pl="44px" 
                    mt={1}
                    borderLeft="1px solid rgba(255,255,255,0.1)"
                    ml="12px"
                  >
                    {item.subItems.map((subItem) => {
                      const isSubActive = location.pathname === subItem.path;

                      return subItem.action ? (
                        <Flex
                          key={subItem.label}
                          align="center"
                          p={2}
                          borderRadius="md"
                          cursor="pointer"
                          onClick={subItem.action}
                          _hover={{ 
                            bg: "rgba(255,255,255,0.05)",
                            transform: "translateX(2px)"
                          }}
                          mb={1}
                          transition="all 0.2s ease"
                        >
                          <Icon 
                            as={subItem.icon} 
                            boxSize={4} 
                            mr={3} 
                            color="red.400" 
                          />
                          <Text 
                            fontSize="sm" 
                            color="red.400" 
                            fontWeight="medium"
                          >
                            {subItem.label}
                          </Text>
                        </Flex>
                      ) : (
                        <NavLink 
                          key={subItem.path} 
                          to={subItem.path} 
                          style={{ textDecoration: "none" }}
                        >
                          <Flex
                            align="center"
                            p={2}
                            borderRadius="md"
                            bg={isSubActive ? "rgba(139, 92, 246, 0.1)" : "transparent"}
                            _hover={{
                              bg: "rgba(255,255,255,0.05)",
                              transform: "translateX(2px)"
                            }}
                            mb={1}
                            transition="all 0.2s ease"
                          >
                            <Icon 
                              as={subItem.icon} 
                              boxSize={4} 
                              mr={3} 
                              color={isSubActive ? brandColor : mutedTextColor} 
                            />
                            <Text 
                              fontSize="sm" 
                              color={isSubActive ? "white" : mutedTextColor}
                              fontWeight={isSubActive ? "medium" : "normal"}
                            >
                              {subItem.label}
                            </Text>
                          </Flex>
                        </NavLink>
                      );
                    })}
                  </Box>
                </Collapse>
              )}
            </Box>
          );
        })}
      </VStack>
    </Box>
  );
};

export default Sidebar;