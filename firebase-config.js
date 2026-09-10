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

// LPA Evaluation Rating and audit form enhancements.
(function () {
  function addEvaluationStyles() {
    if (document.getElementById('lpaEvaluationStyles')) return;
    const style = document.createElement('style');
    style.id = 'lpaEvaluationStyles';
    style.textContent = `
      .evaluation-rating{margin-top:14px;border:1px solid #8b6b6b;border-radius:10px;overflow:hidden;background:#fff}
      .evaluation-rating table{width:100%;border-collapse:collapse;table-layout:fixed;font-size:12px}
      .evaluation-rating th,.evaluation-rating td{border:1px solid #8b6b6b;padding:8px 10px;text-align:center;vertical-align:middle}
      .evaluation-rating .ev-head{background:#e8b8b4;font-weight:700;color:#111}
      .evaluation-rating .ev-range{width:17%;font-weight:700;background:#f7e8e8}
      .evaluation-rating .ev-emoji{width:9%;font-size:24px;font-weight:700}
      .evaluation-rating .ev-desc{text-align:left;line-height:1.45;font-weight:600}
      .evaluation-rating .ev-green{background:#8df34d}.evaluation-rating .ev-yellow{background:#fff600}.evaluation-rating .ev-red{background:#ff1a0a;color:#000}
      .evaluation-rating .ev-current{padding:10px 12px;display:flex;align-items:center;justify-content:center;gap:10px;font-weight:700;border-top:1px solid #8b6b6b}
      .evaluation-rating .ev-current.ev-green{background:#8df34d}.evaluation-rating .ev-current.ev-yellow{background:#fff600}.evaluation-rating .ev-current.ev-red{background:#ff1a0a}.evaluation-rating .ev-current.ev-empty{background:#f3f4f6;color:#6b7280}
      .lpa-required-note{margin-top:8px;padding:8px 10px;border-radius:8px;background:#fff7ed;border:1px solid #fdba74;color:#9a3412;font-size:12px;font-weight:600}
      .lpa-invalid{border:2px solid #dc2626!important;background:#fff1f2!important}
      #auditee[readonly]{background:#f3f4f6;color:#374151;font-weight:700;cursor:not-allowed}
      @media(max-width:700px){.evaluation-rating{overflow:auto}.evaluation-rating table{min-width:760px;font-size:11px}}
      @media print{.evaluation-rating{margin-top:6px;border-radius:0;break-inside:avoid}.evaluation-rating table{font-size:7px;min-width:0}.evaluation-rating th,.evaluation-rating td{padding:3px 4px}.lpa-required-note{display:none!important}}
    `;
    document.head.appendChild(style);
  }

  function calculateEvaluation() {
    const checked = Array.from(document.querySelectorAll('.audit-table input[type="radio"]:checked'));
    let ok=0, observe=0, ng=0;
    checked.forEach(input=>{if(input.value==='ok')ok++;else if(input.value==='observe')observe++;else if(input.value==='ng')ng++;});
    const scored=ok+observe+ng;
    const percent=scored?Math.round(((ok*2+observe)/(scored*2))*1000)/10:null;
    return {ok,observe,ng,scored,percent};
  }

  function updateEvaluation() {
    const box=document.getElementById('lpaEvaluationRating'); if(!box)return;
    const current=box.querySelector('.ev-current'),r=calculateEvaluation(); current.className='ev-current';
    if(r.percent===null){current.classList.add('ev-empty');current.innerHTML='<span>Current Evaluation: ยังไม่มีผลการประเมิน</span>';return;}
    let emoji,rating,cls,action;
    if(r.percent>=90){emoji='😊';rating='Acceptable';cls='ev-green';action='ผลอยู่ในเกณฑ์ยอมรับได้';}
    else if(r.percent>=75){emoji='😐';rating='Acceptable with restrictions';cls='ev-yellow';action='ต้องดำเนินการแก้ไข และทำ LPA ใหม่ภายใน 24 ชั่วโมง';}
    else{emoji='😒';rating='Unacceptable';cls='ev-red';action='ต้องดำเนินการแก้ไข กำหนด Internal Process Audit และแนบรูปหลักฐาน';}
    current.classList.add(cls);current.innerHTML=`<span style="font-size:26px">${emoji}</span><span>Current Evaluation: ${r.percent.toFixed(1)}% — ${rating} | 😊 ${r.ok} &nbsp; 😐 ${r.observe} &nbsp; 😒 ${r.ng}<br>${action}</span>`;
  }

  function installEvaluationRating(){
    const auditTable=document.querySelector('.audit-table'); if(!auditTable||document.getElementById('lpaEvaluationRating'))return;
    addEvaluationStyles(); const box=document.createElement('div'); box.id='lpaEvaluationRating';box.className='evaluation-rating';
    box.innerHTML=`<table><thead><tr><th class="ev-head ev-range">Evaluation rating</th><th class="ev-head ev-emoji">Emoji</th><th class="ev-head">If issues found, corrective actions must be always implemented</th><th class="ev-head" style="width:12%">Total</th></tr></thead><tbody><tr><td class="ev-range">≥ 90%</td><td class="ev-emoji ev-green">😊</td><td class="ev-desc ev-green">Acceptable</td><td class="ev-green"><b>Acceptable</b></td></tr><tr><td class="ev-range">≥ 75% &amp; &lt; 90%</td><td class="ev-emoji ev-yellow">😐</td><td class="ev-desc ev-yellow">Acceptable with restrictions. Photo evidence is optional.</td><td class="ev-yellow"><b>Restricted</b></td></tr><tr><td class="ev-range">&lt; 75%</td><td class="ev-emoji ev-red">😒</td><td class="ev-desc ev-red">Unacceptable. Photo evidence is required before submission.</td><td class="ev-red"><b>Unacceptable</b></td></tr></tbody></table><div class="ev-current ev-empty"><span>Current Evaluation: ยังไม่มีผลการประเมิน</span></div>`;
    const tableWrap=auditTable.closest('.table-wrap');(tableWrap||auditTable).insertAdjacentElement('afterend',box);
    document.addEventListener('change',e=>{if(e.target&&e.target.matches('.audit-table input[type="radio"]'))updateEvaluation();});updateEvaluation();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installEvaluationRating);else installEvaluationRating();
})();

