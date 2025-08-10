import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  Table,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tr,
  useToast,
  VStack,
  Tag,
  TagLabel,
  UnorderedList,
  ListItem,
  HStack
} from "@chakra-ui/react";
import { useState } from "react";

const RiskAssessmentTable = () => {
  const toast = useToast();
  const [frameworks, setFrameworks] = useState([
    { name: "ISO31000", selected: true },
    { name: "NIST", selected: false },
    { name: "COSO", selected: false },
    { name: "OCTAVE", selected: false }
  ]);

  const [risks, setRisks] = useState([]);
  const [formData, setFormData] = useState({
    riskName: "",
    riskCategory: "",
    impact: "",
    likelihood: "",
    existingControls: ""
  });

  const mitigationSuggestions = {
    High: [
      "Eliminate the risk by changing processes or avoiding the activity",
      "Implement strong controls with regular monitoring and reporting",
      "Transfer risk through insurance or outsourcing",
      "Develop contingency plans for when risk occurs"
    ],
    Medium: [
      "Implement controls to reduce likelihood or impact",
      "Increase monitoring and oversight",
      "Develop response plans",
      "Consider risk transfer options"
    ],
    Low: [
      "Accept the risk with current controls",
      "Monitor periodically for changes",
      "Document for awareness",
      "Consider cost-effective simple controls"
    ]
  };

  const treatmentPlans = {
    High: "Must be treated immediately. Senior management attention required. Significant resources allocated.",
    Medium: "Should be treated within reasonable timeframe. Management attention recommended.",
    Low: "May be accepted or treated as opportunities allow. Routine management."
  };

  const handleFrameworkChange = (index) => {
    const updatedFrameworks = [...frameworks];
    updatedFrameworks[index].selected = !updatedFrameworks[index].selected;
    setFrameworks(updatedFrameworks);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { riskName, riskCategory, impact, likelihood, existingControls } = formData;
    
    if (!riskName || !riskCategory || !impact || !likelihood) {
      toast({
        title: "Missing required fields",
        description: "Please fill all required fields",
        status: "error",
        duration: 3000,
        isClosable: true
      });
      return;
    }

    const impactNum = parseInt(impact);
    const likelihoodNum = parseInt(likelihood);
    const riskScore = impactNum * likelihoodNum;

    let riskLevel;
    if (riskScore >= 20) {
      riskLevel = "High";
    } else if (riskScore >= 10) {
      riskLevel = "Medium";
    } else {
      riskLevel = "Low";
    }

    const newRisk = {
      id: Date.now(),
      riskName,
      riskCategory,
      impact: impactNum,
      likelihood: likelihoodNum,
      riskScore,
      riskLevel,
      existingControls: existingControls || "None",
      mitigations: mitigationSuggestions[riskLevel],
      treatmentPlan: treatmentPlans[riskLevel],
      acceptance: riskLevel === "Low" ? "Accepted" : "Not Accepted"
    };

    setRisks([...risks, newRisk]);
    setFormData({
      riskName: "",
      riskCategory: "",
      impact: "",
      likelihood: "",
      existingControls: ""
    });

    toast({
      title: "Risk added",
      status: "success",
      duration: 2000,
      isClosable: true
    });
  };

  const deleteRisk = (id) => {
    setRisks(risks.filter((risk) => risk.id !== id));
    toast({
      title: "Risk deleted",
      status: "info",
      duration: 2000,
      isClosable: true
    });
  };

  const getRiskColorScheme = (riskLevel) => {
    switch (riskLevel) {
      case "High":
        return "red";
      case "Medium":
        return "orange";
      case "Low":
        return "green";
      default:
        return "gray";
    }
  };

  return (
    <Box p={6} maxWidth="1200px" margin="0 auto">
      <Heading as="h1" size="xl" mb={6}>
        Risk Assessment Tool
      </Heading>

      <Box bg="gray.50" p={4} borderRadius="md" mb={6}>
        <Heading as="h2" size="md" mb={4}>
          Select Risk Assessment Frameworks
        </Heading>
        <HStack spacing={4}>
          {frameworks.map((framework, index) => (
            <Checkbox
              key={framework.name}
              isChecked={framework.selected}
              onChange={() => handleFrameworkChange(index)}
            >
              {framework.name}
            </Checkbox>
          ))}
        </HStack>
      </Box>

      <Box mb={8}>
        <Heading as="h2" size="md" mb={4}>
          Add New Risk
        </Heading>
        <form onSubmit={handleSubmit}>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel>Risk Name/Description</FormLabel>
              <Input
                name="riskName"
                value={formData.riskName}
                onChange={handleInputChange}
                placeholder="Enter risk description"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Category</FormLabel>
              <Select
                name="riskCategory"
                value={formData.riskCategory}
                onChange={handleInputChange}
                placeholder="Select a category"
              >
                <option value="Strategic">Strategic</option>
                <option value="Operational">Operational</option>
                <option value="Financial">Financial</option>
                <option value="Compliance">Compliance</option>
                <option value="Reputational">Reputational</option>
                <option value="Technical">Technical</option>
                <option value="Security">Security</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Impact (1-5)</FormLabel>
              <Select
                name="impact"
                value={formData.impact}
                onChange={handleInputChange}
                placeholder="Select impact level"
              >
                <option value="1">1 - Negligible</option>
                <option value="2">2 - Minor</option>
                <option value="3">3 - Moderate</option>
                <option value="4">4 - Major</option>
                <option value="5">5 - Catastrophic</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Likelihood (1-5)</FormLabel>
              <Select
                name="likelihood"
                value={formData.likelihood}
                onChange={handleInputChange}
                placeholder="Select likelihood"
              >
                <option value="1">1 - Rare</option>
                <option value="2">2 - Unlikely</option>
                <option value="3">3 - Possible</option>
                <option value="4">4 - Likely</option>
                <option value="5">5 - Almost Certain</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Existing Controls</FormLabel>
              <Textarea
                name="existingControls"
                value={formData.existingControls}
                onChange={handleInputChange}
                placeholder="Describe existing controls"
                rows={3}
              />
            </FormControl>

            <Button type="submit" colorScheme="blue" alignSelf="flex-start">
              Add Risk
            </Button>
          </VStack>
        </form>
      </Box>

      <Box>
        <Heading as="h2" size="md" mb={4}>
          Risk Assessment Table
        </Heading>
        <Box overflowX="auto">
          <Table variant="striped">
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Risk Name</Th>
                <Th>Category</Th>
                <Th>Impact</Th>
                <Th>Likelihood</Th>
                <Th>Risk Score</Th>
                <Th>Risk Level</Th>
                <Th>Existing Controls</Th>
                <Th>Mitigation</Th>
                <Th>Treatment Plan</Th>
                <Th>Acceptance</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {risks.map((risk) => (
                <Tr key={risk.id}>
                  <Td>{risk.id}</Td>
                  <Td>{risk.riskName}</Td>
                  <Td>{risk.riskCategory}</Td>
                  <Td>{risk.impact}</Td>
                  <Td>{risk.likelihood}</Td>
                  <Td fontWeight="bold">{risk.riskScore}</Td>
                  <Td>
                    <Tag colorScheme={getRiskColorScheme(risk.riskLevel)} size="md">
                      <TagLabel>{risk.riskLevel}</TagLabel>
                    </Tag>
                  </Td>
                  <Td>{risk.existingControls}</Td>
                  <Td>
                    <UnorderedList spacing={1}>
                      {risk.mitigations.map((mitigation, index) => (
                        <ListItem key={index}>
                          <Text fontSize="sm">{mitigation}</Text>
                        </ListItem>
                      ))}
                    </UnorderedList>
                  </Td>
                  <Td>
                    <Text fontStyle="italic" fontSize="sm">
                      {risk.treatmentPlan}
                    </Text>
                  </Td>
                  <Td>{risk.acceptance}</Td>
                  <Td>
                    <Button
                      size="sm"
                      colorScheme="red"
                      onClick={() => deleteRisk(risk.id)}
                    >
                      Delete
                    </Button>
                  </Td>
                </Tr>
              ))}
              {risks.length === 0 && (
                <Tr>
                  <Td colSpan={12} textAlign="center">
                    No risks added yet
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>
      </Box>
    </Box>
  );
};

export default RiskAssessmentTable;