import { describe, expect, it } from 'vitest'
import { getHotspotData, getSeverityTrend, summarizeIncidents } from './services/analytics'
import type { IncidentRecord } from './types'

const incidents: IncidentRecord[] = [
  {
    id: '1',
    complaintId: 'NIR-2026-000001',
    additionalPhotos: [],
    drainageType: 'Roadside storm drain',
    problemCategory: 'Blockage',
    severity: 'High',
    description: 'Blocked main drain',
    location: 'Near Municipal Market, Ward 12',
    incidentDateTime: '2026-10-01T08:45:00',
    createdAt: '2026-10-01T08:47:00.000Z',
    updatedAt: '2026-10-01T08:47:00.000Z',
    status: 'Under Review',
    history: [],
    notes: [],
    priorityScore: 85,
  },
  {
    id: '2',
    complaintId: 'NIR-2026-000002',
    additionalPhotos: [],
    drainageType: 'Open drainage channel',
    problemCategory: 'Overflow',
    severity: 'Moderate',
    description: 'Overflow near depot',
    location: 'Near Depot Road, Ward 5',
    incidentDateTime: '2026-10-05T10:30:00',
    createdAt: '2026-10-05T10:30:00.000Z',
    updatedAt: '2026-10-05T10:45:00.000Z',
    status: 'Resolved',
    history: [],
    notes: [],
    priorityScore: 60,
  },
  {
    id: '3',
    complaintId: 'NIR-2026-000003',
    additionalPhotos: [],
    drainageType: 'Manhole',
    problemCategory: 'Stagnant water',
    severity: 'Low',
    description: 'Standing water near garden lane',
    location: 'Garden Lane, Ward 8',
    incidentDateTime: '2026-10-07T13:00:00',
    createdAt: '2026-10-07T13:00:00.000Z',
    updatedAt: '2026-10-07T13:10:00.000Z',
    status: 'Assigned',
    history: [],
    notes: [],
    priorityScore: 30,
  },
]

describe('analytics summary', () => {
  it('aggregates totals and hotspots correctly', () => {
    const summary = summarizeIncidents(incidents)
    expect(summary.total).toBe(3)
    expect(summary.openCases).toBe(2)
    expect(summary.verifiedResolutions).toBe(1)
    expect(summary.highPriority).toBe(1)

    const severityTrend = getSeverityTrend(incidents)
    expect(severityTrend).toEqual([
      { name: 'Low', value: 1 },
      { name: 'Moderate', value: 1 },
      { name: 'High', value: 1 },
      { name: 'Emergency', value: 0 },
    ])

    expect(getHotspotData(incidents)).toEqual([
      { name: 'Market Square', incidents: 1 },
      { name: 'Depot Road', incidents: 1 },
      { name: 'Garden Lane', incidents: 1 },
    ])
  })
})
