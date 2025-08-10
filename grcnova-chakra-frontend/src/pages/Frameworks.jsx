import React from "react";
import Layout from "../components/Layout";
import {
  Box,
  Heading,
  Text,
  Stack,
  Badge,
  Button,
  useColorModeValue,
} from "@chakra-ui/react";

const frameworks = [
  {
    name: "SOC 2",
    description: "Service Organization Controls for security, availability, and confidentiality.",
    status: "In Progress",
  },
  {
    name: "ISO 27001",
    description: "International standard for managing information security.",
    status: "Not Started",
  },
  {
    name: "HIPAA",
    description: "US regulation for healthcare data privacy and security.",
    status: "Completed",
  },
  {
    name: "GDPR",
    description: "EU regulation on data protection and privacy.",
    status: "In Progress",
  },
];

const Frameworks = () => {
  const bg = useColorModeValue("white", "gray.800");

  return (
    <Layout>
      <Box>
        <Heading mb={6}>Compliance Frameworks</Heading>
        <Stack spacing={4}>
          {frameworks.map((fw) => (
            <Box
              key={fw.name}
              bg={bg}
              p={5}
              shadow="md"
              borderWidth="1px"
              borderRadius="md"
            >
              <Heading fontSize="xl">{fw.name}</Heading>
              <Text mt={2}>{fw.description}</Text>
              <Stack direction="row" mt={3} align="center" justify="space-between">
                <Badge
                  colorScheme={
                    fw.status === "Completed"
                      ? "green"
                      : fw.status === "In Progress"
                      ? "yellow"
                      : "gray"
                  }
                >
                  {fw.status}
                </Badge>
                <Button size="sm" colorScheme="purple">
                  View Details
                </Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>
    </Layout>
  );
};

export default Frameworks;