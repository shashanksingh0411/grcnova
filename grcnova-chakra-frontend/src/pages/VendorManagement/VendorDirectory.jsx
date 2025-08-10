import React, { useState } from "react";
import { 
  Box, 
  Input, 
  InputGroup, 
  InputLeftElement, 
  Select,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Text,
  Tag,
  Stack,
  Flex
} from "@chakra-ui/react";
import { FiSearch, FiServer, FiMail, FiBarChart2 } from "react-icons/fi";

const VendorDirectory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");

  // Mock data - replace with your API data
  const vendors = [
    { id: 1, name: "Cloud Hosting Inc", serviceType: "Infrastructure", riskLevel: "Low" },
    { id: 2, name: "Data Analytics Co", serviceType: "Analytics", riskLevel: "Medium" },
    { id: 3, name: "Email Service Ltd", serviceType: "Communication", riskLevel: "Low" }
  ];

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesService = serviceFilter === "all" || vendor.serviceType === serviceFilter;
    return matchesSearch && matchesService;
  });

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case "High": return "red";
      case "Medium": return "orange";
      default: return "green";
    }
  };

  const getServiceIcon = (serviceType) => {
    switch (serviceType) {
      case "Infrastructure": return <FiServer />;
      case "Analytics": return <FiBarChart2 />;
      case "Communication": return <FiMail />;
      default: return null;
    }
  };

  return (
    <Box>
      <Flex mb={6} gap={4}>
        <InputGroup maxW="300px">
          <InputLeftElement pointerEvents="none">
            <FiSearch color="gray.300" />
          </InputLeftElement>
          <Input 
            placeholder="Search vendors..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
        
        <Select 
          placeholder="Service Type" 
          w="200px"
          value={serviceFilter}
          onChange={(e) => setServiceFilter(e.target.value)}
        >
          <option value="all">All Services</option>
          <option value="Infrastructure">Infrastructure</option>
          <option value="Analytics">Analytics</option>
          <option value="Communication">Communication</option>
        </Select>
      </Flex>

      <SimpleGrid columns={[1, 2, 3]} spacing={4}>
        {filteredVendors.map(vendor => (
          <Card key={vendor.id} variant="outline">
            <CardHeader>
              <Flex align="center" gap={2}>
                {getServiceIcon(vendor.serviceType)}
                <Text fontWeight="bold">{vendor.name}</Text>
              </Flex>
            </CardHeader>
            <CardBody>
              <Stack spacing={2}>
                <Text fontSize="sm">Service: {vendor.serviceType}</Text>
                <Flex align="center" gap={2}>
                  <Text fontSize="sm">Risk:</Text>
                  <Tag colorScheme={getRiskColor(vendor.riskLevel)}>
                    {vendor.riskLevel}
                  </Tag>
                </Flex>
              </Stack>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default VendorDirectory;