// src/pages/rbac/AdminPanel.jsx
import {
  Box,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Heading,
  Text,
  Divider,
  useColorModeValue,
} from "@chakra-ui/react";
import { useState } from "react";
import { PermissionGrid } from "./PermissionGrid";
import { PREDEFINED_ROLES } from "./constants";

const AdminPanel = () => {
  const [selectedRole, setSelectedRole] = useState(PREDEFINED_ROLES[0]);

  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("gray.200", "gray.700");

  return (
    <Box p={6}>
      <Heading size="lg" mb={2}>
        RBAC Administration
      </Heading>
      <Text fontSize="md" color="gray.500" mb={6}>
        Manage roles, users, and access requests in your organization
      </Text>

      <Box
        bg={cardBg}
        borderWidth="1px"
        borderColor={cardBorder}
        borderRadius="xl"
        shadow="md"
        p={4}
      >
        <Tabs variant="enclosed" colorScheme="purple">
          <TabList>
            <Tab fontWeight="semibold">Roles</Tab>
            <Tab fontWeight="semibold">Users</Tab>
            <Tab fontWeight="semibold">Requests</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <Heading size="md" mb={4}>
                Role Permissions
              </Heading>
              <Divider mb={4} />
              <PermissionGrid
                permissions={selectedRole.permissions}
                onChange={(perm, checked) => {
                  const newPermissions = checked
                    ? [...selectedRole.permissions, perm]
                    : selectedRole.permissions.filter(
                        (p) =>
                          !(
                            p.resource === perm.resource &&
                            p.action === perm.action
                          )
                      );
                  setSelectedRole({
                    ...selectedRole,
                    permissions: newPermissions,
                  });
                }}
              />
            </TabPanel>

            <TabPanel>
              <Heading size="md" mb={4}>
                Users Management
              </Heading>
              <Divider mb={4} />
              <Text color="gray.500">
                Add, remove, and assign roles to users (coming soon…)
              </Text>
            </TabPanel>

            <TabPanel>
              <Heading size="md" mb={4}>
                Access Requests
              </Heading>
              <Divider mb={4} />
              <Text color="gray.500">
                Review pending role or permission requests (coming soon…)
              </Text>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
};

export default AdminPanel;
