// src/pages/VendorManagement/DueDiligenceForms.jsx

import React, { useState, useEffect } from "react";
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Checkbox,
  Button,
  VStack,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Alert,
  AlertIcon,
  Spinner,
  SimpleGrid,
  CheckboxGroup,
  Stack,
  Progress,
  Badge,
  useToast,
  Grid,
  GridItem,
  Tooltip,
  IconButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Box as ChakraBox,
  Text as ChakraText,
  Flex
} from "@chakra-ui/react";
import { supabase } from '../../supabase';
import { InfoIcon } from '@chakra-ui/icons';

// Risk thresholds configuration
const RISK_THRESHOLDS = {
  LOW: 30,
  MEDIUM: 50,
  HIGH: 70,
  CRITICAL: 85
};

// Service types from your database schema
const SERVICE_TYPES = ['Infrastructure', 'Analytics', 'Communication'];

// Question Database - Organized by risk factors
const questionDatabase = {
  // Base questions for all vendors
  base: [
    {
      id: "vendor_contact",
      question: "Primary vendor contact person",
      type: "text",
      required: true,
      risk_tier: ["low", "medium", "high", "critical"]
    },
    {
      id: "contract_review",
      question: "Contract reviewed by legal team",
      type: "boolean",
      required: true,
      risk_tier: ["low", "medium", "high", "critical"]
    }
  ],
  
  // Risk tier specific questions
  risk_tier: {
    low: [
      {
        id: "low_risk_basic",
        question: "Does the vendor have basic security policies?",
        type: "boolean",
        required: false,
        weight: 5
      }
    ],
    medium: [
      {
        id: "med_risk_insurance",
        question: "Does the vendor carry adequate liability insurance?",
        type: "boolean",
        required: true,
        weight: 10
      }
    ],
    high: [
      {
        id: "high_risk_audit",
        question: "Annual security audit required?",
        type: "boolean",
        required: true,
        weight: 15
      },
      {
        id: "high_risk_compliance",
        question: "Which compliance standards does the vendor meet?",
        type: "multi-select",
        options: ["SOC 2", "ISO 27001", "GDPR", "HIPAA", "PCI DSS"],
        required: true,
        weight: 20
      }
    ],
    critical: [
      {
        id: "critical_risk_pen_test",
        question: "Annual penetration testing required?",
        type: "boolean",
        required: true,
        weight: 25
      },
      {
        id: "critical_risk_bcp",
        question: "Business continuity plan reviewed?",
        type: "boolean",
        required: true,
        weight: 25
      }
    ]
  },
  
  // Risk score based questions (threshold-based)
  risk_score: [
    {
      threshold: 70,
      questions: [
        {
          id: "score_70_data_encryption",
          question: "Does the vendor encrypt data at rest and in transit?",
          type: "boolean",
          required: true,
          weight: 15
        }
      ]
    },
    {
      threshold: 80,
      questions: [
        {
          id: "score_80_access_controls",
          question: "Describe access control mechanisms",
          type: "text",
          required: true,
          weight: 20
        }
      ]
    },
    {
      threshold: 90,
      questions: [
        {
          id: "score_90_incident_response",
          question: "Incident response plan reviewed?",
          type: "boolean",
          required: true,
          weight: 25
        }
      ]
    }
  ],
  
  // Service type specific questions
  service_type: {
    "Infrastructure": [
      {
        id: "infra_data_location",
        question: "Where is data stored geographically?",
        type: "text",
        required: true,
        weight: 15
      },
      {
        id: "infra_backup_policy",
        question: "Backup and recovery procedures documented?",
        type: "boolean",
        required: true,
        weight: 10
      }
    ],
    "Analytics": [
      {
        id: "analytics_data_retention",
        question: "Data retention policy reviewed?",
        type: "boolean",
        required: true,
        weight: 15
      },
      {
        id: "analytics_algorithm_transparency",
        question: "Are algorithms and methodologies transparent?",
        type: "boolean",
        required: false,
        weight: 10
      }
    ],
    "Communication": [
      {
        id: "comms_encryption_standards",
        question: "What encryption standards are used for data transmission?",
        type: "text",
        required: true,
        weight: 20
      },
      {
        id: "comms_uptime_sla",
        question: "Does the vendor meet uptime SLA requirements?",
        type: "boolean",
        required: true,
        weight: 15
      }
    ]
  }
};

