import React, { useState } from 'react';
import {
  Progress,
  Button,
  Card,
  CardBody,
  CardHeader,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useDisclosure,
  useToast
} from '@chakra-ui/react';
import { DownloadIcon, ExternalLinkIcon, TimeIcon, CheckIcon } from '@chakra-ui/icons';

const AuditReadinessDashboard = () => {
  // State for audit domains progress
  const [auditProgress, setAuditProgress] = useState([
    { id: 1, domain: 'Policies', completion: 100, evidenceCount: 12 },
    { id: 2, domain: 'Access Control', completion: 85, evidenceCount: 8 },
    { id: 3, domain: 'Data Protection', completion: 75, evidenceCount: 15 },
    { id: 4, domain: 'Incident Management', completion: 60, evidenceCount: 5 },
    { id: 5, domain: 'Risk Assessment', completion: 45, evidenceCount: 3 },
  ]);

  // State for auditor access
  const { isOpen: isAccessOpen, onOpen: onAccessOpen, onClose: onAccessClose } = useDisclosure();
  const [accessLinks, setAccessLinks] = useState([]);
  const [accessForm, setAccessForm] = useState({
    auditorName: '',
    email: '',
    daysValid: 7,
    domains: []
  });

  // State for audit package generation
  const { isOpen: isPackageOpen, onOpen: onPackageOpen, onClose: onPackageClose } = useDisclosure();
  const [selectedDomains, setSelectedDomains] = useState([]);
  const toast = useToast();

  // Generate audit package
  const handleGeneratePackage = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    const domains = selectedDomains.length > 0 ? selectedDomains : auditProgress.map(d => d.domain);
    
    toast({
      title: 'Audit Package Generated',
      description: `Package includes: ${domains.join(', ')}`,
      status: 'success',
      duration: 5000,
      isClosable: true,
      position: 'bottom-right'
    });
    
    onPackageClose();
  };

  // Create auditor access link
  const handleCreateAccess = () => {
    const newLink = {
      id: Date.now(),
      ...accessForm,
      created: new Date().toLocaleString(),
      expires: new Date(Date.now() + accessForm.daysValid * 24 * 60 * 60 * 1000).toLocaleString(),
      link: `https://yourplatform.com/auditor-access/${Date.now()}`
    };
    setAccessLinks([...accessLinks, newLink]);
    onAccessClose();
    setAccessForm({
      auditorName: '',
      email: '',
      daysValid: 7,
      domains: []
    });
  };

  // Toggle domain selection
  const toggleDomainSelection = (domain) => {
    setSelectedDomains(prev => 
      prev.includes(domain) 
        ? prev.filter(d => d !== domain) 
        : [...prev, domain]
    );
  };

  return (
    <Box p={4}>
      <Text fontSize="2xl" fontWeight="bold" mb={4}>Audit Readiness Dashboard</Text>
      
      {/* Overall Status Card */}
      <Card mb={4}>
        <CardHeader>
          <Text fontSize="xl" fontWeight="semibold">Audit Preparation Status</Text>
          <Text color="gray.500">
            {auditProgress.filter(d => d.completion === 100).length}/{auditProgress.length} domains audit-ready
          </Text>
        </CardHeader>
        <CardBody>
          <Button 
            colorScheme="blue" 
            onClick={onPackageOpen}
            leftIcon={<DownloadIcon />}
          >
            Generate Audit Package
          </Button>
        </CardBody>
      </Card>
      
      {/* Progress by Domain */}
      <Box mb={8}>
        <Text fontSize="xl" fontWeight="semibold" mb={4}>Compliance by Domain</Text>
        {auditProgress.map((domain) => (
          <Box key={`domain-progress-${domain.id}`} mb={4}>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Text>
                <Text as="span" fontWeight="bold">{domain.domain}</Text> 
                <Text as="span" color="gray.500" ml={2}>({domain.evidenceCount} pieces of evidence)</Text>
              </Text>
              <Text>{domain.completion}%</Text>
            </Box>
            <Progress 
              value={domain.completion} 
              colorScheme={
                domain.completion === 100 ? 'green' : 
                domain.completion > 75 ? 'blue' : 
                domain.completion > 50 ? 'yellow' : 'red'
              } 
              size="sm"
              isAnimated={domain.completion < 100}
            />
          </Box>
        ))}
      </Box>
      
      {/* Auditor Access Section */}
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Text fontSize="xl" fontWeight="semibold">Auditor Access</Text>
          <Button variant="outline" colorScheme="blue" onClick={onAccessOpen} leftIcon={<ExternalLinkIcon />}>
            Create New Access
          </Button>
        </Box>
        
        {accessLinks.length > 0 ? (
          <Card>
            <CardBody>
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Auditor</Th>
                      <Th>Access Link</Th>
                      <Th>Created</Th>
                      <Th>Expires</Th>
                      <Th>Domains</Th>
                      <Th>Status</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {accessLinks.map((link) => (
                      <Tr key={`access-link-${link.id}`}>
                        <Td>{link.auditorName}</Td>
                        <Td>
                          <Text as="a" href={link.link} target="_blank" rel="noopener noreferrer" color="blue.500">
                            {link.link.substring(0, 25)}...
                          </Text>
                        </Td>
                        <Td>{link.created}</Td>
                        <Td>{link.expires}</Td>
                        <Td>
                          {link.domains.length > 0 ? 
                            link.domains.join(', ') : 'All domains'}
                        </Td>
                        <Td>
                          {new Date(link.expires) > new Date() ? (
                            <Text color="green.500">
                              <TimeIcon mr={1} /> Active
                            </Text>
                          ) : (
                            <Text color="red.500">Expired</Text>
                          )}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </CardBody>
          </Card>
        ) : (
          <Alert status="info">
            <AlertIcon />
            No auditor access links created yet. Create one to share read-only access with auditors.
          </Alert>
        )}
      </Box>
      
      {/* Generate Audit Package Modal */}
      <Modal isOpen={isPackageOpen} onClose={onPackageClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Generate Audit Package</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={4}>
              Select the compliance domains you want to include in the audit package. 
              The system will gather all relevant policies and evidence for the selected domains.
            </Text>
            
            <FormControl>
              <FormLabel>Select Domains (leave empty for all domains)</FormLabel>
              {auditProgress.map((domain) => (
                <Box key={`package-domain-${domain.id}`} mb={2}>
                  <input
                    type="checkbox"
                    id={`package-domain-${domain.id}`}
                    checked={selectedDomains.includes(domain.domain)}
                    onChange={() => toggleDomainSelection(domain.domain)}
                    disabled={domain.completion < 100}
                  />
                  <Text as="label" htmlFor={`package-domain-${domain.id}`} ml={2}>
                    {domain.domain} ({domain.completion}% ready)
                  </Text>
                </Box>
              ))}
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onPackageClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleGeneratePackage} leftIcon={<DownloadIcon />}>
              Generate Package
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Create Auditor Access Modal */}
      <Modal isOpen={isAccessOpen} onClose={onAccessClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Auditor Access</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4}>
              <FormLabel>Auditor Name</FormLabel>
              <Input
                type="text" 
                value={accessForm.auditorName}
                onChange={(e) => setAccessForm({...accessForm, auditorName: e.target.value})}
                placeholder="Enter auditor's name"
              />
            </FormControl>
            
            <FormControl mb={4}>
              <FormLabel>Auditor Email</FormLabel>
              <Input
                type="email" 
                value={accessForm.email}
                onChange={(e) => setAccessForm({...accessForm, email: e.target.value})}
                placeholder="Enter auditor's email"
              />
            </FormControl>
            
            <FormControl mb={4}>
              <FormLabel>Access Valid For (days)</FormLabel>
              <NumberInput 
                min={1} 
                max={30}
                value={accessForm.daysValid}
                onChange={(value) => setAccessForm({...accessForm, daysValid: parseInt(value) || 1})}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            
            <FormControl mb={4}>
              <FormLabel>Restrict to Specific Domains (optional)</FormLabel>
              <Select
                multiple
                value={accessForm.domains}
                onChange={(e) => {
                  const options = [...e.target.selectedOptions];
                  const values = options.map(opt => opt.value);
                  setAccessForm({...accessForm, domains: values});
                }}
                height="auto"
                minH={20}
              >
                {auditProgress.map((domain) => (
                  <option key={`access-domain-${domain.id}`} value={domain.domain}>
                    {domain.domain}
                  </option>
                ))}
              </Select>
              <Text fontSize="sm" color="gray.500" mt={1}>
                Hold Ctrl/Cmd to select multiple domains. Leave empty to grant access to all domains.
              </Text>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onAccessClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleCreateAccess} leftIcon={<ExternalLinkIcon />}>
              Create Access Link
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AuditReadinessDashboard;