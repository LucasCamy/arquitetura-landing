import { useId } from 'react'
import type { SectionProfile } from '../../data/content'

/** Corte esquemático da tipologia: grade, níveis cotados, massa, vazios, terreno e raio solar. */
export function SectionDiagram({ profile, title }: { profile: SectionProfile; title: string }) {
  const id = useId().replace(/:/g, '')
  const hatch = `hatch-${id}`
  const arrow = `arrow-${id}`
  const { sun } = profile

  return (
    <svg viewBox="0 0 600 290" role="img" aria-labelledby={`${id}-t`} className="h-auto w-full">
      <title id={`${id}-t`}>{`Corte esquemático: ${title}`}</title>
      <defs>
        <pattern id={hatch} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="8" className="stroke-line-strong" strokeWidth="1" />
        </pattern>
        <marker id={arrow} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" className="fill-clay" />
        </marker>
      </defs>

      {Array.from({ length: 13 }, (_, i) => (
        <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50} y2="290" className="stroke-line" strokeWidth="1" />
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <line key={`h${i}`} x1="0" y1={i * 50 + 36} x2="600" y2={i * 50 + 36} className="stroke-line" strokeWidth="1" />
      ))}

      {profile.levels.map((level) => (
        <g key={level.label}>
          <line
            x1="0"
            y1={level.y}
            x2="600"
            y2={level.y}
            className="stroke-line-strong"
            strokeWidth="1"
            strokeDasharray="4 6"
          />
          <text x="6" y={level.y - 5} className="fill-ash font-mono text-[11px]">
            {level.label}
          </text>
        </g>
      ))}

      {profile.neighbors && (
        <path d={profile.neighbors} fill={`url(#${hatch})`} className="stroke-line-strong" strokeWidth="1" />
      )}
      <path d={profile.mass} className="fill-stone stroke-limestone" strokeWidth="1.5" strokeLinejoin="miter" />
      {profile.voids && <path d={profile.voids} className="fill-basalt stroke-limestone" strokeWidth="1" />}
      {profile.details && <path d={profile.details} fill="none" className="stroke-limestone" strokeWidth="1.25" />}
      <path d={profile.terrain} fill="none" className="stroke-limestone" strokeWidth="2" />

      <line
        x1={sun.x1}
        y1={sun.y1}
        x2={sun.x2}
        y2={sun.y2}
        className="stroke-clay"
        strokeWidth="1.5"
        strokeDasharray="6 5"
        markerEnd={`url(#${arrow})`}
      />
      <circle cx={sun.x1} cy={sun.y1} r="7" className="fill-none stroke-clay" strokeWidth="1.5" />
      <text x={sun.x1 - 12} y={sun.y1 + 4} textAnchor="end" className="fill-clay-ink font-mono text-[11px]">
        {sun.label}
      </text>
    </svg>
  )
}
