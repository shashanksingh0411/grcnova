// src/pages/VendorManagement/VendorDirectory.jsx
import React, { useState, useEffect } from "react";
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
  Flex,
  Button,
  Spinner,
  Center,
  Heading,
  Badge,
  Progress,
  Icon,
  useColorModeValue
} from "@chakra-ui/react";
import { 
  FiSearch, 
  FiServer, 
  FiMail, 
  FiBarChart2, 
  FiChevronRight,
  FiFilter,
  FiShield,
  FiAlertTriangle,
  FiCheckCircle
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase"; // adjust import path if needed

const VendorDirectory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const cardBg = useColorModeValue("white", "gray.800");
  const headerBg = useColorModeValue("gray.50", "gray.700");
  const riskHigh = useColorModeValue("red.500", "red.300");
  const riskMedium = useColorModeValue("orange.500", "orange.300");
  const riskLow = useColorModeValue("green.500", "green.300");

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("vendors")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setVendors(data || []);
      } catch (err) {
        console.error("Error fetching vendors:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, []);

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesService = serviceFilter === "all" || vendor.service_type === serviceFilter;
    const matchesStatus = statusFilter === "all" || vendor.status === statusFilter;
    return matchesSearch && matchesService && matchesStatus;
  });

  const getRiskColor = (riskScore) => {
    if (riskScore >= 70) return riskHigh;
    if (riskScore >= 40) return riskMedium;
    return riskLow;
  };

  const getRiskIcon = (riskScore) => {
    if (riskScore >= 70) return FiAlertTriangle;
    if (riskScore >= 40) return FiShield;
    return FiCheckCircle;
  };

  const getRiskLabel = (riskScore) => {
    if (riskScore >= 70) return "High Risk";
    if (riskScore >= 40) return "Medium Risk";
    return "Low Risk";
  };

  const getServiceIcon = (serviceType) => {
    switch (serviceType) {
      case "Infrastructure": return FiServer;
      case "Analytics": return FiBarChart2;
      case "Communication": return FiMail;
      default: return FiServer;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved": return "green";
      case "pending": return "orange";
      case "rejected": return "red";
      default: return "gray";
    }
  };

  if (loading) {
    return (
      <Center py={10}>
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Box p={6}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Vendor Directory</Heading>
        <Button 
  colorScheme="purple" 
  size="sm"
  onClick={() => navigate("/vendor-management/onboarding")}
>
  Add Vendor
</Button>
      </Flex>

      <Flex mb={6} gap={4} wrap="wrap">
        <InputGroup maxW="300px">
          <InputLeftElement pointerEvents="none">
            <FiSearch color="gray.300" />
          </InputLeftElement>
          <Input 
            placeholder="Search vendors..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            borderRadius="md"
          />
        </InputGroup>
        
        <Flex gap={2} align="center">
          <Icon as={FiFilter} color="gray.500" />
          <Select 
            placeholder="Service Type" 
            w="180px"
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            borderRadius="md"
            size="md"
          >
            <option value="all">All Services</option>
            <option value="Infrastructure">Infrastructure</option>
            <option value="Analytics">Analytics</option>
            <option value="Communication">Communication</option>
          </Select>
          
          <Select 
            placeholder="Status" 
            w="150px"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            borderRadius="md"
            size="md"
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </Select>
        </Flex>
      </Flex>

      {filteredVendors.length === 0 ? (
        <Center py={10} flexDirection="column">
          <FiServer size={48} color="#CBD5E0" />
          <Text mt={4} color="gray.500">No vendors found</Text>
          <Text color="gray.400" fontSize="sm">Try adjusting your search or filters</Text>
        </Center>
      ) : (
        <SimpleGrid columns={[1, 1, 2, 3]} spacing={5}>
          {filteredVendors.map(vendor => (
            <Card 
              key={vendor.id} 
              variant="elevated" 
              borderRadius="lg" 
              overflow="hidden"
              bg={cardBg}
              boxShadow="sm"
              transition="all 0.2s"
              _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
            >
              <CardHeader bg={headerBg} py={3}>
                <Flex align="center" justify="space-between">
                  <Flex align="center" gap={3}>
                    <Icon as={getServiceIcon(vendor.service_type)} color="purple.500" />
                    <Text fontWeight="bold" fontSize="md">{vendor.name}</Text>
                  </Flex>
                  <Badge 
                    colorScheme={getStatusColor(vendor.status)}
                    variant="subtle"
                    borderRadius="full"
                    px={2}
                    py={1}
                    fontSize="xs"
                  >
                    {vendor.status}
                  </Badge>
                </Flex>
              </CardHeader>
              <CardBody py={4}>
                <Stack spacing={4}>
                  <Box>
                    <Flex justify="space-between" align="center" mb={1}>
                      <Text fontSize="sm" fontWeight="medium" color="gray.600">Risk Score</Text>
                      <Flex align="center" gap={1}>
                        <Icon as={getRiskIcon(vendor.risk_score || 0)} color={getRiskColor(vendor.risk_score || 0)} />
                        <Text fontSize="sm" fontWeight="bold" color={getRiskColor(vendor.risk_score || 0)}>
                          {getRiskLabel(vendor.risk_score || 0)}
                        </Text>
                      </Flex>
                    </Flex>
                    <Progress 
                      value={vendor.risk_score || 0} 
                      size="sm" 
                      colorScheme={
                        (vendor.risk_score || 0) >= 70 ? "red" : 
                        (vendor.risk_score || 0) >= 40 ? "orange" : "green"
                      }
                      borderRadius="full"
                      hasStripe
                    />
                    <Flex justify="space-between" mt={1}>
                      <Text fontSize="xs" color="gray.500">0</Text>
                      <Text fontSize="xs" fontWeight="bold">{vendor.risk_score || 0}/100</Text>
                      <Text fontSize="xs" color="gray.500">100</Text>
                    </Flex>
                  </Box>
                  
                  <Box>
                    <Text fontSize="sm" color="gray.600" mb={1}>Contact Info</Text>
                    <Text fontSize="sm">{vendor.contact_person || "N/A"}</Text>
                    <Text fontSize="sm" color="blue.500">{vendor.email || "N/A"}</Text>
                    <Text fontSize="sm">{vendor.phone || "N/A"}</Text>
                  </Box>
                  
                  <Flex justify="space-between" align="center" pt={2}>
                    <Text fontSize="xs" color="gray.500">
                      Last updated: {new Date(vendor.updated_at || vendor.created_at).toLocaleDateString()}
                    </Text>
                    <Button 
  size="sm" 
  colorScheme="purple"
  variant="outline"
  rightIcon={<FiChevronRight />}
  onClick={() => navigate(`/vendor-management/vendor/${vendor.id}`)}
>
  View Details
</Button>
                  </Flex>
                </Stack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
};

export default VendorDirectory;