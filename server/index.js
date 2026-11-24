import { createServer } from 'node:http';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { randomBytes } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';

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

  CREATE INDEX IF NOT EXISTS idx_registrations_submitted_at
    ON registrations(submitted_at DESC);
  CREATE INDEX IF NOT EXISTS idx_assignees_registration_id
    ON lms_assignees(registration_id);
`);

const insertRegistration = database.prepare(`
  INSERT INTO registrations (
    id, country, supplier_name, supplier_champion, factory_name, factory_champion,
    jigs_quantity, distribution_supplier_name, details_address, attention_name,
    contact_phone, contact_email, status, submitted_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
const insertAssignee = database.prepare(`
  INSERT INTO lms_assignees (
    registration_id, sequence_number, name, designation, email
  ) VALUES (?, ?, ?, ?, ?)
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

function validateRegistration(payload) {
  const jigsQuantity = Number(payload.jigsQuantity);
  if (!Number.isInteger(jigsQuantity) || jigsQuantity < 1 || jigsQuantity > 10000) {
    throw new Error('Jigs Quantity must be between 1 and 10000.');
  }
  if (!Array.isArray(payload.assignees) || payload.assignees.length < 1 || payload.assignees.length > 20) {
    throw new Error('Between 1 and 20 LMS assignees are required.');
  }

  return {
    country: cleanText(payload.country, 'Country', 100),
    supplierName: cleanText(payload.supplierName, 'Supplier Name', 300),
    supplierChampion: cleanText(payload.supplierChampion, 'Supplier Champion', 200),
    factoryName: cleanText(payload.factoryName, 'Factory Name', 300),
    factoryChampion: cleanText(payload.factoryChampion, 'Factory Champion', 200),
    jigsQuantity,
    distributionSupplierName: cleanText(payload.distributionSupplierName, 'Distribution Supplier Name', 300),
    detailsAddress: cleanText(payload.detailsAddress, 'Delivery Address', 1000),
    attentionName: cleanText(payload.attentionName, 'Attention Name', 200),
    contactPhone: cleanText(payload.contactPhone, 'Phone', 100),
    contactEmail: cleanEmail(payload.contactEmail, 'Contact Email'),
    assignees: payload.assignees.map((assignee, index) => ({
      name: cleanText(assignee?.name, `Assignee ${index + 1} Name`, 200),
      designation: cleanText(assignee?.designation, `Assignee ${index + 1} Designation`, 200),
      email: cleanEmail(assignee?.email, `Assignee ${index + 1} Email`),
    })),
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
      registration.factoryName,
      registration.factoryChampion,
      registration.jigsQuantity,
      registration.distributionSupplierName,
      registration.detailsAddress,
      registration.attentionName,
      registration.contactPhone,
      registration.contactEmail,
      'Complete',
      submittedAt,
    );
    registration.assignees.forEach((assignee, index) => {
      insertAssignee.run(id, index + 1, assignee.name, assignee.designation, assignee.email);
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
    SELECT name, designation, email
    FROM lms_assignees
    WHERE registration_id = ?
    ORDER BY sequence_number
  `);

  return rows.map((row) => ({
    id: row.id,
    country: row.country,
    supplierName: row.supplier_name,
    supplierChampion: row.supplier_champion,
    factoryName: row.factory_name,
    factoryChampion: row.factory_champion,
    jigsQuantity: row.jigs_quantity,
    distributionSupplierName: row.distribution_supplier_name,
    detailsAddress: row.details_address,
    attentionName: row.attention_name,
    contactPhone: row.contact_phone,
    contactEmail: row.contact_email,
    status: row.status,
    submittedAt: row.submitted_at,
    assignees: assigneeQuery.all(row.id),
  }));
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
