import React, { useState } from 'react';
import {
  Box,
  Heading,
  Flex,
  Input,
  VStack,
  HStack,
  Text,
  Tag,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  useColorModeValue,
  FormControl,
  FormLabel,
  Textarea,
  Icon,
  useToast,
  Select,
  Button,
  Card,
  CardHeader,
  CardBody,
  Badge,
  Progress,
  Divider,
  Tooltip
} from '@chakra-ui/react';
import { FiUpload, FiCheckCircle, FiFile, FiSearch, FiChevronDown } from 'react-icons/fi';

const ComplianceFrameworkManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [evidenceNotes, setEvidenceNotes] = useState({});
  const [files, setFiles] = useState({});
  const [selectedFramework, setSelectedFramework] = useState('iso27001');
  const [uploadProgress, setUploadProgress] = useState({});
  const toast = useToast();

  // Complete Framework Data
  const frameworks = {
    iso27001: {
      name: 'ISO 27001',
      description: 'Information Security Management System',
      iconColor: 'blue',
      categories: [
        {
          id: 'A5',
          name: 'Organizational Controls',
          controls: [
            { id: 'A.5.1', name: 'Policies for information security' },
            { id: 'A.5.2', name: 'Information security roles and responsibilities' },
            { id: 'A.5.3', name: 'Segregation of duties' },
            { id: 'A.5.4', name: 'Management responsibilities' },
            { id: 'A.5.5', name: 'Contact with authorities' },
            { id: 'A.5.6', name: 'Contact with special interest groups' },
            { id: 'A.5.7', name: 'Threat intelligence' },
            { id: 'A.5.8', name: 'Information security in project management' },
            { id: 'A.5.9', name: 'Inventory of information and other associated assets' },
            { id: 'A.5.10', name: 'Acceptable use of information and other associated assets' },
            { id: 'A.5.11', name: 'Return of assets' },
            { id: 'A.5.12', name: 'Classification of information' },
            { id: 'A.5.13', name: 'Labeling of information' },
            { id: 'A.5.14', name: 'Information transfer' },
            { id: 'A.5.15', name: 'Access control' },
            { id: 'A.5.16', name: 'Identity management' },
            { id: 'A.5.17', name: 'Authentication information' },
            { id: 'A.5.18', name: 'Access rights' },
            { id: 'A.5.19', name: 'Information security in supplier relationships' },
            { id: 'A.5.20', name: 'Addressing information security within supplier agreements' },
            { id: 'A.5.21', name: 'Managing information security in the ICT supply chain' },
            { id: 'A.5.22', name: 'Monitoring, review and change management of supplier services' },
            { id: 'A.5.23', name: 'Information security for use of cloud services' },
            { id: 'A.5.24', name: 'Information security incident management planning and preparation' },
            { id: 'A.5.25', name: 'Assessment and decision on information security events' },
            { id: 'A.5.26', name: 'Response to information security incidents' },
            { id: 'A.5.27', name: 'Learning from information security incidents' },
            { id: 'A.5.28', name: 'Collection of evidence' },
            { id: 'A.5.29', name: 'Information security during disruption' },
            { id: 'A.5.30', name: 'ICT readiness for business continuity' },
            { id: 'A.5.31', name: 'Legal, statutory, regulatory and contractual requirements' },
            { id: 'A.5.32', name: 'Intellectual property rights' },
            { id: 'A.5.33', name: 'Protection of records' },
            { id: 'A.5.34', name: 'Privacy and protection of PII' },
            { id: 'A.5.35', name: 'Independent review of information security' },
            { id: 'A.5.36', name: 'Compliance with policies, rules and standards for information security' },
            { id: 'A.5.37', name: 'Documented operating procedures' }
          ]
        },
        {
          id: 'A6',
          name: 'People Controls',
          controls: [
            { id: 'A.6.1', name: 'Screening' },
            { id: 'A.6.2', name: 'Terms and conditions of employment' },
            { id: 'A.6.3', name: 'Information security awareness, education and training' },
            { id: 'A.6.4', name: 'Disciplinary process' },
            { id: 'A.6.5', name: 'Responsibilities after termination or change of employment' }
          ]
        },
        {
          id: 'A7',
          name: 'Physical Controls',
          controls: [
            { id: 'A.7.1', name: 'Physical security perimeters' },
            { id: 'A.7.2', name: 'Physical entry controls' },
            { id: 'A.7.3', name: 'Securing offices, rooms and facilities' },
            { id: 'A.7.4', name: 'Physical security monitoring' },
            { id: 'A.7.5', name: 'Protecting against physical and environmental threats' },
            { id: 'A.7.6', name: 'Working in secure areas' },
            { id: 'A.7.7', name: 'Clear desk and clear screen' },
            { id: 'A.7.8', name: 'Equipment siting and protection' },
            { id: 'A.7.9', name: 'Security of assets off-premises' },
            { id: 'A.7.10', name: 'Storage media' },
            { id: 'A.7.11', name: 'Supporting utilities' },
            { id: 'A.7.12', name: 'Cabling security' },
            { id: 'A.7.13', name: 'Equipment maintenance' },
            { id: 'A.7.14', name: 'Secure disposal or re-use of equipment' }
          ]
        },
        {
          id: 'A8',
          name: 'Technological Controls',
          controls: [
            { id: 'A.8.1', name: 'User endpoint devices' },
            { id: 'A.8.2', name: 'Privileged access rights' },
            { id: 'A.8.3', name: 'Information access restriction' },
            { id: 'A.8.4', name: 'Access to source code' },
            { id: 'A.8.5', name: 'Secure authentication' },
            { id: 'A.8.6', name: 'Capacity management' },
            { id: 'A.8.7', name: 'Protection against malware' },
            { id: 'A.8.8', name: 'Management of technical vulnerabilities' },
            { id: 'A.8.9', name: 'Configuration management' },
            { id: 'A.8.10', name: 'Information deletion' },
            { id: 'A.8.11', name: 'Data masking' },
            { id: 'A.8.12', name: 'Data leakage prevention' },
            { id: 'A.8.13', name: 'Information backup' },
            { id: 'A.8.14', name: 'Redundancy of information processing facilities' },
            { id: 'A.8.15', name: 'Logging' },
            { id: 'A.8.16', name: 'Monitoring activities' },
            { id: 'A.8.17', name: 'Clock synchronization' },
            { id: 'A.8.18', name: 'Installation of software on operational systems' },
            { id: 'A.8.19', name: 'Networks security' },
            { id: 'A.8.20', name: 'Security of network services' },
            { id: 'A.8.21', name: 'Segregation of networks' },
            { id: 'A.8.22', name: 'Web filtering' },
            { id: 'A.8.23', name: 'Use of cryptography' },
            { id: 'A.8.24', name: 'Secure development life cycle' },
            { id: 'A.8.25', name: 'Application security requirements' },
            { id: 'A.8.26', name: 'Secure system architecture and engineering principles' },
            { id: 'A.8.27', name: 'Secure coding' },
            { id: 'A.8.28', name: 'Security testing in development and acceptance' },
            { id: 'A.8.29', name: 'Outsourced development' },
            { id: 'A.8.30', name: 'Separation of development, test and production environments' },
            { id: 'A.8.31', name: 'Change management' },
            { id: 'A.8.32', name: 'Test information' },
            { id: 'A.8.33', name: 'Protection of information systems during audit testing' }
          ]
        },
        {
          id: 'A9',
          name: 'Supplier Relationships',
          controls: [
            { id: 'A.9.1', name: 'Information security policy for supplier relationships' },
            { id: 'A.9.2', name: 'Addressing security within supplier agreements' },
            { id: 'A.9.3', name: 'Information and communication technology supply chain' },
            { id: 'A.9.4', name: 'Monitoring and review of supplier services' },
            { id: 'A.9.5', name: 'Managing changes to supplier services' }
          ]
        }
      ]
    },
    hipaa: {
      name: 'HIPAA',
      description: 'Health Insurance Portability and Accountability Act',
      iconColor: 'purple',
      categories: [
        {
          id: 'hipaa_admin',
          name: 'Administrative Safeguards',
          controls: [
            { id: '164.308(a)(1)', name: 'Security Management Process' },
            { id: '164.308(a)(2)', name: 'Assigned Security Responsibility' },
            { id: '164.308(a)(3)', name: 'Workforce Security' },
            { id: '164.308(a)(4)', name: 'Information Access Management' },
            { id: '164.308(a)(5)', name: 'Security Awareness and Training' },
            { id: '164.308(a)(6)', name: 'Security Incident Procedures' },
            { id: '164.308(a)(7)', name: 'Contingency Plan' },
            { id: '164.308(a)(8)', name: 'Evaluation' }
          ]
        },
        {
          id: 'hipaa_physical',
          name: 'Physical Safeguards',
          controls: [
            { id: '164.310(a)(1)', name: 'Facility Access Controls' },
            { id: '164.310(b)', name: 'Workstation Use' },
            { id: '164.310(c)', name: 'Workstation Security' },
            { id: '164.310(d)(1)', name: 'Device and Media Controls' }
          ]
        },
        {
          id: 'hipaa_technical',
          name: 'Technical Safeguards',
          controls: [
            { id: '164.312(a)(1)', name: 'Access Control' },
            { id: '164.312(b)', name: 'Audit Controls' },
            { id: '164.312(c)(1)', name: 'Integrity Controls' },
            { id: '164.312(d)', name: 'Person or Entity Authentication' },
            { id: '164.312(e)(1)', name: 'Transmission Security' }
          ]
        },
        {
          id: 'hipaa_org',
          name: 'Organizational Requirements',
          controls: [
            { id: '164.314(a)(1)', name: 'Business Associate Contracts' },
            { id: '164.314(b)(1)', name: 'Requirements for Group Health Plans' }
          ]
        },
        {
          id: 'hipaa_policies',
          name: 'Policies and Procedures',
          controls: [
            { id: '164.316(a)', name: 'Policies and Procedures' },
            { id: '164.316(b)(1)', name: 'Documentation' }
          ]
        }
      ]
    },
    soc2: {
      name: 'SOC 2',
      description: 'Service Organization Controls',
      iconColor: 'green',
      categories: [
        {
          id: 'soc_cc',
          name: 'Common Criteria',
          controls: [
            { id: 'CC1', name: 'Control Environment' },
            { id: 'CC2', name: 'Communication and Information' },
            { id: 'CC3', name: 'Risk Assessment' },
            { id: 'CC4', name: 'Monitoring Activities' },
            { id: 'CC5', name: 'Control Activities' },
            { id: 'CC6', name: 'Logical and Physical Access Controls' },
            { id: 'CC7', name: 'System Operations' },
            { id: 'CC8', name: 'Change Management' },
            { id: 'CC9', name: 'Risk Mitigation' }
          ]
        },
        {
          id: 'soc_privacy',
          name: 'Privacy Criteria',
          controls: [
            { id: 'P1', name: 'Notice and Communication of Objectives' },
            { id: 'P2', name: 'Choice and Consent' },
            { id: 'P3', name: 'Collection' },
            { id: 'P4', name: 'Use, Retention, and Disposal' },
            { id: 'P5', name: 'Access' },
            { id: 'P6', name: 'Disclosure to Third Parties' },
            { id: 'P7', name: 'Security for Privacy' },
            { id: 'P8', name: 'Quality' },
            { id: 'P9', name: 'Monitoring and Enforcement' }
          ]
        }
      ]
    }
  };

  // Get all controls for the selected framework
  const getAllControls = () => {
    return frameworks[selectedFramework].categories.flatMap(
      category => category.controls.map(control => ({
        ...control,
        categoryName: category.name,
        categoryId: category.id
      }))
    );
  };

  // Handle file upload
  const handleFileUpload = (controlId, file) => {
    if (!file) return;
    
    setUploadProgress(prev => ({ ...prev, [controlId]: 0 }));
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev[controlId] + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          setFiles(prev => ({ ...prev, [controlId]: file }));
          toast({
            title: 'Upload complete',
            description: `Evidence for ${controlId} uploaded successfully`,
            status: 'success',
            duration: 3000,
            isClosable: true
          });
          return { ...prev, [controlId]: 100 };
        }
        return { ...prev, [controlId]: newProgress };
      });
    }, 200);
  };

  // Filter controls based on search term
  const filteredControls = getAllControls().filter(control =>
    control.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    control.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group controls by category for display
  const controlsByCategory = filteredControls.reduce((acc, control) => {
    if (!acc[control.categoryId]) {
      acc[control.categoryId] = {
        name: control.categoryName,
        controls: []
      };
    }
    acc[control.categoryId].controls.push(control);
    return acc;
  }, {});

  return (
    <Box p={{ base: 4, md: 8 }} maxW="1400px" mx="auto">
      <Flex direction="column" gap={6}>
        {/* Header Section */}
        <Card variant="outline" boxShadow="sm">
          <CardHeader pb={0}>
            <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
              <Box>
                <Heading size="lg">Compliance Framework Manager</Heading>
                <Text color="gray.500" mt={1}>
                  Manage controls and evidence collection
                </Text>
              </Box>
              <Badge 
                colorScheme={frameworks[selectedFramework].iconColor}
                px={3}
                py={1}
                borderRadius="full"
                fontSize="sm"
                fontWeight="medium"
              >
                {frameworks[selectedFramework].name}
              </Badge>
            </Flex>
          </CardHeader>
          <CardBody pt={4}>
            <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
              <FormControl flex={1}>
                <FormLabel fontSize="sm" fontWeight="medium" color="gray.600">
                  Compliance Framework
                </FormLabel>
                <Select
                  value={selectedFramework}
                  onChange={(e) => {
                    setSelectedFramework(e.target.value);
                    setSearchTerm('');
                  }}
                  variant="filled"
                  size="md"
                >
                  <option value="iso27001">ISO 27001</option>
                  <option value="hipaa">HIPAA</option>
                  <option value="soc2">SOC 2</option>
                </Select>
              </FormControl>
              <FormControl flex={2}>
                <FormLabel fontSize="sm" fontWeight="medium" color="gray.600">
                  Search Controls
                </FormLabel>
                <Flex align="center" pos="relative">
                  <Input
                    placeholder={`Search ${frameworks[selectedFramework].name} controls...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    pl={10}
                    variant="filled"
                    size="md"
                  />
                  <Icon as={FiSearch} pos="absolute" left={3} color="gray.500" />
                </Flex>
              </FormControl>
            </Flex>
          </CardBody>
        </Card>

        {/* Controls Section */}
        <Card variant="outline" boxShadow="sm">
          <CardHeader>
            <Heading size="md">
              {frameworks[selectedFramework].name} Controls
              <Badge ml={2} colorScheme="gray" variant="subtle">
                {filteredControls.length} control{filteredControls.length !== 1 ? 's' : ''}
              </Badge>
            </Heading>
          </CardHeader>
          <CardBody pt={0}>
            {Object.entries(controlsByCategory).length > 0 ? (
              <Accordion allowMultiple>
                {Object.entries(controlsByCategory).map(([categoryId, category]) => (
                  <AccordionItem key={categoryId} border="none">
                    <AccordionButton
                      px={4}
                      py={3}
                      _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
                    >
                      <HStack flex="1" textAlign="left" spacing={4}>
                        <Icon as={FiChevronDown} />
                        <Text fontWeight="semibold">{category.name}</Text>
                        <Badge colorScheme="gray" variant="subtle" ml="auto">
                          {category.controls.length}
                        </Badge>
                      </HStack>
                    </AccordionButton>
                    <AccordionPanel pb={4} px={0}>
                      <VStack spacing={4} align="stretch">
                        {category.controls.map(control => (
                          <Card 
                            key={control.id} 
                            variant="outline" 
                            size="sm"
                            borderColor={useColorModeValue('gray.200', 'gray.600')}
                          >
                            <CardHeader pb={0}>
                              <HStack>
                                <Tag 
                                  colorScheme={frameworks[selectedFramework].iconColor}
                                  minW="85px"
                                  justifyContent="center"
                                  fontWeight="bold"
                                  fontSize="sm"
                                >
                                  {control.id}
                                </Tag>
                                <Text fontWeight="medium">{control.name}</Text>
                                {files[control.id] && (
                                  <Tooltip label="Evidence uploaded">
                                    <Icon as={FiCheckCircle} color="green.500" ml="auto" />
                                  </Tooltip>
                                )}
                              </HStack>
                            </CardHeader>
                            <CardBody pt={3}>
                              <VStack spacing={4} align="stretch">
                                <FormControl>
                                  <FormLabel fontSize="sm" color="gray.600">
                                    Implementation Notes
                                  </FormLabel>
                                  <Textarea
                                    value={evidenceNotes[control.id] || ''}
                                    onChange={(e) => setEvidenceNotes({
                                      ...evidenceNotes,
                                      [control.id]: e.target.value
                                    })}
                                    placeholder="Describe how this control is implemented..."
                                    size="sm"
                                    resize="vertical"
                                    minH="80px"
                                  />
                                </FormControl>

                                <FormControl>
                                  <FormLabel fontSize="sm" color="gray.600">
                                    Supporting Evidence
                                  </FormLabel>
                                  <Button
                                    leftIcon={<FiUpload />}
                                    variant="outline"
                                    as="label"
                                    cursor="pointer"
                                    size="sm"
                                    w="full"
                                  >
                                    Upload File
                                    <Input
                                      type="file"
                                      onChange={(e) => handleFileUpload(control.id, e.target.files[0])}
                                      hidden
                                    />
                                  </Button>
                                  {uploadProgress[control.id] > 0 && uploadProgress[control.id] < 100 && (
                                    <Progress 
                                      value={uploadProgress[control.id]} 
                                      size="xs" 
                                      mt={2} 
                                      colorScheme={frameworks[selectedFramework].iconColor}
                                      borderRadius="full"
                                    />
                                  )}
                                  {files[control.id] && (
                                    <HStack mt={2} spacing={2}>
                                      <Icon as={FiFile} color="gray.500" />
                                      <Text fontSize="sm" color="gray.600">
                                        {files[control.id].name}
                                      </Text>
                                    </HStack>
                                  )}
                                </FormControl>
                              </VStack>
                            </CardBody>
                          </Card>
                        ))}
                      </VStack>
                    </AccordionPanel>
                    <Divider />
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <Box textAlign="center" py={10}>
                <Text color="gray.500">No controls found matching your search</Text>
                <Button 
                  mt={4} 
                  variant="ghost" 
                  colorScheme={frameworks[selectedFramework].iconColor}
                  onClick={() => setSearchTerm('')}
                  size="sm"
                >
                  Clear search
                </Button>
              </Box>
            )}
          </CardBody>
        </Card>
      </Flex>
    </Box>
  );
};

export default ComplianceFrameworkManager;