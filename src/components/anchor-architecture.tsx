export function ArchitectureDiagram() {
  return (
    <figure className="my-10 max-w-2xl mx-auto">
      <svg
        viewBox="0 0 720 370"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        role="img"
        aria-label="Architecture diagram showing the data flow from keystrokes through ML inference to sprite mood updates and Enter key blocking"
      >
        {/* Boxes */}
        <rect x="10" y="60" width="120" height="50" rx="8"
          className="fill-primary/10 stroke-primary" strokeWidth="2" />
        <text x="70" y="90" textAnchor="middle"
          className="fill-foreground text-[13px] font-medium">Keystrokes</text>

        <rect x="180" y="60" width="120" height="50" rx="8"
          className="fill-primary/10 stroke-primary" strokeWidth="2" />
        <text x="240" y="82" textAnchor="middle"
          className="fill-foreground text-[13px] font-medium">Rope</text>
        <text x="240" y="98" textAnchor="middle"
          className="fill-muted-foreground text-[11px]">Buffer</text>

        <rect x="350" y="60" width="150" height="50" rx="8"
          className="fill-primary/15 stroke-primary" strokeWidth="2.5" />
        <text x="425" y="82" textAnchor="middle"
          className="fill-foreground text-[13px] font-bold">Toxicity</text>
        <text x="425" y="98" textAnchor="middle"
          className="fill-muted-foreground text-[11px]">CoreML Classifier</text>

        {/* "Continuous" branch (top) */}
        <rect x="570" y="10" width="140" height="50" rx="8"
          className="fill-muted/50 stroke-border" strokeWidth="1.5" />
        <text x="640" y="32" textAnchor="middle"
          className="fill-foreground text-[13px] font-medium">EMA Score</text>
        <text x="640" y="48" textAnchor="middle"
          className="fill-muted-foreground text-[10px]">background, continuous</text>

        <rect x="570" y="80" width="140" height="50" rx="8"
          className="fill-primary/10 stroke-primary" strokeWidth="2" />
        <text x="640" y="102" textAnchor="middle"
          className="fill-foreground text-[13px] font-medium">Sprite Mood</text>
        <text x="640" y="118" textAnchor="middle"
          className="fill-muted-foreground text-[10px]">{"😊 → 😟 → 😢"}</text>

        {/* "On Enter" branch (bottom) */}
        <rect x="350" y="170" width="150" height="50" rx="8"
          className="fill-muted/50 stroke-border" strokeWidth="1.5" />
        <text x="425" y="192" textAnchor="middle"
          className="fill-foreground text-[13px] font-medium">Enter Pressed?</text>
        <text x="425" y="208" textAnchor="middle"
          className="fill-muted-foreground text-[10px]">synchronous, ~100ms</text>

        <rect x="250" y="280" width="120" height="50" rx="8"
          className="fill-[hsl(var(--destructive))]/10 stroke-[hsl(var(--destructive))]" strokeWidth="2" />
        <text x="310" y="302" textAnchor="middle"
          className="fill-foreground text-[13px] font-medium">Block</text>
        <text x="310" y="318" textAnchor="middle"
          className="fill-muted-foreground text-[10px]">companion reacts</text>

        <rect x="480" y="280" width="120" height="50" rx="8"
          className="fill-primary/10 stroke-primary" strokeWidth="2" />
        <text x="540" y="302" textAnchor="middle"
          className="fill-foreground text-[13px] font-medium">Allow</text>
        <text x="540" y="318" textAnchor="middle"
          className="fill-muted-foreground text-[10px]">send message</text>

        <rect x="130" y="280" width="80" height="50" rx="8"
          className="fill-muted/50 stroke-border" strokeWidth="1.5" />
        <text x="170" y="302" textAnchor="middle"
          className="fill-foreground text-[12px] font-medium">Opt+↵</text>
        <text x="170" y="318" textAnchor="middle"
          className="fill-muted-foreground text-[10px]">override</text>

        {/* Arrows - horizontal flow */}
        <line x1="130" y1="85" x2="180" y2="85"
          className="stroke-muted-foreground" strokeWidth="1.5" markerEnd="url(#arrowhead)" />

        <line x1="300" y1="85" x2="350" y2="85"
          className="stroke-muted-foreground" strokeWidth="1.5" markerEnd="url(#arrowhead)" />

        {/* Arrow: Classifier → EMA Score (top right) */}
        <path d="M500,75 L540,35 L570,35"
          className="stroke-muted-foreground" strokeWidth="1.5" fill="none" markerEnd="url(#arrowhead)" />

        {/* Arrow: EMA Score → Sprite Mood */}
        <line x1="640" y1="60" x2="640" y2="80"
          className="stroke-muted-foreground" strokeWidth="1.5" markerEnd="url(#arrowhead)" />

        {/* Arrow: Classifier → Enter check (down) */}
        <path d="M425,110 L425,170"
          className="stroke-muted-foreground" strokeWidth="1.5" fill="none" markerEnd="url(#arrowhead)" />

        {/* Arrow: Enter check → Block (toxic) */}
        <path d="M375,220 L310,280"
          className="stroke-[hsl(var(--destructive))]" strokeWidth="1.5" fill="none" markerEnd="url(#arrowhead-destructive)" />
        <text x="320" y="252" textAnchor="middle"
          className="fill-[hsl(var(--destructive))] text-[11px] font-medium">toxic</text>

        {/* Arrow: Enter check → Allow (clean) */}
        <path d="M475,220 L540,280"
          className="stroke-primary" strokeWidth="1.5" fill="none" markerEnd="url(#arrowhead-primary)" />
        <text x="530" y="252" textAnchor="middle"
          className="fill-primary text-[11px] font-medium">clean</text>

        {/* Arrow: Block → Override */}
        <line x1="250" y1="305" x2="210" y2="305"
          className="stroke-muted-foreground" strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#arrowhead)" />

        {/* Labels on main flow */}
        <text x="155" y="75" textAnchor="middle"
          className="fill-muted-foreground text-[10px]">chars</text>
        <text x="325" y="75" textAnchor="middle"
          className="fill-muted-foreground text-[10px]">512 chars</text>

        {/* Branch labels */}
        <text x="530" y="60" textAnchor="end"
          className="fill-muted-foreground text-[10px] italic">continuous</text>
        <text x="445" y="148" textAnchor="middle"
          className="fill-muted-foreground text-[10px] italic">on Enter</text>

        {/* Arrowhead markers */}
        <defs>
          <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6" className="fill-muted-foreground" />
          </marker>
          <marker id="arrowhead-destructive" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6" className="fill-[hsl(var(--destructive))]" />
          </marker>
          <marker id="arrowhead-primary" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6" className="fill-primary" />
          </marker>
        </defs>
      </svg>
      <figcaption className="mt-3 text-center text-sm text-muted-foreground">
        Data flow: keystrokes are buffered, classified, and routed through two paths — continuous mood updates and synchronous blocking on Enter.
      </figcaption>
    </figure>
  )
}
