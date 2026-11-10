import matalanLogo from '../assets/matalan logo.png';
import pacdLogo from '../assets/pacd-logo.png';

const tools = [
  {
    number: '01',
    title: 'Carton Supply Report',
    description: 'Review carton supply information and reporting.',
    href: 'https://matalan.pac-d.com/carton-supply-report/',
    icon: 'carton',
  },
  {
    number: '02',
    title: 'Price Calculator',
    description: 'Calculate and manage Matalan pricing with ease.',
    href: 'https://pac-d.github.io/matalanpricecalculator_mgt/',
    icon: 'calculator',
  },
  {
    number: '03',
    title: 'Label Generator',
    description: 'Create ready-to-use product labels in a few steps.',
    href: 'https://pac-d.github.io/Matalan-Label-Generator-v2/',
    icon: 'label',
  },
];

function ToolIcon({ type }) {
  if (type === 'calculator') {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <rect x="10" y="5" width="28" height="38" rx="4" />
        <path d="M16 12h16v8H16zM17 27h2m5 0h2m5 0h2m-16 7h2m5 0h2m5 0h2" />
      </svg>
    );
  }

  if (type === 'label') {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M7 22.5 22.5 7H39a2 2 0 0 1 2 2v16.5L25.5 41a3 3 0 0 1-4.2 0L7 26.7a3 3 0 0 1 0-4.2Z" />
        <circle cx="32" cy="16" r="3" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="m7 15 17-9 17 9-17 9-17-9Zm0 0v19l17 9 17-9V15M24 24v19" />
      <path d="m15 11 17 9v9" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  );
}

function CartonIllustration() {
  return (
    <div className="carton-scene" aria-hidden="true">
      <div className="orbit orbit-one" />
      <div className="orbit orbit-two" />
      <div className="carton carton-back">
        <span>PAC-D</span>
      </div>
      <div className="carton carton-front">
        <span className="carton-tape" />
        <span className="carton-mark">M</span>
        <span className="carton-lines" />
      </div>
      <div className="floor-line" />
    </div>
  );
}

export default function App() {
  return (
    <div className="page-shell">
      <header className="site-header">
        <a className="brand-lockup" href="#top" aria-label="Matalan and PAC-D home">
          <img className="matalan-logo" src={matalanLogo} alt="Matalan" />
          <span className="brand-divider" />
          <img className="pacd-logo" src={pacdLogo} alt="PAC-D" />
        </a>
        <span className="header-label">TOOLS PORTAL</span>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <h1 id="hero-title">Matalan tools,<br /><em>ready when you are.</em></h1>
            <a className="jump-link" href="#tools">
              Explore tools <span>↓</span>
            </a>
          </div>
          <CartonIllustration />
        </section>

        <section className="tools-section" id="tools" aria-label="Available tools">
          <div className="section-heading">
            <p>SELECT A TOOL</p>
          </div>

          <div className="tool-grid">
            {tools.map((tool) => (
              <a
                className="tool-card"
                href={tool.href}
                target="_blank"
                rel="noreferrer"
                key={tool.title}
                aria-label={`Open ${tool.title}`}
              >
                <div className="card-topline">
                  <span className="tool-number">{tool.number}</span>
                  <span className="tool-icon"><ToolIcon type={tool.icon} /></span>
                </div>
                <div className="card-copy">
                  <h2>{tool.title}</h2>
                  <p>{tool.description}</p>
                </div>
                <span className="open-tool">
                  Open tool <span className="arrow"><ArrowIcon /></span>
                </span>
              </a>
            ))}
          </div>
        </section>
      </main>

      <footer>
        <span>POWERED BY PAC-D</span>
      </footer>
    </div>
  );
}
