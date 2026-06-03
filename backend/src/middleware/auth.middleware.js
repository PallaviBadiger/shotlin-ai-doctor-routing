const { verifyToken } = require("../utils/jwt.util");
const { error } = require("../utils/response.util");

function authenticate(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return error(res, "Authentication required", 401);
  }

  const token = header.split(" ")[1];

  try {
    req.user = verifyToken(token);
    next();
  } catch (e) {
    if (e.name === "TokenExpiredError") {
      return error(res, "Token expired, please login again", 401);
    }
    return error(res, "Invalid token", 401);
  }
}

/**
 * Role-based authorization middleware.
 * - Supports multiple allowed roles: authorize("PATIENT", "ADMIN")
 * - Backwards compatible with single-role usage: authorize("PATIENT")
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) return error(res, "Unauthorized", 401);
    if (allowedRoles.length === 0) return next();
    if (!allowedRoles.includes(req.user.role)) {
      return error(res, `Access denied. Requires role: ${allowedRoles.join(' or ')}`, 403);
    }
    return next();
  };
};

module.exports = {
  authenticate,
  authorize,
};
