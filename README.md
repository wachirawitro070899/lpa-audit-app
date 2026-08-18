# LPA / Process Audit App - Public Form + Admin Login

ระบบถูกแยกเป็น 2 ส่วนชัดเจน:

- **หน้ากรอกข้อมูล** `/audit` — เปิดใช้งานได้โดยไม่ต้อง Login
- **ระบบหลังบ้าน** `/admin` — ต้อง Login ก่อนเท่านั้น
- หน้า Login: `/login`
- ข้อมูลที่กด **ส่งข้อมูล** จะบันทึกฝั่ง Server ที่ `data/audits.json`
- Admin สามารถดูรายการ, ค้นหา, เปิดรายละเอียด และลบรายการได้
- ผู้กรอกไม่สามารถเรียกดูรายการ Audit ทั้งหมดผ่าน API ได้

## บัญชี Admin ทดลอง

- Username: `admin`
- Password: `Admin@123`

> ห้ามใช้รหัสผ่านทดลองนี้ใน Production

## วิธีรัน

ต้องมี Node.js 18 ขึ้นไป ไม่ต้องติดตั้ง package เพิ่ม

```bash
node server.js
```

เปิดใช้งาน:

- กรอกข้อมูล: `http://localhost:3000/audit`
- หลังบ้าน: `http://localhost:3000/admin`

## ตั้งรหัสผ่าน Admin ก่อนใช้งานจริง

Linux/macOS:

```bash
ADMIN_PASSWORD='your-strong-admin-password' node server.js
```

Windows PowerShell:

```powershell
$env:ADMIN_PASSWORD='your-strong-admin-password'
node server.js
```

## Production checklist

1. ใช้ HTTPS และตั้ง `COOKIE_SECURE=1`
2. เปลี่ยนจากไฟล์ JSON เป็น Database เช่น PostgreSQL / MySQL / SQL Server
3. ใช้ persistent session store แทน in-memory session
4. เพิ่ม CSRF protection สำหรับ API หลังบ้าน
5. เพิ่ม rate limit / account lockout สำหรับ Login
6. บันทึก Audit Log ของ Admin
7. สำรองฐานข้อมูลและกำหนดสิทธิ์ OS ของไฟล์ข้อมูล
