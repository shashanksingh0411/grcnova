import React from 'react';
import { Box, Text, Progress, Badge, VStack, HStack } from '@chakra-ui/react';
import { useRiskCalculation } from './useRiskCalculation';

export const RiskTierCalculator = ({ vendorData }) => {
  const { riskTier, riskScore, isLoading } = useRiskCalculation(vendorData);

  if (isLoading) {
    return <Text>Loading risk assessment...</Text>;
  }

  const getRiskColor = (tier) => {
    switch (tier) {
      case 'Critical': return 'red';
      case 'High': return 'orange';
      case 'Medium': return 'yellow';
      case 'Low': return 'green';
      default: return 'gray';
    }
  };

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg">
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between">
          <Text fontWeight="bold">Risk Score:</Text>
          <Text>{riskScore}/100</Text>
        </HStack>
        
        <Progress value={riskScore} size="lg" colorScheme={getRiskColor(riskTier)} />
        
        <HStack justify="space-between">
          <Text fontWeight="bold">Risk Tier:</Text>
          <Badge colorScheme={getRiskColor(riskTier)} fontSize="md" p={2}>
            {riskTier}
          </Badge>
        </HStack>

        {riskTier === 'Critical' && (
          <Text color="red.500" fontSize="sm">
            Immediate attention required. This vendor poses significant risks.
          </Text>
        )}
        
        {riskTier === 'High' && (
          <Text color="orange.500" fontSize="sm">
            Enhanced due diligence and monitoring recommended.
          </Text>
        )}
        
        {riskTier === 'Medium' && (
          <Text color="yellow.500" fontSize="sm">
            Standard due diligence and periodic monitoring required.
          </Text>
        )}
        
        {riskTier === 'Low' && (
          <Text color="green.500" fontSize="sm">
            Low risk. Standard onboarding procedures apply.
          </Text>
        )}
      </VStack>
    </Box>
  );
};