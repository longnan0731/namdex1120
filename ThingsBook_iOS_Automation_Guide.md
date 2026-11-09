# ThingsBook iOS APP Automation Workshop Guide
> **Apple 스타일로 풀어낸 실기기 iOS 테스트 자동화 및 AITA 플랫폼 구축기**
> 작성자: Service_TE 장용남 | 2026. 11. 20 워크샵 세션

---

##  개요: 왜 이 자동화가 필요한가?

- **어떤 앱인가?**: `ThingsBook`은 네이버 사내/외 유저들이 책, 영화(OTT), 웹툰, 음악(Spotify), 체크인 등 다양한 문화 콘텐츠를 기록하고 리뷰하는 iOS 서비스 앱입니다.
- **당면했던 과제**: 67개 스위트, 284개에 달하는 방대한 리그레션 테스트 케이스(TC). 수동으로 테스트하면 1회 완주에 꼬박 8시간 이상(1인 QA 기준 하루 종일) 소요되며, 반복 테스트 시 휴먼 에러가 발생하기 쉽습니다.
- **해결 방식**: 실제 물리 아이폰(Real iPhone 12) + Mac 환경에서 `maestro-runner`와 `Java TestNG`, 그리고 자체 설계한 `AITA(AI Test Automation Platform)`를 연동하여 **버튼 한 번으로 240개 테스트를 100% 자동 완주하고 TestRail에 실시간 기록**하는 무결점 파이프라인을 직접 구축했습니다.

---

## 📱 9대 카테고리 구성 (Workshop Presentation Structure)

---

### [Category 01] 실기기 세팅 (Real Device Setup)
> *"시뮬레이터가 아닌, 사용자의 손에 쥐어지는 실제 iPhone 위에서 검증합니다."*

#### 1. 하드웨어 세팅 (MacBook + Real iPhone)
- **MacBook Pro**: 테스트 실행 제어 및 빌드 머신 (macOS Sequoia / Ventura)
- **Real iPhone 12 (사내 단말 NST-099)**:
  - iOS 17.6.1 실기기 환경
  - 논리 해상도: `390 × 844 pt` (@3x, 1170 × 2532 px)
  - **실기기 필수 사유**: 인앱 웹뷰(IMDb, Spotify, 네이버 웹툰), Google SSO 인증 팝업, 실제 손가락 스크롤 관성 및 하드웨어 렌더링 검증.

#### 2. 필수 소프트웨어 도구 (Mac & iPhone)
- **Xcode & WDA (WebDriverAgent)**:
  - Apple의 공식 XCUITest 프레임워크를 기반으로 iPhone 내부에 상주하며 실제 터치·입력·스와이프를 대행하는 에이전트.
  - 무료/개발자 계정 코드 서명(Signing) 및 프로비저닝 프로파일 필수.
- **maestro-runner (v1.1.28+)**:
  - 간결하고 빠른 선언형 YAML 스크립트를 파싱하여 실기기로 고속 전송하는 경량 실행 엔진.
- **Appium 2.x & XCUITest Driver**:
  - 실기기 화면의 UI 계층 트리(XML/JSON) 및 요소를 정밀 덤프하는 인스펙터 도구.
- **Java 17 + Maven + TestNG**:
  - 67개 스위트의 실행 순서, 멀티 스레드 제어, 어설션, TestRail API 결과 리포팅을 총괄하는 오케스트레이터.

#### 3. iPhone 단말 사전 설정 (최초 1회)
1. **개발자 모드 활성화**: `설정 > 개인정보 보호 및 보안 > 개발자 모드 ON` 후 재부팅.
2. **UI 자동화 활성화**: `설정 > 개발자 > Enable UI Automation ON`.
3. **인증서 신뢰 승인**: `설정 > 일반 > VPN 및 기기 관리`에서 설치된 WDA 인증서 '신뢰' 승인.
4. **환경변수 분리 (`.env`)**: 코드 수정 없이 UDID(`00008101-001519280881401E`), Team ID(`DVW5Z92VGU`), Bundle ID를 외부 주입.

