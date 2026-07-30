"use client";

import SettingsPublicInfo from "./components/settings-public-info";
import SettingsMenu from "./components/settings-menu";
import Link from "next/link";
import { useState } from "react";

import { Box, Breadcrumbs, Button, Drawer, Grid, Tooltip, Typography } from "@mui/material";

import NiListCircle from "@/icons/nexture/ni-list-circle";

const MenuContent = () => <SettingsMenu />;

export default function Settings() {
  const [openDrawer, setOpenDrawer] = useState(false);

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpenDrawer(newOpen);
  };

  return (
    <Grid container spacing={5} className="items-start">
      <Grid size={"auto"} className="hidden pe-8 lg:flex">
        <MenuContent />
      </Grid>
      <Grid size={"grow"} spacing={5} container>
        <Grid size={12} spacing={2.5} container>
          <Grid size={{ xs: 12, md: "grow" }}>
            <Typography variant="h1" component="h1" className="mb-0">
              Profile
            </Typography>
            <Breadcrumbs>
              <Link color="inherit" href="/projects">
                Projects
              </Link>
              <Link color="inherit" href="/settings">
                Settings
              </Link>
              <Typography variant="body2">Profile</Typography>
            </Breadcrumbs>
          </Grid>
          <Grid size={{ xs: 12, md: "auto" }} className="lg:hidden">
            <Tooltip title="Table of Contents">
              <Button
                className="icon-only surface-standard"
                color="grey"
                variant="surface"
                onClick={toggleDrawer(true)}
              >
                <NiListCircle size={"medium"} />
              </Button>
            </Tooltip>
          </Grid>
        </Grid>

        <SettingsPublicInfo />

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
    </Grid>
  );
}
