import React, { useState } from 'react';
import {
  Box,
  Flex,
  Grid,
  GridItem,
  Heading,
  Select,
  Text,
  useColorModeValue,
  Tag,
  TagLabel,
  Progress,
  Stack,
  Badge,
  HStack,
  VStack,
  Divider,
  useToast,
  Button
} from '@chakra-ui/react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Sample risk data
const riskData = [
  { name: 'Jan', high: 12, medium: 8, low: 4 },
  { name: 'Feb', high: 19, medium: 6, low: 3 },
  { name: 'Mar', high: 15, medium: 10, low: 5 },
  { name: 'Apr', high: 8, medium: 12, low: 7 },
  { name: 'May', high: 5, medium: 9, low: 11 },
];

const RiskManagementDashboard = () => {
  const toast = useToast();
  const [timeRange, setTimeRange] = useState('6m');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Filter data based on time range
  const filteredData = riskData.slice(0, 
    timeRange === '3m' ? 3 : 
    timeRange === '6m' ? 6 : 
    riskData.length
  );

  const topRisks = [
    { id: 1, name: 'Phishing Attacks', severity: 'High', progress: 65, controls: ['A.12.4'] },
    { id: 2, name: 'Misconfigured Cloud', severity: 'High', progress: 40, controls: ['A.13.2'] },
    { id: 3, name: 'Outdated Software', severity: 'Medium', progress: 80, controls: ['A.12.6'] },
  ];

  const controlCoverage = [
    { name: 'Implemented', value: 75, color: 'green.400' },
    { name: 'In Progress', value: 15, color: 'yellow.400' },
    { name: 'Not Started', value: 10, color: 'red.400' },
  ];

  const handleRiskAction = (riskId, action) => {
    toast({
      title: `Risk ${action}`,
      description: `Risk ID ${riskId} has been ${action.toLowerCase()}.`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box p={6}>
      <Flex justify="space-between" align="center" mb={8}>
        <Heading size="xl">Risk Management Dashboard</Heading>
        <Select 
          width="200px"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          bg={cardBg}
          borderColor={borderColor}
        >
          <option value="3m">Last 3 Months</option>
          <option value="6m">Last 6 Months</option>
          <option value="12m">Last 12 Months</option>
        </Select>
      </Flex>

      <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6} mb={8}>
        {/* Risk Distribution Pie Chart */}
        <GridItem>
          <Box bg={cardBg} p={4} borderRadius="lg" borderWidth="1px" borderColor={borderColor} h="100%">
            <Text fontSize="lg" fontWeight="bold" mb={4}>Risk Distribution</Text>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={controlCoverage}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {controlCoverage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </GridItem>

        {/* Risk Trend Line Chart */}
        <GridItem>
          <Box bg={cardBg} p={4} borderRadius="lg" borderWidth="1px" borderColor={borderColor} h="100%">
            <Text fontSize="lg" fontWeight="bold" mb={4}>Risk Trend</Text>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="high" stroke="#E53E3E" name="High" />
                <Line type="monotone" dataKey="medium" stroke="#D69E2E" name="Medium" />
                <Line type="monotone" dataKey="low" stroke="#38A169" name="Low" />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </GridItem>

        {/* Risk by Category Bar Chart */}
        <GridItem>
          <Box bg={cardBg} p={4} borderRadius="lg" borderWidth="1px" borderColor={borderColor} h="100%">
            <Text fontSize="lg" fontWeight="bold" mb={4}>Risk by Category</Text>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="high" fill="#E53E3E" name="High" />
                <Bar dataKey="medium" fill="#D69E2E" name="Medium" />
                <Bar dataKey="low" fill="#38A169" name="Low" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </GridItem>
      </Grid>

      {/* Top Risks Section */}
      <Box bg={cardBg} p={4} borderRadius="lg" borderWidth="1px" borderColor={borderColor} mb={8}>
        <Flex justify="space-between" align="center" mb={4}>
          <Text fontSize="lg" fontWeight="bold">Top Risks</Text>
          <Button colorScheme="blue" size="sm">Add New Risk</Button>
        </Flex>
        
        <Stack spacing={4}>
          {topRisks.map((risk) => (
            <Box key={risk.id}>
              <Flex justify="space-between" mb={2}>
                <HStack>
                  <Text fontWeight="medium">{risk.name}</Text>
                  <Badge 
                    colorScheme={
                      risk.severity === 'High' ? 'red' : 
                      risk.severity === 'Medium' ? 'orange' : 'green'
                    }
                  >
                    {risk.severity}
                  </Badge>
                  <HStack>
                    {risk.controls.map(control => (
                      <Tag key={control} size="sm" colorScheme="blue">
                        {control}
                      </Tag>
                    ))}
                  </HStack>
                </HStack>
                <Text fontSize="sm">{risk.progress}% mitigated</Text>
              </Flex>
              <Progress 
                value={risk.progress} 
                size="sm" 
                colorScheme={
                  risk.progress > 75 ? 'green' : 
                  risk.progress > 40 ? 'yellow' : 'red'
                }
              />
              <Flex justify="flex-end" mt={2} gap={2}>
                <Button size="xs" onClick={() => handleRiskAction(risk.id, 'Mitigated')}>
                  Mark Mitigated
                </Button>
                <Button size="xs" variant="outline" onClick={() => handleRiskAction(risk.id, 'Accepted')}>
                  Accept Risk
                </Button>
              </Flex>
              <Divider mt={4} />
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Risk Actions Section */}
      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
        <GridItem>
          <Box bg={cardBg} p={4} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
            <Text fontSize="lg" fontWeight="bold" mb={4}>Recent Risk Actions</Text>
            <VStack spacing={3} align="stretch">
              <Box>
                <Text fontSize="sm" color="gray.500">Today, 10:45 AM</Text>
                <Text>Phishing risk marked as mitigated</Text>
              </Box>
              <Box>
                <Text fontSize="sm" color="gray.500">Yesterday, 3:30 PM</Text>
                <Text>New cloud configuration risk identified</Text>
              </Box>
              <Box>
                <Text fontSize="sm" color="gray.500">Oct 12, 9:15 AM</Text>
                <Text>Quarterly risk assessment completed</Text>
              </Box>
            </VStack>
          </Box>
        </GridItem>

        <GridItem>
          <Box bg={cardBg} p={4} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
            <Text fontSize="lg" fontWeight="bold" mb={4}>Risk Statistics</Text>
            <VStack spacing={4}>
              <Flex w="100%" justify="space-between">
                <Text>Total Risks Identified:</Text>
                <Text fontWeight="bold">42</Text>
              </Flex>
              <Flex w="100%" justify="space-between">
                <Text>High Severity Risks:</Text>
                <Text fontWeight="bold" color="red.500">15</Text>
              </Flex>
              <Flex w="100%" justify="space-between">
                <Text>Risks Mitigated:</Text>
                <Text fontWeight="bold" color="green.500">28 (67%)</Text>
              </Flex>
              <Flex w="100%" justify="space-between">
                <Text>Open Risks Overdue:</Text>
                <Text fontWeight="bold" color="orange.500">5</Text>
              </Flex>
            </VStack>
          </Box>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default RiskManagementDashboard;