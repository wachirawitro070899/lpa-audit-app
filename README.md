# LPA Audit App - Login + Role Based Access

เวอร์ชันนี้เพิ่ม Login และตรวจสิทธิ์ที่ Server แล้ว ไม่ได้อาศัยการซ่อนเมนูด้วย Frontend เพียงอย่างเดียว

## สิทธิ์

- **Auditor**: เข้า `/audit` ได้ และไม่สามารถเข้า `/admin` ได้ (Server ตอบ `403 Forbidden`)
- **Admin**: เข้าได้ทั้ง `/admin` และ `/audit`
- ทุกหน้า protected ตรวจ session ก่อนเสิร์ฟไฟล์
- Session cookie เป็น `HttpOnly` + `SameSite=Strict`
- Password ตรวจด้วย `scrypt` hash

## บัญชีทดลอง

- Auditor: `auditor` / `Audit@123`
- Admin: `admin` / `Admin@123`

> ห้ามใช้รหัสผ่านทดลองนี้ใน Production

## วิธีรัน

ต้องมี Node.js 18 ขึ้นไป และไม่ต้อง `npm install` เพราะ server ใช้ Node built-in modules เท่านั้น

```bash
node server.js
```

จากนั้นเปิด `http://localhost:3000`

## ตั้งรหัสผ่านก่อนใช้งานจริง

Linux/macOS:

```bash
ADMIN_PASSWORD='your-strong-admin-password' AUDITOR_PASSWORD='your-strong-auditor-password' node server.js
```

Windows PowerShell:

```powershell
$env:ADMIN_PASSWORD='your-strong-admin-password'
$env:AUDITOR_PASSWORD='your-strong-auditor-password'
node server.js
```

ชื่อผู้ใช้ทดลองยังเป็น `admin` และ `auditor` ใน prototype นี้ หากต้องการผู้ใช้หลายคน ควรเชื่อมฐานข้อมูล/Active Directory/SSO ในขั้นต่อไป

## Production security checklist

1. ใช้ HTTPS และตั้ง `COOKIE_SECURE=1`
2. เก็บ Users/Password Hash ในฐานข้อมูลหรือเชื่อม AD/SSO ไม่เก็บบัญชีไว้ใน source code
3. ใช้ persistent session store เช่น Redis/Database แทน in-memory session
4. เพิ่ม CSRF protection สำหรับ API ที่แก้ไขข้อมูล
5. เพิ่ม rate limit / lockout สำหรับหน้า Login
6. บันทึก Audit Log การ login, logout และการเปลี่ยนข้อมูล
7. ย้าย Draft/Audit record จาก localStorage ไปเก็บใน Database พร้อมตรวจ role ทุก API request

## ฟังก์ชัน Audit เดิม

- ฟอร์ม LPA ครบหมวด 1-10
- N/A / 😊 / 😐 / 😒 และ Comments
- Save Draft ใน Browser
- Export Excel
- Export PDF
- Print
