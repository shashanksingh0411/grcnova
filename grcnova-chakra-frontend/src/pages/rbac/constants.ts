// src/rbac/constants.ts
import type { Role, Resource, Action } from './types';

const PREDEFINED_ROLES: Role[] = [
  {
    id: 'super-admin',
    name: 'Super Admin',
    departmentAccess: false,
    permissions: [
      { resource: 'dashboard' as Resource, action: 'manage' as Action },
      { resource: 'users' as Resource, action: 'manage' as Action },
      { resource: 'departments' as Resource, action: 'manage' as Action },
      { resource: 'reports' as Resource, action: 'manage' as Action },
      { resource: 'settings' as Resource, action: 'manage' as Action }
    ]
  },
  {
    id: 'department-admin',
    name: 'Department Admin',
    departmentAccess: true,
    permissions: [
      { resource: 'dashboard' as Resource, action: 'view' as Action },
      { resource: 'users' as Resource, action: 'edit' as Action },
      { resource: 'departments' as Resource, action: 'view' as Action }
    ]
  }
];

export { PREDEFINED_ROLES };