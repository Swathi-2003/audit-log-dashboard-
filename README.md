# Security Audit Log Dashboard

A full-stack dashboard for security engineers to upload, view, filter, search, sort, and paginate system audit logs.

## Live Demo

- **Frontend:** https://audit-log-dashboard-6sdp.vercel.app
- **Backend API:** https://audit-log-server.onrender.com/api/health

> Note: The backend is on Render's free tier and may take 30–60 seconds to wake up after inactivity. Please wait and refresh if the table is empty on first load.

## Stack

- **Frontend:** React 18, Vite
- **Backend:** Node.js, Express
- **Database:** MongoDB Atlas (Mongoose)

## Project Structure

```
project/
├── server/               Express API
│   ├── controllers/      Request handlers
│   ├── models/           Mongoose schema
│   ├── routes/           Express routes
│   ├── server.js         Entry point
│   ├── seed.js           Generates 10,000 test records
│   └── .env.example      Environment variable template
└── client/               React dashboard (Vite)
    └── src/
        ├── components/   FilterBar, LogTable, Pagination, StatsBar
        └── App.jsx       Main app
```

## Local Setup

### Prerequisites

- Node.js 18+
- A MongoDB Atlas account (free at https://cloud.mongodb.com)

### 1. Clone and set up the backend

```bash
cd server
npm install
```

**Create your `.env` file** (required — without this the server will not start):

**Windows:**
```powershell
copy .env.example .env
```
**Mac/Linux:**
```bash
cp .env.example .env
```

Open `server/.env` and replace `YOUR_MONGODB_ATLAS_CONNECTION_STRING_HERE` with your real Atlas connection string:

```
PORT=5000
MONGO_URI=mongodb+srv://youruser:yourpassword@yourcluster.mongodb.net/audit_logs?appName=yourapp
```

**Important:** Make sure the URL includes `/audit_logs` before the `?`. Without this your app will connect but to the wrong database.

Start the server:

```bash
npm run dev
```

You should see:
```
✅ MongoDB connected (Atlas)
✅ Server running on port 5000
```

If you see ❌ errors, check that your `.env` file exists and has a valid connection string.

### 2. Seed test data

With the server running, open a second terminal:

```bash
cd server
npm run seed
```

You'll see:
```
Chunk 1/10: inserted 1000/1000
...
✅ Seeding complete. 10,000 records in Atlas.
```

### 3. Set up the frontend

```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173 — the dashboard will load with all 10,000 logs.

## API Reference

### `POST /api/logs/bulk`
Upload up to 10,000 log records in one request.

**Body:** `{ "logs": [ { actor, role, action, resource, resourceType, ipAddress, region, severity, status, timestamp }, ... ] }`

**Response:** `{ requested, inserted, failed, errors }`

### `GET /api/logs`
Query logs with server-side filtering, search, sort, and pagination.

**Query params:** `severity`, `status`, `region`, `actor`, `action`, `resourceType`, `from`, `to`, `search`, `sortBy`, `order`, `page`, `limit`

**Response:** `{ logs, total, page, limit, totalPages }`

### `GET /api/logs/:id`
Get a single log record by ID.

### `GET /api/health`
Health check. Returns `{ "status": "ok" }`.

## Technical Decisions

- **Bulk upload with `insertMany({ ordered: false })`:** Inserting in unordered batches of 1,000 means a single invalid record doesn't abort the entire request — MongoDB continues inserting the rest and reports failures separately. The response always includes a count of inserted vs failed records.

- **All filtering, search, sort, and pagination are server-side**, as required by the spec. The client sends only query parameters; the server builds the MongoDB filter, applies `.sort().skip().limit()`, and runs a parallel `countDocuments()` for pagination metadata. This keeps the client fast regardless of how many total records exist.

- **Indexes:** `actor`, `action`, `resourceType`, `region`, `severity`, `status`, and `timestamp` are individually indexed for fast filtering. A compound index on `{ status, severity, timestamp }` speeds up the most common query pattern (filter by status + severity, sort by recency).

- **Search uses a case-insensitive regex `$or`** across `actor`, `action`, `resource`, and `ipAddress` for true substring matching. An earlier version used MongoDB's `$text` index, but `$text` splits input into keywords and matches any of them (OR logic) — typing "gmail.com" would match almost every record. Regex matching gives precise, intuitive results.

- **Region filter uses partial regex matching** (not exact match), so typing "ap" correctly matches both "ap-south-1" and "ap-southeast-1".

- **Offset-based pagination** (`skip`/`limit`) was chosen over cursor-based pagination because the UI shows "Page X of Y" and allows jumping to any page. Trade-off: `skip()` gets slower at very high page offsets on huge collections. Cursor-based (keyset) pagination would be the next improvement for collections in the millions.

- **Field allow-list for `sortBy`** guards against arbitrary sort expressions from the query string.

- **Startup validation in `server.js`:** If `MONGO_URI` is missing or is the placeholder value, the server exits immediately with a clear error message instead of silently falling back to a local database. This prevents the confusing situation where the app "works" locally but connects to the wrong database.

- **`.env` is never committed** — it is in `.gitignore`. The `.env.example` file is committed instead as a template. Render's environment variables are set separately in the dashboard.

- **Seed script** generates realistic test data using `@faker-js/faker` and POSTs it through the real bulk endpoint in chunks of 1,000 — which also serves as an end-to-end smoke test of the upload pipeline.

## Deployment

### Backend (Render)

1. Create a new Web Service on https://render.com
2. Connect your GitHub repository
3. Set Root Directory to `server`
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Add environment variable: `MONGO_URI` = your full Atlas connection string (with real password and `/audit_logs` in the path)
7. Deploy

### Frontend (Vercel)

1. Import your repository on https://vercel.com
2. Set Root Directory to `client`
3. Add environment variable: `VITE_API_URL` = your Render backend URL (e.g. `https://your-service.onrender.com`)
4. **Important:** Go to Settings → Deployment Protection → turn OFF all protection so the app is publicly accessible without login
5. Deploy

