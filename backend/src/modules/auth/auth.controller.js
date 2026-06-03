const authService = require('./auth.service');
const { success, error } = require('../../utils/response.util');
const { body, validationResult } = require('express-validator');

const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password')
    .isLength({ min: 8 })
    .matches(/(?=.*[A-Z])(?=.*[0-9])/)
    .withMessage('Password must be 8+ chars with uppercase and number'),
  body('name').trim().notEmpty().withMessage('Name required'),
  body('age').isInt({ min: 1, max: 120 }).withMessage('Valid age required'),
  body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male, Female, or Other'),
  body('phone').isMobilePhone().withMessage('Valid phone number required')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

async function register(req, res) {
  const errs = validationResult(req);
  if (!errs.isEmpty()) return error(res, errs.array()[0].msg, 422);

  try {
    const result = await authService.register(req.body);
    return success(res, result, 201);
  } catch (e) {
    return error(res, e.message, e.statusCode || 400);
  }
}

async function login(req, res) {
  const errs = validationResult(req);
  if (!errs.isEmpty()) return error(res, errs.array()[0].msg, 422);

  try {
    const result = await authService.login(req.body);
    return success(res, result);
  } catch (e) {
    return error(res, e.message, e.statusCode || 400);
  }
}

async function getMe(req, res) {
  try {
    const user = await authService.getMe(req.user.id);
    return success(res, user);
  } catch (e) {
    return error(res, e.message, e.statusCode || 500);
  }
}

module.exports = { register, registerValidation, login, loginValidation, getMe };