> **📷 스크린샷 배치 공간 (Placeholder)**:
> - `[Mac] Xcode WDA 서명 화면 및 터미널 env 설정 스크린샷`
> - `[iPhone] 설정 > 개발자 모드 및 기기 관리 인증서 승인 화면 스크린샷`

---

### [Category 02] 요소 탐색 (UI Element Discovery)
> *"사람의 눈으로 보듯, 코드가 버튼과 텍스트를 정확하게 찾아내는 원리"*

#### 1. 앱 요소는 어떻게 인식되는가?
- iOS 앱의 모든 화면은 Apple의 `Accessibility(접근성)` 계층 트리로 구성되어 있습니다.
- 텍스트, 버튼, 이미지, 텍스트 필드 등은 고유한 `accessibilityIdentifier`, `label`, `value`, 그리고 화면상의 물리적 좌표(`Bounds: x, y, width, height`)를 가집니다.

#### 2. Appium Inspector를 활용한 요소 추출 기법
- **Appium Inspector 연동**:
  - iPhone과 Mac을 USB로 연결한 상태에서 Appium Server(포트 4723) 구동.
  - 실시간 스크린 캡처와 함께 우측에 완전한 XML 계층 트리(UI Hierarchy) 노출.
- **주요 탐색 속성 4가지**:
  1. `Accessibility ID`: 개발자가 부여한 가장 안정적인 고유 식별자 (`tabPlus`, `tabMyHomeNormal`)
  2. `Text / Label`: 화면에 노출되는 문자열 (`"OTT 검색"`, `"Add"`, `"저장"`)
  3. `XPath`: 계층 경로 탐색 (복합 구조 및 리스트 항목 탐색 시 보조 활용)
  4. `Bounds / Center Point`: 핀포인트 터치를 위한 화면 좌표 (`195, 422`)

#### 3. The Shawshank Redemption (글감 End 화면) 실전 요소 탐색
- 핀(Pin) 인터랙션을 통해 화면 내 7대 핵심 요소(제목, 백버튼, 북마크, 공유, 바텀시트, 탭바 등)를 클릭하면 해당 요소의 정확한 Accessibility ID와 Selector 문법을 즉시 확인할 수 있습니다.

> **📷 스크린샷 배치 공간 (Placeholder)**:
> - `[Appium Inspector] ThingsBook 화면 캡처 + XML 계층 트리 + 요소 Attribute 상세 패널 스크린샷`
> - `[Inspector 요소 클릭] 'Add' 버튼 또는 'tabPlus' 선택 시 하이라이트된 스크린샷`

---

### [Category 03] 수동 코딩 (Manual YAML Coding)
> *"좌측에는 직관적인 YAML 코드, 우측에는 실제 아이폰의 살아있는 화면"*

#### 1. 선언형 Maestro YAML의 직관성
- 복잡한 Java 코드 수십 줄 대신, 사람이 읽기 쉬운 선언형 YAML로 작성:
```yaml
# C12253244 - OTT 검색 동작 확인
- launchApp:
    appId: "com.navercorp.article.ios"
- runFlow: subflows/login_if_needed.yaml
- tapOn: "tabPlus"
- scrollUntilVisible:
    element: "NamAuto_Movie"
    direction: DOWN
- tapOn: "NamAuto_Movie"
- assertVisible: "OTT 검색"
```

#### 2. 좌/우 분할 매핑 구조 (Code & Screen Sync)
- **좌측 (Code Panel)**:
  - 실제 구동되는 Maestro YAML 테스트 스크립트.
  - 액션 흐름별 주석 및 단계별 설명.
- **우측 (Phone Mockup Screen)**:
  - 해당 YAML 스텝이 실제 아이폰에서 실행되었을 때 나타나는 실제 앱 뷰 스크린샷.
  - 탭 이벤트 시 터치 피드백 애니메이션 및 화면 전환 상태 매핑.

