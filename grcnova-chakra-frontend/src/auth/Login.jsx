import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Heading,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import {supabase} from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const toast = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (error) {
      toast({ title: "Login Failed", description: error.message, status: "error" });
      return;
    }

    toast({ title: "Login Successful", status: "success" });
    navigate("/dashboard"); // Adjust route based on your app
  };

  return (
    <Box maxW="md" mx="auto" mt={10} p={6} borderWidth="1px" borderRadius="lg" boxShadow="md">
      <Heading mb={6} textAlign="center">Login</Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input name="email" type="email" value={form.email} onChange={handleChange} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Password</FormLabel>
            <Input name="password" type="password" value={form.password} onChange={handleChange} />
          </FormControl>
          <Button type="submit" colorScheme="purple" width="full">Login</Button>
        </VStack>
      </form>
    </Box>
  );
}