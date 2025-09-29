import { Box, Heading, SimpleGrid, Stat, StatLabel, StatNumber } from '@chakra-ui/react';
import { useAuth } from '../../contexts/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import { supabase } from '../../api/supabaseClient';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const { organization } = useAuth();
  const [stats, setStats] = useState({
    policies: 0,
    risks: 0,
    vendors: 0,
    controls: 0,
  });

  useEffect(() => {
    if (!organization) return;

    const fetchStats = async () => {
      const { count: policies } = await supabase
        .from('policies')
        .select('*', { count: 'exact' })
        .eq('organization_id', organization.id);

      const { count: risks } = await supabase
        .from('risks')
        .select('*', { count: 'exact' })
        .eq('organization_id', organization.id);

      const { count: vendors } = await supabase
        .from('vendors')
        .select('*', { count: 'exact' })
        .eq('organization_id', organization.id);

      const { count: controls } = await supabase
        .from('controls')
        .select('*', { count: 'exact' })
        .eq('organization_id', organization.id);

      setStats({
        policies,
        risks,
        vendors,
        controls,
      });
    };

    fetchStats();
  }, [organization]);

  return (
    <ProtectedRoute>
      <Box p={8}>
        <Heading mb={8}>Dashboard - {organization?.name}</Heading>
        
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          <StatCard label="Policies" value={stats.policies} />
          <StatCard label="Risks" value={stats.risks} />
          <StatCard label="Vendors" value={stats.vendors} />
          <StatCard label="Controls" value={stats.controls} />
        </SimpleGrid>
      </Box>
    </ProtectedRoute>
  );
}

function StatCard({ label, value }) {
  return (
    <Stat p={5} shadow="md" border="1px" borderColor="gray.100" rounded="md">
      <StatLabel>{label}</StatLabel>
      <StatNumber>{value}</StatNumber>
    </Stat>
  );
}