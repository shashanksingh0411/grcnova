import { Box, Flex, VStack, Text, Button } from "@chakra-ui/react";
import { NavLink, useNavigate } from "react-router-dom";

const navItems = [
  { label: "Dashboard", path: "/" },
  { label: "Projects", path: "/projects" },
  { label: "Settings", path: "/settings" },
];

export default function Layout({ children }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  return ( 
    <Flex minH="100vh" bg="purple.50" direction="row">
      {/* Sidebar */}
      <Box
        w={{ base: "0", md: "220px" }}
        bg="purple.700"
        color="white"
        p={5}
        display={{ base: "none", md: "block" }}
        flexShrink={0} // Prevent shrinking sidebar
      >
        <VStack align="start" spacing={6}>
          <Text fontSize="2xl" fontWeight="bold" mb={10}>
            GRCNOVA
          </Text>
          {navItems.map(({ label, path }) => (
            <NavLink
              key={path}
              to={path}
              style={({ isActive }) => ({
                fontWeight: isActive ? "bold" : "normal",
                textDecoration: "none",
                color: "white",
                width: "100%",
              })}
            >
              {label}
            </NavLink>
          ))}
        </VStack>
      </Box>

      {/* Main content */}
      <Flex direction="column" flex="1" p={6} overflow="auto">
        {/* Header */}
        <Flex justify="flex-end" mb={4}>
          <Button colorScheme="purple" variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </Flex>

        {/* Page Content */}
        <Box flex="1" overflow="auto">
          {children}
        </Box>
      </Flex>
    </Flex>
  );
}