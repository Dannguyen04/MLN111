const http = require('http');
const fs = require('fs');
const path = require('path');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// ==========================================
// ACCESS CODE GATE (each code binds to 1 device only)
// ==========================================
const CODES_FILE = path.join(__dirname, 'codes.json');
const BINDINGS_FILE = path.join(__dirname, 'code-bindings.json');

function loadValidCodes() {
  try {
    const raw = fs.readFileSync(CODES_FILE, 'utf-8');
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list.map(c => String(c).trim().toUpperCase()) : [];
  } catch (e) {
    return [];
  }
}

function loadBindings() {
  try {
    const raw = fs.readFileSync(BINDINGS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

function saveBindings(bindings) {
  fs.writeFileSync(BINDINGS_FILE, JSON.stringify(bindings, null, 2), 'utf-8');
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(body, 'utf-8');
}

function handleVerifyCode(req, res) {
  let rawBody = '';
  req.on('data', chunk => {
    rawBody += chunk;
    // Basic guard against oversized payloads
    if (rawBody.length > 10_000) req.destroy();
  });
  req.on('end', () => {
    let data;
    try {
      data = JSON.parse(rawBody);
    } catch (e) {
      return sendJson(res, 400, { success: false, message: 'Dữ liệu gửi lên không hợp lệ.' });
    }

    const code = String(data.code || '').trim().toUpperCase();
    const deviceId = String(data.deviceId || '').trim();

    if (!code || !deviceId) {
      return sendJson(res, 400, { success: false, message: 'Thiếu mã truy cập hoặc thông tin thiết bị.' });
    }

    const validCodes = loadValidCodes();
    if (!validCodes.includes(code)) {
      return sendJson(res, 401, { success: false, message: 'Mã truy cập không tồn tại.' });
    }

    const bindings = loadBindings();
    const existing = bindings[code];

    if (existing && existing.deviceId !== deviceId) {
      return sendJson(res, 403, { success: false, message: 'Mã này đã được kích hoạt trên một thiết bị khác.' });
    }

    bindings[code] = { deviceId, boundAt: existing ? existing.boundAt : new Date().toISOString() };
    saveBindings(bindings);

    return sendJson(res, 200, { success: true, message: 'Kích hoạt thành công!' });
  });
}

const server = http.createServer((req, res) => {
  // Decode URL in case of special characters
  let decodedUrl = decodeURIComponent(req.url);
  // Strip query parameters
  const qIdx = decodedUrl.indexOf('?');
  if (qIdx !== -1) {
    decodedUrl = decodedUrl.substring(0, qIdx);
  }

  if (req.method === 'POST' && decodedUrl === '/api/verify-code') {
    return handleVerifyCode(req, res);
  }

  let filePath = path.join(__dirname, decodedUrl === '/' ? 'index.html' : decodedUrl);
  const extname = path.extname(filePath);
  let contentType = MIME_TYPES[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>404 Không tìm thấy trang</h1>', 'utf-8');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Lỗi máy chủ nội bộ: ' + error.code, 'utf-8');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

const PORT = process.env.PORT || 3005;
server.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}/`);
});
