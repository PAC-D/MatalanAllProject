import { createServer } from 'node:http';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { randomBytes } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { registrationPairs } from '../src/data/registrationOptions.js';

const host = process.env.API_HOST || '127.0.0.1';
const port = Number(process.env.API_PORT || 3100);
const databasePath = process.env.DATABASE_PATH || '/var/lib/matalan-registration/registrations.sqlite';

mkdirSync(dirname(databasePath), { recursive: true });
const database = new DatabaseSync(databasePath);
database.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
  PRAGMA busy_timeout = 5000;

  CREATE TABLE IF NOT EXISTS registrations (
    id TEXT PRIMARY KEY,
    country TEXT NOT NULL,
    supplier_name TEXT NOT NULL,
    supplier_champion TEXT NOT NULL,
    factory_name TEXT NOT NULL,
    factory_champion TEXT NOT NULL,
    jigs_quantity INTEGER NOT NULL CHECK (jigs_quantity > 0),
    distribution_supplier_name TEXT NOT NULL,
    details_address TEXT NOT NULL,
    attention_name TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Complete',
    submitted_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS lms_assignees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    registration_id TEXT NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
    sequence_number INTEGER NOT NULL,
    name TEXT NOT NULL,
    designation TEXT NOT NULL,
    email TEXT NOT NULL,
    UNIQUE (registration_id, sequence_number)
  );

  CREATE TABLE IF NOT EXISTS factory_champions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    registration_id TEXT NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
    sequence_number INTEGER NOT NULL,
    factory_name TEXT NOT NULL,
    factory_country TEXT NOT NULL,
    person_name TEXT NOT NULL,
    designation TEXT NOT NULL,
    email TEXT NOT NULL,
    UNIQUE (registration_id, sequence_number)
  );

  CREATE TABLE IF NOT EXISTS tps_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    registration_id TEXT NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
    sequence_number INTEGER NOT NULL,
    name TEXT NOT NULL,
    organization TEXT NOT NULL,
    organization_pair TEXT NOT NULL,
    designation TEXT NOT NULL,
    email TEXT NOT NULL,
    UNIQUE (registration_id, sequence_number)
  );

  CREATE INDEX IF NOT EXISTS idx_registrations_submitted_at
    ON registrations(submitted_at DESC);
  CREATE INDEX IF NOT EXISTS idx_assignees_registration_id
    ON lms_assignees(registration_id);
  CREATE INDEX IF NOT EXISTS idx_factory_champions_registration_id
    ON factory_champions(registration_id);
  CREATE INDEX IF NOT EXISTS idx_tps_users_registration_id
    ON tps_users(registration_id);
`);

function ensureColumn(table, column, definition) {
  const columns = database.prepare(`PRAGMA table_info(${table})`).all();
  if (!columns.some((item) => item.name === column)) {
    database.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

ensureColumn('registrations', 'supplier_champion_designation', "TEXT NOT NULL DEFAULT ''");
ensureColumn('registrations', 'supplier_champion_email', "TEXT NOT NULL DEFAULT ''");
ensureColumn('lms_assignees', 'organization', "TEXT NOT NULL DEFAULT ''");
ensureColumn('lms_assignees', 'organization_pair', "TEXT NOT NULL DEFAULT ''");

const insertRegistration = database.prepare(`
  INSERT INTO registrations (
    id, country, supplier_name, supplier_champion, supplier_champion_designation,
    supplier_champion_email, factory_name, factory_champion,
    jigs_quantity, distribution_supplier_name, details_address, attention_name,
    contact_phone, contact_email, status, submitted_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
const insertAssignee = database.prepare(`
  INSERT INTO lms_assignees (
    registration_id, sequence_number, name, organization, organization_pair, designation, email
  ) VALUES (?, ?, ?, ?, ?, ?, ?)
`);
const insertFactoryChampion = database.prepare(`
  INSERT INTO factory_champions (
    registration_id, sequence_number, factory_name, factory_country,
    person_name, designation, email
  ) VALUES (?, ?, ?, ?, ?, ?, ?)
`);
const insertTpsUser = database.prepare(`
  INSERT INTO tps_users (
    registration_id, sequence_number, name, organization, organization_pair, designation, email
  ) VALUES (?, ?, ?, ?, ?, ?, ?)
`);
const deleteRegistration = database.prepare('DELETE FROM registrations WHERE id = ?');

function sendJson(response, status, payload) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  response.end(JSON.stringify(payload));
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.setEncoding('utf8');
    request.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) reject(new Error('Request is too large.'));
    });
    request.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch {
        reject(new Error('Invalid JSON request.'));
      }
    });
    request.on('error', reject);
  });
}

