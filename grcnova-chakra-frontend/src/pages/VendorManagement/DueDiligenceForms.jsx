import React from "react";
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
  Heading
} from "@chakra-ui/react";

const DueDiligenceForms = () => {
  const questions = [
    {
      id: "dataSecurity",
      question: "Does the vendor encrypt data at rest?",
      type: "boolean",
      required: true
    },
    {
      id: "compliance",
      question: "Which compliance standards does the vendor meet?",
      type: "multi-select",
      options: ["SOC 2", "ISO 27001", "GDPR", "HIPAA"],
      required: false
    },
    {
      id: "notes",
      question: "Additional security notes",
      type: "text",
      required: false
    }
  ];

  const renderQuestion = (q) => {
    switch (q.type) {
      case "boolean":
        return (
          <FormControl>
            <Checkbox>{q.question}</Checkbox>
          </FormControl>
        );
      case "multi-select":
        return (
          <FormControl>
            <FormLabel>{q.question}</FormLabel>
            <Select placeholder="Select standards" multiple>
              {q.options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </Select>
          </FormControl>
        );
      case "text":
        return (
          <FormControl>
            <FormLabel>{q.question}</FormLabel>
            <Textarea placeholder="Enter details..." />
          </FormControl>
        );
      default:
        return null;
    }
  };

  return (
    <Box>
      <Card variant="outline" mb={6}>
        <CardHeader>
          <Heading size="md">Vendor Assessment Form</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            {questions.map(q => (
              <Box key={q.id} p={4} borderWidth="1px" borderRadius="md">
                {renderQuestion(q)}
              </Box>
            ))}
            <Button colorScheme="purple" mt={4}>Submit Assessment</Button>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
};

export default DueDiligenceForms;