/**
 * DueDiligenceForms
 * - Accepts optional prop `vendors` (vendorsProp)
 * - If vendorsProp provided, uses that list; otherwise fetches from Supabase.
 */
const DueDiligenceForms = ({ vendors: vendorsProp }) => {
  const [vendors, setVendors] = useState(vendorsProp || []);
  const [completedAssessments, setCompletedAssessments] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [loading, setLoading] = useState(!vendorsProp); // if prop not provided, we need to load
  const [tabIndex, setTabIndex] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0); // Add refresh key to force re-renders
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Keep vendors state in sync if parent passes a new vendors prop
  useEffect(() => {
    if (vendorsProp && Array.isArray(vendorsProp)) {
      setVendors(vendorsProp);
      setLoading(false);
    }
  }, [vendorsProp]);

  // Fetch vendors based on tab selection ONLY when vendorsProp is not provided
  const fetchVendors = async () => {
    if (vendorsProp) return; // skip fetching if parent passed vendors
    setLoading(true);
    try {
      let query = supabase.from('vendors').select('*');
      
      if (tabIndex === 0) {
        // Due Diligence Queue - pending vendors
        query = query.eq('status', 'pending');
      } else {
        // Completed Assessments - reviewed vendors
        query = query.eq('status', 'reviewed');
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (tabIndex === 0) {
        setVendors(data || []);
      } else {
        setCompletedAssessments(data || []);
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
      toast({
        title: "Error loading vendors",
        description: error?.message || String(error),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabIndex, refreshKey, vendorsProp]);

  const handleVendorSelect = (vendor) => {
    setSelectedVendor(vendor);
    onOpen();
  };

  const handleAssessmentComplete = () => {
    // Refresh data when assessment is completed
    setRefreshKey(prev => prev + 1); // Force refresh of data
    setTabIndex(1); // Switch to completed assessments tab
    onClose();
  };

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
        <Heading size="md" mt={4}>Loading vendors...</Heading>
      </Box>
    );
  }

  return (
    <Box p={5}>
      <Tabs index={tabIndex} onChange={setTabIndex}>
        <TabList>
          <Tab>Due Diligence Queue</Tab>
          <Tab>Completed Assessments</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <Heading size="lg" mb={6}>Vendors Pending Due Diligence</Heading>
            
            {vendors.length === 0 ? (
              <Alert status="info">
                <AlertIcon />
                No vendors pending due diligence.
              </Alert>
            ) : (
              <Card>
                <CardBody>
                  <TableContainer>
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Vendor Name</Th>
                          <Th>Service Type</Th>
                          <Th>Risk Tier</Th>
                          <Th>Risk Score</Th>
                          <Th>Created</Th>
                          <Th>Action</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {vendors.map((vendor) => (
                          <Tr key={vendor.id}>
                            <Td>{vendor.name}</Td>
                            <Td>
                              <Badge colorScheme="purple">{vendor.service_type}</Badge>
                            </Td>
                            <Td>
                              <Badge colorScheme={
                                vendor.risk_tier === 'critical' ? 'red' : 
                                vendor.risk_tier === 'high' ? 'orange' : 
                                vendor.risk_tier === 'medium' ? 'yellow' : 'green'
                              }>
                                {vendor.risk_tier || 'unknown'}
                              </Badge>
                            </Td>
                            <Td>{vendor.risk_score ?? "0"}</Td>
                            <Td>{vendor.created_at ? new Date(vendor.created_at).toLocaleDateString() : "-"}</Td>
                            <Td>
                              <Button 
                                colorScheme="blue" 
                                size="sm"
                                onClick={() => handleVendorSelect(vendor)}
                              >
                                Start Due Diligence
                              </Button>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </CardBody>
              </Card>
            )}
          </TabPanel>
          
          <TabPanel>
            <Heading size="lg" mb={6}>Completed Due Diligence Assessments</Heading>
            
            {completedAssessments.length === 0 ? (
              <Alert status="info">
                <AlertIcon />
                No completed assessments found.
              </Alert>
            ) : (
              <Card>
                <CardBody>
                  <TableContainer>
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Vendor Name</Th>
                          <Th>Service Type</Th>
                          <Th>Risk Score</Th>
                          <Th>Initial Risk Tier</Th>
                          <Th>Completed Date</Th>
                          <Th>Status</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {completedAssessments.map((vendor) => (
                          <Tr key={vendor.id}>
                            <Td>{vendor.name}</Td>
                            <Td>
                              <Badge colorScheme="purple">{vendor.service_type}</Badge>
                            </Td>
                            <Td>{vendor.risk_score}</Td>
                            <Td>
                              <Badge colorScheme={
                                vendor.risk_tier === 'critical' ? 'red' : 
                                vendor.risk_tier === 'high' ? 'orange' : 
                                vendor.risk_tier === 'medium' ? 'yellow' : 'green'
                              }>
                                {vendor.risk_tier}
                              </Badge>
                            </Td>
                            <Td>{vendor.updated_at ? new Date(vendor.updated_at).toLocaleDateString() : "-"}</Td>
                            <Td>
                              <Badge colorScheme="green">Completed</Badge>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </CardBody>
              </Card>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>

      <Modal isOpen={isOpen} onClose={onClose} size="full">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Due Diligence Assessment</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedVendor && (
              <DueDiligenceForm 
                vendor={selectedVendor} 
                onComplete={handleAssessmentComplete}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

/* ---------------- DueDiligenceForm component (unchanged logic, integrated) ---------------- */

const DueDiligenceForm = ({ vendor, onComplete }) => {
  const [questions, setQuestions] = useState([]);
  const [formData, setFormData] = useState({});
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [calculatedRiskScore, setCalculatedRiskScore] = useState(vendor.risk_score || 0);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  // Generate questions based on vendor risk profile
  useEffect(() => {
    if (vendor) {
      generateQuestions(vendor);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendor]);

  // Calculate completion percentage and risk score when form data changes
  useEffect(() => {
    calculateCompletion();
    calculateRiskScore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, questions]);

  // Generate questions based on vendor risk profile
  const generateQuestions = (vendorData) => {
    let generatedQuestions = [];
    
    // Add base questions
    generatedQuestions = [...questionDatabase.base];
    
    // Add risk tier specific questions
    const riskTier = determineRiskTier(vendorData.risk_score);
    if (questionDatabase.risk_tier[riskTier]) {
      generatedQuestions = [
        ...generatedQuestions,
        ...questionDatabase.risk_tier[riskTier]
      ];
    }
    
    // Add risk score threshold questions
    questionDatabase.risk_score.forEach(thresholdGroup => {
      if ((vendorData.risk_score || 0) >= thresholdGroup.threshold) {
        generatedQuestions = [
          ...generatedQuestions,
          ...thresholdGroup.questions
        ];
      }
    });
    
    // Add service type specific questions
    if (questionDatabase.service_type[vendorData.service_type]) {
      generatedQuestions = [
        ...generatedQuestions,
        ...questionDatabase.service_type[vendorData.service_type]
      ];
    }
    
    setQuestions(generatedQuestions);
    
    // Initialize form data
    const initialFormData = {};
    generatedQuestions.forEach(q => {
      if (q.type === 'multi-select') {
        initialFormData[q.id] = [];
      } else if (q.type === 'boolean') {
        initialFormData[q.id] = false;
      } else {
        initialFormData[q.id] = '';
      }
    });
    setFormData(initialFormData);
  };

  // Determine risk tier based on score
  const determineRiskTier = (score) => {
    if (score >= RISK_THRESHOLDS.CRITICAL) return "critical";
    if (score >= RISK_THRESHOLDS.HIGH) return "high";
    if (score >= RISK_THRESHOLDS.MEDIUM) return "medium";
    return "low";
  };

  // Calculate form completion percentage
  const calculateCompletion = () => {
    if (questions.length === 0) {
      setCompletionPercentage(0);
      return;
    }
    
    const answeredCount = questions.filter(q => {
      if (q.required) {
        if (q.type === 'multi-select') return formData[q.id] && formData[q.id].length > 0;
        if (q.type === 'boolean') return formData[q.id] !== false;
        return formData[q.id] !== '';
      }
      return true; // Non-required questions don't affect completion
    }).length;
    
    const requiredCount = questions.filter(q => q.required).length;
    const percentage = requiredCount > 0 ? Math.round((answeredCount / requiredCount) * 100) : 100;
    setCompletionPercentage(percentage);
  };

  // Calculate dynamic risk score based on responses - FIXED LOGIC
  const calculateRiskScore = () => {
    if (!vendor || questions.length === 0) return;
    
    let baseScore = vendor.risk_score || 0;
    let adjustment = 0;
    let maxAdjustment = 0;
    
    questions.forEach(q => {
      if (q.weight) {
        maxAdjustment += q.weight;
        
        // Calculate adjustment based on question type and response
        if (q.type === 'boolean') {
          if (formData[q.id] === true) {
            // Positive response reduces risk
            adjustment -= q.weight;
          } else if (formData[q.id] === false && q.required) {
            // Negative response on required question increases risk
            adjustment += q.weight;
          }
        } else if (q.type === 'multi-select') {
          if (formData[q.id] && formData[q.id].length > 0) {
            // Each selected option reduces risk proportionally
            adjustment -= (q.weight * (formData[q.id].length / q.options.length));
          } else if (q.required) {
            // No selection on required question increases risk
            adjustment += q.weight;
          }
        } else if (q.type === 'text') {
          if (formData[q.id] && formData[q.id].trim() !== '') {
            // Text response reduces risk
            adjustment -= q.weight;
          } else if (q.required) {
            // Empty required text question increases risk
            adjustment += q.weight;
          }
        }
      }
    });
    
    // Calculate final score (ensure it stays between 0-100)
    let finalScore = baseScore;
    
    if (maxAdjustment > 0) {
      // Apply adjustment as a percentage of the maximum possible adjustment
      const adjustmentPercentage = adjustment / maxAdjustment;
      // Adjust the score by up to ±30 points based on responses
      finalScore = baseScore + (adjustmentPercentage * 30);
    }
    
    // Clamp the score between 0 and 100
    finalScore = Math.max(0, Math.min(100, finalScore));
    setCalculatedRiskScore(Math.round(finalScore));
  };

  const handleInputChange = (questionId, value) => {
    setFormData(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if all required questions are answered
    const unansweredRequired = questions.filter(q => 
      q.required && (
        (q.type === 'multi-select' && (!formData[q.id] || formData[q.id].length === 0)) ||
        (q.type === 'boolean' && formData[q.id] === false) ||
        (q.type !== 'boolean' && q.type !== 'multi-select' && (!formData[q.id] || formData[q.id].toString().trim() === ''))
      )
    );
    
    if (unansweredRequired.length > 0) {
      toast({
        title: "Incomplete form",
        description: "Please answer all required questions before submitting.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Update vendor record in Supabase with the new risk score
      const { error } = await supabase
        .from('vendors')
        .update({ 
          status: 'reviewed',
          risk_score: calculatedRiskScore, // This should now be the updated score
          risk_tier: determineRiskTier(calculatedRiskScore),
          due_diligence_notes: JSON.stringify({
            responses: formData,
            calculated_score: calculatedRiskScore,
            assessment_date: new Date().toISOString()
          }),
          due_diligence_progress: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', vendor.id);
      
      if (error) throw error;
      
      toast({
        title: "Assessment submitted",
        description: `Due diligence assessment completed successfully. Risk score updated to ${calculatedRiskScore}.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      // callback to parent component to refresh data
      if (typeof onComplete === "function") {
        onComplete();
      }
    } catch (error) {
      console.error("Error submitting due diligence:", error);
      toast({
        title: "Submission failed",
        description: error?.message || String(error),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (q) => {
    switch (q.type) {
      case "boolean":
        return (
          <FormControl isRequired={q.required} mb={4}>
            <Checkbox
              isChecked={!!formData[q.id]}
              onChange={(e) => handleInputChange(q.id, e.target.checked)}
            >
              {q.question}
              {q.weight && (
                <Tooltip label={`This question affects risk score by ${q.weight} points`}>
                  <IconButton
                    icon={<InfoIcon />}
                    size="xs"
                    ml={2}
                    variant="ghost"
                    aria-label="Weight information"
                  />
                </Tooltip>
              )}
            </Checkbox>
          </FormControl>
        );
      
      case "multi-select":
        return (
          <FormControl isRequired={q.required} mb={4}>
            <FormLabel>
              {q.question}
              {q.weight && (
                <Tooltip label={`This question affects risk score by up to ${q.weight} points`}>
                  <IconButton
                    icon={<InfoIcon />}
                    size="xs"
                    ml={2}
                    variant="ghost"
                    aria-label="Weight information"
                  />
                </Tooltip>
              )}
            </FormLabel>
            <CheckboxGroup
              value={formData[q.id] || []}
              onChange={(value) => handleInputChange(q.id, value)}
            >
              <Stack spacing={2}>
                {q.options && q.options.map(opt => (
                  <Checkbox key={opt} value={opt}>
                    {opt}
                  </Checkbox>
                ))}
              </Stack>
            </CheckboxGroup>
          </FormControl>
        );
      
      case "text":
        return (
          <FormControl isRequired={q.required} mb={4}>
            <FormLabel>
              {q.question}
              {q.weight && (
                <Tooltip label={`This question affects risk score by ${q.weight} points`}>
                  <IconButton
                    icon={<InfoIcon />}
                    size="xs"
                    ml={2}
                    variant="ghost"
                    aria-label="Weight information"
                  />
                </Tooltip>
              )}
            </FormLabel>
            <Textarea
              value={formData[q.id] || ''}
              onChange={(e) => handleInputChange(q.id, e.target.value)}
              placeholder="Enter details..."
            />
          </FormControl>
        );
      
      default:
        return null;
    }
  };

  return (
    <Box>
      <Card variant="outline" mb={6}>
        <CardHeader bg="gray.50" borderBottomWidth="1px">
          <Grid templateColumns="repeat(2, 1fr)" gap={4}>
            <GridItem>
              <Heading size="md">Vendor Assessment Form</Heading>
              <Heading size="sm" color="gray.600" mt={1}>
                {vendor.name} ({vendor.id})
              </Heading>
            </GridItem>
            <GridItem textAlign="right">
              <Heading size="sm">Risk Tier: 
                <Badge 
                  ml={2} 
                  colorScheme={
                    determineRiskTier(calculatedRiskScore) === 'critical' ? 'red' : 
                    determineRiskTier(calculatedRiskScore) === 'high' ? 'orange' : 
                    determineRiskTier(calculatedRiskScore) === 'medium' ? 'yellow' : 'green'
                  }
                >
                  {determineRiskTier(calculatedRiskScore).toUpperCase()}
                </Badge>
              </Heading>
              <Heading size="sm">Initial Risk Score: {vendor.risk_score}/100</Heading>
              <Heading size="sm">Current Risk Score: {calculatedRiskScore}/100</Heading>
              <Heading size="sm">Service: {vendor.service_type}</Heading>
            </GridItem>
          </Grid>
        </CardHeader>
        
        <CardBody>
          <Box mb={6}>
            <Heading size="sm" mb={2}>Assessment Progress: {completionPercentage}%</Heading>
            <Progress value={completionPercentage} size="sm" colorScheme="blue" />
            <Heading size="xs" mt={1} color="gray.600">
              {completionPercentage < 100 ? "Complete all required questions to submit" : "All required questions completed"}
            </Heading>
          </Box>
          
          <Box mb={6} p={4} bg="gray.50" borderRadius="md">
            <Heading size="sm" mb={2}>Dynamic Risk Assessment</Heading>
            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <GridItem>
                <Heading size="xs">Initial Risk Score: {vendor.risk_score}</Heading>
              </GridItem>
              <GridItem>
                <Heading size="xs">Current Calculated Score: {calculatedRiskScore}</Heading>
              </GridItem>
            </Grid>
            <Progress 
              value={calculatedRiskScore} 
              size="lg" 
              colorScheme={
                calculatedRiskScore >= RISK_THRESHOLDS.CRITICAL ? 'red' : 
                calculatedRiskScore >= RISK_THRESHOLDS.HIGH ? 'orange' : 
                calculatedRiskScore >= RISK_THRESHOLDS.MEDIUM ? 'yellow' : 'green'
              } 
              mt={2}
            />
            <Heading size="xs" mt={2}>
              Risk Tier: {determineRiskTier(calculatedRiskScore).toUpperCase()}
            </Heading>
          </Box>
          
          <form onSubmit={handleSubmit}>
            <VStack spacing={6} align="stretch">
              {questions.map((q) => (
                <ChakraBox 
                  key={q.id} 
                  p={4} 
                  borderWidth="1px" 
                  borderRadius="md"
                  bg={q.required ? "blue.50" : "white"}
                  borderColor={q.required ? "blue.100" : "gray.200"}
                >
                  {renderQuestion(q)}
                </ChakraBox>
              ))}
              
              <Button 
                type="submit" 
                colorScheme="purple" 
                size="lg" 
                mt={4}
                isLoading={submitting}
                isDisabled={completionPercentage < 100}
              >
                Submit Assessment
              </Button>
            </VStack>
          </form>
        </CardBody>
      </Card>
    </Box>
  );
};

export default DueDiligenceForms;
