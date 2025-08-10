import { useState, useCallback } from "react";
import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  IconButton,
  Input,
  List,
  ListItem,
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
  Textarea
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
  FiTag
} from "react-icons/fi";

// Sample frameworks
const FRAMEWORKS = [
  { id: "iso27001", name: "ISO 27001", color: "blue" },
  { id: "nist", name: "NIST CSF", color: "green" },
  { id: "gdpr", name: "GDPR", color: "purple" },
  { id: "hipaa", name: "HIPAA", color: "red" },
  { id: "soc2", name: "SOC 2", color: "orange" },
];

const sampleImages = [
  "https://via.placeholder.com/150/3a0b48/FFFFFF?text=Evidence+1",
  "https://via.placeholder.com/150/5e0a75/FFFFFF?text=Evidence+2",
  "https://via.placeholder.com/150/7a3b8c/FFFFFF?text=Evidence+3"
];

const EvidenceCenter = () => {
  const [files, setFiles] = useState([
    {
      id: "1",
      name: "Security_Audit_Report_2023.pdf",
      type: "pdf",
      size: 2.45,
      sizeDisplay: "2.45 MB",
      uploadedAt: new Date("2023-05-15"),
      uploadedAtDisplay: "05/15/2023",
      preview: null,
      description: "Annual security audit report covering all systems",
      tags: ["security", "audit", "annual"],
      frameworks: ["iso27001", "soc2"],
      uploadedBy: "admin@example.com"
    },
    {
      id: "2",
      name: "Network_Diagram.png",
      type: "image",
      size: 1.20,
      sizeDisplay: "1.20 MB",
      uploadedAt: new Date("2023-06-22"),
      uploadedAtDisplay: "06/22/2023",
      preview: sampleImages[0],
      description: "Current network infrastructure diagram",
      tags: ["network", "diagram"],
      frameworks: ["iso27001", "nist"],
      uploadedBy: "netadmin@example.com"
    },
    // ... other files
  ]);

  const [isGridView, setIsGridView] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [sortOption, setSortOption] = useState("dateDesc");
  const [filterOption, setFilterOption] = useState("all");
  const [frameworkFilter, setFrameworkFilter] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [newFrameworks, setNewFrameworks] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Sort files
  const sortedFiles = [...files].sort((a, b) => {
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
    if (filterOption !== "all" && file.type !== filterOption) return false;
    
    // Framework filter
    if (frameworkFilter.length > 0) {
      return frameworkFilter.some(fw => file.frameworks?.includes(fw));
    }
    
    return true;
  });

  const handleFileUpload = useCallback((e) => {
    // ... (same as previous)
  }, [toast]);

  const handleUpdateFrameworks = () => {
    setFiles(files.map(file => 
      file.id === selectedFile.id 
        ? { ...file, frameworks: newFrameworks } 
        : file
    ));
    toast({
      title: "Frameworks updated",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
    onClose();
  };

  const openFileDetails = (file) => {
    setSelectedFile(file);
    setNewFrameworks(file.frameworks || []);
    onOpen();
  };

  return (
    <Box p={6}>
      <Flex justify="space-between" align="center" mb={8}>
        <Heading size="lg">Evidence Center</Heading>
        
        <HStack spacing={4}>
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
            <option value="nameAsc">Name (A-Z)</option>
            <option value="nameDesc">Name (Z-A)</option>
            <option value="sizeAsc">Size (Smallest)</option>
            <option value="sizeDesc">Size (Largest)</option>
          </Select>

          {/* File Type Filter */}
          <Menu>
            <MenuButton as={Button} rightIcon={<FiChevronDown />} size="sm">
              <FiFilter /> File Type
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => setFilterOption("all")}>All Files</MenuItem>
              <MenuItem onClick={() => setFilterOption("image")}>Images</MenuItem>
              <MenuItem onClick={() => setFilterOption("pdf")}>PDFs</MenuItem>
              <MenuItem onClick={() => setFilterOption("document")}>Documents</MenuItem>
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
                  {FRAMEWORKS.map(fw => (
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

          {/* View Toggle */}
          <IconButton
            icon={<FiGrid />}
            aria-label="Grid view"
            onClick={() => setIsGridView(true)}
            colorScheme={isGridView ? "purple" : "gray"}
          />
          <IconButton
            icon={<FiList />}
            aria-label="List view"
            onClick={() => setIsGridView(false)}
            colorScheme={!isGridView ? "purple" : "gray"}
          />
          
          {/* Upload */}
          <Box position="relative">
            <Button
              as="label"
              leftIcon={<FiUpload />}
              colorScheme="purple"
              isLoading={isLoading}
              cursor="pointer"
            >
              Upload Evidence
              <Input
                type="file"
                multiple
                onChange={handleFileUpload}
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
        </HStack>
      </Flex>

      {/* Active Filters Display */}
      {(filterOption !== "all" || frameworkFilter.length > 0) && (
        <Box mb={4}>
          <Text fontSize="sm" color="gray.600" mb={1}>
            Active filters:
          </Text>
          <Wrap>
            {filterOption !== "all" && (
              <WrapItem>
                <Tag size="sm" colorScheme="blue">
                  File type: {filterOption}
                  <IconButton
                    icon={<FiTrash2 size="12px" />}
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
              const fw = FRAMEWORKS.find(f => f.id === fwId);
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
      {filteredFiles.length === 0 ? (
        <VStack spacing={4} mt={20} textAlign="center">
          <Text fontSize="xl" color="gray.500">
            No evidence files match your filters
          </Text>
          <Button
            onClick={() => {
              setFilterOption("all");
              setFrameworkFilter([]);
            }}
            colorScheme="purple"
            variant="outline"
          >
            Clear All Filters
          </Button>
        </VStack>
      ) : isGridView ? (
        <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={6} mt={6}>
          {filteredFiles.map((file) => (
            <Box
              key={file.id}
              borderWidth="1px"
              borderRadius="lg"
              overflow="hidden"
              p={4}
              _hover={{ shadow: "md" }}
              transition="all 0.2s"
            >
              {/* ... (same grid item content as before) */}
              
              {/* Add framework tags display */}
              {file.frameworks && file.frameworks.length > 0 && (
                <Box mt={3}>
                  <Text fontSize="sm" fontWeight="semibold" mb={1}>
                    <FiTag style={{ display: 'inline', marginRight: 4 }} />
                    Compliance Frameworks:
                  </Text>
                  <Wrap>
                    {file.frameworks.map(fwId => {
                      const fw = FRAMEWORKS.find(f => f.id === fwId);
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
      ) : (
        <Box mt={6}>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Type</Th>
                <Th>Frameworks</Th>
                <Th>Size</Th>
                <Th>Uploaded</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredFiles.map((file) => (
                <Tr key={file.id} _hover={{ bg: "gray.50" }}>
                  <Td>{file.name}</Td>
                  <Td>
                    <Badge colorScheme={
                      file.type === 'pdf' ? 'red' : 
                      file.type === 'image' ? 'blue' : 'gray'
                    }>
                      {file.type.toUpperCase()}
                    </Badge>
                  </Td>
                  <Td>
                    <Wrap>
                      {file.frameworks?.map(fwId => {
                        const fw = FRAMEWORKS.find(f => f.id === fwId);
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
                  <Td>{file.sizeDisplay}</Td>
                  <Td>{file.uploadedAtDisplay}</Td>
                  <Td>
                    <HStack spacing={2}>
                      <IconButton
                        icon={<FiInfo />}
                        aria-label="Details"
                        size="sm"
                        variant="ghost"
                        onClick={() => openFileDetails(file)}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      {/* File Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>File Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedFile && (
              <Grid templateColumns="240px 1fr" gap={6}>
                <Box>
                  {selectedFile.preview ? (
                    <Image
                      src={selectedFile.preview}
                      alt={selectedFile.name}
                      objectFit="contain"
                      height="200px"
                      width="100%"
                      borderRadius="md"
                      border="1px solid"
                      borderColor="gray.200"
                    />
                  ) : (
                    <Box
                      bg="gray.100"
                      height="200px"
                      width="100%"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      borderRadius="md"
                      border="1px solid"
                      borderColor="gray.200"
                    >
                      <Text color="gray.500" textTransform="uppercase">
                        {selectedFile.type} Preview
                      </Text>
                    </Box>
                  )}
                </Box>

                <VStack align="start" spacing={4}>
                  {/* ... other file details ... */}

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
                        {FRAMEWORKS.map(fw => (
                          <WrapItem key={fw.id}>
                            <Checkbox colorScheme={fw.color} value={fw.id}>
                              {fw.name}
                            </Checkbox>
                          </WrapItem>
                        ))}
                      </Wrap>
                    </CheckboxGroup>
                  </FormControl>

                  <HStack mt={6} spacing={4}>
                    <Button 
                      colorScheme="purple"
                      onClick={handleUpdateFrameworks}
                    >
                      Save Changes
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={onClose}
                    >
                      Cancel
                    </Button>
                  </HStack>
                </VStack>
              </Grid>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default EvidenceCenter;