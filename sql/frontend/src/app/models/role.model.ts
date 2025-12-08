export enum UserRole {
  ADMIN = "Admin",
  SALES = "Sales",
  OPERATIONS = "Operations",
  MANAGEMENT = "Management",
}

export interface RoleInfo {
  role: UserRole;
  displayName: string;
  description: string;
  color: string;
}

export const AVAILABLE_ROLES: RoleInfo[] = [
  {
    role: UserRole.ADMIN,
    displayName: "Admin",
    description: "Full system access",
    color: "#dc2626",
  },
  {
    role: UserRole.SALES,
    displayName: "Sales",
    description: "Plot availability & pricing",
    color: "#2563eb",
  },
  {
    role: UserRole.OPERATIONS,
    displayName: "Operations",
    description: "Day-to-day management",
    color: "#16a34a",
  },
  {
    role: UserRole.MANAGEMENT,
    displayName: "Management",
    description: "Statistics & reports",
    color: "#9333ea",
  },
];
