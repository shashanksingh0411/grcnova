import React from 'react';
import {
  Box,
  Heading,
  Text,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  SimpleGrid,
  useColorModeValue,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  HStack,
  Progress,
  Select,
  Divider
} from '@chakra-ui/react';
import { FiDownload, FiMail, FiMoreVertical, FiChevronDown, FiFilter } from 'react-icons/fi';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const ReportsAnalytics = () => {
  // Color mode values
  const cardBg = useColorModeValue('white', 'gray.800');
  const tableHeaderBg = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const headingColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Compliance Trends Data
  const complianceTrendsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'ISO 27001 Compliance',
        data: [65, 72, 78, 82, 88, 91],
        borderColor: '#3182CE',
        backgroundColor: 'rgba(49, 130, 206, 0.1)',
        fill: true,
        tension: 0.3,
        pointBackgroundColor: '#3182CE',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4
      },
      {
        label: 'SOC 2 Compliance',
        data: [58, 65, 71, 79, 84, 89],
        borderColor: '#38A169',
        backgroundColor: 'rgba(56, 161, 105, 0.1)',
        fill: true,
        tension: 0.3,
        pointBackgroundColor: '#38A169',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4
      }
    ]
  };

  // Evidence Aging Data
  const evidenceAgingData = [
    { control: 'AC-1', framework: 'ISO 27001', evidenceType: 'Policy Document', age: 45, status: 'Valid' },
    { control: 'CC6.1', framework: 'SOC 2', evidenceType: 'System Screenshot', age: 92, status: 'Expired' },
    { control: '164.312', framework: 'HIPAA', evidenceType: 'Access Log', age: 30, status: 'Valid' },
    { control: 'AC-2', framework: 'ISO 27001', evidenceType: 'Configuration', age: 60, status: 'Warning' },
    { control: 'PI-1', framework: 'GDPR', evidenceType: 'Process Documentation', age: 85, status: 'Expired' }
  ];

  // Chart options with better styling
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      title: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        min: 50,
        max: 100,
        grid: {
          drawBorder: false
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    elements: {
      line: {
        tension: 0.3
      }
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Valid': return 'green';
      case 'Expired': return 'red';
      case 'Warning': return 'orange';
      default: return 'gray';
    }
  };

  return (
    <Box p={8}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg" color={headingColor}>Compliance Reports & Analytics</Heading>
        <HStack spacing={3}>
          <Select size="sm" width="180px" icon={<FiChevronDown />}>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>Year to date</option>
            <option>Custom range</option>
          </Select>
          <Button leftIcon={<FiFilter />} size="sm" variant="outline">
            Filters
          </Button>
        </HStack>
      </Flex>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {/* Compliance Trends Report */}
        <Card bg={cardBg} boxShadow="md" borderRadius="lg" overflow="hidden">
          <CardHeader pb={2}>
            <Flex justify="space-between" align="center">
              <Heading size="md">Compliance Trends</Heading>
              <Menu>
                <MenuButton 
                  as={IconButton} 
                  icon={<FiMoreVertical />} 
                  variant="ghost" 
                  size="sm" 
                  aria-label="Options"
                />
                <MenuList>
                  <MenuItem icon={<FiDownload />}>Export as PDF</MenuItem>
                  <MenuItem icon={<FiDownload />}>Export as CSV</MenuItem>
                  <MenuItem icon={<FiMail />}>Schedule Report</MenuItem>
                </MenuList>
              </Menu>
            </Flex>
            <Text fontSize="sm" color={textColor} mt={1}>
              Monthly compliance progress across frameworks
            </Text>
          </CardHeader>
          <Divider color={borderColor} />
          <CardBody>
            <Box h="300px">
              <Line data={complianceTrendsData} options={chartOptions} />
            </Box>
          </CardBody>
          <CardFooter pt={0}>
            <Flex width="100%" justify="space-between" align="center" fontSize="sm">
              <Text color={textColor}>Updated 2 hours ago</Text>
              <Button size="sm" colorScheme="blue" variant="outline">
                View Full Report
              </Button>
            </Flex>
          </CardFooter>
        </Card>

        {/* Evidence Aging Report */}
        <Card bg={cardBg} boxShadow="md" borderRadius="lg" overflow="hidden">
          <CardHeader pb={2}>
            <Flex justify="space-between" align="center">
              <Heading size="md">Evidence Aging</Heading>
              <Menu>
                <MenuButton 
                  as={IconButton} 
                  icon={<FiMoreVertical />} 
                  variant="ghost" 
                  size="sm" 
                  aria-label="Options"
                />
                <MenuList>
                  <MenuItem icon={<FiDownload />}>Export as PDF</MenuItem>
                  <MenuItem icon={<FiDownload />}>Export as CSV</MenuItem>
                  <MenuItem icon={<FiMail />}>Schedule Report</MenuItem>
                </MenuList>
              </Menu>
            </Flex>
            <Text fontSize="sm" color={textColor} mt={1}>
              Evidence documents by age and validity status
            </Text>
          </CardHeader>
          <Divider color={borderColor} />
          <CardBody>
            <Box overflowX="auto">
              <Table variant="simple" minWidth="700px">
                <Thead bg={tableHeaderBg}>
                  <Tr>
                    <Th>CONTROL</Th>
                    <Th>FRAMEWORK</Th>
                    <Th>EVIDENCE TYPE</Th>
                    <Th isNumeric>AGE (DAYS)</Th>
                    <Th>STATUS</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {evidenceAgingData.map((item, index) => (
                    <Tr key={index} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                      <Td fontWeight="medium">{item.control}</Td>
                      <Td>
                        <Badge colorScheme="blue" variant="subtle">
                          {item.framework}
                        </Badge>
                      </Td>
                      <Td>{item.evidenceType}</Td>
                      <Td isNumeric>
                        <Flex align="center" justify="flex-end">
                          <Text mr={2}>{item.age}</Text>
                          <Progress 
                            value={item.age} 
                            max={90} 
                            width="60px" 
                            size="sm" 
                            colorScheme={
                              item.age < 30 ? "green" : 
                              item.age < 60 ? "orange" : "red"
                            }
                            borderRadius="full"
                          />
                        </Flex>
                      </Td>
                      <Td>
                        <Badge 
                          colorScheme={getStatusColor(item.status)}
                          variant="solid"
                          px={2}
                          py={1}
                          borderRadius="md"
                        >
                          {item.status.toUpperCase()}
                        </Badge>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </CardBody>
          <CardFooter pt={0}>
            <Flex width="100%" justify="space-between" align="center" fontSize="sm">
              <Text color={textColor}>Showing 5 of 127 items</Text>
              <Button size="sm" colorScheme="blue" variant="outline">
                View All Evidence
              </Button>
            </Flex>
          </CardFooter>
        </Card>
      </SimpleGrid>
    </Box>
  );
};

export default ReportsAnalytics;