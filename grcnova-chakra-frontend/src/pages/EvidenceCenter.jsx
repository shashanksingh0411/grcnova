import { useState, useCallback, useEffect } from "react";
import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  IconButton,
  Input,
  Text,
  useToast,
  VStack,
  HStack,
  Image,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Select,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tag,
  Checkbox,
  CheckboxGroup,
  Wrap,
  WrapItem,
  FormControl,
  FormLabel,
  Textarea,
  Spinner,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Avatar,
  AvatarGroup,
  Progress,
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
  StatGroup,
  InputGroup,
  InputLeftElement,
  DarkMode,
  useColorModeValue
} from "@chakra-ui/react";
import { 
  FiUpload, 
  FiGrid, 
  FiList, 
  FiDownload, 
  FiTrash2, 
  FiMoreVertical,
  FiInfo,
  FiCalendar,
  FiFile,
  FiImage,
  FiFilter,
  FiChevronDown,
  FiCheckSquare,
  FiTag,
  FiPlus,
  FiX,
  FiUsers,
  FiSearch,
  FiBarChart2,
  FiLayers,
  FiShield,
  FiDatabase,
  FiFolderPlus,
  FiEye,
  FiLink,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiUser
} from "react-icons/fi";
import { supabase } from "../supabase";

const EvidenceCenter = () => {
  const [files, setFiles] = useState([]);
  const [isGridView, setIsGridView] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [sortOption, setSortOption] = useState("dateDesc");
  const [filterOption, setFilterOption] = useState("all");
  const [frameworkFilter, setFrameworkFilter] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [newFrameworks, setNewFrameworks] = useState([]);
  const [allFrameworks, setAllFrameworks] = useState([]);
  const [frameworkControls, setFrameworkControls] = useState([]);
  const [selectedFramework, setSelectedFramework] = useState(null);
  const [showFrameworkControls, setShowFrameworkControls] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Color mode values for light/dark mode support
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedText = useColorModeValue("gray.600", "gray.400");
  const headerBg = useColorModeValue("white", "gray.800");
  const hoverBg = useColorModeValue("gray.50", "gray.700");

  // Fetch evidence files - UPDATED TO USE UUID REFERENCES
  const fetchEvidence = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Get user's organization ID from profile
      const { data: userProfile } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      const userOrganizationId = userProfile?.organization_id || user.id;

      // UPDATED QUERY WITH PROPER UUID REFERENCES
      const { data, error } = await supabase
        .from('evidence')
        .select(`
          id,
          control_ref,
          framework,
          file_name,
          file_path,
          file_type,
          file_size,
          organization_id,
          uploaded_by,
          notes,
          created_at,
          framework_id,
          control_ref,
          frameworks (
            id,
            name,
            key
          ),
          organizations!evidence_organization_id_fkey (
            id,
            name
          ),
          users!evidence_uploaded_by_fkey (
            id,
            email,
            full_name
          )
        `)
        .eq('organization_id', userOrganizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedFiles = data.map(file => ({
        id: file.id,
        name: file.file_name,
        type: file.file_type,
        size: file.file_size / 1024 / 1024, // MB
        sizeDisplay: `${(file.file_size / 1024 / 1024).toFixed(2)} MB`,
        uploadedAt: new Date(file.created_at),
        uploadedAtDisplay: new Date(file.created_at).toLocaleDateString(),
        preview: file.file_type.startsWith('image/') ? file.file_path : null,
        description: file.notes,
        tags: [],
        frameworks: file.frameworks ? [file.frameworks.id] : [],   // store framework ID list
        frameworkName: file.frameworks?.name || "General",
        uploadedBy: file.users?.full_name || file.users?.email || 'Unknown',
        organization: file.organizations?.name || 'No Organization',
        organizationId: file.organization_id,
        filePath: file.file_path,
        controlRef: file.control_ref,
        frameworkKey: file.framework_key,
        status: Math.random() > 0.7 ? "verified" : Math.random() > 0.5 ? "pending" : "needs_review"
      }));

      setFiles(formattedFiles);
    } catch (error) {
      console.error('Error fetching evidence:', error);
      const errorMessage =
        error?.message ||
        error?.error_description ||
        error?.msg ||
        JSON.stringify(error);

      toast({
        title: "Error loading evidence",
        description: errorMessage,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Fetch frameworks
  const fetchFrameworks = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('frameworks')
        .select('id, name, key')
        .order('name');

      if (error) throw error;
      setAllFrameworks(data);
    } catch (error) {
      console.error('Error fetching frameworks:', error);
    }
  }, []);

  // Fetch framework controls with chapters
  const fetchFrameworkControls = useCallback(async (frameworkKey) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('framework_controls')
        .select('*')
        .eq('framework_key', frameworkKey)
        .order('chapters')
        .order('control_ref');

      if (error) throw error;
      
      // Group controls by chapter
      const groupedControls = {};
      data.forEach(control => {
        if (!groupedControls[control.chapters]) {
          groupedControls[control.chapters] = [];
        }
        groupedControls[control.chapters].push(control);
      });
      
      setFrameworkControls(groupedControls);
    } catch (error) {
      console.error('Error fetching framework controls:', error);
      toast({
        title: "Error loading framework controls",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchEvidence();
    fetchFrameworks();
  }, [fetchEvidence, fetchFrameworks]);

  // Handle framework selection
  const handleFrameworkSelect = async (frameworkKey) => {
    if (!frameworkKey) {
      setSelectedFramework(null);
      setShowFrameworkControls(false);
      setFrameworkControls([]);
      return;
    }
    
    const framework = allFrameworks.find(f => f.key === frameworkKey);
    setSelectedFramework(framework);
    await fetchFrameworkControls(frameworkKey);
    setShowFrameworkControls(true);
  };

  // Filter files based on search query
  const searchFilteredFiles = files.filter(file => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      file.name.toLowerCase().includes(query) ||
      (file.description && file.description.toLowerCase().includes(query)) ||
      (file.controlRef && file.controlRef.toLowerCase().includes(query)) ||
      (file.frameworkName && file.frameworkName.toLowerCase().includes(query))
    );
  });

  // Sort files
  const sortedFiles = [...searchFilteredFiles].sort((a, b) => {
    switch (sortOption) {
      case "nameAsc": return a.name.localeCompare(b.name);
      case "nameDesc": return b.name.localeCompare(a.name);
      case "dateAsc": return a.uploadedAt - b.uploadedAt;
      case "dateDesc": return b.uploadedAt - a.uploadedAt;
      case "sizeAsc": return a.size - b.size;
      case "sizeDesc": return b.size - a.size;
      default: return 0;
    }
  });

  // Filter files
  const filteredFiles = sortedFiles.filter(file => {
    // File type filter
    if (filterOption !== "all") {
      if (filterOption === "image" && !file.type.startsWith('image/')) return false;
      if (filterOption === "pdf" && file.type !== 'application/pdf') return false;
      if (filterOption === "document" && 
          !['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) 
        return false;
    }
    
    // Framework filter
    if (frameworkFilter.length > 0) {
      return frameworkFilter.some(fw => file.frameworks?.includes(fw));
    }
    
    return true;
  });

  // Stats for dashboard
  const stats = {
    total: files.length,
    verified: files.filter(f => f.status === 'verified').length,
    pending: files.filter(f => f.status === 'pending').length,
    needsReview: files.filter(f => f.status === 'needs_review').length,
    frameworks: [...new Set(files.map(f => f.frameworkKey))].length
  };

  const handleFileUpload = useCallback(async (file, controlRef = null, frameworkKey = null) => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get user's organization ID from profile
      const { data: userProfile } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      const userOrganizationId = userProfile?.organization_id || user.id;

      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `evidence/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('evidence')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Insert evidence record with UUID references
      const { error: insertError } = await supabase
        .from('evidence')
        .insert({
          file_name: file.name,
          file_path: filePath,
          file_type: file.type,
          file_size: file.size,
          organization_id: userOrganizationId, // UUID reference to organizations table
          uploaded_by: user.id, // UUID reference to profiles table
          framework_key: frameworkKey || 'general',
          control_ref: controlRef || 'general',
          notes: `Uploaded for control ${controlRef} in framework ${frameworkKey}`
        });

      if (insertError) throw insertError;

      toast({
        title: "File uploaded successfully",
        status: "success",
        duration: 2000,
        isClosable: true,
      });

      // Refresh the evidence list
      fetchEvidence();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload failed",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, fetchEvidence]);

  const handleControlFileUpload = (e, controlRef) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    files.forEach(file => {
      handleFileUpload(file, controlRef, selectedFramework.key);
    });
    
    // Reset the file input
    e.target.value = null;
  };

  const handleGeneralFileUpload = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    files.forEach(file => {
      handleFileUpload(file);
    });
  }, [handleFileUpload]);

  const handleUpdateFrameworks = async () => {
    try {
      const { error } = await supabase
        .from('evidence')
        .update({ 
          framework_key: newFrameworks[0] || 'general',
          control_ref: newFrameworks[0] || 'general' 
        })
        .eq('id', selectedFile.id);

      if (error) throw error;

      setFiles(files.map(file => 
        file.id === selectedFile.id 
          ? { ...file, frameworks: newFrameworks, frameworkName: newFrameworks[0] } 
          : file
      ));

      toast({
        title: "Frameworks updated",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      onClose();
    } catch (error) {
      console.error('Error updating frameworks:', error);
      toast({
        title: "Update failed",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDownload = async (file) => {
    try {
      const { data, error } = await supabase.storage
        .from('evidence')
        .download(file.filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Download failed",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async (fileId) => {
    try {
      const fileToDelete = files.find(f => f.id === fileId);
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('evidence')
        .remove([fileToDelete.filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('evidence')
        .delete()
        .eq('id', fileId);

      if (dbError) throw dbError;

      setFiles(files.filter(f => f.id !== fileId));
      
      toast({
        title: "File deleted",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: "Delete failed",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const openFileDetails = (file) => {
    setSelectedFile(file);
    setNewFrameworks(file.frameworks || []);
    onOpen();
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'verified': return 'green';
      case 'pending': return 'orange';
      case 'needs_review': return 'red';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'verified': return FiCheckCircle;
      case 'pending': return FiClock;
      case 'needs_review': return FiAlertCircle;
      default: return FiInfo;
    }
  };

  if (isLoading && files.length === 0) {
    return (
      <Box p={6} display="flex" justifyContent="center" alignItems="center" minH="400px">
        <VStack spacing={4}>
          <Spinner size="xl" thickness="3px" speed="0.65s" color="blue.500" />
          <Text color={mutedText}>Loading evidence files...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box bg={useColorModeValue("gray.50", "gray.900")} minH="100vh">
      {/* Header */}
      <Box bg={headerBg} borderBottomWidth="1px" borderColor={borderColor} px={6} py={4} boxShadow="sm">
  <Flex justify="space-between" align="center">
    <Box>
      <Heading size="lg" mb={1} color={useColorModeValue("gray.800", "white")}>
        Evidence Center
      </Heading>
      <Text color={mutedText} fontSize="sm">
        Manage compliance evidence across all frameworks and controls
      </Text>
    </Box>
  </Flex>
</Box>

      <Box p={6}>
        {/* Page Title and Stats */}

        {/* Tabs Navigation */}
        <Tabs variant="soft-rounded" colorScheme="blue" mb={8} onChange={(index) => setActiveTab(index)}>
          <TabList mb={4}>
            <Tab fontWeight="medium" _selected={{ color: "white", bg: "blue.500" }}>
              <FiBarChart2 style={{ marginRight: '8px' }} />
              Dashboard
            </Tab>
            <Tab fontWeight="medium" _selected={{ color: "white", bg: "blue.500" }}>
              <FiLayers style={{ marginRight: '8px' }} />
              Framework View
            </Tab>
            <Tab fontWeight="medium" _selected={{ color: "white", bg: "blue.500" }}>
              <FiDatabase style={{ marginRight: '8px' }} />
              All Evidence
            </Tab>
          </TabList>
        </Tabs>

        {/* Framework Selection */}
        {activeTab === 1 && (
          <Card mb={6} variant="outline" bg={cardBg} borderColor={borderColor} borderRadius="lg" boxShadow="sm">
            <CardHeader pb={3}>
              <Heading size="md" color={useColorModeValue("gray.800", "white")}>Select Compliance Framework</Heading>
            </CardHeader>
            <CardBody pt={0}>
              <Flex align="center" flexWrap="wrap" gap={4}>
                <Select 
                  placeholder="Choose a framework..."
                  value={selectedFramework?.key || ''}
                  onChange={(e) => handleFrameworkSelect(e.target.value || null)}
                  maxW="300px"
                  borderColor={borderColor}
                  _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                >
                  {allFrameworks.map(fw => (
                    <option key={fw.key} value={fw.key}>{fw.key}</option>
                  ))}
                </Select>
                
                {selectedFramework && (
                  <Badge colorScheme="blue" fontSize="sm" px={3} py={1} borderRadius="full">
                    {Object.values(frameworkControls).flat().length} controls
                  </Badge>
                )}
              </Flex>
            </CardBody>
          </Card>
        )}

        {/* Framework Controls Section */}
        {activeTab === 1 && showFrameworkControls && selectedFramework && (
          <Card mb={8} variant="outline" bg={cardBg} borderColor={borderColor} borderRadius="lg" boxShadow="sm">
            <CardHeader pb={3}>
              <Heading size="md" color={useColorModeValue("gray.800", "white")}>
                {selectedFramework.name} Controls
              </Heading>
            </CardHeader>
            <CardBody pt={0}>
              {Object.keys(frameworkControls).length === 0 ? (
                <Box p={6} textAlign="center" bg={useColorModeValue("gray.50", "gray.700")} borderRadius="md">
                  <Text color={mutedText}>No controls found for this framework.</Text>
                </Box>
              ) : (
                <Accordion allowMultiple>
                  {Object.entries(frameworkControls).map(([chapter, controls]) => (
                    <AccordionItem key={chapter} borderWidth="1px" borderRadius="md" mb={3} borderColor={borderColor}>
                      {({ isExpanded }) => (
                        <>
                          <AccordionButton 
                            bg={isExpanded ? "blue.50" : "transparent"} 
                            py={4}
                            _hover={{ bg: useColorModeValue("gray.50", "gray.700") }}
                            _expanded={{ bg: "blue.50", color: "blue.800" }}
                          >
                            <Box flex="1" textAlign="left">
                              <Text as="span" fontWeight="semibold">{chapter}</Text>
                              <Badge colorScheme="blue" ml={2} borderRadius="full">{controls.length} controls</Badge>
                            </Box>
                            <AccordionIcon />
                          </AccordionButton>
                          <AccordionPanel pb={4}>
                            <Accordion allowMultiple>
                              {controls.map(control => (
                                <AccordionItem key={control.id} borderWidth="1px" borderRadius="md" mb={3} borderColor={borderColor}>
                                  {({ isExpanded }) => (
                                    <>
                                      <AccordionButton 
                                        bg={isExpanded ? "blue.50" : "transparent"} 
                                        py={3}
                                        _hover={{ bg: useColorModeValue("gray.50", "gray.700") }}
                                        _expanded={{ bg: "blue.50", color: "blue.800" }}
                                      >
                                        <Box flex="1" textAlign="left">
                                          <Badge colorScheme="blue" mr={2} borderRadius="full">{control.control_ref}</Badge>
                                          <Text as="span" fontWeight="medium">{control.control_name}</Text>
                                        </Box>
                                        <AccordionIcon />
                                      </AccordionButton>
                                      <AccordionPanel pb={4}>
                                        <Text mb={4} color={mutedText}>{control.control_text}</Text>
                                        
                                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                                          <Box>
                                            <Text fontWeight="semibold" mb={2} color={useColorModeValue("gray.800", "white")}>
                                              Existing Evidence
                                            </Text>
                                            {files.filter(f => f.controlRef === control.control_ref && 
                                                              f.frameworkKey === selectedFramework.key).length === 0 ? (
                                              <Text color={mutedText} fontSize="sm">No evidence uploaded for this control yet.</Text>
                                            ) : (
                                              <VStack align="stretch" spacing={2}>
                                                {files.filter(f => f.controlRef === control.control_ref && 
                                                                  f.frameworkKey === selectedFramework.key)
                                                      .map(file => (
                                                  <Flex 
                                                    key={file.id} 
                                                    justify="space-between" 
                                                    align="center" 
                                                    p={3} 
                                                    bg={useColorModeValue("gray.50", "gray.700")} 
                                                    borderRadius="md"
                                                    _hover={{ bg: useColorModeValue("gray.100", "gray.600") }}
                                                  >
                                                    <Box flex="1">
                                                      <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                                                        {file.name}
                                                      </Text>
                                                      <Text fontSize="xs" color={mutedText} mt={1}>
                                                        <FiUser style={{ display: 'inline', marginRight: 4 }} />
                                                        {file.uploadedBy} • {file.uploadedAtDisplay}
                                                      </Text>
                                                    </Box>
                                                    <HStack>
                                                      <IconButton
                                                        icon={<FiEye size="14px" />}
                                                        size="xs"
                                                        aria-label="View"
                                                        onClick={() => openFileDetails(file)}
                                                        variant="ghost"
                                                      />
                                                      <IconButton
                                                        icon={<FiDownload size="14px" />}
                                                        size="xs"
                                                        aria-label="Download"
                                                        onClick={() => handleDownload(file)}
                                                        variant="ghost"
                                                      />
                                                      <IconButton
                                                        icon={<FiTrash2 size="14px" />}
                                                        size="xs"
                                                        aria-label="Delete"
                                                        colorScheme="red"
                                                        variant="ghost"
                                                        onClick={() => handleDelete(file.id)}
                                                      />
                                                    </HStack>
                                                  </Flex>
                                                ))}
                                              </VStack>
                                            )}
                                          </Box>
                                          
                                          <Box>
                                            <Text fontWeight="semibold" mb={2} color={useColorModeValue("gray.800", "white")}>
                                              Upload New Evidence
                                            </Text>
                                            <Box position="relative">
                                              <Button
                                                as="label"
                                                leftIcon={<FiUpload />}
                                                colorScheme="blue"
                                                size="sm"
                                                width="100%"
                                                cursor="pointer"
                                                variant="outline"
                                                borderRadius="md"
                                              >
                                                Upload Evidence for {control.control_ref}
                                                <Input
                                                  type="file"
                                                  multiple
                                                  onChange={(e) => handleControlFileUpload(e, control.control_ref)}
                                                  position="absolute"
                                                  top={0}
                                                  left={0}
                                                  opacity={0}
                                                  width="100%"
                                                  height="100%"
                                                  cursor="pointer"
                                                />
                                              </Button>
                                            </Box>
                                            <Text mt={2} fontSize="sm" color={mutedText}>
                                              Supports PDF, images, and document files
                                            </Text>
                                          </Box>
                                        </SimpleGrid>
                                      </AccordionPanel>
                                    </>
                                  )}
                                </AccordionItem>
                              ))}
                            </Accordion>
                          </AccordionPanel>
                        </>
                      )}
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardBody>
          </Card>
        )}

        {/* Dashboard View */}
        {activeTab === 0 && (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={8}>
            <Card variant="outline" bg={cardBg} borderColor={borderColor} borderRadius="lg" boxShadow="sm">
              <CardHeader pb={3}>
                <Heading size="sm" color={useColorModeValue("gray.800", "white")}>Evidence Status</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Box>
                    <Flex justify="space-between" mb={1}>
                      <Text fontSize="sm" color={useColorModeValue("gray.700", "gray.300")}>Verified</Text>
                      <Text fontSize="sm" fontWeight="semibold" color={useColorModeValue("gray.800", "white")}>
                        {stats.verified}
                      </Text>
                    </Flex>
                    <Progress 
                      value={(stats.verified / stats.total) * 100} 
                      size="sm" 
                      colorScheme="green" 
                      borderRadius="full" 
                      bg={useColorModeValue("gray.100", "gray.600")}
                    />
                  </Box>
                  <Box>
                    <Flex justify="space-between" mb={1}>
                      <Text fontSize="sm" color={useColorModeValue("gray.700", "gray.300")}>Pending Review</Text>
                      <Text fontSize="sm" fontWeight="semibold" color={useColorModeValue("gray.800", "white")}>
                        {stats.pending}
                      </Text>
                    </Flex>
                    <Progress 
                      value={(stats.pending / stats.total) * 100} 
                      size="sm" 
                      colorScheme="orange" 
                      borderRadius="full" 
                      bg={useColorModeValue("gray.100", "gray.600")}
                    />
                  </Box>
                  <Box>
                    <Flex justify="space-between" mb={1}>
                      <Text fontSize="sm" color={useColorModeValue("gray.700", "gray.300")}>Needs Attention</Text>
                      <Text fontSize="sm" fontWeight="semibold" color={useColorModeValue("gray.800", "white")}>
                        {stats.needsReview}
                      </Text>
                    </Flex>
                    <Progress 
                      value={(stats.needsReview / stats.total) * 100} 
                      size="sm" 
                      colorScheme="red" 
                      borderRadius="full" 
                      bg={useColorModeValue("gray.100", "gray.600")}
                    />
                  </Box>
                </VStack>
              </CardBody>
            </Card>
            
            <Card variant="outline" bg={cardBg} borderColor={borderColor} borderRadius="lg" boxShadow="sm">
              <CardHeader pb={3}>
                <Heading size="sm" color={useColorModeValue("gray.800", "white")}>Recent Activity</Heading>
              </CardHeader>
              <CardBody>
                {files.slice(0, 3).map(file => (
                  <Box 
                    key={file.id} 
                    mb={3} 
                    pb={3} 
                    borderBottomWidth="1px" 
                    borderColor={borderColor}
                    _last={{ borderBottom: 'none', mb: 0, pb: 0 }}
                  >
                    <Flex justify="space-between">
                      <Text fontSize="sm" fontWeight="medium" noOfLines={1} color={useColorModeValue("gray.800", "white")}>
                        {file.name}
                      </Text>
                      <Badge colorScheme={getStatusColor(file.status)} size="sm" borderRadius="full">
                        {file.status.replace('_', ' ')}
                      </Badge>
                    </Flex>
                    <Text fontSize="xs" color={mutedText} mt={1}>
                      Added {file.uploadedAtDisplay} by {file.uploadedBy}
                    </Text>
                  </Box>
                ))}
              </CardBody>
            </Card>
          </SimpleGrid>
        )}

     

        {/* Active Filters Display */}
        {(filterOption !== "all" || frameworkFilter.length > 0) && (
          <Box mb={4}>
            <Text fontSize="sm" color={mutedText} mb={1}>
              Active filters:
            </Text>
            <Wrap>
              {filterOption !== "all" && (
                <WrapItem>
                  <Tag size="sm" colorScheme="blue" borderRadius="full">
                    File type: {filterOption}
                    <IconButton
                      icon={<FiX size="12px" />}
                      size="xs"
                      variant="ghost"
                      ml={1}
                      aria-label="Remove filter"
                      onClick={() => setFilterOption("all")}
                    />
                  </Tag>
                </WrapItem>
              )}
              {frameworkFilter.map(fwId => {
                const fw = allFrameworks.find(f => f.id === fwId);
                return (
                  <WrapItem key={fwId}>
                    <Tag size="sm" colorScheme="blue" borderRadius="full">
                      {fw?.name || fwId}
                      <IconButton
                        icon={<FiX size="12px" />}
                        size="xs"
                        variant="ghost"
                        ml={1}
                        aria-label="Remove filter"
                        onClick={() => setFrameworkFilter(
                          frameworkFilter.filter(id => id !== fwId)
                        )}
                      />
                    </Tag>
                  </WrapItem>
                );
              })}
            </Wrap>
          </Box>
        )}

        {/* File Display */}
        <Card variant="outline" bg={cardBg} borderColor={borderColor} borderRadius="lg" boxShadow="sm">
          <CardHeader py={4}>
            <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
              <Heading size="sm" color={useColorModeValue("gray.800", "white")}>
                {activeTab === 0 ? "All Evidence" : "Evidence Files"} 
                <Badge ml={2} fontSize="xs" colorScheme="gray" borderRadius="full">
                  {filteredFiles.length} items
                </Badge>
              </Heading>
              
              <Button
                as="label"
                leftIcon={<FiUpload />}
                colorScheme="blue"
                size="sm"
                cursor="pointer"
                borderRadius="md"
              >
                Upload Files
                <Input
                  type="file"
                  multiple
                  onChange={handleGeneralFileUpload}
                  position="absolute"
                  top={0}
                  left={0}
                  opacity={0}
                  width="100%"
                  height="100%"
                  cursor="pointer"
                />
              </Button>
            </Flex>
          </CardHeader>
          
          <CardBody pt={0}>
            {filteredFiles.length === 0 ? (
              <VStack spacing={4} py={12} textAlign="center">
                <FiDatabase size="48px" color={useColorModeValue("#CBD5E0", "#4A5568")} />
                <Text fontSize="lg" color={mutedText}>
                  {files.length === 0 ? "No evidence files uploaded yet" : "No evidence files match your filters"}
                </Text>
                <Text fontSize="sm" color={mutedText}>
                  Upload your first piece of evidence to get started with compliance management
                </Text>
                <Button
                  onClick={() => {
                    setFilterOption("all");
                    setFrameworkFilter([]);
                    setSearchQuery("");
                  }}
                  colorScheme="blue"
                  variant="outline"
                  size="sm"
                  borderRadius="md"
                >
                  Clear All Filters
                </Button>
              </VStack>
            ) : isGridView ? (
              <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={5}>
                {filteredFiles.map((file) => (
                  <Card 
                    key={file.id} 
                    variant="outline" 
                    bg={cardBg}
                    borderColor={borderColor}
                    borderRadius="lg"
                    overflow="hidden"
                    transition="all 0.2s"
                    _hover={{ transform: "translateY(-2px)", shadow: "md" }}
                  >
                    <CardHeader pb={2}>
                      <Flex justify="space-between">
                        <Badge 
                          colorScheme={getStatusColor(file.status)} 
                          fontSize="xs"
                          borderRadius="full"
                          px={2}
                          py={1}
                        >
                          {file.status.replace('_', ' ')}
                        </Badge>
                        <Menu>
                          <MenuButton
                            as={IconButton}
                            icon={<FiMoreVertical size="16px" />}
                            variant="ghost"
                            size="xs"
                            borderRadius="full"
                          />
                          <MenuList fontSize="sm" minWidth="140px" zIndex={10}>
                            <MenuItem icon={<FiInfo size="14px" />} onClick={() => openFileDetails(file)}>
                              Details
                            </MenuItem>
                            <MenuItem icon={<FiDownload size="14px" />} onClick={() => handleDownload(file)}>
                              Download
                            </MenuItem>
                            <MenuItem 
                              icon={<FiTrash2 size="14px" />} 
                              color="red.500"
                              onClick={() => handleDelete(file.id)}
                            >
                              Delete
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </Flex>
                    </CardHeader>
                    
                    <CardBody py={2}>
                      <Box mb={3} position="relative" borderRadius="md" overflow="hidden">
                        {file.preview ? (
                          <Image
                            src={file.preview}
                            alt={file.name}
                            objectFit="cover"
                            height="140px"
                            width="100%"
                          />
                        ) : (
                          <Box
                            bg={useColorModeValue("gray.100", "gray.700")}
                            height="140px"
                            width="100%"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                          >
                            <FiFile size="32px" color={useColorModeValue("#A0AEC0", "#718096")} />
                          </Box>
                        )}
                      </Box>
                      
                      <Heading size="sm" noOfLines={1} mb={1} color={useColorModeValue("gray.800", "white")}>
                        {file.name}
                      </Heading>
                      
                      <Text fontSize="sm" color={mutedText} noOfLines={2} mb={3}>
                        {file.description || 'No description provided'}
                      </Text>
                      
                      <Flex justify="space-between" align="center" mb={2}>
                        <Badge 
                          colorScheme={
                            file.type.includes('pdf') ? 'red' : 
                            file.type.startsWith('image/') ? 'blue' : 'gray'
                          } 
                          fontSize="xs"
                          borderRadius="full"
                          px={2}
                          py={1}
                        >
                          {file.type.split('/')[1]?.toUpperCase() || file.type.toUpperCase()}
                        </Badge>
                        <Text fontSize="xs" color={mutedText}>
                          {file.sizeDisplay}
                        </Text>
                      </Flex>
                    </CardBody>
                    
                    <CardFooter pt={0}>
                      <Flex justify="space-between" align="center" width="100%">
                        <HStack spacing={2}>
                          <Avatar size="xs" name={file.uploadedBy} />
                          <Text fontSize="xs" color={mutedText}>{file.uploadedBy}</Text>
                        </HStack>
                        <Text fontSize="xs" color={mutedText}>
                          {file.uploadedAtDisplay}
                        </Text>
                      </Flex>
                    </CardFooter>
                  </Card>
                ))}
              </Grid>
            ) : (
              <Box overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th color={mutedText}>Name</Th>
                      <Th color={mutedText}>Status</Th>
                      <Th color={mutedText}>Framework</Th>
                      <Th color={mutedText}>Control</Th>
                      <Th color={mutedText}>Type</Th>
                      <Th color={mutedText}>Size</Th>
                      <Th color={mutedText}>Uploaded By</Th>
                      <Th color={mutedText}>Date</Th>
                      <Th color={mutedText}>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredFiles.map((file) => (
                      <Tr key={file.id} _hover={{ bg: hoverBg }}>
                        <Td fontWeight="medium" color={useColorModeValue("gray.800", "white")}>
                          {file.name}
                        </Td>
                        <Td>
                          <Badge 
                            colorScheme={getStatusColor(file.status)} 
                            fontSize="xs"
                            borderRadius="full"
                            px={2}
                            py={1}
                          >
                            {file.status.replace('_', ' ')}
                          </Badge>
                        </Td>
                        <Td color={useColorModeValue("gray.800", "white")}>{file.frameworkName}</Td>
                        <Td color={useColorModeValue("gray.800", "white")}>{file.controlRef || '-'}</Td>
                        <Td>
                          <Badge 
                            colorScheme={
                              file.type.includes('pdf') ? 'red' : 
                              file.type.startsWith('image/') ? 'blue' : 'gray'
                            } 
                            fontSize="xs"
                            borderRadius="full"
                            px={2}
                            py={1}
                          >
                            {file.type.split('/')[1]?.toUpperCase() || file.type.toUpperCase()}
                          </Badge>
                        </Td>
                        <Td color={useColorModeValue("gray.800", "white")}>{file.sizeDisplay}</Td>
                        <Td color={useColorModeValue("gray.800", "white")}>{file.uploadedBy}</Td>
                        <Td color={useColorModeValue("gray.800", "white")}>{file.uploadedAtDisplay}</Td>
                        <Td>
                          <HStack spacing={1}>
                            <IconButton
                              icon={<FiInfo size="14px" />}
                              size="xs"
                              aria-label="Details"
                              onClick={() => openFileDetails(file)}
                              variant="ghost"
                            />
                            <IconButton
                              icon={<FiDownload size="14px" />}
                              size="xs"
                              aria-label="Download"
                              onClick={() => handleDownload(file)}
                              variant="ghost"
                            />
                            <IconButton
                              icon={<FiTrash2 size="14px" />}
                              size="xs"
                              aria-label="Delete"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => handleDelete(file.id)}
                            />
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}
          </CardBody>
        </Card>
      </Box>

      {/* File Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent borderRadius="lg">
          <ModalHeader borderBottomWidth="1px" borderColor={borderColor}>
            Evidence Details
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6} pt={4}>
            {selectedFile && (
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text fontWeight="semibold" mb={1} color={useColorModeValue("gray.700", "gray.300")}>
                    File Name
                  </Text>
                  <Text color={useColorModeValue("gray.800", "white")}>{selectedFile.name}</Text>
                </Box>
                
                <Box>
                  <Text fontWeight="semibold" mb={1} color={useColorModeValue("gray.700", "gray.300")}>
                    Description
                  </Text>
                  <Textarea 
                    defaultValue={selectedFile.description} 
                    placeholder="Add a description..." 
                    borderColor={borderColor}
                    _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                  />
                </Box>
                
                <Box>
                  <Text fontWeight="semibold" mb={1} color={useColorModeValue("gray.700", "gray.300")}>
                    Compliance Frameworks
                  </Text>
                  <CheckboxGroup 
                    colorScheme="blue" 
                    value={newFrameworks}
                    onChange={setNewFrameworks}
                  >
                    <Wrap>
                      {allFrameworks.map(fw => (
                        <WrapItem key={fw.id}>
                          <Checkbox value={fw.id}>{fw.name}</Checkbox>
                        </WrapItem>
                      ))}
                    </Wrap>
                  </CheckboxGroup>
                </Box>
                
                <Box>
                  <Text fontWeight="semibold" mb={1} color={useColorModeValue("gray.700", "gray.300")}>
                    File Information
                  </Text>
                  <SimpleGrid columns={2} spacing={4}>
                    <Box>
                      <Text fontSize="sm" color={mutedText}>Type</Text>
                      <Text fontSize="sm" color={useColorModeValue("gray.800", "white")}>{selectedFile.type}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color={mutedText}>Size</Text>
                      <Text fontSize="sm" color={useColorModeValue("gray.800", "white")}>{selectedFile.sizeDisplay}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color={mutedText}>Uploaded By</Text>
                      <Text fontSize="sm" color={useColorModeValue("gray.800", "white")}>{selectedFile.uploadedBy}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color={mutedText}>Upload Date</Text>
                      <Text fontSize="sm" color={useColorModeValue("gray.800", "white")}>{selectedFile.uploadedAtDisplay}</Text>
                    </Box>
                  </SimpleGrid>
                </Box>
                
                <Flex justify="flex-end" pt={4}>
                  <Button variant="outline" mr={3} onClick={onClose} borderRadius="md">
                    Cancel
                  </Button>
                  <Button colorScheme="blue" onClick={handleUpdateFrameworks} borderRadius="md">
                    Save Changes
                  </Button>
                </Flex>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

// ButtonGroup component for view toggle
const ButtonGroup = ({ size, isAttached, variant, children }) => {
  return (
    <HStack spacing={0} role="group" isAttached={isAttached} variant={variant}>
      {children}
    </HStack>
  );
};

export default EvidenceCenter;