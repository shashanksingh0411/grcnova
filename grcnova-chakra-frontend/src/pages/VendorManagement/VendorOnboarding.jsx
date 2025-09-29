import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RiskAssessment from './RiskAssessment';

import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Heading,
  Divider,
  Checkbox,
  FormControl,
  FormLabel,
  Input,
  Select,
  Stack,
  Badge,
  Progress,
  useTheme,
  Button,
  Icon,
  Textarea,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  RadioGroup,
  Radio,
  useToast
} from '@chakra-ui/react';
import { FiCheckCircle, FiCircle, FiChevronRight, FiChevronLeft, FiUpload } from 'react-icons/fi';
import { supabase } from '../../supabase'; // Assuming you have Supabase configured

const VendorOnboardingJourney = () => {
  const theme = useTheme();
  const toast = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [vendorId, setVendorId] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState({
    certifications: [],
    insurance: [],
    financials: []
  });
  const [uploadProgress, setUploadProgress] = useState({});
  const [userId, setUserId] = useState(null);
  const [serviceTypes, setServiceTypes] = useState([]);
  const navigate = useNavigate();

  // Track risk assessment results
  const [riskAssessmentResults, setRiskAssessmentResults] = useState({
    riskScore: null,
    riskTier: ''
  });

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setUserId(user.id);
      } catch (err) {
        console.error('Error getting user:', err);
      }
    };
    getCurrentUser();
  }, []);

  // Fetch service types
  useEffect(() => {
    const fetchServiceTypes = async () => {
      try {
        const { data, error } = await supabase.from('service_types').select('id, name');
        if (error) throw error;
        setServiceTypes(data || []);
      } catch (err) {
        console.error('Failed fetching service types', err);
      }
    };
    fetchServiceTypes();
  }, []);

  // When risk assessment results are available, persist them to the vendors table (if vendorId exists)
  useEffect(() => {
    const persistRiskToVendor = async () => {
      if (!vendorId) return;
      // only update when we have a non-null score or non-empty tier
      if (riskAssessmentResults.riskScore === null && !riskAssessmentResults.riskTier) return;

      try {
        const { error } = await supabase
          .from('vendors')
          .update({
            risk_score: riskAssessmentResults.riskScore,
            risk_tier: riskAssessmentResults.riskTier
          })
          .eq('id', vendorId);

        if (error) console.error('Error updating vendor risk fields:', error);
      } catch (err) {
        console.error('Error persisting risk to vendor:', err);
      }
    };

    persistRiskToVendor();
  }, [riskAssessmentResults, vendorId]);

  const [formData, setFormData] = useState({
    // Part A: General Company Information
    companyName: '',
    headquartersAddress: '',
    yearFounded: '',
    primaryContact: { name: '', title: '', email: '', phone: '' },
    serviceType: '', // ✅ new field
    natureOfBusiness: '',
    proposedServices: '',
    ownershipStructure: '',
    numberOfEmployees: { total: '', relevant: '' },
    clientReferences: ['', '', ''],

    // Part B: Financial Health
    profitableLastTwoYears: '',
    provideFinancialStatements: '',
    restructuringInfo: '',
    insuranceCoverage: { generalLiability: false, cyberLiability: false, workersCompensation: false, other: '' },

    // Part C: Security & Data Privacy
    hasSecurityPolicy: '',
    securityAudits: '',
    vulnerabilityProcess: '',
    incidentResponsePlan: '',
    privacyCompliance: '',
    dataLocations: '',
    dataEncryption: '',
    dataRetentionPolicy: '',
    accessControls: '',
    employeeBackgroundChecks: '',
    hasBCP: '',
    rtoRpo: '',
    bcpTestDate: '',

    // Part D: Operational & Quality Management
    hasQualityManagement: '',
    kpis: '',
    slas: '',
    subcontractors: '',

    // Part E: Legal & Compliance
    litigationHistory: '',
    complianceEthicalSourcing: '',
    hasCodeOfConduct: '',
    willingToSignAgreement: '',

    // Part F: ESG
    hasEsgPolicy: '',
    tracksCarbonFootprint: '',
    ethicalLaborPractices: ''
  });

  const handleInputChange = (section, field, value) => {
    if (!section) {
      setFormData(prev => ({ ...prev, [field]: value }));
    } else {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    }
  };

  const createVendorRecord = async () => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .insert([
          {
            name: formData.companyName,
            contact_person: formData.primaryContact.name,
            email: formData.primaryContact.email,
            phone: formData.primaryContact.phone,
            service_type: formData.serviceType,
            status: 'pending'
          }
        ])
        .select()
        .single();

      if (error) throw error;
      setVendorId(data.id);
      return data.id;
    } catch (error) {
      console.error('Error creating vendor record:', error);
      toast({
        title: 'Error',
        description: 'Failed to create vendor record',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return null;
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  // this callback will be passed into RiskAssessment and receives score + tier
  const handleRiskAssessmentComplete = (score, tier) => {
    // ensure score is a number (Risk component might return a numeric or string)
    const parsedScore = typeof score === 'number' ? score : Number(score);
    setRiskAssessmentResults({
      riskScore: Number.isNaN(parsedScore) ? null : parsedScore,
      riskTier: tier || ''
    });
  };

  const handleNextStep = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (currentStep === 0) {
        if (!formData.companyName || !formData.primaryContact.email) {
          toast({
            title: 'Missing Information',
            description: 'Please fill in all required fields',
            status: 'error',
            duration: 3000,
            isClosable: true
          });
          setIsSubmitting(false);
          return;
        }
        const newVendorId = await createVendorRecord();
        if (!newVendorId) {
          setIsSubmitting(false);
          return;
        }
        setVendorId(newVendorId);
      }

      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        if (!vendorId) throw new Error('Vendor information is missing');

        // Save the onboarding form
        const { error: formError } = await supabase
          .from('vendor_onboarding_forms')
          .insert([{ vendor_id: vendorId, form_data: formData }]);
        if (formError) throw formError;

        // Build update payload for vendor - include risk fields if available
        const updatePayload = { status: 'completed' };
        if (riskAssessmentResults.riskScore !== null || riskAssessmentResults.riskTier) {
          updatePayload.risk_score = riskAssessmentResults.riskScore;
          updatePayload.risk_tier = riskAssessmentResults.riskTier;
        }

        const { error: statusError } = await supabase
          .from('vendors')
          .update(updatePayload)
          .eq('id', vendorId);
        if (statusError) throw statusError;

        toast({
          title: 'Onboarding Complete',
          description: 'Vendor pre-assessment submitted successfully',
          status: 'success',
          duration: 3000,
          isClosable: true
        });

        navigate(`/vendor-onboarding/${vendorId}`);
      }
    } catch (error) {
      console.error('Error in onboarding process:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to proceed with onboarding',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  // Single top-level file upload handler used by renderFileUploadSection
  const handleFileUpload = async (event, fileType) => {
    if (!vendorId) {
      toast({
        title: 'Error',
        description: 'Please complete the previous steps first',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }

    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    // update UI immediately
    setUploadedFiles(prev => ({ ...prev, [fileType]: [...(prev[fileType] || []), ...files] }));

    for (const file of files) {
      // Simulate progress if the SDK doesn't provide a progress callback
      setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
      let progress = 0;
      const interval = setInterval(() => {
        progress = Math.min(95, progress + 8);
        setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
      }, 200);

      try {
        const fileExt = file.name.split('.').pop();
        const filePath = `${vendorId}/${fileType}/${Date.now()}-${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from('vendor-documents')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get the public URL
        const { data: publicUrlData } = supabase.storage
          .from('vendor-documents')
          .getPublicUrl(filePath);

        // Save metadata in DB
        const { error: insertError } = await supabase
          .from('vendor_documents')
          .insert([{ vendor_id: vendorId, file_type: fileType, file_name: file.name, file_url: publicUrlData.publicUrl }]);

        if (insertError) console.error('DB insert error:', insertError);

        clearInterval(interval);
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));

        toast({
          title: 'Upload Successful',
          description: `${file.name} uploaded successfully`,
          status: 'success',
          duration: 2500,
          isClosable: true
        });
      } catch (err) {
        console.error('Error uploading file:', err);
        clearInterval(interval);
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
        toast({
          title: 'Upload Failed',
          description: `Failed to upload ${file.name}`,
          status: 'error',
          duration: 3000,
          isClosable: true
        });
      }
    }
  };

  // Pre-assessment form renderer
  const renderPreAssessmentForm = () => (
    <Accordion defaultIndex={[0, 1, 2, 3, 4, 5]} allowMultiple>
      {/* Part A: General Company Information */}
      <AccordionItem>
        <AccordionButton>
          <Box flex="1" textAlign="left">
            <Heading as="h3" size="md">Part A: General Company Information</Heading>
          </Box>
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel pb={4}>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel>Company Legal Name</FormLabel>
              <Input
                value={formData.companyName}
                onChange={(e) => handleInputChange('', 'companyName', e.target.value)}
                placeholder="Enter legal company name"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Headquarters Address</FormLabel>
              <Textarea
                value={formData.headquartersAddress}
                onChange={(e) => handleInputChange('', 'headquartersAddress', e.target.value)}
                placeholder="Full address including country"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Year Founded</FormLabel>
              <Input
                type="number"
                value={formData.yearFounded}
                onChange={(e) => handleInputChange('', 'yearFounded', e.target.value)}
                placeholder="Year"
              />
            </FormControl>

            <Heading as="h4" size="sm" mt={4}>Primary Point of Contact</Heading>
            <HStack>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  value={formData.primaryContact.name}
                  onChange={(e) => handleInputChange('primaryContact', 'name', e.target.value)}
                  placeholder="Full name"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Title</FormLabel>
                <Input
                  value={formData.primaryContact.title}
                  onChange={(e) => handleInputChange('primaryContact', 'title', e.target.value)}
                  placeholder="Job title"
                />
              </FormControl>
            </HStack>
            <HStack>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={formData.primaryContact.email}
                  onChange={(e) => handleInputChange('primaryContact', 'email', e.target.value)}
                  placeholder="Email address"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Phone</FormLabel>
                <Input
                  value={formData.primaryContact.phone}
                  onChange={(e) => handleInputChange('primaryContact', 'phone', e.target.value)}
                  placeholder="Phone number"
                />
              </FormControl>
            </HStack>

            <FormControl isRequired>
              <FormLabel>Nature of Business / Core Services Offered</FormLabel>
              <Textarea
                value={formData.natureOfBusiness}
                onChange={(e) => handleInputChange('', 'natureOfBusiness', e.target.value)}
                placeholder="Describe your core business and services"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Proposed Services to be provided</FormLabel>
              <Textarea
                value={formData.proposedServices}
                onChange={(e) => handleInputChange('', 'proposedServices', e.target.value)}
                placeholder="Describe the services you will provide to us"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Company Ownership Structure</FormLabel>
              <Select
                value={formData.ownershipStructure}
                onChange={(e) => handleInputChange('', 'ownershipStructure', e.target.value)}
                placeholder="Select ownership structure"
              >
                <option value="public">Public Company</option>
                <option value="private">Private Company</option>
                <option value="subsidiary">Subsidiary</option>
                <option value="other">Other</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Service Type</FormLabel>
              <Select
                value={formData.serviceType}
                onChange={(e) => handleInputChange('', 'serviceType', e.target.value)}
                placeholder="Select service type"
              >
                {serviceTypes.map((st) => (
                  <option key={st.id} value={st.name}>{st.name}</option>
                ))}
              </Select>
            </FormControl>

            <Heading as="h4" size="sm">Number of Employees</Heading>
            <HStack>
              <FormControl isRequired>
                <FormLabel>Total</FormLabel>
                <Input
                  type="number"
                  value={formData.numberOfEmployees.total}
                  onChange={(e) => handleInputChange('numberOfEmployees', 'total', e.target.value)}
                  placeholder="Total employees"
                />
              </FormControl>
              <FormControl>
                <FormLabel>In Relevant Departments</FormLabel>
                <Input
                  type="number"
                  value={formData.numberOfEmployees.relevant}
                  onChange={(e) => handleInputChange('numberOfEmployees', 'relevant', e.target.value)}
                  placeholder="Employees in relevant departments"
                />
              </FormControl>
            </HStack>

            <Heading as="h4" size="sm">Client References (for similar services)</Heading>
            {formData.clientReferences.map((ref, index) => (
              <FormControl key={index}>
                <FormLabel>Client {index + 1}</FormLabel>
                <Input
                  value={ref}
                  onChange={(e) => {
                    const newRefs = [...formData.clientReferences];
                    newRefs[index] = e.target.value;
                    setFormData(prev => ({ ...prev, clientReferences: newRefs }));
                  }}
                  placeholder="Company name"
                />
              </FormControl>
            ))}
          </VStack>
        </AccordionPanel>
      </AccordionItem>

      {/* Part B: Financial Health */}
      <AccordionItem>
        <AccordionButton>
          <Box flex="1" textAlign="left">
            <Heading as="h3" size="md">Part B: Financial Health</Heading>
          </Box>
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel pb={4}>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel>Has your company been profitable over the last two fiscal years?</FormLabel>
              <RadioGroup
                value={formData.profitableLastTwoYears}
                onChange={(value) => handleInputChange('', 'profitableLastTwoYears', value)}
              >
                <Stack direction="row">
                  <Radio value="yes">Yes</Radio>
                  <Radio value="no">No</Radio>
                </Stack>
              </RadioGroup>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Would you be willing to provide a copy of your annual report or audited financial statements?</FormLabel>
              <RadioGroup
                value={formData.provideFinancialStatements}
                onChange={(value) => handleInputChange('', 'provideFinancialStatements', value)}
              >
                <Stack direction="row">
                  <Radio value="yes">Yes</Radio>
                  <Radio value="no">No</Radio>
                  <Radio value="uponRequest">Upon Request</Radio>
                </Stack>
              </RadioGroup>
            </FormControl>

            <FormControl>
              <FormLabel>Has your company undergone any significant restructuring, mergers, or acquisitions in the last 3 years?</FormLabel>
              <Textarea
                value={formData.restructuringInfo}
                onChange={(e) => handleInputChange('', 'restructuringInfo', e.target.value)}
                placeholder="Please provide details if applicable"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Do you have adequate insurance coverage?</FormLabel>
              <Stack spacing={2} mt={2}>
                <Checkbox
                  isChecked={formData.insuranceCoverage.generalLiability}
                  onChange={(e) => handleInputChange('insuranceCoverage', 'generalLiability', e.target.checked)}
                >
                  General Liability
                </Checkbox>
                <Checkbox
                  isChecked={formData.insuranceCoverage.cyberLiability}
                  onChange={(e) => handleInputChange('insuranceCoverage', 'cyberLiability', e.target.checked)}
                >
                  Cyber Liability / Errors & Omissions
                </Checkbox>
                <Checkbox
                  isChecked={formData.insuranceCoverage.workersCompensation}
                  onChange={(e) => handleInputChange('insuranceCoverage', 'workersCompensation', e.target.checked)}
                >
                  Workers' Compensation
                </Checkbox>
                <Checkbox
                  isChecked={!!formData.insuranceCoverage.other}
                  onChange={(e) => {
                    if (!e.target.checked) handleInputChange('insuranceCoverage', 'other', '');
                  }}
                >
                  Other (please specify)
                </Checkbox>
                {!!formData.insuranceCoverage.other && (
                  <Input
                    value={formData.insuranceCoverage.other}
                    onChange={(e) => handleInputChange('insuranceCoverage', 'other', e.target.value)}
                    placeholder="Specify other insurance"
                    ml={6}
                  />
                )}
              </Stack>
            </FormControl>
          </VStack>
        </AccordionPanel>
      </AccordionItem>

      {/* Part C: Security & Data Privacy */}
      <AccordionItem>
        <AccordionButton>
          <Box flex="1" textAlign="left">
            <Heading as="h3" size="md">Part C: Security & Data Privacy</Heading>
          </Box>
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel pb={4}>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel>Do you have a formal Information Security Policy?</FormLabel>
              <RadioGroup
                value={formData.hasSecurityPolicy}
                onChange={(value) => handleInputChange('', 'hasSecurityPolicy', value)}
              >
                <Stack direction="row">
                  <Radio value="yes">Yes</Radio>
                  <Radio value="no">No</Radio>
                </Stack>
              </RadioGroup>
            </FormControl>

            <FormControl>
              <FormLabel>Do you undergo regular independent security audits (e.g., SOC 2 Type II, ISO 27001)?</FormLabel>
              <Textarea
                value={formData.securityAudits}
                onChange={(e) => handleInputChange('', 'securityAudits', e.target.value)}
                placeholder="Please describe your audit processes and attach recent reports if available"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Describe your process for managing security vulnerabilities and patching systems</FormLabel>
              <Textarea
                value={formData.vulnerabilityProcess}
                onChange={(e) => handleInputChange('', 'vulnerabilityProcess', e.target.value)}
                placeholder="Describe your vulnerability management process"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>What is your process for responding to a security breach or data incident? Do you have a formal Incident Response Plan?</FormLabel>
              <Textarea
                value={formData.incidentResponsePlan}
                onChange={(e) => handleInputChange('', 'incidentResponsePlan', e.target.value)}
                placeholder="Describe your incident response process"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>How do you ensure compliance with data privacy regulations (e.g., GDPR, CCPA, HIPAA)?</FormLabel>
              <Textarea
                value={formData.privacyCompliance}
                onChange={(e) => handleInputChange('', 'privacyCompliance', e.target.value)}
                placeholder="Describe your compliance measures"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Where will our data be stored, processed, and transmitted? Please list all data centers and cloud providers by country.</FormLabel>
              <Textarea
                value={formData.dataLocations}
                onChange={(e) => handleInputChange('', 'dataLocations', e.target.value)}
                placeholder="List data storage locations and providers"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>What controls are in place to ensure data is encrypted in transit and at rest?</FormLabel>
              <Textarea
                value={formData.dataEncryption}
                onChange={(e) => handleInputChange('', 'dataEncryption', e.target.value)}
                placeholder="Describe your encryption methods"
              />
            </FormControl>

            <FormControl>
              <FormLabel>What are your data retention and destruction policies?</FormLabel>
              <Textarea
                value={formData.dataRetentionPolicy}
                onChange={(e) => handleInputChange('', 'dataRetentionPolicy', e.target.value)}
                placeholder="Describe your data retention and destruction policies"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>How is access to client data and systems controlled and monitored?</FormLabel>
              <Textarea
                value={formData.accessControls}
                onChange={(e) => handleInputChange('', 'accessControls', e.target.value)}
                placeholder="Describe your access control measures"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Describe your process for employee background checks</FormLabel>
              <Textarea
                value={formData.employeeBackgroundChecks}
                onChange={(e) => handleInputChange('', 'employeeBackgroundChecks', e.target.value)}
                placeholder="Describe your background check process"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Do you have a formal Business Continuity and Disaster Recovery plan?</FormLabel>
              <RadioGroup
                value={formData.hasBCP}
                onChange={(value) => handleInputChange('', 'hasBCP', value)}
              >
                <Stack direction="row">
                  <Radio value="yes">Yes</Radio>
                  <Radio value="no">No</Radio>
                </Stack>
              </RadioGroup>
            </FormControl>

            <FormControl>
              <FormLabel>What is your guaranteed Recovery Time Objective (RTO) and Recovery Point Objective (RPO)?</FormLabel>
              <Input
                value={formData.rtoRpo}
                onChange={(e) => handleInputChange('', 'rtoRpo', e.target.value)}
                placeholder="e.g., RTO: 4 hours, RPO: 1 hour"
              />
            </FormControl>

            <FormControl>
              <FormLabel>When was the last time this plan was tested?</FormLabel>
              <Input
                type="date"
                value={formData.bcpTestDate}
                onChange={(e) => handleInputChange('', 'bcpTestDate', e.target.value)}
              />
            </FormControl>
          </VStack>
        </AccordionPanel>
      </AccordionItem>

      {/* Part D: Operational & Quality Management */}
      <AccordionItem>
        <AccordionButton>
          <Box flex="1" textAlign="left">
            <Heading as="h3" size="md">Part D: Operational & Quality Management</Heading>
          </Box>
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel pb={4}>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel>Do you have a formal Quality Management System (e.g., ISO 9001)?</FormLabel>
              <RadioGroup
                value={formData.hasQualityManagement}
                onChange={(value) => handleInputChange('', 'hasQualityManagement', value)}
              >
                <Stack direction="row">
                  <Radio value="yes">Yes</Radio>
                  <Radio value="no">No</Radio>
                </Stack>
              </RadioGroup>
            </FormControl>

            <FormControl>
              <FormLabel>What key performance indicators (KPIs) do you track for service delivery?</FormLabel>
              <Textarea
                value={formData.kpis}
                onChange={(e) => handleInputChange('', 'kpis', e.target.value)}
                placeholder="Describe your KPI tracking process"
              />
            </FormControl>

            <FormControl>
              <FormLabel>What are your standard Service Level Agreements (SLAs) for service availability and performance?</FormLabel>
              <Textarea
                value={formData.slas}
                onChange={(e) => handleInputChange('', 'slas', e.target.value)}
                placeholder="Describe your SLAs"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Do you use subcontractors in your service delivery? If yes, please describe how you manage them.</FormLabel>
              <Textarea
                value={formData.subcontractors}
                onChange={(e) => handleInputChange('', 'subcontractors', e.target.value)}
                placeholder="Describe your subcontractor management process"
              />
            </FormControl>
          </VStack>
        </AccordionPanel>
      </AccordionItem>

      {/* Part E: Legal & Compliance */}
      <AccordionItem>
        <AccordionButton>
          <Box flex="1" textAlign="left">
            <Heading as="h3" size="md">Part E: Legal & Compliance</Heading>
          </Box>
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel pb={4}>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Has your company been involved in any significant litigation, regulatory actions, or compliance violations in the last 5 years?</FormLabel>
              <Textarea
                value={formData.litigationHistory}
                onChange={(e) => handleInputChange('', 'litigationHistory', e.target.value)}
                placeholder="Please provide details if applicable"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Do you have policies and processes to ensure compliance with ethical sourcing and anti-corruption laws?</FormLabel>
              <Textarea
                value={formData.complianceEthicalSourcing}
                onChange={(e) => handleInputChange('', 'complianceEthicalSourcing', e.target.value)}
                placeholder="Describe your compliance measures"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Do you have a formal Code of Conduct that applies to all employees?</FormLabel>
              <RadioGroup
                value={formData.hasCodeOfConduct}
                onChange={(value) => handleInputChange('', 'hasCodeOfConduct', value)}
              >
                <Stack direction="row">
                  <Radio value="yes">Yes</Radio>
                  <Radio value="no">No</Radio>
                </Stack>
              </RadioGroup>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Are you willing to sign our standard vendor agreement and adhere to its terms?</FormLabel>
              <RadioGroup
                value={formData.willingToSignAgreement}
                onChange={(value) => handleInputChange('', 'willingToSignAgreement', value)}
              >
                <Stack direction="row">
                  <Radio value="yes">Yes</Radio>
                  <Radio value="no">No</Radio>
                  <Radio value="withModifications">With Modifications</Radio>
                </Stack>
              </RadioGroup>
            </FormControl>
          </VStack>
        </AccordionPanel>
      </AccordionItem>

      {/* Part F: ESG */}
      <AccordionItem>
        <AccordionButton>
          <Box flex="1" textAlign="left">
            <Heading as="h3" size="md">Part F: Environmental, Social & Governance (ESG)</Heading>
          </Box>
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel pb={4}>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel>Do you have a formal ESG (Environmental, Social, Governance) policy?</FormLabel>
              <RadioGroup
                value={formData.hasEsgPolicy}
                onChange={(value) => handleInputChange('', 'hasEsgPolicy', value)}
              >
                <Stack direction="row">
                  <Radio value="yes">Yes</Radio>
                  <Radio value="no">No</Radio>
                  <Radio value="developing">Currently Developing</Radio>
                </Stack>
              </RadioGroup>
            </FormControl>

            <FormControl>
              <FormLabel>Do you track and report on your carbon footprint or other environmental impacts?</FormLabel>
              <Textarea
                value={formData.tracksCarbonFootprint}
                onChange={(e) => handleInputChange('', 'tracksCarbonFootprint', e.target.value)}
                placeholder="Describe your environmental tracking and reporting"
              />
            </FormControl>

            <FormControl>
              <FormLabel>What measures do you have in place to ensure ethical labor practices throughout your supply chain?</FormLabel>
              <Textarea
                value={formData.ethicalLaborPractices}
                onChange={(e) => handleInputChange('', 'ethicalLaborPractices', e.target.value)}
                placeholder="Describe your ethical labor practices"
              />
            </FormControl>
          </VStack>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );

  // Steps configuration: Pre-Assessment, Risk Assessment (passes callback), Documents, Contract
  const steps = [
    { title: 'Pre-Assessment', component: renderPreAssessmentForm },
    {
    title: "Risk Assessment",
    content: (
      <RiskAssessment
        formData={formData}
        onRiskAssessmentComplete={handleRiskAssessmentComplete}
      />
    ),
  },
    { title: 'Documents', description: 'Certification Upload' },
    { title: 'Contract', description: 'Agreement Signing' }
  ];

  const renderStepContent = () => {
    const step = steps[currentStep];
    if (typeof step.component === 'function') return step.component();
    if (React.isValidElement(step.component)) return step.component;
    return (
      <Box>
        <Text>{step.description || 'No content for this step yet.'}</Text>
      </Box>
    );
  };

  const renderFileUploadSection = (title, fileType, acceptedTypes = '*') => {
    const files = uploadedFiles[fileType] || [];

    return (
      <FormControl mb={6}>
        <FormLabel>{title}</FormLabel>
        <Input
          type="file"
          multiple
          accept={acceptedTypes}
          onChange={(e) => handleFileUpload(e, fileType)}
          display="none"
          id={`file-upload-${fileType}`}
        />
        <Button
          leftIcon={<FiUpload />}
          variant="outline"
          onClick={() => document.getElementById(`file-upload-${fileType}`).click()}
          mb={3}
          isDisabled={!vendorId}
        >
          Select Files
        </Button>

        {!vendorId && (
          <Text fontSize="sm" color="gray.500" mb={2}>
            Complete the previous steps to enable file uploads
          </Text>
        )}

        {files.length > 0 && (
          <VStack align="stretch" mt={2}>
            {files.map((file, index) => (
              <Box key={index} p={2} borderWidth="1px" borderRadius="md">
                <Text fontSize="sm">{file.name}</Text>
                {uploadProgress[file.name] !== undefined && uploadProgress[file.name] < 100 && (
                  <Progress value={uploadProgress[file.name]} size="xs" mt={1} />
                )}
                {uploadProgress[file.name] === 100 && (
                  <Text fontSize="sm" color="green.500" mt={1}>
                    Upload Complete
                  </Text>
                )}
              </Box>
            ))}
          </VStack>
        )}
      </FormControl>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderPreAssessmentForm();
      case 1:
        return (
          <Box>
            <Heading as="h3" size="md" mb={4}>Risk Assessment</Heading>
            <Text mb={4}>Based on your responses, we'll determine the risk tier for your vendor relationship.</Text>
            <RiskAssessment formData={formData} onRiskAssessmentComplete={handleRiskAssessmentComplete} />
          </Box>
        );
      case 2:
        return (
          <Box>
            <Heading as="h3" size="md" mb={4}>Document Upload</Heading>
            <VStack spacing={4}>
              {renderFileUploadSection('Upload Certifications (SOC 2, ISO 27001, etc.)', 'certifications', '.pdf,.doc,.docx')}
              {renderFileUploadSection('Upload Insurance Certificates', 'insurance', '.pdf,.jpg,.jpeg,.png')}
              {renderFileUploadSection('Upload Financial Statements (if applicable)', 'financials', '.pdf,.xls,.xlsx')}
            </VStack>
          </Box>
        );
      case 3:
        return (
          <Box>
            <Heading as="h3" size="md" mb={4}>Contract Agreement</Heading>
            <Text>Review and sign the vendor agreement to complete the onboarding process.</Text>
            {/* Contract signing component would go here */}
          </Box>
        );
      default:
        return renderPreAssessmentForm();
    }
  };

  

  return (
    <Box maxW="1000px" mx="auto" p={8}>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={10}>
        <Heading as="h1" size="xl" fontWeight="semibold" color="gray.800">
          Vendor Onboarding Journey
        </Heading>
        <Badge colorScheme="purple" px={3} py={1} borderRadius="full" fontSize="sm">
          In Progress
        </Badge>
      </Flex>

      {/* Progress Bar */}
      <Box mb={12}>
        <Progress value={(currentStep + 1) * 25} size="sm" colorScheme="purple" mb={2} borderRadius="full" />
        <Text fontSize="sm" color="gray.500" textAlign="right">Step {currentStep + 1} of {steps.length}</Text>
      </Box>

      {/* Steps Timeline */}
      <Flex justify="space-between" position="relative" mb={16}>
        {steps.map((step, index) => (
          <Box key={index} textAlign="center" zIndex={1} flex="1">
            <Box
              w="40px"
              h="40px"
              borderRadius="full"
              bg={index <= currentStep ? 'purple.500' : 'gray.100'}
              color={index <= currentStep ? 'white' : 'gray.400'}
              display="flex"
              alignItems="center"
              justifyContent="center"
              mb={2}
              mx="auto"
              borderWidth={index <= currentStep ? 0 : '2px'}
              borderColor="gray.200"
            >
              {index < currentStep ? (
                <Icon as={FiCheckCircle} boxSize={5} />
              ) : (
                <Icon as={FiCircle} boxSize={5} />
              )}
            </Box>
            <Text fontWeight="medium" color={index <= currentStep ? 'gray.800' : 'gray.500'}>
              {step.title}
            </Text>
            <Text fontSize="sm" color="gray.500">{step.description}</Text>
          </Box>
        ))}
        <Divider 
          position="absolute" 
          top="20px" 
          left="10%" 
          right="10%" 
          borderColor="gray.200" 
          borderWidth="1px"
        />
      </Flex>

      {/* Current Step Card */}
      <Box 
        bg="white" 
        p={8} 
        borderRadius="xl" 
        boxShadow="sm" 
        borderWidth="1px" 
        borderColor="gray.100"
      >
        <Flex align="center" mb={8}>
          <Box 
            bg="purple.50" 
            w="12" 
            h="12" 
            borderRadius="lg" 
            display="flex" 
            alignItems="center" 
            justifyContent="center" 
            mr={4}
          >
            <Text fontSize="xl" fontWeight="bold" color="purple.600">{currentStep + 1}</Text>
          </Box>
          <Box>
            <Text fontSize="sm" color="purple.600" fontWeight="medium">CURRENT STEP</Text>
            <Heading as="h2" size="lg" color="gray.800">{steps[currentStep].title}</Heading>
            <Text fontSize="sm" color="gray.500">{steps[currentStep].description}</Text>
          </Box>
        </Flex>

        {/* Form Content */}
        {renderCurrentStep()}

        {/* Navigation Buttons */}
        <Flex justify="space-between" mt={8}>
          <Button 
            leftIcon={<FiChevronLeft />} 
            variant="outline"
            onClick={handlePreviousStep}
            isDisabled={currentStep === 0}
          >
            Previous
          </Button>
         <Button 
  rightIcon={currentStep === steps.length - 1 ? null : <FiChevronRight />} 
  colorScheme="purple" 
  onClick={handleNextStep}
  isLoading={isSubmitting}
  loadingText={currentStep === steps.length - 1 ? "Completing..." : "Processing..."}
>
  {currentStep === steps.length - 1 ? 'Complete Onboarding' : 'Next Step'}
</Button>
        </Flex>
      </Box>
    </Box>
  );
};

export default VendorOnboardingJourney;