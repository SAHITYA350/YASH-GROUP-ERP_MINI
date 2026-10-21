import {
  AVAILABLE_ROLES,
  PERMISSION_MODULES,
  ROLE_PERMISSIONS,
  permissionsFor,
} from "../../constants/permissions.js";
import { fail } from "../../utils/http.js";

const VALID_ROLES = AVAILABLE_ROLES.map((r) => r.value);

export const createUserService = (userRepo, auditService) => ({
  getUsers: async ({ search } = {}) => {
    const users = await userRepo.findAll({ search });
    return users.map((user) => ({
      ...user,
      permissions: Array.isArray(user.permissions) ? user.permissions : [],
      effectivePermissions: permissionsFor(user),
    }));
  },

  getUserById: async (id) => {
    const user = await userRepo.findById(id);
    if (!user) throw fail(404, "User not found", "NOT_FOUND");
    return {
      ...user,
      permissions: Array.isArray(user.permissions) ? user.permissions : [],
      effectivePermissions: permissionsFor(user),
    };
  },

  getAccessibilityMeta: async () => {
    return {
      roles: AVAILABLE_ROLES,
      modules: PERMISSION_MODULES,
      roleDefaults: ROLE_PERMISSIONS,
    };
  },

  updateAccessibility: async (actor, id, input) => {
    const user = await userRepo.findById(id);
    if (!user) throw fail(404, "User not found", "NOT_FOUND");

    // Prevent admin from deactivating or demoting themselves
    if (actor.id === id) {
      if (input.isActive === false) {
        throw fail(400, "You cannot deactivate your own account", "CANNOT_DEACTIVATE_SELF");
      }
      if (input.role && input.role !== "ADMIN" && actor.role === "ADMIN") {
        throw fail(400, "You cannot remove your own administrator role", "CANNOT_DEMOTE_SELF");
      }
    }

    const dataToUpdate = {};

    if (input.role !== undefined) {
      if (!VALID_ROLES.includes(input.role)) {
        throw fail(400, `Invalid role: ${input.role}`, "INVALID_ROLE");
      }
      dataToUpdate.role = input.role;
    }

    if (input.permissions !== undefined) {
      if (!Array.isArray(input.permissions)) {
        throw fail(400, "Permissions must be an array of strings", "INVALID_PERMISSIONS");
      }
      dataToUpdate.permissions = input.permissions;
    }

    if (input.isActive !== undefined) {
      dataToUpdate.isActive = Boolean(input.isActive);
    }

    const updatedUser = await userRepo.updateAccessibility(id, dataToUpdate);

    if (auditService) {
      await auditService.log(
        null,
        actor.id,
        "USER_ACCESSIBILITY_UPDATED",
        "User",
        id,
        {
          before: {
            role: user.role,
            isActive: user.isActive,
            permissions: user.permissions,
          },
          after: dataToUpdate,
        }
      );
    }

    return {
      ...updatedUser,
      permissions: Array.isArray(updatedUser.permissions) ? updatedUser.permissions : [],
      effectivePermissions: permissionsFor(updatedUser),
    };
  },
});