> **📷 스크린샷 배치 공간 (Placeholder)**:
> - `[iPhone Screen] tabPlus 탭 후 에디터 글감 선택 화면 스크린샷`
> - `[iPhone Screen] OTT 검색창에 키워드 입력 및 결과 리스트 노출 스크린샷`

---

### [Category 04] AITA & AI (AI Test Automation Platform)
> *"자연어로 쓴 테스트 케이스를 AI가 이해하고 무결점 코드로 변환하기까지의 노력"*

#### 1. AITA란 무엇인가? (ADR-0001, ADR-0005)
- **AITA (AI Test Automation Platform)**는 단순한 코드 자동 완성기가 아닙니다.
- **비전**: QA는 *"무엇을 테스트할지(What to test)"*를 자연어로 정의하고, AI는 *"어떻게 자동화할지(How to automate)"*를 구현하며, Runtime은 *"결과를 검증(Execution)"*하는 완전한 엔터프라이즈 자동화 파이프라인입니다.
```
TestRail TC (자연어)
       ↓
Intent Layer (의도 파싱)
       ↓
Semantic Matching (UI 요소 매칭)
       ↓
YAML Generation (AI 코드 생성)
       ↓
Maestro Runtime (iPhone 실행)
       ↓
TestNG Result → TestRail Update
```

#### 2. AI가 나의 자연어를 알아듣도록 내가 기울인 핵심 노력과 조절
AI에게 무작정 "OTT 검색 테스트해줘"라고 하면 앱의 구조를 몰라 100% 실패합니다. AI가 실제 동작하는 코드를 생성할 수 있도록 다음 4가지 핵심 장치를 직접 설계하고 주입했습니다:

1. **Capture Layer (실제 화면 정보 추출)**:
   - WDA Direct Dump 및 Appium Inspector로 실제 ThingsBook 화면의 모든 버튼, 텍스트, 좌표를 JSON/MD(`appium_live_elements.json`)로 추출하여 AI에게 컨텍스트로 제공.
2. **Semantic Layer (의미 기반 사전 구축)**:
   - "글감 작성 진입" ➔ `tabPlus`
   - "마이 홈 탭" ➔ `tabMyHomeNormal`
   - 자연어 비즈니스 용어와 실제 iOS Accessibility ID를 1:1로 매핑하는 `THINGSBOOK_UI_ELEMENT_MAP` 구축.
3. **Intent Layer (의도와 런타임 분리 - Principle 1)**:
   - QA의 TC에서 `AUTH_STATE(로그인 여부)`, `ACTION(터치/스크롤)`, `EXPECTED(검증)`만을 순수하게 분리 추출.
4. **엄격한 도메인 방어 규칙 주입 (Prompt Tuning & Rules)**:
   - **바텀시트 터치 규칙 (`thingsbook_bottom_sheet_rules.md`)**:
     - 글감 End 화면은 상단(y: 0~12%)이 투명하게 뚫린 바텀시트 모달임. 상단을 터치하면 닫히므로, 반드시 y: 12% 이상 내부 영역만 터치하도록 AI 제약.
   - **Maestro Runner 1.1.28 드라이버 규칙 (`maestro_runner_v1_1_28_rules.md`)**:
     - `tapOn: id: "plus"` 대신 `tapOn: "plus"` 표준 문법 사용, iOS 키보드 닫힘 대기, 스크롤 방향 및 타임아웃 지정.

#### 3. AITA 핵심 아키텍처 원칙 (ADR-0001 ~ 0005)
- **Principle 1 (AI와 Runtime 분리)**: AI는 오직 YAML 생성까지만 담당하며, 디바이스를 직접 제어하거나 실행하지 않는다.
- **Principle 2 (YAML은 공통 자산)**: Dev 검증과 운영 Regression 모두 동일한 YAML을 공유한다.
- **Principle 3 (개발과 운영 분리)**: 신규 코드는 `Dev_Regression`에서 실기기 검증 후 승인된 것만 `Regression`으로 승격한다.
- **Principle 4 (Runtime은 TestRail을 모른다)**: 실행 엔진은 오직 Pass/Fail만 반환하고, TestRail API 동기화는 상위 리스너 레이어에서 처리한다.

