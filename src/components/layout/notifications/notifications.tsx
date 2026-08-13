import { getCategoryConfig } from "./notification-category-config";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useMemo } from "react";

import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardActions,
  Chip,
  ClickAwayListener,
  Fade,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  MenuList,
  PopoverVirtualElement,
  Popper,
  Skeleton,
  Tab,
  Tooltip,
  Typography,
} from "@mui/material";

import { type NotificationItem as NotificationItemData, useNotifications } from "@/hooks/use-notifications";
import NiBell from "@/icons/nexture/ni-bell";
import NiBellInactive from "@/icons/nexture/ni-bell-inactive";
import NiEllipsisHorizontal from "@/icons/nexture/ni-ellipsis-horizontal";
import NiScreen from "@/icons/nexture/ni-screen";
import NiSettings from "@/icons/nexture/ni-settings";
import NiStructure from "@/icons/nexture/ni-structure";
import NiUsers from "@/icons/nexture/ni-users";
import NextureIcons, { IconName } from "@/icons/nexture-icons";
import { cn } from "@/lib/utils";

type ChipData = {
  id: string;
  label?: string;
  image?: string;
};

type ActionData = {
  id: string;
  label?: string;
  type?: "positive" | "negative";
};

type NotificationData = {
  id: string;
  labelBold: string;
  labelRegular: string;
  type: "system" | "user";
  avatarImage?: string;
  avatarIcon?: string;
  avatarColorMain?: string;
  avatarColorBackground?: string;
  chips?: ChipData[];
  actions?: ActionData[];
  href?: string;
  time: string;
  temporaryUnread: boolean;
  markedUnread: boolean;
};

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? "s" : ""} ago`;
  return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
}

function toNotificationData(n: NotificationItemData): NotificationData {
  const config = n.type === "system" ? getCategoryConfig(n.category) : null;
  return {
    id: n.id,
    labelBold: n.title,
    labelRegular: n.message,
    type: n.type,
    avatarImage: n.actor?.profileImage || undefined,
    avatarIcon: config?.icon,
    avatarColorMain: config?.colorClass,
    avatarColorBackground: config?.backgroundClass,
    href: n.href || undefined,
    time: formatTimeAgo(n.createdAt),
    temporaryUnread: n.temporaryUnread,
    markedUnread: n.markedUnread,
  };
}

export default function Notifications() {
  const { notifications, unreadCount, loading, markOneAsRead, markOneAsUnread, markAllAsRead } = useNotifications();

  const notificationData = useMemo(() => notifications.map(toNotificationData), [notifications]);

  const router = useRouter();

  const [tooltipShow, setTooltipShow] = React.useState(false);

  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLButtonElement>(null);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: any) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
      return;
    }
    markAllAsRead();
    setOpen(false);
  };

  const [tabValue, setTabValue] = React.useState("1");

  const handleTabValueChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  const [notificationOn, setNotificationOn] = React.useState(true);

  const handleClick = (href: string | undefined, event: any) => {
    if (href) {
      router.push(href);
    }
    handleClose(event);
  };

  return (
    <>
      <Tooltip title="Notifications" placement="bottom" arrow open={!open && tooltipShow}>
        <Badge
          badgeContent={unreadCount}
          color="primary"
          slotProps={{
            badge: { className: "ltr:right-2! rtl:left-2! top-2 pointer-events-none" },
          }}
        >
          <Button
            variant="text"
            size="large"
            color="text-primary"
            className={cn(
              "icon-only hover-icon-shrink [&.active]:text-primary! hover:bg-grey-25",
              open && "active bg-grey-25",
            )}
            onClick={handleToggle}
            onMouseEnter={() => setTooltipShow(true)}
            onMouseLeave={() => setTooltipShow(false)}
            ref={anchorRef}
            startIcon={
              notificationOn ? (
                <NiBell size="large" variant={open ? "contained" : "outlined"} />
              ) : (
                <NiBellInactive size="large" variant={open ? "contained" : "outlined"} />
              )
            }
          />
        </Badge>
      </Tooltip>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        placement="bottom-end"
        className="mt-3!"
        transition
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps}>
            <Box>
              <ClickAwayListener onClickAway={handleClose}>
                <Card className="shadow-darker-sm! w-xs md:w-sm">
                  <Box className="flex flex-1 flex-row items-start justify-between pe-4">
                    <Typography variant="h6" component="h6" className="card-title px-4 pt-4">
                      Notifications
                    </Typography>
                    <Box className="flex flex-row">
                      <Tooltip title={notificationOn ? "Turn off" : "Turn on"} arrow>
                        {notificationOn ? (
                          <Button
                            className="icon-only mt-3"
                            size="small"
                            color="grey"
                            variant="text"
                            startIcon={<NiBell size={"small"} />}
                            onClick={() => {
                              setNotificationOn((prevValue) => !prevValue);
                            }}
                          />
                        ) : (
                          <Button
                            className="icon-only mt-3"
                            size="small"
                            color="grey"
                            variant="text"
                            startIcon={<NiBellInactive size={"small"} />}
                            onClick={() => {
                              setNotificationOn((prevValue) => !prevValue);
                            }}
                          />
                        )}
                      </Tooltip>
                      <Button
                        className="icon-only mt-3"
                        size="small"
                        color="grey"
                        variant="text"
                        startIcon={<NiSettings size={"small"} />}
                        href="/settings"
                        component={Link}
                      />
                    </Box>
                  </Box>
                  <TabContext value={tabValue}>
                    <TabList className="mb-5 px-4" onChange={handleTabValueChange}>
                      <Tab
                        icon={<NiStructure size="tiny" />}
                        iconPosition="start"
                        label="All"
                        className="tiny"
                        value="1"
                      />
                      <Tab
                        icon={<NiScreen size="tiny" />}
                        iconPosition="start"
                        label="System"
                        className="tiny"
                        value="2"
                      />
                      <Tab
                        icon={<NiUsers size="tiny" />}
                        iconPosition="start"
                        label="User"
                        className="tiny"
                        value="3"
                      />
                    </TabList>
                    <TabPanel value="1" className="mb-4 p-0">
                      <List className="max-h-96 overflow-auto">
                        {loading ? (
                          <NotificationSkeleton />
                        ) : notificationData.length === 0 ? (
                          <EmptyState />
                        ) : (
                          notificationData.map((notification: NotificationData) => (
                            <NotificationItem
                              key={notification.id}
                              {...notification}
                              onMarkAsRead={() => {
                                markOneAsRead(notification.id);
                              }}
                              onMarkAsUnread={() => {
                                markOneAsUnread(notification.id);
                              }}
                              onClick={(event) => {
                                handleClick(notification.href, event);
                              }}
                            />
                          ))
                        )}
                      </List>
                    </TabPanel>
                    <TabPanel value="2" className="mb-4 p-0">
                      <List className="max-h-96 overflow-auto">
                        {loading ? (
                          <NotificationSkeleton />
                        ) : (
                          <>
                            {notificationData.filter((n) => n.type === "system").length === 0 ? (
                              <EmptyState />
                            ) : (
                              notificationData
                                .filter((notification) => notification.type === "system")
                                .map((notification: NotificationData) => (
                                  <NotificationItem
                                    key={notification.id}
                                    {...notification}
                                    onMarkAsRead={() => {
                                      markOneAsRead(notification.id);
                                    }}
                                    onMarkAsUnread={() => {
                                      markOneAsUnread(notification.id);
                                    }}
                                    onClick={(event) => {
                                      handleClick(notification.href, event);
                                    }}
                                  />
                                ))
                            )}
                          </>
                        )}
                      </List>
                    </TabPanel>
                    <TabPanel value="3" className="mb-4 p-0">
                      <List className="max-h-96 overflow-auto">
                        {loading ? (
                          <NotificationSkeleton />
                        ) : (
                          <>
                            {notificationData.filter((n) => n.type === "user").length === 0 ? (
                              <EmptyState />
                            ) : (
                              notificationData
                                .filter((notification) => notification.type === "user")
                                .map((notification: NotificationData) => (
                                  <NotificationItem
                                    key={notification.id}
                                    {...notification}
                                    onMarkAsRead={() => {
                                      markOneAsRead(notification.id);
                                    }}
                                    onMarkAsUnread={() => {
                                      markOneAsUnread(notification.id);
                                    }}
                                    onClick={(event) => {
                                      handleClick(notification.href, event);
                                    }}
                                  />
                                ))
                            )}
                          </>
                        )}
                      </List>
                    </TabPanel>
                  </TabContext>

                  <CardActions disableSpacing>
                    <Button
                      variant="outlined"
                      size="tiny"
                      color="grey"
                      className="w-full"
                      component={Link}
                      href="/recent-activity"
                    >
                      View All
                    </Button>
                  </CardActions>
                </Card>
              </ClickAwayListener>
            </Box>
          </Fade>
        )}
      </Popper>
    </>
  );
}

function NotificationItem({
  id,
  labelBold,
  labelRegular,
  type,
  avatarImage,
  avatarIcon,
  avatarColorMain,
  avatarColorBackground,
  href,
  time,
  temporaryUnread,
  markedUnread,
  chips,
  actions,
  onMarkAsRead,
  onMarkAsUnread,
  onClick,
}: NotificationData & {
  onMarkAsRead: () => void;
  onMarkAsUnread: () => void;
  onClick: (event: any) => void;
}) {
  const [anchorElEllipsis, setAnchorElEllipsis] = React.useState<EventTarget | Element | PopoverVirtualElement | null>(
    null,
  );
  const open = Boolean(anchorElEllipsis);

  const handleClickEllipsis = (event: Event | React.SyntheticEvent) => {
    setAnchorElEllipsis(event.currentTarget);
  };

  const handleCloseEllipsis = () => {
    setAnchorElEllipsis(null);
  };

  const handleMarkAsRead = () => {
    handleCloseEllipsis();
    onMarkAsRead();
  };

  const handleMarkAsUnread = () => {
    handleCloseEllipsis();
    onMarkAsUnread();
  };

  return (
    <>
      <Menu
        anchorEl={anchorElEllipsis as Element}
        open={open}
        onClose={handleCloseEllipsis}
        className="mt-1"
        slots={{
          transition: Fade,
        }}
      >
        <MenuList dense>
          {markedUnread && <MenuItem onClick={handleMarkAsRead}>Mark as Read</MenuItem>}
          {!markedUnread && <MenuItem onClick={handleMarkAsUnread}>Mark as Unread</MenuItem>}
        </MenuList>
      </Menu>
      <ListItem key={id} className="group relative px-4 py-0">
        <ListItemButton
          onClick={(event) => {
            event.preventDefault();
            onClick(event);
          }}
          classes={{ root: cn("w-full items-start", (temporaryUnread || markedUnread) && "bg-primary-dark/5") }}
          LinkComponent={href ? Link : Box}
          href={href ? href : "#"}
        >
          <ListItemAvatar>
            {type === "user" ? (
              <Avatar alt="notificaiton avatar" src={avatarImage} className="me-3" />
            ) : (
              <Avatar className={cn("medium me-3", avatarColorBackground)}>
                <NextureIcons icon={avatarIcon as IconName} className={avatarColorMain} />
              </Avatar>
            )}
          </ListItemAvatar>
          <Box className="flex flex-col items-start gap-2">
            <ListItemText
              className="pe-8"
              primary={
                <Typography component="span" className="leading-4">
                  <Typography component="span" variant="subtitle1" className="leading-4">
                    {labelBold}
                  </Typography>{" "}
                  <Typography component="span" variant="body1" className="leading-4">
                    {labelRegular}
                  </Typography>
                </Typography>
              }
              secondary={time}
            />
            {chips && (
              <Box className="flex flex-row gap-1">
                {chips.map((chip) => {
                  if (chip.image) {
                    return (
                      <Chip
                        size="small"
                        avatar={<Avatar alt="product" src={chip.image} />}
                        label={chip.label}
                        variant="outlined"
                        key={chip.id}
                      />
                    );
                  } else {
                    return <Chip variant="outlined" label={chip.label} size="small" key={chip.id} />;
                  }
                })}
              </Box>
            )}

            {actions && (
              <Box className="flex flex-row gap-1">
                {actions.map((action) => {
                  if (action.type === "positive") {
                    return (
                      <Button size="tiny" color="primary" variant="contained" key={action.id}>
                        {action.label}
                      </Button>
                    );
                  } else {
                    return (
                      <Button size="tiny" color="primary" variant="text" key={action.id}>
                        {action.label}
                      </Button>
                    );
                  }
                })}
              </Box>
            )}
          </Box>
        </ListItemButton>
        <Button
          className={cn(
            "icon-only hover:text-text-primary hover:bg-grey-100 absolute inset-e-6 top-2 flex-none opacity-0 group-hover:opacity-100",
            anchorElEllipsis && "bg-grey-100 text-text-primary opacity-100",
          )}
          size="tiny"
          color="grey"
          variant="text"
          startIcon={<NiEllipsisHorizontal size={"small"} />}
          onClick={handleClickEllipsis}
        />
      </ListItem>
    </>
  );
}

function EmptyState() {
  return (
    <Box className="flex flex-col items-center justify-center px-4 py-8">
      <Typography variant="body2" color="text.secondary" align="center">
        No notifications to show.
      </Typography>
    </Box>
  );
}

function NotificationSkeleton() {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <ListItem key={i} className="px-4 py-2">
          <ListItemAvatar>
            <Skeleton variant="circular" width={40} height={40} className="me-3" />
          </ListItemAvatar>
          <Box className="flex w-full flex-col gap-1">
            <Skeleton variant="text" width="60%" height={20} />
            <Skeleton variant="text" width="90%" height={16} />
            <Skeleton variant="text" width="30%" height={14} />
          </Box>
        </ListItem>
      ))}
    </>
  );
}
