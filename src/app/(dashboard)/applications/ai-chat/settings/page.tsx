"use client";

import SettingsContact from "./components/settings-contact";
import SettingsPublicInfo from "./components/settings-public-info";
import SettingsWork from "./components/settings-work";
import Link from "next/link";
import { useState } from "react";

import {
  Box,
  Breadcrumbs,
  Button,
  Drawer,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
} from "@mui/material";

import NiListCircle from "@/icons/nexture/ni-list-circle";
import NiLock from "@/icons/nexture/ni-lock";
import NiUser from "@/icons/nexture/ni-user";
const MenuContent = () => {
  return (
    <Box className="flex flex-col gap-4">
      <List className="-mt-6">
        <ListItem disablePadding>
          <ListItemButton className="pointer-events-none mt-4">
            <ListItemText
              primary="Personal"
              slotProps={{
                primary: { className: "text-sm! font-semibold! text-text-disabled-dark" },
              }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton href="/settings" LinkComponent={Link} selected>
            <ListItemIcon>
              <NiUser size="medium" />
            </ListItemIcon>
            <ListItemText primary="Profile" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton className="pointer-events-none mt-4">
            <ListItemText
              primary="Security"
              slotProps={{
                primary: { className: "text-sm! font-semibold! text-text-disabled-dark" },
              }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton href="/settings" LinkComponent={Link}>
            <ListItemIcon>
              <NiLock size="medium" />
            </ListItemIcon>
            <ListItemText primary="Password" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
};

export default function Page() {
  const [openDrawer, setOpenDrawer] = useState(false);

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpenDrawer(newOpen);
  };

  return (
    <Grid container spacing={5} className="w-full" size={12}>
      <Grid size={12} spacing={2.5} container>
        <Grid size={{ xs: 12, md: "grow" }}>
          <Typography variant="h1" component="h1" className="mb-0">
            Settings
          </Typography>
          <Breadcrumbs>
            <Link color="inherit" href="/dashboards/default">
              Home
            </Link>
            <Link color="inherit" href="/applications">
              Applications
            </Link>
            <Link color="inherit" href="/applications/ai-chat">
              AI Chat
            </Link>
            <Typography variant="body2">Settings</Typography>
          </Breadcrumbs>
        </Grid>
        <Grid size={{ xs: 12, md: "auto" }} className="lg:hidden">
          <Tooltip title="Table of Contents">
            <Button className="icon-only surface-standard" color="grey" variant="surface" onClick={toggleDrawer(true)}>
              <NiListCircle size={"medium"} />
            </Button>
          </Tooltip>
        </Grid>
      </Grid>

      <Grid size={12} container className="w-full items-start justify-start">
        <Grid size={"auto"} className="hidden pe-8 lg:flex">
          <MenuContent />
        </Grid>
        <Grid size={"grow"} spacing={5} container>
          <SettingsPublicInfo />
          <SettingsWork />
          <SettingsContact />
        </Grid>
      </Grid>

      <Drawer
        open={openDrawer}
        anchor="right"
        onClose={toggleDrawer(false)}
        slotProps={{ paper: { className: "MuiDrawer-paperAnchorRight" } }}
      >
        <Box className="min-w-80 p-7">
          <MenuContent />
        </Box>
      </Drawer>
    </Grid>
  );
}
