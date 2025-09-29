import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Heading, Flex, Input, InputGroup, InputLeftElement, VStack, HStack, Text, Tag, useColorModeValue,
  FormControl, FormLabel, useToast, Select, Button, Card, CardHeader, CardBody,
  Badge, Progress, Avatar, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Skeleton,
  IconButton, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, Center,
  Tabs, TabList, TabPanels, Tab, TabPanel, Icon, Modal, ModalOverlay, ModalContent,
  ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure, Textarea,
  Spinner, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader,
  AlertDialogContent, AlertDialogOverlay, Checkbox, CheckboxGroup, Stack, Table,
  Thead, Tbody, Tr, Th, Td, InputRightElement
} from '@chakra-ui/react';
import {
  FiUpload, FiCheckCircle, FiFile, FiUsers, FiSettings, FiAlertCircle,
  FiCalendar, FiTrash2, FiDownload, FiShare2, FiRefreshCw, FiArchive,
  FiDatabase, FiBarChart2, FiEye, FiPlus, FiEdit2, FiArrowUp, FiArrowDown,
  FiSearch
} from 'react-icons/fi';
import { supabase } from "../../supabase";
import { useAuth } from '../../context/AuthContext';
import ProtectedRoute from '../../auth/ProtectedRoute';

// Constants
const FRAMEWORKS_CONFIG = {
  'ISO27001:2022': { id: 'ISO27001:2022', name: 'ISO 27001:2022', iconColor: 'blue' },
  'HIPAA': { id: 'HIPAA', name: 'HIPAA', iconColor: 'green' },
  'SOC2': { id: 'SOC2', name: 'SOC 2', iconColor: 'purple' },
  'GDPR': { id: 'GDPR', name: 'GDPR', iconColor: 'red' }
};

const STATUS_OPTIONS = [
  { value: 'not_started', label: 'Not Started', color: 'gray' },
  { value: 'in_progress', label: 'In Progress', color: 'orange' },
  { value: 'implemented', label: 'Implemented', color: 'green' },
  { value: 'exempt', label: 'Exempt', color: 'purple' },
];

const SORT_OPTIONS = {
  ASC: 'asc',
  DESC: 'desc'
};

const EVIDENCE_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Utility functions
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const generateUniqueFileName = (originalName, controlId) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  const baseName = originalName.split('.').slice(0, -1).join('.');
  return `${controlId}_${baseName}_${timestamp}_${randomString}.${extension}`;
};

const checkFileExists = async (filePath) => {
  try {
    const pathParts = filePath.split('/');
    const dir = pathParts.slice(0, -1).join('/');
    const filename = pathParts.slice(-1)[0];

    const { data, error } = await supabase.storage
      .from('evidence')
      .list(dir || '', {
        limit: 100,
        offset: 0,
        search: filename
      });

    if (error) throw error;
    return data && data.length > 0 && data.some(item => item.name === filename);
  } catch (error) {
    console.error('Error checking file existence:', error);
    return false;
  }
};

