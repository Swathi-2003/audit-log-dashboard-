require('dotenv').config();
const { faker } = require('@faker-js/faker');

const ACTIONS   = ['DELETE_USER','CREATE_USER','UPDATE_PERMISSIONS','LOGIN','LOGIN_FAILED','EXPORT_DATA','DELETE_RESOURCE'];
const SEVERITIES = ['LOW','MEDIUM','HIGH','CRITICAL'];
const STATUSES  = ['Resolved','Unresolved'];
const REGIONS   = ['ap-south-1','us-east-1','eu-west-1','ap-southeast-1'];
const ROLES     = ['admin','editor','viewer'];

function makeLog() {
  return {
    actor:        faker.internet.email(),
    role:         faker.helpers.arrayElement(ROLES),
    action:       faker.helpers.arrayElement(ACTIONS),
    resource:     `/api/users/${faker.number.int({ min: 1, max: 9999 })}`,
    resourceType: 'USER',
    ipAddress:    faker.internet.ip(),
    region:       faker.helpers.arrayElement(REGIONS),
    severity:     faker.helpers.arrayElement(SEVERITIES),
    status:       faker.helpers.arrayElement(STATUSES),
    timestamp:    faker.date.recent({ days: 90 }).toISOString()
  };
}

async function seed() {
  if (!process.env.MONGO_URI || process.env.MONGO_URI.includes('YOUR_MONGODB')) {
    console.error('❌ MONGO_URI not set. Create server/.env first.');
    process.exit(1);
  }

  const base = `http://localhost:${process.env.PORT || 5000}/api/logs/bulk`;
  console.log(`Seeding 10,000 records to ${base}...`);

  for (let i = 0; i < 10; i++) {
    const logs = Array.from({ length: 1000 }, makeLog);
    const res  = await fetch(base, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ logs })
    });
    const data = await res.json();
    console.log(`Chunk ${i + 1}/10: inserted ${data.inserted}/1000`);
  }
  console.log('✅ Seeding complete. 10,000 records in Atlas.');
}

seed().catch(err => { console.error('Seed error:', err.message); process.exit(1); });
