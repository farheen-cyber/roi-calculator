// ─────────────────────────────────────────────────────────────
// EquityList Cap Table Parser — Backend
// Node.js + Express server
//
// Responsibilities:
//   1. Serve all static files (HTML, CSS) from this directory
//   2. Accept cap table file uploads (CSV, Excel, PDF)
//   3. Extract text / base64 from the file
//   4. Call Claude API with the content
//   5. Return structured JSON to the browser
//
// The Anthropic API key never touches the browser.
//
// Usage:
//   npm install
//   cp .env.example .env   ← add your key
//   npm start              ← http://localhost:3000
// ─────────────────────────────────────────────────────────────

require('dotenv').config();

const express   = require('express');
const multer    = require('multer');
const XLSX      = require('xlsx');
const Anthropic = require('@anthropic-ai/sdk');
const path      = require('path');

// ── Validate environment ──────────────────────────────────────
if (!process.env.ANTHROPIC_API_KEY) {
  console.warn('\n⚠️   ANTHROPIC_API_KEY is not set.');
  console.warn('    Copy .env.example → .env and add your key.');
  console.warn('    The server will start, but parsing will fail until a key is provided.\n');
}

// ── Setup ─────────────────────────────────────────────────────
const app       = express();
const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

// Store uploads in memory (no disk writes — safer, no cleanup needed)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB cap
  fileFilter: function (_req, file, cb) {
    const allowed = ['.csv', '.xlsx', '.xls', '.pdf'];
    const ext     = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type: ' + ext + '. Please upload CSV, Excel, or PDF.'));
    }
  },
});

// Serve all HTML/CSS/JS files in this directory
app.use(express.static(__dirname));

// Default route → roi-calculator.html
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'roi-calculator.html'));
});

// ── Extraction prompts ────────────────────────────────────────
const SYSTEM_PROMPT =
  'You are an expert cap table analyst. Your job is to extract structured equity and ESOP data ' +
  'from cap table documents. Always return valid JSON only — no markdown, no explanation, just the raw JSON object.';

const SCHEMA = `{
  "company_name": string | null,
  "cin": string | null,
  "geography": "India" | "United States" | "Singapore" | "United Kingdom" | null,
  "currency": "INR" | "USD" | "SGD" | "GBP" | null,
  "as_of_date": string | null,
  "shareholders": [
    {
      "name": string,
      "type": "founder" | "institutional_vc" | "angel" | "advisor" | "employee" | "other",
      "shares": number,
      "share_class": string | null,
      "percentage_fully_diluted": number | null
    }
  ],
  "shareholders_count_non_esop": number,
  "esop_pool": {
    "authorized_shares": number | null,
    "pool_percentage": number | null,
    "granted": number | null,
    "vested": number | null,
    "exercised": number | null,
    "outstanding": number | null,
    "available_ungranted": number | null
  },
  "esop_employees": [
    {
      "name": string,
      "designation": string | null,
      "department": string | null,
      "options_granted": number,
      "grant_date": string | null,
      "vested": number | null,
      "exercised": number | null
    }
  ],
  "esop_employees_count": number,
  "fundraising_rounds": [
    {
      "round": string,
      "date": string | null,
      "lead_investor": string | null,
      "amount": string | null
    }
  ],
  "total_shares_fully_diluted": number | null,
  "company_stage_estimate": "pre-seed" | "seed" | "series-a" | "series-b" | "series-c-plus" | null,
  "confidence": "high" | "medium" | "low",
  "confidence_notes": string
}`;

const USER_PROMPT =
  'Extract all cap table and ESOP information from the provided document. ' +
  'Be thorough — capture every shareholder, every employee option grant, and every fundraising round shown.\n\n' +
  'Return ONLY a valid JSON object matching this exact schema. Use null for any field not present in the document:\n\n' +
  SCHEMA + '\n\n' +
  'Important:\n' +
  '- shareholders array: include ONLY non-ESOP holders (founders, VCs, angels, advisors). ' +
    'Do NOT include the ESOP pool itself as a shareholder entry.\n' +
  '- shareholders_count_non_esop: count of people/entities in the shareholders array\n' +
  '- esop_employees_count: total number of employees who have received option grants\n' +
  '- For grant_date use ISO format YYYY-MM-DD if possible\n' +
  '- If the document has multiple sheets, consolidate all data\n' +
  '- confidence: "high" if clean and complete, "medium" if some data is missing, "low" if very sparse';

