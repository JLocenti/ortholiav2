export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  company: string;
  photo: string;
  defaultViewId: string;
  customViews: string[];
  createdAt: string;
  role: UserRole;
  status: UserStatus;
}

export type UserRole = 'super_admin' | 'admin' | 'member';
export type UserStatus = 'active' | 'inactive';

export interface UserSettings {
  defaultViewId: string;
  customViews: string[];
  theme: 'light' | 'dark';
  themeColor: string;
}

export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin' as const,
  ADMIN: 'admin' as const,
  MEMBER: 'member' as const
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Administrateur',
  admin: 'Administrateur',
  member: 'Membre'
};

export const USER_ROLE_PERMISSIONS: Record<UserRole, UserRole[]> = {
  super_admin: ['super_admin', 'admin', 'member'],
  admin: ['admin', 'member'],
  member: []
};