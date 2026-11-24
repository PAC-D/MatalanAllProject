import { useEffect, useMemo, useState } from 'react';
import matalanLogo from '../assets/matalan logo.png';
import pacdLogo from '../assets/pacd-logo.png';

const championOptions = [];

function ChampionField({ id, label }) {
  return (
    <label className="field field-full" htmlFor={id}>
      <span>{label}</span>
      <span className="combo-control">
        <input
          id={id}
          name={id}
          list={`${id}-options`}
          placeholder="Select or enter a name"
          autoComplete="off"
          required
        />
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <path d="m5.5 7.5 4.5 4.5 4.5-4.5" />
        </svg>
      </span>
      <datalist id={`${id}-options`}>
        {championOptions.map((option) => <option value={option} key={option} />)}
      </datalist>
      <small>Choose from the list or type a name.</small>
    </label>
  );
}

function PackageScene() {
  return (
    <div className="package-visual" aria-hidden="true">
      <svg className="carton-stack" viewBox="0 0 520 560">
        <defs>
          <linearGradient id="carton-left" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#173d64" stopOpacity=".74" />
            <stop offset="1" stopColor="#09233e" stopOpacity=".34" />
          </linearGradient>
          <linearGradient id="carton-right" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0a2745" stopOpacity=".84" />
            <stop offset="1" stopColor="#061a31" stopOpacity=".42" />
          </linearGradient>
        </defs>

        <ellipse className="carton-shadow carton-shadow-left" cx="177" cy="473" rx="103" ry="24" />
        <ellipse className="carton-shadow carton-shadow-right" cx="343" cy="473" rx="103" ry="24" />

        <g className="carton-position carton-position-white" transform="translate(260 204)">
          <g className="carton-unit carton-white-unit">
            <polygon className="carton-face carton-face-top" points="0,-55 82,-14 0,29 -82,-14" />
            <polygon className="carton-face carton-face-left" points="-82,-14 0,29 0,126 -82,83" />
            <polygon className="carton-face carton-face-right" points="0,29 82,-14 82,83 0,126" />
            <path className="carton-tape" d="M-61.5-24.25 20.5 18.25v97" />
            <path className="carton-edge" d="M0 29v97M-82-14v97l82 43 82-43v-97" />
          </g>
        </g>

        <g className="carton-position carton-position-blue" transform="translate(175 330)">
          <g className="carton-unit carton-blue-unit">
            <polygon className="carton-face carton-face-top" points="0,-55 82,-14 0,29 -82,-14" />
            <polygon className="carton-face carton-face-left" points="-82,-14 0,29 0,126 -82,83" />
            <polygon className="carton-face carton-face-right" points="0,29 82,-14 82,83 0,126" />
            <path className="carton-tape" d="M-61.5-24.25 20.5 18.25v97" />
            <path className="carton-edge" d="M0 29v97M-82-14v97l82 43 82-43v-97" />
          </g>
        </g>

        <g className="carton-position carton-position-red" transform="translate(345 330)">
          <g className="carton-unit carton-red-unit">
            <polygon className="carton-face carton-face-top" points="0,-55 82,-14 0,29 -82,-14" />
            <polygon className="carton-face carton-face-left" points="-82,-14 0,29 0,126 -82,83" />
            <polygon className="carton-face carton-face-right" points="0,29 82,-14 82,83 0,126" />
            <path className="carton-tape" d="M-61.5-24.25 20.5 18.25v97" />
            <path className="carton-edge" d="M0 29v97M-82-14v97l82 43 82-43v-97" />
          </g>
        </g>

      </svg>
    </div>
  );
}

function SectionHeading({ id, number, title }) {
  return (
    <div className="form-section-heading">
      <span>{number}</span>
      <h2 id={id}>{title}</h2>
    </div>
  );
}

