import React from "react";
import { Box, Heading, SimpleGrid, Text } from "@chakra-ui/react";
console.log("Home component rendered");
const Home = () => {
  return (
    <Box p={6}>
      <Heading mb={6} color="purple.700">GRCNova Dashboard</Heading>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
        <Box bg="white" boxShadow="md" p={5} borderRadius="xl">
          <Text fontSize="sm" color="gray.500">Active Users</Text>
          <Text fontSize="2xl" fontWeight="bold">153</Text>
        </Box>
        <Box bg="white" boxShadow="md" p={5} borderRadius="xl">
          <Text fontSize="sm" color="gray.500">Total Audits</Text>
          <Text fontSize="2xl" fontWeight="bold">27</Text>
        </Box>
        <Box bg="white" boxShadow="md" p={5} borderRadius="xl">
          <Text fontSize="sm" color="gray.500">Pending Reports</Text>
          <Text fontSize="2xl" fontWeight="bold">6</Text>
        </Box>
      </SimpleGrid>
    </Box>
  );
};

export default Home;