// Force the current audit structure after audit.html has declared its variables.
(function(){
  let tries=0;const timer=setInterval(function(){tries++;try{
    if(typeof sections==='undefined'||typeof renderTable!=='function'){if(tries>200)clearInterval(timer);return;}clearInterval(timer);
    const safety=sections.find(sec=>String(sec.title||'').startsWith('1. Health'));
    if(safety&&Array.isArray(safety.items)){
      const i13=safety.items.findIndex(item=>String(item).startsWith('1.3 '));
      if(i13>=0){const combined13='1.3 มีการปฏิบัติตามกฎด้านความปลอดภัยหรือไม่\n- มีใบอนุญาตขับรถโฟร์กลิฟท์, เรียงกล่องสูงไม่เกินมาตรฐานที่กำหนด\n- มีการใช้เส้นทางเดินตามที่บริษัทกำหนด\n- ทางออก / ทางออกฉุกเฉิน ง่ายต่อการเข้าถึงอุปกรณ์ป้องกันไฟไหม้ (ไม่มีสิ่งกีดขวาง)\n- สารเคมี / สารจำเพาะมีการบ่งชี้ และมีภาชนะรองรับสำหรับสารเคมีเหลว';let removeCount=1;for(let j=i13+1;j<safety.items.length;j++){if(String(safety.items[j]).trim().startsWith('-'))removeCount++;else break;}safety.items.splice(i13,removeCount,combined13);}
    }
    for(let i=sections.length-1;i>=0;i--){if(String(sections[i].title||'').startsWith('10. Specific to work area'))sections.splice(i,1);}
    if(!sessionStorage.getItem('lpaStructureV2Applied')){if(typeof state!=='undefined'&&state){if(state.answers)Object.keys(state.answers).forEach(k=>delete state.answers[k]);if(state.comments)Object.keys(state.comments).forEach(k=>delete state.comments[k]);if(state.custom)Object.keys(state.custom).forEach(k=>delete state.custom[k]);if(state.images)Object.keys(state.images).forEach(k=>delete state.images[k]);}sessionStorage.setItem('lpaStructureV2Applied','1');}
    renderTable();document.querySelectorAll('.qtext').forEach(el=>{el.style.whiteSpace='pre-line';});if(typeof updatePrintMeta==='function')updatePrintMeta();
  }catch(err){console.error('LPA structure update failed:',err);if(tries>200)clearInterval(timer);}},50);
})();

