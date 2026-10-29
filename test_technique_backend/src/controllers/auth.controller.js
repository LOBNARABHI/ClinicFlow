const asyncHandler = require('../utils/asyncHandler');
const authService = require('../services/auth.service');
const { loginSchema } = require('../validators/auth.validator');

// POST /api/auth/login : valide les données puis appelle le service
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);
  const result = await authService.login(email, password);
  res.json(result);
});

// GET /api/auth/me : retourne l'utilisateur connecté (req.user vient du middleware auth)
exports.me = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.id);
  res.json(user);
});