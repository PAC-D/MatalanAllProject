import { useEffect, useMemo, useState } from 'react';
import matalanLogo from '../assets/matalan logo.png';
import pacdLogo from '../assets/pacd-logo.png';
import { getNamesForCountry, registrationCountries } from './data/registrationOptions';

function SuggestionField({ id, label, options, value, onChange, placeholder, allowCustom = true }) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const query = value.trim().toLocaleLowerCase();
  const exactMatch = options.some((option) => option.toLocaleLowerCase() === query);
  const matches = query
    ? options
      .filter((option) => option.toLocaleLowerCase().includes(query))
      .sort((a, b) => {
        const aStarts = a.toLocaleLowerCase().startsWith(query);
        const bStarts = b.toLocaleLowerCase().startsWith(query);
        if (aStarts !== bStarts) return aStarts ? -1 : 1;
        return a.localeCompare(b);
      })
      .slice(0, 7)
    : [];
  const showCustomOption = allowCustom && query && !exactMatch;
  const showMenu = isOpen && query && (matches.length > 0 || showCustomOption);
  const selectableValues = showCustomOption ? [...matches, value.trim()] : matches;

  function chooseValue(nextValue) {
    onChange(nextValue);
    setIsOpen(false);
    setHighlightedIndex(-1);
  }

  return (
    <div className="field suggestion-field">
      <label htmlFor={id}>{label}</label>
      <div className="suggestion-control">
        <input
          id={id}
          name={id}
          type="text"
          value={value}
          placeholder={placeholder}
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showMenu}
          aria-controls={`${id}-suggestions`}
          onChange={(event) => {
            onChange(event.target.value);
            setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => window.setTimeout(() => setIsOpen(false), 100)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setIsOpen(false);
              setHighlightedIndex(-1);
              return;
            }
            if (!showMenu) return;
            if (event.key === 'ArrowDown') {
              event.preventDefault();
              setHighlightedIndex((index) => Math.min(index + 1, selectableValues.length - 1));
            }
            if (event.key === 'ArrowUp') {
              event.preventDefault();
              setHighlightedIndex((index) => Math.max(index - 1, 0));
            }
            if (event.key === 'Enter' && highlightedIndex >= 0) {
              event.preventDefault();
              chooseValue(selectableValues[highlightedIndex]);
            }
          }}
          required
        />
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <path d="m5.5 7.5 4.5 4.5 4.5-4.5" />
        </svg>
        {showMenu && (
          <div className="suggestion-menu" id={`${id}-suggestions`} role="listbox">
            {matches.map((option, index) => (
              <button
                className={highlightedIndex === index ? 'is-highlighted' : ''}
                type="button"
                role="option"
                aria-selected={highlightedIndex === index}
                key={option}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => chooseValue(option)}
              >
                {option}
              </button>
            ))}
            {showCustomOption && (
              <button
                className={`suggestion-custom ${highlightedIndex === matches.length ? 'is-highlighted' : ''}`}
                type="button"
                role="option"
                aria-selected={highlightedIndex === matches.length}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => chooseValue(value.trim())}
              >
                Use “{value.trim()}”
              </button>
            )}
          </div>
        )}
      </div>
    </div>
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
  const [submission, setSubmission] = useState({ state: 'idle', message: '' });
  const [country, setCountry] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [factoryName, setFactoryName] = useState('');
  const [distributionSupplierName, setDistributionSupplierName] = useState('');
  const countryNames = useMemo(() => getNamesForCountry(country), [country]);
  const assignees = useMemo(
    () => Array.from({ length: Math.min(Math.max(Number(assigneeCount) || 0, 0), 20) }),
    [assigneeCount],
  );

  useEffect(() => {
    document.title = 'Supplier Registration | Matalan';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#06182e');
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      country,
      supplierName,
      supplierChampion: formData.get('supplierChampion'),
      factoryName,
      factoryChampion: formData.get('factoryChampion'),
      jigsQuantity: Number(formData.get('jigsQuantity')),
      distributionSupplierName,
      detailsAddress: formData.get('detailsAddress'),
      attentionName: formData.get('attentionName'),
      contactPhone: formData.get('contactPhone'),
      contactEmail: formData.get('contactEmail'),
      assignees: assignees.map((_, index) => ({
        name: formData.get(`assignees[${index}].name`),
        designation: formData.get(`assignees[${index}].designation`),
        email: formData.get(`assignees[${index}].email`),
      })),
    };

    setSubmission({ state: 'submitting', message: 'Submitting registration...' });
    try {
      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Registration could not be submitted.');

      form.reset();
      setCountry('');
      setSupplierName('');
      setFactoryName('');
      setDistributionSupplierName('');
      setAssigneeCount(1);
      setSubmission({ state: 'success', message: `Registration ${result.id} submitted.` });
    } catch (error) {
      setSubmission({ state: 'error', message: error.message || 'Registration could not be submitted.' });
    }
  }

  function handleCountryChange(nextCountry) {
    setCountry(nextCountry);
    setSupplierName('');
    setFactoryName('');
    setDistributionSupplierName('');
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
              <div className="field-full">
                <SuggestionField
                  id="country"
                  label="Country"
                  options={registrationCountries}
                  value={country}
                  onChange={handleCountryChange}
                  placeholder="Type country name"
                  allowCustom={false}
                />
              </div>
              <SuggestionField
                id="supplierName"
                label="Supplier Name"
                options={countryNames}
                value={supplierName}
                onChange={setSupplierName}
                placeholder="Type supplier name"
              />
              <label className="field" htmlFor="supplierChampion">
                <span>Supplier End Packaging Champion</span>
                <input id="supplierChampion" name="supplierChampion" type="text" placeholder="Enter champion name" required />
              </label>
              <SuggestionField
                id="factoryName"
                label="Factory Name"
                options={countryNames}
                value={factoryName}
                onChange={setFactoryName}
                placeholder="Type factory name"
              />
              <label className="field" htmlFor="factoryChampion">
                <span>Factory End Packaging Champion</span>
                <input id="factoryChampion" name="factoryChampion" type="text" placeholder="Enter champion name" required />
              </label>
            </div>
          </section>

          <section className="form-section" aria-labelledby="part-two-title">
            <SectionHeading id="part-two-title" number="02" title="Measuring Jigs Distribution Details" />
            <div className="form-grid">
              <label className="field" htmlFor="jigsQuantity">
                <span>Jigs Quantity</span>
                <input id="jigsQuantity" name="jigsQuantity" type="number" min="1" placeholder="0" required />
              </label>
              <SuggestionField
                id="distributionSupplierName"
                label="Supplier Name"
                options={countryNames}
                value={distributionSupplierName}
                onChange={setDistributionSupplierName}
                placeholder="Type supplier name"
              />
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
            <span className={`demo-message ${submission.state !== 'idle' ? 'is-visible' : ''} ${submission.state === 'error' ? 'is-error' : ''}`} role="status">
              {submission.message}
            </span>
            <button type="submit" disabled={submission.state === 'submitting'}>
              {submission.state === 'submitting' ? 'Submitting...' : 'Submit registration'}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
