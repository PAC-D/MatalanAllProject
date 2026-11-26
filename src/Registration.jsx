import { useEffect, useMemo, useState } from 'react';
import {
  getFactoriesForSupplier,
  getOrganizationSuggestions,
  getSuppliersForCountry,
  registrationCountries,
} from './data/registrationOptions';

const matalanLogo = '/brand-assets/matalan-logo.png';
const pacdLogo = '/brand-assets/pacd-logo.png';

const personNamePattern = String.raw`\S+\s+\S+.*`;

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
          onBlur={() => window.setTimeout(() => {
            setIsOpen(false);
            if (!allowCustom && value && !exactMatch) onChange('');
          }, 100)}
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

function OrganizationField({ id, name, value, pair, supplierName, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const suggestions = getOrganizationSuggestions(value, supplierName);

  function chooseSuggestion(suggestion) {
    onChange(suggestion.value, suggestion.pair);
    setIsOpen(false);
  }

  return (
    <div className="field suggestion-field">
      <label htmlFor={id}>Organisation</label>
      <div className="suggestion-control">
        <input
          id={id}
          type="text"
          value={value}
          placeholder="Type supplier or factory name"
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen && suggestions.length > 0}
          onChange={(event) => {
            onChange(event.target.value, '');
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => window.setTimeout(() => {
            setIsOpen(false);
            if (!pair) onChange('', '');
          }, 100)}
          required
        />
        <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5.5 7.5 4.5 4.5 4.5-4.5" /></svg>
        {isOpen && suggestions.length > 0 && (
          <div className="suggestion-menu organization-suggestions" role="listbox">
            {suggestions.map((suggestion) => (
              <button
                type="button"
                role="option"
                key={`${suggestion.pair}-${suggestion.value}`}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => chooseSuggestion(suggestion)}
              >
                <strong>{suggestion.label}</strong>
                <small>Store: {suggestion.value}</small>
              </button>
            ))}
          </div>
        )}
      </div>
      <input type="hidden" name={name} value={value} />
      <input type="hidden" name={`${name}Pair`} value={pair} />
      {pair && <small className="organization-pair">Pair: {pair}</small>}
    </div>
  );
}

