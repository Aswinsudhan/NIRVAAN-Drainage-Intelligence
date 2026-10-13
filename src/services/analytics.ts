import type { IncidentRecord } from '../types'

export function summarizeIncidents(incidents: IncidentRecord[]) {
  const now = new Date()
  const thisMonthCount = incidents.filter((incident) => {
    const createdAt = new Date(incident.createdAt)
    return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear()
  }).length

  const openCases = incidents.filter((incident) =>
    !['Resolved', 'Rejected'].includes(incident.status),
  ).length

  const verifiedResolutions = incidents.filter((incident) => incident.status === 'Resolved').length
  const highPriority = incidents.filter((incident) => incident.priorityScore && incident.priorityScore >= 80).length

  return {
    total: incidents.length,
    thisMonthCount,
    openCases,
    verifiedResolutions,
    highPriority,
  }
}

export function getSeverityTrend(incidents: IncidentRecord[]) {
  const severityCounts = {
    Low: 0,
    Moderate: 0,
    High: 0,
    Emergency: 0,
  }

  incidents.forEach((incident) => {
    severityCounts[incident.severity] += 1
  })

  return [
    { name: 'Low', value: severityCounts.Low },
    { name: 'Moderate', value: severityCounts.Moderate },
    { name: 'High', value: severityCounts.High },
    { name: 'Emergency', value: severityCounts.Emergency },
  ]
}

export function getHotspotData(incidents: IncidentRecord[]) {
  const hotspots = [
    { name: 'Market Square', incidents: 0 },
    { name: 'Depot Road', incidents: 0 },
    { name: 'Garden Lane', incidents: 0 },
    { name: 'Hospital Road', incidents: 0 },
  ]

  incidents.forEach((incident) => {
    const label = incident.location.includes('Market')
      ? 'Market Square'
      : incident.location.includes('Depot')
        ? 'Depot Road'
        : incident.location.includes('Garden')
          ? 'Garden Lane'
          : incident.location.includes('Hospital')
            ? 'Hospital Road'
            : 'Other Areas'

    const target = hotspots.find((hotspot) => hotspot.name === label)
    if (target) target.incidents += 1
  })

  return hotspots.filter((entry) => entry.incidents > 0)
}

export function getStatusDistribution(incidents: IncidentRecord[]) {
  const distribution = [
    { name: 'Submitted', value: 0 },
    { name: 'Under Review', value: 0 },
    { name: 'Assigned', value: 0 },
    { name: 'In Progress', value: 0 },
    { name: 'Resolved', value: 0 },
  ]

  incidents.forEach((incident) => {
    const match = distribution.find((bucket) => bucket.name === incident.status || (incident.status === 'Resolved — Pending Verification' && bucket.name === 'Resolved'))
    if (match) match.value += 1
  })

  return distribution
}
