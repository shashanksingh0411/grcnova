import React from 'react';
import { Box, Flex, Text, Heading, Badge, Table, Thead, Tbody, Tr, Th, Td, Button } from '@chakra-ui/react';
import { BarChart, PieChart } from './Charts';

const ControlsDashboard = () => {
  // Mock data
  const frameworks = [
    { name: 'ISO 27001', total: 114, implemented: 98, color: 'rgba(59, 130, 246, 0.7)' },
    { name: 'SOC 2', total: 42, implemented: 38, color: 'rgba(16, 185, 129, 0.7)' },
    { name: 'HIPAA', total: 30, implemented: 26, color: 'rgba(245, 158, 11, 0.7)' }
  ];

  const categories = [
    { name: 'Access Control', iso: 95, soc2: 92, hipaa: 90 },
    { name: 'Risk Management', iso: 80, soc2: 100, hipaa: 75 },
    { name: 'Incident Response', iso: 100, soc2: 85, hipaa: 95 },
    { name: 'Data Protection', iso: 90, soc2: 95, hipaa: 70 },
    { name: 'Audit & Accountability', iso: 75, soc2: 100, hipaa: 100 }
  ];

  const actions = [
    { id: 1, title: 'ISO 27001 - Risk Assessment Update', status: 'overdue' },
    { id: 2, title: 'HIPAA - Data Encryption Gaps', status: 'due', date: '2023-12-15' },
    { id: 3, title: 'SOC 2 - Vendor Management Policy Review', status: 'in-progress' }
  ];

  const deadlines = [
    { name: 'ISO 27001 Recertification', date: '2024-03-15' },
    { name: 'SOC 2 Type 2 Audit', date: '2024-02-20' },
    { name: 'HIPAA Annual Review', date: '2024-01-30' }
  ];

  // Calculate overall compliance
  const totalImplemented = frameworks.reduce((sum, f) => sum + f.implemented, 0);
  const totalControls = frameworks.reduce((sum, f) => sum + f.total, 0);
  const compliancePercentage = Math.round((totalImplemented / totalControls) * 100);

  return (
    <Box bg="gray.50" p={6} borderRadius="lg" boxShadow="md">
      <Box mb={8}>
        <Heading as="h1" size="lg" color="gray.800">Compliance Dashboard</Heading>
        <Flex justify="space-between" alignItems="center" mt={2}>
          <Text fontSize="sm" color="gray.500">
            Last Updated: {new Date().toLocaleDateString()}
          </Text>
          <Badge px={4} py={2} borderRadius="full" bg="white" boxShadow="sm">
            <Text as="span" fontWeight="semibold">Overall Compliance:</Text>
            <Text as="span" ml={2} color="blue.600" fontWeight="bold">
              {compliancePercentage}% Complete
            </Text>
            <Text as="span" color="gray.500" ml={2}>
              ({totalImplemented}/{totalControls} Controls)
            </Text>
          </Badge>
        </Flex>
      </Box>

      <Flex direction={{ base: 'column', lg: 'row' }} gap={6} mb={8}>
        {/* Framework Overview */}
        <Box bg="white" p={4} borderRadius="lg" boxShadow="md" flex={1}>
          <Heading as="h2" size="md" mb={4}>Framework Overview</Heading>
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr borderBottom="1px">
                  <Th textAlign="left">Framework</Th>
                  <Th textAlign="right">Implemented</Th>
                  <Th textAlign="right">%</Th>
                </Tr>
              </Thead>
              <Tbody>
                {frameworks.map((fw) => (
                  <Tr key={fw.name} borderBottom="1px">
                    <Td>{fw.name}</Td>
                    <Td textAlign="right">
                      {fw.implemented}/{fw.total}
                    </Td>
                    <Td textAlign="right">
                      <Text fontWeight="medium">
                        {Math.round((fw.implemented / fw.total) * 100)}%
                      </Text>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>

        {/* Control Categories */}
        <Box bg="white" p={4} borderRadius="lg" boxShadow="md" flex={1}>
          <Heading as="h2" size="md" mb={4}>Control Categories Status</Heading>
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr borderBottom="1px">
                  <Th textAlign="left">Category</Th>
                  <Th textAlign="center">ISO</Th>
                  <Th textAlign="center">SOC2</Th>
                  <Th textAlign="center">HIPAA</Th>
                </Tr>
              </Thead>
              <Tbody>
                {categories.map((cat) => (
                  <Tr key={cat.name} borderBottom="1px">
                    <Td>{cat.name}</Td>
                    {[cat.iso, cat.soc2, cat.hipaa].map((val, i) => (
                      <Td key={i} textAlign="center">
                        <Badge 
                          px={2} 
                          colorScheme={
                            val >= 90 ? 'green' :
                            val >= 70 ? 'yellow' : 'red'
                          }
                        >
                          {val}%
                        </Badge>
                      </Td>
                    ))}
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>

        {/* Quick Actions */}
        <Box bg="white" p={4} borderRadius="lg" boxShadow="md" flex={1}>
          <Heading as="h2" size="md" mb={4}>Quick Actions</Heading>
          <Flex direction="column" gap={3}>
            <Button colorScheme="blue">View Full Checklist</Button>
            <Button colorScheme="green">Generate Report</Button>
            <Button colorScheme="purple">Assign Remediation Tasks</Button>
          </Flex>
        </Box>
      </Flex>

      {/* Priority Items and Deadlines */}
      <Flex direction={{ base: 'column', lg: 'row' }} gap={6} mb={8}>
        {/* Priority Items */}
        <Box bg="white" p={4} borderRadius="lg" boxShadow="md" flex={1}>
          <Heading as="h2" size="md" mb={4}>Priority Action Items</Heading>
          <Flex direction="column" gap={3}>
            {actions.map((action) => (
              <Flex key={action.id} alignItems="flex-start">
                <Box
                  mt={1}
                  mr={2}
                  h={3}
                  w={3}
                  borderRadius="full"
                  bg={
                    action.status === 'overdue' ? 'red.500' :
                    action.status === 'due' ? 'yellow.500' : 'blue.500'
                  }
                />
                <Box>
                  <Text fontWeight="medium">{action.title}</Text>
                  {action.date && (
                    <Text fontSize="sm" color="gray.500">Due: {action.date}</Text>
                  )}
                </Box>
              </Flex>
            ))}
          </Flex>
        </Box>

        {/* Upcoming Deadlines */}
        <Box bg="white" p={4} borderRadius="lg" boxShadow="md" flex={1}>
          <Heading as="h2" size="md" mb={4}>Upcoming Deadlines</Heading>
          <Flex direction="column" gap={3}>
            {deadlines.map((deadline, i) => (
              <Flex key={i} justify="space-between" alignItems="center" pb={2} borderBottom="1px" borderColor="gray.100">
                <Text>{deadline.name}</Text>
                <Badge bg="gray.100" px={2} py={1} borderRadius="md" fontSize="sm">
                  {deadline.date}
                </Badge>
              </Flex>
            ))}
          </Flex>
        </Box>
      </Flex>

      {/* Charts Section */}
      <Box bg="white" p={4} borderRadius="lg" boxShadow="md">
        <Heading as="h2" size="md" mb={4}>Compliance Progress</Heading>
        <Flex direction={{ base: 'column', md: 'row' }} gap={6}>
          <Box flex={1}>
            <Text textAlign="center" fontWeight="medium" mb={2}>Framework Comparison</Text>
            <Box height="300px">
              <BarChart data={frameworks} />
            </Box>
          </Box>
          <Box flex={1}>
            <Text textAlign="center" fontWeight="medium" mb={2}>Control Categories</Text>
            <Box height="300px">
              <PieChart data={categories} />
            </Box>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
};

export default ControlsDashboard;