export type Severity = 'Low' | 'Moderate' | 'High' | 'Emergency'
export type DrainageType =
  | 'Roadside storm drain'
  | 'Sewage drain'
  | 'Manhole'
  | 'Open drainage channel'

export type ProblemCategory =
  | 'Blockage'
  | 'Overflow'
  | 'Stagnant water'
  | 'Damaged drainage'
  | 'Foul smell'
  | 'Other'

export type IncidentStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved — Pending Verification'
  | 'Resolved'
  | 'Rejected'
  | 'Reopened'

export interface IncidentPhoto {
  original: string
  display: string
  fileName: string
  sizeKb: number
}

export interface HistoryEvent {
  id: string
  timestamp: string
  status: IncidentStatus
  note: string
  actor: string
}

export interface IncidentRecord {
  id: string
  complaintId: string
  primaryPhoto?: IncidentPhoto
  additionalPhotos: IncidentPhoto[]
  drainageType: DrainageType
  problemCategory: ProblemCategory
  severity: Severity
  description: string
  location: string
  latitude?: number
  longitude?: number
  incidentDateTime: string
  reporterName?: string
  contactInfo?: string
  createdAt: string
  updatedAt: string
  status: IncidentStatus
  history: HistoryEvent[]
  notes: string[]
  resolutionEvidence?: string[]
  priorityScore?: number
}

export interface DetectionInput {
  rainfall: number
  blockage: number
  slope: number
  populationDensity: number
  assetCondition: number
}

export interface DetectionResult {
  riskScore: number
  priorityLabel: string
  recommendation: string
  hotspotLevel: string
  drivers: string[]
}
