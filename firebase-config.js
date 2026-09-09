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

// LPA Evaluation Rating: keep the rating criteria aligned with the audit emojis.
// 😊 OK = 100%, 😐 Observation/Corrected = 50%, 😒 NG/Unsatisfactory = 0%.
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
      .evaluation-rating .ev-green{background:#8df34d}
      .evaluation-rating .ev-yellow{background:#fff600}
      .evaluation-rating .ev-red{background:#ff1a0a;color:#000}
      .evaluation-rating .ev-current{padding:10px 12px;display:flex;align-items:center;justify-content:center;gap:10px;font-weight:700;border-top:1px solid #8b6b6b}
      .evaluation-rating .ev-current .ev-current-emoji{font-size:26px}
      .evaluation-rating .ev-current.ev-green{background:#8df34d}
      .evaluation-rating .ev-current.ev-yellow{background:#fff600}
      .evaluation-rating .ev-current.ev-red{background:#ff1a0a}
      .evaluation-rating .ev-current.ev-empty{background:#f3f4f6;color:#6b7280}
      @media(max-width:700px){
        .evaluation-rating{overflow:auto}
        .evaluation-rating table{min-width:760px;font-size:11px}
        .evaluation-rating th,.evaluation-rating td{padding:7px 6px}
      }
      @media print{
        .evaluation-rating{margin-top:6px;border-radius:0;break-inside:avoid;page-break-inside:avoid}
        .evaluation-rating table{font-size:7px;min-width:0}
        .evaluation-rating th,.evaluation-rating td{padding:3px 4px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
        .evaluation-rating .ev-green{background:#8df34d!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}
        .evaluation-rating .ev-yellow{background:#fff600!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}
        .evaluation-rating .ev-red{background:#ff1a0a!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}
        .evaluation-rating .ev-head{background:#e8b8b4!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}
        .evaluation-rating .ev-current{padding:4px;font-size:7px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
        .evaluation-rating .ev-current .ev-current-emoji{font-size:14px}
      }
    `;
    document.head.appendChild(style);
  }

  function calculateEvaluation() {
    const checked = Array.from(document.querySelectorAll('.audit-table input[type="radio"]:checked'));
    let ok = 0, observe = 0, ng = 0;
    checked.forEach(input => {
      if (input.value === 'ok') ok++;
      else if (input.value === 'observe') observe++;
      else if (input.value === 'ng') ng++;
    });
    const scored = ok + observe + ng;
    const percent = scored ? Math.round(((ok * 2 + observe) / (scored * 2)) * 1000) / 10 : null;
    return { ok, observe, ng, scored, percent };
  }

  function updateEvaluation() {
    const box = document.getElementById('lpaEvaluationRating');
    if (!box) return;
    const current = box.querySelector('.ev-current');
    const result = calculateEvaluation();

    current.className = 'ev-current';
    if (result.percent === null) {
      current.classList.add('ev-empty');
      current.innerHTML = '<span class="ev-current-emoji">—</span><span>Current Evaluation: ยังไม่มีผลการประเมิน</span>';
      return;
    }

    let emoji, rating, cls, action;
    if (result.percent >= 90) {
      emoji = '😊';
      rating = 'Acceptable';
      cls = 'ev-green';
      action = 'ผลอยู่ในเกณฑ์ยอมรับได้';
    } else if (result.percent >= 75) {
      emoji = '😐';
      rating = 'Acceptable with restrictions';
      cls = 'ev-yellow';
      action = 'ต้องดำเนินการแก้ไข และทำ LPA ใหม่เพื่อตรวจสอบการดำเนินการภายใน 24 ชั่วโมง';
    } else {
      emoji = '😒';
      rating = 'Unacceptable';
      cls = 'ev-red';
      action = 'ต้องดำเนินการแก้ไข และกำหนด Internal Process Audit';
    }

    current.classList.add(cls);
    current.innerHTML = `<span class="ev-current-emoji">${emoji}</span><span>Current Evaluation: ${result.percent.toFixed(1)}% — ${rating} | 😊 ${result.ok} &nbsp; 😐 ${result.observe} &nbsp; 😒 ${result.ng}<br>${action}</span>`;
  }

  function installEvaluationRating() {
    const auditTable = document.querySelector('.audit-table');
    if (!auditTable || document.getElementById('lpaEvaluationRating')) return;

    addEvaluationStyles();
    const box = document.createElement('div');
    box.id = 'lpaEvaluationRating';
    box.className = 'evaluation-rating';
    box.innerHTML = `
      <table aria-label="LPA Evaluation Rating">
        <thead>
          <tr>
            <th class="ev-head ev-range">Evaluation rating</th>
            <th class="ev-head ev-emoji">Emoji</th>
            <th class="ev-head">If issues found, corrective actions must be always implemented</th>
            <th class="ev-head" style="width:12%">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="ev-range">≥ 90%</td>
            <td class="ev-emoji ev-green">😊</td>
            <td class="ev-desc ev-green">Acceptable — less than 4 “unsatisfactory”, or less than 7 “corrected”, or any equivalent combination.</td>
            <td class="ev-green"><b>Acceptable</b></td>
          </tr>
          <tr>
            <td class="ev-range">≥ 75% &amp; &lt; 90%</td>
            <td class="ev-emoji ev-yellow">😐</td>
            <td class="ev-desc ev-yellow">Acceptable with restrictions. New LPA should be performed to verify the actions implementation in maximum 24 hours. This new LPA should be considered as Unacceptable if it is rated again as Yellow.</td>
            <td class="ev-yellow"><b>Restricted</b></td>
          </tr>
          <tr>
            <td class="ev-range">&lt; 75%</td>
            <td class="ev-emoji ev-red">😒</td>
            <td class="ev-desc ev-red">Unacceptable — over 8 “unsatisfactory”, or equivalent combination. Internal process audit must be scheduled and performed.</td>
            <td class="ev-red"><b>Unacceptable</b></td>
          </tr>
        </tbody>
      </table>
      <div class="ev-current ev-empty"><span class="ev-current-emoji">—</span><span>Current Evaluation: ยังไม่มีผลการประเมิน</span></div>
    `;

    const tableWrap = auditTable.closest('.table-wrap');
    if (tableWrap) tableWrap.insertAdjacentElement('afterend', box);
    else auditTable.insertAdjacentElement('afterend', box);

    document.addEventListener('change', function (event) {
      if (event.target && event.target.matches('.audit-table input[type="radio"]')) updateEvaluation();
    });

    updateEvaluation();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installEvaluationRating);
  } else {
    installEvaluationRating();
  }
})();
