import {
  InputGroup,
  Input,
  InputLeftElement,
  InputRightElement,
  Button,
  FormControl,
  FormLabel,
  Box,
  Flex,
  Text,
  Heading,
  useToast,
  VStack,
  Icon,
  Link as ChakraLink
} from "@chakra-ui/react";
import { useState } from "react";
import { supabase } from "../supabase";
import { Link, useNavigate } from "react-router-dom";
import { FiLock, FiMail, FiEye, FiEyeOff } from "react-icons/fi";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Authenticate user
      const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (authError) throw authError;

      // 2. Fetch user role directly from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role, full_name')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;

      // 3. Store role in session (alternative to user_metadata)
      await supabase.from('user_sessions').upsert({
        user_id: user.id,
        role: userData.role || 'user',
        last_active: new Date().toISOString()
      });

      // 4. Show success notification
      toast({
        title: `Welcome, ${userData.full_name || 'User'}`,
        description: `Logged in as ${userData.role || 'user'}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // 5. Redirect based on role
      const role = (userData.role || 'user').toLowerCase();
      const redirectPaths = {
        'admin': '/admin/dashboard',
        'manager': '/manager/dashboard',
        'user': '/dashboard' // Basic users go to standard dashboard
      };

      navigate(redirectPaths[role] || '/dashboard');

    } catch (error) {
      toast({ 
        title: "Login Failed", 
        description: error.message.includes('Invalid login credentials') 
          ? "Invalid email or password" 
          : error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50">
      <Box 
        maxW="md" 
        w="full" 
        p={8} 
        borderWidth="1px" 
        borderRadius="lg" 
        boxShadow="xl"
        bg="white"
      >
        <Heading mb={6} textAlign="center" size="xl" color="purple.600">
          Compliance Portal
        </Heading>
        
        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Email Address</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiMail} color="gray.400" />
                </InputLeftElement>
                <Input
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="username"
                />
              </InputGroup>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Password</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiLock} color="gray.400" />
                </InputLeftElement>
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
                <InputRightElement>
                  <Button
                    variant="ghost"
                    onClick={() => setShowPassword(!showPassword)}
                    size="sm"
                  >
                    <Icon as={showPassword ? FiEyeOff : FiEye} color="gray.500" />
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <Button
              type="submit"
              colorScheme="purple"
              width="full"
              mt={4}
              isLoading={loading}
              loadingText="Authenticating..."
              size="lg"
            >
              Sign In
            </Button>
          </VStack>
        </form>

        <Flex mt={6} justify="space-between" align="center">
          <ChakraLink 
            as={Link} 
            to="/forgot-password" 
            color="purple.500" 
            fontSize="sm"
            fontWeight="500"
          >
            Forgot Password?
          </ChakraLink>
          
          <Text fontSize="sm" color="gray.600">
            New user?{' '}
            <ChakraLink 
              as={Link} 
              to="/request-access" 
              color="purple.500"
              fontWeight="500"
            >
              Request Access
            </ChakraLink>
          </Text>
        </Flex>
      </Box>
    </Flex>
  );
}