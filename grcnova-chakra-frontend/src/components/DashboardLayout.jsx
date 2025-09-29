// src/components/DashboardLayout.js
import { Flex, Box } from '@chakra-ui/react';
import Sidebar from './Sidebar';
//import Header from './Header';

export default function DashboardLayout({ children }) {
  return (
    <Flex h="100vh">
      <Sidebar />
      <Box flex="1" overflow="auto">
        <Header />
        <Box p={6}>{children}</Box>
      </Box>
    </Flex>
  );
}