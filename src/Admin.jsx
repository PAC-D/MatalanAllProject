import { useEffect, useMemo, useState } from 'react';
import { downloadRegistrantsExcel } from './utils/exportRegistrantsExcel';

const matalanLogo = '/brand-assets/matalan-logo.png';
const pacdLogo = '/brand-assets/pacd-logo.png';

function formatDate(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3v12m-4-4 4 4 4-4M5 20h14" />
    </svg>
  );
}

function RegistrantsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 18c.7-3 2.5-4.5 5.5-4.5s4.8 1.5 5.5 4.5M16 7.5h4M18 5.5v4M16.5 14H21M16.5 18H21" />
    </svg>
  );
}

function CalculatorIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="2.5" width="14" height="19" rx="2" />
      <path d="M8 6h8v4H8zM8.5 14h1m2.5 0h1m2.5 0h1m-8 3.5h1m2.5 0h1m2.5 0h1" />
    </svg>
  );
}

function LabelIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3.5 11.2 11.2 3.5H20a.5.5 0 0 1 .5.5v8.8l-7.7 7.7a1.8 1.8 0 0 1-2.6 0l-6.7-6.7a1.8 1.8 0 0 1 0-2.6Z" />
      <circle cx="16.5" cy="7.5" r="1.5" />
    </svg>
  );
}

function ReportIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 3.5h9l5 5V20.5H5zM14 3.5v5h5M8.5 13h7M8.5 16.5h7" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h16M9 7V4h6v3m3 0-1 14H7L6 7m4 4v6m4-6v6" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14 5V3H4v18h10v-2M10 12h11m-4-4 4 4-4 4" />
    </svg>
  );
}

