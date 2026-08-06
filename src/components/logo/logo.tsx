import { Box, Typography } from "@mui/material";

import { cn } from "@/lib/utils";

export default function Logo({ classNameFull, classNameMobile }: { classNameFull?: string; classNameMobile?: string }) {
  const LogoText = ({ className }: { className?: string }) => (
    <Box className={cn("flex items-center gap-1", className)}>
      <Typography variant="h3" component="span" className="text-text-primary font-bold">
        Aqua
      </Typography>
      <Typography variant="h3" component="span" className="text-primary font-bold">
        Vista
      </Typography>
    </Box>
  );

  return (
    <>
      <LogoText className={classNameFull} />
      <LogoText className={classNameMobile} />
    </>
  );
}
