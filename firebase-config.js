// Shared Firebase project used by the Production People Management System.
window.LPA_FIREBASE_CONFIG = {
  apiKey: "AIzaSyB4hIpI6bLI7L-CZ9JY0XjFnGrwTmVQ3bE",
  authDomain: "wachirawit-c8582.firebaseapp.com",
  databaseURL: "https://wachirawit-c8582-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "wachirawit-c8582",
  storageBucket: "wachirawit-c8582.firebasestorage.app",
  messagingSenderId: "860073002133",
  appId: "1:860073002133:web:65ecba09c0c3cd4702879c"
};

// Keep the employee form heading/action buttons at the top, with the procedure title immediately below it.
(function(){
  function installProcedureTitle(){
    const main=document.querySelector('main.page');if(!main)return;
    let title=document.getElementById('procedureMainTitle');
    if(!title){title=document.createElement('div');title.id='procedureMainTitle';title.innerHTML='<div style="font-size:20px;font-weight:800;letter-spacing:.2px">SUPPLEMENT TO PROCEDURE DESCRIPTION - CBI QM-17 s1</div><div style="font-size:16px;font-weight:600;margin-top:3px">Layered Process Audit Checklist - Manufacturing</div>';}
    title.style.cssText='background:#fff;color:#111;text-align:center;padding:14px 16px 12px;margin:0 0 16px;border:1px solid #ead6d6;border-radius:10px;line-height:1.35';
    const pageHead=main.querySelector('.page-head');
    if(pageHead)pageHead.insertAdjacentElement('afterend',title);else main.insertBefore(title,main.firstChild);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installProcedureTitle);else installProcedureTitle();
})();

// Add the existing LPA enhancements after the page is ready. This block preserves the current audit behavior.
(function(){
  function boot(){
    const line=document.getElementById('line'),filters=document.querySelector('.filters');
    if(!line||!filters)return;

    // Audit date: visible calendar, locked to today.
    const date=document.getElementById('auditDate');
    if(date&&!date.dataset.visibleDateInstalled){date.dataset.visibleDateInstalled='1';date.type='date';const d=new Date();d.setMinutes(d.getMinutes()-d.getTimezoneOffset());const today=d.toISOString().slice(0,10);date.value=today;date.min=today;date.max=today;date.readOnly=false;const field=document.createElement('div');field.className='field';field.id='auditDateField';field.innerHTML='<label>Date / วันที่ Audit</label>';date.parentNode.insertBefore(field,date);field.appendChild(date);filters.insertBefore(field,filters.firstChild);const enforce=()=>{if(date.value!==today)date.value=today;};date.addEventListener('input',enforce);date.addEventListener('change',enforce);}

    // Auditee by Area.
    const auditee=document.getElementById('auditee');const auditeeByArea={1:'Pratoomchai',2:'Somkid',4:'Pratoomchai',5:'Somkid',6:'Narin',7:'Natthawat',8:'Pratoomchai',9:'Watcharee',10:'Teeraporn',11:'Ongard',12:'Wuttipat'};
    const areaNumber=v=>{const m=String(v||'').match(/^Area\s+(\d+)\b/i);return m?Number(m[1]):null;};
    function syncAuditee(){if(!auditee)return;const name=auditeeByArea[areaNumber(line.value)]||'';auditee.value=name;auditee.readOnly=!!name;}

    // Separate locked Workstation and Production fields.
    document.getElementById('workstationProductionField')?.remove();document.getElementById('workstationField')?.remove();document.getElementById('productionField')?.remove();
    const wf=document.createElement('div');wf.className='field';wf.id='workstationField';wf.innerHTML='<label>Workstation</label><input id="workstation" type="text" readonly placeholder="เลือก Line ก่อน">';
    const pf=document.createElement('div');pf.className='field';pf.id='productionField';pf.innerHTML='<label>Production</label><input id="production" type="text" readonly placeholder="เลือก Line ก่อน">';
    const lf=line.closest('.field');if(lf){lf.insertAdjacentElement('afterend',pf);lf.insertAdjacentElement('afterend',wf);}else{filters.appendChild(wf);filters.appendChild(pf);}
    const workstation=document.getElementById('workstation'),production=document.getElementById('production');const fixed={5:'U375 / Thinbride / APB-Mi Op10',6:'T6 / PBR / P2-30A / APB-Mi Op20',8:'U375 / P2-30A / Thin bride / APB-Mi'};
    function syncFields(){const area=areaNumber(line.value);const clean=String(line.value||'').replace(/^Area\s+\d+\s*/i,'').trim();const value=fixed[area]||clean;workstation.value=value;production.value=value;syncAuditee();}
    line.addEventListener('change',syncFields);syncFields();

    // Readonly appearance.
    if(!document.getElementById('lpaQuickStyles')){const s=document.createElement('style');s.id='lpaQuickStyles';s.textContent='#auditee[readonly],#workstation[readonly],#production[readonly]{background:#f3f4f6;color:#374151;font-weight:700;cursor:not-allowed}#auditDate{font-weight:700;cursor:pointer}';document.head.appendChild(s);}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