export default function Admin() {
  const pathname = window.location.pathname.replace(/\/+$/, '');
  const isPriceCalculator = pathname === '/admin/pricecalculator';
  const isLabelGenerator = pathname === '/admin/label-generator';
  const isTool = isPriceCalculator || isLabelGenerator;
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return window.localStorage.getItem('matalan-admin-sidebar-collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const [calculatorHeight, setCalculatorHeight] = useState(980);
  const [registrants, setRegistrants] = useState([]);
  const [loadState, setLoadState] = useState('loading');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const filteredRegistrants = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return registrants;
    return registrants.filter((registrant) => (
      `${registrant.supplierName} ${registrant.country} ${registrant.contactEmail} ${registrant.id} ${(registrant.factories || []).map((factory) => `${factory.name} ${factory.country} ${factory.champion}`).join(' ')} ${(registrant.assignees || []).map((user) => `${user.name} ${user.organization} ${user.organizationPair}`).join(' ')} ${(registrant.tpsUsers || []).map((user) => `${user.name} ${user.organization} ${user.organizationPair}`).join(' ')}`
        .toLowerCase()
        .includes(term)
    ));
  }, [query, registrants]);
  const selectedRegistrant = filteredRegistrants.find((registrant) => registrant.id === selectedId)
    || filteredRegistrants[0]
    || null;

  useEffect(() => {
    document.title = isPriceCalculator
      ? 'Price Calculator | Matalan Admin'
      : isLabelGenerator
        ? 'Label Generator | Matalan Admin'
        : 'Registrants | Matalan Admin';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#081d36');
    if (isTool) {
      setLoadState('ready');
      return undefined;
    }
    let isActive = true;
    fetch('/api/admin/registrations', { headers: { Accept: 'application/json' } })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Registration data could not be loaded.');
        return result.registrants || [];
      })
      .then((records) => {
        if (!isActive) return;
        setRegistrants(records);
        setSelectedId(records[0]?.id || null);
        setLoadState('ready');
      })
      .catch(() => {
        if (isActive) setLoadState('error');
      });
    return () => { isActive = false; };
  }, [isLabelGenerator, isPriceCalculator, isTool]);

  useEffect(() => {
    if (!isPriceCalculator) return undefined;
    function handleCalculatorResize(event) {
      if (event.origin !== window.location.origin || event.data?.type !== 'matalan-calculator-height') return;
      const nextHeight = Number(event.data.height);
      if (Number.isFinite(nextHeight)) setCalculatorHeight(Math.max(760, Math.min(nextHeight, 2200)));
    }
    window.addEventListener('message', handleCalculatorResize);
    return () => window.removeEventListener('message', handleCalculatorResize);
  }, [isPriceCalculator]);

  async function handleDelete(registrant) {
    const confirmed = window.confirm(`Delete registration ${registrant.id} for ${registrant.supplierName}? This cannot be undone.`);
    if (!confirmed) return;

    setDeletingId(registrant.id);
    try {
      const response = await fetch(`/api/admin/registrations?id=${encodeURIComponent(registrant.id)}`, {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Registration could not be deleted.');
      setRegistrants((records) => records.filter((record) => record.id !== registrant.id));
      setSelectedId(null);
    } catch (error) {
      window.alert(error.message || 'Registration could not be deleted.');
    } finally {
      setDeletingId(null);
    }
  }

  function handleLogout() {
    window.location.replace('/');
  }

  function toggleSidebar() {
    setIsSidebarCollapsed((current) => {
      const next = !current;
      try {
        window.localStorage.setItem('matalan-admin-sidebar-collapsed', String(next));
      } catch {
        // The sidebar still works when storage is unavailable.
      }
      return next;
    });
  }

  return (
    <main className={`admin-page ${isSidebarCollapsed ? 'is-sidebar-collapsed' : ''}`}>
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <img src={pacdLogo} alt="PAC-D" />
          <span>ADMIN</span>
          <button
            className="admin-collapse-toggle"
            type="button"
            onClick={toggleSidebar}
            aria-label={isSidebarCollapsed ? 'Expand admin sidebar' : 'Collapse admin sidebar'}
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isSidebarCollapsed ? '>>' : '<<'}
          </button>
        </div>

        <nav className="admin-nav" aria-label="Admin navigation">
          <span className="admin-nav-label">PROGRAMME</span>
          <a className={`admin-nav-item ${isTool ? '' : 'is-active'}`} href="/admin" aria-current={isTool ? undefined : 'page'} title="Registrants">
            <RegistrantsIcon />
            <span>Registrants</span>
            <strong>{registrants.length}</strong>
          </a>
          <a className={`admin-nav-item ${isPriceCalculator ? 'is-active' : ''}`} href="/admin/pricecalculator" aria-current={isPriceCalculator ? 'page' : undefined} title="Price calculator">
            <CalculatorIcon />
            <span>Price calculator</span>
          </a>
          <a className={`admin-nav-item ${isLabelGenerator ? 'is-active' : ''}`} href="/admin/label-generator" aria-current={isLabelGenerator ? 'page' : undefined} title="Label generator">
            <LabelIcon />
            <span>Label generator</span>
          </a>
          <a
            className="admin-nav-item admin-report-link"
            href="https://matalan.pac-d.com/carton-supply-report/"
            target="_blank"
            rel="noreferrer"
            title="Go to carton supply report"
          >
            <ReportIcon />
            <span>Go to carton supply report</span>
          </a>
        </nav>

        <div className="admin-sidebar-foot">
          <span>TRANSIT PACKAGING</span>
          <strong>PHASE 3</strong>
          <button className="admin-logout" type="button" onClick={handleLogout}>
            <LogoutIcon />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <section className="admin-workspace">
        <header className="admin-topbar">
          <div className="admin-mobile-brand">
            <img src={pacdLogo} alt="PAC-D" />
            <span>ADMIN</span>
          </div>
          <div className="admin-topbar-meta">
            <span>MAT / ADMIN / 01</span>
            <button className="admin-logout admin-logout-mobile" type="button" onClick={handleLogout} aria-label="Logout">
              <LogoutIcon />
            </button>
            <img src={matalanLogo} alt="Matalan" />
          </div>
        </header>

        <nav className="admin-mobile-nav" aria-label="Admin navigation">
          <a className={isTool ? '' : 'is-active'} href="/admin">Registrants</a>
          <a className={isPriceCalculator ? 'is-active' : ''} href="/admin/pricecalculator">Price calculator</a>
          <a className={isLabelGenerator ? 'is-active' : ''} href="/admin/label-generator">Label generator</a>
        </nav>

        {isTool ? (
          <div className="admin-content admin-calculator-content">
            <header className="admin-page-heading">
              <div>
                <span className="admin-eyebrow">COMMERCIAL TOOL</span>
                <h1>{isPriceCalculator ? 'Price calculator' : 'Label generator'}</h1>
              </div>
            </header>
            <section className={`admin-calculator-panel ${isLabelGenerator ? 'admin-label-generator-panel' : ''}`} aria-label={isPriceCalculator ? 'Matalan price calculator' : 'Matalan label generator'}>
              <iframe
                className={`admin-calculator-frame ${isLabelGenerator ? 'admin-label-generator-frame' : ''}`}
                src={isPriceCalculator ? '/admin/pricecalculator/app/index.html' : '/label-generator/index.html?embedded=1'}
                title={isPriceCalculator ? 'Matalan price calculator with commercial breakdown' : 'Matalan shipping label generator'}
                style={isPriceCalculator ? { height: `${calculatorHeight}px` } : undefined}
              />
            </section>
          </div>
        ) : (
        <div className="admin-content">
          <header className="admin-page-heading">
            <div>
              <span className="admin-eyebrow">REGISTRATION DATA</span>
              <h1>Registrants</h1>
            </div>
            <div className="admin-page-actions">
              <div className="admin-search">
                <SearchIcon />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search registrants"
                  aria-label="Search registrants"
                />
              </div>
              <button
                className="admin-export-button"
                type="button"
                disabled={registrants.length === 0}
                onClick={() => downloadRegistrantsExcel(registrants)}
              >
                <DownloadIcon />
                Download Excel
              </button>
            </div>
          </header>

          <section className="admin-stats" aria-label="Registration summary">
            <div className="admin-stat admin-stat-primary">
              <span>TOTAL REGISTRANTS</span>
              <strong>{registrants.length}</strong>
            </div>
            <div className="admin-stat">
              <span>JIGS REQUIRED</span>
              <strong>{registrants.reduce((total, item) => total + Number(item.jigsQuantity || 0), 0)}</strong>
            </div>
            <div className="admin-stat">
              <span>FACTORIES</span>
              <strong>{registrants.reduce((total, item) => total + (item.factories?.length || 0), 0)}</strong>
            </div>
            <div className="admin-stat">
              <span>LMS USERS</span>
              <strong>{registrants.reduce((total, item) => total + (item.assignees?.length || 0), 0)}</strong>
            </div>
            <div className="admin-stat">
              <span>TPS USERS</span>
              <strong>{registrants.reduce((total, item) => total + (item.tpsUsers?.length || 0), 0)}</strong>
            </div>
            <div className="admin-stat">
              <span>COUNTRIES</span>
              <strong>{new Set(registrants.map((item) => item.country)).size}</strong>
            </div>
          </section>

          <div className={`admin-data-layout ${selectedRegistrant ? '' : 'is-empty'}`}>
            <section className="admin-table-panel" aria-labelledby="registrant-table-title">
              <div className="admin-panel-heading">
                <div>
                  <h2 id="registrant-table-title">Registration records</h2>
                  <span>{filteredRegistrants.length} records</span>
                </div>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Supplier</th>
                      <th>Factory</th>
                      <th>Country</th>
                      <th>Jigs</th>
                      <th>LMS</th>
                      <th>TPS</th>
                      <th>Submitted</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRegistrants.map((registrant) => (
                      <tr
                        className={selectedRegistrant?.id === registrant.id ? 'is-selected' : ''}
                        key={registrant.id}
                        onClick={() => setSelectedId(registrant.id)}
                      >
                        <td>
                          <span className="admin-company-cell">
                            <strong>{registrant.supplierName}</strong>
                            <small>{registrant.id}</small>
                          </span>
                        </td>
                        <td>
                          <span className="admin-company-cell">
                            <strong>{registrant.factories?.[0]?.name || registrant.factoryName}</strong>
                            <small>{registrant.factories?.length || 1} factor{(registrant.factories?.length || 1) === 1 ? 'y' : 'ies'}</small>
                          </span>
                        </td>
                        <td>{registrant.country}</td>
                        <td>{String(registrant.jigsQuantity).padStart(2, '0')}</td>
                        <td>{String(registrant.assignees?.length || 0).padStart(2, '0')}</td>
                        <td>{String(registrant.tpsUsers?.length || 0).padStart(2, '0')}</td>
                        <td>{formatDate(registrant.submittedAt)}</td>
                        <td><span className={`admin-status is-${registrant.status.toLowerCase()}`}>{registrant.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredRegistrants.length === 0 && (
                  <div className="admin-empty">
                    <strong>{loadState === 'loading' ? 'Loading registration records' : loadState === 'error' ? 'Registration data unavailable' : registrants.length === 0 ? 'No registration records yet' : 'No matching registrants'}</strong>
                    <span>{loadState === 'loading' ? 'Please wait.' : loadState === 'error' ? 'Refresh the page to try again.' : registrants.length === 0 ? 'Submitted registrations will appear here.' : 'Try a different search term.'}</span>
                  </div>
                )}
              </div>
            </section>

            {selectedRegistrant && (
              <aside className="admin-detail" aria-label="Selected registrant details">
                <div className="admin-detail-head">
                  <span>SELECTED RECORD</span>
                  <div>
                    <strong>{selectedRegistrant.id}</strong>
                    <button
                      className="admin-delete-entry"
                      type="button"
                      disabled={deletingId === selectedRegistrant.id}
                      onClick={() => handleDelete(selectedRegistrant)}
                    >
                      <TrashIcon />
                      {deletingId === selectedRegistrant.id ? 'Deleting' : 'Delete'}
                    </button>
                  </div>
                </div>
                <div className="admin-detail-company">
                  <span>{selectedRegistrant.supplierName.slice(0, 2).toUpperCase()}</span>
                  <div>
                    <h2>{selectedRegistrant.supplierName}</h2>
                    <p>{selectedRegistrant.country}</p>
                  </div>
                </div>
                <dl className="admin-detail-list">
                  <div><dt>Supplier</dt><dd>{selectedRegistrant.supplierName}</dd></div>
                  <div><dt>Supplier champion</dt><dd>{selectedRegistrant.supplierChampion}<br />{selectedRegistrant.supplierChampionDesignation}<br />{selectedRegistrant.supplierChampionEmail}</dd></div>
                  <div><dt>Distribution supplier</dt><dd>{selectedRegistrant.distributionSupplierName}</dd></div>
                  <div><dt>Attention</dt><dd>{selectedRegistrant.attentionName}</dd></div>
                  <div><dt>Contact</dt><dd>{selectedRegistrant.contactPhone}<br />{selectedRegistrant.contactEmail}</dd></div>
                  <div><dt>Delivery address</dt><dd>{selectedRegistrant.detailsAddress}</dd></div>
                  <div className="admin-detail-quantity">
                    <span><dt>Jigs</dt><dd>{selectedRegistrant.jigsQuantity}</dd></span>
                    <span><dt>LMS</dt><dd>{selectedRegistrant.assignees?.length || 0}</dd></span>
                    <span><dt>TPS</dt><dd>{selectedRegistrant.tpsUsers?.length || 0}</dd></span>
                  </div>
                </dl>
                <div className="admin-assignees admin-factories">
                  <div className="admin-assignees-heading">
                    <h3>Factory champions</h3>
                    <span>{selectedRegistrant.factories?.length || 0}</span>
                  </div>
                  <div className="admin-assignee-list">
                    {(selectedRegistrant.factories || []).map((factory, index) => (
                      <div className="admin-assignee" key={`${factory.name}-${index}`}>
                        <span>{String(index + 1).padStart(2, '0')}</span>
                        <div>
                          <strong>{factory.name}</strong>
                          <small>{factory.country}</small>
                          <small>{factory.champion} · {factory.designation}</small>
                          {factory.email && <a href={`mailto:${factory.email}`}>{factory.email}</a>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="admin-assignees">
                  <div className="admin-assignees-heading">
                    <h3>LMS assignees</h3>
                    <span>{selectedRegistrant.assignees?.length || 0}</span>
                  </div>
                  <div className="admin-assignee-list">
                    {(selectedRegistrant.assignees || []).map((assignee, index) => (
                      <div className="admin-assignee" key={`${assignee.email}-${index}`}>
                        <span>{String(index + 1).padStart(2, '0')}</span>
                        <div>
                          <strong>{assignee.name}</strong>
                          <small>{assignee.organization}</small>
                          <small>{assignee.organizationPair}</small>
                          <small>{assignee.designation}</small>
                          <a href={`mailto:${assignee.email}`}>{assignee.email}</a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="admin-assignees">
                  <div className="admin-assignees-heading">
                    <h3>TPS users</h3>
                    <span>{selectedRegistrant.tpsUsers?.length || 0}</span>
                  </div>
                  <div className="admin-assignee-list">
                    {(selectedRegistrant.tpsUsers || []).map((user, index) => (
                      <div className="admin-assignee" key={`${user.email}-${index}`}>
                        <span>{String(index + 1).padStart(2, '0')}</span>
                        <div>
                          <strong>{user.name}</strong>
                          <small>{user.organization}</small>
                          <small>{user.organizationPair}</small>
                          <small>{user.designation}</small>
                          <a href={`mailto:${user.email}`}>{user.email}</a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </aside>
            )}
          </div>
        </div>
        )}
      </section>
    </main>
  );
}
