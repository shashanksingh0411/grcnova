import React, { useState } from 'react'
import {
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  VStack,
  Heading
} from '@chakra-ui/react'
import PolicyUpload from '../../components/PolicyUpload'
import PolicyList from '../../components/PolicyList'

const PolicyManagement = () => {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleUploadSuccess = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        <Heading as="h1" size="xl">
          Policy Management
        </Heading>
        
        <Tabs variant="enclosed">
          <TabList>
            <Tab>View Policies</Tab>
            <Tab>Upload New Policy</Tab>
          </TabList>
          
          <TabPanels>
            <TabPanel>
              <PolicyList key={refreshKey} />
            </TabPanel>
            <TabPanel>
              <PolicyUpload onUploadSuccess={handleUploadSuccess} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Box>
  )
}

export default PolicyManagement