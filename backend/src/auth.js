import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const secret = process.env.JWT_SECRET
if (!secret) throw new Error('JWT_SECRET must be configured before starting the API.')

export function issueToken(user) {
  return jwt.sign({ sub: user.id, email: user.email, role: user.role }, secret, { expiresIn: '8h' })
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Authentication required.' })

  try {
    req.user = jwt.verify(header.slice(7), secret)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token.' })
  }
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 12)
}

export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash)
}
