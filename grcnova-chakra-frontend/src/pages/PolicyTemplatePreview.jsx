import React from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Badge,
  Icon,
  useColorModeValue
} from '@chakra-ui/react';
import { FiFileText, FiClock, FiUser } from 'react-icons/fi';

const PolicyTemplatePreview = ({ template, onSelect }) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  if (!template) {
    return (
      <Box
        p={6}
        borderWidth="1px"
        borderRadius="lg"
        borderColor={borderColor}
        bg={cardBg}
        textAlign="center"
      >
        <Text color="gray.500">Select a template to preview</Text>
      </Box>
    );
  }

  return (
    <Box
      p={6}
      borderWidth="1px"
      borderRadius="lg"
      borderColor={borderColor}
      bg={cardBg}
      cursor={onSelect ? 'pointer' : 'default'}
      onClick={onSelect}
      _hover={onSelect ? { shadow: 'md', transform: 'translateY(-2px)' } : {}}
      transition="all 0.2s"
    >
      <VStack align="start" spacing={4}>
        <HStack justify="space-between" w="100%">
          <Text fontSize="xl" fontWeight="bold">
            {template.name}
          </Text>
          <Badge colorScheme={template.framework === 'SOC 2' ? 'blue' : 'green'}>
            {template.framework}
          </Badge>
        </HStack>

        <Text color="gray.600">{template.description}</Text>

        <VStack align="start" spacing={2} w="100%">
          <HStack>
            <Icon as={FiFileText} color="blue.500" />
            <Text fontSize="sm">{template.sections?.length || 0} sections</Text>
          </HStack>

          <HStack>
            <Icon as={FiClock} color="orange.500" />
            <Text fontSize="sm">Last updated: {template.lastUpdated}</Text>
          </HStack>

          {template.estimatedTime && (
            <HStack>
              <Icon as={FiUser} color="green.500" />
              <Text fontSize="sm">Est. time: {template.estimatedTime}</Text>
            </HStack>
          )}
        </VStack>

        {template.sections && (
          <Box w="100%">
            <Text fontWeight="medium" mb={2}>
              Sections included:
            </Text>
            <VStack align="start" spacing={1}>
              {template.sections.map((section, index) => (
                <Text key={index} fontSize="sm" color="gray.600">
                  • {section}
                </Text>
              ))}
            </VStack>
          </Box>
        )}

        {template.requirements && (
          <Box w="100%">
            <Text fontWeight="medium" mb={2}>
              Key requirements:
            </Text>
            <VStack align="start" spacing={1}>
              {template.requirements.map((requirement, index) => (
                <Text key={index} fontSize="sm" color="gray.600">
                  • {requirement}
                </Text>
              ))}
            </VStack>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default PolicyTemplatePreview;