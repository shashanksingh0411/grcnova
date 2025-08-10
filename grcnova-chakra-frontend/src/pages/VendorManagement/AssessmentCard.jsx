import { Card, CardBody, Text, Tag, Box } from "@chakra-ui/react";

const AssessmentCard = ({ vendor }) => {
  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case "High": return "red";
      case "Medium": return "orange";
      default: return "green";
    }
  };

  return (
    <Card variant="outlined" mb={4}>
      <CardBody>
        <Text fontSize="xl" fontWeight="bold">{vendor.name}</Text>
        <Box mt={2}>
          <Tag colorScheme={getRiskColor(vendor.riskLevel)}>
            {vendor.riskLevel} Risk
          </Tag>
        </Box>
        <Text mt={2}>Last Assessed: {vendor.lastAssessment}</Text>
      </CardBody>
    </Card>
  );
};

export default AssessmentCard;  // Default export