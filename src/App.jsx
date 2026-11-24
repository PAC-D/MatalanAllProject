import matalanLogo from '../assets/matalan logo.png';
import pacdLogo from '../assets/pacd-logo.png';
import Admin from './Admin';
import Registration, { PackageScene } from './Registration';

const tools = [
  {
    number: '01',
    title: 'Carton Supply Report',
    description: 'Carton supply information and reporting.',
    href: 'https://matalan.pac-d.com/carton-supply-report/',
    icon: 'carton',
  },
  {
    number: '02',
    title: 'Price Calculator',
    description: 'Matalan packaging price calculations.',
    href: 'https://pac-d.github.io/matalanpricecalculator_mgt/',
    icon: 'calculator',
  },
  {
    number: '03',
    title: 'Label Generator',
    description: 'Product label creation and output.',
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

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="10" width="14" height="11" rx="1" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
    </svg>
  );
}

export default function App() {
  if (window.location.pathname.replace(/\/+$/, '') === '/admin') {
    return <Admin />;
  }

  if (window.location.pathname.replace(/\/+$/, '') === '/registration') {
    return <Registration />;
  }

  return (
    <div className="portal-page">
      <header className="portal-header">
        <a className="portal-pacd" href="/" aria-label="PAC-D home">
          <img src={pacdLogo} alt="PAC-D" />
        </a>
        <div className="portal-header-right">
          <img className="portal-matalan" src={matalanLogo} alt="Matalan" />
          <a className="portal-login" href="/admin">
            <LockIcon />
            <span>Admin login</span>
          </a>
        </div>
      </header>

      <main className="portal-main">
        <section className="portal-program" aria-labelledby="portal-title">
          <div className="portal-program-copy">
            <span className="portal-phase">PHASE 3</span>
            <h1 id="portal-title">
              Matalan Transit
              <span>Packaging Program</span>
            </h1>
            <div className="portal-program-code">
              <span>MAT / TP / 03</span>
              <strong>OPERATIONS</strong>
            </div>
          </div>
          <div className="portal-carton-panel">
            <PackageScene />
          </div>
        </section>

        <section className="portal-tools" aria-labelledby="portal-tools-title">
          <header className="portal-tools-heading">
            <h2 id="portal-tools-title">Program tools</h2>
            <span>{String(tools.length).padStart(2, '0')} MODULES</span>
          </header>

          <div className="portal-tool-grid">
            {tools.map((tool) => (
              <a
                className="portal-tool-card"
                href={tool.href}
                target="_blank"
                rel="noreferrer"
                key={tool.title}
                aria-label={`Open ${tool.title}`}
              >
                <div className="portal-tool-topline">
                  <span className="portal-tool-code">MAT / {tool.number}</span>
                  <span className="portal-tool-icon"><ToolIcon type={tool.icon} /></span>
                </div>
                <div className="portal-tool-copy">
                  <h3>{tool.title}</h3>
                  <p>{tool.description}</p>
                </div>
                <span className="portal-tool-open">Open</span>
              </a>
            ))}
          </div>
        </section>
      </main>

      <footer className="portal-footer">
        <span>MAT / TRANSIT PACKAGING</span>
        <strong>PHASE 3</strong>
      </footer>
    </div>
  );
}
