import React, { useState } from "react";
import {
  Box,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Text,
  Tag,
  Progress,
  Heading,
  Flex,
  Icon,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea
} from "@chakra-ui/react";
import { FiAlertTriangle, FiCheckCircle, FiInfo, FiPlus } from "react-icons/fi";

const VendorRiskDashboard = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [vendors, setVendors] = useState([
    { id: 1, name: "Cloud Hosting Inc", riskLevel: "Low", progress: 30 },
    { id: 2, name: "Data Analytics Co", riskLevel: "Medium", progress: 60 },
    { id: 3, name: "Email Service Ltd", riskLevel: "Low", progress: 20 }
  ]);
  const [newVendor, setNewVendor] = useState({
    name: "",
    riskLevel: "Low",
    progress: 0,
    notes: ""
  });

  const getRiskDetails = (riskLevel) => {
    switch (riskLevel) {
      case "High":
        return { color: "red", icon: FiAlertTriangle };
      case "Medium":
        return { color: "orange", icon: FiInfo };
      default:
        return { color: "green", icon: FiCheckCircle };
    }
  };

  const handleAddVendor = () => {
    setVendors([...vendors, { ...newVendor, id: vendors.length + 1 }]);
    setNewVendor({ name: "", riskLevel: "Low", progress: 0, notes: "" });
    onClose();
  };

  const riskCounts = vendors.reduce((acc, vendor) => {
    acc[vendor.riskLevel] = (acc[vendor.riskLevel] || 0) + 1;
    return acc;
  }, {});

  return (
    <Box p={4}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Vendor Risk Overview</Heading>
        <Button 
          leftIcon={<FiPlus />} 
          colorScheme="blue" 
          onClick={onOpen}
        >
          Manage Vendor Risk
        </Button>
      </Flex>
      
      {/* Risk Summary Cards */}
      <SimpleGrid columns={[1, 2, 3]} spacing={4} mb={6}>
        <Card bg="green.50">
          <CardBody>
            <Text>Low Risk Vendors</Text>
            <Text fontSize="2xl" fontWeight="bold">{riskCounts.Low || 0}</Text>
          </CardBody>
        </Card>
        <Card bg="orange.50">
          <CardBody>
            <Text>Medium Risk Vendors</Text>
            <Text fontSize="2xl" fontWeight="bold">{riskCounts.Medium || 0}</Text>
          </CardBody>
        </Card>
        <Card bg="red.50">
          <CardBody>
            <Text>High Risk Vendors</Text>
            <Text fontSize="2xl" fontWeight="bold">{riskCounts.High || 0}</Text>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Vendor List */}
      <SimpleGrid columns={[1, 2]} spacing={4}>
        {vendors.map(vendor => {
          const { color, icon } = getRiskDetails(vendor.riskLevel);
          return (
            <Card key={vendor.id} variant="outline" _hover={{ boxShadow: "md" }}>
              <CardHeader>
                <Flex align="center" gap={2}>
                  <Icon as={icon} color={`${color}.500`} boxSize={5} />
                  <Text fontWeight="bold">{vendor.name}</Text>
                  <Tag colorScheme={color} ml="auto" textTransform="uppercase">
                    {vendor.riskLevel} Risk
                  </Tag>
                </Flex>
              </CardHeader>
              <CardBody>
                <Box>
                  <Text mb={2}>Risk Level: {vendor.progress}%</Text>
                  <Progress 
                    value={vendor.progress} 
                    colorScheme={color} 
                    size="sm" 
                    borderRadius="full"
                  />
                </Box>
              </CardBody>
            </Card>
          );
        })}
      </SimpleGrid>

      {/* Risk Management Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Vendor Risk Assessment</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4}>
              <FormLabel>Vendor Name</FormLabel>
              <Input 
                value={newVendor.name}
                onChange={(e) => setNewVendor({...newVendor, name: e.target.value})}
                placeholder="Enter vendor name"
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Risk Level</FormLabel>
              <Select
                value={newVendor.riskLevel}
                onChange={(e) => setNewVendor({...newVendor, riskLevel: e.target.value})}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </Select>
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Risk Percentage</FormLabel>
              <Input 
                type="number"
                value={newVendor.progress}
                onChange={(e) => setNewVendor({...newVendor, progress: parseInt(e.target.value) || 0})}
                min="0"
                max="100"
              />
            </FormControl>
            <FormControl>
              <FormLabel>Risk Notes</FormLabel>
              <Textarea
                value={newVendor.notes}
                onChange={(e) => setNewVendor({...newVendor, notes: e.target.value})}
                placeholder="Additional risk details"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleAddVendor}>
              Save Assessment
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default VendorRiskDashboard;