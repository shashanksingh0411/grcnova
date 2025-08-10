import { Box, Grid, Text, Flex, Progress, List, ListItem, Badge, Card, CardHeader, CardBody, CardFooter } from "@chakra-ui/react";
import { FiAlertCircle, FiCheckCircle, FiDatabase, FiShield, FiUsers } from "react-icons/fi";

const Dashboard = () => {
  return (
    <Box bg="gray.50" p={6}>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={8}>
        <Text fontSize="2xl" fontWeight="bold">Compliance Dashboard</Text>
        <Badge colorScheme="green" p={2}>Last updated: Today</Badge>
      </Flex>

      {/* Main Content Grid */}
      <Grid templateColumns={["1fr", "1fr", "1fr 1fr"]} gap={6}>
        {/* Left Column */}
        <Box>
          {/* Compliance Standards */}
          <Card mb={6}>
            <CardHeader borderBottom="1px solid" borderColor="gray.100">
              <Flex align="center">
                <FiShield style={{ marginRight: "8px" }} />
                <Text fontWeight="semibold">Compliance Standards</Text>
              </Flex>
            </CardHeader>
            <CardBody>
              <List spacing={3}>
                <ListItem>
                  <Flex justify="space-between" align="center">
                    <Text>SQL 2</Text>
                    <Badge colorScheme="green" p={1}>78% Complete</Badge>
                  </Flex>
                  <Progress value={78} size="sm" colorScheme="green" mt={2} />
                </ListItem>
                <ListItem>
                  <Flex justify="space-between" align="center">
                    <Text>ISO 27001</Text>
                    <Badge colorScheme="yellow" p={1}>52% Complete</Badge>
                  </Flex>
                  <Progress value={52} size="sm" colorScheme="yellow" mt={2} />
                </ListItem>
                <ListItem>
                  <Flex justify="space-between" align="center">
                    <Text>HIPAA</Text>
                    <Badge colorScheme="red" p={1}>34% Complete</Badge>
                  </Flex>
                  <Progress value={34} size="sm" colorScheme="red" mt={2} />
                </ListItem>
              </List>
            </CardBody>
          </Card>

          {/* Risk Heatmap */}
          <Card mb={6}>
            <CardHeader borderBottom="1px solid" borderColor="gray.100">
              <Text fontWeight="semibold">Risk Heatmap</Text>
            </CardHeader>
            <CardBody>
              <Grid templateColumns="repeat(3, 1fr)" gap={2}>
                {["High", "Medium", "Low"].map((level) => (
                  <Box key={level} textAlign="center">
                    <Text fontSize="sm" mb={1}>{level}</Text>
                    <Box 
                      h="80px" 
                      bg={
                        level === "High" ? "red.100" : 
                        level === "Medium" ? "yellow.100" : "green.100"
                      }
                      border="1px solid"
                      borderColor={
                        level === "High" ? "red.300" : 
                        level === "Medium" ? "yellow.300" : "green.300"
                      }
                      borderRadius="md"
                    />
                  </Box>
                ))}
              </Grid>
            </CardBody>
          </Card>
        </Box>

        {/* Right Column */}
        <Box>
          {/* Evidence Status */}
          <Card mb={6}>
            <CardHeader borderBottom="1px solid" borderColor="gray.100">
              <Flex align="center">
                <FiDatabase style={{ marginRight: "8px" }} />
                <Text fontWeight="semibold">Evidence Status</Text>
              </Flex>
            </CardHeader>
            <CardBody>
              <Flex justify="center" align="center" direction="column">
                <Box position="relative" w="120px" h="120px" mb={4}>
                  <svg width="100%" height="100%" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#EDF2F7" strokeWidth="10" />
                    <circle 
                      cx="60" cy="60" r="50" fill="none" 
                      stroke="#38A169" strokeWidth="10" 
                      strokeDasharray="314" strokeDashoffset="78.5" 
                      transform="rotate(-90 60 60)" 
                    />
                    <Text 
                      x="60" y="60" 
                      textAnchor="middle" 
                      dominantBaseline="middle" 
                      fontSize="24" 
                      fontWeight="bold"
                    >
                      75%
                    </Text>
                  </svg>
                </Box>
                <Flex gap={4}>
                  <Flex align="center">
                    <Box w="12px" h="12px" bg="green.500" borderRadius="full" mr={2} />
                    <Text fontSize="sm">Valid (75%)</Text>
                  </Flex>
                  <Flex align="center">
                    <Box w="12px" h="12px" bg="red.500" borderRadius="full" mr={2} />
                    <Text fontSize="sm">Expired (25%)</Text>
                  </Flex>
                </Flex>
              </Flex>
            </CardBody>
          </Card>

          {/* Pending Tasks */}
          <Card mb={6}>
            <CardHeader borderBottom="1px solid" borderColor="gray.100">
              <Flex align="center">
                <FiAlertCircle style={{ marginRight: "8px" }} />
                <Text fontWeight="semibold">Pending Tasks</Text>
              </Flex>
            </CardHeader>
            <CardBody>
              <List spacing={3}>
                <ListItem display="flex" align="center">
                  <Box w="8px" h="8px" bg="red.500" borderRadius="full" mr={3} />
                  <Text>Review security training</Text>
                </ListItem>
                <ListItem display="flex" align="center">
                  <Box w="8px" h="8px" bg="red.500" borderRadius="full" mr={3} />
                  <Text>Update incident plan</Text>
                </ListItem>
                <ListItem display="flex" align="center">
                  <Box w="8px" h="8px" bg="red.500" borderRadius="full" mr={3} />
                  <Text>Complete audit checklist</Text>
                </ListItem>
              </List>
            </CardBody>
          </Card>

          {/* Framework Progress */}
          <Card>
            <CardHeader borderBottom="1px solid" borderColor="gray.100">
              <Flex align="center">
                <FiCheckCircle style={{ marginRight: "8px" }} />
                <Text fontWeight="semibold">Framework Progress</Text>
              </Flex>
            </CardHeader>
            <CardBody>
              <List spacing={4}>
                <ListItem>
                  <Flex justify="space-between" mb={1}>
                    <Text>Access Control</Text>
                    <Text fontWeight="bold">90%</Text>
                  </Flex>
                  <Progress value={90} size="sm" colorScheme="green" />
                </ListItem>
                <ListItem>
                  <Flex justify="space-between" mb={1}>
                    <Text>Risk Assessment</Text>
                    <Text fontWeight="bold">75%</Text>
                  </Flex>
                  <Progress value={75} size="sm" colorScheme="yellow" />
                </ListItem>
                <ListItem>
                  <Flex justify="space-between" mb={1}>
                    <Text>Incident Response</Text>
                    <Text fontWeight="bold">60%</Text>
                  </Flex>
                  <Progress value={60} size="sm" colorScheme="orange" />
                </ListItem>
                <ListItem>
                  <Flex justify="space-between" mb={1}>
                    <Text>Data Encryption</Text>
                    <Text fontWeight="bold">45%</Text>
                  </Flex>
                  <Progress value={45} size="sm" colorScheme="red" />
                </ListItem>
              </List>
            </CardBody>
          </Card>
        </Box>
      </Grid>
    </Box>
  );
};

export default Dashboard;