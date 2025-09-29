export type Resource = 
  | 'dashboard' 
  | 'reports' 
  | 'users' 
  | 'departments' 
  | 'settings';

export type Action = 
  | 'view' 
  | 'create' 
  | 'edit' 
  | 'delete' 
  | 'manage';

export interface Permission {
  resource: Resource;
  action: Action;
}

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
  departmentAccess?: boolean;
}

export interface User {
  id: string;
  email: string;
  departmentId: string;
  roleId: string;
  pendingPermissions?: Permission[];
}
