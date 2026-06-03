const bcrypt        = require('bcryptjs');
const prisma        = require('../../lib/prisma');
const { signToken } = require('../../utils/jwt.util');

async function register({ email, password, name, age, gender, phone }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw Object.assign(new Error('Email already registered'), { statusCode: 409 });

  const hashed = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      role: 'PATIENT',
      patientProfile: {
        create: { name, age: parseInt(age), gender, phone }
      }
    },
    include: { patientProfile: true }
  });

  const token = signToken({ id: user.id, role: user.role, email: user.email });

  return {
    token,
    user: {
      id:    user.id,
      email: user.email,
      role:  user.role,
      name:  user.patientProfile.name
    }
  };
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({
    where:   { email },
    include: { patientProfile: true, doctorProfile: true }
  });

  if (!user) throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });

  const token = signToken({ id: user.id, role: user.role, email: user.email });

  const profile = user.patientProfile || user.doctorProfile;

  return {
    token,
    user: {
      id:    user.id,
      email: user.email,
      role:  user.role,
      name:  profile?.name || 'Admin'
    }
  };
}

async function getMe(userId) {
  const user = await prisma.user.findUnique({
    where:   { id: userId },
    include: { patientProfile: true, doctorProfile: true },
    omit:    { password: true }
  });
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });
  return user;
}

module.exports = { register, login, getMe };