import { MenuItem } from "@/types";

export const leftMenuItems: MenuItem[] = [
  {
    id: "overview",
    icon: "NiChartPie",
    label: "menu-overview",
    description: "Aggregated statistics across all projects",
    color: "text-primary",
    href: "/overview",
  },
  {
    id: "projects",
    icon: "NiBuilding",
    label: "menu-projects",
    description: "Municipal rate study projects",
    color: "text-primary",
    href: "/projects",
  },
  {
    id: "users",
    icon: "NiUsers",
    label: "menu-users",
    description: "Manage AquaVista users and project access",
    href: "/users",
    adminOnly: true,
  },
];

export const leftMenuBottomItems: MenuItem[] = [
  {
    id: "settings",
    icon: "NiSettings",
    label: "menu-settings",
    description: "Account and application settings",
    color: "grey",
    href: "/settings",
  },
  {
    id: "signout",
    icon: "NiSignOut",
    label: "menu-sign-out",
    description: "Sign out of your account",
    color: "grey",
    href: "/auth/sign-in",
  },
];
