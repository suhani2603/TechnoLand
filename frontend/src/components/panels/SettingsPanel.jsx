import React, { useState } from 'react'
import useMapStore from '../../store/mapStore.js'
import './SettingsPanel.css'

/* ── AWS integration plan ─────────────────────────────────── */
const AWS_SERVICES = [
  { icon: '☁️',  name: 'Amazon S3',         status: 'planned', desc: 'GeoJSON layer storage + React/Vite static site hosting'             },
  { icon: '⚡',  name: 'AWS Lambda',         status: 'planned', desc: 'Serverless handlers: getLayers, getFeature, chat, health'            },
  { icon: '🔗',  name: 'API Gateway',        status: 'planned', desc: 'HTTP API with Cognito JWT authorizer, CORS configured'              },
  { icon: '🤖',  name: 'Amazon Bedrock',     status: 'planned', desc: 'Claude 3.5 Sonnet — grounded GIS AI responses (model access req.)'  },
  { icon: '🗄️', name: 'Amazon DynamoDB',    status: 'planned', desc: 'Feature attribute store, layer metadata table'                      },
  { icon: '🔐',  name: 'Amazon Cognito',     status: 'planned', desc: 'User pool, hosted UI, JWT authorizer for all API routes'            },
  { icon: '🌐',  name: 'Amazon CloudFront',  status: 'planned', desc: 'CDN + HTTPS + SPA routing for global delivery'                     },
  { icon: '📊',  name: 'Amazon CloudWatch',  status: 'planned', desc: 'Lambda error monitoring, Bedrock token usage tracking'             },
]

/* ── Config rows ─────────────────────────────────────────── */
const CONFIG = [
  { k: 'Application',      v: 'TechnoLand'                                  },
  { k: 'Version',          v: 'Phase 2 — Local demo mode'                   },
  { k: 'Environment',      v: 'Demo (local, no AWS connection)'             },
  { k: 'Study Region',     v: 'Dehradun District, Uttarakhand, India'       },
  { k: 'Map Engine',       v: 'MapLibre GL JS v4 via react-map-gl'          },
  { k: 'Basemap',          v: 'OpenFreeMap Liberty (open, no API key)'      },
  { k: 'AI Backend',       v: 'Mock contextual engine → AWS Bedrock (Phase 3)' },
  { k: 'Auth',             v: 'Not configured → Amazon Cognito (Phase 3)'   },
  { k: 'AWS Region',       v: 'ap-south-1 (Mumbai) — configured'            },
  { k: 'CDK Infrastructure',v:'Defined — not deployed'                      },
]

/* ── Phase roadmap ───────────────────────────────────────── */
const PHASES = [
  {
    id: 1,
    label: 'Phase 1',
    title: 'Project Scaffold',
    status: 'done',
    items: ['React + Vite + MapLibre frontend', 'Lambda/API stubs (mock mode)', 'CDK infrastructure defined', 'Synthetic demo GeoJSON data'],
  },
  {
    id: 2,
    label: 'Phase 2',
    title: 'Full UI + Data Layer',
    status: 'done',
    items: ['Landing page & onboarding', 'AI evidence engine (mock)', 'Insights, Data Sources, Settings panels', 'Kharif crop PDFs downloaded', 'NWDP water data URL identified'],
  },
  {
    id: 3,
    label: 'Phase 3',
    title: 'AWS Integration',
    status: 'next',
    items: ['cdk deploy all stacks (ap-south-1)', 'Enable Bedrock Claude 3.5 Sonnet model access', 'Seed DynamoDB with feature attributes', 'Upload GeoJSON to S3 data bucket', 'Set VITE_USE_MOCK=false + CloudFront URL'],
  },
  {
    id: 4,
    label: 'Phase 4',
    title: 'Real Data',
    status: 'future',
    items: ['Process NWDP Uttarakhand water GeoJSON', 'Clip OSM PBF → Dehradun infrastructure GeoJSON', 'Download & process Bhuvan LULC (manual)', 'Replace synthetic layers with public-source layers'],
  },
]

const PHASE_STATUS = {
  done:   { color: '#4ade80', label: 'Complete' },
  next:   { color: '#fbbf24', label: 'Next'     },
  future: { color: '#64748b', label: 'Future'   },
}

