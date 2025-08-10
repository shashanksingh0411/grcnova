import { Box, Flex, Heading, Spacer, Button } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const DashboardLayout = () => {
  const { logout } = useAuth();

  return (
    <Box>
      <Flex
        p={4}
        bg="purple.700"
        color="white"
        align="center"
        justify="space-between"
      >
        <Heading size="md">GRCNova Dashboard</Heading>
        <Spacer />
        <Button onClick={logout} colorScheme="red" variant="outline">
          Logout
        </Button>
      </Flex>

      <Box p={6}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default DashboardLayout;