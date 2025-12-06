export const permissions = [
  // User Management
  { name: "user.create", desc: "Create new users" },
  { name: "user.read", desc: "View users" },
  { name: "user.update", desc: "Update users" },
  { name: "user.delete", desc: "Delete users" },

  // Role Management
  { name: "role.create", desc: "Create new roles" },
  { name: "role.read", desc: "View roles" },
  { name: "role.update", desc: "Update roles" },
  { name: "role.delete", desc: "Delete roles" },

  // Permission Management
  { name: "permission.read", desc: "View permissions" },

  // System Administration
  { name: "system.settings", desc: "Manage system settings" },
  { name: "system.monitor", desc: "Monitor system health" },

  // Content Management
  { name: "content.create", desc: "Create content" },
  { name: "content.read", desc: "View content" },
  { name: "content.update", desc: "Update content" },
  { name: "content.delete", desc: "Delete content" },
];
