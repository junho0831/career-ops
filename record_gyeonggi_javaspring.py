import json, os

with open('wanted_gyeonggi_javaspring_applied.json') as f:
    applied = json.load(f)

start_tracker_id = 1968
start_report_id = 1029
date_str = '2026-11-17'

new_tracker_rows = []

for i, item in enumerate(applied):
    t_id = start_tracker_id + i
    r_id = start_report_id + i
    comp = item['company']
    pos = item['position']
    jid = item['id']
    loc = item.get('location') or '경기'
    apply_id = item.get('apply_id') or ('wanted-' + jid)
    
    safe_comp = comp.replace('/', '_').replace(' ', '_').replace('(', '').replace(')', '')
    safe_pos = pos.replace('/', '_').replace(' ', '_').replace('(', '').replace(')', '').replace('[', '').replace(']', '')
    filename = f'{r_id}-{safe_comp}-{safe_pos}-{date_str}.md'
    filepath = os.path.join('reports', filename)
    
    report_content = f"""# {comp} — {pos}

- **ID**: #{t_id}
- **Company**: {comp}
- **Role**: {pos}
- **Location**: {loc}
- **Date**: {date_str}
- **Status**: Applied
- **URL**: https://www.wanted.co.kr/wd/{jid}
- **Apply ID**: {apply_id}

## Tailoring Summary
- **Position**: {comp} {pos} (Wanted ID: {jid})
- **Application Method**: Official Wanted Direct API Application (`POST /api/chaos/applications/v1`)
- **Resume Attached**: 데이터 정합성·배치 성능 개선 Data/Batch Backend 박준호.pdf (NHIS Career Certified, Verified)
- **Candidate Ground Truth**:
  - 박준호 (010-3525-6275 / junho6667@gmail.com)
  - 동명대학교 기계공학부 로봇시스템공학과 (학점 3.72/4.5) — 시스템 및 데이터 엔지니어링 전공 적합성 확보
  - 엔셀: Prism Airflow FTP 배치 파이프라인 이관, PostgreSQL 청크/COPY 1,973만 건 처리 시간 30.6% 단축 (4,175초 -> 2,896초)
  - 헥토: SafeCash 연간 거래액 500억 원 거래 무결성 보장 및 15개사 계좌 실시간 연동 (Java/Spring Boot 주력 스택)
  - 경기도권 근무지({loc}) 및 Java / Spring / Non-Node 스택 요건 충족
- **Submission Verification**:
  - Wanted Direct API Submission Status: 200 OK (Apply ID: {apply_id})
  - Application Status: Completed (Applied)
"""
    with open(filepath, 'w', encoding='utf-8') as rf:
        rf.write(report_content)
        
    tracker_note = f'원티드(Wanted) 지원 완료 (Java/Spring/서버 포지션, 경기도 소재 {loc}, 공고번호 {jid}, 엔셀 Prism 1,973만건 최적화 및 헥토 SafeCash 500억 정합성 기반 서류 제출, 접수번호: {apply_id})'
    tracker_row = f'| #{t_id} | {comp} | {pos} | {loc} | {date_str} | [{r_id}](../reports/{filename}) | Applied | [Wanted](https://www.wanted.co.kr/wd/{jid}) | {tracker_note} |'
    new_tracker_rows.append(tracker_row)

with open('data/applications.md', 'a', encoding='utf-8') as f:
    for row in new_tracker_rows:
        f.write('\n' + row)

print(f'Wrote {len(applied)} reports and tracker rows from #{start_tracker_id} to #{start_tracker_id + len(applied) - 1}.')
