"use client";

import React from "react";

import { Box, Button, Portal } from "@mui/material";

export default function PortalNoContainer() {
  const [show, setShow] = React.useState(false);

  const handleClick = () => {
    setShow(!show);
  };

  return (
    <>
      <Button variant="pastel" onClick={handleClick}>
        {show ? "Unmount children" : "Mount children"}
      </Button>
      {show ? (
        <Portal>
          <Box className="bg-background-paper fixed inset-s-1/2 top-1/2 z-50 -translate-1/2 rounded-3xl p-7 shadow-sm">
            Rendered here!
          </Box>
        </Portal>
      ) : null}
    </>
  );
}
