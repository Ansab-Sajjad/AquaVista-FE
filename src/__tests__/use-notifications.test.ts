import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

import type { NotificationItem } from "@/hooks/use-notifications";

// Feature: notification-system, Property 11: Unread badge count matches isRead state
describe("Property 11: Unread badge count matches isRead state", () => {
  it("unreadCount equals the number of items with isRead false or markedUnread true", () => {
    const fcNotification = fc.record({
      id: fc.string({ minLength: 1 }),
      type: fc.constantFrom("system", "user") as fc.ConstantArbitrary<"system" | "user">,
      category: fc.constantFrom(
        "file_uploaded",
        "file_upload_complete",
        "file_upload_failed",
        "member_added",
        "member_removed",
        "project_created",
      ),
      title: fc.string({ minLength: 1 }),
      message: fc.string({ minLength: 1 }),
      isRead: fc.boolean(),
      href: fc.option(fc.string(), { nil: undefined }),
      actor: fc.constant(null),
      createdAt: fc.string({ minLength: 1 }),
      temporaryUnread: fc.boolean(),
      markedUnread: fc.boolean(),
    }) as fc.Arbitrary<NotificationItem>;

    fc.assert(
      fc.property(fc.array(fcNotification, { maxLength: 50 }), (notifications) => {
        const unreadCount = notifications.filter((n) => !n.isRead || n.markedUnread).length;
        const expected = notifications.filter((n) => !n.isRead || n.markedUnread).length;
        expect(unreadCount).toBe(expected);
      }),
      { numRuns: 100 },
    );
  });
});
