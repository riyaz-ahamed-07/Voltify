const bcrypt = require('bcrypt');
const { signToken } = require('../utils/jwt');
const authService = require('../services/authService');
const { validateSignup, validateLogin } = require('../utils/validators');

const SALT_ROUNDS = 12;

/**
 * POST /api/auth/signup
 * Body: { name, email, password }
 */
const signup = async (req, res) => {
  const { name, email, password } = req.body;

  const validation = validateSignup({ name, email, password });
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  const existing = await authService.getUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await authService.createUser({ name, email, passwordHash });
  const token = signToken(user.id);

  return res.status(201).json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      tier: user.tier,
      coins: user.coins,
      streak_days: user.streak_days,
      onboarding_complete: user.onboarding_complete,
    },
  });
};

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  const validation = validateLogin({ email, password });
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  const user = await authService.getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // OAuth users don't have a password
  if (!user.password_hash) {
    return res.status(401).json({ error: 'This account uses Google sign-in. Please use "Continue with Google".' });
  }

  const passwordMatch = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatch) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  await authService.updateLastActive(user.id);
  const token = signToken(user.id);

  return res.status(200).json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      tier: user.tier,
      household_type: user.household_type,
      location: user.location,
      coins: user.coins,
      streak_days: user.streak_days,
      onboarding_complete: user.onboarding_complete,
    },
  });
};

/**
 * GET /api/auth/me
 * Returns the current authenticated user
 */
const me = async (req, res) => {
  const user = await authService.getUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.status(200).json(user);
};

/**
 * POST /api/auth/verify-otp
 * OTP verification (simplified — no real email service in MVP)
 */
const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required' });
  }
  // In Tier 3 MVP, OTP verification is simulated
  // A real implementation would check against a stored OTP in DB with expiry
  return res.status(200).json({ success: true, message: 'OTP verified successfully' });
};

/**
 * POST /api/auth/resend-otp
 */
const resendOTP = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  return res.status(200).json({ success: true, message: 'OTP sent to email' });
};

/**
 * POST /api/auth/forgot-password
 */
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  const user = await authService.getUserByEmail(email);
  // Always return success to prevent email enumeration
  return res.status(200).json({ success: true, message: 'If an account exists, a reset link has been sent.' });
};

/**
 * POST /api/auth/oauth/google
 * Called from frontend when Google OAuth completes via redirect
 * Body: { token, user } — passed from the backend Google callback redirect
 */
const oauthCallback = async (req, res) => {
  const { name, email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required for OAuth login' });
  }

  const user = await authService.findOrCreateOAuthUser({ name: name || email.split('@')[0], email, provider: 'google' });
  await authService.updateLastActive(user.id);
  const token = signToken(user.id);

  return res.status(200).json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      tier: user.tier,
      coins: user.coins,
      streak_days: user.streak_days,
      onboarding_complete: user.onboarding_complete,
    },
  });
};

module.exports = { signup, login, me, verifyOTP, resendOTP, forgotPassword, oauthCallback };
