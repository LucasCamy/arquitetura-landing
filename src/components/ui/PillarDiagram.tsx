import type { PillarKind } from '../../data/content'

const label = 'fill-ash font-mono text-[11px]'

/** Detalhe construtivo esquemático de cada pilar tectônico. */
export function PillarDiagram({ kind }: { kind: PillarKind }) {
  return (
    <svg viewBox="0 0 400 240" role="img" aria-label={descriptions[kind]} className="h-auto w-full">
      {Array.from({ length: 9 }, (_, i) => (
        <line key={i} x1={i * 50} y1="0" x2={i * 50} y2="240" className="stroke-line" strokeWidth="1" />
      ))}
      {kind === 'topografia' && <Topografia />}
      {kind === 'estrutura' && <Estrutura />}
      {kind === 'materia' && <Materia />}
      {kind === 'luz' && <Luz />}
    </svg>
  )
}

const descriptions: Record<PillarKind, string> = {
  topografia: 'Curvas de nível do terreno com a casa assentada em dois platôs e desnível de 4,80 metros.',
  estrutura: 'Pórtico de concreto com vão livre de 12 metros e balanço de 4 metros.',
  materia: 'Corte de parede em quatro camadas: concreto, isolamento, brise de madeira e vidro.',
  luz: 'Corte solar: o beiral bloqueia o sol alto de verão e admite o sol baixo de inverno.',
}

function Topografia() {
  return (
    <g>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path
          key={i}
          d={`M0 ${210 - i * 24} C 90 ${200 - i * 26} 170 ${222 - i * 30} 260 ${190 - i * 24} S 360 ${150 - i * 22} 400 ${160 - i * 22}`}
          fill="none"
          className="stroke-line-strong"
          strokeWidth="1"
        />
      ))}
      <rect x="70" y="150" width="120" height="44" className="fill-stone stroke-limestone" strokeWidth="1.5" />
      <rect x="190" y="118" width="130" height="44" className="fill-stone stroke-limestone" strokeWidth="1.5" />
      <line x1="345" y1="118" x2="345" y2="194" className="stroke-clay" strokeWidth="1.5" />
      <line x1="339" y1="118" x2="351" y2="118" className="stroke-clay" strokeWidth="1.5" />
      <line x1="339" y1="194" x2="351" y2="194" className="stroke-clay" strokeWidth="1.5" />
      <text x="356" y="160" className="fill-clay-ink font-mono text-[11px]">
        Δ 4,80 m
      </text>
      <text x="74" y="212" className={label}>
        platô +0.00m
      </text>
      <text x="194" y="110" className={label}>
        platô +2.40m
      </text>
    </g>
  )
}

function Estrutura() {
  return (
    <g>
      <line x1="0" y1="200" x2="400" y2="200" className="stroke-limestone" strokeWidth="2" />
      <rect x="40" y="90" width="12" height="110" className="fill-stone stroke-limestone" strokeWidth="1.5" />
      <rect x="268" y="90" width="12" height="110" className="fill-stone stroke-limestone" strokeWidth="1.5" />
      <rect x="40" y="74" width="330" height="16" className="fill-stone stroke-limestone" strokeWidth="1.5" />
      <line x1="46" y1="50" x2="274" y2="50" className="stroke-clay" strokeWidth="1" />
      <line x1="46" y1="44" x2="46" y2="56" className="stroke-clay" strokeWidth="1" />
      <line x1="274" y1="44" x2="274" y2="56" className="stroke-clay" strokeWidth="1" />
      <text x="160" y="42" textAnchor="middle" className="fill-clay-ink font-mono text-[11px]">
        vão 12,00 m
      </text>
      <line x1="274" y1="34" x2="370" y2="34" className="stroke-line-strong" strokeWidth="1" />
      <line x1="370" y1="28" x2="370" y2="40" className="stroke-line-strong" strokeWidth="1" />
      <text x="322" y="26" textAnchor="middle" className={label}>
        balanço 4,00 m
      </text>
      <text x="58" y="190" className={label}>
        pilar 30×30
      </text>
    </g>
  )
}

function Materia() {
  const layers = [
    { x: 70, w: 70, name: 'concreto 25 cm', fill: 'fill-stone' },
    { x: 140, w: 30, name: 'isolamento', fill: 'fill-basalt' },
    { x: 200, w: 14, name: 'brise cumaru', fill: 'fill-stone-2' },
    { x: 290, w: 8, name: 'vidro laminado', fill: 'fill-stone-2' },
  ]
  return (
    <g>
      {layers.map((l, i) => (
        <g key={l.name}>
          <rect x={l.x} y="40" width={l.w} height="160" className={`${l.fill} stroke-limestone`} strokeWidth="1.25" />
          <line x1={l.x + l.w / 2} y1="200" x2={l.x + l.w / 2} y2={214 + (i % 2) * 12} className="stroke-line-strong" />
          <text x={l.x + l.w / 2} y={226 + (i % 2) * 12} textAnchor="middle" className={label}>
            {l.name}
          </text>
        </g>
      ))}
      {[60, 90, 120, 150, 180].map((y) => (
        <line key={y} x1="70" y1={y} x2="140" y2={y} className="stroke-line-strong" strokeWidth="1" />
      ))}
      <text x="340" y="60" className="fill-clay-ink font-mono text-[11px]">
        exterior
      </text>
      <text x="20" y="60" className={label}>
        interior
      </text>
    </g>
  )
}

function Luz() {
  return (
    <g>
      <line x1="0" y1="200" x2="400" y2="200" className="stroke-limestone" strokeWidth="2" />
      <path d="M90 200 V90 H300 V102 H112 V200 Z" className="fill-stone stroke-limestone" strokeWidth="1.5" />
      <line x1="250" y1="102" x2="250" y2="200" className="stroke-limestone" strokeWidth="1" strokeDasharray="3 4" />
      <line x1="370" y1="10" x2="300" y2="104" className="stroke-line-strong" strokeWidth="1.5" strokeDasharray="6 5" />
      <text x="372" y="26" textAnchor="end" className={label}>
        verão 90°
      </text>
      <line x1="400" y1="118" x2="160" y2="196" className="stroke-clay" strokeWidth="1.5" strokeDasharray="6 5" />
      <text x="396" y="110" textAnchor="end" className="fill-clay-ink font-mono text-[11px]">
        inverno 43°
      </text>
      <line x1="250" y1="80" x2="300" y2="80" className="stroke-line-strong" />
      <text x="275" y="72" textAnchor="middle" className={label}>
        beiral 1,20 m
      </text>
    </g>
  )
}
