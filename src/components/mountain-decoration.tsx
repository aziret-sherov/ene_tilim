export function MountainDecoration() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {/* Aurora blobs */}
      <div
        className="aurora"
        style={{ width: 600, height: 400, background: '#c97b1e', top: '-10%', left: '-5%' }}
      />
      <div
        className="aurora"
        style={{ width: 500, height: 350, background: '#e06535', top: '10%', right: '-10%', animationDelay: '4s' }}
      />

      {/* Stars */}
      {STARS.map((s, i) => (
        <div
          key={i}
          className="star"
          style={{
            width: s.size,
            height: s.size,
            top: s.top,
            left: s.left,
            '--duration': `${s.duration}s`,
            '--delay': `${s.delay}s`,
          } as React.CSSProperties}
        />
      ))}

      {/* Tunduk (Kyrgyz yurt wheel) — top right ornament */}
      <div className="absolute top-8 right-8 opacity-[0.06]">
        <Tunduk size={180} />
      </div>

      {/* Mountain SVG layers */}
      <svg
        viewBox="0 0 1440 480"
        className="absolute bottom-0 w-full"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="mtn-far" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8a4a20" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#4a2010" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="mtn-mid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6a3018" stopOpacity="0.72" />
            <stop offset="100%" stopColor="#3a1808" stopOpacity="0.35" />
          </linearGradient>
          <linearGradient id="mtn-near" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2a1008" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#1c0805" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="snow-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fde8a0" stopOpacity="0.92" />
            <stop offset="100%" stopColor="#f5c060" stopOpacity="0.4" />
          </linearGradient>
          <filter id="mtn-blur">
            <feGaussianBlur stdDeviation="1.5" />
          </filter>
          <linearGradient id="atmo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1c0e05" stopOpacity="0" />
            <stop offset="100%" stopColor="#1c0e05" stopOpacity="0.65" />
          </linearGradient>
        </defs>

        {/* Layer 1 — farthest, hazy */}
        <g filter="url(#mtn-blur)" opacity="0.5">
          <polygon
            points="0,480 100,310 200,370 350,200 500,290 650,160 800,260 950,130 1100,240 1250,170 1380,270 1440,220 1440,480"
            fill="url(#mtn-far)"
          />
        </g>

        {/* Layer 2 — middle range */}
        <polygon
          points="0,480 80,380 160,420 300,260 440,350 560,200 680,310 800,180 920,290 1040,200 1160,320 1280,230 1380,310 1440,280 1440,480"
          fill="url(#mtn-mid)"
        />

        {/* Layer 3 — closest range */}
        <polygon
          points="0,480 120,400 240,440 360,320 480,400 580,280 700,370 820,240 940,360 1060,280 1180,390 1300,300 1440,380 1440,480"
          fill="url(#mtn-near)"
        />

        {/* Snow caps — far layer peaks */}
        <polygon points="350,200 380,230 320,230" fill="url(#snow-grad)" />
        <polygon points="650,160 685,198 615,198" fill="url(#snow-grad)" />
        <polygon points="950,130 988,172 912,172" fill="url(#snow-grad)" />
        <polygon points="1250,170 1282,204 1218,204" fill="url(#snow-grad)" />

        {/* Snow caps — mid layer */}
        <polygon points="560,200 590,228 530,228" fill="url(#snow-grad)" opacity="0.7" />
        <polygon points="800,180 832,212 768,212" fill="url(#snow-grad)" opacity="0.7" />
        <polygon points="1040,200 1068,228 1012,228" fill="url(#snow-grad)" opacity="0.6" />

        {/* Atmospheric haze at bottom */}
        <rect x="0" y="380" width="1440" height="100" fill="url(#atmo)" />
      </svg>
    </div>
  )
}

function Tunduk({ size }: { size: number }) {
  const c = size / 2
  const r = c - 4
  const spokes = 24
  const rings = 3

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="tunduk-ring">
      {/* Outer ring */}
      <circle cx={c} cy={c} r={r} fill="none" stroke="white" strokeWidth="1.5" />

      {/* Inner rings */}
      {Array.from({ length: rings }).map((_, i) => (
        <circle
          key={i}
          cx={c}
          cy={c}
          r={r * (0.72 - i * 0.22)}
          fill="none"
          stroke="white"
          strokeWidth="1"
        />
      ))}

      {/* Spokes */}
      {Array.from({ length: spokes }).map((_, i) => {
        const angle = (i / spokes) * Math.PI * 2
        const x1 = c + Math.cos(angle) * r * 0.18
        const y1 = c + Math.sin(angle) * r * 0.18
        const x2 = c + Math.cos(angle) * r
        const y2 = c + Math.sin(angle) * r
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" strokeWidth="0.8" />
        )
      })}

      {/* Center dot */}
      <circle cx={c} cy={c} r={4} fill="white" />
    </svg>
  )
}

const STARS = [
  { size: 2, top: '8%', left: '12%', duration: 3.2, delay: 0 },
  { size: 1.5, top: '5%', left: '28%', duration: 4.1, delay: 0.5 },
  { size: 2.5, top: '12%', left: '45%', duration: 2.8, delay: 1.2 },
  { size: 1, top: '6%', left: '60%', duration: 3.7, delay: 0.3 },
  { size: 2, top: '15%', left: '72%', duration: 4.5, delay: 0.8 },
  { size: 1.5, top: '4%', left: '85%', duration: 3.0, delay: 1.5 },
  { size: 2, top: '20%', left: '92%', duration: 3.8, delay: 0.2 },
  { size: 1, top: '9%', left: '38%', duration: 5.0, delay: 2.0 },
  { size: 2.5, top: '3%', left: '55%', duration: 2.5, delay: 0.7 },
  { size: 1.5, top: '18%', left: '20%', duration: 4.2, delay: 1.0 },
  { size: 1, top: '25%', left: '78%', duration: 3.5, delay: 0.4 },
  { size: 2, top: '7%', left: '95%', duration: 4.8, delay: 1.8 },
  { size: 1.5, top: '22%', left: '50%', duration: 3.3, delay: 0.6 },
  { size: 1, top: '11%', left: '8%', duration: 4.0, delay: 2.2 },
  { size: 2, top: '16%', left: '33%', duration: 3.6, delay: 0.9 },
]
