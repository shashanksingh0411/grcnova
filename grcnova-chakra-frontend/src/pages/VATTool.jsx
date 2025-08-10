import React from 'react';
import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Box,
  Heading,
  Text,
  Badge,
  Flex,
  Icon
} from '@chakra-ui/react';
import { FiPercent, FiFileText, FiSettings, FiHelpCircle } from 'react-icons/fi';
import VATCalculator from '../features/vat/VATCalculator';
import VATReturns from '../features/vat/VATReturns';
import VATSettings from '../features/vat/VATSettings';
import VATGuide from '../features/vat/VATGuide';

const VATTool = () => {
  return (
    <Box p={6}>
      <Flex align="center" mb={8}>
        <Heading size="xl" mr={4}>VAT Compliance Tool</Heading>
        <Badge colorScheme="purple" fontSize="lg">BETA</Badge>
      </Flex>

      <Tabs variant="enclosed" colorScheme="purple">
        <TabList>
          <Tab>
            <Icon as={FiPercent} mr={2} />
            Calculator
          </Tab>
          <Tab>
            <Icon as={FiFileText} mr={2} />
            Returns
          </Tab>
          <Tab>
            <Icon as={FiSettings} mr={2} />
            Settings
          </Tab>
          <Tab>
            <Icon as={FiHelpCircle} mr={2} />
            Guide
          </Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <VATCalculator />
          </TabPanel>
          <TabPanel>
            <VATReturns />
          </TabPanel>
          <TabPanel>
            <VATSettings />
          </TabPanel>
          <TabPanel>
            <VATGuide />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default VATTool;