---

### [Category 05] 확인 (Verification / Single Check)
> *"일괄 실행 전, 단 한 개의 YAML이 한 치의 오차 없이 도는지 확인하는 검증 단계"*
> *(기존 '배치 실행'에서 분리하여 '단건 동작 검증'으로 명칭 및 역할 개편)*

#### 1. 단건 검증의 목적
- 전체 67개 스위트를 일괄 실행하기 전, 새로 작성하거나 수정한 단일 YAML 스크립트가 실제 기기에서 예상대로 동작하는지 즉각 확인하는 스모크 체크 단계.

#### 2. 검증 프로세스
1. **CLI 단건 실행**:
   ```bash
   maestro-runner test Maestro_Thingsbook_iOS_APP_yaml/Test_03/iOS_Suite_006_OTT.yaml
   ```
2. **동작 검증 항목**:
   - `Exit Code 0 (Success)` 확인
   - 요소 탭 및 텍스트 어설션 통과 여부 확인
   - 애니메이션 및 화면 전환 타임아웃 적정성 검증
3. **테스트 코드 검사**:
   - 누락된 `#CXXXXX` TestRail Case ID 마커가 없는지 검사
   - `subflows/login_if_needed.yaml` 전제 조건 호출 상태 점검

---

### [Category 06] 배치 실행 (Batch Execution & Pipeline Design)
> *"내가 직접 설계하고 구현한 YAML + Java TestNG + TestRail 연동 풀 파이프라인"*
> *(가장 중점적인 나의 설계 및 구현 프로세스)*

#### 1. 전체 파이프라인 흐름도 (End-to-End Workflow)
```
[Step 0. 사전 준비]
TestRail (67 Suite / 240 TC)
       ↓ CreateTemplate.java
Java TC 스켈레톤 생성 + generate_default_yamls.py
       ↓ #CXXXXX ID 매핑된 YAML 파일 생성
       ↓ 테스트 액션 코드 작성

[Step 1. Dev_Regression 검증]
Dev_Regression Suite 실행
       ↓ (단일/모듈 단위 실기기 스모크 테스트)
YAML + Java TestNG 정상 구동 검증 (PASS)

[Step 2. Real_Regression_ALL 실행]
전체 67개 Suite 일괄 배치 구동
       ↓ ThingsbookRegressionSetup (Listeners)
       ↓ MaestroRuntimeTestNgListener → maestro-runner → iPhone WDA
       ↓ ThingsbookTestRailListener (실시간 API 동기화)
TestRail Run #1204에 240 Pass 100% 자동 기록 완료!
```

#### 2. 단계별 상세 설계 설명
- **Step 0. 테스트 동작 코드 YAML 준비**:
  - `CreatTemplate.java`를 실행하여 TestRail API로부터 최신 테스트 케이스 목록을 일괄 다운로드.
  - TestRail Case ID(`C12253244` 등)가 주석 및 메서드명으로 선언된 Java 파일 및 YAML 기본 템플릿 자동 생성.
  - 해당 YAML 파일에 실제 테스트 동작 커맨드(`launchApp`, `tapOn`, `assertVisible` 등) 작성.
- **Step 1. Dev_Regression 사전 스모크 검증**:
  - 운영 반영 전 개발용 스위트(`Dev_Regression`)에서 yaml + java testng가 충돌 없이 실기기에서 잘 동작하는지 사전 확인.
  - 문제 발생 시 운영 TestRail에 영향을 주지 않고 로컬에서 즉시 디버깅.
- **Step 2. Real_Regression_ALL (전체 67개 Suite 일괄 실행 + TestRail 연동)**:
  - `ThingsbookRegressionSetup`을 `extends`한 전체 운영 스위트 구동.
  - `MaestroRuntimeTestNgListener`가 메서드의 `@TestRailCase("C12253244")`를 읽어 해당 YAML을 실기기에서 실행하고 반환 코드 캡처.
  - `ThingsbookTestRailListener`가 결과를 가로채어 TestRail API로 실시간 전송 (Pass/Fail, 소요 시간, 실행 로그).

