// ControlsDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Flex, Text, Heading, Badge, Table, Thead, Tbody, Tr, Th, Td,
  Button, Skeleton, useColorModeValue
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { supabase } from '../../supabase';

const MotionBox = motion(Box);

const ControlsDashboard = () => {
  const [frameworks, setFrameworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  const actions = [
    { id: 1, title: 'ISO 27001 - Risk Assessment Update', status: 'overdue' },
    { id: 2, title: 'HIPAA - Data Encryption Gaps', status: 'due', date: '2023-12-15' },
    { id: 3, title: 'SOC 2 - Vendor Management Policy Review', status: 'in-progress' }
  ];

  const deadlines = [
    { name: 'ISO 27001 Recertification', date: '2024-03-15' },
    { name: 'SOC 2 Type 2 Audit', date: '2024-02-20' },
    { name: 'HIPAA Annual Review', date: '2024-01-30' }
  ];

  const getFrameworkColor = (frameworkKey) => {
    const colors = {
      'ISO27001:2022': 'linear-gradient(to right, #3b82f6, #60a5fa)',
      'HIPAA': 'linear-gradient(to right, #10b981, #34d399)',
      'SOC2': 'linear-gradient(to right, #f59e0b, #fbbf24)',
      'GDPR': 'linear-gradient(to right, #ef4444, #f87171)',
      'NIST': 'linear-gradient(to right, #8b5cf6, #a78bfa)'
    };
    return colors[frameworkKey] || 'linear-gradient(to right, #9ca3af, #d1d5db)';
  };

  const fetchFrameworkComplianceData = async (organizationId) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('control_implementations')
        .select(`
          id,
          status,
          framework_controls (
            framework_key,
            control_ref,
            control_name
          )
        `)
        .eq('organization_id', organizationId);

      if (error) throw error;

      const frameworkStats = {};
      data?.forEach((impl) => {
        const frameworkKey = impl.framework_controls?.framework_key;
        if (!frameworkKey) return;
        if (!frameworkStats[frameworkKey]) frameworkStats[frameworkKey] = { total: 0, implemented: 0, inProgress: 0, notStarted: 0, exempt: 0 };
        frameworkStats[frameworkKey].total += 1;
        switch (impl.status) {
          case 'implemented': frameworkStats[frameworkKey].implemented += 1; break;
          case 'in_progress': frameworkStats[frameworkKey].inProgress += 1; break;
          case 'not_started': frameworkStats[frameworkKey].notStarted += 1; break;
          case 'exempt': frameworkStats[frameworkKey].exempt += 1; break;
        }
      });

      const frameworkDisplayNames = {
        'ISO27001:2022': 'ISO 27001:2022',
        'HIPAA': 'HIPAA',
        'SOC2': 'SOC 2',
        'GDPR': 'GDPR',
        'NIST': 'NIST'
      };

      const frameworkData = Object.entries(frameworkStats).map(([key, stats]) => ({
        name: frameworkDisplayNames[key] || key,
        key,
        total: stats.total,
        implemented: stats.implemented,
        inProgress: stats.inProgress,
        notStarted: stats.notStarted,
        exempt: stats.exempt,
        percentage: stats.total ? Math.round((stats.implemented / stats.total) * 100) : 0,
        color: getFrameworkColor(key)
      }));

      setFrameworks(frameworkData.length ? frameworkData : Object.entries(frameworkDisplayNames).map(([key, name]) => ({
        name,
        key,
        total: 0,
        implemented: 0,
        inProgress: 0,
        notStarted: 0,
        exempt: 0,
        percentage: 0,
        color: getFrameworkColor(key)
      })));

      generateCategoryData(frameworkStats);
    } catch (error) {
      console.error(error);
      setFrameworks([]);
    } finally {
      setLoading(false);
    }
  };

  const generateCategoryData = (frameworkStats) => {
    const categoryTemplates = [
      { name: 'Access Control', frameworks: ['ISO27001:2022', 'SOC2', 'HIPAA'] },
      { name: 'Risk Management', frameworks: ['ISO27001:2022', 'SOC2', 'HIPAA'] },
      { name: 'Incident Response', frameworks: ['ISO27001:2022', 'SOC2', 'HIPAA'] },
      { name: 'Data Protection', frameworks: ['ISO27001:2022', 'SOC2', 'HIPAA'] },
      { name: 'Audit & Accountability', frameworks: ['ISO27001:2022', 'SOC2', 'HIPAA'] }
    ];

    const categoryData = categoryTemplates.map(cat => {
      const isoStats = frameworkStats['ISO27001:2022'];
      const soc2Stats = frameworkStats['SOC2'];
      const hipaaStats = frameworkStats['HIPAA'];
      return {
        name: cat.name,
        iso: isoStats ? Math.round((isoStats.implemented / isoStats.total) * 100) : 0,
        soc2: soc2Stats ? Math.round((soc2Stats.implemented / soc2Stats.total) * 100) : 0,
        hipaa: hipaaStats ? Math.round((hipaaStats.implemented / hipaaStats.total) * 100) : 0
      };
    });

    setCategories(categoryData);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('id', user.id)
          .single();

        if (profile?.organization_id) await fetchFrameworkComplianceData(profile.organization_id);
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, []);

  const totalImplemented = frameworks.reduce((sum, f) => sum + f.implemented, 0);
  const totalControls = frameworks.reduce((sum, f) => sum + f.total, 0);
  const compliancePercentage = totalControls ? Math.round((totalImplemented / totalControls) * 100) : 0;

  const cardBg = useColorModeValue('white', 'gray.700');
  const headingColor = useColorModeValue('gray.800', 'whiteAlpha.900');

  if (loading) {
    return (
      <Box p={6}>
        <Skeleton height="40px" mb={4} />
        <Skeleton height="20px" mb={8} />
        <Flex direction={{ base: 'column', lg: 'row' }} gap={6}>
          <Skeleton height="220px" flex={1} />
          <Skeleton height="220px" flex={1} />
          <Skeleton height="220px" flex={1} />
        </Flex>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <MotionBox initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} mb={6}>
        <Heading as="h1" size="lg" color={headingColor}>Compliance Dashboard</Heading>
        <Flex justify="space-between" align="center" mt={2} flexWrap="wrap" gap={3}>
          <Text fontSize="sm" color="gray.500">Last Updated: {new Date().toLocaleDateString()}</Text>
          <Badge px={4} py={2} borderRadius="full" bgGradient="linear(to-r, blue.400, blue.200)" color="white">
            <Text as="span" fontWeight="semibold">Overall Compliance:</Text>
            <Text as="span" ml={2} fontWeight="bold">{compliancePercentage}% Complete</Text>
            <Text as="span" ml={2} color="gray.100">({totalImplemented}/{totalControls} Controls)</Text>
          </Badge>
        </Flex>
      </MotionBox>

      <Flex direction={{ base: 'column', lg: 'row' }} gap={6} mb={8}>
        {/* Framework Overview */}
        <MotionBox
          bg={cardBg}
          p={5}
          borderRadius="xl"
          boxShadow="2xl"
          flex={1}
          overflowX="auto"
          whileHover={{ scale: 1.02 }}
        >
          <Heading as="h2" size="md" mb={4}>Framework Overview</Heading>
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Framework</Th>
                <Th textAlign="right">Implemented</Th>
                <Th textAlign="right">In Progress</Th>
                <Th textAlign="right">Not Started</Th>
                <Th textAlign="right">Total</Th>
                <Th textAlign="right">% Complete</Th>
              </Tr>
            </Thead>
            <Tbody>
              {frameworks.map(fw => (
                <Tr key={fw.key} _hover={{ bg: 'gray.50' }}>
                  <Td fontWeight="medium">{fw.name}</Td>
                  <Td textAlign="right"><Badge bgGradient="linear(to-r, green.400, green.300)" color="white">{fw.implemented}</Badge></Td>
                  <Td textAlign="right"><Badge bgGradient="linear(to-r, yellow.400, yellow.300)" color="white">{fw.inProgress}</Badge></Td>
                  <Td textAlign="right"><Badge bgGradient="linear(to-r, red.400, red.300)" color="white">{fw.notStarted + fw.exempt}</Badge></Td>
                  <Td textAlign="right">{fw.total}</Td>
                  <Td textAlign="right">
                    <Badge px={2} py={1} borderRadius="full" bgGradient={fw.percentage >= 80 ? "linear(to-r, green.400, green.300)" : fw.percentage >= 50 ? "linear(to-r, yellow.400, yellow.300)" : "linear(to-r, red.400, red.300)"} color="white">
                      {fw.percentage}%
                    </Badge>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </MotionBox>

        {/* Control Categories */}
        <MotionBox
          bg={cardBg}
          p={5}
          borderRadius="xl"
          boxShadow="2xl"
          flex={1}
          overflowX="auto"
          whileHover={{ scale: 1.02 }}
        >
          <Heading as="h2" size="md" mb={4}>Control Categories Status</Heading>
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Category</Th>
                <Th textAlign="center">ISO</Th>
                <Th textAlign="center">SOC2</Th>
                <Th textAlign="center">HIPAA</Th>
              </Tr>
            </Thead>
            <Tbody>
              {categories.map(cat => (
                <Tr key={cat.name} _hover={{ bg: 'gray.50' }}>
                  <Td>{cat.name}</Td>
                  {[cat.iso, cat.soc2, cat.hipaa].map((val, i) => (
                    <Td key={i} textAlign="center">
                      <Badge px={2} py={1} borderRadius="full" bgGradient={val >= 90 ? "linear(to-r, green.400, green.300)" : val >= 70 ? "linear(to-r, yellow.400, yellow.300)" : "linear(to-r, red.400, red.300)"} color="white">{val}%</Badge>
                    </Td>
                  ))}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </MotionBox>

        {/* Quick Actions */}
        <MotionBox
          bg={cardBg}
          p={5}
          borderRadius="xl"
          boxShadow="2xl"
          flex={1}
          whileHover={{ scale: 1.02 }}
        >
          <Heading as="h2" size="md" mb={4}>Quick Actions</Heading>
          <Flex direction="column" gap={3}>
            <Button colorScheme="blue" as="a" href="/compliance-framework">View Full Checklist</Button>
            <Button colorScheme="green">Generate Report</Button>
            <Button colorScheme="purple">Assign Remediation Tasks</Button>
          </Flex>
        </MotionBox>
      </Flex>

      {/* Priority Actions & Deadlines */}
      <Flex direction={{ base: 'column', lg: 'row' }} gap={6} mb={8}>
        <MotionBox bg={cardBg} p={5} borderRadius="xl" boxShadow="2xl" flex={1} whileHover={{ scale: 1.02 }}>
          <Heading as="h2" size="md" mb={4}>Priority Action Items</Heading>
          <Flex direction="column" gap={3}>
            {actions.map(action => (
              <Flex key={action.id} align="flex-start">
                <Box mt={1} mr={2} h={3} w={3} borderRadius="full" bg={action.status === 'overdue' ? 'red.500' : action.status === 'due' ? 'yellow.500' : 'blue.500'} />
                <Box>
                  <Text fontWeight="medium">{action.title}</Text>
                  {action.date && <Text fontSize="sm" color="gray.500">Due: {action.date}</Text>}
                </Box>
              </Flex>
            ))}
          </Flex>
        </MotionBox>

        <MotionBox bg={cardBg} p={5} borderRadius="xl" boxShadow="2xl" flex={1} whileHover={{ scale: 1.02 }}>
          <Heading as="h2" size="md" mb={4}>Upcoming Deadlines</Heading>
          <Flex direction="column" gap={3}>
            {deadlines.map((deadline, i) => (
              <Flex key={i} justify="space-between" align="center" pb={2} borderBottom="1px" borderColor="gray.100">
                <Text>{deadline.name}</Text>
                <Badge bg="gray.100" px={2} py={1} borderRadius="md" fontSize="sm">{deadline.date}</Badge>
              </Flex>
            ))}
          </Flex>
        </MotionBox>
      </Flex>

      {/* Charts Section */}
      <MotionBox bg={cardBg} p={5} borderRadius="xl" boxShadow="2xl" mb={6}>
        <Heading as="h2" size="md" mb={4}>Compliance Progress</Heading>
        <Flex direction={{ base: 'column', md: 'row' }} gap={6}>
          <Box flex={1} height="300px">
            <Text textAlign="center" fontWeight="medium" mb={2}>Framework Comparison</Text>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={frameworks}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="implemented" fill="url(#colorImplemented)">
                  {frameworks.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>

          <Box flex={1} height="300px">
            <Text textAlign="center" fontWeight="medium" mb={2}>Control Categories</Text>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categories}
                  dataKey="iso"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#3182ce"
                  label
                >
                  {categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="#4FD1C5" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Flex>
      </MotionBox>
    </Box>
  );
};

export default ControlsDashboard;
