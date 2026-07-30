"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";

import NiLock from "@/icons/nexture/ni-lock";
import NiUser from "@/icons/nexture/ni-user";

export default function SettingsMenu() {
  const pathname = usePathname();

  return (
    <Box className="flex flex-col gap-4">
      <List className="p-0">
        <ListItem disablePadding>
          <ListItemButton href="/settings" LinkComponent={Link} selected={pathname === "/settings"}>
            <ListItemIcon>
              <NiUser size="medium" />
            </ListItemIcon>
            <ListItemText primary="Profile" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton href="/settings/password" LinkComponent={Link} selected={pathname === "/settings/password"}>
            <ListItemIcon>
              <NiLock size="medium" />
            </ListItemIcon>
            <ListItemText primary="Password" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
}
