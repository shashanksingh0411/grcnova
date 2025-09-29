// src/pages/PolicyManagement/PolicyDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Button, VStack, Input, Textarea, Text, useToast, Progress,
  HStack, Icon, Card, CardHeader, CardBody, Heading,
  Flex, Spacer, Badge, Tabs, TabList, TabPanels, Tab, TabPanel,
  IconButton, Table, Thead, Tbody, Tr, Th, Td, TableContainer,
  InputGroup, InputLeftElement, Divider
} from '@chakra-ui/react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '../../supabase';
import {
  FiUpload, FiFile, FiX, FiEye, FiDownload, FiTrash2, FiSearch
} from 'react-icons/fi';

// ---------- Constants ----------
const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
};
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// ---------- Utilities ----------
const formatFileSize = (bytes) => {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });

// ---------- PolicyUpload Component ----------
const PolicyUpload = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const toast = useToast();

  const onDrop = useCallback((acceptedFiles) => {
    if (!acceptedFiles.length) return;
    const file = acceptedFiles[0];
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: 'File too large',
        description: 'Max 10MB allowed',
        status: 'error', duration: 3000
      });
      return;
    }
    setSelectedFile(file);
    setFilePreviewUrl(URL.createObjectURL(file));
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: ACCEPTED_FILE_TYPES, maxFiles: 1
  });

  const handleUpload = async () => {
    if (!selectedFile || !formData.title.trim()) {
      toast({
        title: 'Missing info',
        description: 'Provide title & select a file',
        status: 'warning', duration: 3000
      });
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const folder = 'policies';
      const filePath = `${folder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('policies')
        .upload(filePath, selectedFile, {
          onUploadProgress: (progress) =>
            setUploadProgress((progress.loaded / progress.total) * 100)
        });
      if (uploadError) throw uploadError;

      const { data, error: dbError } = await supabase
        .from('uploaded_policies')
        .insert([{
          title: formData.title.trim(),
          description: formData.description.trim(),
          file_name: selectedFile.name,
          file_size: selectedFile.size,
          file_type: selectedFile.type,
          file_url: filePath,
          uploaded_by: user.id,
          organization_id: user.organization_id
        }])
        .select();

      if (dbError) throw dbError;

      toast({ title: 'Policy uploaded', status: 'success', duration: 3000 });
      setSelectedFile(null);
      setFilePreviewUrl(null);
      setFormData({ title: '', description: '' });
      setUploadProgress(0);
      if (onUploadSuccess) onUploadSuccess(data[0]);
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: error.message,
        status: 'error', duration: 5000
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    setFilePreviewUrl(null);
  };

  return (
    <Card bg="white" boxShadow="lg" borderRadius="xl">
      <CardHeader borderBottomWidth={1}>
        <Heading size="md" color="gray.800">Upload New Policy</Heading>
      </CardHeader>
      <CardBody>
        <VStack spacing={6} align="stretch">
          <VStack align="stretch" spacing={4}>
            <Input
              placeholder="Title *"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              isDisabled={uploading}
            />
            <Textarea
              placeholder="Description (optional)"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              isDisabled={uploading}
              rows={3}
            />
          </VStack>

          <Box
            {...getRootProps()}
            border="2px dashed"
            borderColor={isDragActive ? 'blue.400' : 'gray.300'}
            borderRadius="md"
            p={8}
            textAlign="center"
            cursor="pointer"
            _hover={{ borderColor: 'blue.300', bg: 'gray.50' }}
            bg={isDragActive ? 'blue.50' : 'transparent'}
          >
            <input {...getInputProps()} />
            <Icon as={FiUpload} w={10} h={10} color="blue.500" mb={3} />
            <Text fontWeight="medium">
              {isDragActive ? 'Drop file here...' : 'Drag & drop a file or click to select'}
            </Text>
            <Text fontSize="sm" color="gray.500">
              PDF, DOC, DOCX only — Max size 10MB
            </Text>
          </Box>

          {selectedFile && (
            <Box p={4} borderWidth={1} borderRadius="md" bg="gray.50">
              <Flex justify="space-between" align="center">
                <HStack>
                  <Icon as={FiFile} color="blue.600" />
                  <Box>
                    <Text fontSize="sm" fontWeight="semibold">
                      {selectedFile.name}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {formatFileSize(selectedFile.size)}
                    </Text>
                  </Box>
                </HStack>
                <IconButton
                  size="sm"
                  variant="ghost"
                  onClick={handleRemoveFile}
                  icon={<FiX />}
                  aria-label="Remove"
                  isDisabled={uploading}
                />
              </Flex>

              {filePreviewUrl && selectedFile.type === 'application/pdf' && (
                <Box mt={4} borderWidth={1} borderRadius="md" minH="300px">
                  <iframe
                    src={filePreviewUrl}
                    width="100%"
                    height="300px"
                    style={{ border: 'none', borderRadius: '0.375rem' }}
                    title="PDF Preview"
                  />
                </Box>
              )}
            </Box>
          )}

          {uploading && (
            <Box>
              <Progress
                value={uploadProgress}
                size="sm"
                colorScheme="blue"
                mb={2}
                hasStripe
              />
              <Text textAlign="center" color="gray.600">
                Uploading... {Math.round(uploadProgress)}%
              </Text>
            </Box>
          )}

          <Button
            colorScheme="blue"
            onClick={handleUpload}
            isDisabled={!selectedFile || !formData.title.trim() || uploading}
            isLoading={uploading}
            loadingText="Uploading..."
          >
            Upload Policy
          </Button>
        </VStack>
      </CardBody>
    </Card>
  );
};

// ---------- PolicyDashboard Component ----------
const PolicyDashboard = () => {
  const [policies, setPolicies] = useState([]);
  const [filteredPolicies, setFilteredPolicies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedPolicyId, setExpandedPolicyId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  const fetchPolicies = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('uploaded_policies')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPolicies(data || []);
      setFilteredPolicies(data || []);
    } catch (error) {
      toast({
        title: 'Error fetching policies',
        description: error.message,
        status: 'error', duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchPolicies(); }, [fetchPolicies]);

  useEffect(() => {
    setFilteredPolicies(
      policies.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    );
  }, [searchTerm, policies]);

  const getPublicUrl = (filePath) =>
    supabase.storage.from('policies').getPublicUrl(filePath).data.publicUrl;

  const handleTogglePreview = (policyId) => {
    setExpandedPolicyId(expandedPolicyId === policyId ? null : policyId);
  };

  const handleDownloadPolicy = async (policy) => {
    try {
      const { data, error } = await supabase.storage
        .from('policies')
        .download(policy.file_url);
      if (error) throw error;
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = policy.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: 'Download failed',
        description: error.message,
        status: 'error', duration: 5000
      });
    }
  };

  const handleUploadSuccess = useCallback(() => fetchPolicies(), [fetchPolicies]);

  const handleDeletePolicy = async (policy) => {
    if (!window.confirm(`Delete "${policy.title}"?`)) return;
    try {
      const { error: storageError } = await supabase.storage
        .from('policies')
        .remove([policy.file_url]);
      if (storageError) throw storageError;
      const { error: dbError } = await supabase
        .from('uploaded_policies')
        .delete()
        .eq('id', policy.id);
      if (dbError) throw dbError;
      toast({ title: 'Deleted successfully', status: 'success', duration: 3000 });
      fetchPolicies();
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: error.message,
        status: 'error', duration: 5000
      });
    }
  };

  return (
    <Box p={8} bg="gray.50" minH="100vh">
      <Flex mb={8} align="center">
        <Heading size="xl" color="gray.800">Policy Dashboard</Heading>
        <Spacer />
      </Flex>

      <Tabs variant="enclosed" colorScheme="blue" isLazy>
        <TabList>
          <Tab fontWeight="semibold">Policy List</Tab>
          <Tab fontWeight="semibold">Upload Policy</Tab>
        </TabList>

        <TabPanels>
          <TabPanel px={0}>
            <Box mb={6}>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiSearch} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search policies..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  bg="white"
                />
              </InputGroup>
            </Box>

            {isLoading ? (
              <Text textAlign="center" py={10} color="gray.500">Loading...</Text>
            ) : filteredPolicies.length === 0 ? (
              <Card bg="white" p={10} textAlign="center" borderRadius="md" boxShadow="sm">
                <Icon as={FiFile} w={12} h={12} color="gray.400" mb={4} />
                <Text fontSize="lg" color="gray.600">
                  {searchTerm ? 'No matching policies found' : 'No policies uploaded yet'}
                </Text>
                {!searchTerm && (
                  <Text fontSize="sm" color="gray.400">
                    Upload your first policy in the "Upload Policy" tab
                  </Text>
                )}
              </Card>
            ) : (
              <TableContainer bg="white" borderRadius="md" boxShadow="sm">
                <Table variant="simple">
                  <Thead bg="gray.100">
                    <Tr>
                      <Th>Title</Th>
                      <Th>Description</Th>
                      <Th>Type</Th>
                      <Th>Size</Th>
                      <Th>Uploaded On</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredPolicies.map(p => (
                      <React.Fragment key={p.id}>
                        <Tr _hover={{ bg: 'gray.50' }}>
                          <Td maxW="200px" isTruncated>{p.title}</Td>
                          <Td maxW="300px">
                            <Text noOfLines={1} color={p.description ? 'gray.800' : 'gray.500'}>
                              {p.description || 'No description'}
                            </Text>
                          </Td>
                          <Td>
                            <Badge colorScheme="blue">
                              {p.file_type.split('/').pop().toUpperCase()}
                            </Badge>
                          </Td>
                          <Td>{formatFileSize(p.file_size)}</Td>
                          <Td>{formatDate(p.created_at)}</Td>
                          <Td>
                            <HStack spacing={2}>
                              <IconButton
                                icon={<FiEye />}
                                size="sm"
                                variant="ghost"
                                onClick={() => handleTogglePreview(p.id)}
                              />
                              <IconButton
                                icon={<FiDownload />}
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDownloadPolicy(p)}
                              />
                              <IconButton
                                icon={<FiTrash2 />}
                                size="sm"
                                variant="ghost"
                                colorScheme="red"
                                onClick={() => handleDeletePolicy(p)}
                              />
                            </HStack>
                          </Td>
                        </Tr>

                        {expandedPolicyId === p.id && (
                          <Tr>
                            <Td colSpan={6} bg="gray.50">
                              {p.file_type === 'application/pdf' ? (
                                <iframe
                                  src={getPublicUrl(p.file_url)}
                                  width="100%"
                                  height="400px"
                                  style={{ border: 'none', borderRadius: '0.375rem' }}
                                  title={p.title}
                                />
                              ) : (
                                <Box p={4} borderWidth={1} borderRadius="md" bg="gray.100">
                                  <Text fontSize="sm">DOC/DOCX file. Click below to open:</Text>
                                  <Button
                                    as="a"
                                    href={getPublicUrl(p.file_url)}
                                    target="_blank"
                                    size="sm"
                                    mt={2}
                                  >
                                    Open Document
                                  </Button>
                                </Box>
                              )}
                            </Td>
                          </Tr>
                        )}
                      </React.Fragment>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>

          <TabPanel px={0}>
            <PolicyUpload onUploadSuccess={handleUploadSuccess} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default PolicyDashboard;
