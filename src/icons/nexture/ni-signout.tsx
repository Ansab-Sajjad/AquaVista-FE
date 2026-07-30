

import { NextureIconsProps, sizeHelper } from "../nexture-icons";
import { useThemeContext } from "@/theme/theme-provider";

const NiSignOut = ({ className, size = "medium" }: NextureIconsProps) => {
  const { isDarkMode } = useThemeContext();
  const iconSize = sizeHelper(size);
  const iconSrc = isDarkMode ? "/images/icons/Signout-white.png" : "/images/icons/Signout-black.png";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      className={className}
      width={iconSize}
      height={iconSize}
      viewBox="0 0 24 24"
      fill="none"
    >
      <image xlinkHref={iconSrc} width={iconSize} height={iconSize} preserveAspectRatio="xMidYMid meet" />
    </svg>
  );
};

export default NiSignOut;