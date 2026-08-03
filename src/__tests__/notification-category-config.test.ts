import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

import { getCategoryConfig } from "@/components/layout/notifications/notification-category-config";
import type { NotificationCategory } from "@/hooks/use-notifications";

const ALL_CATEGORIES: NotificationCategory[] = [
  "file_uploaded",
  "file_upload_complete",
  "file_upload_failed",
  "member_added",
  "member_removed",
  "project_created",
];

// Feature: notification-system, Property 12: Category-to-icon mapping is total
describe("Property 12: Category-to-icon mapping is total", () => {
  it("getCategoryConfig returns a non-null config with truthy icon and colorClass for every category", () => {
    fc.assert(
      fc.property(fc.constantFrom(...ALL_CATEGORIES), (category) => {
        const config = getCategoryConfig(category);
        expect(config).not.toBeNull();
        expect(config).toBeDefined();
        expect(config.icon).toBeTruthy();
        expect(config.colorClass).toBeTruthy();
      }),
      { numRuns: 100 },
    );
  });
});