---

### [Category 07] 실행 결과 (Execution Results)
> *"광고나 과장 없는, 100% 실제 데이터로 증명하는 실행 지표"*

#### 1. 핵심 실행 지표 (Run #1204 실측 데이터)
- **전체 실행 Suite**: **67개 Suite 완주 (100%)**
- **총 테스트 케이스**: **240개 테스트 케이스**
- **최종 결과**: **240 Passed / 0 Failed (Pass Rate 100%)**
- **소요 시간**: **약 2시간 12분** (사람이 수동 진행 시 8시간 이상 분량)
- **TestRail 동기화율**: **100% 자동 기록 완료** (누락 0건)

#### 2. 실제 리포트 및 로그 화면
- TestRail 웹 콘솔 화면에서 240개 케이스가 모두 녹색(`Passed_Auto`)으로 표시된 실제 상태.
- 각 케이스 상세 화면에 Maestro Flow 스텝 로그(`✓ launchApp`, `✓ tapOn`, `✓ assertVisible`) 및 디바이스 UDID가 완전하게 보존됨.

---

### [Category 08] 도입 전후 비교 (Before vs After)
> *"수동으로 반복하던 피로를, 단 한 번의 클릭으로 끝내는 혁신"*

| 비교 항목 | 수동 테스트 (Before) | 자동화 파이프라인 (After) | 개선 효과 |
| :--- | :--- | :--- | :--- |
| **소요 시간** | 1회 풀 리그레션 기준 **8시간+** (하루 종일) | 전체 67개 스위트 **약 2시간** (무인 실행) | **소요 시간 75% 단축** |
| **테스트 시점** | 업무 시간 중에만 수동 테스트 가능 | 퇴근 전 클릭 / 야간 배치 구동 가능 | **업무 시간 구애 없음** |
| **결과 기록** | 시트나 TestRail에 수기로 일일이 체크 (1시간 소요) | 테스트 완료 즉시 API로 100% 자동 기록 | **기록 공수 0분 (실시간)** |
| **일관성 및 신뢰도** | 테스터 컨디션에 따른 누락 및 판단 오차 발생 | 스크립트에 정의된 조건 그대로 무결점 검증 | **휴먼 에러 0% 달성** |
| **QA 리소스 활용** | 단순 반복 리그레션에 리소스 고갈 | 신규 기능 탐색적 테스팅 및 기획 검토에 집중 | **고부가가치 QA로 전환** |

---

### [Category 09] 총결 및 로드맵 (Summary & Roadmap)
> *"견고한 1인 QA 자동화의 완성, 그리고 크로스 플랫폼으로의 확장"*

#### 1. 이번 프로젝트의 의의와 결론
- 한 명의 QA가 240개에 달하는 방대한 iOS 앱 리그레션을 단독으로 완전 자동화하고, TestRail 결과 연동까지 원스톱으로 마침표를 찍었습니다.
- AI(AITA)와 정밀한 룰(BottomSheet/Driver Rules), 그리고 견고한 Java TestNG 런타임을 결합하여 안정적인 운영 자산을 확보했습니다.

#### 2. 향후 추가할 ADR 및 확장 로드맵
- **ADR-0006**: Appium 2 + External WDA 고도화
- **ADR-0007**: Maestro YAML 표준 작성 규칙 공식화
- **ADR-0008**: AI TC → YAML Prompt Engineering 표준화
- **ADR-0009**: TestNG Suite 멀티 디바이스 병렬 실행 설계
- **ADR-0010**: TestRail 양방향 실시간 동기화 아키텍처
- **ADR-0011**: **AITA Self Validation** (AI가 생성한 YAML의 문법과 실기기 동작을 사전 자동 검증하는 구조)
- **플랫폼 확장**: Android 앱 및 Web 크로스 플랫폼 자동화로 확장 적용.

---
