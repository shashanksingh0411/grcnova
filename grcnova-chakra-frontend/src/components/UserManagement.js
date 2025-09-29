// src/components/UserManagement.js
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  useToast,
  Button
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { user } = useAuth();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data);
    } catch (error) {
      toast({
        title: 'Error fetching users',
        description: error.message,
        status: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'super_admin' || user?.role === 'admin') {
      fetchUsers();
    }
  }, [user]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: 'Role updated',
        status: 'success',
      });

      fetchUsers(); // Refresh list
    } catch (error) {
      toast({
        title: 'Error updating role',
        description: error.message,
        status: 'error',
      });
    }
  };

  if (!user || (user.role !== 'super_admin' && user.role !== 'admin')) {
    return <div>Access denied</div>;
  }

  return (
    <Table variant="simple">
      <Thead>
        <Tr>
          <Th>Email</Th>
          <Th>Name</Th>
          <Th>Role</Th>
          <Th>Actions</Th>
        </Tr>
      </Thead>
      <Tbody>
        {users.map((user) => (
          <Tr key={user.id}>
            <Td>{user.email}</Td>
            <Td>{user.full_name || '-'}</Td>
            <Td>
              <Select
                value={user.role}
                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                disabled={loading || user.role === 'super_admin'}
              >
                <option value="admin">Admin</option>
                <option value="auditor">Auditor</option>
                <option value="user">User</option>
                {user.role === 'super_admin' && (
                  <option value="super_admin">Super Admin</option>
                )}
              </Select>
            </Td>
            <Td>
              <Button size="sm" colorScheme="red" isDisabled={user.role === 'super_admin'}>
                Delete
              </Button>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}