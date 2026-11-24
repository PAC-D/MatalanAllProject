import { useEffect, useMemo, useState } from 'react';
import matalanLogo from '../assets/matalan logo.png';
import pacdLogo from '../assets/pacd-logo.png';

const assigneeRoles = ['Packaging Manager', 'Quality Manager', 'Production Lead', 'Compliance Officer', 'Warehouse Lead', 'Merchandiser'];

function makeAssignees(domain, names) {
  return names.map((name, index) => ({
    name,
    designation: assigneeRoles[index % assigneeRoles.length],
    email: `${name.toLowerCase().replace(/[^a-z]+/g, '.').replace(/^\.|\.$/g, '')}@${domain}`,
  }));
}

const registrants = [
  {
    id: 'MTP-24018',
    company: 'Apex Textile Manufacturing',
    country: 'Bangladesh',
    email: 'operations@apextextile.com',
    phone: '+880 1712 884 310',
    supplierChampion: 'Arif Rahman',
    factoryChampion: 'Nadia Sultana',
    jigs: 6,
    lms: 4,
    attention: 'Nadia Sultana',
    address: 'Plot 18, DEPZ Road, Savar, Dhaka',
    assignees: makeAssignees('apextextile.com', ['Tasnim Ahmed', 'Farhan Kabir', 'Maliha Noor', 'Imran Hossain']),
    submitted: '24 Nov 2026',
    status: 'Complete',
  },
  {
    id: 'MTP-24017',
    company: 'Evergreen Apparel Co.',
    country: 'Vietnam',
    email: 'linh.nguyen@evergreenapparel.vn',
    phone: '+84 28 3821 4072',
    supplierChampion: 'Linh Nguyen',
    factoryChampion: 'Minh Tran',
    jigs: 4,
    lms: 3,
    attention: 'Minh Tran',
    address: 'Tan Thuan Export Zone, District 7, Ho Chi Minh City',
    assignees: makeAssignees('evergreenapparel.vn', ['Anh Pham', 'Bao Le', 'Thao Vu']),
    submitted: '23 Nov 2026',
    status: 'Complete',
  },
  {
    id: 'MTP-24016',
    company: 'Horizon Garments Ltd.',
    country: 'Sri Lanka',
    email: 's.perera@horizongarments.lk',
    phone: '+94 11 274 8801',
    supplierChampion: 'Sameera Perera',
    factoryChampion: 'Dinuka Silva',
    jigs: 3,
    lms: 5,
    attention: 'Dinuka Silva',
    address: 'Biyagama Export Processing Zone, Malwana',
    assignees: makeAssignees('horizongarments.lk', ['Ishara Fernando', 'Kavindi Jayasuriya', 'Nimal De Silva', 'Tharushi Dias', 'Kasun Gunasekara']),
    submitted: '22 Nov 2026',
    status: 'Review',
  },
  {
    id: 'MTP-24015',
    company: 'Shakti Exports',
    country: 'India',
    email: 'packaging@shaktiexports.in',
    phone: '+91 80 4127 3090',
    supplierChampion: 'Priya Mehta',
    factoryChampion: 'Ravi Kumar',
    jigs: 8,
    lms: 6,
    attention: 'Ravi Kumar',
    address: 'Peenya Industrial Area, Bengaluru, Karnataka',
    assignees: makeAssignees('shaktiexports.in', ['Ananya Rao', 'Vikram Shah', 'Neha Iyer', 'Rohan Singh', 'Kiran Patel', 'Meera Nair']),
    submitted: '21 Nov 2026',
    status: 'Complete',
  },
  {
    id: 'MTP-24014',
    company: 'Ningbo Modern Fashion',
    country: 'China',
    email: 'export@nbmodern.cn',
    phone: '+86 574 8812 7900',
    supplierChampion: 'Chen Wei',
    factoryChampion: 'Li Jing',
    jigs: 5,
    lms: 4,
    attention: 'Li Jing',
    address: 'Beilun Industrial District, Ningbo, Zhejiang',
    assignees: makeAssignees('nbmodern.cn', ['Wang Fang', 'Zhang Min', 'Liu Yang', 'Zhao Lei']),
    submitted: '20 Nov 2026',
    status: 'Review',
  },
];

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
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

