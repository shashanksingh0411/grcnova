import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Heading,
  Card,
  CardBody,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  List,
  ListItem,
  ListIcon,
  Icon,
  useToast,
  Container,
  Flex,
  Spinner
} from '@chakra-ui/react';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  DownloadCloud,  // Most common alternative
  ArrowDownToLine, // Another alternative
  Download as DownloadIcon // Try aliasing
} from "lucide-react";
const PolicyAnalyzer = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const toast = useToast();

  // Mock AI analysis function - replace with actual API call
  const analyzePolicy = async (file) => {
    setIsAnalyzing(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock analysis results - replace with actual AI analysis
      const mockResults = {
        fileName: file.name,
        overallScore: 72,
        totalIssues: 5,
        issues: [
          {
            id: 1,
            severity: 'high',
            category: 'Data Protection',
            description: 'Missing GDPR compliance section',
            suggestion: 'Add a dedicated section for GDPR compliance requirements',
            location: 'Section 3.2'
          },
          {
            id: 2,
            severity: 'medium',
            category: 'Access Control',
            description: 'Weak password policy requirements',
            suggestion: 'Enforce minimum 12-character passwords with special characters',
            location: 'Section 4.1'
          },
          {
            id: 3,
            severity: 'low',
            category: 'Document Structure',
            description: 'Inconsistent heading formatting',
            suggestion: 'Standardize heading styles throughout the document',
            location: 'Multiple sections'
          },
          {
            id: 4,
            severity: 'high',
            category: 'Legal Compliance',
            description: 'Missing incident response procedure',
            suggestion: 'Add detailed incident response and reporting procedures',
            location: 'Section 5.3'
          },
          {
            id: 5,
            severity: 'medium',
            category: 'Privacy',
            description: 'Incomplete data retention policy',
            suggestion: 'Specify exact retention periods for different data types',
            location: 'Section 6.2'
          }
        ]
      };

      setAnalysisResult(mockResults);
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      toast({
        title: 'Analysis Complete',
        description: `Found ${mockResults.totalIssues} issues in your policy`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      clearInterval(progressInterval);
      toast({
        title: 'Analysis Failed',
        description: 'Failed to analyze the document. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check if file is a Word document
      const validTypes = [
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.doc',
        '.docx'
      ];
      
      const fileExtension = file.name.split('.').pop().toLowerCase();
      
      if (!validTypes.includes(file.type) && !validTypes.includes(`.${fileExtension}`)) {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload a Word document (.doc or .docx)',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      setSelectedFile(file);
      setAnalysisResult(null);
      analyzePolicy(file);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect({ target: { files } });
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'red.500';
      case 'medium': return 'orange.500';
      case 'low': return 'yellow.500';
      default: return 'gray.500';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high': return AlertCircle;
      case 'medium': return AlertCircle;
      case 'low': return AlertCircle;
      default: return AlertCircle;
    }
  };

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box textAlign="center">
          <Heading as="h1" size="xl" mb={2}>
            Policy Document Analyzer
          </Heading>
          <Text color="gray.600">
            Upload your policy document and get AI-powered corrective actions
          </Text>
        </Box>

        {/* Upload Section */}
        <Card variant="outlined">
          <CardBody>
            <VStack spacing={4}>
              <Box
                border="2px dashed"
                borderColor="gray.300"
                borderRadius="lg"
                p={8}
                textAlign="center"
                width="100%"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                _hover={{ borderColor: 'blue.500' }}
                transition="border-color 0.2s"
              >
                <Icon as={Upload} boxSize={8} color="gray.400" mb={4} />
                <Text fontSize="lg" fontWeight="medium" mb={2}>
                  Drop your policy document here
                </Text>
                <Text color="gray.500" mb={4}>
                  Supports .doc and .docx files
                </Text>
                <Button
                  colorScheme="blue"
                  onClick={() => fileInputRef.current?.click()}
                  isLoading={isAnalyzing}
                  loadingText="Analyzing..."
                >
                  Choose File
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
              </Box>

              {selectedFile && (
                <Box width="100%">
                  <HStack spacing={3} mb={2}>
                    <Icon as={FileText} color="blue.500" />
                    <Text fontWeight="medium">{selectedFile.name}</Text>
                  </HStack>
                  {isAnalyzing && (
                    <Progress
                      value={uploadProgress}
                      size="sm"
                      colorScheme="blue"
                      borderRadius="full"
                      mb={2}
                    />
                  )}
                </Box>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Analysis Results */}
        {analysisResult && (
          <Card variant="outlined">
            <CardBody>
              <VStack spacing={6} align="stretch">
                {/* Summary */}
                <Box>
                  <Heading as="h3" size="md" mb={4}>
                    Analysis Results for {analysisResult.fileName}
                  </Heading>
                  
                  <HStack spacing={6} mb={6}>
                    <Box textAlign="center">
                      <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                        {analysisResult.overallScore}%
                      </Text>
                      <Text color="gray.600">Overall Score</Text>
                    </Box>
                    <Box textAlign="center">
                      <Text fontSize="2xl" fontWeight="bold" color="red.600">
                        {analysisResult.totalIssues}
                      </Text>
                      <Text color="gray.600">Issues Found</Text>
                    </Box>
                  </HStack>
                </Box>

                {/* Issues List */}
                <Box>
                  <Heading as="h4" size="sm" mb={4}>
                    Corrective Actions Needed:
                  </Heading>
                  
                  <List spacing={4}>
                    {analysisResult.issues.map((issue) => (
                      <ListItem key={issue.id} p={4} borderWidth="1px" borderRadius="lg">
                        <HStack align="start" spacing={3}>
                          <ListIcon
                            as={getSeverityIcon(issue.severity)}
                            color={getSeverityColor(issue.severity)}
                            mt={1}
                          />
                          <Box flex={1}>
                            <HStack mb={1}>
                              <Text
                                fontSize="sm"
                                fontWeight="bold"
                                color={getSeverityColor(issue.severity)}
                                textTransform="uppercase"
                              >
                                {issue.severity}
                              </Text>
                              <Text fontSize="sm" color="gray.500">
                                • {issue.category}
                              </Text>
                              <Text fontSize="sm" color="gray.500">
                                • {issue.location}
                              </Text>
                            </HStack>
                            <Text fontWeight="medium" mb={2}>
                              {issue.description}
                            </Text>
                            <Text fontSize="sm" color="blue.600">
                              💡 Suggestion: {issue.suggestion}
                            </Text>
                          </Box>
                        </HStack>
                      </ListItem>
                    ))}
                  </List>
                </Box>

                {/* Actions */}
                <Flex justify="space-between" pt={4}>
                  <Button
                    leftIcon={<Download size={16} />}
                    variant="outline"
                    colorScheme="blue"
                  >
                    Download Report
                  </Button>
                  <Button
                    colorScheme="blue"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Analyze Another Document
                  </Button>
                </Flex>
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Loading State */}
        {isAnalyzing && !analysisResult && (
          <Card variant="outlined">
            <CardBody>
              <VStack spacing={4} py={8}>
                <Spinner size="xl" color="blue.500" />
                <Text>Analyzing your policy document...</Text>
                <Text fontSize="sm" color="gray.500">
                  AI is reviewing your document for compliance and best practices
                </Text>
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Instructions */}
        {!selectedFile && !isAnalyzing && (
          <Alert status="info" variant="subtle" borderRadius="lg">
            <AlertIcon />
            <Box>
              <AlertTitle>How it works:</AlertTitle>
              <AlertDescription>
                Upload your policy document and our AI will analyze it for compliance issues,
                security gaps, and best practices. You'll receive detailed corrective actions
                to improve your policy.
              </AlertDescription>
            </Box>
          </Alert>
        )}
      </VStack>
    </Container>
  );
};

export default PolicyAnalyzer;