export function PackageScene() {
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

function ProgrammeUsers({ prefix, users, supplierName, onAdd, onRemove, onOrganizationChange }) {
  return (
    <div className="programme-users">
      {users.map((user, index) => (
        <fieldset className="programme-user" key={user.id}>
          <legend>USER {String(index + 1).padStart(2, '0')}</legend>
          {users.length > 1 && (
            <button className="programme-user-remove" type="button" onClick={() => onRemove(user.id)}>
              Remove
            </button>
          )}
          <div className="form-grid form-grid-4">
            <label className="field" htmlFor={`${prefix}UserName-${user.id}`}>
              <span>Person Name</span>
              <input id={`${prefix}UserName-${user.id}`} name={`${prefix}Users[${index}].name`} type="text" placeholder="Enter first and last name" pattern={personNamePattern} title="Enter at least two words separated by a space." required />
            </label>
            <OrganizationField
              id={`${prefix}Organization-${user.id}`}
              name={`${prefix}Users[${index}].organization`}
              value={user.organization}
              pair={user.organizationPair}
              supplierName={supplierName}
              onChange={(value, pair) => onOrganizationChange(user.id, value, pair)}
            />
            <label className="field" htmlFor={`${prefix}Designation-${user.id}`}>
              <span>Designation</span>
              <input id={`${prefix}Designation-${user.id}`} name={`${prefix}Users[${index}].designation`} type="text" placeholder="Enter job title" required />
            </label>
            <label className="field" htmlFor={`${prefix}Email-${user.id}`}>
              <span>Email</span>
              <input id={`${prefix}Email-${user.id}`} name={`${prefix}Users[${index}].email`} type="email" placeholder="name@company.com" required />
            </label>
          </div>
        </fieldset>
      ))}
      <button className="programme-user-add" type="button" onClick={onAdd}>+ Add more person</button>
    </div>
  );
}

export default function Registration() {
  const [activeStep, setActiveStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lmsUsers, setLmsUsers] = useState([{ id: 0, organization: '', organizationPair: '' }]);
  const [tpsUsers, setTpsUsers] = useState([{ id: 0, organization: '', organizationPair: '' }]);
  const [submission, setSubmission] = useState({ state: 'idle', message: '' });
  const [country, setCountry] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [distributionSupplierName, setDistributionSupplierName] = useState('');
  const supplierNames = useMemo(() => getSuppliersForCountry(country), [country]);
  const factories = useMemo(() => getFactoriesForSupplier(supplierName), [supplierName]);

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
      supplierChampionDesignation: formData.get('supplierChampionDesignation'),
      supplierChampionEmail: formData.get('supplierChampionEmail'),
      factories: factories.map((factory, index) => ({
        name: factory.name,
        country: factory.country,
        champion: formData.get(`factories[${index}].champion`),
        designation: formData.get(`factories[${index}].designation`),
        email: formData.get(`factories[${index}].email`),
      })),
      jigsQuantity: Number(formData.get('jigsQuantity')),
      distributionSupplierName,
      detailsAddress: formData.get('detailsAddress'),
      attentionName: formData.get('attentionName'),
      contactPhone: formData.get('contactPhone'),
      contactEmail: formData.get('contactEmail'),
      assignees: lmsUsers.map((_, index) => ({
        name: formData.get(`lmsUsers[${index}].name`),
        organization: formData.get(`lmsUsers[${index}].organization`),
        organizationPair: formData.get(`lmsUsers[${index}].organizationPair`),
        designation: formData.get(`lmsUsers[${index}].designation`),
        email: formData.get(`lmsUsers[${index}].email`),
      })),
      tpsUsers: tpsUsers.map((_, index) => ({
        name: formData.get(`tpsUsers[${index}].name`),
        organization: formData.get(`tpsUsers[${index}].organization`),
        organizationPair: formData.get(`tpsUsers[${index}].organizationPair`),
        designation: formData.get(`tpsUsers[${index}].designation`),
        email: formData.get(`tpsUsers[${index}].email`),
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
      setDistributionSupplierName('');
      setActiveStep(1);
      setLmsUsers([{ id: 0, organization: '', organizationPair: '' }]);
      setTpsUsers([{ id: 0, organization: '', organizationPair: '' }]);
      setSubmission({ state: 'success', message: `Registration ${result.id} submitted.` });
      setShowSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setSubmission({ state: 'error', message: error.message || 'Registration could not be submitted.' });
    }
  }

  function handleCountryChange(nextCountry) {
    setCountry(nextCountry);
    setSupplierName('');
    setDistributionSupplierName('');
  }

  function goToNextStep() {
    const currentSection = document.getElementById(`registration-step-${activeStep}`);
    const currentFields = [...currentSection.querySelectorAll('input, select, textarea')];
    const invalidField = currentFields.find((field) => !field.checkValidity());
    if (invalidField) {
      invalidField.reportValidity();
      return;
    }
    setActiveStep((step) => Math.min(step + 1, 4));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const steps = [
    { number: 1, label: 'Packaging Champion' },
    { number: 2, label: 'LMS User Info' },
    { number: 3, label: 'TPS User Info' },
    { number: 4, label: 'Measuring Jigs Delivery' },
  ];

  function addUser(setUsers) {
    setUsers((users) => {
      if (users.length >= 20) return users;
      return [...users, { id: Math.max(...users.map((user) => user.id)) + 1, organization: '', organizationPair: '' }];
    });
  }

  function removeUser(setUsers, userId) {
    setUsers((users) => users.filter((user) => user.id !== userId));
  }

  function updateUserOrganization(setUsers, userId, organization, organizationPair) {
    setUsers((users) => users.map((user) => (
      user.id === userId ? { ...user, organization, organizationPair } : user
    )));
  }

  function handleSupplierChange(nextSupplier) {
    setSupplierName(nextSupplier);
    setDistributionSupplierName(nextSupplier);
    setLmsUsers((users) => users.map((user) => ({ ...user, organization: '', organizationPair: '' })));
    setTpsUsers((users) => users.map((user) => ({ ...user, organization: '', organizationPair: '' })));
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

        <form className="registration-form registration-wizard" aria-label="Registration" onSubmit={handleSubmit}>
          <nav className="registration-steps" aria-label="Registration progress">
            {steps.map((step) => (
              <button
                className={`${activeStep === step.number ? 'is-active' : ''} ${activeStep > step.number ? 'is-complete' : ''}`}
                type="button"
                key={step.number}
                disabled={step.number > activeStep}
                aria-current={activeStep === step.number ? 'step' : undefined}
                onClick={() => setActiveStep(step.number)}
              >
                <span>{String(step.number).padStart(2, '0')}</span>
                <strong>{step.label}</strong>
              </button>
            ))}
          </nav>

          <section
            className="form-section registration-step"
            id="registration-step-1"
            aria-labelledby="part-one-title"
            hidden={activeStep !== 1}
          >
            <SectionHeading id="part-one-title" number="01" title="Packaging Champion" />
            <div className="form-grid">
              <SuggestionField
                id="country"
                label="Country"
                options={registrationCountries}
                value={country}
                onChange={handleCountryChange}
                placeholder="Type country name"
                allowCustom={false}
              />
              <SuggestionField
                id="supplierName"
                label="Supplier Name"
                options={supplierNames}
                value={supplierName}
                onChange={handleSupplierChange}
                placeholder="Type supplier name"
                allowCustom={false}
              />
            </div>

            <div className="registration-row-heading">
              <span>Supplier Champion</span>
              <small>Primary packaging programme contact</small>
            </div>
            <div className="form-grid form-grid-3">
              <label className="field" htmlFor="supplierChampion">
                <span>Person Name</span>
                <input id="supplierChampion" name="supplierChampion" type="text" placeholder="Enter first and last name" pattern={personNamePattern} title="Enter at least two words separated by a space." required />
              </label>
              <label className="field" htmlFor="supplierChampionDesignation">
                <span>Designation</span>
                <input id="supplierChampionDesignation" name="supplierChampionDesignation" type="text" placeholder="Enter job title" required />
              </label>
              <label className="field" htmlFor="supplierChampionEmail">
                <span>Email</span>
                <input id="supplierChampionEmail" name="supplierChampionEmail" type="email" placeholder="name@company.com" required />
              </label>
            </div>

            <div className="registration-row-heading">
              <span>Factory Champion</span>
              <small>Factory-level packaging programme contact</small>
            </div>
            {factories.length === 0 ? (
              <p className="factory-empty">Choose a supplier to load its factory list.</p>
            ) : (
              <div className="factory-champion-list">
                {factories.map((factory, index) => (
                  <fieldset className="factory-champion-row" key={`${factory.name}-${factory.country}`}>
                    <legend>FACTORY {String(index + 1).padStart(2, '0')}</legend>
                    <div className="factory-identity">
                      <strong>{factory.name}</strong>
                      <span>{factory.country}</span>
                    </div>
                    <label className="field" htmlFor={`factoryChampion-${index}`}>
                      <span>Person Name</span>
                      <input id={`factoryChampion-${index}`} name={`factories[${index}].champion`} type="text" placeholder="Enter first and last name" pattern={personNamePattern} title="Enter at least two words separated by a space." required />
                    </label>
                    <label className="field" htmlFor={`factoryChampionDesignation-${index}`}>
                      <span>Designation</span>
                      <input id={`factoryChampionDesignation-${index}`} name={`factories[${index}].designation`} type="text" placeholder="Enter job title" required />
                    </label>
                    <label className="field" htmlFor={`factoryChampionEmail-${index}`}>
                      <span>Email</span>
                      <input id={`factoryChampionEmail-${index}`} name={`factories[${index}].email`} type="email" placeholder="name@company.com" required />
                    </label>
                  </fieldset>
                ))}
              </div>
            )}

            <div className="form-actions form-actions-step">
              <span />
              <button type="button" onClick={goToNextStep}>Next: LMS User Info</button>
            </div>
          </section>

          <section
            className="form-section registration-step"
            id="registration-step-2"
            aria-labelledby="part-two-title"
            hidden={activeStep !== 2}
          >
            <SectionHeading id="part-two-title" number="02" title="LMS User Info" />
            <p className="registration-disclaimer">
              Online Learning Management System where resources related to the programme and a few courses need to be completed to obtain a completion certificate.
            </p>
            <div className="selected-organization-scope">
              <strong>{supplierName}</strong>
              <div>{factories.map((factory) => <span key={factory.name}>{factory.name}</span>)}</div>
            </div>
            <ProgrammeUsers
              prefix="lms"
              users={lmsUsers}
              supplierName={supplierName}
              onAdd={() => addUser(setLmsUsers)}
              onRemove={(userId) => removeUser(setLmsUsers, userId)}
              onOrganizationChange={(userId, value, pair) => updateUserOrganization(setLmsUsers, userId, value, pair)}
            />
            <div className="form-actions form-actions-step">
              <button className="form-back-button" type="button" onClick={() => setActiveStep(1)}>Back</button>
              <button type="button" onClick={goToNextStep}>Next: TPS User Info</button>
            </div>
          </section>

          <section
            className="form-section registration-step"
            id="registration-step-3"
            aria-labelledby="part-three-title"
            hidden={activeStep !== 3}
          >
            <SectionHeading id="part-three-title" number="03" title="TPS User Info (Transit Packaging System)" />
            <p className="registration-disclaimer">
              Online carton dimensions, supporting photos and packaging supplier declaration platform user details.
            </p>
            <div className="selected-organization-scope">
              <strong>{supplierName}</strong>
              <div>{factories.map((factory) => <span key={factory.name}>{factory.name}</span>)}</div>
            </div>
            <ProgrammeUsers
              prefix="tps"
              users={tpsUsers}
              supplierName={supplierName}
              onAdd={() => addUser(setTpsUsers)}
              onRemove={(userId) => removeUser(setTpsUsers, userId)}
              onOrganizationChange={(userId, value, pair) => updateUserOrganization(setTpsUsers, userId, value, pair)}
            />
            <div className="form-actions form-actions-step">
              <button className="form-back-button" type="button" onClick={() => setActiveStep(2)}>Back</button>
              <button type="button" onClick={goToNextStep}>Next: Measuring Jigs</button>
            </div>
          </section>

          <section
            className="form-section registration-step"
            id="registration-step-4"
            aria-labelledby="part-four-title"
            hidden={activeStep !== 4}
          >
            <SectionHeading id="part-four-title" number="04" title="Measuring Jigs Delivery" />
            <div className="selected-organization-scope selected-organization-scope-jigs">
              <strong>{supplierName}</strong>
              <div>{factories.map((factory) => <span key={factory.name}>{factory.name}</span>)}</div>
            </div>
            <div className="form-grid">
              <label className="field" htmlFor="jigsQuantity">
                <span>Jigs Quantity</span>
                <input id="jigsQuantity" name="jigsQuantity" type="number" min="1" placeholder="0" required />
              </label>
              <label className="field" htmlFor="distributionSupplierName">
                <span>Supplier Name</span>
                <input id="distributionSupplierName" name="distributionSupplierName" type="text" value={distributionSupplierName} readOnly required />
              </label>
              <label className="field field-full" htmlFor="detailsAddress">
                <span>Details Address</span>
                <textarea id="detailsAddress" name="detailsAddress" rows="3" placeholder="Enter delivery address" required />
              </label>
              <label className="field field-full" htmlFor="attentionName">
                <span>Attention Name</span>
                <input id="attentionName" name="attentionName" type="text" placeholder="Enter first and last name" pattern={personNamePattern} title="Enter at least two words separated by a space." required />
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
            <div className="form-actions">
              <button className="form-back-button" type="button" onClick={() => setActiveStep(3)}>Back</button>
              <span className={`demo-message ${submission.state !== 'idle' ? 'is-visible' : ''} ${submission.state === 'error' ? 'is-error' : ''}`} role="status">
                {submission.message}
              </span>
              <button type="submit" disabled={submission.state === 'submitting'}>
                {submission.state === 'submitting' ? 'Submitting...' : 'Submit registration'}
              </button>
            </div>
          </section>
        </form>
      </section>

      {showSuccess && (
        <div className="registration-success-backdrop" role="presentation">
          <section className="registration-success-modal" role="dialog" aria-modal="true" aria-labelledby="registration-success-title">
            <div className="registration-success-mark" aria-hidden="true">
              <svg viewBox="0 0 48 48"><path d="m13 25 7 7 15-17" /></svg>
            </div>
            <span>REGISTRATION COMPLETE</span>
            <h2 id="registration-success-title">Successfully submitted</h2>
            <p>{submission.message}</p>
            <button
              type="button"
              onClick={() => {
                setShowSuccess(false);
                setSubmission({ state: 'idle', message: '' });
              }}
            >
              Start another registration
            </button>
          </section>
        </div>
      )}
    </main>
  );
}
