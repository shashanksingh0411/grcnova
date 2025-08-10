import React, { useState } from 'react';
import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Box,
  Heading,
  Text,
  Card,
  CardHeader,
  CardBody,
  Button,
  Flex,
  Stack,
  Input,
  FormControl,
  FormLabel,
  FormHelperText,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Progress,
  Alert,
  AlertIcon,
  Icon,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton
} from '@chakra-ui/react';
import { FiAlertCircle, FiCheckCircle, FiSettings, FiPlus, FiRefreshCw } from 'react-icons/fi';

const CloudIntegrations = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [awsCredentials, setAwsCredentials] = useState({
    accessKey: '',
    secretKey: '',
    region: 'us-east-1'
  });
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Mock security assessment results
  const [assessmentResults, setAssessmentResults] = useState([
    {
      service: 'S3 Buckets',
      status: 'critical',
      issues: 5,
      checked: 12,
      progress: 58
    },
    {
      service: 'IAM Policies',
      status: 'warning',
      issues: 3,
      checked: 18,
      progress: 83
    },
    {
      service: 'EC2 Security Groups',
      status: 'good',
      issues: 1,
      checked: 24,
      progress: 96
    }
  ]);

  const handleAwsConnect = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setAssessmentResults([
        ...assessmentResults,
        {
          service: 'RDS Instances',
          status: 'warning',
          issues: 2,
          checked: 8,
          progress: 75
        }
      ]);
      onClose();
    }, 2000);
  };

  const runSecurityScan = () => {
    setIsLoading(true);
    // Simulate scan
    setTimeout(() => {
      setIsLoading(false);
      setAssessmentResults(assessmentResults.map(item => ({
        ...item,
        checked: item.checked + 5,
        progress: Math.min(100, item.progress + 10)
      })));
    }, 3000);
  };

  return (
    <Box p={6}>
      <Heading size="xl" mb={6}>Cloud Service Integrations</Heading>
      
      <Tabs variant="enclosed" onChange={(index) => setActiveTab(index)}>
        <TabList>
          <Tab>
            <Icon as={FiSettings} mr={2} />
            AWS Security Assessment
          </Tab>
          <Tab>
            <Icon as={FiSettings} mr={2} />
            Azure Security
          </Tab>
          <Tab>
            <Icon as={FiSettings} mr={2} />
            GCP Security
          </Tab>
        </TabList>

        <TabPanels>
          {/* AWS Security Panel */}
          <TabPanel>
            <Card mb={6}>
              <CardHeader>
                <Flex justify="space-between" align="center">
                  <Heading size="md">AWS Security Status</Heading>
                  <Button 
                    leftIcon={<FiRefreshCw />} 
                    colorScheme="blue"
                    isLoading={isLoading}
                    onClick={runSecurityScan}
                  >
                    Run Security Scan
                  </Button>
                </Flex>
              </CardHeader>
              <CardBody>
                {assessmentResults.length === 0 ? (
                  <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    No AWS services connected. Add your AWS account to begin security assessment.
                  </Alert>
                ) : (
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Service</Th>
                        <Th>Status</Th>
                        <Th>Security Issues</Th>
                        <Th>Controls Checked</Th>
                        <Th>Progress</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {assessmentResults.map((service, index) => (
                        <Tr key={index}>
                          <Td fontWeight="medium">{service.service}</Td>
                          <Td>
                            <Badge 
                              colorScheme={
                                service.status === 'critical' ? 'red' :
                                service.status === 'warning' ? 'yellow' : 'green'
                              }
                              px={2}
                              py={1}
                              borderRadius="full"
                            >
                              {service.status.toUpperCase()}
                            </Badge>
                          </Td>
                          <Td>
                            <Flex align="center">
                              {service.issues > 0 ? (
                                <Icon as={FiAlertCircle} color="red.500" mr={2} />
                              ) : (
                                <Icon as={FiCheckCircle} color="green.500" mr={2} />
                              )}
                              {service.issues} issue{service.issues !== 1 ? 's' : ''}
                            </Flex>
                          </Td>
                          <Td>{service.checked} controls</Td>
                          <Td>
                            <Progress 
                              value={service.progress} 
                              colorScheme={
                                service.progress < 50 ? 'red' :
                                service.progress < 80 ? 'yellow' : 'green'
                              }
                              size="sm"
                              borderRadius="full"
                            />
                            <Text fontSize="sm" mt={1} textAlign="center">
                              {service.progress}%
                            </Text>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                )}
              </CardBody>
            </Card>

            <Button 
              leftIcon={<FiPlus />} 
              colorScheme="blue"
              onClick={onOpen}
            >
              Connect AWS Account
            </Button>
          </TabPanel>

          {/* Azure Security Panel */}
          <TabPanel>
            <Card>
              <CardHeader>
                <Heading size="md">Azure Security Center</Heading>
              </CardHeader>
              <CardBody>
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  Azure integration coming soon. Check back later!
                </Alert>
              </CardBody>
            </Card>
          </TabPanel>

          {/* GCP Security Panel */}
          <TabPanel>
            <Card>
              <CardHeader>
                <Heading size="md">Google Cloud Security</Heading>
              </CardHeader>
              <CardBody>
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  GCP integration coming soon. Check back later!
                </Alert>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* AWS Connection Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Connect AWS Account</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <Alert status="warning" borderRadius="md">
                <AlertIcon />
                Ensure your IAM user has SecurityAudit permissions
              </Alert>

              <FormControl>
                <FormLabel>AWS Access Key ID</FormLabel>
                <Input 
                  placeholder="AKIAXXXXXXXXXXXXXXXX"
                  value={awsCredentials.accessKey}
                  onChange={(e) => setAwsCredentials({...awsCredentials, accessKey: e.target.value})}
                />
              </FormControl>

              <FormControl>
                <FormLabel>AWS Secret Access Key</FormLabel>
                <Input 
                  type="password"
                  placeholder="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                  value={awsCredentials.secretKey}
                  onChange={(e) => setAwsCredentials({...awsCredentials, secretKey: e.target.value})}
                />
              </FormControl>

              <FormControl>
                <FormLabel>AWS Region</FormLabel>
                <Input 
                  value={awsCredentials.region}
                  onChange={(e) => setAwsCredentials({...awsCredentials, region: e.target.value})}
                />
                <FormHelperText>Default: us-east-1</FormHelperText>
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleAwsConnect}
              isLoading={isLoading}
            >
              Connect AWS Account
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CloudIntegrations;