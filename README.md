# LPA / Process Audit App - GitHub Pages + Firebase

ระบบถูกแยกเป็น 2 ส่วนชัดเจน:

- **หน้าพนักงานกรอกข้อมูล** `audit.html` — เปิดใช้งานได้โดยไม่ต้อง Login และไม่มีเมนูระบบหลังบ้าน
- **ระบบหลังบ้าน** `admin.html` — ต้อง Login ผ่าน `login.html` ก่อน
- ข้อมูลที่กด **ส่งข้อมูล** จะบันทึกที่ Firebase Realtime Database ใน `lpaAudits`
- Admin สามารถดูรายการ, ค้นหา, เปิดรายละเอียด และลบรายการได้
- ผู้กรอกไม่สามารถเรียกดูรายการ Audit ทั้งหมดผ่าน API ได้

เปิดใช้งานผ่าน GitHub Pages ได้โดยตรง ไม่ต้องรัน Node.js

## Production checklist

1. ใช้ HTTPS และตั้ง `COOKIE_SECURE=1`
2. เปลี่ยนจากไฟล์ JSON เป็น Database เช่น PostgreSQL / MySQL / SQL Server
3. ใช้ persistent session store แทน in-memory session
4. เพิ่ม CSRF protection สำหรับ API หลังบ้าน
5. เพิ่ม rate limit / account lockout สำหรับ Login
6. บันทึก Audit Log ของ Admin
7. สำรองฐานข้อมูลและกำหนดสิทธิ์ OS ของไฟล์ข้อมูล
