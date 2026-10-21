import { describe, it, expect, vi } from "vitest";
import {
  permissionsFor,
  hasPermission,
  ROLE_PERMISSIONS,
} from "../../constants/permissions.js";
import { createUserService } from "./user.service.js";

describe("Permissions and Accessibility", () => {
  it("grants wildcard access to ADMIN", () => {
    const adminUser = { id: 1, role: "ADMIN", permissions: [] };
    expect(permissionsFor(adminUser)).toEqual(["*"]);
    expect(hasPermission(adminUser, "dashboard:read")).toBe(true);
    expect(hasPermission(adminUser, "any:random:permission")).toBe(true);
  });

  it("uses role defaults when user permissions are empty", () => {
    const consultant = { id: 2, role: "SALES_CONSULTANT", permissions: [] };
    const perms = permissionsFor(consultant);
    expect(perms).toEqual(ROLE_PERMISSIONS.SALES_CONSULTANT);
    expect(hasPermission(consultant, "customer:read")).toBe(true);
    expect(hasPermission(consultant, "quote:approve")).toBe(false);
  });

  it("uses customized user permissions when set by admin via checkboxes", () => {
    const customUser = {
      id: 3,
      role: "SALES_CONSULTANT",
      permissions: ["customer:read", "quote:approve"],
    };
    expect(hasPermission(customUser, "quote:approve")).toBe(true);
    expect(hasPermission(customUser, "order:read")).toBe(false);
  });
});

describe("User Service Accessibility Management", () => {
  it("updates role and permissions via tick/untick input", async () => {
    const mockRepo = {
      findById: vi.fn().mockResolvedValue({
        id: 10,
        name: "Test User",
        email: "test@example.com",
        role: "SALES_CONSULTANT",
        permissions: [],
        isActive: true,
      }),
      updateAccessibility: vi.fn().mockImplementation((id, data) => ({
        id,
        name: "Test User",
        email: "test@example.com",
        role: data.role || "SALES_CONSULTANT",
        permissions: data.permissions || [],
        isActive: data.isActive !== undefined ? data.isActive : true,
      })),
    };

    const mockAudit = { log: vi.fn() };
    const service = createUserService(mockRepo, mockAudit);

    const actor = { id: 1, role: "ADMIN" };
    const result = await service.updateAccessibility(actor, 10, {
      role: "SALES_MANAGER",
      permissions: ["customer:read", "customer:write", "quote:approve"],
      isActive: true,
    });

    expect(result.role).toBe("SALES_MANAGER");
    expect(result.permissions).toEqual(["customer:read", "customer:write", "quote:approve"]);
    expect(result.effectivePermissions).toEqual(["customer:read", "customer:write", "quote:approve"]);
    expect(mockAudit.log).toHaveBeenCalled();
  });

  it("prevents self-deactivation by an administrator", async () => {
    const mockRepo = {
      findById: vi.fn().mockResolvedValue({
        id: 1,
        name: "Admin User",
        email: "admin@example.com",
        role: "ADMIN",
        isActive: true,
      }),
    };
    const service = createUserService(mockRepo);
    const actor = { id: 1, role: "ADMIN" };

    await expect(
      service.updateAccessibility(actor, 1, { isActive: false })
    ).rejects.toMatchObject({ code: "CANNOT_DEACTIVATE_SELF" });
  });
});
