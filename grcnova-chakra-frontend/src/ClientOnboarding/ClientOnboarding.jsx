import React, { useState } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepIndicator,
  StepStatus,
  StepIcon,
  StepNumber,
  StepTitle,
  StepDescription,
  StepSeparator,
  useSteps,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  VStack,
  HStack,
  Card,
  CardBody,
  Heading,
  Text,
  useToast
} from '@chakra-ui/react';
import { supabase } from '../supabase';

const steps = [
  { title: 'Account Details', description: 'Create your account' },
  { title: 'Organization Info', description: 'Set up your organization' },
  { title: 'Success', description: 'Registration complete' },
];

const MultiStepForm = () => {
  const { activeStep, setActiveStep } = useSteps({
    index: 0,
    count: steps.length,
  });
  const toast = useToast();
  
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  
  const [orgData, setOrgData] = useState({
  name: '',
  organization_email_id: '',
  organization_address: '',
  contact_number: '',
  industry: '',
  description: '',
  website_url: '',
  logo_url: '',
  tax_id: '',
  founded_date: '', // Keep as empty string for date input
  timezone: 'UTC',
  currency_code: 'USD',
  language_code: 'en',
  role: 'admin',
  organization_size: '',
});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState(null);

  const handleUserInput = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
  };

  const handleOrgInput = (e) => {
    const { name, value } = e.target;
    setOrgData({
      ...orgData,
      [name]: value
    });
  };

  const handleUserRegistration = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  
  try {
    // Generate a random password for the user
    const password = Math.random().toString(36).slice(-8) + 'A1!';
    
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: password,
      options: {
        data: {
          name: userData.name,
          phone: userData.phone
        },
        emailRedirectTo: `${window.location.origin}/login`
      }
    });
    
    if (error) throw error;
    
    setUserId(data.user.id);
    
    // DON'T create the profile here - wait for organization creation
    // The RPC function will handle both organization and profile creation
    
    toast({
      title: 'Registration successful',
      description: 'You can now set up your organization.',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
    
    setActiveStep(1);
  } catch (error) {
    setError(error.message);
    console.error('User registration error:', error);
  } finally {
    setLoading(false);
  }
};

  const handleOrgSubmission = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    if (!userId) throw new Error('User registration not completed.');

    // Prepare organization data with proper null handling for date fields
    const organizationData = {
      name: orgData.name,
      organization_email_id: orgData.organization_email_id || null,
      organization_address: orgData.organization_address || null,
      contact_number: orgData.contact_number || null,
      industry: orgData.industry || null,
      description: orgData.description || null,
      website_url: orgData.website_url || null,
      logo_url: orgData.logo_url || null,
      tax_id: orgData.tax_id || null,
      founded_date: orgData.founded_date ? new Date(orgData.founded_date).toISOString().split('T')[0] : null,
      timezone: orgData.timezone,
      currency_code: orgData.currency_code,
      language_code: orgData.language_code,
      organization_size: orgData.organization_size || null,
      status: 'active',
      owner_id: userId
    };

    // Remove empty string values and convert to null
    Object.keys(organizationData).forEach(key => {
      if (organizationData[key] === '') {
        organizationData[key] = null;
      }
    });

    // Use the RPC function to handle both organization and profile creation atomically
    const { data, error: rpcError } = await supabase.rpc('handle_new_user_signup', {
      p_user_id: userId,
      p_email: userData.email,
      p_full_name: userData.name,
      p_organization_name: orgData.name,
      p_organization_email_id: orgData.organization_email_id || null,
      p_phone: userData.phone || null,
      p_organization_address: orgData.organization_address || null,
      p_contact_number: orgData.contact_number || null,
      p_industry: orgData.industry || null,
      p_description: orgData.description || null,
      p_website_url: orgData.website_url || null,
      p_logo_url: orgData.logo_url || null,
      p_tax_id: orgData.tax_id || null,
      p_founded_date: orgData.founded_date ? new Date(orgData.founded_date).toISOString().split('T')[0] : null,
      p_timezone: orgData.timezone,
      p_currency_code: orgData.currency_code,
      p_language_code: orgData.language_code,
      p_organization_size: orgData.organization_size || null,
      p_role: orgData.role || 'admin'
    });

    if (rpcError) throw rpcError;

    if (!data.success) {
      throw new Error(data.error || 'Failed to create organization and profile');
    }

    toast({
      title: 'Organization created successfully',
      description: 'Your organization has been set up.',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });

    setActiveStep(2);
  } catch (error) {
    setError(error.message);
    console.error('Organization creation error:', error);
  } finally {
    setLoading(false);
  }
};
  const renderStep1 = () => (
    <Card>
      <CardBody>
        <Heading size="md" mb={6}>Create Your Account</Heading>
        <VStack as="form" onSubmit={handleUserRegistration} spacing={4} align="stretch">
          <FormControl isRequired>
            <FormLabel>Full Name</FormLabel>
            <Input
              type="text"
              name="name"
              value={userData.name}
              onChange={handleUserInput}
              placeholder="Enter your full name"
            />
          </FormControl>
          
          <FormControl isRequired>
            <FormLabel>Email Address</FormLabel>
            <Input
              type="email"
              name="email"
              value={userData.email}
              onChange={handleUserInput}
              placeholder="Enter your email address"
            />
          </FormControl>
          
          <FormControl isRequired>
            <FormLabel>Phone Number</FormLabel>
            <Input
              type="tel"
              name="phone"
              value={userData.phone}
              onChange={handleUserInput}
              placeholder="Enter your phone number"
            />
          </FormControl>
          
          <Button type="submit" colorScheme="blue" isLoading={loading} loadingText="Processing">
            Register
          </Button>
        </VStack>
      </CardBody>
    </Card>
  );

  const renderStep2 = () => (
    <Card>
      <CardBody>
        <Heading size="md" mb={6}>Organization Details</Heading>
        <VStack as="form" onSubmit={handleOrgSubmission} spacing={4} align="stretch">
          <FormControl isRequired>
            <FormLabel>Organization Name</FormLabel>
            <Input
              type="text"
              name="name"
              value={orgData.name}
              onChange={handleOrgInput}
              placeholder="Enter organization name"
            />
          </FormControl>
          
          <FormControl isRequired>
            <FormLabel>Organization Email</FormLabel>
            <Input
              type="email"
              name="organization_email_id"
              value={orgData.organization_email_id}
              onChange={handleOrgInput}
              placeholder="Enter organization email"
            />
          </FormControl>
          
          <FormControl>
            <FormLabel>Organization Address</FormLabel>
            <Textarea
              name="organization_address"
              value={orgData.organization_address}
              onChange={handleOrgInput}
              placeholder="Enter organization address"
            />
          </FormControl>
          
          <FormControl>
            <FormLabel>Contact Number</FormLabel>
            <Input
              type="tel"
              name="contact_number"
              value={orgData.contact_number}
              onChange={handleOrgInput}
              placeholder="Enter contact number"
            />
          </FormControl>
          
          <FormControl>
            <FormLabel>Industry</FormLabel>
            <Input
              type="text"
              name="industry"
              value={orgData.industry}
              onChange={handleOrgInput}
              placeholder="Enter industry"
            />
          </FormControl>
          <FormControl>
  <FormLabel>Founded Date</FormLabel>
  <Input
    type="date"
    name="founded_date"
    value={orgData.founded_date}
    onChange={handleOrgInput}
    placeholder="Select founded date"
  />
</FormControl>
          <FormControl>
            <FormLabel>Description</FormLabel>
            <Textarea
              name="description"
              value={orgData.description}
              onChange={handleOrgInput}
              placeholder="Enter organization description"
            />
          </FormControl>
          
          <FormControl>
            <FormLabel>Website URL</FormLabel>
            <Input
              type="url"
              name="website_url"
              value={orgData.website_url}
              onChange={handleOrgInput}
              placeholder="Enter website URL"
            />
          </FormControl>
          
          <FormControl>
            <FormLabel>Your Role</FormLabel>
            <Input
              type="text"
              name="role"
              value={orgData.role}
              onChange={handleOrgInput}
              placeholder="Enter your role in the organization"
            />
          </FormControl>
          
          <FormControl>
            <FormLabel>Organization Size</FormLabel>
            <Select
              name="organization_size"
              value={orgData.organization_size}
              onChange={handleOrgInput}
              placeholder="Select organization size"
            >
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201-500">201-500 employees</option>
              <option value="501+">501+ employees</option>
            </Select>
          </FormControl>
          
          <HStack>
            <Button 
              variant="outline" 
              onClick={() => setActiveStep(0)}
              isDisabled={loading}
            >
              Back
            </Button>
            <Button 
              type="submit" 
              colorScheme="blue" 
              isLoading={loading} 
              loadingText="Saving"
            >
              Complete Onboarding
            </Button>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );

  const renderStep3 = () => (
    <Card>
      <CardBody>
        <VStack spacing={6} textAlign="center">
          <Box color="green.500" fontSize="6xl">✓</Box>
          <Heading size="md">Registration Complete!</Heading>
          <Text>
            Your account and organization have been created successfully. 
            Please check your email to verify your account and complete the activation process.
          </Text>
          <Button colorScheme="blue" as="a" href="/login">
            Go to Login
          </Button>
        </VStack>
      </CardBody>
    </Card>
  );

  return (
    <Box maxW="container.md" mx="auto" py={10} px={4}>
      <Stepper index={activeStep} mb={10}>
        {steps.map((step, index) => (
          <Step key={index}>
            <StepIndicator>
              <StepStatus
                complete={<StepIcon />}
                incomplete={<StepNumber />}
                active={<StepNumber />}
              />
            </StepIndicator>

            <Box flexShrink='0'>
              <StepTitle>{step.title}</StepTitle>
              <StepDescription>{step.description}</StepDescription>
            </Box>

            <StepSeparator />
          </Step>
        ))}
      </Stepper>
      
      {error && (
        <Alert status="error" mb={6}>
          <AlertIcon />
          <AlertTitle>Error!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {activeStep === 0 && renderStep1()}
      {activeStep === 1 && renderStep2()}
      {activeStep === 2 && renderStep3()}
    </Box>
  );
};

export default MultiStepForm;