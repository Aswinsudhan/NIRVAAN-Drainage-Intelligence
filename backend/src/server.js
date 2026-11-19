import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { comparePassword, hashPassword, issueToken, requireAuth } from './auth.js'
import { query } from './db.js'

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

app.get('/', (_req, res) => {
  res.json({ name: 'NIRVAAN API', status: 'ok', health: '/health' })
})

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
    await query(
      'INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)',
      [crypto.randomUUID(), email.toLowerCase().trim(), passwordHash],
    )
    const userResult = await query(
      'SELECT id, email, role FROM users WHERE email = $1',
      [email.toLowerCase().trim()],
    )
    const user = userResult.rows[0]
    res.status(201).json({ user, token: issueToken(user) })
  } catch (error) {
    if (String(error?.message ?? '').toLowerCase().includes('unique')) {
      return res.status(409).json({ error: 'An account with that email already exists.' })
    }
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
  res.json(result.rows.map((row) => JSON.parse(row.payload)))
})

app.get('/api/incidents/:complaintId', async (req, res) => {
  const result = await query('SELECT payload FROM incidents WHERE complaint_id = $1', [req.params.complaintId])
  if (!result.rows[0]) return res.status(404).json({ error: 'Complaint not found.' })
  res.json(JSON.parse(result.rows[0].payload))
})

app.post('/api/incidents', async (req, res) => {
  const incident = req.body
  if (!incident?.id || !incident?.complaintId || !incident?.location) return res.status(400).json({ error: 'Incident id, complaint id, and location are required.' })
  await query(
    `INSERT INTO incidents (id, complaint_id, location, payload)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT(id) DO UPDATE SET
       payload = excluded.payload,
       location = excluded.location,
       updated_at = datetime('now')`,
    [incident.id, incident.complaintId, incident.location, JSON.stringify(incident)],
  )
  res.status(201).json(incident)
})

app.patch('/api/incidents/:id', requireAuth, async (req, res) => {
  const result = await query('SELECT payload FROM incidents WHERE id = $1', [req.params.id])
  if (!result.rows[0]) return res.status(404).json({ error: 'Incident not found.' })

  const incident = {
    ...JSON.parse(result.rows[0].payload),
    ...req.body,
    updatedAt: new Date().toISOString(),
  }
  await query(
    'UPDATE incidents SET payload = $2, location = $3, updated_at = datetime(\'now\') WHERE id = $1',
    [req.params.id, JSON.stringify(incident), incident.location],
  )
  res.json(incident)
})

app.delete('/api/incidents', requireAuth, async (_req, res) => {
  await query('DELETE FROM incidents')
  res.status(204).end()
})

app.use((error, _req, res, _next) => {
  console.error(error)
  res.status(500).json({ error: 'Unexpected server error.' })
})

app.listen(port, () => console.log(`NIRVAAN API listening on port ${port}`))

process.on('SIGTERM', async () => {
  process.exit(0)
})