/* ── Main component ─────────────────────────────────────── */
export default function SettingsPanel() {
  const { setActivePage } = useMapStore()
  const [section, setSection] = useState('about')

  const SECTIONS = [
    { id: 'about',  label: 'About'          },
    { id: 'config', label: 'Configuration'  },
    { id: 'aws',    label: 'AWS Plan'        },
    { id: 'roadmap',label: 'Roadmap'         },
    { id: 'data',   label: 'Data Disclaimer' },
  ]

  return (
    <div className="sp-panel">
      {/* Header */}
      <div className="sp-panel__header">
        <div>
          <h1 className="sp-panel__title">Settings &amp; About</h1>
          <p className="sp-panel__subtitle">Application configuration, AWS architecture and roadmap</p>
        </div>
        <button
          className="sp-panel__back-btn"
          onClick={() => setActivePage('map')}
          aria-label="Back to map"
        >
          <BackIcon /> Map
        </button>
      </div>

      {/* Section tabs */}
      <div className="sp-panel__tabs" role="tablist">
        {SECTIONS.map(({ id, label }) => (
          <button
            key={id}
            role="tab"
            className={['sp-tab', section === id ? 'active' : ''].join(' ')}
            onClick={() => setSection(id)}
            aria-selected={section === id}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Body — scrollable */}
      <div className="sp-panel__body">

        {/* ── About ── */}
        {section === 'about' && (
          <div className="sp-section animate-fadeIn">
            <div className="sp-hero">
              <svg viewBox="0 0 48 48" fill="none" width="48" height="48" aria-hidden="true">
                <rect width="48" height="48" rx="12" fill="#16a34a"/>
                <path d="M12 32 L24 14 L36 32 Z" fill="white" opacity="0.92"/>
                <circle cx="24" cy="24" r="5" fill="#86efac"/>
              </svg>
              <div>
                <p className="sp-hero__name">TechnoLand</p>
                <p className="sp-hero__tagline">Connecting Land, Data &amp; Development</p>
                <p className="sp-hero__desc">
                  A GIS-based decision-support platform that turns geospatial data into
                  understandable, evidence-backed insights for rural development planning.
                </p>
              </div>
            </div>

            <div className="sp-divider" />

            <div className="sp-feature-list">
              {[
                { icon: '🗺️', title: 'Interactive GIS Map',      desc: 'MapLibre GL JS with 4 data layers for Dehradun, Uttarakhand.' },
                { icon: '🔍', title: 'Land Inspector',           desc: 'Click any feature to explore attributes and development signals.' },
                { icon: '📊', title: 'Evidence-Based Insights',  desc: 'Every analysis insight shows the data behind it.' },
                { icon: '🤖', title: 'AI Assistant',             desc: 'Contextual Q&A grounded in actual feature data, not generic responses.' },
                { icon: '📂', title: 'Data Provenance',          desc: 'Clear distinction between public data, derived analysis, and synthetic demo data.' },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="sp-feature-row">
                  <span className="sp-feature-row__icon" aria-hidden="true">{icon}</span>
                  <div>
                    <p className="sp-feature-row__title">{title}</p>
                    <p className="sp-feature-row__desc">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Configuration ── */}
        {section === 'config' && (
          <div className="sp-section animate-fadeIn">
            <p className="sp-section__title">Runtime Configuration</p>
            <dl className="sp-config-table">
              {CONFIG.map(({ k, v }) => (
                <div key={k} className="sp-config-row">
                  <dt className="sp-config-key">{k}</dt>
                  <dd className="sp-config-val">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="sp-info-box">
              <InfoIcon />
              <p>
                To connect AWS services, copy CDK stack outputs to{' '}
                <code>frontend/.env.local</code> and set{' '}
                <code>VITE_USE_MOCK=false</code>. No component code changes needed.
              </p>
            </div>
          </div>
        )}

        {/* ── AWS Plan ── */}
        {section === 'aws' && (
          <div className="sp-section animate-fadeIn">
            <p className="sp-section__title">Planned AWS Architecture</p>
            <p className="sp-section__note">
              All stacks are defined in <code>infrastructure/</code> using AWS CDK (TypeScript).
              None are deployed yet. Target region: <strong>ap-south-1 (Mumbai)</strong>.
            </p>
            <div className="sp-aws-list">
              {AWS_SERVICES.map(({ icon, name, status, desc }) => (
                <div key={name} className="sp-aws-row">
                  <span className="sp-aws-row__icon" aria-hidden="true">{icon}</span>
                  <div className="sp-aws-row__text">
                    <p className="sp-aws-row__name">{name}</p>
                    <p className="sp-aws-row__desc">{desc}</p>
                  </div>
                  <span className="badge badge--gray">Planned</span>
                </div>
              ))}
            </div>
            <div className="sp-info-box sp-info-box--warn">
              <WarnIcon />
              <p>
                Before deploying: enable Claude 3.5 Sonnet model access in the Bedrock
                console (ap-south-1 or us-east-1). Run <code>cdk bootstrap</code> then{' '}
                <code>cdk deploy --all</code> from <code>infrastructure/</code>.
              </p>
            </div>
          </div>
        )}

        {/* ── Roadmap ── */}
        {section === 'roadmap' && (
          <div className="sp-section animate-fadeIn">
            <p className="sp-section__title">Development Roadmap</p>
            <div className="sp-phases">
              {PHASES.map((phase) => {
                const pm = PHASE_STATUS[phase.status]
                return (
                  <div key={phase.id} className={`sp-phase sp-phase--${phase.status}`}>
                    <div className="sp-phase__header">
                      <span className="sp-phase__label" style={{ color: pm.color }}>
                        {phase.label}
                      </span>
                      <span className="sp-phase__title">{phase.title}</span>
                      <span className="sp-phase__status-pill" style={{ background: `${pm.color}18`, color: pm.color }}>
                        {pm.label}
                      </span>
                    </div>
                    <ul className="sp-phase__items">
                      {phase.items.map((item) => (
                        <li key={item}>
                          <span className="sp-phase__check" aria-hidden="true"
                            style={{ color: phase.status === 'done' ? '#4ade80' : '#334155' }}>
                            {phase.status === 'done' ? '✓' : '○'}
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Data disclaimer ── */}
        {section === 'data' && (
          <div className="sp-section animate-fadeIn">
            <p className="sp-section__title">Data Classification</p>

            <div className="sp-data-type">
              <div className="sp-data-type__header">
                <span className="badge badge--blue">Public Source Data</span>
              </div>
              <p className="sp-data-type__desc">
                Data obtained directly from official government or authoritative public sources
                (Agriculture Dept. Uttarakhand, NWDP/NWIC, ISRO/NRSC Bhuvan, OpenStreetMap).
                Downloaded without modification and stored in <code>data/raw/</code>.
                Source URLs and download dates are recorded in <code>data/raw/DATA_SOURCES.md</code>.
              </p>
            </div>

            <div className="sp-data-type">
              <div className="sp-data-type__header">
                <span className="badge badge--purple">Derived Analysis</span>
              </div>
              <p className="sp-data-type__desc">
                Calculations, classifications and insights generated by TechnoLand from
                public source data. Derived values such as the "Development Priority" indicator
                are clearly labelled as <em>TechnoLand Derived</em> and do not represent
                official government classifications.
              </p>
            </div>

            <div className="sp-data-type">
              <div className="sp-data-type__header">
                <span className="badge badge--gray">Synthetic Demonstration Data</span>
              </div>
              <p className="sp-data-type__desc">
                All parcel boundaries, zone polygons, infrastructure point locations,
                and associated attribute values currently displayed on the map are
                <strong> entirely fictional</strong> and were created solely for the
                TechnoLand hackathon prototype. They do not represent real cadastral records,
                official land records, real ownership information, or any official measurement.
                The geographic extent of Dehradun District is used for context only.
              </p>
            </div>

            <div className="sp-info-box sp-info-box--warn">
              <WarnIcon />
              <p>
                <strong>No private data:</strong> TechnoLand does not display, process, or store
                any private land ownership records, Aadhaar numbers, personal contact information,
                or any other personally identifiable information.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

/* ── Icons ───────────────────────────────────────────────── */
function BackIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
}
function InfoIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" style={{flexShrink:0}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
}
function WarnIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" style={{flexShrink:0}}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
}