export default function Registration() {
  const [assigneeCount, setAssigneeCount] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const assignees = useMemo(
    () => Array.from({ length: Math.min(Math.max(Number(assigneeCount) || 0, 0), 20) }),
    [assigneeCount],
  );

  useEffect(() => {
    document.title = 'Supplier Registration | Matalan';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#06182e');
  }, []);

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className="registration-page">
      <aside className="registration-visual">
        <header className="registration-brand">
          <h2>
            <span className="program-title">
              <span>Matalan Transit</span>
              <span>Packaging Program</span>
            </span>
            <span className="program-phase">Phase 3</span>
          </h2>
        </header>

        <PackageScene />
      </aside>

      <section className="registration-panel" aria-label="Registration form">
        <header className="registration-panel-header">
          <img className="panel-pacd-logo" src={pacdLogo} alt="PAC-D" />
          <img src={matalanLogo} alt="Matalan" />
        </header>

        <form className="registration-form" aria-label="Registration" onSubmit={handleSubmit}>
          <section className="form-section" aria-labelledby="part-one-title">
            <SectionHeading id="part-one-title" number="01" title="Packaging Champions" />
            <div className="form-grid">
              <label className="field field-full" htmlFor="country">
                <span>Country</span>
                <select id="country" name="country" defaultValue="" required>
                  <option value="" disabled>Select country</option>
                </select>
              </label>
              <ChampionField id="supplierChampion" label="Supplier End Packaging Champion" />
              <ChampionField id="factoryChampion" label="Factory End Packaging Champion" />
            </div>
          </section>

          <section className="form-section" aria-labelledby="part-two-title">
            <SectionHeading id="part-two-title" number="02" title="Measuring Jigs Distribution Details" />
            <div className="form-grid">
              <label className="field" htmlFor="jigsQuantity">
                <span>Jigs Quantity</span>
                <input id="jigsQuantity" name="jigsQuantity" type="number" min="1" placeholder="0" required />
              </label>
              <label className="field" htmlFor="supplierFactoryName">
                <span>Supplier / Factory Name</span>
                <input id="supplierFactoryName" name="supplierFactoryName" type="text" placeholder="Enter name" required />
              </label>
              <label className="field field-full" htmlFor="detailsAddress">
                <span>Details Address</span>
                <textarea id="detailsAddress" name="detailsAddress" rows="3" placeholder="Enter delivery address" required />
              </label>
              <label className="field field-full" htmlFor="attentionName">
                <span>Attention Name</span>
                <input id="attentionName" name="attentionName" type="text" placeholder="Enter attention name" required />
              </label>
              <label className="field" htmlFor="contactPhone">
                <span>Phone</span>
                <input id="contactPhone" name="contactPhone" type="tel" placeholder="Enter phone number" required />
              </label>
              <label className="field" htmlFor="contactEmail">
                <span>Email</span>
                <input id="contactEmail" name="contactEmail" type="email" placeholder="name@company.com" required />
              </label>
            </div>
          </section>

          <section className="form-section" aria-labelledby="part-three-title">
            <SectionHeading id="part-three-title" number="03" title="LMS Training Details" />
            <div className="form-grid">
              <label className="field field-count" htmlFor="assigneeCount">
                <span>How many people to assign?</span>
                <input
                  id="assigneeCount"
                  name="assigneeCount"
                  type="number"
                  min="1"
                  max="20"
                  value={assigneeCount}
                  onChange={(event) => setAssigneeCount(event.target.value)}
                  required
                />
              </label>
            </div>

            <div className="assignee-list">
              {assignees.map((_, index) => (
                <fieldset className="assignee-row" key={index}>
                  <legend>ASSIGNEE {String(index + 1).padStart(2, '0')}</legend>
                  <label className="field" htmlFor={`assigneeName-${index}`}>
                    <span>Name</span>
                    <input id={`assigneeName-${index}`} name={`assignees[${index}].name`} type="text" placeholder="Full name" required />
                  </label>
                  <label className="field" htmlFor={`designation-${index}`}>
                    <span>Designation</span>
                    <input id={`designation-${index}`} name={`assignees[${index}].designation`} type="text" placeholder="Job title" required />
                  </label>
                  <label className="field" htmlFor={`assigneeEmail-${index}`}>
                    <span>Email Address</span>
                    <input id={`assigneeEmail-${index}`} name={`assignees[${index}].email`} type="email" placeholder="name@company.com" required />
                  </label>
                </fieldset>
              ))}
            </div>
          </section>

          <div className="form-actions">
            <span className={`demo-message ${submitted ? 'is-visible' : ''}`} role="status">
              Demo complete. No data was sent.
            </span>
            <button type="submit">Submit registration</button>
          </div>
        </form>
      </section>
    </main>
  );
}
