const Log = require('../models/Log');

const ALLOWED_SORT = new Set([
  'timestamp','actor','action','severity','status','region','resourceType'
]);

// POST /api/logs/bulk
exports.bulkUpload = async (req, res) => {
  try {
    const { logs } = req.body;
    if (!Array.isArray(logs) || logs.length === 0)
      return res.status(400).json({ error: 'Body must include a non-empty "logs" array.' });
    if (logs.length > 10000)
      return res.status(400).json({ error: 'Maximum 10,000 records per request.' });

    const CHUNK = 1000;
    let inserted = 0;
    const errors = [];

    for (let i = 0; i < logs.length; i += CHUNK) {
      try {
        const result = await Log.insertMany(logs.slice(i, i + CHUNK), { ordered: false });
        inserted += result.length;
      } catch (err) {
        if (err.insertedDocs) inserted += err.insertedDocs.length;
        if (err.writeErrors) err.writeErrors.forEach(we =>
          errors.push({ index: i + we.index, message: we.errmsg })
        );
      }
    }

    res.status(201).json({
      requested: logs.length,
      inserted,
      failed: logs.length - inserted,
      errors: errors.slice(0, 50)
    });
  } catch (err) {
    res.status(500).json({ error: 'Bulk upload failed', detail: err.message });
  }
};

// GET /api/logs
exports.getLogs = async (req, res) => {
  try {
    const {
      severity, status, region, actor, action, resourceType,
      from, to, search,
      sortBy = 'timestamp', order = 'desc',
      page = 1, limit = 25
    } = req.query;

    const filter = {};
    if (severity)     filter.severity = severity;
    if (status)       filter.status   = status;
    if (resourceType) filter.resourceType = resourceType;
    if (actor)        filter.actor    = actor;
    if (action)       filter.action   = action;

    // Partial, case-insensitive match for region
    if (region) filter.region = { $regex: region, $options: 'i' };

    // Date range
    if (from || to) {
      filter.timestamp = {};
      if (from) filter.timestamp.$gte = new Date(from);
      if (to)   filter.timestamp.$lte = new Date(to);
    }

    // Free-text search using regex $or (avoids $text keyword-OR mismatch)
    if (search) {
      const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { actor: rx }, { action: rx }, { resource: rx }, { ipAddress: rx }
      ];
    }

    const sortField = ALLOWED_SORT.has(sortBy) ? sortBy : 'timestamp';
    const sortDir   = order === 'asc' ? 1 : -1;
    const pageNum   = Math.max(1, parseInt(page)  || 1);
    const limitNum  = Math.min(100, Math.max(1, parseInt(limit) || 25));
    const skip      = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      Log.find(filter).sort({ [sortField]: sortDir }).skip(skip).limit(limitNum).lean(),
      Log.countDocuments(filter)
    ]);

    res.json({ logs, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) });
  } catch (err) {
    res.status(500).json({ error: 'Query failed', detail: err.message });
  }
};

// GET /api/logs/:id
exports.getLogById = async (req, res) => {
  try {
    const log = await Log.findById(req.params.id).lean();
    if (!log) return res.status(404).json({ error: 'Log not found' });
    res.json(log);
  } catch (err) {
    res.status(400).json({ error: 'Invalid id', detail: err.message });
  }
};
