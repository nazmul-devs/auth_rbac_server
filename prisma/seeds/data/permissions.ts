export const permissions = [
  // User Management
  { resource: "user", action: "create", desc: "Create new users" },
  { resource: "user", action: "read", desc: "View users" },
  { resource: "user", action: "update", desc: "Update users" },
  { resource: "user", action: "delete", desc: "Delete users" },

  // Role Management
  { resource: "role", action: "create", desc: "Create new roles" },
  { resource: "role", action: "read", desc: "View roles" },
  { resource: "role", action: "update", desc: "Update roles" },
  { resource: "role", action: "delete", desc: "Delete roles" },

  // Permission Management
  { resource: "permission", action: "read", desc: "View permissions" },

  // System Administration
  { resource: "system", action: "settings", desc: "Manage system settings" },
  { resource: "system", action: "monitor", desc: "Monitor system health" },

  // Content Management
  { resource: "content", action: "create", desc: "Create content" },
  { resource: "content", action: "read", desc: "View content" },
  { resource: "content", action: "update", desc: "Update content" },
  { resource: "content", action: "delete", desc: "Delete content" },
];
