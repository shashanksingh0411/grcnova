import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";

const mockProjects = [
  {
    name: "ISO Implementation",
    status: "In Progress",
    owner: "Alice",
    deadline: "2025-08-30",
  },
  {
    name: "HIPAA Gap Analysis",
    status: "Completed",
    owner: "Bob",
    deadline: "2025-07-10",
  },
  {
    name: "SOC 2 Stage 1 Audit",
    status: "Overdue",
    owner: "Charlie",
    deadline: "2025-07-01",
  },
];

const getStatusBadgeColor = (status) => {
  switch (status) {
    case "Completed":
      return "green";
    case "In Progress":
      return "orange";
    case "Overdue":
      return "red";
    default:
      return "gray";
  }
};

export default function Projects() {
  const tableBg = useColorModeValue("white", "gray.800");

  return (
    <Box p={6} bg="purple.50" minH="100vh">
      <Heading mb={6} color="purple.700">
        Projects
      </Heading>
      <Table variant="simple" bg={tableBg} shadow="md" borderRadius="md">
        <Thead>
          <Tr>
            <Th>Project</Th>
            <Th>Status</Th>
            <Th>Owner</Th>
            <Th>Deadline</Th>
          </Tr>
        </Thead>
        <Tbody>
          {mockProjects.map((proj, i) => (
            <Tr key={i}>
              <Td fontWeight="medium">{proj.name}</Td>
              <Td>
                <Badge colorScheme={getStatusBadgeColor(proj.status)}>
                  {proj.status}
                </Badge>
              </Td>
              <Td>{proj.owner}</Td>
              <Td>
                <Text
                  color={
                    new Date(proj.deadline) < new Date()
                      ? "red.500"
                      : "gray.700"
                  }
                >
                  {proj.deadline}
                </Text>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}