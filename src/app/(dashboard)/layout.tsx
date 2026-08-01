"use client";
import "@/style/global.css";

import { Suspense, useEffect, useState } from "react";

import { LicenseInfo } from "@mui/x-license";

import Loading from "@/app/loading";
import ContentWrapper from "@/components/layout/containers/content-wrapper";
import Header from "@/components/layout/containers/header";
import Main from "@/components/layout/containers/main";
import LeftMenu from "@/components/layout/menu/left-menu";
import MenuBackdrop from "@/components/layout/menu/menu-backdrop";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { isAuthenticated } from "@/lib/auth";

LicenseInfo.setLicenseKey(process.env.NEXT_PUBLIC_MUI_X_LICENSE_KEY || "");

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isMounted, setIsMounted] = useState(false);
  useAuthGuard();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  if (!isAuthenticated()) {
    return <Loading />;
  }

  return (
    <>
      <Header />
      <LeftMenu />
      <Main>
        <ContentWrapper>
          <Suspense fallback={<Loading />}>{children}</Suspense>
        </ContentWrapper>
      </Main>
      <MenuBackdrop />
    </>
  );
}
