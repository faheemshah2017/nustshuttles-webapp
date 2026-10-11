const ROLES = ["admin", "manager", "viewer"];

function requireRole(allowedRoles) {
  return function (req, res, next) {
    if (!req.isAuthenticated()) {
      return res.redirect("/login");
    }
    if (!allowedRoles.includes(req.user.role)) {
      if (req.method === "GET") {
        if (req.flash) {
          req.flash("error", "You do not have permission to view that page.");
        }
        return res.redirect("/");
      }
      return res.status(403).send({ error: "Forbidden: insufficient permissions" });
    }
    next();
  };
}

module.exports = {
  ROLES,
  requireRole,
  requireAdmin: requireRole(["admin"]),
  requireEditor: requireRole(["admin", "manager"]),
};