function cleanText(value, label, maxLength = 500) {
  const text = String(value ?? '').trim();
  if (!text) throw new Error(`${label} is required.`);
  if (text.length > maxLength) throw new Error(`${label} is too long.`);
  return text;
}

function cleanEmail(value, label) {
  const email = cleanText(value, label, 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error(`${label} is invalid.`);
  return email;
}

function cleanPersonName(value, label) {
  const name = cleanText(value, label, 200);
  if (name.split(/\s+/).length < 2) throw new Error(`${label} must contain at least two words.`);
  return name;
}

function validateProgramUsers(users, label, supplierName) {
  if (!Array.isArray(users) || users.length < 1 || users.length > 20) {
    throw new Error(`Between 1 and 20 ${label} users are required.`);
  }

  return users.map((user, index) => {
    const organization = cleanText(user?.organization, `${label} User ${index + 1} Organisation`, 300);
    const organizationPair = cleanText(user?.organizationPair, `${label} User ${index + 1} Organisation Pair`, 700);
    const catalogPair = registrationPairs.find((pair) => (
      pair.supplier === supplierName
      && organizationPair === `${pair.supplier} / ${pair.factory}`
      && (organization === pair.supplier || organization === pair.factory)
    ));
    if (!catalogPair) throw new Error(`${label} User ${index + 1} Organisation must be selected from the supplier/factory list.`);
    return {
      name: cleanPersonName(user?.name, `${label} User ${index + 1} Name`),
      organization,
      organizationPair,
      designation: cleanText(user?.designation, `${label} User ${index + 1} Designation`, 200),
      email: cleanEmail(user?.email, `${label} User ${index + 1} Email`),
    };
  });
}

function validateRegistration(payload) {
  const jigsQuantity = Number(payload.jigsQuantity);
  if (!Number.isInteger(jigsQuantity) || jigsQuantity < 1 || jigsQuantity > 10000) {
    throw new Error('Jigs Quantity must be between 1 and 10000.');
  }

  const country = cleanText(payload.country, 'Country', 100);
  const supplierName = cleanText(payload.supplierName, 'Supplier Name', 300);
  const catalogFactories = registrationPairs.filter((pair) => (
    pair.supplierCountry === country && pair.supplier === supplierName
  ));
  if (catalogFactories.length === 0) throw new Error('Country and Supplier Name must be selected from the approved list.');
  if (!Array.isArray(payload.factories) || payload.factories.length !== catalogFactories.length) {
    throw new Error('Champion details are required for every factory linked to this supplier.');
  }

  const factories = payload.factories.map((factory, index) => {
    const catalogFactory = catalogFactories[index];
    if (factory?.name !== catalogFactory.factory || factory?.country !== catalogFactory.factoryCountry) {
      throw new Error('The submitted supplier/factory pairing is invalid.');
    }
    return {
      name: catalogFactory.factory,
      country: catalogFactory.factoryCountry,
      champion: cleanPersonName(factory?.champion, `Factory ${index + 1} Champion`),
      designation: cleanText(factory?.designation, `Factory ${index + 1} Champion Designation`, 200),
      email: cleanEmail(factory?.email, `Factory ${index + 1} Champion Email`),
    };
  });

  return {
    country,
    supplierName,
    supplierChampion: cleanPersonName(payload.supplierChampion, 'Supplier Champion'),
    supplierChampionDesignation: cleanText(payload.supplierChampionDesignation, 'Supplier Champion Designation', 200),
    supplierChampionEmail: cleanEmail(payload.supplierChampionEmail, 'Supplier Champion Email'),
    factories,
    jigsQuantity,
    distributionSupplierName: supplierName,
    detailsAddress: cleanText(payload.detailsAddress, 'Delivery Address', 1000),
    attentionName: cleanPersonName(payload.attentionName, 'Attention Name'),
    contactPhone: cleanText(payload.contactPhone, 'Phone', 100),
    contactEmail: cleanEmail(payload.contactEmail, 'Contact Email'),
    assignees: validateProgramUsers(payload.assignees, 'LMS', supplierName),
    tpsUsers: validateProgramUsers(payload.tpsUsers, 'TPS', supplierName),
  };
}

function createRegistrationId() {
  const date = new Date().toISOString().slice(2, 10).replaceAll('-', '');
  return `MTP-${date}-${randomBytes(3).toString('hex').toUpperCase()}`;
}

function saveRegistration(registration) {
  const id = createRegistrationId();
  const submittedAt = new Date().toISOString();
  database.exec('BEGIN IMMEDIATE');
  try {
    insertRegistration.run(
      id,
      registration.country,
      registration.supplierName,
      registration.supplierChampion,
      registration.supplierChampionDesignation,
      registration.supplierChampionEmail,
      registration.factories[0].name,
      registration.factories[0].champion,
      registration.jigsQuantity,
      registration.distributionSupplierName,
      registration.detailsAddress,
      registration.attentionName,
      registration.contactPhone,
      registration.contactEmail,
      'Complete',
      submittedAt,
    );
    registration.factories.forEach((factory, index) => {
      insertFactoryChampion.run(
        id, index + 1, factory.name, factory.country,
        factory.champion, factory.designation, factory.email,
      );
    });
    registration.assignees.forEach((assignee, index) => {
      insertAssignee.run(
        id, index + 1, assignee.name, assignee.organization,
        assignee.organizationPair, assignee.designation, assignee.email,
      );
    });
    registration.tpsUsers.forEach((user, index) => {
      insertTpsUser.run(
        id, index + 1, user.name, user.organization,
        user.organizationPair, user.designation, user.email,
      );
    });
    database.exec('COMMIT');
    return { id, submittedAt };
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  }
}

function getRegistrations() {
  const rows = database.prepare(`
    SELECT * FROM registrations ORDER BY submitted_at DESC
  `).all();
  const assigneeQuery = database.prepare(`
    SELECT name, organization, organization_pair AS organizationPair, designation, email
    FROM lms_assignees
    WHERE registration_id = ?
    ORDER BY sequence_number
  `);
  const factoryQuery = database.prepare(`
    SELECT factory_name AS name, factory_country AS country,
      person_name AS champion, designation, email
    FROM factory_champions
    WHERE registration_id = ?
    ORDER BY sequence_number
  `);
  const tpsUserQuery = database.prepare(`
    SELECT name, organization, organization_pair AS organizationPair, designation, email
    FROM tps_users
    WHERE registration_id = ?
    ORDER BY sequence_number
  `);

  return rows.map((row) => {
    const storedFactories = factoryQuery.all(row.id);
    return {
      id: row.id,
      country: row.country,
      supplierName: row.supplier_name,
      supplierChampion: row.supplier_champion,
      supplierChampionDesignation: row.supplier_champion_designation || '',
      supplierChampionEmail: row.supplier_champion_email || '',
      factoryName: row.factory_name,
      factoryChampion: row.factory_champion,
      factories: storedFactories.length ? storedFactories : [{
        name: row.factory_name,
        country: '',
        champion: row.factory_champion,
        designation: '',
        email: '',
      }],
      jigsQuantity: row.jigs_quantity,
      distributionSupplierName: row.distribution_supplier_name,
      detailsAddress: row.details_address,
      attentionName: row.attention_name,
      contactPhone: row.contact_phone,
      contactEmail: row.contact_email,
      status: row.status,
      submittedAt: row.submitted_at,
      assignees: assigneeQuery.all(row.id),
      tpsUsers: tpsUserQuery.all(row.id),
    };
  });
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);

  if (request.method === 'GET' && url.pathname === '/api/health') {
    sendJson(response, 200, { ok: true });
    return;
  }

  if (request.method === 'POST' && url.pathname === '/api/registrations') {
    try {
      const payload = validateRegistration(await readJson(request));
      const result = saveRegistration(payload);
      sendJson(response, 201, { ok: true, ...result });
    } catch (error) {
      sendJson(response, 400, { ok: false, error: error.message || 'Registration could not be saved.' });
    }
    return;
  }

  if (request.method === 'GET' && url.pathname === '/api/admin/registrations') {
    sendJson(response, 200, { registrants: getRegistrations() });
    return;
  }

  if (request.method === 'DELETE' && url.pathname === '/api/admin/registrations') {
    const id = String(url.searchParams.get('id') || '').trim();
    if (!/^MTP-[A-Z0-9-]+$/.test(id)) {
      sendJson(response, 400, { ok: false, error: 'A valid registration ID is required.' });
      return;
    }
    const result = deleteRegistration.run(id);
    if (result.changes === 0) {
      sendJson(response, 404, { ok: false, error: 'Registration not found.' });
      return;
    }
    sendJson(response, 200, { ok: true, id });
    return;
  }

  sendJson(response, 404, { ok: false, error: 'Not found.' });
});

server.listen(port, host, () => {
  console.log(`Matalan registration API listening on http://${host}:${port}`);
});

function shutdown() {
  server.close(() => {
    database.close();
    process.exit(0);
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
