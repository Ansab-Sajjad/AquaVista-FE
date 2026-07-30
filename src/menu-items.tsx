import { MenuItem } from "@/types";

export const leftMenuItems: MenuItem[] = [
  {
    id: "projects",
    icon: "NiBuilding",
    label: "menu-projects",
    description: "Municipal rate study projects",
    color: "text-primary",
    href: "/projects",
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
