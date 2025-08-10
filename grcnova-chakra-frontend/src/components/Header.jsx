import { 
  Flex, 
  Input, 
  InputGroup, 
  InputRightElement, 
  Icon, 
  Image, 
  Heading,
  Box
} from '@chakra-ui/react';
import { FiSearch } from 'react-icons/fi'; // Alternative icon import

const Header = ({ pageTitle = "Dashboard" }) => {
  return (
    <Flex
      as="header"
      justify="space-between"
      align="center"
      p={4}
      bg="white"
      boxShadow="sm"
      width="full"
      position="sticky"
      top={0}
      zIndex="sticky"
    >
      <Flex align="center" gap={5}>
        <Image 
          src="/logo.png" 
          alt="Compliance Platform Logo" 
          h="40px" 
          objectFit="contain"
        />
        <Heading as="h1" size="md" fontWeight="semibold" color="gray.800">
          {pageTitle}
        </Heading>
      </Flex>

      <Box width={["100%", "100%", "auto"]} ml={[0, 0, 4]}>
        <InputGroup maxW="400px">
          <Input
            placeholder="Search compliance items..."
            variant="outline"
            borderRadius="md"
            pr="4.5rem"
            _focus={{
              borderColor: 'blue.500',
              boxShadow: 'outline'
            }}
          />
          <InputRightElement>
            <Icon as={FiSearch} color="gray.400" />
          </InputRightElement>
        </InputGroup>
      </Box>
    </Flex>
  );
};

export default Header;