// Submission validation: every answered audit item requires a comment. If total score is below 75%, every scored item (except N/A) also requires photo evidence.
(function(){
  function installValidation(){
    const btn=document.getElementById('submitBtn');if(!btn||btn.dataset.validationInstalled)return;btn.dataset.validationInstalled='1';
    const note=document.createElement('div');note.className='lpa-required-note no-print';note.innerHTML='ข้อกำหนด: <b>ทุกข้อที่ตรวจต้องกรอก Comment</b> • คะแนนรวม <b>&lt; 75%</b> ต้องแนบรูปหลักฐานในทุกข้อที่นำมาคิดคะแนน • คะแนน <b>≥ 75%</b> ไม่บังคับแนบรูป';btn.closest('.submit-footer').insertAdjacentElement('beforebegin',note);
    btn.addEventListener('click',function(e){
      document.querySelectorAll('.comment.lpa-invalid').forEach(el=>el.classList.remove('lpa-invalid'));
      const rows=Array.from(document.querySelectorAll('.audit-table tbody tr[data-qid]')).filter(row=>row.querySelector('input[type="radio"]:checked'));
      const missingComments=[];
      rows.forEach(row=>{const c=row.querySelector('.comment');if(!c||!c.value.trim()){missingComments.push(row);if(c)c.classList.add('lpa-invalid');}});
      if(missingComments.length){e.preventDefault();e.stopImmediatePropagation();alert(`ยังไม่ได้กรอก Comment ${missingComments.length} ข้อ\nกรุณากรอก Comment ทุกข้อก่อนส่งข้อมูล`);missingComments[0].scrollIntoView({behavior:'smooth',block:'center'});missingComments[0].querySelector('.comment')?.focus();return;}
      const checked=rows.map(r=>r.querySelector('input[type="radio"]:checked')).filter(Boolean);let ok=0,observe=0,ng=0;checked.forEach(x=>{if(x.value==='ok')ok++;else if(x.value==='observe')observe++;else if(x.value==='ng')ng++;});const scored=ok+observe+ng;const percent=scored?((ok*2+observe)/(scored*2))*100:0;
      if(scored&&percent<75){const missingImages=rows.filter(row=>{const a=row.querySelector('input[type="radio"]:checked');if(!a||a.value==='na')return false;const id=row.dataset.qid;return !(typeof state!=='undefined'&&state.images&&state.images[id]);});if(missingImages.length){e.preventDefault();e.stopImmediatePropagation();alert(`คะแนนรวม ${percent.toFixed(1)}% ต่ำกว่า 75%\nต้องแนบรูปหลักฐานอีก ${missingImages.length} ข้อก่อนส่งข้อมูล`);missingImages[0].scrollIntoView({behavior:'smooth',block:'center'});return;}}
    },true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installValidation);else installValidation();
})();

// Lock Auditee automatically from selected Line / Area.
(function(){
  const auditeeByArea={
    1:'Pratoomchai',
    2:'Somkid',
    4:'Pratoomchai',
    5:'Somkid',
    6:'Narin',
    7:'Natthawat',
    8:'Pratoomchai',
    9:'Watcharee',
    10:'Teeraporn',
    11:'Ongard',
    12:'Wuttipat'
  };
  function areaNumber(value){const m=String(value||'').match(/^Area\s+(\d+)\b/i);return m?Number(m[1]):null;}
  function syncAuditee(){
    const line=document.getElementById('line'),auditee=document.getElementById('auditee');if(!line||!auditee)return;
    const name=auditeeByArea[areaNumber(line.value)]||'';
    auditee.value=name;
    auditee.readOnly=!!name;
    auditee.title=name?'Auditee ถูกกำหนดอัตโนมัติตาม Area':'ยังไม่ได้กำหนด Auditee สำหรับ Area นี้';
    auditee.dispatchEvent(new Event('change',{bubbles:true}));
  }
  function installAuditeeLock(){
    const line=document.getElementById('line'),auditee=document.getElementById('auditee');if(!line||!auditee)return;
    line.addEventListener('change',syncAuditee);
    setTimeout(syncAuditee,100);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installAuditeeLock);else installAuditeeLock();
})();
