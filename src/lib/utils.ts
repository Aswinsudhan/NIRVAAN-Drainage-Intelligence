import type { IncidentRecord, Severity } from '../types'

export const severityRank: Record<Severity, number> = {
  Low: 1,
  Moderate: 2,
  High: 3,
  Emergency: 4,
}

export const statusOptions = [
  'Submitted',
  'Under Review',
  'Assigned',
  'In Progress',
  'Resolved — Pending Verification',
  'Resolved',
  'Rejected',
  'Reopened',
] as const

export function formatDateTime(value?: string) {
  if (!value) return 'Not available'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function evaluateDrainageRisk(inputs: {
  rainfall: number
  blockage: number
  slope: number
  populationDensity: number
  assetCondition: number
}) {
  const rainfallWeight = inputs.rainfall * 0.35
  const blockageWeight = inputs.blockage * 0.3
  const slopeWeight = (100 - inputs.slope) * 0.15
  const densityWeight = inputs.populationDensity * 0.1
  const assetWeight = (100 - inputs.assetCondition) * 0.1
  const riskScore = Math.min(100, Math.round(rainfallWeight + blockageWeight + slopeWeight + densityWeight + assetWeight))

  let priorityLabel = 'Watch'
  let hotspotLevel = 'Moderate'
  let recommendation = 'Monitor nearby drains and inspect if rainfall continues for another cycle.'

  if (riskScore >= 85) {
    priorityLabel = 'Critical'
    hotspotLevel = 'Extreme'
    recommendation = 'Immediate engineering inspection is recommended before the next rainfall surge.'
  } else if (riskScore >= 70) {
    priorityLabel = 'High'
    hotspotLevel = 'Elevated'
    recommendation = 'Escalate to maintenance crew for blockage clearing and catch-basin review.'
  } else if (riskScore >= 55) {
    priorityLabel = 'Moderate'
    hotspotLevel = 'Watch'
    recommendation = 'Continue monitoring and prepare preventive action during peak rainfall.'
  }

  const drivers = [
    riskScore >= 60 ? 'High rainfall and runoff intensity' : 'Rainfall remains within a manageable range',
    riskScore >= 50 ? 'Blockage risk is elevated by debris and silt build-up' : 'Blockage risk is moderate and trackable',
    inputs.populationDensity >= 60 ? 'Dense urban catchment increases flood exposure' : 'Lower population density reduces downstream impact',
    inputs.assetCondition <= 45 ? 'Asset condition is deteriorating and may require maintenance' : 'Asset condition remains stable but should be reviewed',
  ]

  return {
    riskScore,
    priorityLabel,
    recommendation,
    hotspotLevel,
    drivers,
  }
}

export function getStatusTone(status: IncidentRecord['status']) {
  switch (status) {
    case 'Submitted':
      return 'bg-sky-100 text-sky-700 ring-sky-200'
    case 'Under Review':
      return 'bg-amber-100 text-amber-700 ring-amber-200'
    case 'Assigned':
      return 'bg-blue-100 text-blue-700 ring-blue-200'
    case 'In Progress':
      return 'bg-violet-100 text-violet-700 ring-violet-200'
    case 'Resolved — Pending Verification':
      return 'bg-orange-100 text-orange-700 ring-orange-200'
    case 'Resolved':
      return 'bg-emerald-100 text-emerald-700 ring-emerald-200'
    case 'Rejected':
      return 'bg-rose-100 text-rose-700 ring-rose-200'
    case 'Reopened':
      return 'bg-red-100 text-red-700 ring-red-200'
    default:
      return 'bg-slate-100 text-slate-700 ring-slate-200'
  }
}

export function getSeverityTone(severity: Severity) {
  switch (severity) {
    case 'Low':
      return 'bg-emerald-100 text-emerald-700 ring-emerald-200'
    case 'Moderate':
      return 'bg-amber-100 text-amber-700 ring-amber-200'
    case 'High':
      return 'bg-orange-100 text-orange-700 ring-orange-200'
    case 'Emergency':
      return 'bg-rose-100 text-rose-700 ring-rose-200'
    default:
      return 'bg-slate-100 text-slate-700 ring-slate-200'
  }
}

export function generateComplaintId(existingIds: string[]) {
  const year = new Date().getFullYear()
  const maxNumber = existingIds.reduce((highest, id) => {
    const match = id.match(/NIR-(\d{4})-(\d{6})/)
    if (!match) return highest
    const numeric = Number(match[2])
    return Number.isFinite(numeric) && numeric > highest ? numeric : highest
  }, 0)

  const next = maxNumber + 1
  return `NIR-${year}-${String(next).padStart(6, '0')}`
}

export function sortIncidentsDescending(incidents: IncidentRecord[]) {
  return [...incidents].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

export function makeSvgPhoto(label: string, background: string, accent: string) {
  const svg = `
    <svg xmlns='http://www.w3.org/2000/svg' width='1200' height='900' viewBox='0 0 1200 900'>
      <defs>
        <linearGradient id='g' x1='0' x2='1'>
          <stop offset='0%' stop-color='${background}'/>
          <stop offset='100%' stop-color='${accent}'/>
        </linearGradient>
      </defs>
      <rect width='1200' height='900' fill='url(#g)'/>
      <circle cx='220' cy='180' r='90' fill='rgba(255,255,255,0.18)'/>
      <circle cx='980' cy='700' r='140' fill='rgba(255,255,255,0.12)'/>
      <path d='M110 540 C 250 420, 360 500, 500 430 S 740 260, 980 500 L 980 760 L 110 760 Z' fill='rgba(15,23,42,0.18)'/>
      <path d='M120 640 L 520 310 L 760 520 L 1080 250' stroke='rgba(255,255,255,0.85)' stroke-width='18' fill='none' stroke-linecap='round'/>
      <rect x='120' y='115' width='960' height='720' rx='36' fill='rgba(15,23,42,0.18)' stroke='rgba(255,255,255,0.45)'/>
      <text x='600' y='455' text-anchor='middle' fill='white' font-size='78' font-family='Arial, sans-serif' font-weight='700'>${label}</text>
      <text x='600' y='560' text-anchor='middle' fill='rgba(255,255,255,0.9)' font-size='34' font-family='Arial, sans-serif'>Drainage incident evidence</text>
    </svg>
  `

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}