export default function Admin() {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(registrants[0].id);
  const filteredRegistrants = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return registrants;
    return registrants.filter((registrant) => (
      `${registrant.company} ${registrant.country} ${registrant.email} ${registrant.id}`
        .toLowerCase()
        .includes(term)
    ));
  }, [query]);
  const selectedRegistrant = registrants.find((registrant) => registrant.id === selectedId) || registrants[0];

  useEffect(() => {
    document.title = 'Registrants | Matalan Admin';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#081d36');
  }, []);

  return (
    <main className="admin-page">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <img src={pacdLogo} alt="PAC-D" />
          <span>ADMIN</span>
        </div>

        <nav className="admin-nav" aria-label="Admin navigation">
          <span className="admin-nav-label">PROGRAMME</span>
          <a className="admin-nav-item is-active" href="/admin" aria-current="page">
            <RegistrantsIcon />
            <span>Registrants</span>
            <strong>{registrants.length}</strong>
          </a>
        </nav>

        <div className="admin-sidebar-foot">
          <span>TRANSIT PACKAGING</span>
          <strong>PHASE 3</strong>
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
            <img src={matalanLogo} alt="Matalan" />
          </div>
        </header>

        <div className="admin-content">
          <header className="admin-page-heading">
            <div>
              <span className="admin-eyebrow">REGISTRATION DATA</span>
              <h1>Registrants</h1>
            </div>
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
          </header>

          <section className="admin-stats" aria-label="Registration summary">
            <div className="admin-stat admin-stat-primary">
              <span>TOTAL REGISTRANTS</span>
              <strong>{registrants.length}</strong>
            </div>
            <div className="admin-stat">
              <span>JIGS REQUIRED</span>
              <strong>{registrants.reduce((total, item) => total + item.jigs, 0)}</strong>
            </div>
            <div className="admin-stat">
              <span>LMS ASSIGNEES</span>
              <strong>{registrants.reduce((total, item) => total + item.lms, 0)}</strong>
            </div>
            <div className="admin-stat">
              <span>REQUIRES REVIEW</span>
              <strong>{registrants.filter((item) => item.status === 'Review').length}</strong>
            </div>
          </section>

          <div className="admin-data-layout">
            <section className="admin-table-panel" aria-labelledby="registrant-table-title">
              <div className="admin-panel-heading">
                <div>
                  <h2 id="registrant-table-title">Registration records</h2>
                  <span>{filteredRegistrants.length} records</span>
                </div>
                <span className="admin-static-label">STATIC DATA</span>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Registrant</th>
                      <th>Country</th>
                      <th>Jigs</th>
                      <th>LMS</th>
                      <th>Submitted</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRegistrants.map((registrant) => (
                      <tr
                        className={selectedRegistrant.id === registrant.id ? 'is-selected' : ''}
                        key={registrant.id}
                        onClick={() => setSelectedId(registrant.id)}
                      >
                        <td>
                          <span className="admin-company-cell">
                            <strong>{registrant.company}</strong>
                            <small>{registrant.id}</small>
                          </span>
                        </td>
                        <td>{registrant.country}</td>
                        <td>{String(registrant.jigs).padStart(2, '0')}</td>
                        <td>{String(registrant.lms).padStart(2, '0')}</td>
                        <td>{registrant.submitted}</td>
                        <td><span className={`admin-status is-${registrant.status.toLowerCase()}`}>{registrant.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredRegistrants.length === 0 && <div className="admin-empty">No matching registrants.</div>}
              </div>
            </section>

            <aside className="admin-detail" aria-label="Selected registrant details">
              <div className="admin-detail-head">
                <span>SELECTED RECORD</span>
                <strong>{selectedRegistrant.id}</strong>
              </div>
              <div className="admin-detail-company">
                <span>{selectedRegistrant.company.slice(0, 2).toUpperCase()}</span>
                <div>
                  <h2>{selectedRegistrant.company}</h2>
                  <p>{selectedRegistrant.country}</p>
                </div>
              </div>
              <dl className="admin-detail-list">
                <div><dt>Supplier champion</dt><dd>{selectedRegistrant.supplierChampion}</dd></div>
                <div><dt>Factory champion</dt><dd>{selectedRegistrant.factoryChampion}</dd></div>
                <div><dt>Attention</dt><dd>{selectedRegistrant.attention}</dd></div>
                <div><dt>Contact</dt><dd>{selectedRegistrant.phone}<br />{selectedRegistrant.email}</dd></div>
                <div><dt>Delivery address</dt><dd>{selectedRegistrant.address}</dd></div>
                <div className="admin-detail-quantity">
                  <span><dt>Jigs</dt><dd>{selectedRegistrant.jigs}</dd></span>
                  <span><dt>LMS</dt><dd>{selectedRegistrant.lms}</dd></span>
                </div>
              </dl>
              <div className="admin-assignees">
                <div className="admin-assignees-heading">
                  <h3>LMS assignees</h3>
                  <span>{selectedRegistrant.assignees.length}</span>
                </div>
                <div className="admin-assignee-list">
                  {selectedRegistrant.assignees.map((assignee, index) => (
                    <div className="admin-assignee" key={assignee.email}>
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      <div>
                        <strong>{assignee.name}</strong>
                        <small>{assignee.designation}</small>
                        <a href={`mailto:${assignee.email}`}>{assignee.email}</a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