// ── File → Claude payload ─────────────────────────────────────
function fileToPayload(buffer, originalname) {
  const ext = path.extname(originalname).toLowerCase().slice(1);

  if (ext === 'csv') {
    return { type: 'text', content: buffer.toString('utf-8') };
  }

  if (ext === 'xlsx' || ext === 'xls') {
    const wb     = XLSX.read(buffer, { type: 'buffer' });
    const sheets = wb.SheetNames.map(name =>
      '=== Sheet: ' + name + ' ===\n' + XLSX.utils.sheet_to_csv(wb.Sheets[name])
    );
    return { type: 'text', content: sheets.join('\n\n') };
  }

  if (ext === 'pdf') {
    return { type: 'pdf', content: buffer.toString('base64') };
  }

  throw new Error('Unsupported extension: ' + ext);
}

// ── Claude messages builder ───────────────────────────────────
function buildMessages(payload) {
  if (payload.type === 'pdf') {
    return [{
      role: 'user',
      content: [
        {
          type: 'document',
          source: { type: 'base64', media_type: 'application/pdf', data: payload.content },
        },
        { type: 'text', text: USER_PROMPT },
      ],
    }];
  }

  return [{
    role: 'user',
    content: USER_PROMPT + '\n\nDocument content:\n```\n' + payload.content + '\n```',
  }];
}

// ── Parse JSON from Claude response ──────────────────────────
function extractJSON(text) {
  // Handle markdown code fences if Claude wraps the JSON
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fenced) return JSON.parse(fenced[1]);

  const bare = text.match(/(\{[\s\S]*\})/);
  if (bare)   return JSON.parse(bare[1]);

  throw new Error('Claude response did not contain valid JSON.');
}

// ── API route ─────────────────────────────────────────────────
app.post('/api/parse', upload.single('file'), async (req, res) => {
  if (!anthropic) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY is not configured. Add it to .env and restart the server.' });
  }
  if (!req.file) {
    return res.status(400).json({ error: 'No file received. Please attach a file.' });
  }

  console.log('[parse] file:', req.file.originalname, '|', (req.file.size / 1024).toFixed(1) + ' KB');

  try {
    const payload  = fileToPayload(req.file.buffer, req.file.originalname);
    const messages = buildMessages(payload);

    const apiParams = {
      model:      'claude-haiku-3-5-20241022',
      max_tokens: 4096,
      system:     SYSTEM_PROMPT,
      messages,
    };

    // PDF requires the beta header
    if (payload.type === 'pdf') {
      apiParams.betas = ['pdfs-2024-09-25'];
    }

    const response = await anthropic.messages.create(apiParams);
    const rawText  = response.content[0].text;
    const data     = extractJSON(rawText);

    console.log('[parse] success — company:', data.company_name, '| confidence:', data.confidence);
    res.json({ success: true, data });

  } catch (err) {
    console.error('[parse] error:', err.message);

    // Surface meaningful errors to the client
    if (err.status === 401) {
      return res.status(500).json({ error: 'Invalid Anthropic API key. Check your .env file.' });
    }
    if (err.status === 429) {
      return res.status(429).json({ error: 'Rate limit reached. Wait a moment and try again.' });
    }

    res.status(500).json({ error: err.message || 'Extraction failed. Check server logs.' });
  }
});

