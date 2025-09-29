import { useState, useEffect } from 'react';
import { Permission, User, Resource, Action } from './types'; // Added Resource and Action imports
import { PREDEFINED_ROLES } from './constants';

export const usePermissions = (user: User | null) => {
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]); // Fixed useState syntax

  useEffect(() => {
    if (!user) {
      setUserPermissions([]);
      return;
    }

    const role = PREDEFINED_ROLES.find(r => r.id === user.roleId);
    setUserPermissions(role?.permissions || []);
  }, [user]);

  const hasPermission = (
    resource: Resource, 
    action: Action, 
    departmentId?: string
  ): boolean => {
    if (!user) return false;

    // Super Admin bypass
    if (user.roleId === 'super-admin') return true;

    // Department-specific check
    if (departmentId && user.departmentId !== departmentId) {
      return userPermissions.some(
        p => p.resource === 'departments' && p.action === 'manage'
      );
    }

    return userPermissions.some(
      p => p.resource === resource && p.action === action
    );
  };

  return { hasPermission, userPermissions };
};