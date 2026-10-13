import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom'
import {
  AlertTriangle,
  BarChart3,
  Camera,
  ChevronRight,
  FileText,
  Gauge,
  LayoutDashboard,
  MapPinned,
  Menu,
  ShieldCheck,
  Wrench,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet'
import { demoIncidents } from './data/demoData'
import { getSeverityTrend, getHotspotData, getStatusDistribution, summarizeIncidents } from './services/analytics'
import { getAllIncidents, saveIncident, seedDemoData } from './services/storage'
import type { IncidentRecord } from './types'
import { formatDateTime, getSeverityTone, getStatusTone } from './lib/utils'

const defaultIncidentDateTime = new Date().toISOString().slice(0, 16)

function App() {
  const [mobileNav, setMobileNav] = useState(false)
  const [incidents, setIncidents] = useState<IncidentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        const rows = await getAllIncidents()
        if (rows.length === 0) {
          await seedDemoData(demoIncidents)
          setIncidents(await getAllIncidents())
        } else {
          setIncidents(rows)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load incident records.')
      } finally {
        setLoading(false)
      }
    }

    void loadData()
  }, [])

  const navItems = [
    { label: 'Overview', path: '/', icon: LayoutDashboard },
    { label: 'Report Blocked Drain', path: '/report', icon: Camera },
    { label: 'Track Complaint', path: '/track', icon: FileText },
    { label: 'Incident Management', path: '/incidents', icon: Wrench },
    { label: 'Interactive Map', path: '/map', icon: MapPinned },
    { label: 'Detection Laboratory', path: '/detection', icon: Gauge },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Settings', path: '/settings', icon: ShieldCheck },
  ]

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-100 text-slate-800">
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-slate-950/95 text-slate-50 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-teal-500 text-slate-950 shadow-soft">
                <MapPinned className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-extrabold tracking-wide">NIRVAAN</p>
                <p className="text-[10px] uppercase tracking-[0.28em] text-slate-300">Drainage Intelligence</p>
              </div>
            </div>

            <nav className="hidden items-center gap-1 lg:flex">
              {navItems.map(({ label, path, icon: Icon }) => (
                <NavLink
                  key={path}
                  to={path}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition ${
                      isActive ? 'bg-slate-800 text-cyan-300' : 'text-slate-200 hover:bg-slate-800/70'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              ))}
            </nav>

            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full border border-slate-700 p-2 lg:hidden"
              onClick={() => setMobileNav((value) => !value)}
              aria-label="Toggle navigation"
            >
              {mobileNav ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {mobileNav && (
            <div className="border-t border-slate-800 bg-slate-950/95 px-4 py-3 lg:hidden">
              <div className="grid gap-2">
                {navItems.map(({ label, path, icon: Icon }) => (
                  <NavLink
                    key={path}
                    to={path}
                    onClick={() => setMobileNav(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${
                        isActive ? 'bg-slate-800 text-cyan-300' : 'text-slate-200'
                      }`
                    }
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </NavLink>
                ))}
              </div>
            </div>
          )}
        </header>

        <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/overview" element={<OverviewPage incidents={incidents} loading={loading} error={error} />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/track" element={<TrackPage />} />
            <Route path="/incidents" element={<IncidentManagementPage incidents={incidents} />} />
            <Route path="/map" element={<MapPage incidents={incidents} />} />
            <Route path="/detection" element={<DetectionPage />} />
            <Route path="/analytics" element={<AnalyticsPage incidents={incidents} />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

function LandingPage() {
  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 text-slate-50 shadow-soft">
        <div className="grid gap-8 px-6 py-10 md:grid-cols-2 md:px-10">
          <div className="space-y-6">
            <div className="inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
              Every Drain. Every Report. Every Risk. Tracked.
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-black tracking-tight md:text-6xl">NIRVAAN Drainage Intelligence</h1>
              <p className="max-w-xl text-lg text-slate-300">
                A civic technology platform that helps residents report blocked drainage, operators prioritize risk, and teams verify repairs before closure.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href="/report" className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-5 py-3 font-semibold text-slate-900 shadow hover:bg-cyan-300">
                Report Blocked Drain <ChevronRight className="h-4 w-4" />
              </a>
              <a href="/track" className="inline-flex items-center gap-2 rounded-full border border-slate-600 bg-slate-900/60 px-5 py-3 font-semibold text-slate-100 hover:border-slate-500">
                Track Complaint
              </a>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <StatCard label="Sample incidents" value="15" note="demo dataset" />
              <StatCard label="Open cases" value="8" note="local prototype" />
              <StatCard label="Priority alerts" value="3" note="high-risk" />
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft backdrop-blur-sm">
            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-900/80 p-4">
                <div className="mb-3 flex items-center justify-between text-sm text-slate-300">
                  <span>Drain Monitoring Flow</span>
                  <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-[10px] font-semibold uppercase text-emerald-200">Sample data</span>
                </div>
                <div className="space-y-3">
                  {['Citizen reports issue', 'Photo + location captured', 'Operator reviews and prioritizes', 'Maintenance verifies repair'].map((step, index) => (
                    <div key={step} className="flex items-center gap-3 rounded-xl bg-slate-800/80 p-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-400 text-sm font-bold text-slate-950">{index + 1}</span>
                      <span className="text-sm text-slate-200">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <InfoPill icon={Camera} label="Photo reporting" />
                <InfoPill icon={MapPinned} label="Map monitoring" />
                <InfoPill icon={AlertTriangle} label="Smart prioritization" />
                <InfoPill icon={ShieldCheck} label="Resolution verification" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-4">
        <FeatureCard icon={Camera} title="Photo-based reporting" description="Capture or upload evidence, describe the issue, and save the report through the shared API." />
        <FeatureCard icon={MapPinned} title="Map-driven monitoring" description="Review complaint clusters and open high-risk locations on a Leaflet-based city map." />
        <FeatureCard icon={Gauge} title="Detection lab" description="Run simulated rainfall, water level, and blockage scenarios with explainable rule-based alerts." />
        <FeatureCard icon={ShieldCheck} title="Verification workflow" description="Track inspection findings and repair evidence before closing a case as resolved." />
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-soft md:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-600">Prototype notes</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">Local-first civic operations</h2>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <SummaryBox title="Problem statement" text="Blocked drains can create standing water, sewer overflow, damaged roads, and public health risk, especially when reports are not prioritized and closures are not verified." />
          <SummaryBox title="Privacy" text="The local browser prototype stores only required incident metadata and local photos. It does not expose private contact information in public tracking views." />
          <SummaryBox title="Limitations" text="This is a local demo without a municipal backend, live sensor feeds, or production authentication. Any real deployment would require secure server-side access control and shared data storage." />
        </div>
      </section>
    </div>
  )
}

function OverviewPage({ incidents, loading, error }: { incidents: IncidentRecord[]; loading: boolean; error: string | null }) {
  const summary = summarizeIncidents(incidents)
  const severityData = getSeverityTrend(incidents)
  const statusData = getStatusDistribution(incidents)
  const hotspotData = getHotspotData(incidents)
  const recent = [...incidents].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5)

  return (
    <div className="space-y-8">
      <PageHeader title="Overview Dashboard" subtitle="Operational oversight for civic drainage incidents" />
      {error && <AlertBanner text={error} />}
      {loading ? <LoadingState text="Loading incident records and analytics..." /> : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <StatTile label="Total incidents" value={String(summary.total)} tone="blue" />
            <StatTile label="Open incidents" value={String(summary.openCases)} tone="rose" />
            <StatTile label="High priority" value={String(summary.highPriority)} tone="amber" />
            <StatTile label="Resolved" value={String(summary.verifiedResolutions)} tone="green" />
            <StatTile label="Avg resolution" value="4.2 days" tone="cyan" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="Severity distribution">
              <div className="space-y-3">
                {severityData.map((item) => (
                  <div key={item.name}>
                    <div className="mb-1 flex items-center justify-between text-sm text-slate-600">
                      <span>{item.name}</span>
                      <span>{item.value}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200">
                      <div className="h-2 rounded-full bg-cyan-500" style={{ width: `${(item.value / Math.max(summary.total, 1)) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Status distribution">
              <div className="space-y-3">
                {statusData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <span>{item.name}</span>
                    <span className="font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="Recurring drainage locations">
              <div className="space-y-3">
                {hotspotData.length > 0 ? hotspotData.map((location) => (
                  <div key={location.name} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <span>{location.name}</span>
                    <span className="font-semibold text-cyan-700">{location.incidents} reports</span>
                  </div>
                )) : <EmptyState text="No recurring hotspot data in the current dataset." />}
              </div>
            </Panel>

            <Panel title="Recent complaints">
              <div className="space-y-3">
                {recent.map((incident) => (
                  <div key={incident.complaintId} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold text-slate-800">{incident.complaintId}</div>
                        <div className="text-sm text-slate-500">{incident.location}</div>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getStatusTone(incident.status)}`}>{incident.status}</span>
                    </div>
                    <div className="mt-2 text-xs text-slate-500">Updated {formatDateTime(incident.updatedAt)}</div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </>
      )}
    </div>
  )
}

function ReportPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Report Blocked Drain" subtitle="Capture a photo, describe the issue, and save a complaint locally" />
      <div className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
        <ComplaintForm />
        <div className="space-y-4">
          <Panel title="Submission checklist">
            <ul className="space-y-3 text-sm text-slate-600">
              <li>• Photograph and location are required before submission.</li>
              <li>• Use current GPS when available or manually enter a landmark.</li>
              <li>• Store evidence locally in your browser profile.</li>
              <li>• Never claim a successful save without a generated complaint ID.</li>
            </ul>
          </Panel>
          <Panel title="Data provenance">
            <p className="text-sm text-slate-600">The prototype is browser-local and uses demo coordinates only when a real location is unavailable.</p>
          </Panel>
        </div>
      </div>
    </div>
  )
}

function TrackPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Track Complaint" subtitle="Look up a complaint ID to review status, updates, and evidence" />
      <Panel title="Complaint lookup">
        <div className="flex gap-3">
          <input className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-700 focus:border-cyan-500 focus:outline-none" placeholder="Enter complaint ID, e.g. NIR-2026-000001" />
          <button type="button" className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white">Track</button>
        </div>
      </Panel>
      <EmptyState text="No complaint selected. Enter a valid ID to review status, evidence, and public updates." />
    </div>
  )
}

function IncidentManagementPage({ incidents }: { incidents: IncidentRecord[] }) {
  return (
    <div className="space-y-6">
      <PageHeader title="Incident Management" subtitle="Search, prioritize, inspect, and update field cases" />
      <div className="grid gap-4 md:grid-cols-3">
        <input className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm" placeholder="Search complaint ID, location, or description" />
        <select className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm">
          <option>Status</option>
        </select>
        <select className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm">
          <option>Severity</option>
        </select>
      </div>
      <div className="space-y-3">
        {incidents.length === 0 ? <EmptyState text="No incidents in the current local dataset." /> : incidents.map((incident) => (
          <div key={incident.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-slate-900">{incident.complaintId}</span>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getStatusTone(incident.status)}`}>{incident.status}</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{incident.location}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getSeverityTone(incident.severity)}`}>{incident.severity}</span>
                <span className="text-sm font-medium text-slate-500">Priority {incident.priorityScore ?? 0}</span>
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-700">{incident.description}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
              <span className="rounded-full bg-slate-100 px-2 py-1">{incident.drainageType}</span>
              <span className="rounded-full bg-slate-100 px-2 py-1">{incident.problemCategory}</span>
              <span className="rounded-full bg-slate-100 px-2 py-1">Updated {formatDateTime(incident.updatedAt)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function MapPage({ incidents }: { incidents: IncidentRecord[] }) {
  const openCases = incidents.filter((incident) => incident.status !== 'Resolved').length
  const resolvedCases = incidents.filter((incident) => incident.status === 'Resolved').length
  const mappedIncidents = incidents.filter((incident) => typeof incident.latitude === 'number' && typeof incident.longitude === 'number')
  const center: [number, number] = mappedIncidents.length > 0
    ? [mappedIncidents[0].latitude!, mappedIncidents[0].longitude!]
    : [12.9716, 77.5946]

  return (
    <div className="space-y-6">
      <PageHeader title="Interactive Drainage Map" subtitle="OpenStreetMap markers for complaint locations and hotspot review" />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Mapped incidents" value={String(incidents.length)} note="stored local records" />
        <StatCard label="Active cases" value={String(openCases)} note="open / follow-up" />
        <StatCard label="Resolved" value={String(resolvedCases)} note="closed records" />
      </div>
      <Panel title="Map legend">
        <div className="flex flex-wrap gap-3 text-sm">
          <LegendDot color="bg-red-500" label="Emergency / high priority open" />
          <LegendDot color="bg-amber-500" label="Moderate priority open" />
          <LegendDot color="bg-emerald-500" label="Resolved" />
          <LegendDot color="bg-cyan-500" label="Other open" />
        </div>
      </Panel>
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-3 shadow-soft">
        <MapContainer center={center} zoom={12} scrollWheelZoom className="h-[520px] rounded-2xl">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {mappedIncidents.map((incident) => (
            <CircleMarker
              key={incident.id}
              center={[incident.latitude!, incident.longitude!]}
              radius={9}
              pathOptions={{
                color: incident.status === 'Resolved' ? '#059669' : incident.severity === 'Emergency' || incident.severity === 'High' ? '#dc2626' : '#0891b2',
                fillOpacity: 0.75,
              }}
            >
              <Popup>
                <strong>{incident.complaintId}</strong>
                <br />
                {incident.location}
                <br />
                {incident.status}
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
      <div className="text-xs text-slate-500">© OpenStreetMap contributors. {mappedIncidents.length} incident locations are plotted from the shared API dataset.</div>
    </div>
  )
}

function DetectionPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Detection Laboratory" subtitle="SIMULATED DATA — NOT A LIVE SENSOR" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Simulation controls">
          <div className="grid gap-3 sm:grid-cols-2">
            <button type="button" className="rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white">Start simulation</button>
            <button type="button" className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700">Pause</button>
            <button type="button" className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700">Normal reading</button>
            <button type="button" className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700">Suspected blockage</button>
            <button type="button" className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700">Possible overflow</button>
            <button type="button" className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700">Reset</button>
          </div>
        </Panel>
        <Panel title="Current detection result">
          <div className="space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between"><span>Result</span> <span className="font-semibold text-amber-700">Watch</span></div>
            <div className="flex items-center justify-between"><span>Water level</span> <span>71%</span></div>
            <div className="flex items-center justify-between"><span>Flow</span> <span>24%</span></div>
            <div className="rounded-xl bg-amber-50 p-3 text-amber-700">Persistent abnormal pattern with limited evidence. Thresholds: water level &gt; 75% and flow below 30% in three consecutive readings.</div>
          </div>
        </Panel>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartPanel title="Water level trend" />
        <ChartPanel title="Flow trend" />
      </div>
    </div>
  )
}

function AnalyticsPage({ incidents }: { incidents: IncidentRecord[] }) {
  const summary = summarizeIncidents(incidents)
  const severityTrend = getSeverityTrend(incidents)
  const hotspotData = getHotspotData(incidents)
  const averagePriority = incidents.length
    ? Math.round(incidents.reduce((total, incident) => total + (incident.priorityScore ?? 0), 0) / incidents.length)
    : 0

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics and Reports" subtitle="Operational trends from the stored local incident dataset" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total complaints" value={String(summary.total)} note="all local records" />
        <StatCard label="Open cases" value={String(summary.openCases)} note="active backlog" />
        <StatCard label="Resolved" value={String(summary.verifiedResolutions)} note="completed repairs" />
        <StatCard label="Avg priority" value={String(averagePriority)} note="out of 100" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Incidents by category">
          <ul className="space-y-2 text-sm text-slate-600">
            {severityTrend.map((entry) => (
              <li key={entry.name} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span>{entry.name}</span>
                <span className="font-semibold text-slate-800">{entry.value}</span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Hotspot review">
          <ul className="space-y-2 text-sm text-slate-600">
            {hotspotData.map((entry) => (
              <li key={entry.name} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span>{entry.name}</span>
                <span className="font-semibold text-slate-800">{entry.incidents} reports</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Filtered incident metadata</h3>
          <button type="button" className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-900">Export CSV</button>
        </div>
        <p className="text-sm text-slate-600">CSV export excludes personal details and image binaries by default to respect privacy constraints.</p>
      </div>
    </div>
  )
}

function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings and Data Management" subtitle="Local data controls, privacy settings, and demonstration mode" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Data controls">
          <div className="space-y-3">
            <button type="button" className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white">Initialize demo data</button>
            <button type="button" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700">Reset demonstration data</button>
            <button type="button" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700">Export JSON backup</button>
            <button type="button" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700">Import JSON backup</button>
          </div>
        </Panel>
        <Panel title="Storage and privacy">
          <ul className="space-y-3 text-sm text-slate-600">
            <li>• Incident records are shared through the configured backend API.</li>
            <li>• Demonstration data is seeded when the shared database is empty.</li>
            <li>• Private contact details are hidden from public complaint tracking.</li>
            <li>• Application version: v1.0.0-local-demo</li>
          </ul>
        </Panel>
      </div>
    </div>
  )
}

function ComplaintForm() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [form, setForm] = useState({
    drainageType: 'Roadside storm drain',
    problemCategory: 'Blockage',
    severity: 'Moderate',
    incidentDateTime: defaultIncidentDateTime,
    description: '',
    location: '',
    latitude: '',
    longitude: '',
    reporterName: '',
    contactInfo: '',
  })
  const [status, setStatus] = useState<string | null>(null)
  const updateField = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }))

  async function submitComplaint(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedFile || !form.description.trim() || !form.location.trim()) {
      setStatus('Add a photo, description, and location before submitting.')
      return
    }

    const now = new Date().toISOString()
    const incident: IncidentRecord = {
      id: crypto.randomUUID(),
      complaintId: `NIR-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
      primaryPhoto: { original: selectedFile, display: selectedFile, fileName: 'drain-evidence', sizeKb: 0 },
      additionalPhotos: [],
      drainageType: form.drainageType as IncidentRecord['drainageType'],
      problemCategory: form.problemCategory as IncidentRecord['problemCategory'],
      severity: form.severity as IncidentRecord['severity'],
      description: form.description.trim(),
      location: form.location.trim(),
      latitude: form.latitude ? Number(form.latitude) : undefined,
      longitude: form.longitude ? Number(form.longitude) : undefined,
      incidentDateTime: form.incidentDateTime,
      reporterName: form.reporterName.trim() || undefined,
      contactInfo: form.contactInfo.trim() || undefined,
      createdAt: now,
      updatedAt: now,
      status: 'Submitted',
      history: [{ id: crypto.randomUUID(), timestamp: now, status: 'Submitted', note: 'Complaint filed by resident with photo evidence.', actor: 'Citizen' }],
      notes: ['Initial inspection pending.'],
      resolutionEvidence: [],
      priorityScore: form.severity === 'Emergency' ? 90 : form.severity === 'High' ? 80 : form.severity === 'Moderate' ? 60 : 30,
    }

    try {
      await saveIncident(incident)
      setStatus(`Complaint ${incident.complaintId} submitted successfully.`)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to submit complaint.')
    }
  }

  return (
    <form onSubmit={submitComplaint} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft md:p-6">
      <div className="space-y-5">
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
          <Camera className="mx-auto mb-3 h-8 w-8 text-cyan-600" />
          <p className="text-sm font-medium text-slate-700">Drainage photograph (required)</p>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="mt-3 block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-cyan-500 file:px-4 file:py-2 file:font-semibold file:text-slate-900"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) {
                const reader = new FileReader()
                reader.addEventListener('load', () => setSelectedFile(String(reader.result)))
                reader.readAsDataURL(file)
              }
            }}
          />
          {selectedFile && <img src={selectedFile} alt="Selected drainage evidence" className="mt-4 h-48 w-full rounded-xl object-cover" />}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <SelectField label="Drainage type" value={form.drainageType} options={['Roadside storm drain', 'Sewage drain', 'Manhole', 'Open drainage channel']} onChange={(value) => updateField('drainageType', value)} />
          <SelectField label="Problem category" value={form.problemCategory} options={['Blockage', 'Overflow', 'Stagnant water', 'Damaged drainage', 'Foul smell', 'Other']} onChange={(value) => updateField('problemCategory', value)} />
          <SelectField label="Severity" value={form.severity} options={['Low', 'Moderate', 'High', 'Emergency']} onChange={(value) => updateField('severity', value)} />
          <InputField label="Incident date and time" type="datetime-local" value={form.incidentDateTime} onChange={(value) => updateField('incidentDateTime', value)} />
        </div>

        <InputField label="Description" type="textarea" placeholder="Describe the blockage, flooding, odor, or damage" value={form.description} onChange={(value) => updateField('description', value)} />
        <InputField label="Location or nearby landmark" placeholder="Example: Near Municipal Market, Ward 12" value={form.location} onChange={(value) => updateField('location', value)} />
        <div className="grid gap-4 md:grid-cols-2">
          <InputField label="Latitude" type="number" placeholder="12.9716" value={form.latitude} onChange={(value) => updateField('latitude', value)} />
          <InputField label="Longitude" type="number" placeholder="77.5946" value={form.longitude} onChange={(value) => updateField('longitude', value)} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <InputField label="Reporter name" placeholder="Optional" value={form.reporterName} onChange={(value) => updateField('reporterName', value)} />
          <InputField label="Contact information" placeholder="Optional" value={form.contactInfo} onChange={(value) => updateField('contactInfo', value)} />
        </div>

        <button type="submit" className="w-full rounded-xl bg-cyan-500 px-5 py-3 font-bold text-slate-950">Submit complaint</button>
        {status && <p className="rounded-xl bg-slate-100 p-3 text-sm text-slate-700">{status}</p>}
      </div>
    </form>
  )
}

function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-4">
      <h1 className="text-3xl font-black tracking-tight text-slate-900">{title}</h1>
      <p className="mt-2 text-slate-600">{subtitle}</p>
    </div>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
      <h3 className="mb-4 text-lg font-bold text-slate-900">{title}</h3>
      {children}
    </div>
  )
}

function StatCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-2xl border border-slate-700/70 bg-slate-800/60 p-4 shadow-soft">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-300">{label}</p>
      <p className="mt-3 text-3xl font-black text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-300">{note}</p>
    </div>
  )
}

function StatTile({ label, value, tone }: { label: string; value: string; tone: 'blue' | 'rose' | 'amber' | 'green' | 'cyan' }) {
  const palette = {
    blue: 'from-blue-500 to-cyan-500',
    rose: 'from-rose-500 to-red-500',
    amber: 'from-amber-500 to-yellow-500',
    green: 'from-emerald-500 to-green-600',
    cyan: 'from-cyan-500 to-teal-500',
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
      <div className={`h-2 bg-gradient-to-r ${palette[tone]}`} />
      <div className="p-4">
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-2 text-3xl font-black text-slate-900">{value}</p>
      </div>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description }: { icon: typeof Camera; title: string; description: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
      <div className="mb-4 inline-flex rounded-2xl bg-cyan-100 p-3 text-cyan-700">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-xl font-bold text-slate-900">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  )
}

function SummaryBox({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <h4 className="text-lg font-bold text-slate-900">{title}</h4>
      <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  )
}

function InfoPill({ icon: Icon, label }: { icon: typeof Camera; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-700/60 bg-slate-900/60 p-3 text-sm text-slate-200">
      <div className="rounded-full bg-cyan-500/20 p-2 text-cyan-300"><Icon className="h-4 w-4" /></div>
      {label}
    </div>
  )
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2">
      <span className={`h-3 w-3 rounded-full ${color}`} />
      <span>{label}</span>
    </div>
  )
}

function ChartPanel({ title }: { title: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
      <h3 className="mb-4 text-lg font-bold text-slate-900">{title}</h3>
      <div className="flex h-52 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
        Chart placeholder for {title}
      </div>
    </div>
  )
}

function InputField({ label, type = 'text', placeholder, value, onChange }: { label: string; type?: string; placeholder?: string; value?: string; onChange?: (value: string) => void }) {
  const isTextarea = type === 'textarea'
  return (
    <label className="block text-sm font-medium text-slate-700">
      <span className="mb-2 block">{label}</span>
      {isTextarea ? (
        <textarea className="min-h-24 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-700 focus:border-cyan-500 focus:outline-none" placeholder={placeholder} value={value} onChange={(event) => onChange?.(event.target.value)} />
      ) : (
        <input type={type} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-700 focus:border-cyan-500 focus:outline-none" placeholder={placeholder} value={value} onChange={(event) => onChange?.(event.target.value)} />
      )}
    </label>
  )
}

function SelectField({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      <span className="mb-2 block">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-700 focus:border-cyan-500 focus:outline-none">
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  )
}

function LoadingState({ text }: { text: string }) {
  return <div className="rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-6 text-sm text-cyan-800">{text}</div>
}

function AlertBanner({ text }: { text: string }) {
  return <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{text}</div>
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">{text}</div>
}

export default App
