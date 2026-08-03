"use client";

import SettingsMenu from "../components/settings-menu";
import Link from "next/link";
import { useState } from "react";

import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Divider,
  Drawer,
  Grid,
  Tooltip,
  Typography,
} from "@mui/material";

import { useTranslations } from "next-intl";

import NiListCircle from "@/icons/nexture/ni-list-circle";
import NiArrowCircleLeft from "@/icons/nexture/ni-arrow-circle-left";
import NiPalette from "@/icons/nexture/ni-palette";
import NiScreen from "@/icons/nexture/ni-screen";
import NiSun from "@/icons/nexture/ni-sun";
import NiMoon from "@/icons/nexture/ni-moon";
import NiMenuSplitDot from "@/icons/nexture/ni-menu-split-dot";
import NiMenuSplit from "@/icons/nexture/ni-menu-split";
import NiMenu from "@/icons/nexture/ni-menu";
import NiChevronLeftRightReverseSmall from "@/icons/nexture/ni-chevron-left-right-reverse-small";
import NiChevronLeftRightSmall from "@/icons/nexture/ni-chevron-left-right-small";
import { RadiobuttonSmallChecked, RadiobuttonSmallEmptyOutlined } from "@/icons/form/mui-radiobutton";

import { DEFAULTS } from "@/config";
import { ModeVariant, THEME_OPTIONS } from "@/constants";
import { useLayoutContext } from "@/components/layout/layout-context";
import { cn } from "@/lib/utils";
import { useThemeContext } from "@/theme/theme-provider";
import { ContentType, MenuType } from "@/types";