// ── ROI Calculator transform endpoint ────────────────────────
// Accepts the same file upload, calls Claude, then maps the
// Haiku SCHEMA response into the exact shape that
// roi-calculator.html's applyParsedData() expects.
// ─────────────────────────────────────────────────────────────
app.post('/api/parse-for-roi', upload.single('file'), async (req, res) => {
  if (!anthropic) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY is not configured. Add it to .env and restart the server.' });
  }
  if (!req.file) {
    return res.status(400).json({ error: 'No file received. Please attach a file.' });
  }

  console.log('[roi-parse] file:', req.file.originalname, '|', (req.file.size / 1024).toFixed(1) + ' KB');

  try {
    const payload  = fileToPayload(req.file.buffer, req.file.originalname);
    const messages = buildMessages(payload);

    const apiParams = {
      model:      'claude-haiku-3-5-20241022',
      max_tokens: 4096,
      system:     SYSTEM_PROMPT,
      messages,
    };

    if (payload.type === 'pdf') {
      apiParams.betas = ['pdfs-2024-09-25'];
    }

    const response = await anthropic.messages.create(apiParams);
    const rawText  = response.content[0].text;
    const raw      = extractJSON(rawText);

    console.log('[roi-parse] success — company:', raw.company_name, '| confidence:', raw.confidence);

    // ── Transform to applyParsedData() shape ───────────────
    const geoMap = {
      'india': 'india', 'united states': 'us', 'singapore': 'singapore', 'united kingdom': 'uk',
      'us': 'us', 'uk': 'uk',
    };
    const geo = raw.geography ? geoMap[raw.geography.toLowerCase()] || '' : '';

    // Build shareholders block
    const shData = (raw.shareholders || []).map(sh => ({
      name: sh.name,
      shares: sh.shares || null,
      ownership: sh.percentage_fully_diluted != null ? sh.percentage_fully_diluted / 100 : null,
      class: sh.share_class || null,
    }));

    // Build grants block from esop_employees
    const grantData = (raw.esop_employees || []).map(emp => ({
      name: emp.name,
      granted: emp.options_granted || null,
      vested: emp.vested || null,
    }));

    // Pool summary
    const pool = raw.esop_pool || {};

    // Compute founder ownership from shareholders
    const founders = shData.filter(sh => {
      // Check if this is a founder by looking at the raw shareholders type
      const rawSH = (raw.shareholders || []).find(r => r.name === sh.name);
      return rawSH && rawSH.type === 'founder';
    });
    const founderPct = founders.reduce((sum, f) => sum + (f.ownership || 0), 0);

    const result = {
      company: { name: raw.company_name || '' },
      geo: geo,
      summary: {
        total_shares: raw.total_shares_fully_diluted || null,
        capital_raised: null, // extracted from fundraising if available
        founder_ownership: founderPct > 0 ? (founderPct * 100).toFixed(1) + '%' : null,
        pool: {
          authorized: pool.authorized_shares || null,
          allocated: pool.granted || null,
          unallocated: pool.available_ungranted || null,
        },
      },
      blocks: [],
      // Extra fields for the ROI calculator
      _raw: {
        shareholders_count: raw.shareholders_count_non_esop || shData.length,
        esop_count: raw.esop_employees_count || grantData.length,
        confidence: raw.confidence,
        confidence_notes: raw.confidence_notes,
        stage: raw.company_stage_estimate,
        fundraising: raw.fundraising_rounds || [],
      },
    };

    // Capital raised from fundraising rounds
    if (raw.fundraising_rounds && raw.fundraising_rounds.length) {
      let totalRaised = 0;
      raw.fundraising_rounds.forEach(r => {
        if (r.amount) {
          const cleaned = String(r.amount).replace(/[^0-9.]/g, '');
          const n = parseFloat(cleaned);
          if (!isNaN(n)) totalRaised += n;
        }
      });
      if (totalRaised > 0) result.summary.capital_raised = totalRaised;
    }

    if (shData.length) {
      result.blocks.push({ type: 'SH', data: shData, score: 1000 });
    }
    if (grantData.length) {
      result.blocks.push({ type: 'GRANTS', data: grantData, score: 1000 });
    }

    res.json({ success: true, data: result });

  } catch (err) {
    console.error('[roi-parse] error:', err.message);
    if (err.status === 401) {
      return res.status(500).json({ error: 'Invalid Anthropic API key. Check your .env file.' });
    }
    if (err.status === 429) {
      return res.status(429).json({ error: 'Rate limit reached. Wait a moment and try again.' });
    }
    res.status(500).json({ error: err.message || 'Extraction failed. Check server logs.' });
  }
});

// Multer error handler (file type / size rejections)
app.use(function (err, _req, res, _next) {
  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large. Maximum size is 15 MB.' });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
});

// ── Start ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('\n✅  EquityList ROI Calculator running');
  console.log('   Open: http://localhost:' + PORT + '/roi-calculator.html\n');
});
