import { Box, Heading, Text, Button } from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext";

const Overview = () => {
  const { user, logout } = useAuth();

  return (
    <Box p={8}>
      <Heading mb={4}>Welcome, {user?.email}</Heading>
      <Text>Role: {user?.role}</Text>
      <Button mt={6} colorScheme="red" onClick={logout}>Logout</Button>
    </Box>
  );
};

export default Overview;