export default function ConfigurationPage() {
  const [openDrawer, setOpenDrawer] = useState(false);
  const t = useTranslations("dashboard");

  const { theme, setTheme, mode, setMode, content, setContent } = useThemeContext();
  const { leftMenuType, setLeftMenuType } = useLayoutContext();

  const handleResetTheme = () => {
    setTheme(DEFAULTS.themeColor);
    setMode(DEFAULTS.themeMode);
    setContent(DEFAULTS.contentType);
    setLeftMenuType(DEFAULTS.leftMenuType);
  };

  const themeModeOptions = [
    { value: "system" as ModeVariant, icon: <NiScreen /> },
    { value: "light" as ModeVariant, icon: <NiSun /> },
    { value: "dark" as ModeVariant, icon: <NiMoon /> },
  ];

  const leftMenuOptions = [
    { value: MenuType.Minimal, icon: <NiMenuSplitDot /> },
    { value: MenuType.Comfort, icon: <NiMenuSplit /> },
    { value: MenuType.SingleLayer, icon: <NiMenu /> },
  ];

  const contentOptions = [
    { value: ContentType.Boxed, icon: <NiChevronLeftRightReverseSmall /> },
    { value: ContentType.Fluid, icon: <NiChevronLeftRightSmall /> },
  ];

  return (
    <Grid container spacing={5} className="items-start">
      <Grid size={"auto"} className="hidden pe-8 lg:flex">
        <SettingsMenu />
      </Grid>

      <Grid size={"grow"} spacing={5} container>
        <Grid size={12} spacing={2.5} container>
          <Grid size={{ xs: 12, md: "grow" }}>
            <Typography variant="h1" component="h1" className="mb-0">
              Configuration
            </Typography>
            <Breadcrumbs>
              <Link color="inherit" href="/overview">
                Overview
              </Link>
              <Link color="inherit" href="/settings">
                Settings
              </Link>
              <Typography variant="body2">Configuration</Typography>
            </Breadcrumbs>
          </Grid>
          <Grid size={{ xs: 12, md: "auto" }} className="lg:hidden">
            <Tooltip title="Table of Contents">
              <Button
                className="icon-only surface-standard"
                color="grey"
                variant="surface"
                onClick={() => setOpenDrawer(true)}
              >
                <NiListCircle size={"medium"} />
              </Button>
            </Tooltip>
          </Grid>
        </Grid>

        <Grid size={12}>
          <Card>
            <CardContent>
              <Box className="flex flex-col gap-2">
                <Typography variant="body2" className="font-semibold" component="div">
                  {t("palette")}
                </Typography>
                <Box className="flex flex-col gap-2">
                  {Object.values(THEME_OPTIONS).map((option) => (
                    <Button
                      key={`theme-color-${option}`}
                      className={cn(
                        "full-width-button hover:bg-grey-25! flex justify-between shadow-none! outline-none!",
                        option,
                        theme === option && "active bg-grey-25!",
                      )}
                      variant="surface"
                      startIcon={<NiPalette />}
                      onClick={() => setTheme(option)}
                    >
                      {t(option)}
                      <span className={cn("flex flex-1 justify-end", theme !== option && "text-grey-200")}>
                        {theme === option && <RadiobuttonSmallChecked />}
                        {theme !== option && <RadiobuttonSmallEmptyOutlined />}
                      </span>
                    </Button>
                  ))}
                </Box>
                <Divider />
                <Typography variant="body2" component="div" className="font-semibold">
                  {t("mode")}
                </Typography>
                <Box className="flex flex-col gap-2">
                  {themeModeOptions.map((option) => (
                    <Button
                      key={`theme-mode-${option.value}`}
                      className={cn(
                        "full-width-button hover:bg-grey-25! flex justify-between shadow-none! outline-none!",
                        mode === option.value && "active bg-grey-25!",
                      )}
                      variant="surface"
                      color={mode === option.value ? "primary" : "text-primary"}
                      startIcon={option.icon}
                      onClick={() => setMode(option.value)}
                    >
                      {t(`mode-${option.value}`)}
                      <span className={cn("flex flex-1 justify-end", mode !== option.value && "text-grey-200")}>
                        {mode === option.value && <RadiobuttonSmallChecked />}
                        {mode !== option.value && <RadiobuttonSmallEmptyOutlined />}
                      </span>
                    </Button>
                  ))}
                </Box>

                <Divider />
                <Typography variant="body2" component="div" className="font-semibold">
                  {t("left-menu")}
                </Typography>
                <Box className="flex flex-col gap-2">
                  {leftMenuOptions.map((option) => (
                    <Button
                      key={`theme-left-menu-${option.value}`}
                      className={cn(
                        "full-width-button hover:bg-grey-25! flex justify-between shadow-none! outline-none!",
                        leftMenuType === option.value && "active bg-grey-25!",
                      )}
                      variant="surface"
                      color={leftMenuType === option.value ? "primary" : "text-primary"}
                      startIcon={option.icon}
                      onClick={() => setLeftMenuType(option.value)}
                    >
                      {t(`menu-${option.value}`)}
                      <span className={cn("flex flex-1 justify-end", leftMenuType !== option.value && "text-grey-200")}>
                        {leftMenuType === option.value && <RadiobuttonSmallChecked />}
                        {leftMenuType !== option.value && <RadiobuttonSmallEmptyOutlined />}
                      </span>
                    </Button>
                  ))}
                </Box>

                <Divider />
                <Typography variant="body2" component="div" className="font-semibold">
                  {t("content")}
                </Typography>
                <Box className="flex flex-col gap-2">
                  {contentOptions.map((option) => (
                    <Button
                      key={`theme-content-${option.value}`}
                      className={cn(
                        "full-width-button hover:bg-grey-25! flex justify-between shadow-none! outline-none!",
                        content === option.value && "active bg-grey-25!",
                      )}
                      variant="surface"
                      color={content === option.value ? "primary" : "text-primary"}
                      startIcon={option.icon}
                      onClick={() => setContent(option.value)}
                    >
                      {t(`content-${option.value}`)}
                      <span className={cn("flex flex-1 justify-end", content !== option.value && "text-grey-200")}>
                        {content === option.value && <RadiobuttonSmallChecked />}
                        {content !== option.value && <RadiobuttonSmallEmptyOutlined />}
                      </span>
                    </Button>
                  ))}
                </Box>
                <Box className="mt-4 flex w-full">
                  <Button
                    variant="outlined"
                    size="small"
                    color="grey"
                    startIcon={<NiArrowCircleLeft size="small" />}
                    className="w-full"
                    onClick={() => handleResetTheme()}
                  >
                    {t("reset-theme")}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Drawer
        open={openDrawer}
        anchor="right"
        onClose={() => setOpenDrawer(false)}
        slotProps={{ paper: { className: "MuiDrawer-paperAnchorRight" } }}
      >
        <Box className="min-w-80 p-7">
          <SettingsMenu />
        </Box>
      </Drawer>
    </Grid>
  );
}
