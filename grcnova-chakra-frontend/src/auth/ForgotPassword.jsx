import {
  Box, Input, Button, Heading, VStack, useToast,
} from "@chakra-ui/react";
import { useState } from "react";

const ForgotPassword = () => {
  const toast = useToast();
  const [email, setEmail] = useState("");

  const handleReset = () => {
    toast({ title: "Reset link sent to email", status: "info" });
  };

  return (
    <Box maxW="sm" mx="auto" mt={20} p={6} boxShadow="xl" borderRadius="lg" bg="white">
      <Heading mb={6} textAlign="center">Forgot Password</Heading>
      <VStack spacing={4}>
        <Input placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Button colorScheme="orange" onClick={handleReset} w="full">Send Reset Link</Button>
      </VStack>
    </Box>
  );
};

export default ForgotPassword;