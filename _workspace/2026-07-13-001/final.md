# 이력서 컨펌 결과

## Verdict

현재 `cv.md`는 그대로 제출 가능한 수준입니다. AI 문체 위험도는 low이고, 이력서 장르에도 맞습니다. 다만 첫 소개 문단과 Prism/VoiceLink 일부 bullet은 정보 밀도와 반복어가 높아 사람이 읽을 때 약간 기계적으로 보일 수 있습니다.

## 우선 수정 권장

1. `AI를 구현·디버깅 보조 도구로 활용`은 오독 위험이 있습니다.
   - 현재 표현은 AI 자체를 구현했다는 뜻으로 읽힐 수 있습니다.
   - 권장: `AI 도구를 구현·디버깅·문서화 보조 수단으로 활용`

2. 첫 문단은 너무 많은 키워드가 한 문장에 몰려 있습니다.
   - 인증, 검색, Redis, RDB, CI/CD, Airflow, ER Dose, VoiceLink가 한 번에 나와 스캔성이 떨어집니다.
   - 2~3문장으로 나누는 편이 낫습니다.

3. `기반`, `구현`, `운영`, `관리` 반복이 많습니다.
   - `기반` 18회, `구현` 12회, `운영` 16회, `관리` 12회.
   - 기술 이력서라 허용 범위지만, 핵심 문단에서는 `설계`, `분리`, `전환`, `표준화`, `자동화`, `정리`처럼 동사를 분산하는 게 자연스럽습니다.

4. `완전히 이관`, `극대화`, `크게 높였습니다`, `원천 차단`은 약간 과장된 인상을 줄 수 있습니다.
   - 실제 성과가 맞더라도 이력서에서는 구체 동작이나 지표 중심 표현이 더 신뢰도를 줍니다.

## 바로 쓸 수 있는 교체안

### 첫 소개 문단

Java/Spring Boot 기반 백엔드에서 인증, 검색, 운영 API, Redis 상태 관리, RDB 정합성, CI/CD, 데이터 처리 자동화를 맡아왔습니다. 실무에서는 Elasticsearch 장애 시 DB fallback 검색, Refresh Token Redis TTL 관리, 공통 예외·검증 정책, Airflow 기반 FTP 데이터 처리 자동화, ER Dose RAW/EUV 로그 파싱 배치 분리, 배치 재처리, 관리자 API를 구현했습니다. 개인 서비스 VoiceLink에서는 AI 도구를 구현·디버깅·문서화 보조 수단으로 활용해 1인 개발 범위를 넓혔고, Redis Lua Script, DB Outbox, `FOR UPDATE SKIP LOCKED`, `PESSIMISTIC_WRITE` 기반 실시간 매칭과 세션 정합성 설계부터 배포·운영까지 직접 맡았습니다.

### Summary 5번째 bullet

- AI 도구를 구현·디버깅·문서화 보조 수단으로 활용해 1인 서비스를 개발·운영한 경험

### VoiceLink 첫 bullet

- AI 도구를 구현·디버깅·문서화·실험 보조 수단으로 활용해 실시간 음성 매칭 서비스를 1인으로 설계·개발·배포·운영

## 품질 등급

A-

## 자체검증

- 사실, 숫자, 날짜, 고유명사 보존: 통과
- 장르 보존: 통과
- register 보존: 통과
- S1 잔존: 치명적 패턴 없음
- 잔여 리스크: 반복어와 첫 문단 과밀도
- metrics: risk_band low, risk_score 3

<!-- HUMANIZE-SUMMARY v2.0.0
original_length=5440
rewritten_length=review_only
change_rate=not_applied_to_source
metrics_risk_band=low
high_signal_z_scores=ending_comma_rate:4.2467
category_counts_before=A:0,B:0,C:0,D:1,E:1,F:1,G:0,H:0,I:0,J:0
category_counts_after=not_applied_to_source
self_check=6/6
quality_grade=A-
highlights=AI phrasing ambiguity flagged; intro density flagged; repeated backend nouns flagged; hype wording softened recommendations provided
residual_findings=source file not edited
-->
