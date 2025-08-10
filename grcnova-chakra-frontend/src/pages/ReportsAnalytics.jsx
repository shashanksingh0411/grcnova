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
  SimpleGrid
} from '@chakra-ui/react';
import { FiDownload, FiMail } from 'react-icons/fi';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const ReportsAnalytics = () => {
  // Compliance Trends Data
  const complianceTrendsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'ISO 27001 Compliance',
        data: [65, 72, 78, 82, 88, 91],
        borderColor: '#3182CE',
        backgroundColor: 'rgba(49, 130, 206, 0.1)',
        tension: 0.3
      },
      {
        label: 'SOC 2 Compliance',
        data: [58, 65, 71, 79, 84, 89],
        borderColor: '#38A169',
        backgroundColor: 'rgba(56, 161, 105, 0.1)',
        tension: 0.3
      }
    ]
  };

  // Evidence Aging Data
  const evidenceAgingData = [
    { control: 'AC-1', framework: 'ISO 27001', evidenceType: 'Policy', age: 45, status: 'Valid' },
    { control: 'CC6.1', framework: 'SOC 2', evidenceType: 'Screenshot', age: 92, status: 'Expired' },
    { control: '164.312', framework: 'HIPAA', evidenceType: 'Log', age: 30, status: 'Valid' },
    { control: 'AC-2', framework: 'ISO 27001', evidenceType: 'Config', age: 60, status: 'Warning' }
  ];

  return (
    <Box p={6}>
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {/* Compliance Trends Report */}
        <Card>
          <CardHeader>
            <Flex justify="space-between" align="center">
              <Heading size="md">Compliance Trends</Heading>
              <Flex>
                <Button variant="ghost" leftIcon={<FiDownload />} mr={2}>
                  Export
                </Button>
                <Button variant="ghost" leftIcon={<FiMail />}>
                  Schedule
                </Button>
              </Flex>
            </Flex>
          </CardHeader>
          <CardBody>
            <Box h="300px">
              <Line 
                data={complianceTrendsData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom' }
                  }
                }}
              />
            </Box>
          </CardBody>
          <CardFooter>
            <Text fontSize="sm" color="gray.500">
              Shows monthly compliance progress across frameworks
            </Text>
          </CardFooter>
        </Card>

        {/* Evidence Aging Report */}
        <Card>
          <CardHeader>
            <Flex justify="space-between" align="center">
              <Heading size="md">Evidence Aging</Heading>
              <Flex>
                <Button variant="ghost" leftIcon={<FiDownload />} mr={2}>
                  Export
                </Button>
                <Button variant="ghost" leftIcon={<FiMail />}>
                  Schedule
                </Button>
              </Flex>
            </Flex>
          </CardHeader>
          <CardBody>
            <Box overflowX="auto">
              <Table variant="simple" minWidth="600px">
                <Thead>
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
                    <Tr key={index}>
                      <Td>{item.control}</Td>
                      <Td>{item.framework}</Td>
                      <Td>{item.evidenceType}</Td>
                      <Td isNumeric>{item.age}</Td>
                      <Td>
                        <Badge 
                          colorScheme={
                            item.status === 'Valid' ? 'green' :
                            item.status === 'Expired' ? 'red' : 'yellow'
                          }
                          whiteSpace="nowrap"  // Prevents badge text wrapping
                          minWidth="80px"     // Ensures consistent badge width
                          display="inline-flex" // Better alignment
                          justifyContent="center" // Center text
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
          <CardFooter>
            <Text fontSize="sm" color="gray.500">
              Lists evidence documents by age and validity status
            </Text>
          </CardFooter>
        </Card>
      </SimpleGrid>
    </Box>
  );
};

export default ReportsAnalytics;