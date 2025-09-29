import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  VStack,
  Input,
  Textarea,
  Text,
  useToast,
  Progress,
  HStack,
  Icon,
  IconButton,
  Heading,
  Select,
  Checkbox,
  CheckboxGroup,
  Stack,
  FormControl,
  FormLabel,
  Divider,
  Badge,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon
} from '@chakra-ui/react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '../supabase';
import { FiUpload, FiFile, FiX } from 'react-icons/fi';

// Constants
const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
};
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const PolicyUpload = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [frameworks, setFrameworks] = useState([]);
  const [selectedFramework, setSelectedFramework] = useState('');
  const [controls, setControls] = useState([]);
  const [selectedControls, setSelectedControls] = useState([]);
  const toast = useToast();

  useEffect(() => {
    const fetchFrameworks = async () => {
      const { data, error } = await supabase.from('framework_controls').select('*');
      if (!error) setFrameworks(data);
    };
    fetchFrameworks();
  }, []);

  useEffect(() => {
    setControls(selectedFramework ? frameworks.filter(f => f.framework_key === selectedFramework) : []);
  }, [selectedFramework, frameworks]);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: 'File too large',
          description: 'Please select a file smaller than 10MB',
          status: 'error',
          duration: 3000
        });
        return;
      }
      setSelectedFile(file);
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxFiles: 1
  });

  const handleUpload = async () => {
  if (!selectedFile || !formData.title.trim()) return;

  setUploading(true);
  setUploadProgress(0);

  try {
    // 1. Upload file to Supabase Storage first
    const fileExt = selectedFile.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `policies/${fileName}`;

    // Upload to storage
    const { error: uploadError, data: uploadData } = await supabase.storage
      .from('policies') // Make sure this bucket exists
      .upload(filePath, selectedFile, {
        cacheControl: '3600',
        upsert: false,
        onUploadProgress: (progress) => {
          const percent = (progress.loaded / progress.total) * 100;
          setUploadProgress(percent);
        }
      });

    if (uploadError) throw uploadError;

    // 2. Get the public URL
    const { data: urlData } = supabase.storage
      .from('policies')
      .getPublicUrl(filePath);

    // 3. Get current user
    const { data: { user } } = await supabase.auth.getUser();

    // 4. Insert record into database
    const { data, error: insertError } = await supabase
      .from('uploaded_policies')
      .insert({
        title: formData.title.trim(),
        description: formData.description.trim(),
        file_name: selectedFile.name,
        file_url: urlData.publicUrl,
        file_size: selectedFile.size,
        file_type: selectedFile.type,
        framework_key: selectedFramework || null,
        controls: selectedControls.length > 0 ? selectedControls : null,
        uploaded_by: user?.id,
        organization_id: null // Set this if you have organization context
      })
      .select();

    if (insertError) throw insertError;

    toast({
      title: 'Policy uploaded successfully!',
      status: 'success',
      duration: 3000
    });

    // Reset form
    setSelectedFile(null);
    setFormData({ title: '', description: '' });
    setSelectedFramework('');
    setSelectedControls([]);
    setUploadProgress(0);

    // Notify parent component
    if (onUploadSuccess) onUploadSuccess(data[0]);

  } catch (error) {
    console.error('Upload error:', error);
    toast({
      title: 'Upload failed',
      description: error.message,
      status: 'error',
      duration: 5000
    });
  } finally {
    setUploading(false);
  }
};

  const removeFile = () => setSelectedFile(null);

  return (
    <Box
      p={8}
      borderWidth={1}
      borderRadius="2xl"
      boxShadow="xl"
      bg="white"
      maxW="700px"
      mx="auto"
    >
      <VStack spacing={8} align="stretch">
        <Heading as="h2" size="lg" fontWeight="bold" textAlign="center" color="blue.600">
          Upload New Policy
        </Heading>

        <Divider />

        {/* Policy metadata */}
        <VStack align="stretch" spacing={4}>
          <FormControl isRequired>
            <FormLabel>Policy Title</FormLabel>
            <Input
              placeholder="Enter policy title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              isDisabled={uploading}
              size="md"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Policy Description</FormLabel>
            <Textarea
              placeholder="Brief description (optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              isDisabled={uploading}
              rows={3}
              size="md"
            />
          </FormControl>
        </VStack>

        {/* Framework mapping accordion */}
        <Accordion
          allowToggle
          defaultIndex={selectedFramework ? [0] : []} // auto-expand if framework already chosen
          borderWidth={1}
          borderRadius="lg"
          borderColor="gray.200"
        >
          <AccordionItem>
            <h2>
              <AccordionButton _expanded={{ bg: 'blue.50', color: 'blue.600' }}>
                <Box flex="1" textAlign="left" fontWeight="semibold">
                  Framework & Controls Mapping
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <Box mb={4}>
                <FormLabel fontWeight="medium">Select Framework</FormLabel>
                <Select
                  placeholder="Select Framework"
                  value={selectedFramework}
                  onChange={(e) => {
                    setSelectedFramework(e.target.value);
                    setSelectedControls([]);
                  }}
                  isDisabled={uploading}
                >
                  {[...new Set(frameworks.map(f => f.framework_key))].map(fw => (
                    <option key={fw} value={fw}>{fw}</option>
                  ))}
                </Select>
              </Box>

              {controls.length > 0 && (
                <Box>
                  <FormLabel fontWeight="medium">Select Controls</FormLabel>
                  <CheckboxGroup value={selectedControls} onChange={setSelectedControls}>
                    <Stack spacing={2}>
                      {controls.map(ctrl => (
                        <Checkbox key={ctrl.control_ref} value={ctrl.control_ref}>
                          {ctrl.control_ref}
                        </Checkbox>
                      ))}
                    </Stack>
                  </CheckboxGroup>
                </Box>
              )}
            </AccordionPanel>
          </AccordionItem>
        </Accordion>

        {/* File upload */}
        <Box
          {...getRootProps()}
          border="2px dashed"
          borderColor={isDragActive ? 'blue.400' : 'gray.300'}
          borderRadius="lg"
          p={10}
          textAlign="center"
          cursor="pointer"
          _hover={{ borderColor: 'blue.300', bg: 'gray.50' }}
          bg={isDragActive ? 'blue.50' : 'white'}
          transition="all 0.2s"
        >
          <input {...getInputProps()} />
          <Icon as={FiUpload} w={10} h={10} color="blue.400" mb={3} />
          <Text fontSize="md" mb={1} fontWeight="medium">
            {isDragActive ? 'Drop the policy file here...' : 'Drag & drop or click to select'}
          </Text>
          <Text fontSize="sm" color="gray.500">
            PDF, DOC, DOCX (Max: 10MB)
          </Text>
        </Box>

        {/* File preview */}
        {selectedFile && (
          <Box p={4} borderWidth={1} borderRadius="md" bg="gray.50">
            <HStack justify="space-between">
              <HStack>
                <Icon as={FiFile} color="blue.500" />
                <Box>
                  <Text fontSize="sm" fontWeight="semibold">{selectedFile.name}</Text>
                  <Badge colorScheme="purple" fontSize="0.7em" mt={1}>
                    {formatFileSize(selectedFile.size)}
                  </Badge>
                </Box>
              </HStack>
              <IconButton
                size="sm"
                variant="ghost"
                onClick={removeFile}
                isDisabled={uploading}
                icon={<FiX />}
                aria-label="Remove file"
              />
            </HStack>
          </Box>
        )}

        {/* Upload progress */}
        {uploading && (
          <Box>
            <Progress value={uploadProgress} size="sm" colorScheme="blue" mb={2} hasStripe isAnimated />
            <Text fontSize="sm" textAlign="center" color="gray.600">
              Uploading... {Math.round(uploadProgress)}%
            </Text>
          </Box>
        )}

        {/* Upload button */}
        <Button
          colorScheme="blue"
          onClick={handleUpload}
          isDisabled={!selectedFile || !formData.title.trim() || uploading}
          isLoading={uploading}
          loadingText="Uploading..."
          size="lg"
          fontWeight="semibold"
          borderRadius="full"
        >
          Upload Policy
        </Button>
      </VStack>
    </Box>
  );
};

export default PolicyUpload;
