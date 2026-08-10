'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';
const PUBLIC = path.join(__dirname, 'public');
const SESSION_TTL = 8 * 60 * 60 * 1000;
const sessions = new Map();

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}
function userRecord(username, password, role, name) {
  const salt = crypto.createHash('sha256').update('lpa:' + username).digest('hex').slice(0, 32);
  return { username, role, name, salt, hash: hashPassword(password, salt) };
}
const users = new Map([
  ['auditor', userRecord('auditor', process.env.AUDITOR_PASSWORD || 'Audit@123', 'auditor', process.env.AUDITOR_NAME || 'LPA Auditor')],
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
  if (!s || s.expiresAt < Date.now()) { if (sid) sessions.delete(sid); return null; }
  s.expiresAt = Date.now() + SESSION_TTL;
  return s;
}
function send(res, status, body, type='text/plain; charset=utf-8', headers={}) {
  res.writeHead(status, {'Content-Type': type, 'Cache-Control': 'no-store', ...headers});
  res.end(body);
}
function json(res, status, obj, headers={}) { send(res, status, JSON.stringify(obj), 'application/json; charset=utf-8', headers); }
function serveFile(res, filename) {
  const p = path.join(PUBLIC, filename);
  fs.readFile(p, (err, data) => {
    if (err) return send(res, 404, 'Not found');
    const ext = path.extname(p); const types = {'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};
    send(res, 200, data, types[ext] || 'application/octet-stream');
  });
}
function requireRole(req, res, roles, file) {
  const s = getSession(req);
  if (!s) { res.writeHead(302, {Location:'/login'}); return res.end(); }
  if (!roles.includes(s.user.role)) return send(res, 403, '403 Forbidden');
  serveFile(res, file);
}
function readJson(req) {
  return new Promise((resolve, reject) => {
    let data=''; req.on('data', c => { data += c; if (data.length > 10000) req.destroy(); });
    req.on('end', () => { try { resolve(JSON.parse(data || '{}')); } catch(e) { reject(e); } }); req.on('error', reject);
  });
}
function secureEqualHex(a,b){try{return crypto.timingSafeEqual(Buffer.from(a,'hex'),Buffer.from(b,'hex'))}catch{return false}}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;
  if (req.method === 'GET' && pathname === '/') {
    const s=getSession(req); res.writeHead(302,{Location:!s?'/login':s.user.role==='admin'?'/admin':'/audit'}); return res.end();
  }
  if (req.method === 'GET' && pathname === '/login') return serveFile(res,'login.html');
  if (req.method === 'GET' && pathname === '/audit') return requireRole(req,res,['auditor','admin'],'audit.html');
  if (req.method === 'GET' && pathname === '/admin') return requireRole(req,res,['admin'],'admin.html');
  if (req.method === 'GET' && pathname === '/api/session') {
    const s=getSession(req); if(!s) return json(res,401,{error:'Unauthenticated'}); return json(res,200,{user:s.user});
  }
  if (req.method === 'POST' && pathname === '/api/login') {
    try {
      const {username='',password=''}=await readJson(req); const u=users.get(String(username));
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
  return send(res,404,'Not found');
});
server.listen(PORT,HOST,()=>console.log(`LPA Audit server running at http://localhost:${PORT}`));
