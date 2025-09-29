import { 
  Flex, 
  Input, 
  InputGroup, 
  InputRightElement, 
  Icon, 
  Image, 
  Heading,
  Box,
  Button,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Text,
  useColorModeValue
} from '@chakra-ui/react';
import { FiSearch, FiLogOut, FiUser, FiSettings } from 'react-icons/fi';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Header = ({ toggleSidebar, session }) => {
  const navigate = useNavigate();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user?.id) {
        const { data, error } = await supabase
          .from('users')
          .select('full_name, email')
          .eq('id', session.user.id)
          .single();
        
        if (!error) {
          setUserData(data);
        }
      }
    };

    fetchUserData();
  }, [session]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      navigate('/login');
    }
  };

  return (
    <Flex
      as="header"
      justify="space-between"
      align="center"
      p={4}
      bg={bgColor}
      boxShadow="sm"
      width="full"
      position="sticky"
      top={0}
      zIndex="sticky"
      borderBottom="1px solid"
      borderColor={borderColor}
    >
      <Flex align="center" gap={5}>
        <Image 
          src="/logo.png" 
          alt="Compliance Platform Logo" 
          h="40px" 
          objectFit="contain"
        />
      </Flex>

      <Box width="400px">
        <InputGroup>
          <Input
            placeholder="Search compliance items..."
            variant="outline"
            borderRadius="md"
            pr="4.5rem"
          />
          <InputRightElement>
            <Icon as={FiSearch} color="gray.400" />
          </InputRightElement>
        </InputGroup>
      </Box>

      <Flex align="center" gap={4}>
        <Menu>
          <MenuButton as={Button} variant="ghost" rounded="full">
            <Flex align="center" gap={2}>
              <Avatar 
                size="sm" 
                name={userData?.full_name || session?.user.email} 
              />
              <Text fontSize="sm" fontWeight="medium">
                {userData?.full_name || session?.user.email.split('@')[0]}
              </Text>
            </Flex>
          </MenuButton>
          <MenuList>
            <MenuItem icon={<FiUser />}>
              <Box>
                <Text fontWeight="bold">{userData?.full_name || 'User'}</Text>
                <Text fontSize="sm" color="gray.500">
                  {session?.user.email}
                </Text>
              </Box>
            </MenuItem>
            <MenuItem icon={<FiSettings />}>
              Settings
            </MenuItem>
            <MenuDivider />
            <MenuItem 
              icon={<FiLogOut />} 
              onClick={handleLogout}
              color="red.500"
            >
              Logout
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    </Flex>
  );
};

export default Header;