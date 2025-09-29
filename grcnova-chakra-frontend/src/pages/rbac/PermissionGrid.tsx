import { Checkbox, Stack, Text, SimpleGrid, Box } from '@chakra-ui/react';
import { Permission, Resource, Action } from './types';

export const PermissionGrid = ({
  permissions,
  onChange
}: {
  permissions: Permission[];
  onChange: (perm: Permission, checked: boolean) => void;
}) => {
  const resources: Resource[] = ['dashboard', 'users', 'departments', 'reports', 'settings'];
  const actions: Action[] = ['view', 'create', 'edit', 'delete', 'manage'];

  return (
    <Box borderWidth="1px" borderRadius="md" p={4}>
      <SimpleGrid columns={actions.length + 1} spacing={4}>
        <Text fontWeight="bold">Resource</Text>
        {actions.map(action => (
          <Text key={action} fontWeight="bold" textAlign="center">
            {action}
          </Text>
        ))}

        {resources.map(resource => (
          <>
            <Text key={resource}>{resource}</Text>
            {actions.map(action => (
              <Checkbox
                key={`${resource}-${action}`}
                isChecked={permissions.some(
                  p => p.resource === resource && p.action === action
                )}
                onChange={(e) => onChange({ resource, action }, e.target.checked)}
                mx="auto"
              />
            ))}
          </>
        ))}
      </SimpleGrid>
    </Box>
  );
};