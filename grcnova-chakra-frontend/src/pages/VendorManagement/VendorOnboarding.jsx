import React from 'react';
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
  Icon
} from '@chakra-ui/react';
import { FiCheckCircle, FiCircle, FiChevronRight } from 'react-icons/fi';

const VendorOnboardingJourney = () => {
  const theme = useTheme();
  const steps = [
    { title: 'Pre-Assessment', description: 'Compliance Questionnaire', active: true },
    { title: 'Risk Tier', description: 'Risk Assessment', active: false },
    { title: 'Documents', description: 'Certification Upload', active: false },
    { title: 'Contract', description: 'Agreement Signing', active: false }
  ];

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
        <Progress value={25} size="sm" colorScheme="purple" mb={2} borderRadius="full" />
        <Text fontSize="sm" color="gray.500" textAlign="right">Step 1 of 4</Text>
      </Box>

      {/* Steps Timeline */}
      <Flex justify="space-between" position="relative" mb={16}>
        {steps.map((step, index) => (
          <Box key={index} textAlign="center" zIndex={1}>
            <Box
              w="40px"
              h="40px"
              borderRadius="full"
              bg={step.active ? 'purple.500' : 'gray.100'}
              color={step.active ? 'white' : 'gray.400'}
              display="flex"
              alignItems="center"
              justifyContent="center"
              mb={2}
              mx="auto"
              borderWidth={step.active ? 0 : '2px'}
              borderColor="gray.200"
            >
              {step.active ? (
                <Icon as={FiCheckCircle} boxSize={5} />
              ) : (
                <Icon as={FiCircle} boxSize={5} />
              )}
            </Box>
            <Text fontWeight="medium" color={step.active ? 'gray.800' : 'gray.500'}>
              {step.title}
            </Text>
            <Text fontSize="sm" color="gray.500">{step.description}</Text>
          </Box>
        ))}
        <Divider 
          position="absolute" 
          top="20px" 
          left="20%" 
          right="20%" 
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
            <Text fontSize="xl" fontWeight="bold" color="purple.600">1</Text>
          </Box>
          <Box>
            <Text fontSize="sm" color="purple.600" fontWeight="medium">CURRENT STEP</Text>
            <Heading as="h2" size="lg" color="gray.800">Pre-Assessment Questionnaire</Heading>
          </Box>
        </Flex>

        {/* Form */}
        <VStack spacing={6} align="stretch">
          <FormControl>
            <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">Vendor Name</FormLabel>
            <Input 
              placeholder="Enter vendor name" 
              size="lg"
              focusBorderColor="purple.500"
              borderRadius="md"
            />
          </FormControl>

          <FormControl>
            <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">Service Type</FormLabel>
            <Select 
              placeholder="Select service type" 
              size="lg"
              focusBorderColor="purple.500"
              borderRadius="md"
            >
              <option>IT Services</option>
              <option>Cloud Provider</option>
              <option>Consulting</option>
              <option>Other</option>
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">Compliance Questions</FormLabel>
            <Stack spacing={4} mt={2}>
              <Checkbox 
                colorScheme="purple" 
                size="lg"
                icon={<FiCheckCircle />}
                spacing={3}
              >
                Does the vendor process sensitive data?
              </Checkbox>
              <Checkbox 
                colorScheme="purple" 
                size="lg"
                icon={<FiCheckCircle />}
                spacing={3}
              >
                Does the vendor have security certifications?
              </Checkbox>
              <Checkbox 
                colorScheme="purple" 
                size="lg"
                icon={<FiCheckCircle />}
                spacing={3}
              >
                Does the vendor have an incident response plan?
              </Checkbox>
            </Stack>
          </FormControl>

          <Flex justify="flex-end" mt={8}>
            <Button 
              rightIcon={<FiChevronRight />} 
              colorScheme="purple" 
              size="lg" 
              px={8}
              borderRadius="md"
            >
              Next Step
            </Button>
          </Flex>
        </VStack>
      </Box>
    </Box>
  );
};

export default VendorOnboardingJourney;