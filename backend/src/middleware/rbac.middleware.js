const { error } = require('../utils/response.util');

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return error(res, 'Authentication required', 401);
    if (!allowedRoles.includes(req.user.role)) {
      return error(res, `Access denied. Requires role: ${allowedRoles.join(' or ')}`, 403);
    }
    next();
  };
}

module.exports = { authorize };