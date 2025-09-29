// src/pages/VendorManagement/VendorDashboard.jsx
import React, { useState, useEffect } from "react";
import DueDiligenceForms from "./DueDiligenceForms";

import {
  Box,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Text,
  Tag,
  Progress,
  Heading,
  Flex,
  Icon,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  InputGroup,
  InputLeftElement,
  Stack,
  Spinner,
  Center,
  Badge,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Grid,
  GridItem,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  List,
  ListItem,
  ListIcon,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Divider,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Checkbox,
  CheckboxGroup,
  HStack,
  useToast,
  Editable,
  EditableInput,
  EditablePreview,
  IconButton
} from "@chakra-ui/react";
import {
  FiSearch,
  FiServer,
  FiMail,
  FiBarChart2,
  FiChevronRight,
  FiFilter,
  FiShield,
  FiAlertTriangle,
  FiCheckCircle,
  FiPlus,
  FiInfo,
  FiTrendingUp,
  FiTrendingDown,
  FiActivity,
  FiClipboard,
  FiFileText,
  FiUserCheck,
  FiCheckSquare,
  FiXCircle,
  FiClock,
  FiMoreVertical,
  FiEdit,
  FiSave,
  FiX
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase";

// Due Diligence Configuration
const dueDiligenceConfig = {
  'Low Risk': {
    color: 'green',
    actions: [
      { id: 1, name: 'Automated identity verification', completed: false },
      { id: 2, name: 'Basic adverse media search', completed: false },
      { id: 3, name: 'Standard questionnaire completion', completed: false },
      { id: 4, name: 'Review publicly available information', completed: false }
    ],
    workflow: 'Auto-approval if checks pass',
    requiredApproval: 'None',
    timeline: '1-2 business days'
  },
  'Medium Risk': {
    color: 'orange',
    actions: [
      { id: 1, name: 'All Low Risk actions', completed: false },
      { id: 2, name: 'Manual document review', completed: false },
      { id: 3, name: 'Deeper adverse media search', completed: false },
      { id: 4, name: 'PEP and sanctions screening', completed: false },
      { id: 5, name: 'Enhanced questionnaire', completed: false }
    ],
    workflow: 'Assign to Compliance Team',
    requiredApproval: 'Team Lead',
    timeline: '3-5 business days'
  },
  'High Risk': {
    color: 'red',
    actions: [
      { id: 1, name: 'All Medium Risk actions', completed: false },
      { id: 2, name: 'Mandatory manual investigation', completed: false },
      { id: 3, name: 'Source of wealth/funds verification', completed: false },
      { id: 4, name: 'In-depth adverse media search', completed: false },
      { id: 5, name: 'Enhanced ongoing monitoring', completed: false },
      { id: 6, name: 'Senior management review', completed: false }
    ],
    workflow: 'Assign to Senior Compliance Officer',
    requiredApproval: 'Senior Management',
    timeline: '5-10 business days'
  }
};

const VendorDashboard = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [dueDiligenceModal, setDueDiligenceModal] = useState({ isOpen: false, vendor: null });
  const [dueDiligenceTasks, setDueDiligenceTasks] = useState([]);
  const [dueDiligenceNotes, setDueDiligenceNotes] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [newVendor, setNewVendor] = useState({
    name: "",
    riskLevel: "Low",
    progress: 0,
    notes: "",
    service_type: "Infrastructure",
    status: "pending",
    contact_person: "",
    email: "",
    phone: ""
  });
  const navigate = useNavigate();
  const toast = useToast();

  const cardBg = useColorModeValue("white", "gray.800");
  const headerBg = useColorModeValue("gray.50", "gray.700");
  const riskHigh = useColorModeValue("red.500", "red.300");
  const riskMedium = useColorModeValue("orange.500", "orange.300");
  const riskLow = useColorModeValue("green.500", "green.300");

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("vendors")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVendors(data || []);
    } catch (err) {
      console.error("Error fetching vendors:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVendor = async () => {
    try {
      const { data, error } = await supabase
        .from("vendors")
        .insert([{ 
          ...newVendor, 
          risk_score: newVendor.progress,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;
      
      setVendors([data[0], ...vendors]);
      setNewVendor({
        name: "",
        riskLevel: "Low",
        progress: 0,
        notes: "",
        service_type: "Infrastructure",
        status: "pending",
        contact_person: "",
        email: "",
        phone: ""
      });
      onClose();
    } catch (err) {
      console.error("Error adding vendor:", err.message);
    }
  };

  const handleInitiateDueDiligence = async (vendorId) => {
    try {
      const vendor = vendors.find(v => v.id === vendorId);
      const riskLabel = getRiskLabel(vendor.risk_score || 0);
      const config = dueDiligenceConfig[riskLabel];
      
      const { error } = await supabase
        .from("vendors")
        .update({ 
          status: "due_diligence",
          due_diligence_tasks: config.actions,
          due_diligence_progress: 0,
          due_diligence_notes: "",
          updated_at: new Date().toISOString()
        })
        .eq("id", vendorId);

      if (error) throw error;
      
      // Update local state
      setVendors(vendors.map(v => 
        v.id === vendorId 
          ? { 
              ...v, 
              status: "due_diligence",
              due_diligence_tasks: config.actions,
              due_diligence_progress: 0,
              due_diligence_notes: ""
            }
          : v
      ));
      
      toast({
        title: "Due diligence initiated",
        description: `Due diligence process started for ${vendor.name}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
    } catch (err) {
      console.error("Error initiating due diligence:", err.message);
      toast({
        title: "Error",
        description: "Failed to initiate due diligence process",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleTaskToggle = async (vendorId, taskId, completed) => {
    try {
      const vendor = vendors.find(v => v.id === vendorId);
      const updatedTasks = vendor.due_diligence_tasks.map(task => 
        task.id === taskId ? { ...task, completed } : task
      );
      
      const completedTasks = updatedTasks.filter(task => task.completed).length;
      const totalTasks = updatedTasks.length;
      const progress = Math.round((completedTasks / totalTasks) * 100);
      
      const { error } = await supabase
        .from("vendors")
        .update({ 
          due_diligence_tasks: updatedTasks,
          due_diligence_progress: progress,
          updated_at: new Date().toISOString()
        })
        .eq("id", vendorId);

      if (error) throw error;
      
      // Update local state
      setVendors(vendors.map(v => 
        v.id === vendorId 
          ? { 
              ...v, 
              due_diligence_tasks: updatedTasks,
              due_diligence_progress: progress
            }
          : v
      ));
      
    } catch (err) {
      console.error("Error updating task:", err.message);
      toast({
        title: "Error",
        description: "Failed to update task status",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSaveDueDiligenceNotes = async (vendorId, notes) => {
    try {
      const { error } = await supabase
        .from("vendors")
        .update({ 
          due_diligence_notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq("id", vendorId);

      if (error) throw error;
      
      // Update local state
      setVendors(vendors.map(v => 
        v.id === vendorId 
          ? { ...v, due_diligence_notes: notes }
          : v
      ));
      
      toast({
        title: "Notes saved",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      
    } catch (err) {
      console.error("Error saving notes:", err.message);
      toast({
        title: "Error",
        description: "Failed to save notes",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCompleteDueDiligence = async (vendorId) => {
    try {
      const { error } = await supabase
        .from("vendors")
        .update({ 
          status: "approved",
          updated_at: new Date().toISOString()
        })
        .eq("id", vendorId);

      if (error) throw error;
      
      // Update local state
      setVendors(vendors.map(v => 
        v.id === vendorId 
          ? { ...v, status: "approved" }
          : v
      ));
      
      setDueDiligenceModal({ isOpen: false, vendor: null });
      
      toast({
        title: "Due diligence completed",
        description: "Vendor has been approved",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
    } catch (err) {
      console.error("Error completing due diligence:", err.message);
      toast({
        title: "Error",
        description: "Failed to complete due diligence",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const openDueDiligenceModal = (vendor) => {
    setDueDiligenceModal({ isOpen: true, vendor });
    setDueDiligenceTasks(vendor.due_diligence_tasks || []);
    setDueDiligenceNotes(vendor.due_diligence_notes || "");
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesService = serviceFilter === "all" || vendor.service_type === serviceFilter;
    const matchesStatus = statusFilter === "all" || vendor.status === statusFilter;
    return matchesSearch && matchesService && matchesStatus;
  });

  const getRiskDetails = (riskLevel) => {
    switch (riskLevel) {
      case "High":
        return { color: "red", icon: FiAlertTriangle };
      case "Medium":
        return { color: "orange", icon: FiInfo };
      default:
        return { color: "green", icon: FiCheckCircle };
    }
  };

  const getRiskColor = (riskScore) => {
    if (riskScore >= 70) return riskHigh;
    if (riskScore >= 40) return riskMedium;
    return riskLow;
  };

  const getRiskIcon = (riskScore) => {
    if (riskScore >= 70) return FiAlertTriangle;
    if (riskScore >= 40) return FiShield;
    return FiCheckCircle;
  };

  const getRiskLabel = (riskScore) => {
    if (riskScore >= 70) return "High Risk";
    if (riskScore >= 40) return "Medium Risk";
    return "Low Risk";
  };

  const getDueDiligenceConfig = (riskScore) => {
    const riskLabel = getRiskLabel(riskScore);
    return dueDiligenceConfig[riskLabel] || dueDiligenceConfig['Low Risk'];
  };

  const getServiceIcon = (serviceType) => {
    switch (serviceType) {
      case "Infrastructure": return FiServer;
      case "Analytics": return FiBarChart2;
      case "Communication": return FiMail;
      default: return FiServer;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved": return "green";
      case "pending": return "orange";
      case "rejected": return "red";
      case "due_diligence": return "blue";
      default: return "gray";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved": return FiCheckCircle;
      case "pending": return FiClock;
      case "rejected": return FiXCircle;
      case "due_diligence": return FiClipboard;
      default: return FiInfo;
    }
  };

  const riskCounts = vendors.reduce((acc, vendor) => {
    const riskLevel = getRiskLabel(vendor.risk_score || 0);
    acc[riskLevel] = (acc[riskLevel] || 0) + 1;
    return acc;
  }, {});

  const highRiskVendors = vendors.filter(vendor => (vendor.risk_score || 0) >= 70);
  const pendingVendors = vendors.filter(vendor => vendor.status === "pending");
  const dueDiligenceVendors = vendors.filter(vendor => vendor.status === "due_diligence");

  if (loading) {
    return (
      <Center py={10}>
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Box p={6}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Vendor Risk Management</Heading>
        <Button 
          leftIcon={<FiPlus />} 
          colorScheme="blue" 
          onClick={onOpen}
        >
          Add Vendor
        </Button>
      </Flex>

      {/* Dashboard Overview */}
      <Tabs variant="enclosed" mb={6} onChange={(index) => setActiveTab(index)}>
        <TabList>
          <Tab>Overview</Tab>
          <Tab>Directory</Tab>
          <Tab>Due Diligence</Tab>
          <Tab>Risk Analysis</Tab>
        </TabList>
        <TabPanels>
          <TabPanel p={4}>
            <SimpleGrid columns={[1, 2, 3, 4]} spacing={4} mb={6}>
              <Card bg="green.50">
                <CardBody>
                  <Stat>
                    <StatLabel>Low Risk Vendors</StatLabel>
                    <StatNumber>{riskCounts["Low Risk"] || 0}</StatNumber>
                    <StatHelpText>
                      <StatArrow type="increase" />
                      23.36%
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
              <Card bg="orange.50">
                <CardBody>
                  <Stat>
                    <StatLabel>Medium Risk Vendors</StatLabel>
                    <StatNumber>{riskCounts["Medium Risk"] || 0}</StatNumber>
                    <StatHelpText>
                      <StatArrow type="decrease" />
                      9.05%
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
              <Card bg="red.50">
                <CardBody>
                  <Stat>
                    <StatLabel>High Risk Vendors</StatLabel>
                    <StatNumber>{riskCounts["High Risk"] || 0}</StatNumber>
                    <StatHelpText>
                      <StatArrow type="increase" />
                      3.45%
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
              <Card bg="blue.50">
                <CardBody>
                  <Stat>
                    <StatLabel>Due Diligence</StatLabel>
                    <StatNumber>{dueDiligenceVendors.length}</StatNumber>
                    <StatHelpText>
                      In progress
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </SimpleGrid>

            <Grid templateColumns="repeat(12, 1fr)" gap={6}>
              <GridItem colSpan={[12, 12, 8]}>
                <Card>
                  <CardHeader>
                    <Heading size="md">Risk Distribution</Heading>
                  </CardHeader>
                  <CardBody>
                    <SimpleGrid columns={[1, 2]} spacing={4}>
                      {vendors.slice(0, 4).map(vendor => {
                        const { color, icon } = getRiskDetails(getRiskLabel(vendor.risk_score || 0));
                        return (
                          <Card key={vendor.id} variant="outline" _hover={{ boxShadow: "md" }}>
                            <CardHeader>
                              <Flex align="center" gap={2}>
                                <Icon as={icon} color={`${color}.500`} boxSize={5} />
                                <Text fontWeight="bold">{vendor.name}</Text>
                                <Tag colorScheme={color} ml="auto" textTransform="uppercase">
                                  {getRiskLabel(vendor.risk_score || 0)}
                                </Tag>
                              </Flex>
                            </CardHeader>
                            <CardBody>
                              <Box>
                                <Text mb={2}>Risk Level: {vendor.risk_score || 0}%</Text>
                                <Progress 
                                  value={vendor.risk_score || 0} 
                                  colorScheme={color} 
                                  size="sm" 
                                  borderRadius="full"
                                />
                              </Box>
                            </CardBody>
                          </Card>
                        );
                      })}
                    </SimpleGrid>
                  </CardBody>
                </Card>
              </GridItem>
              <GridItem colSpan={[12, 12, 4]}>
                <Card>
                  <CardHeader>
                    <Heading size="md">High Risk Alerts</Heading>
                  </CardHeader>
                  <CardBody>
                    {highRiskVendors.length === 0 ? (
                      <Alert status="success" borderRadius="md">
                        <AlertIcon />
                        No high-risk vendors requiring immediate attention
                      </Alert>
                    ) : (
                      <Stack spacing={3}>
                        {highRiskVendors.slice(0, 3).map(vendor => (
                          <Alert status="error" key={vendor.id} borderRadius="md">
                            <AlertIcon />
                            <Box>
                              <AlertTitle fontSize="sm">{vendor.name}</AlertTitle>
                              <AlertDescription fontSize="xs">
                                Risk score: {vendor.risk_score}% - Requires review
                              </AlertDescription>
                            </Box>
                          </Alert>
                        ))}
                      </Stack>
                    )}
                  </CardBody>
                </Card>
              </GridItem>
            </Grid>
          </TabPanel>
          <TabPanel p={4}>
            <Flex mb={6} gap={4} wrap="wrap">
              <InputGroup maxW="300px">
                <InputLeftElement pointerEvents="none">
                  <FiSearch color="gray.300" />
                </InputLeftElement>
                <Input 
                  placeholder="Search vendors..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  borderRadius="md"
                />
              </InputGroup>
              
              <Flex gap={2} align="center">
                <Icon as={FiFilter} color="gray.500" />
                <Select 
                  placeholder="Service Type" 
                  w="180px"
                  value={serviceFilter}
                  onChange={(e) => setServiceFilter(e.target.value)}
                  borderRadius="md"
                  size="md"
                >
                  <option value="all">All Services</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Analytics">Analytics</option>
                  <option value="Communication">Communication</option>
                </Select>
                
                <Select 
                  placeholder="Status" 
                  w="150px"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  borderRadius="md"
                  size="md"
                >
                  <option value="all">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                  <option value="due_diligence">Due Diligence</option>
                </Select>
              </Flex>
            </Flex>

            {filteredVendors.length === 0 ? (
              <Center py={10} flexDirection="column">
                <FiServer size={48} color="#CBD5E0" />
                <Text mt={4} color="gray.500">No vendors found</Text>
                <Text color="gray.400" fontSize="sm">Try adjusting your search or filters</Text>
              </Center>
            ) : (
              <SimpleGrid columns={[1, 1, 2, 3]} spacing={5}>
                {filteredVendors.map(vendor => {
                  const dueDiligenceConfig = getDueDiligenceConfig(vendor.risk_score || 0);
                  
                  return (
                    <Card 
                      key={vendor.id} 
                      variant="elevated" 
                      borderRadius="lg" 
                      overflow="hidden"
                      bg={cardBg}
                      boxShadow="sm"
                      transition="all 0.2s"
                      _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
                    >
                      <CardHeader bg={headerBg} py={3}>
                        <Flex align="center" justify="space-between">
                          <Flex align="center" gap={3}>
                            <Icon as={getServiceIcon(vendor.service_type)} color="purple.500" />
                            <Text fontWeight="bold" fontSize="md">{vendor.name}</Text>
                          </Flex>
                          <Badge 
                            colorScheme={getStatusColor(vendor.status)}
                            variant="subtle"
                            borderRadius="full"
                            px={2}
                            py={1}
                            fontSize="xs"
                          >
                            {vendor.status}
                          </Badge>
                        </Flex>
                      </CardHeader>
                      <CardBody py={4}>
                        <Stack spacing={4}>
                          <Box>
                            <Flex justify="space-between" align="center" mb={1}>
                              <Text fontSize="sm" fontWeight="medium" color="gray.600">Risk Score</Text>
                              <Flex align="center" gap={1}>
                                <Icon as={getRiskIcon(vendor.risk_score || 0)} color={getRiskColor(vendor.risk_score || 0)} />
                                <Text fontSize="sm" fontWeight="bold" color={getRiskColor(vendor.risk_score || 0)}>
                                  {getRiskLabel(vendor.risk_score || 0)}
                                </Text>
                              </Flex>
                            </Flex>
                            <Progress 
                              value={vendor.risk_score || 0} 
                              size="sm" 
                              colorScheme={
                                (vendor.risk_score || 0) >= 70 ? "red" : 
                                (vendor.risk_score || 0) >= 40 ? "orange" : "green"
                              }
                              borderRadius="full"
                              hasStripe
                            />
                            <Flex justify="space-between" mt={1}>
                              <Text fontSize="xs" color="gray.500">0</Text>
                              <Text fontSize="xs" fontWeight="bold">{vendor.risk_score || 0}/100</Text>
                              <Text fontSize="xs" color="gray.500">100</Text>
                            </Flex>
                          </Box>
                          
                          {vendor.status === "due_diligence" && (
                            <Box>
                              <Flex justify="space-between" align="center" mb={1}>
                                <Text fontSize="sm" fontWeight="medium" color="gray.600">Due Diligence Progress</Text>
                                <Text fontSize="sm" fontWeight="bold">{vendor.due_diligence_progress || 0}%</Text>
                              </Flex>
                              <Progress 
                                value={vendor.due_diligence_progress || 0} 
                                size="sm" 
                                colorScheme="blue"
                                borderRadius="full"
                                hasStripe
                              />
                            </Box>
                          )}
                          
                          <Box>
                            <Text fontSize="sm" color="gray.600" mb={1}>Due Diligence</Text>
                            <Text fontSize="xs" color="gray.500">
                              {dueDiligenceConfig.timeline} • {dueDiligenceConfig.requiredApproval}
                            </Text>
                          </Box>
                          
                          <Box>
                            <Text fontSize="sm" color="gray.600" mb={1}>Contact Info</Text>
                            <Text fontSize="sm">{vendor.contact_person || "N/A"}</Text>
                            <Text fontSize="sm" color="blue.500">{vendor.email || "N/A"}</Text>
                            <Text fontSize="sm">{vendor.phone || "N/A"}</Text>
                          </Box>
                          
                          <Flex justify="space-between" align="center" pt={2}>
                            <Text fontSize="xs" color="gray.500">
                              Last updated: {new Date(vendor.updated_at || vendor.created_at).toLocaleDateString()}
                            </Text>
                            <Menu>
                              <MenuButton
                                as={Button}
                                size="sm"
                                variant="outline"
                                rightIcon={<FiMoreVertical />}
                              >
                                Actions
                              </MenuButton>
                              <MenuList>
                                <MenuItem onClick={() => navigate(`/vendor-management/vendor/${vendor.id}`)}>
                                  View Details
                                </MenuItem>
                                {vendor.status === "pending" && (
                                  <MenuItem onClick={() => handleInitiateDueDiligence(vendor.id)}>
                                    Start Due Diligence
                                  </MenuItem>
                                )}
                                {vendor.status === "due_diligence" && (
                                  <MenuItem onClick={() => openDueDiligenceModal(vendor)}>
                                    View Due Diligence
                                  </MenuItem>
                                )}
                              </MenuList>
                            </Menu>
                          </Flex>
                        </Stack>
                      </CardBody>
                    </Card>
                  );
                })}
              </SimpleGrid>
            )}
          </TabPanel>
          <TabPanel p={4}>
  <DueDiligenceForms
  />
</TabPanel>
          
          <TabPanel p={4}>
            <Heading size="md" mb={4}>Risk Analysis</Heading>
            <Text mb={6}>Detailed risk analysis and reporting features will be implemented here.</Text>
            {/* Placeholder for risk analysis charts and detailed reporting */}
            <Card>
              <CardHeader>
                <Flex align="center">
                  <Icon as={FiActivity} mr={2} />
                  <Text fontWeight="bold">Risk Trend Analysis</Text>
                </Flex>
              </CardHeader>
              <CardBody>
                <Center h="200px" color="gray.500">
                  Risk trend charts and analytics will be displayed here
                </Center>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Due Diligence Modal */}
      <Modal 
        isOpen={dueDiligenceModal.isOpen} 
        onClose={() => setDueDiligenceModal({ isOpen: false, vendor: null })}
        size="xl"
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Due Diligence - {dueDiligenceModal.vendor?.name}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {dueDiligenceModal.vendor && (
              <Stack spacing={4}>
                <Flex justify="space-between" align="center">
                  <Box>
                    <Text fontWeight="bold">Risk Level: {getRiskLabel(dueDiligenceModal.vendor.risk_score || 0)}</Text>
                    <Text fontSize="sm" color="gray.600">{dueDiligenceModal.vendor.service_type}</Text>
                  </Box>
                  <Badge colorScheme={getRiskColor(dueDiligenceModal.vendor.risk_score || 0)} fontSize="md" p={2}>
                    {dueDiligenceModal.vendor.risk_score || 0}%
                  </Badge>
                </Flex>
                
                <Divider />
                
                <Box>
                  <Flex justify="space-between" align="center" mb={3}>
                    <Text fontWeight="bold">Due Diligence Progress</Text>
                    <Text fontWeight="bold" color="blue.500">{dueDiligenceModal.vendor.due_diligence_progress || 0}% Complete</Text>
                  </Flex>
                  <Progress 
                    value={dueDiligenceModal.vendor.due_diligence_progress || 0} 
                    size="lg" 
                    colorScheme="blue"
                    borderRadius="full"
                    hasStripe
                  />
                </Box>
                
                <Box>
                  <Text fontWeight="bold" mb={3}>Due Diligence Tasks:</Text>
                  <CheckboxGroup colorScheme="green">
                    <Stack spacing={3}>
                      {dueDiligenceModal.vendor.due_diligence_tasks && dueDiligenceModal.vendor.due_diligence_tasks.map((task, index) => (
                        <Checkbox
                          key={index}
                          isChecked={task.completed}
                          onChange={(e) => handleTaskToggle(dueDiligenceModal.vendor.id, task.id, e.target.checked)}
                        >
                          <Text as={task.completed ? "s" : "span"} color={task.completed ? "gray.500" : "inherit"}>
                            {task.name}
                          </Text>
                        </Checkbox>
                      ))}
                    </Stack>
                  </CheckboxGroup>
                </Box>
                
                <SimpleGrid columns={2} spacing={4}>
                  <Box>
                    <Text fontWeight="bold">Timeline</Text>
                    <Text>{getDueDiligenceConfig(dueDiligenceModal.vendor.risk_score || 0).timeline}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold">Required Approval</Text>
                    <Text>{getDueDiligenceConfig(dueDiligenceModal.vendor.risk_score || 0).requiredApproval}</Text>
                  </Box>
                </SimpleGrid>
                
                <Box>
                  <Flex justify="space-between" align="center" mb={2}>
                    <Text fontWeight="bold">Notes & Findings:</Text>
                  </Flex>
                  <Editable
                    defaultValue={dueDiligenceModal.vendor.due_diligence_notes || "Add notes and findings here..."}
                    fontSize="sm"
                    onSubmit={(value) => handleSaveDueDiligenceNotes(dueDiligenceModal.vendor.id, value)}
                  >
                    {(props) => (
                      <>
                        <EditablePreview 
                          py={2} 
                          px={4} 
                          border="1px" 
                          borderColor="gray.200" 
                          borderRadius="md" 
                          w="full" 
                          _hover={{ bg: "gray.50" }}
                        />
                        <EditableInput as={Textarea} py={2} px={4} rows={6} />
                        <Flex justify="flex-end" mt={2}>
                          <IconButton
                            size="sm"
                            icon={<FiEdit />}
                            {...props}
                            mr={2}
                          />
                        </Flex>
                      </>
                    )}
                  </Editable>
                </Box>
              </Stack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={() => setDueDiligenceModal({ isOpen: false, vendor: null })}>
              Close
            </Button>
            <Button 
              colorScheme="green" 
              onClick={() => dueDiligenceModal.vendor && handleCompleteDueDiligence(dueDiligenceModal.vendor.id)}
              isDisabled={(dueDiligenceModal.vendor?.due_diligence_progress || 0) < 100}
            >
              Complete Due Diligence
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add Vendor Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Vendor</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <SimpleGrid columns={[1, 2]} spacing={4} mb={4}>
              <FormControl>
                <FormLabel>Vendor Name</FormLabel>
                <Input 
                  value={newVendor.name}
                  onChange={(e) => setNewVendor({...newVendor, name: e.target.value})}
                  placeholder="Enter vendor name"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Service Type</FormLabel>
                <Select
                  value={newVendor.service_type}
                  onChange={(e) => setNewVendor({...newVendor, service_type: e.target.value})}
                >
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Analytics">Analytics</option>
                  <option value="Communication">Communication</option>
                </Select>
              </FormControl>
            </SimpleGrid>

            <SimpleGrid columns={[1, 2]} spacing={4} mb={4}>
              <FormControl>
                <FormLabel>Risk Level</FormLabel>
                <Select
                  value={newVendor.riskLevel}
                  onChange={(e) => setNewVendor({...newVendor, riskLevel: e.target.value})}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Risk Percentage</FormLabel>
                <Input 
                  type="number"
                  value={newVendor.progress}
                  onChange={(e) => setNewVendor({...newVendor, progress: parseInt(e.target.value) || 0})}
                  min="0"
                  max="100"
                />
              </FormControl>
            </SimpleGrid>

            <SimpleGrid columns={[1, 2]} spacing={4} mb={4}>
              <FormControl>
                <FormLabel>Status</FormLabel>
                <Select
                  value={newVendor.status}
                  onChange={(e) => setNewVendor({...newVendor, status: e.target.value})}
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="due_diligence">Due Diligence</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Contact Person</FormLabel>
                <Input 
                  value={newVendor.contact_person}
                  onChange={(e) => setNewVendor({...newVendor, contact_person: e.target.value})}
                  placeholder="Contact name"
                />
              </FormControl>
            </SimpleGrid>

            <SimpleGrid columns={[1, 2]} spacing={4} mb={4}>
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input 
                  type="email"
                  value={newVendor.email}
                  onChange={(e) => setNewVendor({...newVendor, email: e.target.value})}
                  placeholder="Email address"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Phone</FormLabel>
                <Input 
                  value={newVendor.phone}
                  onChange={(e) => setNewVendor({...newVendor, phone: e.target.value})}
                  placeholder="Phone number"
                />
              </FormControl>
            </SimpleGrid>

            <FormControl>
              <FormLabel>Risk Notes</FormLabel>
              <Textarea
                value={newVendor.notes}
                onChange={(e) => setNewVendor({...newVendor, notes: e.target.value})}
                placeholder="Additional risk details and assessment notes"
                rows={3}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleAddVendor}>
              Add Vendor
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default VendorDashboard;