/* -------------------------
   Policy Mapping Component
-------------------------- */
const PolicyMappingManager = ({ organization }) => {
  const toast = useToast();
  const [policies, setPolicies] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [suggestions, setSuggestions] = useState({});
  const [loadingSuggestions, setLoadingSuggestions] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Fetch uploaded policies
  const fetchPolicies = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('uploaded_policies')
        .select('*')
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPolicies(data || []);
    } catch (err) {
      console.error('Error fetching policies:', err);
      toast({ 
        title: "Error loading policies", 
        description: err.message || 'Unknown error', 
        status: "error" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch existing mappings
  const fetchMappings = async () => {
    try {
      const { data, error } = await supabase
        .from('policy_control_mappings')
        .select(`
          id,
          confidence,
          uploaded_policies (id, title),
          framework_controls (id, control_ref, control_name)
        `)
        .eq('uploaded_policies.organization_id', organization.id);

      if (error) throw error;
      setMappings(data || []);
    } catch (err) {
      console.error('Error fetching mappings:', err);
      toast({ 
        title: "Error loading mappings", 
        description: err.message || 'Unknown error', 
        status: "error" 
      });
    }
  };

  // Fetch AI suggestions for a specific policy
  const fetchSuggestions = async (policyId) => {
    try {
      setLoadingSuggestions(prev => ({ ...prev, [policyId]: true }));
      
      // First check if the policy has an embedding
      const { data: policyData } = await supabase
        .from('uploaded_policies')
        .select('embedding')
        .eq('id', policyId)
        .single();

      if (!policyData || !policyData.embedding) {
        toast({
          title: "No embeddings found",
          description: "This policy doesn't have embeddings yet. Please generate embeddings first.",
          status: "warning",
          isClosable: true
        });
        return;
      }

      const { data, error } = await supabase.rpc('match_policy_controls', {
        policy_id: policyId,
        match_count: 5,
        match_threshold: 0.3
      });

      if (error) {
        console.error('RPC Error:', error);
        throw error;
      }
      
      setSuggestions(prev => ({ ...prev, [policyId]: data || [] }));
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      toast({ 
        title: "Error fetching suggestions", 
        description: err.message || 'Unknown error', 
        status: "error" 
      });
    } finally {
      setLoadingSuggestions(prev => ({ ...prev, [policyId]: false }));
    }
  };

  // Accept a suggestion → create mapping
  const handleMapPolicyToControl = async (policyId, controlId, confidence) => {
    try {
      const { data, error } = await supabase
        .from('policy_control_mappings')
        .insert({
          policy_id: policyId,
          control_id: controlId,
          confidence,
        })
        .select(`
          id,
          confidence,
          uploaded_policies (id, title),
          framework_controls (id, control_ref, control_name)
        `)
        .single();

      if (error) throw error;
      
      toast({ title: "Mapping created", status: "success" });
      
      // Update mappings immediately
      setMappings(prev => [...prev, data]);
      
      // Clear suggestions for this policy
      setSuggestions(prev => ({ ...prev, [policyId]: [] }));
      
    } catch (err) {
      console.error('Error creating mapping:', err);
      toast({ 
        title: "Mapping failed", 
        description: err.message || 'Unknown error', 
        status: "error" 
      });
    }
  };

  // Delete mapping
  const handleDeleteMapping = async (id) => {
    try {
      const { error } = await supabase
        .from('policy_control_mappings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Mapping deleted", status: "success" });
      setMappings(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error('Error deleting mapping:', err);
      toast({ 
        title: "Delete failed", 
        description: err.message || 'Unknown error', 
        status: "error" 
      });
    }
  };

  useEffect(() => {
    if (organization?.id) {
      fetchPolicies();
      fetchMappings();
    }
  }, [organization?.id]);

  if (isLoading) {
    return (
      <Center py={10}>
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text color="gray.500">Loading policies...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box>
      <Heading size="md" mb={4}>Policy → Control Mappings</Heading>

      {/* Debug info - remove in production */}
      <Box mb={4} p={3} bg="gray.100" borderRadius="md">
        <Text fontSize="sm" fontWeight="bold">Debug Info:</Text>
        <Text fontSize="sm">Policies found: {policies.length}</Text>
        <Text fontSize="sm">Mappings found: {mappings.length}</Text>
        <Button 
          size="xs" 
          onClick={() => console.log('Policies:', policies, 'Mappings:', mappings)}
          mt={2}
        >
          Log Data to Console
        </Button>
      </Box>

      {/* Policies + Suggestions */}
      <Box mb={6}>
        <Table variant="striped" size="sm">
          <Thead>
            <Tr>
              <Th>Policy</Th>
              <Th>Framework</Th>
              <Th>Uploaded</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {policies.length === 0 ? (
              <Tr>
                <Td colSpan={4} textAlign="center" py={6}>
                  <VStack spacing={2}>
                    <Icon as={FiFile} boxSize={8} color="gray.300" />
                    <Text color="gray.500">No policies uploaded yet</Text>
                  </VStack>
                </Td>
              </Tr>
            ) : (
              policies.map(policy => (
                <React.Fragment key={policy.id}>
                  <Tr>
                    <Td fontWeight="medium">{policy.title}</Td>
                    <Td>
                      <Badge colorScheme="blue">{policy.framework}</Badge>
                    </Td>
                    <Td>{new Date(policy.created_at).toLocaleDateString()}</Td>
                    <Td>
                      <Button
                        size="xs"
                        leftIcon={<FiPlus />}
                        onClick={() => fetchSuggestions(policy.id)}
                        isLoading={loadingSuggestions[policy.id]}
                        isDisabled={!policy.embedding}
                      >
                        {policy.embedding ? "Suggest" : "No embedding"}
                      </Button>
                    </Td>
                  </Tr>
                  {suggestions[policy.id] && suggestions[policy.id].length > 0 && (
                    <Tr>
                      <Td colSpan={4} py={3}>
                        <Box pl={8}>
                          <Text fontSize="sm" fontWeight="medium" mb={2}>
                            Suggested Controls:
                          </Text>
                          <SimpleGrid columns={1} spacing={2}>
                            {suggestions[policy.id].map(s => (
                              <Box
                                key={s.control_id}
                                p={3}
                                borderWidth="1px"
                                borderRadius="md"
                                bg="gray.50"
                              >
                                <Flex justify="space-between" align="center">
                                  <Box>
                                    <Text fontSize="sm" fontWeight="medium">
                                      {s.control_ref} - {s.control_name}
                                    </Text>
                                    <Text fontSize="xs" color="gray.600">
                                      Similarity: {(s.similarity * 100).toFixed(1)}%
                                    </Text>
                                  </Box>
                                  <Button
                                    size="xs"
                                    colorScheme="blue"
                                    onClick={() =>
                                      handleMapPolicyToControl(
                                        policy.id,
                                        s.control_id,
                                        s.similarity
                                      )
                                    }
                                  >
                                    Map
                                  </Button>
                                </Flex>
                              </Box>
                            ))}
                          </SimpleGrid>
                        </Box>
                      </Td>
                    </Tr>
                  )}
                </React.Fragment>
              ))
            )}
          </Tbody>
        </Table>
      </Box>

      {/* Existing Mappings */}
      <Heading size="sm" mb={2}>Existing Mappings</Heading>
      {mappings.length === 0 ? (
        <Text color="gray.500" fontStyle="italic" py={4}>
          No mappings yet. Use the "Suggest" button to create mappings between policies and controls.
        </Text>
      ) : (
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Policy</Th>
              <Th>Control</Th>
              <Th>Confidence</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {mappings.map(m => (
              <Tr key={m.id}>
                <Td>{m.uploaded_policies?.title}</Td>
                <Td>{m.framework_controls?.control_ref} - {m.framework_controls?.control_name}</Td>
                <Td>{(m.confidence * 100).toFixed(1)}%</Td>
                <Td>
                  <Button 
                    size="xs" 
                    colorScheme="red" 
                    onClick={() => handleDeleteMapping(m.id)}
                    leftIcon={<FiTrash2 />}
                  >
                    Remove
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </Box>
  );
};
/* -------------------------
   UI Subcomponents (unchanged)
-------------------------- */
const StatCard = ({ label, value, helpText, icon, colorScheme }) => {
  const IconComponent = icon;
  return (
    <Card bg={useColorModeValue(`${colorScheme}.50`, `${colorScheme}.900`)}>
      <CardBody>
        <Stat>
          <StatLabel display="flex" alignItems="center" gap={2}>
            <Icon as={IconComponent} />
            {label}
          </StatLabel>
          <StatNumber fontSize="xl">{value}</StatNumber>
          <StatHelpText>{helpText}</StatHelpText>
        </Stat>
      </CardBody>
    </Card>
  );
};

const EvidenceItem = ({ evidence, onDelete }) => {
  const [downloadUrl, setDownloadUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchDownloadUrl = async () => {
      if (evidence.file_path) {
        try {
          setLoading(true);
          const { data, error } = await supabase.storage
            .from('evidence')
            .createSignedUrl(evidence.file_path, 600);

          if (error) throw error;
          setDownloadUrl(data.signedUrl);
        } catch (error) {
          console.error('Error fetching download URL:', error);
          toast({
            title: 'Error loading file',
            description: 'File might have been deleted or is inaccessible',
            status: 'error',
            isClosable: true
          });
        } finally {
          setLoading(false);
        }
      }
    };

    fetchDownloadUrl();
  }, [evidence.file_path, toast]);

  return (
    <Card variant="outline" size="sm">
      <CardBody>
        <Flex justify="space-between" align="center">
          <HStack spacing={3} flex={1}>
            <Icon as={FiFile} color="gray.500" boxSize={5} />
            <Box flex={1}>
              <Text fontSize="sm" fontWeight="medium">{evidence.file_name}</Text>
              <Text fontSize="xs" color="gray.500">
                Control: {evidence.control_ref} • Framework: {evidence.framework}
              </Text>
              <Text fontSize="xs" color="gray.500">
                Uploaded on {new Date(evidence.created_at).toLocaleDateString()} by {evidence.uploaded_by}
              </Text>
            </Box>
          </HStack>
          <HStack>
            {loading ? (
              <Spinner size="sm" />
            ) : downloadUrl ? (
              <IconButton
                size="sm"
                icon={<FiDownload />}
                aria-label="Download evidence"
                as="a"
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
              />
            ) : (
              <Icon as={FiAlertCircle} color="red.500" />
            )}
            <IconButton
              size="sm"
              icon={<FiTrash2 />}
              aria-label="Delete evidence"
              onClick={onDelete}
              colorScheme="red"
              variant="ghost"
            />
          </HStack>
        </Flex>
      </CardBody>
    </Card>
  );
};

const EvidenceLibrary = ({ evidence, onDeleteEvidence, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (isLoading) {
    return (
      <Center py={10}>
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text color="gray.500">Loading evidence library...</Text>
        </VStack>
      </Center>
    );
  }

  if (!evidence || Object.keys(evidence).length === 0) {
    return (
      <Center py={10}>
        <VStack spacing={4}>
          <Icon as={FiArchive} boxSize={12} color="gray.300" />
          <Text color="gray.500">No evidence files uploaded yet</Text>
        </VStack>
      </Center>
    );
  }

  // Flatten and filter evidence
  const allEvidence = Object.values(evidence).flat().filter(item => {
    const matchesSearch = item.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.control_ref.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <Box>
      <Flex mb={4} gap={3} direction={{ base: 'column', md: 'row' }}>
        <InputGroup maxW="300px">
          <InputLeftElement pointerEvents="none">
            <Icon as={FiSearch} color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search evidence files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
      </Flex>

      <Text fontSize="sm" color="gray.500" mb={4}>
        {allEvidence.length} evidence file(s) found
      </Text>

      <Box overflowX="auto">
        <Table variant="striped" size="sm">
          <Thead>
            <Tr>
              <Th>File Name</Th>
              <Th>Framework</Th>
              <Th>Control</Th>
              <Th>Uploaded By</Th>
              <Th>Date</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {allEvidence.map(item => (
              <Tr key={item.id}>
                <Td>
                  <HStack>
                    <Icon as={FiFile} color="blue.500" />
                    <Text>{item.file_name}</Text>
                  </HStack>
                </Td>
                <Td>
                  <Badge colorScheme={FRAMEWORKS_CONFIG[item.framework]?.iconColor || "gray"}>
                    {item.framework}
                  </Badge>
                </Td>
                <Td>{item.control_ref}</Td>
                <Td>{item.uploaded_by}</Td>
                <Td>{new Date(item.created_at).toLocaleDateString()}</Td>
                <Td>
                  <HStack>
                    <IconButton
                      size="sm"
                      icon={<FiDownload />}
                      as="a"
                      href={item.signed_url}
                      target="_blank"
                      aria-label="Download"
                    />
                    <IconButton
                      size="sm"
                      icon={<FiTrash2 />}
                      onClick={() => onDeleteEvidence(item.id)}
                      aria-label="Delete"
                      colorScheme="red"
                      variant="ghost"
                    />
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

const ControlDetailModal = ({ control, isOpen, onClose, onStatusChange, onNotesSave }) => {
  const [notes, setNotes] = useState(control?.notes || '');
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    setNotes(control?.notes || '');
  }, [control]);

  const handleSaveNotes = async () => {
    try {
      setIsSaving(true);
      await onNotesSave(control.id, notes);
      toast({ title: 'Notes saved', status: 'success', isClosable: true });
      onClose();
    } catch (error) {
      toast({
        title: 'Error saving notes',
        description: error.message,
        status: 'error',
        isClosable: true
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!control) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack>
            <Tag colorScheme="blue">{control.control_id}</Tag>
            <Text>{control.name}</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Box>
              <Text fontWeight="medium">Description</Text>
              <Text mt={1}>{control.description}</Text>
            </Box>

            <Box>
              <Text fontWeight="medium">Guidance</Text>
              <Text mt={1}>{control.guidance || 'No guidance provided.'}</Text>
            </Box>

            <FormControl>
              <FormLabel>Implementation Status</FormLabel>
              <Select
                defaultValue={control.implementationStatus}
                onChange={(e) => onStatusChange(control.id, e.target.value)}
              >
                {STATUS_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Implementation Notes</FormLabel>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about your implementation of this control..."
                rows={4}
              />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleSaveNotes} isLoading={isSaving}>
            Save Notes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const ControlCard = ({ control, evidence, onStatusChange, onViewDetails, onDeleteEvidence, onFileUpload }) => {
  const [isUploading, setIsUploading] = useState(false);
  const toast = useToast();

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!EVIDENCE_FILE_TYPES.includes(file.type)) {
      toast({
        title: 'Unsupported file type',
        description: 'Please upload PDF, Word, or image files only',
        status: 'error',
        isClosable: true
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: 'File too large',
        description: 'Maximum file size is 10MB',
        status: 'error',
        isClosable: true
      });
      return;
    }

    setIsUploading(true);
    try {
      await onFileUpload(control.control_id, control.framework_key, file);
    } catch (error) {
      console.error('File upload error:', error);
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  return (
    <Card variant="outline" size="sm">
      <CardHeader pb={0}>
        <Flex justify="space-between" align="start">
          <HStack align="start" spacing={3}>
            <Tag colorScheme="blue" minW="85px">{control.control_id}</Tag>
            <Box>
              <Text fontWeight="medium" mb={1}>{control.name}</Text>
              <Text fontSize="sm" color="gray.600" noOfLines={2}>{control.description}</Text>
            </Box>
          </HStack>
        </Flex>
      </CardHeader>
      <CardBody pt={3}>
        <VStack spacing={4} align="stretch">
          <Flex justify="space-between" align="center">
            <FormControl width="auto">
              <FormLabel fontSize="sm" mb={1}>Status</FormLabel>
              <Select
                size="sm"
                width="140px"
                value={control.implementationStatus}
                onChange={(e) => onStatusChange(control.id, e.target.value)}
              >
                {STATUS_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Select>
            </FormControl>

            <Button size="sm" variant="outline" leftIcon={<FiEye />} onClick={() => onViewDetails(control)}>
              Details
            </Button>
          </Flex>

          <FormControl>
            <FormLabel fontSize="sm">Evidence</FormLabel>

            {evidence && evidence.length > 0 ? (
              <VStack spacing={2} align="stretch">
                {evidence.map(evidenceItem => (
                  <EvidenceItem
                    key={evidenceItem.id}
                    evidence={evidenceItem}
                    onDelete={() => onDeleteEvidence(evidenceItem.id)}
                  />
                ))}
              </VStack>
            ) : (
              <Text fontSize="sm" color="gray.500" fontStyle="italic" mb={2}>
                No evidence uploaded yet
              </Text>
            )}

            <Button
              leftIcon={<FiUpload />}
              variant="outline"
              as="label"
              cursor="pointer"
              size="sm"
              w="full"
              isLoading={isUploading}
            >
              {evidence && evidence.length > 0 ? 'Add More Evidence' : 'Upload Evidence'}
              <Input type="file" onChange={handleFileSelect} hidden disabled={isUploading} />
            </Button>
          </FormControl>
        </VStack>
      </CardBody>
    </Card>
  );
};

// Pagination Component (standalone)
const Pagination = ({ currentPage, itemsPerPage, totalItems, onPageChange, onItemsPerPageChange }) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  return (
    <Flex justify="space-between" align="center" mt={4}>
      <HStack>
        <Text fontSize="sm">Items per page:</Text>
        <Select
          size="sm"
          width="80px"
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </Select>
      </HStack>

      <HStack>
        <Button
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          isDisabled={currentPage === 1}
        >
          Previous
        </Button>
        <Text fontSize="sm">
          Page {currentPage} of {totalPages}
        </Text>
        <Button
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          isDisabled={currentPage === totalPages}
        >
          Next
        </Button>
      </HStack>
    </Flex>
  );
};

// Controls Table
const ControlsTable = ({
  controls,
  evidence,
  onStatusChange,
  onFileUpload,
  onViewDetails,
  onDeleteEvidence,
  currentPage,
  itemsPerPage,
  isLoading
}) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedControls = controls.slice(startIndex, endIndex);
  const [isUploading, setIsUploading] = useState({});
  const toast = useToast();

  const handleFileSelect = async (controlId, frameworkKey, event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!EVIDENCE_FILE_TYPES.includes(file.type)) {
      toast({
        title: 'Unsupported file type',
        description: 'Please upload PDF, Word, or image files only',
        status: 'error',
        isClosable: true
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: 'File too large',
        description: 'Maximum file size is 10MB',
        status: 'error',
        isClosable: true
      });
      return;
    }

    setIsUploading(prev => ({ ...prev, [controlId]: true }));
    try {
      await onFileUpload(controlId, frameworkKey, file);
    } catch (error) {
      console.error('File upload error:', error);
    } finally {
      setIsUploading(prev => ({ ...prev, [controlId]: false }));
      event.target.value = '';
    }
  };

  if (isLoading) {
    return (
      <Center py={10}>
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text color="gray.500">Loading controls...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box overflowX="auto">
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Framework</Th>
            <Th>Chapter/Section</Th>
            <Th>Control ID</Th>
            <Th>Control Name</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {paginatedControls.map(control => (
            <Tr key={control.id}>
              <Td>{FRAMEWORKS_CONFIG[control.framework_key]?.name || control.framework_key}</Td>
              <Td>{control.chapter || 'General'}</Td>
              <Td>{control.control_id}</Td>
              <Td>{control.name}</Td>
              <Td>
                <Select
                  size="sm"
                  value={control.implementationStatus}
                  onChange={(e) => onStatusChange(control.id, e.target.value)}
                >
                  {STATUS_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </Select>
              </Td>
              <Td>
                <HStack>
                  <Button
                    as="label"
                    cursor="pointer"
                    size="sm"
                    leftIcon={<FiUpload />}
                    isLoading={isUploading[control.control_id]}
                    variant="outline"
                  >
                    Upload
                    <Input
                      type="file"
                      onChange={(e) => handleFileSelect(control.control_id, control.framework_key, e)}
                      hidden
                      disabled={isUploading[control.control_id]}
                    />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<FiEye />}
                    onClick={() => onViewDetails(control)}
                  >
                    View
                  </Button>
                  {(evidence[control.control_id] || []).length > 0 && (
                    <Button
                      size="sm"
                      colorScheme="red"
                      variant="outline"
                      leftIcon={<FiTrash2 />}
                      onClick={() => onDeleteEvidence(evidence[control.control_id][0].id)}
                    >
                      Delete
                    </Button>
                  )}
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

// Framework selector
const FrameworkSelector = ({ selectedFrameworks, onFrameworkChange }) => {
  return (
    <Card p={4} mb={4}>
      <FormControl>
        <FormLabel fontSize="lg" fontWeight="bold">Select Framework(s)</FormLabel>
        <CheckboxGroup
          value={selectedFrameworks}
          onChange={(values) => onFrameworkChange(values)}
          colorScheme="blue"
        >
          <Stack spacing={2} direction="row" flexWrap="wrap">
            {Object.keys(FRAMEWORKS_CONFIG).map(key => (
              <Checkbox key={key} value={key}>
                {FRAMEWORKS_CONFIG[key].name}
              </Checkbox>
            ))}
          </Stack>
        </CheckboxGroup>
      </FormControl>
    </Card>
  );
};

// Main Component
const ComplianceFrameworkManager = () => {
  const { user, organization } = useAuth();
  const [selectedFrameworks, setSelectedFrameworks] = useState(Object.keys(FRAMEWORKS_CONFIG)); // For Controls

  const [isLoading, setIsLoading] = useState(true);
  const [selectedControl, setSelectedControl] = useState(null);
  const [sortOrder, setSortOrder] = useState(SORT_OPTIONS.ASC);
  const [combinedControls, setCombinedControls] = useState([]);
  const [combinedEvidence, setCombinedEvidence] = useState({});
  const [statsByFramework, setStatsByFramework] = useState({});
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [conflictFile, setConflictFile] = useState(null);
  const [isConflictDialogOpen, setIsConflictDialogOpen] = useState(false);
  const cancelRef = useRef();
  const toast = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch all data for selected frameworks
  const fetchAllData = async () => {
    if (!organization?.id || selectedFrameworks.length === 0) return;
    setIsLoading(true);

    try {
      // Fetch controls for selected frameworks
      const { data: controlsData, error: controlsError } = await supabase
        .from('framework_controls')
        .select('*')
        .in('framework_key', selectedFrameworks)
        .order('control_ref', { ascending: sortOrder === SORT_OPTIONS.ASC });

      if (controlsError) throw controlsError;

      const controlIds = controlsData.map(c => c.id);

      // Fetch implementations for these controls
      const { data: implementations, error: implError } = await supabase
        .from('control_implementations')
        .select('*')
        .eq('organization_id', organization.id)
        .in('control_id', controlIds.length ? controlIds : ['-1']);

      if (implError) throw implError;

      // Fetch evidence for selected frameworks and org
      const { data: evidenceData, error: evidenceError } = await supabase
        .from('evidence')
        .select('*')
        .eq('organization_id', organization.id)
        .in('framework', selectedFrameworks);

      if (evidenceError) throw evidenceError;

      // Build controls with status
      const controlsWithStatus = controlsData.map(control => {
        const implementation = implementations?.find(impl => impl.control_id === control.id);
        return {
          ...control,
          id: control.id,
          control_id: control.control_ref,
          name: control.control_name,
          description: control.control_text,
          chapter: control.chapters || 'General',
          framework_key: control.framework_key,
          implementationStatus: implementation?.status || 'not_started',
          implementationId: implementation?.id,
          notes: implementation?.notes || ''
        };
      });

      // Group evidence by control_ref
      const evidenceByControl = {};
      if (evidenceData) {
        evidenceData.forEach(item => {
          if (!evidenceByControl[item.control_ref]) evidenceByControl[item.control_ref] = [];
          evidenceByControl[item.control_ref].push(item);
        });
      }

      // Stats per framework
      const newStats = {};
      selectedFrameworks.forEach(fw => {
        const fwControls = controlsWithStatus.filter(c => c.framework_key === fw);
        const total = fwControls.length || 1; // avoid divide by zero
        const counts = { implemented: 0, in_progress: 0, not_started: 0, exempt: 0 };
        fwControls.forEach(c => {
          counts[c.implementationStatus] = (counts[c.implementationStatus] || 0) + 1;
        });
        newStats[fw] = {
          implemented: Math.round((counts.implemented / total) * 100),
          in_progress: Math.round((counts.in_progress / total) * 100),
          not_started: Math.round((counts.not_started / total) * 100),
          exempt: Math.round((counts.exempt / total) * 100),
          total: total
        };
      });

      setCombinedControls(controlsWithStatus);
      setCombinedEvidence(evidenceByControl);
      setStatsByFramework(newStats);
    } catch (err) {
      console.error('Error fetching data:', err);
      toast({ title: 'Error loading data', description: err.message || 'Unknown error', status: 'error', isClosable: true });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (organization?.id) fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organization?.id, selectedFrameworks, sortOrder]);

  // Ensure evidence bucket exists (run once)
  useEffect(() => {
    const checkStorageAccess = async () => {
      try {
        const { data, error } = await supabase.storage
          .from('evidence')
          .list('', { limit: 1 });

        if (error) {
          console.error('Error accessing evidence bucket:', error);
          toast({
            title: 'Storage Access Error',
            description: 'Cannot access evidence storage. Please check your Supabase configuration.',
            status: 'error',
            isClosable: true,
            duration: 5000
          });
        }
      } catch (error) {
        console.error('Error checking storage access:', error);
      }
    };

    if (organization?.id) {
      checkStorageAccess();
    }
  }, [organization?.id, toast]);

  const handleFileUpload = async (controlId, frameworkKey, file) => {
    try {
      // 1. Get user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // 2. Generate a unique file path
      const fileName = generateUniqueFileName(file.name, controlId);
      const filePath = `${frameworkKey}/${fileName}`;

      // 3. Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('evidence')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        if (uploadError.message.includes('duplicate')) {
          setConflictFile({ controlId, frameworkKey, file, filePath });
          setIsConflictDialogOpen(true);
          return;
        }
        throw uploadError;
      }

      // 4. Insert record into evidence table
      const { data: evidenceData, error: evidenceError } = await supabase
        .from('evidence')
        .insert({
          file_name: file.name,
          file_path: filePath,
          file_type: file.type, // FIX: Added missing file_type field
          file_size: file.size,
          control_ref: controlId,
          framework: frameworkKey,
          organization_id: organization.id,
          uploaded_by: user.email
        })
        .select()
        .single();

      if (evidenceError) throw evidenceError;

      // 5. Update UI state
      setCombinedEvidence(prev => ({
        ...prev,
        [controlId]: [...(prev[controlId] || []), evidenceData]
      }));

      toast({ title: 'File uploaded successfully', status: 'success', isClosable: true });
    } catch (error) {
      console.error('Upload error:', error);
      toast({ title: 'Upload failed', description: error.message || 'Unknown error', status: 'error', isClosable: true });
      throw error;
    }
  };

  const handleOverwriteFile = async () => {
    if (!conflictFile) return;

    try {
      // 1. Upload with overwrite
      const { error: uploadError } = await supabase.storage
        .from('evidence')
        .upload(conflictFile.filePath, conflictFile.file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // 2. Update the evidence record
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data: evidenceData, error: evidenceError } = await supabase
        .from('evidence')
        .upsert({
          file_name: conflictFile.file.name,
          file_path: conflictFile.filePath,
          file_type: conflictFile.file.type, // FIX: Added missing file_type field
          file_size: conflictFile.file.size,
          control_ref: conflictFile.controlId,
          framework: conflictFile.frameworkKey,
          organization_id: organization.id,
          uploaded_by: user.email,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (evidenceError) throw evidenceError;

      // 3. Update UI state
      setCombinedEvidence(prev => {
        const existingEvidence = prev[conflictFile.controlId] || [];
        const updatedEvidence = existingEvidence.filter(e => e.file_path !== conflictFile.filePath);
        return {
          ...prev,
          [conflictFile.controlId]: [...updatedEvidence, evidenceData]
        };
      });

      toast({ title: 'File replaced successfully', status: 'success', isClosable: true });
    } catch (error) {
      console.error('Overwrite error:', error);
      toast({ title: 'File replacement failed', description: error.message || 'Unknown error', status: 'error', isClosable: true });
    } finally {
      setIsConflictDialogOpen(false);
      setConflictFile(null);
    }
  };

  const handleStatusChange = async (controlId, newStatus) => {
    try {
      // Find the control to get its implementationId if it exists
      const control = combinedControls.find(c => c.id === controlId);
      if (!control) throw new Error("Control not found");

      let result;
      if (control.implementationId) {
        // Update existing implementation
        result = await supabase
          .from('control_implementations')
          .update({ status: newStatus })
          .eq('id', control.implementationId)
          .select()
          .single();
      } else {
        // Create new implementation
        result = await supabase
          .from('control_implementations')
          .insert({
            control_id: controlId,
            organization_id: organization.id,
            status: newStatus,
            notes: ''
          })
          .select()
          .single();
      }

      if (result.error) throw result.error;

      // Update local state immediately for UI responsiveness
      setCombinedControls(prevControls => 
        prevControls.map(c => 
          c.id === controlId 
            ? { 
                ...c, 
                implementationStatus: newStatus,
                implementationId: result.data.id 
              }
            : c
        )
      );

      // Refresh stats after status change
      await fetchAllData();
      
      toast({ title: 'Status updated', status: 'success', isClosable: true });
    } catch (error) {
      console.error('Status update error:', error);
      toast({ title: 'Status update failed', description: error.message || 'Unknown error', status: 'error', isClosable: true });
    }
  };

  const handleNotesSave = async (controlId, notes) => {
    try {
      const control = combinedControls.find(c => c.id === controlId);
      if (!control) throw new Error("Control not found");

      let result;
      if (control.implementationId) {
        result = await supabase
          .from('control_implementations')
          .update({ notes })
          .eq('id', control.implementationId)
          .select()
          .single();
      } else {
        result = await supabase
          .from('control_implementations')
          .insert({
            control_id: controlId,
            organization_id: organization.id,
            status: 'not_started',
            notes
          })
          .select()
          .single();
      }

      if (result.error) throw result.error;

      // Update local state
      setCombinedControls(prevControls => 
        prevControls.map(c => 
          c.id === controlId 
            ? { ...c, notes, implementationId: result.data.id } 
            : c
        )
      );

      toast({ title: 'Notes saved', status: 'success', isClosable: true });
    } catch (error) {
      console.error('Notes save error:', error);
      toast({ title: 'Failed to save notes', description: error.message || 'Unknown error', status: 'error', isClosable: true });
    }
  };

  const handleDeleteEvidence = async (evidenceId) => {
    try {
      // 1. Get the evidence record to get file_path
      const { data: evidence, error: fetchError } = await supabase
        .from('evidence')
        .select('*')
        .eq('id', evidenceId)
        .single();

      if (fetchError) throw fetchError;

      // 2. Delete from storage
      const { error: storageError } = await supabase.storage
        .from('evidence')
        .remove([evidence.file_path]);

      if (storageError) throw storageError;

      // 3. Delete from database
      const { error: dbError } = await supabase
        .from('evidence')
        .delete()
        .eq('id', evidenceId);

      if (dbError) throw dbError;

      // 4. Update UI state
      setCombinedEvidence(prev => {
        const newEvidence = { ...prev };
        Object.keys(newEvidence).forEach(controlRef => {
          newEvidence[controlRef] = newEvidence[controlRef].filter(e => e.id !== evidenceId);
        });
        return newEvidence;
      });

      toast({ title: 'Evidence deleted', status: 'success', isClosable: true });
    } catch (error) {
      console.error('Delete error:', error);
      toast({ title: 'Delete failed', description: error.message || 'Unknown error', status: 'error', isClosable: true });
    }
  };

  const handleFrameworkChange = (frameworks) => {
    setSelectedFrameworks(frameworks);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSortChange = () => {
    setSortOrder(prev => prev === SORT_OPTIONS.ASC ? SORT_OPTIONS.DESC : SORT_OPTIONS.ASC);
  };

  return (
    <ProtectedRoute>
      <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')} p={4}>
        <Breadcrumb mb={6}>
          <BreadcrumbItem>
            <BreadcrumbLink href="/ControlsDashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>Compliance Framework Manager</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <Flex justify="space-between" align="center" mb={6}>
          <Heading size="lg">Compliance Framework Manager</Heading>
          <Button leftIcon={<FiRefreshCw />} onClick={fetchAllData} isLoading={isLoading}>
            Refresh
          </Button>
        </Flex>

        {/* Framework Selector */}
        <FrameworkSelector
          selectedFrameworks={selectedFrameworks}
          onFrameworkChange={handleFrameworkChange}
        />

        {/* Stats Cards */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mb={6}>
          {selectedFrameworks.map(fw => (
            <StatCard
              key={fw}
              label={`${FRAMEWORKS_CONFIG[fw].name} Progress`}
              value={`${statsByFramework[fw]?.implemented || 0}%`}
              helpText={`${statsByFramework[fw]?.implemented || 0}/${statsByFramework[fw]?.total || 0} controls implemented`}
              icon={FiCheckCircle}
              colorScheme={FRAMEWORKS_CONFIG[fw].iconColor}
            />
          ))}
        </SimpleGrid>

        {/* Tabs */}
        <Tabs variant="enclosed" colorScheme="blue">
          <TabList mb={4}>
            <Tab>
              <HStack>
                <Icon as={FiDatabase} />
                <Text>Controls</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack>
                <Icon as={FiBarChart2} />
                <Text>Progress</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack>
                <Icon as={FiFile} />
                <Text>Evidence Library</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack>
                <Icon as={FiUsers} />
                <Text>Policy Mappings</Text>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            {/* Controls Tab */}
            <TabPanel p={0}>
              <Card>
                <CardHeader>
                  <Flex justify="space-between" align="center">
                    <Heading size="md">Controls</Heading>
                    <HStack>
                      <Button
                        size="sm"
                        rightIcon={sortOrder === SORT_OPTIONS.ASC ? <FiArrowUp /> : <FiArrowDown />}
                        onClick={handleSortChange}
                      >
                        Sort {sortOrder === SORT_OPTIONS.ASC ? 'A-Z' : 'Z-A'}
                      </Button>
                    </HStack>
                  </Flex>
                </CardHeader>
                <CardBody>
                  <ControlsTable
                    controls={combinedControls}
                    evidence={combinedEvidence}
                    onStatusChange={handleStatusChange}
                    onFileUpload={handleFileUpload}
                    onViewDetails={(control) => {
                      setSelectedControl(control);
                      onOpen();
                    }}
                    onDeleteEvidence={handleDeleteEvidence}
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                    isLoading={isLoading}
                  />

                  <Pagination
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={combinedControls.length}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={(value) => {
                      setItemsPerPage(value);
                      setCurrentPage(1);
                    }}
                  />
                </CardBody>
              </Card>
            </TabPanel>

            {/* Progress Tab */}
            <TabPanel p={0}>
              <Card>
                <CardHeader>
                  <Heading size="md">Implementation Progress</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={6} align="stretch">
                    {selectedFrameworks.map(fw => (
                      <Box key={fw}>
                        <Flex justify="space-between" align="center" mb={2}>
                          <Heading size="sm">{FRAMEWORKS_CONFIG[fw].name}</Heading>
                          <Text fontSize="sm" color="gray.500">
                            {statsByFramework[fw]?.implemented || 0}% Complete
                          </Text>
                        </Flex>
                        <Progress
                          value={statsByFramework[fw]?.implemented || 0}
                          colorScheme={FRAMEWORKS_CONFIG[fw].iconColor}
                          size="lg"
                          borderRadius="md"
                          mb={2}
                        />
                        <Flex justify="space-between" fontSize="sm">
                          <HStack>
                            <Box w={3} h={3} bg="green.500" borderRadius="sm" />
                            <Text>Implemented: {statsByFramework[fw]?.implemented || 0}%</Text>
                          </HStack>
                          <HStack>
                            <Box w={3} h={3} bg="orange.500" borderRadius="sm" />
                            <Text>In Progress: {statsByFramework[fw]?.in_progress || 0}%</Text>
                          </HStack>
                          <HStack>
                            <Box w={3} h={3} bg="gray.500" borderRadius="sm" />
                            <Text>Not Started: {statsByFramework[fw]?.not_started || 0}%</Text>
                          </HStack>
                          <HStack>
                            <Box w={3} h={3} bg="purple.500" borderRadius="sm" />
                            <Text>Exempt: {statsByFramework[fw]?.exempt || 0}%</Text>
                          </HStack>
                        </Flex>
                      </Box>
                    ))}
                  </VStack>
                </CardBody>
              </Card>
            </TabPanel>

            {/* Evidence Library Tab */}
            <TabPanel p={0}>
              <Card>
                <CardHeader>
                  <Heading size="md">Evidence Library</Heading>
                </CardHeader>
                <CardBody>
                  <EvidenceLibrary
                    evidence={combinedEvidence}
                    onDeleteEvidence={handleDeleteEvidence}
                    isLoading={isLoading}
                  />
                </CardBody>
              </Card>
            </TabPanel>

            {/* Policy Mappings Tab */}
            <TabPanel p={0}>
              <Card>
                <CardHeader>
                  <Heading size="md">Policy Mappings</Heading>
                </CardHeader>
                <CardBody>
                  <PolicyMappingManager organization={organization} />
                </CardBody>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Control Detail Modal */}
        <ControlDetailModal
          control={selectedControl}
          isOpen={isOpen}
          onClose={onClose}
          onStatusChange={handleStatusChange}
          onNotesSave={handleNotesSave}
        />

        {/* File Conflict Dialog */}
        <AlertDialog
          isOpen={isConflictDialogOpen}
          leastDestructiveRef={cancelRef}
          onClose={() => setIsConflictDialogOpen(false)}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                File Already Exists
              </AlertDialogHeader>

              <AlertDialogBody>
                A file with this name already exists for this control. Do you want to replace it?
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={() => setIsConflictDialogOpen(false)}>
                  Cancel
                </Button>
                <Button colorScheme="red" onClick={handleOverwriteFile} ml={3}>
                  Replace
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Box>
    </ProtectedRoute>
  );
};

export default ComplianceFrameworkManager;