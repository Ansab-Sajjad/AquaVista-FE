import type { IconName } from "@/icons/nexture-icons";
import type { NotificationCategory } from "@/hooks/use-notifications";

export interface CategoryConfig {
  icon: IconName;
  colorClass: string;
  backgroundClass: string;
}

const CATEGORY_CONFIG: Record<NotificationCategory, CategoryConfig> = {
  file_uploaded: {
    icon: "NiUploadCloud",
    colorClass: "text-info",
    backgroundClass: "bg-info-light/10",
  },
  file_upload_complete: {
    icon: "NiCheckFull",
    colorClass: "text-success",
    backgroundClass: "bg-success-light/10",
  },
  file_upload_failed: {
    icon: "NiExclamationSquare",
    colorClass: "text-error",
    backgroundClass: "bg-error-light/10",
  },
  member_added: {
    icon: "NiUserPlus",
    colorClass: "text-primary",
    backgroundClass: "bg-primary-light/10",
  },
  member_removed: {
    icon: "NiUserCross",
    colorClass: "text-grey-400",
    backgroundClass: "bg-grey-100/10",
  },
  project_created: {
    icon: "NiStructure",
    colorClass: "text-primary",
    backgroundClass: "bg-primary-light/10",
  },
};

export function getCategoryConfig(category: NotificationCategory): CategoryConfig {
  return CATEGORY_CONFIG[category];
}
