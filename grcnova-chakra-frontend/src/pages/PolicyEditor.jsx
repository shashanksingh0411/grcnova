import React, { useState, useMemo } from "react";
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
  Stack,
  StackDivider,
  Avatar,
} from "@chakra-ui/react";
import {
  FiGrid,
  FiList,
  FiDownload,
  FiTrash2,
  FiMoreVertical,
  FiInfo,
  FiCalendar,
  FiFileText,
  FiFilter,
  FiChevronDown,
  FiCheckSquare,
  FiTag,
  FiPlus,
  FiColumns,
  FiClock,
  FiEye,
  FiUpload,
  FiX,
} from "react-icons/fi";

// Sample frameworks
const FRAMEWORKS = [
  { id: "iso27001", name: "ISO 27001", color: "blue" },
  { id: "nist", name: "NIST CSF", color: "green" },
  { id: "gdpr", name: "GDPR", color: "purple" },
  { id: "hipaa", name: "HIPAA", color: "red" },
  { id: "soc2", name: "SOC 2", color: "orange" },
];

// View types
const VIEW_TYPES = {
  GRID: "grid",
  LIST: "list",
  KANBAN: "kanban",
  TIMELINE: "timeline",
};

const PolicyEditor = () => {
  const [policies, setPolicies] = useState([
    {
      id: "1",
      title: "Information Security Policy",
      version: "2.1",
      lastUpdated: new Date("2023-05-15"),
      lastUpdatedDisplay: "05/15/2023",
      description: "Defines the organization's approach to information security management",
      frameworks: ["iso27001", "nist"],
      status: "active",
      owner: "security-team@example.com",
      document: "infosec-policy-v2.1.pdf",
      companyName: "Acme Corp",
      scope: "All employees, contractors, and third-party vendors",
      procedures: "Regular audits, employee training, incident response plan",
      processes: "Risk assessment, access control, data classification",
    },
    {
      id: "2",
      title: "Data Protection Policy",
      version: "1.4",
      lastUpdated: new Date("2023-06-22"),
      lastUpdatedDisplay: "06/22/2023",
      description: "Outlines procedures for protecting sensitive data",
      frameworks: ["gdpr", "hipaa"],
      status: "active",
      owner: "compliance@example.com",
      document: "data-protection-policy-v1.4.pdf",
      companyName: "Acme Corp",
      scope: "All customer and employee data",
      procedures: "Data encryption, access logs, breach notification",
      processes: "Data inventory, retention schedule, disposal methods",
    },
    {
      id: "3",
      title: "Remote Access Policy",
      version: "1.0",
      lastUpdated: new Date("2023-07-10"),
      lastUpdatedDisplay: "07/10/2023",
      description: "Guidelines for secure remote access to organizational resources",
      frameworks: ["iso27001", "soc2"],
      status: "draft",
      owner: "it-team@example.com",
      document: "remote-access-policy-v1.0.pdf",
      companyName: "Acme Corp",
      scope: "Remote employees and contractors",
      procedures: "VPN usage, multi-factor authentication, device security",
      processes: "Access approval, monitoring, revocation",
    },
  ]);

  const [statusHistory, setStatusHistory] = useState({
    "1": [
      { status: "draft", date: new Date("2023-04-01"), changedBy: "admin@example.com" },
      { status: "review", date: new Date("2023-04-15"), changedBy: "admin@example.com" },
      { status: "active", date: new Date("2023-05-15"), changedBy: "security@example.com" }
    ],
    "2": [
      { status: "draft", date: new Date("2023-05-10"), changedBy: "compliance@example.com" },
      { status: "active", date: new Date("2023-06-22"), changedBy: "compliance@example.com" }
    ],
    "3": [
      { status: "draft", date: new Date("2023-07-01"), changedBy: "it-team@example.com" }
    ]
  });

  const [currentView, setCurrentView] = useState(VIEW_TYPES.GRID);
  const [sortOption, setSortOption] = useState("dateDesc");
  const [statusFilter, setStatusFilter] = useState("all");
  const [frameworkFilter, setFrameworkFilter] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [newFrameworks, setNewFrameworks] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [newPolicy, setNewPolicy] = useState({
    title: "",
    description: "",
    frameworks: [],
    status: "draft",
    companyName: "",
    scope: "",
    procedures: "",
    processes: "",
  });
  const [draggedItem, setDraggedItem] = useState(null);

  const {
    isOpen: isDetailsOpen,
    onOpen: onDetailsOpen,
    onClose: onDetailsClose,
  } = useDisclosure();

  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onClose: onCreateClose,
  } = useDisclosure();

  const toast = useToast();

  const handleStatusUpdate = (policyId, newStatus) => {
    try {
      const policy = policies.find(p => p.id === policyId);
      if (!policy) throw new Error("Policy not found");

      // Validate status transition
      const validTransitions = {
        draft: ["review"],
        review: ["active", "draft"],
        active: ["archived", "review"],
        archived: ["draft"]
      };

      if (!validTransitions[policy.status]?.includes(newStatus)) {
        throw new Error(`Invalid status transition from ${policy.status} to ${newStatus}`);
      }

      setPolicies(policies.map(p => 
        p.id === policyId ? { 
          ...p, 
          status: newStatus,
          lastUpdated: new Date(),
          lastUpdatedDisplay: new Date().toLocaleDateString()
        } : p
      ));

      // Update history
      setStatusHistory(prev => ({
        ...prev,
        [policyId]: [
          ...(prev[policyId] || []),
          { 
            status: newStatus, 
            date: new Date(), 
            changedBy: "current-user@example.com" 
          }
        ]
      }));

      toast({
        title: "Status updated",
        description: `Changed ${policy.title} from ${policy.status} to ${newStatus}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error updating status",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Calculate filteredPolicies using useMemo for performance
  const filteredPolicies = useMemo(() => {
    let result = [...policies];

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((policy) => policy.status === statusFilter);
    }

    // Apply framework filter
    if (frameworkFilter.length > 0) {
      result = result.filter((policy) =>
        frameworkFilter.some((fw) => policy.frameworks?.includes(fw))
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortOption) {
        case "titleAsc":
          return a.title.localeCompare(b.title);
        case "titleDesc":
          return b.title.localeCompare(a.title);
        case "dateAsc":
          return a.lastUpdated - b.lastUpdated;
        case "dateDesc":
          return b.lastUpdated - a.lastUpdated;
        case "versionAsc":
          return a.version.localeCompare(b.version);
        case "versionDesc":
          return b.version.localeCompare(a.version);
        default:
          return 0;
      }
    });

    return result;
  }, [policies, statusFilter, frameworkFilter, sortOption]);

  const handleCreatePolicy = () => {
    try {
      if (!newPolicy.title || !newPolicy.description || !newPolicy.companyName || !newPolicy.scope) {
        throw new Error("Please fill all required fields");
      }

      const newPolicyObj = {
        id: Math.random().toString(36).substring(2, 9),
        title: newPolicy.title,
        description: newPolicy.description,
        frameworks: newPolicy.frameworks,
        status: newPolicy.status,
        version: "1.0",
        lastUpdated: new Date(),
        lastUpdatedDisplay: new Date().toLocaleDateString(),
        owner: "current-user@example.com",
        document: uploadedFile
          ? uploadedFile.name
          : `${newPolicy.title.toLowerCase().replace(/ /g, "-")}-v1.0.pdf`,
        companyName: newPolicy.companyName,
        scope: newPolicy.scope,
        procedures: newPolicy.procedures,
        processes: newPolicy.processes,
      };

      setPolicies([...policies, newPolicyObj]);
      setStatusHistory(prev => ({
        ...prev,
        [newPolicyObj.id]: [
          { 
            status: newPolicy.status, 
            date: new Date(), 
            changedBy: "current-user@example.com" 
          }
        ]
      }));

      toast({
        title: "Policy created",
        description: `${newPolicy.title} has been added`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setNewPolicy({
        title: "",
        description: "",
        frameworks: [],
        status: "draft",
        companyName: "",
        scope: "",
        procedures: "",
        processes: "",
      });
      setUploadedFile(null);
      onCreateClose();
    } catch (error) {
      toast({
        title: "Error creating policy",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleUpdateFrameworks = () => {
    try {
      if (!selectedPolicy) {
        throw new Error("No policy selected");
      }

      setPolicies(
        policies.map((policy) =>
          policy.id === selectedPolicy.id
            ? { ...policy, frameworks: newFrameworks }
            : policy
        )
      );
      toast({
        title: "Frameworks updated",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      onDetailsClose();
    } catch (error) {
      toast({
        title: "Error updating frameworks",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const openPolicyDetails = (policy) => {
    try {
      if (!policy) {
        throw new Error("No policy selected");
      }
      setSelectedPolicy(policy);
      setNewFrameworks(policy.frameworks || []);
      onDetailsOpen();
    } catch (error) {
      toast({
        title: "Error opening policy",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleFileUpload = (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        throw new Error("File size exceeds 5MB limit");
      }

      if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
        throw new Error("Only PDF and Word documents are allowed");
      }

      setUploadedFile(file);
    } catch (error) {
      toast({
        title: "Upload error",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
  };

  // Enhanced drag and drop handlers for Kanban
  const handleDragStart = (e, policy) => {
    setDraggedItem(policy);
    e.dataTransfer.setData("text/plain", policy.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    if (!draggedItem) return;

    const policyId = e.dataTransfer.getData("text/plain");
    if (!policyId) return;

    // Don't update if status hasn't changed
    if (draggedItem.status === newStatus) return;

    handleStatusUpdate(policyId, newStatus);
    setDraggedItem(null);
  };

  // Kanban columns
  const kanbanColumns = [
    { id: "draft", title: "Draft", color: "orange" },
    { id: "review", title: "In Review", color: "yellow" },
    { id: "active", title: "Active", color: "green" },
    { id: "archived", title: "Archived", color: "gray" },
  ];

  return (
    <Box p={6}>
      <Flex justify="space-between" align="center" mb={8}>
        <Heading size="lg">Policy Editor</Heading>
        
        <HStack spacing={4}>
          {/* View Toggle */}
          <Menu>
            <MenuButton as={Button} rightIcon={<FiChevronDown />} size="sm">
              <FiEye /> View
            </MenuButton>
            <MenuList>
              <MenuItem icon={<FiGrid />} onClick={() => setCurrentView(VIEW_TYPES.GRID)}>
                Grid View
              </MenuItem>
              <MenuItem icon={<FiList />} onClick={() => setCurrentView(VIEW_TYPES.LIST)}>
                List View
              </MenuItem>
              <MenuItem icon={<FiColumns />} onClick={() => setCurrentView(VIEW_TYPES.KANBAN)}>
                Kanban View
              </MenuItem>
              <MenuItem icon={<FiClock />} onClick={() => setCurrentView(VIEW_TYPES.TIMELINE)}>
                Timeline View
              </MenuItem>
            </MenuList>
          </Menu>

          {/* Sorting */}
          <Select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            width="200px"
            size="sm"
            icon={<FiChevronDown />}
          >
            <option value="dateDesc">Newest First</option>
            <option value="dateAsc">Oldest First</option>
            <option value="titleAsc">Title (A-Z)</option>
            <option value="titleDesc">Title (Z-A)</option>
            <option value="versionAsc">Version (Low-High)</option>
            <option value="versionDesc">Version (High-Low)</option>
          </Select>

          {/* Status Filter */}
          <Menu>
            <MenuButton as={Button} rightIcon={<FiChevronDown />} size="sm">
              <FiFilter /> Status
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => setStatusFilter("all")}>All Statuses</MenuItem>
              <MenuItem onClick={() => setStatusFilter("active")}>Active</MenuItem>
              <MenuItem onClick={() => setStatusFilter("draft")}>Draft</MenuItem>
              <MenuItem onClick={() => setStatusFilter("review")}>In Review</MenuItem>
              <MenuItem onClick={() => setStatusFilter("archived")}>Archived</MenuItem>
            </MenuList>
          </Menu>

          {/* Framework Filter */}
          <Menu closeOnSelect={false}>
            <MenuButton as={Button} rightIcon={<FiChevronDown />} size="sm">
              <FiCheckSquare /> Frameworks
            </MenuButton>
            <MenuList minWidth="240px" p={2}>
              <CheckboxGroup
                value={frameworkFilter}
                onChange={setFrameworkFilter}
              >
                <VStack align="start" spacing={2}>
                  {FRAMEWORKS.map((fw) => (
                    <Checkbox key={fw.id} value={fw.id} colorScheme={fw.color}>
                      {fw.name}
                    </Checkbox>
                  ))}
                </VStack>
              </CheckboxGroup>
              {frameworkFilter.length > 0 && (
                <Button
                  size="xs"
                  mt={2}
                  onClick={() => setFrameworkFilter([])}
                  variant="link"
                  colorScheme="blue"
                >
                  Clear filters
                </Button>
              )}
            </MenuList>
          </Menu>
          
          {/* Create Policy */}
          <Button
            leftIcon={<FiPlus />}
            colorScheme="purple"
            onClick={onCreateOpen}
          >
            Create Policy
          </Button>
        </HStack>
      </Flex>

      {/* Active Filters Display */}
      {(statusFilter !== "all" || frameworkFilter.length > 0) && (
        <Box mb={4}>
          <Text fontSize="sm" color="gray.600" mb={1}>
            Active filters:
          </Text>
          <Wrap>
            {statusFilter !== "all" && (
              <WrapItem>
                <Tag size="sm" colorScheme="blue">
                  Status: {statusFilter}
                  <IconButton
                    icon={<FiTrash2 size="12px" />}
                    size="xs"
                    variant="ghost"
                    ml={1}
                    aria-label="Remove filter"
                    onClick={() => setStatusFilter("all")}
                  />
                </Tag>
              </WrapItem>
            )}
            {frameworkFilter.map((fwId) => {
              const fw = FRAMEWORKS.find((f) => f.id === fwId);
              return (
                <WrapItem key={fwId}>
                  <Tag size="sm" colorScheme={fw?.color || "gray"}>
                    {fw?.name || fwId}
                    <IconButton
                      icon={<FiTrash2 size="12px" />}
                      size="xs"
                      variant="ghost"
                      ml={1}
                      aria-label="Remove filter"
                      onClick={() =>
                        setFrameworkFilter(frameworkFilter.filter((id) => id !== fwId))
                      }
                    />
                  </Tag>
                </WrapItem>
              );
            })}
          </Wrap>
        </Box>
      )}

      {/* View Content */}
      {filteredPolicies.length === 0 ? (
        <VStack spacing={4} mt={20} textAlign="center">
          <Text fontSize="xl" color="gray.500">
            No policies match your filters
          </Text>
          <Button
            onClick={() => {
              setStatusFilter("all");
              setFrameworkFilter([]);
            }}
            colorScheme="purple"
            variant="outline"
          >
            Clear All Filters
          </Button>
        </VStack>
      ) : (
        <>
          {currentView === VIEW_TYPES.GRID && (
            <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={6} mt={6}>
              {filteredPolicies.map((policy) => (
                <Box
                  key={policy.id}
                  borderWidth="1px"
                  borderRadius="lg"
                  overflow="hidden"
                  p={4}
                  _hover={{ shadow: "md" }}
                  transition="all 0.2s"
                  onClick={() => openPolicyDetails(policy)}
                  cursor="pointer"
                >
                  <Flex justify="space-between" align="start">
                    <Box>
                      <Heading size="md" mb={1}>{policy.title}</Heading>
                      <Text fontSize="sm" color="gray.500" mb={2}>
                        Version {policy.version}
                      </Text>
                      <Select
                        value={policy.status}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleStatusUpdate(policy.id, e.target.value);
                        }}
                        size="sm"
                        width="120px"
                        mb={3}
                      >
                        <option value="draft">Draft</option>
                        <option value="review" disabled={policy.status !== "draft" && policy.status !== "active"}>
                          Review
                        </option>
                        <option value="active" disabled={policy.status !== "review"}>
                          Active
                        </option>
                        <option value="archived" disabled={policy.status !== "active"}>
                          Archived
                        </option>
                      </Select>
                    </Box>
                    <Menu>
                      <MenuButton 
                        as={IconButton} 
                        icon={<FiMoreVertical />} 
                        size="sm" 
                        variant="ghost"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <MenuList>
                        <MenuItem icon={<FiDownload />}>Download</MenuItem>
                        <MenuItem icon={<FiInfo />} onClick={() => openPolicyDetails(policy)}>
                          Details
                        </MenuItem>
                        <MenuItem icon={<FiTrash2 />} color="red.500">
                          Delete
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </Flex>

                  <Text fontSize="sm" mb={3} noOfLines={3}>
                    {policy.description}
                  </Text>

                  <HStack spacing={2} mb={3}>
                    <FiCalendar size="14px" color="#718096" />
                    <Text fontSize="sm" color="gray.500">
                      Last updated: {policy.lastUpdatedDisplay}
                    </Text>
                  </HStack>

                  {policy.frameworks && policy.frameworks.length > 0 && (
                    <Box>
                      <Text fontSize="sm" fontWeight="semibold" mb={1}>
                        <FiTag style={{ display: 'inline', marginRight: 4 }} />
                        Compliance Frameworks:
                      </Text>
                      <Wrap>
                        {policy.frameworks.map((fwId) => {
                          const fw = FRAMEWORKS.find((f) => f.id === fwId);
                          return (
                            <WrapItem key={fwId}>
                              <Tag size="sm" colorScheme={fw?.color || "gray"}>
                                {fw?.name || fwId}
                              </Tag>
                            </WrapItem>
                          );
                        })}
                      </Wrap>
                    </Box>
                  )}
                </Box>
              ))}
            </Grid>
          )}

          {currentView === VIEW_TYPES.LIST && (
            <Box mt={6}>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Policy Title</Th>
                    <Th>Version</Th>
                    <Th>Status</Th>
                    <Th>Frameworks</Th>
                    <Th>Last Updated</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredPolicies.map((policy) => (
                    <Tr 
                      key={policy.id} 
                      _hover={{ bg: "gray.50" }}
                      onClick={() => openPolicyDetails(policy)}
                      cursor="pointer"
                    >
                      <Td fontWeight="medium">{policy.title}</Td>
                      <Td>v{policy.version}</Td>
                      <Td>
                        <Select
                          value={policy.status}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleStatusUpdate(policy.id, e.target.value);
                          }}
                          size="sm"
                          width="120px"
                        >
                          <option value="draft">Draft</option>
                          <option value="review" disabled={policy.status !== "draft" && policy.status !== "active"}>
                            Review
                          </option>
                          <option value="active" disabled={policy.status !== "review"}>
                            Active
                          </option>
                          <option value="archived" disabled={policy.status !== "active"}>
                            Archived
                          </option>
                        </Select>
                      </Td>
                      <Td>
                        <Wrap>
                          {policy.frameworks?.map((fwId) => {
                            const fw = FRAMEWORKS.find((f) => f.id === fwId);
                            return (
                              <WrapItem key={fwId}>
                                <Tag size="sm" colorScheme={fw?.color || "gray"}>
                                  {fw?.name || fwId}
                                </Tag>
                              </WrapItem>
                            );
                          })}
                        </Wrap>
                      </Td>
                      <Td>{policy.lastUpdatedDisplay}</Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            icon={<FiDownload />}
                            aria-label="Download"
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Add download logic here
                            }}
                          />
                          <IconButton
                            icon={<FiInfo />}
                            aria-label="Details"
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              openPolicyDetails(policy);
                            }}
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}

          {currentView === VIEW_TYPES.KANBAN && (
            <Box mt={6} overflowX="auto">
              <HStack align="start" spacing={4}>
                {kanbanColumns.map((column) => (
                  <Box
                    key={column.id}
                    minW="300px"
                    bg="gray.50"
                    borderRadius="md"
                    p={3}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, column.id)}
                  >
                    <Flex justify="space-between" align="center" mb={4}>
                      <HStack>
                        <Badge colorScheme={column.color}>{column.title}</Badge>
                        <Badge variant="subtle" colorScheme="gray">
                          {filteredPolicies.filter((p) => p.status === column.id).length}
                        </Badge>
                      </HStack>
                    </Flex>
                    <Stack spacing={3}>
                      {filteredPolicies
                        .filter((policy) => policy.status === column.id)
                        .map((policy) => (
                          <Box
                            key={policy.id}
                            borderWidth="1px"
                            borderRadius="md"
                            p={3}
                            bg="white"
                            draggable
                            onDragStart={(e) => handleDragStart(e, policy)}
                            opacity={draggedItem?.id === policy.id ? 0.5 : 1}
                            cursor="grab"
                            _active={{ cursor: "grabbing" }}
                            onClick={() => openPolicyDetails(policy)}
                          >
                            <Flex justify="space-between">
                              <Text fontWeight="semibold">{policy.title}</Text>
                              <Select
                                size="xs"
                                value={policy.status}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleStatusUpdate(policy.id, e.target.value);
                                }}
                                width="100px"
                              >
                                <option value="draft">Draft</option>
                                <option value="review">Review</option>
                                <option value="active">Active</option>
                                <option value="archived">Archived</option>
                              </Select>
                            </Flex>
                            <Text fontSize="sm" color="gray.500">
                              v{policy.version}
                            </Text>
                            <Text fontSize="sm" noOfLines={2} mt={2}>
                              {policy.description}
                            </Text>
                            <HStack mt={2} spacing={1}>
                              {policy.frameworks.map((fwId) => {
                                const fw = FRAMEWORKS.find(f => f.id === fwId);
                                return (
                                  <Badge key={fwId} colorScheme={fw.color} fontSize="xs">
                                    {fw.name}
                                  </Badge>
                                );
                              })}
                            </HStack>
                          </Box>
                        ))}
                    </Stack>
                  </Box>
                ))}
              </HStack>
            </Box>
          )}

          {currentView === VIEW_TYPES.TIMELINE && (
            <Box mt={6}>
              <VStack align="stretch" spacing={0} divider={<StackDivider />}>
                {filteredPolicies
                  .sort((a, b) => b.lastUpdated - a.lastUpdated)
                  .map((policy) => (
                    <Flex 
                      key={policy.id} 
                      p={4} 
                      _hover={{ bg: 'gray.50' }}
                      onClick={() => openPolicyDetails(policy)}
                      cursor="pointer"
                    >
                      <Box flexShrink={0} mr={4}>
                        <Avatar 
                          name={policy.title} 
                          bg="purple.100" 
                          color="purple.800"
                        />
                      </Box>
                      <Box flex="1">
                        <Flex justify="space-between">
                          <Box>
                            <Heading size="sm">{policy.title}</Heading>
                            <Text fontSize="sm" color="gray.500">
                              Version {policy.version} • {policy.status.toUpperCase()}
                            </Text>
                          </Box>
                          <Text fontSize="sm" color="gray.500">
                            {policy.lastUpdated.toLocaleDateString()}
                          </Text>
                        </Flex>
                        <Text mt={2} fontSize="sm">
                          {policy.description}
                        </Text>
                        <Wrap mt={2}>
                          {policy.frameworks?.map((fwId) => {
                            const fw = FRAMEWORKS.find((f) => f.id === fwId);
                            return (
                              <WrapItem key={fwId}>
                                <Tag size="sm" colorScheme={fw?.color || "gray"}>
                                  {fw?.name || fwId}
                                </Tag>
                              </WrapItem>
                            );
                          })}
                        </Wrap>
                        <Flex mt={3} align="center">
                          <Text fontSize="xs" color="gray.500" mr={2}>
                            Owner:
                          </Text>
                          <Avatar 
                            name={policy.owner} 
                            size="xs" 
                            src={`https://i.pravatar.cc/150?u=${policy.owner}`}
                            mr={2}
                          />
                          <Text fontSize="sm">{policy.owner}</Text>
                        </Flex>
                      </Box>
                    </Flex>
                  ))}
              </VStack>
            </Box>
          )}
        </>
      )}

      {/* Policy Details Modal */}
      <Modal isOpen={isDetailsOpen} onClose={onDetailsClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Policy Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedPolicy && (
              <Grid templateColumns="1fr" gap={6}>
                <Box>
                  <Heading size="md" mb={2}>{selectedPolicy.title}</Heading>
                  <HStack spacing={4} mb={4}>
                    <Text fontSize="sm" color="gray.500">
                      Version: v{selectedPolicy.version}
                    </Text>
                  </HStack>
                  
                  <FormControl>
                    <FormLabel>Status</FormLabel>
                    <Select
                      value={selectedPolicy.status}
                      onChange={(e) => handleStatusUpdate(selectedPolicy.id, e.target.value)}
                    >
                      <option value="draft">Draft</option>
                      <option value="review" disabled={selectedPolicy.status !== "draft" && selectedPolicy.status !== "active"}>
                        In Review
                      </option>
                      <option value="active" disabled={selectedPolicy.status !== "review"}>
                        Active
                      </option>
                      <option value="archived" disabled={selectedPolicy.status !== "active"}>
                        Archived
                      </option>
                    </Select>
                  </FormControl>

                  <VStack align="start" spacing={4} divider={<StackDivider />} mt={4}>
                    <Box>
                      <Text fontWeight="semibold">Company Name</Text>
                      <Text>{selectedPolicy.companyName}</Text>
                    </Box>
                    
                    <Box>
                      <Text fontWeight="semibold">Description</Text>
                      <Text>{selectedPolicy.description}</Text>
                    </Box>
                    
                    <Box>
                      <Text fontWeight="semibold">Scope</Text>
                      <Text>{selectedPolicy.scope}</Text>
                    </Box>
                    
                    <Box>
                      <Text fontWeight="semibold">Processes</Text>
                      <Text>{selectedPolicy.processes}</Text>
                    </Box>
                    
                    <Box>
                      <Text fontWeight="semibold">Procedures</Text>
                      <Text>{selectedPolicy.procedures}</Text>
                    </Box>
                  </VStack>

                  <HStack spacing={4} mb={4} mt={4}>
                    <Box>
                      <Text fontWeight="semibold">Last Updated</Text>
                      <Text>{selectedPolicy.lastUpdated.toLocaleDateString()}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="semibold">Owner</Text>
                      <Text>{selectedPolicy.owner}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="semibold">Document</Text>
                      <Text>{selectedPolicy.document}</Text>
                    </Box>
                  </HStack>

                  <FormControl>
                    <FormLabel>
                      <FiCheckSquare style={{ display: 'inline', marginRight: 6 }} />
                      Compliance Frameworks
                    </FormLabel>
                    <CheckboxGroup
                      value={newFrameworks}
                      onChange={setNewFrameworks}
                    >
                      <Wrap spacing={3}>
                        {FRAMEWORKS.map((fw) => (
                          <WrapItem key={fw.id}>
                            <Checkbox colorScheme={fw.color} value={fw.id}>
                              {fw.name}
                            </Checkbox>
                          </WrapItem>
                        ))}
                      </Wrap>
                    </CheckboxGroup>
                  </FormControl>

                  <Box mt={4}>
                    <Text fontWeight="semibold" mb={2}>Status History</Text>
                    <VStack align="stretch" spacing={2}>
                      {(statusHistory[selectedPolicy.id] || []).map((entry, idx) => (
                        <Flex key={idx} justify="space-between" fontSize="sm">
                          <Badge colorScheme={
                            entry.status === "active" ? "green" : 
                            entry.status === "draft" ? "orange" : 
                            entry.status === "review" ? "yellow" : "gray"
                          }>
                            {entry.status.toUpperCase()}
                          </Badge>
                          <Text>{entry.date.toLocaleDateString()}</Text>
                          <Text color="gray.500">{entry.changedBy}</Text>
                        </Flex>
                      ))}
                    </VStack>
                  </Box>

                  <HStack mt={6} spacing={4}>
                    <Button 
                      colorScheme="purple"
                      onClick={handleUpdateFrameworks}
                    >
                      Save Changes
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={onDetailsClose}
                    >
                      Close
                    </Button>
                  </HStack>
                </Box>
              </Grid>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Create Policy Modal */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Policy</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Company Name</FormLabel>
                <Input
                  placeholder="e.g., Acme Corp"
                  value={newPolicy.companyName}
                  onChange={(e) => setNewPolicy({...newPolicy, companyName: e.target.value})}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Policy Title</FormLabel>
                <Input
                  placeholder="e.g., Information Security Policy"
                  value={newPolicy.title}
                  onChange={(e) => setNewPolicy({...newPolicy, title: e.target.value})}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Description</FormLabel>
                <Textarea
                  placeholder="Describe the purpose and scope of this policy..."
                  value={newPolicy.description}
                  onChange={(e) => setNewPolicy({...newPolicy, description: e.target.value})}
                  rows={3}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Scope</FormLabel>
                <Textarea
                  placeholder="Who or what does this policy apply to?"
                  value={newPolicy.scope}
                  onChange={(e) => setNewPolicy({...newPolicy, scope: e.target.value})}
                  rows={2}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Processes</FormLabel>
                <Textarea
                  placeholder="What processes are involved in this policy?"
                  value={newPolicy.processes}
                  onChange={(e) => setNewPolicy({...newPolicy, processes: e.target.value})}
                  rows={2}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Procedures</FormLabel>
                <Textarea
                  placeholder="What specific procedures are defined in this policy?"
                  value={newPolicy.procedures}
                  onChange={(e) => setNewPolicy({...newPolicy, procedures: e.target.value})}
                  rows={2}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Status</FormLabel>
                <Select
                  value={newPolicy.status}
                  onChange={(e) => setNewPolicy({...newPolicy, status: e.target.value})}
                >
                  <option value="draft">Draft</option>
                  <option value="review">In Review</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>
                  <FiCheckSquare style={{ display: 'inline', marginRight: 6 }} />
                  Compliance Frameworks
                </FormLabel>
                <CheckboxGroup
                  value={newPolicy.frameworks}
                  onChange={(values) => setNewPolicy({...newPolicy, frameworks: values})}
                >
                  <Wrap spacing={3}>
                    {FRAMEWORKS.map((fw) => (
                      <WrapItem key={fw.id}>
                        <Checkbox colorScheme={fw.color} value={fw.id}>
                          {fw.name}
                        </Checkbox>
                      </WrapItem>
                    ))}
                  </Wrap>
                </CheckboxGroup>
              </FormControl>

              <FormControl>
                <FormLabel>Upload Policy Document</FormLabel>
                {uploadedFile ? (
                  <Box borderWidth="1px" borderRadius="md" p={3}>
                    <Flex justify="space-between" align="center">
                      <HStack>
                        <FiFileText />
                        <Text>{uploadedFile.name}</Text>
                        <Text fontSize="sm" color="gray.500">
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                        </Text>
                      </HStack>
                      <IconButton
                        icon={<FiX />}
                        size="sm"
                        variant="ghost"
                        aria-label="Remove file"
                        onClick={removeUploadedFile}
                      />
                    </Flex>
                  </Box>
                ) : (
                  <Box
                    borderWidth="1px"
                    borderStyle="dashed"
                    borderRadius="md"
                    p={6}
                    textAlign="center"
                  >
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      display="none"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload">
                      <Button
                        leftIcon={<FiUpload />}
                        variant="outline"
                        as="span"
                        cursor="pointer"
                      >
                        Choose File
                      </Button>
                    </label>
                    <Text mt={2} fontSize="sm" color="gray.500">
                      PDF, DOC, DOCX (Max 5MB)
                    </Text>
                  </Box>
                )}
              </FormControl>

              <HStack mt={6} spacing={4} justify="flex-end">
                <Button 
                  colorScheme="purple"
                  onClick={handleCreatePolicy}
                  isDisabled={!newPolicy.title || !newPolicy.description || !newPolicy.companyName || !newPolicy.scope}
                >
                  Create Policy
                </Button>
                <Button 
                  variant="outline" 
                  onClick={onCreateClose}
                >
                  Cancel
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default PolicyEditor;