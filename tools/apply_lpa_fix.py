from pathlib import Path

p = Path('audit.html')
s = p.read_text(encoding='utf-8')

old = """  '1.3 มีการปฏิบัติตามกฎด้านความปลอดภัยหรือไม่',
  '- มีใบอนุญาตขับรถโฟร์กลิฟท์, เรียงกล่องสูงไม่เกินมาตรฐานที่กำหนด',
  '- มีการใช้เส้นทางเดินตามที่บริษัทกำหนด',
  '- ทางออก / ทางออกฉุกเฉินง่ายต่อการเข้าถึงอุปกรณ์ป้องกันไฟไหม้ (ไม่มีสิ่งกีดขวาง)',
  '- สารเคมี/สารจำเพาะมีการบ่งชี้ความปลอดภัยและมีภาชนะรองรับสำหรับสารเคมีเหลว',"""
new = """  `1.3 มีการปฏิบัติตามกฎด้านความปลอดภัยหรือไม่
- มีใบอนุญาตขับรถโฟร์กลิฟท์, เรียงกล่องสูงไม่เกินมาตรฐานที่กำหนด
- มีการใช้เส้นทางเดินตามที่บริษัทกำหนด
- ทางออก / ทางออกฉุกเฉินง่ายต่อการเข้าถึงอุปกรณ์ป้องกันไฟไหม้ (ไม่มีสิ่งกีดขวาง)
- สารเคมี/สารจำเพาะมีการบ่งชี้ความปลอดภัยและมีภาชนะรองรับสำหรับสารเคมีเหลว`,"""
if old in s:
    s = s.replace(old, new, 1)

s = s.replace('.qtext{line-height:1.55;min-height:34px;white-space:normal;', '.qtext{line-height:1.55;min-height:34px;white-space:pre-line;', 1)

css = """
    .evaluation-rating{margin-top:14px;border:1px solid #333;background:#fff;overflow:hidden}.evaluation-title{text-align:center;font-weight:700;font-size:15px;padding:6px;border-bottom:1px solid #333}.evaluation-grid{display:grid;grid-template-columns:105px 1fr 70px}.evaluation-cell{border-right:1px solid #333;border-bottom:1px solid #333;padding:7px 9px;font-size:11px;line-height:1.45}.evaluation-cell:nth-child(3n){border-right:0}.evaluation-grid .evaluation-cell:nth-last-child(-n+3){border-bottom:0}.evaluation-score{display:flex;align-items:center;justify-content:center;text-align:center;font-weight:700;font-size:16px}.evaluation-total{display:flex;align-items:center;justify-content:center;text-align:center;font-weight:700}.evaluation-green{background:#00b050;color:#000}.evaluation-yellow{background:#ffff00;color:#000}.evaluation-red{background:#ff0000;color:#000}.evaluation-cell b{font-size:12px}.evaluation-cell ul{margin:3px 0 0 16px;padding:0}.evaluation-cell li{margin:1px 0}@media(max-width:700px){.evaluation-grid{grid-template-columns:82px 1fr 54px}.evaluation-cell{font-size:9px;padding:6px}.evaluation-score{font-size:13px}}@media print{.evaluation-rating{break-inside:avoid;margin-top:6px}.evaluation-title{font-size:9px;padding:3px}.evaluation-cell{font-size:6.5px;padding:3px}.evaluation-score{font-size:9px}.evaluation-green,.evaluation-yellow,.evaluation-red{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
"""
if '.evaluation-rating{' not in s:
    s = s.replace('  </style>', css + '  </style>', 1)

block = """
      <section class="evaluation-rating" id="evaluationRating">
        <div class="evaluation-title">Evaluation rating</div>
        <div class="evaluation-grid">
          <div class="evaluation-cell evaluation-score evaluation-green">&ge;90%</div>
          <div class="evaluation-cell"><b>Acceptable</b><ul><li>Unsatisfactory &lt; 4 items</li><li>Corrected &lt; 7 items</li><li>Or equivalent cases</li></ul></div>
          <div class="evaluation-cell evaluation-total">Total</div>
          <div class="evaluation-cell evaluation-score evaluation-yellow">&ge;75% &amp; &lt;90%</div>
          <div class="evaluation-cell"><b>Acceptable with restrictions</b><ul><li>New LPA is required to verify corrective actions within a maximum of 24 hours.</li><li>If the re-evaluation result remains Yellow, classify the result as Unacceptable.</li></ul></div>
          <div class="evaluation-cell evaluation-total">Total</div>
          <div class="evaluation-cell evaluation-score evaluation-red">&lt;75%</div>
          <div class="evaluation-cell"><b>Unacceptable</b><ul><li>If Unsatisfactory &gt; 8 items or equivalent, define and perform an Internal Process Audit.</li></ul></div>
          <div class="evaluation-cell evaluation-total">Total</div>
        </div>
      </section>
"""
if 'id="evaluationRating"' not in s:
    marker = '      <div class="hint no-print">'
    if marker not in s:
        raise SystemExit('insertion marker not found')
    s = s.replace(marker, block + marker, 1)

p.write_text(s, encoding='utf-8')
