"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { PropsWithChildren, useEffect, useMemo, useState } from "react";

import { useLayoutContext } from "@/components/layout/layout-context";
import { isAdminUser } from "@/lib/auth";
import { isPathMatch } from "@/lib/utils";
import { leftMenuItems } from "@/menu-items";
import { leftMenuBottomItems } from "@/menu-items";
import { MenuShowState } from "@/types";
import { MenuItem } from "@/types";

export default function Main({ children }: PropsWithChildren) {
  const { leftPrimaryCurrent, leftSecondaryCurrent, leftMenuWidth } = useLayoutContext();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAdminViewingUserChat = Boolean(searchParams.get("userId")) && isAdminUser() && pathname.includes("/ask-ava");

  useEffect(() => {
    setMounted(true);
  }, []);

  const [activeItem, setActiveItem] = useState<MenuItem | undefined>(undefined);

  useEffect(() => {
    const visibleMenuItems: MenuItem[] = leftMenuItems.map((item) => ({
      ...item,
      children: item.children?.filter((child) => !child.adminOnly || isAdminUser()),
    }));

    if (isAdminViewingUserChat) {
      setActiveItem(visibleMenuItems.find((item) => item.id === "users"));
      return;
    }

    let selectedMenu = visibleMenuItems.find(
      (item) =>
        (item.href && isPathMatch(pathname, item.href)) ||
        item.children?.some((child) => child.href && isPathMatch(pathname, child.href)),
    );
    if (!selectedMenu && leftMenuBottomItems) {
      selectedMenu = leftMenuBottomItems.find((item) => item.href && isPathMatch(pathname, item.href));
    }
    setActiveItem(selectedMenu);
  }, [pathname, isAdminViewingUserChat]);

  const [mainPadding] = useMemo(() => {
    if (!mounted) return [0];

    let mainPadding = 0;

    if (leftPrimaryCurrent === MenuShowState.Show) {
      mainPadding += leftMenuWidth.primary;
    }
    if (leftSecondaryCurrent === MenuShowState.Show && activeItem?.children && leftMenuWidth.secondary > 0) {
      mainPadding += leftMenuWidth.secondary;
    }

    return [mainPadding];
  }, [leftPrimaryCurrent, leftSecondaryCurrent, leftMenuWidth, mounted, activeItem]);

  const styles = useMemo(
    () => ({
      width: "100%",
      paddingInlineStart: `calc(${mainPadding}px`,
    }),
    [mainPadding],
  );

  return (
    <main className="flex h-full min-h-0 w-full flex-col pt-16 duration-(--layout-duration)" style={styles}>
      {children}
    </main>
  );
}
