import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { comparePassword, hashPassword, issueToken, requireAuth } from './auth.js'
import { pool, query } from './db.js'

const app = express()
const port = Number(process.env.PORT ?? 4000)
const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:5180').split(',').map((origin) => origin.trim())

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true)
    callback(new Error('Origin is not allowed by CORS.'))
  },
}))
app.use(express.json({ limit: '10mb' }))

app.get('/health', async (_req, res) => {
  try {
    await query('SELECT 1')
    res.json({ status: 'ok' })
  } catch {
    res.status(503).json({ status: 'error', error: 'Database unavailable.' })
  }
})

app.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body ?? {}
  if (typeof email !== 'string' || typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ error: 'A valid email and password of at least 8 characters are required.' })
  }

  try {
    const passwordHash = await hashPassword(password)
    const result = await query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, role',
      [email.toLowerCase().trim(), passwordHash],
    )
    const user = result.rows[0]
    res.status(201).json({ user, token: issueToken(user) })
  } catch (error) {
    if (error?.code === '23505') return res.status(409).json({ error: 'An account with that email already exists.' })
    res.status(500).json({ error: 'Unable to create account.' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body ?? {}
  if (typeof email !== 'string' || typeof password !== 'string') return res.status(400).json({ error: 'Email and password are required.' })

  const result = await query('SELECT id, email, role, password_hash FROM users WHERE email = $1', [email.toLowerCase().trim()])
  const user = result.rows[0]
  if (!user || !(await comparePassword(password, user.password_hash))) return res.status(401).json({ error: 'Invalid email or password.' })

  const { password_hash: _passwordHash, ...safeUser } = user
  res.json({ user: safeUser, token: issueToken(safeUser) })
})

app.get('/api/incidents', async (_req, res) => {
  const result = await query('SELECT payload FROM incidents ORDER BY updated_at DESC')
  res.json(result.rows.map((row) => row.payload))
})

app.get('/api/incidents/:complaintId', async (req, res) => {
  const result = await query('SELECT payload FROM incidents WHERE complaint_id = $1', [req.params.complaintId])
  if (!result.rows[0]) return res.status(404).json({ error: 'Complaint not found.' })
  res.json(result.rows[0].payload)
})

app.post('/api/incidents', async (req, res) => {
  const incident = req.body
  if (!incident?.id || !incident?.complaintId || !incident?.location) return res.status(400).json({ error: 'Incident id, complaint id, and location are required.' })
  const result = await query(
    `INSERT INTO incidents (id, complaint_id, location, payload)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload, location = EXCLUDED.location, updated_at = NOW()
     RETURNING payload`,
    [incident.id, incident.complaintId, incident.location, incident],
  )
  res.status(201).json(result.rows[0].payload)
})

app.patch('/api/incidents/:id', requireAuth, async (req, res) => {
  const result = await query(
    `UPDATE incidents
     SET payload = payload || $2::jsonb, updated_at = NOW()
     WHERE id = $1
     RETURNING payload`,
    [req.params.id, JSON.stringify({ ...req.body, updatedAt: new Date().toISOString() })],
  )
  if (!result.rows[0]) return res.status(404).json({ error: 'Incident not found.' })
  res.json(result.rows[0].payload)
})

app.delete('/api/incidents', requireAuth, async (_req, res) => {
  await query('TRUNCATE TABLE incidents')
  res.status(204).end()
})

app.use((error, _req, res, _next) => {
  console.error(error)
  res.status(500).json({ error: 'Unexpected server error.' })
})

app.listen(port, () => console.log(`NIRVAAN API listening on port ${port}`))

process.on('SIGTERM', async () => {
  await pool.end()
  process.exit(0)
})
