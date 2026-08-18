'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';
const PUBLIC = __dirname;
const DATA_DIR = path.join(__dirname, 'data');
const AUDITS_FILE = path.join(DATA_DIR, 'audits.json');
const SESSION_TTL = 8 * 60 * 60 * 1000;
const sessions = new Map();

fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(AUDITS_FILE)) fs.writeFileSync(AUDITS_FILE, '[]\n', 'utf8');

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}
function userRecord(username, password, role, name) {
  const salt = crypto.createHash('sha256').update('lpa:' + username).digest('hex').slice(0, 32);
  return { username, role, name, salt, hash: hashPassword(password, salt) };
}
const users = new Map([
  ['admin', userRecord('admin', process.env.ADMIN_PASSWORD || 'Admin@123', 'admin', process.env.ADMIN_NAME || 'LPA Administrator')],
]);

function parseCookies(req) {
  const out = {};
  String(req.headers.cookie || '').split(';').forEach(part => {
    const i = part.indexOf('='); if (i < 0) return;
    out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  });
  return out;
}
function getSession(req) {
  const sid = parseCookies(req).lpa_sid;
  if (!sid) return null;
  const s = sessions.get(sid);
  if (!s || s.expiresAt < Date.now()) { sessions.delete(sid); return null; }
  s.expiresAt = Date.now() + SESSION_TTL;
  return s;
}
function send(res, status, body, type='text/plain; charset=utf-8', headers={}) {
  res.writeHead(status, {'Content-Type': type, 'Cache-Control': 'no-store', 'X-Content-Type-Options':'nosniff', ...headers});
  res.end(body);
}
function json(res, status, obj, headers={}) { send(res, status, JSON.stringify(obj), 'application/json; charset=utf-8', headers); }
function serveFile(res, filename) {
  const safe = path.basename(filename);
  const p = path.join(PUBLIC, safe);
  fs.readFile(p, (err, data) => {
    if (err) return send(res, 404, 'Not found');
    const ext = path.extname(p);
    const types = {'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};
    send(res, 200, data, types[ext] || 'application/octet-stream');
  });
}
function requireAdmin(req, res, file) {
  const s = getSession(req);
  if (!s) { res.writeHead(302, {Location:'/login'}); return res.end(); }
  if (s.user.role !== 'admin') return send(res, 403, '403 Forbidden');
  serveFile(res, file);
}
function readJson(req, maxBytes=300000) {
  return new Promise((resolve, reject) => {
    let data='';
    req.on('data', c => {
      data += c;
      if (Buffer.byteLength(data, 'utf8') > maxBytes) {
        reject(new Error('Payload too large'));
        req.destroy();
      }
    });
    req.on('end', () => { try { resolve(JSON.parse(data || '{}')); } catch(e) { reject(e); } });
    req.on('error', reject);
  });
}
function secureEqualHex(a,b){try{return crypto.timingSafeEqual(Buffer.from(a,'hex'),Buffer.from(b,'hex'))}catch{return false}}
function cleanText(v, max=500){ return String(v ?? '').trim().slice(0,max); }
function loadAudits(){
  try { const d=JSON.parse(fs.readFileSync(AUDITS_FILE,'utf8')); return Array.isArray(d)?d:[]; }
  catch { return []; }
}
function saveAudits(rows){
  const temp = AUDITS_FILE + '.tmp';
  fs.writeFileSync(temp, JSON.stringify(rows, null, 2) + '\n', 'utf8');
  fs.renameSync(temp, AUDITS_FILE);
}
function adminSession(req,res){
  const s=getSession(req);
  if(!s || s.user.role!=='admin'){ json(res,401,{error:'Unauthenticated'}); return null; }
  return s;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  // Public data-entry area: no login required.
  if (req.method === 'GET' && pathname === '/') { res.writeHead(302,{Location:'/audit'}); return res.end(); }
  if (req.method === 'GET' && pathname === '/audit') return serveFile(res,'audit.html');

  // Back office only.
  if (req.method === 'GET' && pathname === '/login') return serveFile(res,'login.html');
  if (req.method === 'GET' && pathname === '/admin') return requireAdmin(req,res,'admin.html');

  if (req.method === 'GET' && pathname === '/api/session') {
    const s=getSession(req); if(!s) return json(res,401,{error:'Unauthenticated'}); return json(res,200,{user:s.user});
  }
  if (req.method === 'POST' && pathname === '/api/login') {
    try {
      const {username='',password=''}=await readJson(req, 10000);
      const u=users.get(String(username));
      const candidate=u?hashPassword(String(password),u.salt):hashPassword(String(password),'00000000000000000000000000000000');
      if(!u || !secureEqualHex(candidate,u.hash)) return json(res,401,{error:'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'});
      const sid=crypto.randomBytes(32).toString('hex'); const user={username:u.username,role:u.role,name:u.name};
      sessions.set(sid,{user,expiresAt:Date.now()+SESSION_TTL});
      return json(res,200,{user},{'Set-Cookie':`lpa_sid=${sid}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_TTL/1000}${process.env.COOKIE_SECURE==='1'?'; Secure':''}`});
    } catch { return json(res,400,{error:'Invalid request'}); }
  }
  if (req.method === 'POST' && pathname === '/api/logout') {
    const sid=parseCookies(req).lpa_sid; if(sid)sessions.delete(sid);
    return json(res,200,{ok:true},{'Set-Cookie':'lpa_sid=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'});
  }

  // Public submit endpoint. It only accepts audit records; it does not expose back-office data.
  if (req.method === 'POST' && pathname === '/api/audits') {
    try {
      const body = await readJson(req);
      const meta = body.meta || {};
      const auditNo = cleanText(meta.auditNo, 100);
      const auditDate = cleanText(meta.auditDate, 20);
      const unit = cleanText(meta.unit, 100);
      const line = cleanText(meta.line, 100);
      const level = cleanText(meta.level, 50);
      const auditor = cleanText(meta.auditor, 150);
      if (!auditNo || !auditDate || !unit || !line || !level || !auditor) return json(res,400,{error:'กรุณากรอกข้อมูลส่วนหัวให้ครบถ้วน'});
      if (!body.state || typeof body.state !== 'object' || !body.state.answers) return json(res,400,{error:'ไม่พบข้อมูลผลการตรวจ'});

      const now = new Date().toISOString();
      const record = {
        id: crypto.randomUUID(),
        createdAt: now,
        meta: {auditNo,auditDate,unit,line,level,auditor},
        summary: {
          total: Number(body.summary?.total || 0),
          answered: Number(body.summary?.answered || 0),
          ok: Number(body.summary?.ok || 0),
          observe: Number(body.summary?.observe || 0),
          ng: Number(body.summary?.ng || 0),
          na: Number(body.summary?.na || 0),
        },
        state: body.state
      };
      const rows = loadAudits();
      rows.unshift(record);
      saveAudits(rows.slice(0,5000));
      return json(res,201,{ok:true,id:record.id,createdAt:record.createdAt});
    } catch(e) { return json(res,400,{error:e.message==='Payload too large'?'ข้อมูลมีขนาดใหญ่เกินไป':'ข้อมูลที่ส่งมาไม่ถูกต้อง'}); }
  }

  if (req.method === 'GET' && pathname === '/api/audits') {
    if(!adminSession(req,res)) return;
    const rows=loadAudits().map(r=>({id:r.id,createdAt:r.createdAt,meta:r.meta,summary:r.summary}));
    return json(res,200,{items:rows});
  }
  const auditMatch = pathname.match(/^\/api\/audits\/([0-9a-f-]+)$/i);
  if (auditMatch && req.method === 'GET') {
    if(!adminSession(req,res)) return;
    const row=loadAudits().find(r=>r.id===auditMatch[1]);
    if(!row) return json(res,404,{error:'Not found'});
    return json(res,200,row);
  }
  if (auditMatch && req.method === 'DELETE') {
    if(!adminSession(req,res)) return;
    const rows=loadAudits(); const next=rows.filter(r=>r.id!==auditMatch[1]);
    if(next.length===rows.length) return json(res,404,{error:'Not found'});
    saveAudits(next); return json(res,200,{ok:true});
  }

  return send(res,404,'Not found');
});
server.listen(PORT,HOST,()=>console.log(`LPA Audit server running at http://localhost:${PORT}`));
