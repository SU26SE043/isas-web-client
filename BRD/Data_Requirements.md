# 12_Data_Requirements.md
## 1. Document Purpose
This document defines the business data architecture, logical data domains, and governance requirements for the AI-powered Interview & Skill Assessment System (ISAS).
### 1.1 Scope
The scope includes all logical business data entities, relationships, master data, reference data, and data lifecycles. It defines *what* data is managed, not *how* it is stored (e.g., no SQL schemas or ERDs).
### 1.2 Intended Audience
Data Architects, Enterprise Architects, Business Analysts, Data Governance Officers, and Executive Stakeholders.
### 1.3 Relationship with Other Documents
- **Relationship with BRD:** Realizes business goals through structured data assets.
- **Relationship with Functional Requirements:** Defines the logical entities manipulated by system functions.
- **Relationship with Business Rules:** Captures data validation, integrity, and lifecycle constraints.

## 2. Data Architecture Overview
The ISAS data architecture is organized into 12 distinct logical domains to ensure modularity, clear ownership, and strict governance. These domains collectively cover the end-to-end recruitment, interview, assessment, and learning lifecycle. Master Data Management (MDM) principles are applied across all shared entities.

## 3. Business Data Domains
### 3.1 Identity Data
- **Domain ID:** DOM-01
- **Description:** Manages authentication, authorization, and security profiles.
- **Business Owner:** CISO
- **Primary Users:** System, Admin
- **Business Value:** Secures system access
- **Dependencies:** None
- **Priority:** Critical

### 3.2 Candidate Data
- **Domain ID:** DOM-02
- **Description:** Manages candidate profiles, skills, and career histories.
- **Business Owner:** VP of HR
- **Primary Users:** Recruiters, Candidates
- **Business Value:** Core talent profiling
- **Dependencies:** DOM-01
- **Priority:** High

### 3.3 Employer Data
- **Domain ID:** DOM-03
- **Description:** Manages enterprise clients, teams, and subscriptions.
- **Business Owner:** VP of Sales
- **Primary Users:** Employers
- **Business Value:** Client lifecycle management
- **Dependencies:** DOM-01
- **Priority:** High

### 3.4 Recruitment Data
- **Domain ID:** DOM-04
- **Description:** Manages campaigns, job postings, and pipelines.
- **Business Owner:** VP of Recruitment
- **Primary Users:** Recruiters
- **Business Value:** Drives hiring workflows
- **Dependencies:** DOM-02, DOM-03
- **Priority:** High

### 3.5 Interview Data
- **Domain ID:** DOM-05
- **Description:** Manages scheduling, rubrics, and recordings.
- **Business Owner:** VP of Product
- **Primary Users:** All Users
- **Business Value:** Core interview execution
- **Dependencies:** DOM-04
- **Priority:** Critical

### 3.6 Assessment Data
- **Domain ID:** DOM-06
- **Description:** Manages technical tests, scoring, and proctoring.
- **Business Owner:** VP of Product
- **Primary Users:** Candidates
- **Business Value:** Skill validation accuracy
- **Dependencies:** DOM-02
- **Priority:** Critical

### 3.7 Learning Data
- **Domain ID:** DOM-07
- **Description:** Manages roadmaps, courses, and skill progression.
- **Business Owner:** Chief Learning Officer
- **Primary Users:** Candidates
- **Business Value:** Skill gap bridging
- **Dependencies:** DOM-06
- **Priority:** Medium

### 3.8 Payment Data
- **Domain ID:** DOM-08
- **Description:** Manages transactions, credits, and invoices.
- **Business Owner:** CFO
- **Primary Users:** Finance
- **Business Value:** Revenue tracking
- **Dependencies:** DOM-03
- **Priority:** High

### 3.9 Notification Data
- **Domain ID:** DOM-09
- **Description:** Manages omnichannel alerts and messaging logs.
- **Business Owner:** VP of Product
- **Primary Users:** All Users
- **Business Value:** User engagement
- **Dependencies:** All
- **Priority:** Medium

### 3.10 Audit Data
- **Domain ID:** DOM-10
- **Description:** Manages compliance, access logs, and system events.
- **Business Owner:** Data Protection Officer
- **Primary Users:** Security
- **Business Value:** Regulatory compliance
- **Dependencies:** All
- **Priority:** High

### 3.11 Analytics Data
- **Domain ID:** DOM-11
- **Description:** Manages aggregated metrics and dashboards.
- **Business Owner:** CDO
- **Primary Users:** Management
- **Business Value:** Business Insights
- **Dependencies:** All
- **Priority:** Medium

### 3.12 System Configuration Data
- **Domain ID:** DOM-12
- **Description:** Manages system-wide reference data and settings.
- **Business Owner:** CTO
- **Primary Users:** System
- **Business Value:** Platform stability
- **Dependencies:** None
- **Priority:** High

## 4. Business Data Objects
This section defines the logical business entities managed by the system.
| Data Object ID | Business Name | Description | Business Purpose | Business Owner | Source | Consumers | Lifecycle | Sensitivity | Retention | Dependencies |
|---|---|---|---|---|---|---|---|---|---|---|
| DATA-001 | User | Logical entity representing user data. | To manage the lifecycle of users. | CISO | User Input | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-01 Entities |
| DATA-002 | Role | Logical entity representing role data. | To manage the lifecycle of roles. | CISO | User Input | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-01 Entities |
| DATA-003 | Permission | Logical entity representing permission data. | To manage the lifecycle of permissions. | CISO | User Input | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-01 Entities |
| DATA-004 | Session | Logical entity representing session data. | To manage the lifecycle of sessions. | CISO | User Input | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-01 Entities |
| DATA-005 | MFA Token | Logical entity representing mfa token data. | To manage the lifecycle of mfa tokens. | CISO | User Input | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-01 Entities |
| DATA-006 | Consent Record | Logical entity representing consent record data. | To manage the lifecycle of consent records. | CISO | User Input | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-01 Entities |
| DATA-007 | Identity Verification | Logical entity representing identity verification data. | To manage the lifecycle of identity verifications. | CISO | User Input | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-01 Entities |
| DATA-008 | Security Profile | Logical entity representing security profile data. | To manage the lifecycle of security profiles. | CISO | User Input | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-01 Entities |
| DATA-009 | SSO Configuration | Logical entity representing sso configuration data. | To manage the lifecycle of sso configurations. | CISO | User Input | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-01 Entities |
| DATA-010 | Password History | Logical entity representing password history data. | To manage the lifecycle of password historys. | CISO | User Input | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-01 Entities |
| DATA-011 | Candidate | Logical entity representing candidate data. | To manage the lifecycle of candidates. | VP of HR | User Input | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-02 Entities |
| DATA-012 | Profile | Logical entity representing profile data. | To manage the lifecycle of profiles. | VP of HR | User Input | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-02 Entities |
| DATA-013 | Education | Logical entity representing education data. | To manage the lifecycle of educations. | VP of HR | User Input | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-02 Entities |
| DATA-014 | Experience | Logical entity representing experience data. | To manage the lifecycle of experiences. | VP of HR | User Input | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-02 Entities |
| DATA-015 | Skill Claim | Logical entity representing skill claim data. | To manage the lifecycle of skill claims. | VP of HR | User Input | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-02 Entities |
| DATA-016 | Certification | Logical entity representing certification data. | To manage the lifecycle of certifications. | VP of HR | User Input | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-02 Entities |
| DATA-017 | Career Goal | Logical entity representing career goal data. | To manage the lifecycle of career goals. | VP of HR | User Input | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-02 Entities |
| DATA-018 | Language Proficiency | Logical entity representing language proficiency data. | To manage the lifecycle of language proficiencys. | VP of HR | User Input | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-02 Entities |
| DATA-019 | Portfolio Item | Logical entity representing portfolio item data. | To manage the lifecycle of portfolio items. | VP of HR | User Input | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-02 Entities |
| DATA-020 | Availability | Logical entity representing availability data. | To manage the lifecycle of availabilitys. | VP of HR | User Input | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-02 Entities |
| DATA-021 | Employer | Logical entity representing employer data. | To manage the lifecycle of employers. | VP of Sales | User Input | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-03 Entities |
| DATA-022 | Company | Logical entity representing company data. | To manage the lifecycle of companys. | VP of Sales | User Input | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-03 Entities |
| DATA-023 | Department | Logical entity representing department data. | To manage the lifecycle of departments. | VP of Sales | User Input | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-03 Entities |
| DATA-024 | Team | Logical entity representing team data. | To manage the lifecycle of teams. | VP of Sales | User Input | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-03 Entities |
| DATA-025 | Recruiter | Logical entity representing recruiter data. | To manage the lifecycle of recruiters. | VP of Sales | User Input | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-03 Entities |
| DATA-026 | Hiring Manager | Logical entity representing hiring manager data. | To manage the lifecycle of hiring managers. | VP of Sales | User Input | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-03 Entities |
| DATA-027 | Billing Profile | Logical entity representing billing profile data. | To manage the lifecycle of billing profiles. | VP of Sales | User Input | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-03 Entities |
| DATA-028 | Subscription | Logical entity representing subscription data. | To manage the lifecycle of subscriptions. | VP of Sales | User Input | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-03 Entities |
| DATA-029 | Company Address | Logical entity representing company address data. | To manage the lifecycle of company addresss. | VP of Sales | User Input | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-03 Entities |
| DATA-030 | Employer Setting | Logical entity representing employer setting data. | To manage the lifecycle of employer settings. | VP of Sales | User Input | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-03 Entities |
| DATA-031 | Job Posting | Logical entity representing job posting data. | To manage the lifecycle of job postings. | VP of Recruitment | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-04 Entities |
| DATA-032 | Campaign | Logical entity representing campaign data. | To manage the lifecycle of campaigns. | VP of Recruitment | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-04 Entities |
| DATA-033 | Application | Logical entity representing application data. | To manage the lifecycle of applications. | VP of Recruitment | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-04 Entities |
| DATA-034 | Talent Pool | Logical entity representing talent pool data. | To manage the lifecycle of talent pools. | VP of Recruitment | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-04 Entities |
| DATA-035 | Offer | Logical entity representing offer data. | To manage the lifecycle of offers. | VP of Recruitment | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-04 Entities |
| DATA-036 | Pipeline Stage | Logical entity representing pipeline stage data. | To manage the lifecycle of pipeline stages. | VP of Recruitment | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-04 Entities |
| DATA-037 | Sourcing Channel | Logical entity representing sourcing channel data. | To manage the lifecycle of sourcing channels. | VP of Recruitment | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-04 Entities |
| DATA-038 | Referral | Logical entity representing referral data. | To manage the lifecycle of referrals. | VP of Recruitment | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-04 Entities |
| DATA-039 | Screening Form | Logical entity representing screening form data. | To manage the lifecycle of screening forms. | VP of Recruitment | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-04 Entities |
| DATA-040 | Shortlist | Logical entity representing shortlist data. | To manage the lifecycle of shortlists. | VP of Recruitment | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-04 Entities |
| DATA-041 | Interview | Logical entity representing interview data. | To manage the lifecycle of interviews. | VP of Product | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-05 Entities |
| DATA-042 | Session | Logical entity representing session data. | To manage the lifecycle of sessions. | VP of Product | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-05 Entities |
| DATA-043 | Question | Logical entity representing question data. | To manage the lifecycle of questions. | VP of Product | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-05 Entities |
| DATA-044 | Answer | Logical entity representing answer data. | To manage the lifecycle of answers. | VP of Product | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-05 Entities |
| DATA-045 | Rubric | Logical entity representing rubric data. | To manage the lifecycle of rubrics. | VP of Product | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-05 Entities |
| DATA-046 | Recording | Logical entity representing recording data. | To manage the lifecycle of recordings. | VP of Product | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-05 Entities |
| DATA-047 | Transcript | Logical entity representing transcript data. | To manage the lifecycle of transcripts. | VP of Product | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-05 Entities |
| DATA-048 | Interviewer | Logical entity representing interviewer data. | To manage the lifecycle of interviewers. | VP of Product | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-05 Entities |
| DATA-049 | Feedback | Logical entity representing feedback data. | To manage the lifecycle of feedbacks. | VP of Product | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-05 Entities |
| DATA-050 | Rating | Logical entity representing rating data. | To manage the lifecycle of ratings. | VP of Product | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-05 Entities |
| DATA-051 | Interview Template | Logical entity representing interview template data. | To manage the lifecycle of interview templates. | VP of Product | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-05 Entities |
| DATA-052 | Assessment | Logical entity representing assessment data. | To manage the lifecycle of assessments. | VP of Product | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-06 Entities |
| DATA-053 | Test Case | Logical entity representing test case data. | To manage the lifecycle of test cases. | VP of Product | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-06 Entities |
| DATA-054 | Submission | Logical entity representing submission data. | To manage the lifecycle of submissions. | VP of Product | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-06 Entities |
| DATA-055 | Score | Logical entity representing score data. | To manage the lifecycle of scores. | VP of Product | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-06 Entities |
| DATA-056 | Skill Gap | Logical entity representing skill gap data. | To manage the lifecycle of skill gaps. | VP of Product | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-06 Entities |
| DATA-057 | Proctoring Log | Logical entity representing proctoring log data. | To manage the lifecycle of proctoring logs. | VP of Product | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-06 Entities |
| DATA-058 | Code Execution Result | Logical entity representing code execution result data. | To manage the lifecycle of code execution results. | VP of Product | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-06 Entities |
| DATA-059 | Plagiarism Report | Logical entity representing plagiarism report data. | To manage the lifecycle of plagiarism reports. | VP of Product | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-06 Entities |
| DATA-060 | Question Bank | Logical entity representing question bank data. | To manage the lifecycle of question banks. | VP of Product | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-06 Entities |
| DATA-061 | Assessment Template | Logical entity representing assessment template data. | To manage the lifecycle of assessment templates. | VP of Product | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-06 Entities |
| DATA-062 | Roadmap | Logical entity representing roadmap data. | To manage the lifecycle of roadmaps. | Chief Learning Officer | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-07 Entities |
| DATA-063 | Module | Logical entity representing module data. | To manage the lifecycle of modules. | Chief Learning Officer | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-07 Entities |
| DATA-064 | Course | Logical entity representing course data. | To manage the lifecycle of courses. | Chief Learning Officer | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-07 Entities |
| DATA-065 | Lesson | Logical entity representing lesson data. | To manage the lifecycle of lessons. | Chief Learning Officer | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-07 Entities |
| DATA-066 | Progress | Logical entity representing progress data. | To manage the lifecycle of progresss. | Chief Learning Officer | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-07 Entities |
| DATA-067 | Certificate | Logical entity representing certificate data. | To manage the lifecycle of certificates. | Chief Learning Officer | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-07 Entities |
| DATA-068 | Badge | Logical entity representing badge data. | To manage the lifecycle of badges. | Chief Learning Officer | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-07 Entities |
| DATA-069 | Recommendation | Logical entity representing recommendation data. | To manage the lifecycle of recommendations. | Chief Learning Officer | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-07 Entities |
| DATA-070 | Content Resource | Logical entity representing content resource data. | To manage the lifecycle of content resources. | Chief Learning Officer | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-07 Entities |
| DATA-071 | Learning Path | Logical entity representing learning path data. | To manage the lifecycle of learning paths. | Chief Learning Officer | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-07 Entities |
| DATA-072 | Transaction | Logical entity representing transaction data. | To manage the lifecycle of transactions. | CFO | System Generated | System Processes, Reporting | Active / Archived | Confidential | 7 Years | Core DOM-08 Entities |
| DATA-073 | Invoice | Logical entity representing invoice data. | To manage the lifecycle of invoices. | CFO | System Generated | System Processes, Reporting | Active / Archived | Confidential | 7 Years | Core DOM-08 Entities |
| DATA-074 | Credit Balance | Logical entity representing credit balance data. | To manage the lifecycle of credit balances. | CFO | System Generated | System Processes, Reporting | Active / Archived | Confidential | 7 Years | Core DOM-08 Entities |
| DATA-075 | Plan | Logical entity representing plan data. | To manage the lifecycle of plans. | CFO | System Generated | System Processes, Reporting | Active / Archived | Confidential | 7 Years | Core DOM-08 Entities |
| DATA-076 | Discount | Logical entity representing discount data. | To manage the lifecycle of discounts. | CFO | System Generated | System Processes, Reporting | Active / Archived | Confidential | 7 Years | Core DOM-08 Entities |
| DATA-077 | Tax Record | Logical entity representing tax record data. | To manage the lifecycle of tax records. | CFO | System Generated | System Processes, Reporting | Active / Archived | Confidential | 7 Years | Core DOM-08 Entities |
| DATA-078 | Refund | Logical entity representing refund data. | To manage the lifecycle of refunds. | CFO | System Generated | System Processes, Reporting | Active / Archived | Confidential | 7 Years | Core DOM-08 Entities |
| DATA-079 | Payment Method | Logical entity representing payment method data. | To manage the lifecycle of payment methods. | CFO | System Generated | System Processes, Reporting | Active / Archived | Confidential | 7 Years | Core DOM-08 Entities |
| DATA-080 | Billing Cycle | Logical entity representing billing cycle data. | To manage the lifecycle of billing cycles. | CFO | System Generated | System Processes, Reporting | Active / Archived | Confidential | 7 Years | Core DOM-08 Entities |
| DATA-081 | Receipt | Logical entity representing receipt data. | To manage the lifecycle of receipts. | CFO | System Generated | System Processes, Reporting | Active / Archived | Confidential | 7 Years | Core DOM-08 Entities |
| DATA-082 | Notification | Logical entity representing notification data. | To manage the lifecycle of notifications. | VP of Product | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-09 Entities |
| DATA-083 | Email Template | Logical entity representing email template data. | To manage the lifecycle of email templates. | VP of Product | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-09 Entities |
| DATA-084 | SMS Log | Logical entity representing sms log data. | To manage the lifecycle of sms logs. | VP of Product | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-09 Entities |
| DATA-085 | In-App Message | Logical entity representing in-app message data. | To manage the lifecycle of in-app messages. | VP of Product | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-09 Entities |
| DATA-086 | Push Notification | Logical entity representing push notification data. | To manage the lifecycle of push notifications. | VP of Product | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-09 Entities |
| DATA-087 | Delivery Status | Logical entity representing delivery status data. | To manage the lifecycle of delivery statuss. | VP of Product | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-09 Entities |
| DATA-088 | Subscription Preference | Logical entity representing subscription preference data. | To manage the lifecycle of subscription preferences. | VP of Product | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-09 Entities |
| DATA-089 | Alert | Logical entity representing alert data. | To manage the lifecycle of alerts. | VP of Product | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-09 Entities |
| DATA-090 | Reminder | Logical entity representing reminder data. | To manage the lifecycle of reminders. | VP of Product | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-09 Entities |
| DATA-091 | Digest | Logical entity representing digest data. | To manage the lifecycle of digests. | VP of Product | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-09 Entities |
| DATA-092 | Audit Log | Logical entity representing audit log data. | To manage the lifecycle of audit logs. | Data Protection Officer | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-10 Entities |
| DATA-093 | Access Log | Logical entity representing access log data. | To manage the lifecycle of access logs. | Data Protection Officer | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-10 Entities |
| DATA-094 | Change Record | Logical entity representing change record data. | To manage the lifecycle of change records. | Data Protection Officer | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-10 Entities |
| DATA-095 | Error Log | Logical entity representing error log data. | To manage the lifecycle of error logs. | Data Protection Officer | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-10 Entities |
| DATA-096 | Compliance Report | Logical entity representing compliance report data. | To manage the lifecycle of compliance reports. | Data Protection Officer | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-10 Entities |
| DATA-097 | Data Export Request | Logical entity representing data export request data. | To manage the lifecycle of data export requests. | Data Protection Officer | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-10 Entities |
| DATA-098 | Privacy Request | Logical entity representing privacy request data. | To manage the lifecycle of privacy requests. | Data Protection Officer | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-10 Entities |
| DATA-099 | Admin Action | Logical entity representing admin action data. | To manage the lifecycle of admin actions. | Data Protection Officer | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-10 Entities |
| DATA-100 | Login Event | Logical entity representing login event data. | To manage the lifecycle of login events. | Data Protection Officer | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-10 Entities |
| DATA-101 | System Alert | Logical entity representing system alert data. | To manage the lifecycle of system alerts. | Data Protection Officer | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-10 Entities |
| DATA-102 | Analytics Snapshot | Logical entity representing analytics snapshot data. | To manage the lifecycle of analytics snapshots. | CDO | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-11 Entities |
| DATA-103 | Usage Metric | Logical entity representing usage metric data. | To manage the lifecycle of usage metrics. | CDO | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-11 Entities |
| DATA-104 | Performance Metric | Logical entity representing performance metric data. | To manage the lifecycle of performance metrics. | CDO | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-11 Entities |
| DATA-105 | Diversity Metric | Logical entity representing diversity metric data. | To manage the lifecycle of diversity metrics. | CDO | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-11 Entities |
| DATA-106 | ROI Report | Logical entity representing roi report data. | To manage the lifecycle of roi reports. | CDO | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-11 Entities |
| DATA-107 | Candidate Funnel | Logical entity representing candidate funnel data. | To manage the lifecycle of candidate funnels. | CDO | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-11 Entities |
| DATA-108 | Drop-off Rate | Logical entity representing drop-off rate data. | To manage the lifecycle of drop-off rates. | CDO | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-11 Entities |
| DATA-109 | Satisfaction Score | Logical entity representing satisfaction score data. | To manage the lifecycle of satisfaction scores. | CDO | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-11 Entities |
| DATA-110 | Time-to-Hire | Logical entity representing time-to-hire data. | To manage the lifecycle of time-to-hires. | CDO | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-11 Entities |
| DATA-111 | Cost-per-Hire | Logical entity representing cost-per-hire data. | To manage the lifecycle of cost-per-hires. | CDO | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-11 Entities |
| DATA-112 | System Configuration | Logical entity representing system configuration data. | To manage the lifecycle of system configurations. | CTO | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-12 Entities |
| DATA-113 | Localization Setting | Logical entity representing localization setting data. | To manage the lifecycle of localization settings. | CTO | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-12 Entities |
| DATA-114 | API Key | Logical entity representing api key data. | To manage the lifecycle of api keys. | CTO | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-12 Entities |
| DATA-115 | Webhook | Logical entity representing webhook data. | To manage the lifecycle of webhooks. | CTO | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-12 Entities |
| DATA-116 | Integration Profile | Logical entity representing integration profile data. | To manage the lifecycle of integration profiles. | CTO | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-12 Entities |
| DATA-117 | Business Rule Config | Logical entity representing business rule config data. | To manage the lifecycle of business rule configs. | CTO | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-12 Entities |
| DATA-118 | Feature Flag | Logical entity representing feature flag data. | To manage the lifecycle of feature flags. | CTO | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-12 Entities |
| DATA-119 | Maintenance Window | Logical entity representing maintenance window data. | To manage the lifecycle of maintenance windows. | CTO | System Generated | System Processes, Reporting | Active / Archived | Confidential | 3 Years | Core DOM-12 Entities |


## 5. Data Attributes
Attributes define the specific data points collected for each business object. (Sample of comprehensive mapping across all objects).
| Data Object ID | Attribute Name | Business Definition | Data Type | Req/Opt | Validation Rule | Example Value | Sensitivity Level | Business Rule Ref |
|---|---|---|---|---|---|---|---|---|
| DATA-001 | User ID | Unique identifier for User | Reference | Required | VAL-001 | USE-8821 | Internal | BR-01 |
| DATA-001 | Name / Title | Primary descriptive label | Text | Required | VAL-002 | Standard User | Public | BR-02 |
| DATA-001 | Status | Current lifecycle state | Enumeration | Required | VAL-003 | Active | Internal | BR-03 |
| DATA-001 | Email Address | Primary contact email | Text | Required | VAL-004 | user@example.com | PII | BR-05 |
| DATA-002 | Role ID | Unique identifier for Role | Reference | Required | VAL-005 | ROL-8821 | Internal | BR-01 |
| DATA-002 | Name / Title | Primary descriptive label | Text | Required | VAL-006 | Standard Role | Public | BR-02 |
| DATA-002 | Status | Current lifecycle state | Enumeration | Required | VAL-007 | Active | Internal | BR-03 |
| DATA-002 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-008 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-003 | Permission ID | Unique identifier for Permission | Reference | Required | VAL-009 | PER-8821 | Internal | BR-01 |
| DATA-003 | Name / Title | Primary descriptive label | Text | Required | VAL-010 | Standard Permission | Public | BR-02 |
| DATA-003 | Status | Current lifecycle state | Enumeration | Required | VAL-011 | Active | Internal | BR-03 |
| DATA-003 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-012 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-004 | Session ID | Unique identifier for Session | Reference | Required | VAL-013 | SES-8821 | Internal | BR-01 |
| DATA-004 | Name / Title | Primary descriptive label | Text | Required | VAL-014 | Standard Session | Public | BR-02 |
| DATA-004 | Status | Current lifecycle state | Enumeration | Required | VAL-015 | Active | Internal | BR-03 |
| DATA-004 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-016 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-005 | MFA Token ID | Unique identifier for MFA Token | Reference | Required | VAL-017 | MFA-8821 | Internal | BR-01 |
| DATA-005 | Name / Title | Primary descriptive label | Text | Required | VAL-018 | Standard MFA Token | Public | BR-02 |
| DATA-005 | Status | Current lifecycle state | Enumeration | Required | VAL-019 | Active | Internal | BR-03 |
| DATA-005 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-020 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-006 | Consent Record ID | Unique identifier for Consent Record | Reference | Required | VAL-021 | CON-8821 | Internal | BR-01 |
| DATA-006 | Name / Title | Primary descriptive label | Text | Required | VAL-022 | Standard Consent Record | Public | BR-02 |
| DATA-006 | Status | Current lifecycle state | Enumeration | Required | VAL-023 | Active | Internal | BR-03 |
| DATA-006 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-024 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-007 | Identity Verification ID | Unique identifier for Identity Verification | Reference | Required | VAL-025 | IDE-8821 | Internal | BR-01 |
| DATA-007 | Name / Title | Primary descriptive label | Text | Required | VAL-026 | Standard Identity Verification | Public | BR-02 |
| DATA-007 | Status | Current lifecycle state | Enumeration | Required | VAL-027 | Active | Internal | BR-03 |
| DATA-007 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-028 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-008 | Security Profile ID | Unique identifier for Security Profile | Reference | Required | VAL-029 | SEC-8821 | Internal | BR-01 |
| DATA-008 | Name / Title | Primary descriptive label | Text | Required | VAL-030 | Standard Security Profile | Public | BR-02 |
| DATA-008 | Status | Current lifecycle state | Enumeration | Required | VAL-031 | Active | Internal | BR-03 |
| DATA-008 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-032 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-009 | SSO Configuration ID | Unique identifier for SSO Configuration | Reference | Required | VAL-033 | SSO-8821 | Internal | BR-01 |
| DATA-009 | Name / Title | Primary descriptive label | Text | Required | VAL-034 | Standard SSO Configuration | Public | BR-02 |
| DATA-009 | Status | Current lifecycle state | Enumeration | Required | VAL-035 | Active | Internal | BR-03 |
| DATA-009 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-036 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-010 | Password History ID | Unique identifier for Password History | Reference | Required | VAL-037 | PAS-8821 | Internal | BR-01 |
| DATA-010 | Name / Title | Primary descriptive label | Text | Required | VAL-038 | Standard Password History | Public | BR-02 |
| DATA-010 | Status | Current lifecycle state | Enumeration | Required | VAL-039 | Active | Internal | BR-03 |
| DATA-010 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-040 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-011 | Candidate ID | Unique identifier for Candidate | Reference | Required | VAL-041 | CAN-8821 | Internal | BR-01 |
| DATA-011 | Name / Title | Primary descriptive label | Text | Required | VAL-042 | Standard Candidate | Public | BR-02 |
| DATA-011 | Status | Current lifecycle state | Enumeration | Required | VAL-043 | Active | Internal | BR-03 |
| DATA-011 | Resume | Attached CV document | Attachment | Optional | VAL-044 | resume.pdf | PII | BR-07 |
| DATA-012 | Profile ID | Unique identifier for Profile | Reference | Required | VAL-045 | PRO-8821 | Internal | BR-01 |
| DATA-012 | Name / Title | Primary descriptive label | Text | Required | VAL-046 | Standard Profile | Public | BR-02 |
| DATA-012 | Status | Current lifecycle state | Enumeration | Required | VAL-047 | Active | Internal | BR-03 |
| DATA-012 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-048 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-013 | Education ID | Unique identifier for Education | Reference | Required | VAL-049 | EDU-8821 | Internal | BR-01 |
| DATA-013 | Name / Title | Primary descriptive label | Text | Required | VAL-050 | Standard Education | Public | BR-02 |
| DATA-013 | Status | Current lifecycle state | Enumeration | Required | VAL-051 | Active | Internal | BR-03 |
| DATA-013 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-052 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-014 | Experience ID | Unique identifier for Experience | Reference | Required | VAL-053 | EXP-8821 | Internal | BR-01 |
| DATA-014 | Name / Title | Primary descriptive label | Text | Required | VAL-054 | Standard Experience | Public | BR-02 |
| DATA-014 | Status | Current lifecycle state | Enumeration | Required | VAL-055 | Active | Internal | BR-03 |
| DATA-014 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-056 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-015 | Skill Claim ID | Unique identifier for Skill Claim | Reference | Required | VAL-057 | SKI-8821 | Internal | BR-01 |
| DATA-015 | Name / Title | Primary descriptive label | Text | Required | VAL-058 | Standard Skill Claim | Public | BR-02 |
| DATA-015 | Status | Current lifecycle state | Enumeration | Required | VAL-059 | Active | Internal | BR-03 |
| DATA-015 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-060 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-016 | Certification ID | Unique identifier for Certification | Reference | Required | VAL-061 | CER-8821 | Internal | BR-01 |
| DATA-016 | Name / Title | Primary descriptive label | Text | Required | VAL-062 | Standard Certification | Public | BR-02 |
| DATA-016 | Status | Current lifecycle state | Enumeration | Required | VAL-063 | Active | Internal | BR-03 |
| DATA-016 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-064 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-017 | Career Goal ID | Unique identifier for Career Goal | Reference | Required | VAL-065 | CAR-8821 | Internal | BR-01 |
| DATA-017 | Name / Title | Primary descriptive label | Text | Required | VAL-066 | Standard Career Goal | Public | BR-02 |
| DATA-017 | Status | Current lifecycle state | Enumeration | Required | VAL-067 | Active | Internal | BR-03 |
| DATA-017 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-068 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-018 | Language Proficiency ID | Unique identifier for Language Proficiency | Reference | Required | VAL-069 | LAN-8821 | Internal | BR-01 |
| DATA-018 | Name / Title | Primary descriptive label | Text | Required | VAL-070 | Standard Language Proficiency | Public | BR-02 |
| DATA-018 | Status | Current lifecycle state | Enumeration | Required | VAL-071 | Active | Internal | BR-03 |
| DATA-018 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-072 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-019 | Portfolio Item ID | Unique identifier for Portfolio Item | Reference | Required | VAL-073 | POR-8821 | Internal | BR-01 |
| DATA-019 | Name / Title | Primary descriptive label | Text | Required | VAL-074 | Standard Portfolio Item | Public | BR-02 |
| DATA-019 | Status | Current lifecycle state | Enumeration | Required | VAL-075 | Active | Internal | BR-03 |
| DATA-019 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-076 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-020 | Availability ID | Unique identifier for Availability | Reference | Required | VAL-077 | AVA-8821 | Internal | BR-01 |
| DATA-020 | Name / Title | Primary descriptive label | Text | Required | VAL-078 | Standard Availability | Public | BR-02 |
| DATA-020 | Status | Current lifecycle state | Enumeration | Required | VAL-079 | Active | Internal | BR-03 |
| DATA-020 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-080 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-021 | Employer ID | Unique identifier for Employer | Reference | Required | VAL-081 | EMP-8821 | Internal | BR-01 |
| DATA-021 | Name / Title | Primary descriptive label | Text | Required | VAL-082 | Standard Employer | Public | BR-02 |
| DATA-021 | Status | Current lifecycle state | Enumeration | Required | VAL-083 | Active | Internal | BR-03 |
| DATA-021 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-084 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-022 | Company ID | Unique identifier for Company | Reference | Required | VAL-085 | COM-8821 | Internal | BR-01 |
| DATA-022 | Name / Title | Primary descriptive label | Text | Required | VAL-086 | Standard Company | Public | BR-02 |
| DATA-022 | Status | Current lifecycle state | Enumeration | Required | VAL-087 | Active | Internal | BR-03 |
| DATA-022 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-088 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-023 | Department ID | Unique identifier for Department | Reference | Required | VAL-089 | DEP-8821 | Internal | BR-01 |
| DATA-023 | Name / Title | Primary descriptive label | Text | Required | VAL-090 | Standard Department | Public | BR-02 |
| DATA-023 | Status | Current lifecycle state | Enumeration | Required | VAL-091 | Active | Internal | BR-03 |
| DATA-023 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-092 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-024 | Team ID | Unique identifier for Team | Reference | Required | VAL-093 | TEA-8821 | Internal | BR-01 |
| DATA-024 | Name / Title | Primary descriptive label | Text | Required | VAL-094 | Standard Team | Public | BR-02 |
| DATA-024 | Status | Current lifecycle state | Enumeration | Required | VAL-095 | Active | Internal | BR-03 |
| DATA-024 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-096 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-025 | Recruiter ID | Unique identifier for Recruiter | Reference | Required | VAL-097 | REC-8821 | Internal | BR-01 |
| DATA-025 | Name / Title | Primary descriptive label | Text | Required | VAL-098 | Standard Recruiter | Public | BR-02 |
| DATA-025 | Status | Current lifecycle state | Enumeration | Required | VAL-099 | Active | Internal | BR-03 |
| DATA-025 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-100 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-026 | Hiring Manager ID | Unique identifier for Hiring Manager | Reference | Required | VAL-101 | HIR-8821 | Internal | BR-01 |
| DATA-026 | Name / Title | Primary descriptive label | Text | Required | VAL-102 | Standard Hiring Manager | Public | BR-02 |
| DATA-026 | Status | Current lifecycle state | Enumeration | Required | VAL-103 | Active | Internal | BR-03 |
| DATA-026 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-104 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-027 | Billing Profile ID | Unique identifier for Billing Profile | Reference | Required | VAL-105 | BIL-8821 | Internal | BR-01 |
| DATA-027 | Name / Title | Primary descriptive label | Text | Required | VAL-106 | Standard Billing Profile | Public | BR-02 |
| DATA-027 | Status | Current lifecycle state | Enumeration | Required | VAL-107 | Active | Internal | BR-03 |
| DATA-027 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-108 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-028 | Subscription ID | Unique identifier for Subscription | Reference | Required | VAL-109 | SUB-8821 | Internal | BR-01 |
| DATA-028 | Name / Title | Primary descriptive label | Text | Required | VAL-110 | Standard Subscription | Public | BR-02 |
| DATA-028 | Status | Current lifecycle state | Enumeration | Required | VAL-111 | Active | Internal | BR-03 |
| DATA-028 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-112 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-029 | Company Address ID | Unique identifier for Company Address | Reference | Required | VAL-113 | COM-8821 | Internal | BR-01 |
| DATA-029 | Name / Title | Primary descriptive label | Text | Required | VAL-114 | Standard Company Address | Public | BR-02 |
| DATA-029 | Status | Current lifecycle state | Enumeration | Required | VAL-115 | Active | Internal | BR-03 |
| DATA-029 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-116 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-030 | Employer Setting ID | Unique identifier for Employer Setting | Reference | Required | VAL-117 | EMP-8821 | Internal | BR-01 |
| DATA-030 | Name / Title | Primary descriptive label | Text | Required | VAL-118 | Standard Employer Setting | Public | BR-02 |
| DATA-030 | Status | Current lifecycle state | Enumeration | Required | VAL-119 | Active | Internal | BR-03 |
| DATA-030 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-120 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-031 | Job Posting ID | Unique identifier for Job Posting | Reference | Required | VAL-121 | JOB-8821 | Internal | BR-01 |
| DATA-031 | Name / Title | Primary descriptive label | Text | Required | VAL-122 | Standard Job Posting | Public | BR-02 |
| DATA-031 | Status | Current lifecycle state | Enumeration | Required | VAL-123 | Active | Internal | BR-03 |
| DATA-031 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-124 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-032 | Campaign ID | Unique identifier for Campaign | Reference | Required | VAL-125 | CAM-8821 | Internal | BR-01 |
| DATA-032 | Name / Title | Primary descriptive label | Text | Required | VAL-126 | Standard Campaign | Public | BR-02 |
| DATA-032 | Status | Current lifecycle state | Enumeration | Required | VAL-127 | Active | Internal | BR-03 |
| DATA-032 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-128 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-033 | Application ID | Unique identifier for Application | Reference | Required | VAL-129 | APP-8821 | Internal | BR-01 |
| DATA-033 | Name / Title | Primary descriptive label | Text | Required | VAL-130 | Standard Application | Public | BR-02 |
| DATA-033 | Status | Current lifecycle state | Enumeration | Required | VAL-131 | Active | Internal | BR-03 |
| DATA-033 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-132 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-034 | Talent Pool ID | Unique identifier for Talent Pool | Reference | Required | VAL-133 | TAL-8821 | Internal | BR-01 |
| DATA-034 | Name / Title | Primary descriptive label | Text | Required | VAL-134 | Standard Talent Pool | Public | BR-02 |
| DATA-034 | Status | Current lifecycle state | Enumeration | Required | VAL-135 | Active | Internal | BR-03 |
| DATA-034 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-136 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-035 | Offer ID | Unique identifier for Offer | Reference | Required | VAL-137 | OFF-8821 | Internal | BR-01 |
| DATA-035 | Name / Title | Primary descriptive label | Text | Required | VAL-138 | Standard Offer | Public | BR-02 |
| DATA-035 | Status | Current lifecycle state | Enumeration | Required | VAL-139 | Active | Internal | BR-03 |
| DATA-035 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-140 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-036 | Pipeline Stage ID | Unique identifier for Pipeline Stage | Reference | Required | VAL-141 | PIP-8821 | Internal | BR-01 |
| DATA-036 | Name / Title | Primary descriptive label | Text | Required | VAL-142 | Standard Pipeline Stage | Public | BR-02 |
| DATA-036 | Status | Current lifecycle state | Enumeration | Required | VAL-143 | Active | Internal | BR-03 |
| DATA-036 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-144 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-037 | Sourcing Channel ID | Unique identifier for Sourcing Channel | Reference | Required | VAL-145 | SOU-8821 | Internal | BR-01 |
| DATA-037 | Name / Title | Primary descriptive label | Text | Required | VAL-146 | Standard Sourcing Channel | Public | BR-02 |
| DATA-037 | Status | Current lifecycle state | Enumeration | Required | VAL-147 | Active | Internal | BR-03 |
| DATA-037 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-148 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-038 | Referral ID | Unique identifier for Referral | Reference | Required | VAL-149 | REF-8821 | Internal | BR-01 |
| DATA-038 | Name / Title | Primary descriptive label | Text | Required | VAL-150 | Standard Referral | Public | BR-02 |
| DATA-038 | Status | Current lifecycle state | Enumeration | Required | VAL-151 | Active | Internal | BR-03 |
| DATA-038 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-152 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-039 | Screening Form ID | Unique identifier for Screening Form | Reference | Required | VAL-153 | SCR-8821 | Internal | BR-01 |
| DATA-039 | Name / Title | Primary descriptive label | Text | Required | VAL-154 | Standard Screening Form | Public | BR-02 |
| DATA-039 | Status | Current lifecycle state | Enumeration | Required | VAL-155 | Active | Internal | BR-03 |
| DATA-039 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-156 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-040 | Shortlist ID | Unique identifier for Shortlist | Reference | Required | VAL-157 | SHO-8821 | Internal | BR-01 |
| DATA-040 | Name / Title | Primary descriptive label | Text | Required | VAL-158 | Standard Shortlist | Public | BR-02 |
| DATA-040 | Status | Current lifecycle state | Enumeration | Required | VAL-159 | Active | Internal | BR-03 |
| DATA-040 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-160 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-041 | Interview ID | Unique identifier for Interview | Reference | Required | VAL-161 | INT-8821 | Internal | BR-01 |
| DATA-041 | Name / Title | Primary descriptive label | Text | Required | VAL-162 | Standard Interview | Public | BR-02 |
| DATA-041 | Status | Current lifecycle state | Enumeration | Required | VAL-163 | Active | Internal | BR-03 |
| DATA-041 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-164 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-042 | Session ID | Unique identifier for Session | Reference | Required | VAL-165 | SES-8821 | Internal | BR-01 |
| DATA-042 | Name / Title | Primary descriptive label | Text | Required | VAL-166 | Standard Session | Public | BR-02 |
| DATA-042 | Status | Current lifecycle state | Enumeration | Required | VAL-167 | Active | Internal | BR-03 |
| DATA-042 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-168 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-043 | Question ID | Unique identifier for Question | Reference | Required | VAL-169 | QUE-8821 | Internal | BR-01 |
| DATA-043 | Name / Title | Primary descriptive label | Text | Required | VAL-170 | Standard Question | Public | BR-02 |
| DATA-043 | Status | Current lifecycle state | Enumeration | Required | VAL-171 | Active | Internal | BR-03 |
| DATA-043 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-172 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-044 | Answer ID | Unique identifier for Answer | Reference | Required | VAL-173 | ANS-8821 | Internal | BR-01 |
| DATA-044 | Name / Title | Primary descriptive label | Text | Required | VAL-174 | Standard Answer | Public | BR-02 |
| DATA-044 | Status | Current lifecycle state | Enumeration | Required | VAL-175 | Active | Internal | BR-03 |
| DATA-044 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-176 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-045 | Rubric ID | Unique identifier for Rubric | Reference | Required | VAL-177 | RUB-8821 | Internal | BR-01 |
| DATA-045 | Name / Title | Primary descriptive label | Text | Required | VAL-178 | Standard Rubric | Public | BR-02 |
| DATA-045 | Status | Current lifecycle state | Enumeration | Required | VAL-179 | Active | Internal | BR-03 |
| DATA-045 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-180 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-046 | Recording ID | Unique identifier for Recording | Reference | Required | VAL-181 | REC-8821 | Internal | BR-01 |
| DATA-046 | Name / Title | Primary descriptive label | Text | Required | VAL-182 | Standard Recording | Public | BR-02 |
| DATA-046 | Status | Current lifecycle state | Enumeration | Required | VAL-183 | Active | Internal | BR-03 |
| DATA-046 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-184 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-047 | Transcript ID | Unique identifier for Transcript | Reference | Required | VAL-185 | TRA-8821 | Internal | BR-01 |
| DATA-047 | Name / Title | Primary descriptive label | Text | Required | VAL-186 | Standard Transcript | Public | BR-02 |
| DATA-047 | Status | Current lifecycle state | Enumeration | Required | VAL-187 | Active | Internal | BR-03 |
| DATA-047 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-188 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-048 | Interviewer ID | Unique identifier for Interviewer | Reference | Required | VAL-189 | INT-8821 | Internal | BR-01 |
| DATA-048 | Name / Title | Primary descriptive label | Text | Required | VAL-190 | Standard Interviewer | Public | BR-02 |
| DATA-048 | Status | Current lifecycle state | Enumeration | Required | VAL-191 | Active | Internal | BR-03 |
| DATA-048 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-192 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-049 | Feedback ID | Unique identifier for Feedback | Reference | Required | VAL-193 | FEE-8821 | Internal | BR-01 |
| DATA-049 | Name / Title | Primary descriptive label | Text | Required | VAL-194 | Standard Feedback | Public | BR-02 |
| DATA-049 | Status | Current lifecycle state | Enumeration | Required | VAL-195 | Active | Internal | BR-03 |
| DATA-049 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-196 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-050 | Rating ID | Unique identifier for Rating | Reference | Required | VAL-197 | RAT-8821 | Internal | BR-01 |
| DATA-050 | Name / Title | Primary descriptive label | Text | Required | VAL-198 | Standard Rating | Public | BR-02 |
| DATA-050 | Status | Current lifecycle state | Enumeration | Required | VAL-199 | Active | Internal | BR-03 |
| DATA-050 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-200 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-051 | Interview Template ID | Unique identifier for Interview Template | Reference | Required | VAL-201 | INT-8821 | Internal | BR-01 |
| DATA-051 | Name / Title | Primary descriptive label | Text | Required | VAL-202 | Standard Interview Template | Public | BR-02 |
| DATA-051 | Status | Current lifecycle state | Enumeration | Required | VAL-203 | Active | Internal | BR-03 |
| DATA-051 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-204 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-052 | Assessment ID | Unique identifier for Assessment | Reference | Required | VAL-205 | ASS-8821 | Internal | BR-01 |
| DATA-052 | Name / Title | Primary descriptive label | Text | Required | VAL-206 | Standard Assessment | Public | BR-02 |
| DATA-052 | Status | Current lifecycle state | Enumeration | Required | VAL-207 | Active | Internal | BR-03 |
| DATA-052 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-208 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-053 | Test Case ID | Unique identifier for Test Case | Reference | Required | VAL-209 | TES-8821 | Internal | BR-01 |
| DATA-053 | Name / Title | Primary descriptive label | Text | Required | VAL-210 | Standard Test Case | Public | BR-02 |
| DATA-053 | Status | Current lifecycle state | Enumeration | Required | VAL-211 | Active | Internal | BR-03 |
| DATA-053 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-212 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-054 | Submission ID | Unique identifier for Submission | Reference | Required | VAL-213 | SUB-8821 | Internal | BR-01 |
| DATA-054 | Name / Title | Primary descriptive label | Text | Required | VAL-214 | Standard Submission | Public | BR-02 |
| DATA-054 | Status | Current lifecycle state | Enumeration | Required | VAL-215 | Active | Internal | BR-03 |
| DATA-054 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-216 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-055 | Score ID | Unique identifier for Score | Reference | Required | VAL-217 | SCO-8821 | Internal | BR-01 |
| DATA-055 | Name / Title | Primary descriptive label | Text | Required | VAL-218 | Standard Score | Public | BR-02 |
| DATA-055 | Status | Current lifecycle state | Enumeration | Required | VAL-219 | Active | Internal | BR-03 |
| DATA-055 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-220 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-056 | Skill Gap ID | Unique identifier for Skill Gap | Reference | Required | VAL-221 | SKI-8821 | Internal | BR-01 |
| DATA-056 | Name / Title | Primary descriptive label | Text | Required | VAL-222 | Standard Skill Gap | Public | BR-02 |
| DATA-056 | Status | Current lifecycle state | Enumeration | Required | VAL-223 | Active | Internal | BR-03 |
| DATA-056 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-224 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-057 | Proctoring Log ID | Unique identifier for Proctoring Log | Reference | Required | VAL-225 | PRO-8821 | Internal | BR-01 |
| DATA-057 | Name / Title | Primary descriptive label | Text | Required | VAL-226 | Standard Proctoring Log | Public | BR-02 |
| DATA-057 | Status | Current lifecycle state | Enumeration | Required | VAL-227 | Active | Internal | BR-03 |
| DATA-057 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-228 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-058 | Code Execution Result ID | Unique identifier for Code Execution Result | Reference | Required | VAL-229 | COD-8821 | Internal | BR-01 |
| DATA-058 | Name / Title | Primary descriptive label | Text | Required | VAL-230 | Standard Code Execution Result | Public | BR-02 |
| DATA-058 | Status | Current lifecycle state | Enumeration | Required | VAL-231 | Active | Internal | BR-03 |
| DATA-058 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-232 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-059 | Plagiarism Report ID | Unique identifier for Plagiarism Report | Reference | Required | VAL-233 | PLA-8821 | Internal | BR-01 |
| DATA-059 | Name / Title | Primary descriptive label | Text | Required | VAL-234 | Standard Plagiarism Report | Public | BR-02 |
| DATA-059 | Status | Current lifecycle state | Enumeration | Required | VAL-235 | Active | Internal | BR-03 |
| DATA-059 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-236 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-060 | Question Bank ID | Unique identifier for Question Bank | Reference | Required | VAL-237 | QUE-8821 | Internal | BR-01 |
| DATA-060 | Name / Title | Primary descriptive label | Text | Required | VAL-238 | Standard Question Bank | Public | BR-02 |
| DATA-060 | Status | Current lifecycle state | Enumeration | Required | VAL-239 | Active | Internal | BR-03 |
| DATA-060 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-240 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-061 | Assessment Template ID | Unique identifier for Assessment Template | Reference | Required | VAL-241 | ASS-8821 | Internal | BR-01 |
| DATA-061 | Name / Title | Primary descriptive label | Text | Required | VAL-242 | Standard Assessment Template | Public | BR-02 |
| DATA-061 | Status | Current lifecycle state | Enumeration | Required | VAL-243 | Active | Internal | BR-03 |
| DATA-061 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-244 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-062 | Roadmap ID | Unique identifier for Roadmap | Reference | Required | VAL-245 | ROA-8821 | Internal | BR-01 |
| DATA-062 | Name / Title | Primary descriptive label | Text | Required | VAL-246 | Standard Roadmap | Public | BR-02 |
| DATA-062 | Status | Current lifecycle state | Enumeration | Required | VAL-247 | Active | Internal | BR-03 |
| DATA-062 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-248 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-063 | Module ID | Unique identifier for Module | Reference | Required | VAL-249 | MOD-8821 | Internal | BR-01 |
| DATA-063 | Name / Title | Primary descriptive label | Text | Required | VAL-250 | Standard Module | Public | BR-02 |
| DATA-063 | Status | Current lifecycle state | Enumeration | Required | VAL-251 | Active | Internal | BR-03 |
| DATA-063 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-252 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-064 | Course ID | Unique identifier for Course | Reference | Required | VAL-253 | COU-8821 | Internal | BR-01 |
| DATA-064 | Name / Title | Primary descriptive label | Text | Required | VAL-254 | Standard Course | Public | BR-02 |
| DATA-064 | Status | Current lifecycle state | Enumeration | Required | VAL-255 | Active | Internal | BR-03 |
| DATA-064 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-256 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-065 | Lesson ID | Unique identifier for Lesson | Reference | Required | VAL-257 | LES-8821 | Internal | BR-01 |
| DATA-065 | Name / Title | Primary descriptive label | Text | Required | VAL-258 | Standard Lesson | Public | BR-02 |
| DATA-065 | Status | Current lifecycle state | Enumeration | Required | VAL-259 | Active | Internal | BR-03 |
| DATA-065 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-260 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-066 | Progress ID | Unique identifier for Progress | Reference | Required | VAL-261 | PRO-8821 | Internal | BR-01 |
| DATA-066 | Name / Title | Primary descriptive label | Text | Required | VAL-262 | Standard Progress | Public | BR-02 |
| DATA-066 | Status | Current lifecycle state | Enumeration | Required | VAL-263 | Active | Internal | BR-03 |
| DATA-066 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-264 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-067 | Certificate ID | Unique identifier for Certificate | Reference | Required | VAL-265 | CER-8821 | Internal | BR-01 |
| DATA-067 | Name / Title | Primary descriptive label | Text | Required | VAL-266 | Standard Certificate | Public | BR-02 |
| DATA-067 | Status | Current lifecycle state | Enumeration | Required | VAL-267 | Active | Internal | BR-03 |
| DATA-067 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-268 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-068 | Badge ID | Unique identifier for Badge | Reference | Required | VAL-269 | BAD-8821 | Internal | BR-01 |
| DATA-068 | Name / Title | Primary descriptive label | Text | Required | VAL-270 | Standard Badge | Public | BR-02 |
| DATA-068 | Status | Current lifecycle state | Enumeration | Required | VAL-271 | Active | Internal | BR-03 |
| DATA-068 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-272 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-069 | Recommendation ID | Unique identifier for Recommendation | Reference | Required | VAL-273 | REC-8821 | Internal | BR-01 |
| DATA-069 | Name / Title | Primary descriptive label | Text | Required | VAL-274 | Standard Recommendation | Public | BR-02 |
| DATA-069 | Status | Current lifecycle state | Enumeration | Required | VAL-275 | Active | Internal | BR-03 |
| DATA-069 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-276 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-070 | Content Resource ID | Unique identifier for Content Resource | Reference | Required | VAL-277 | CON-8821 | Internal | BR-01 |
| DATA-070 | Name / Title | Primary descriptive label | Text | Required | VAL-278 | Standard Content Resource | Public | BR-02 |
| DATA-070 | Status | Current lifecycle state | Enumeration | Required | VAL-279 | Active | Internal | BR-03 |
| DATA-070 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-280 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-071 | Learning Path ID | Unique identifier for Learning Path | Reference | Required | VAL-281 | LEA-8821 | Internal | BR-01 |
| DATA-071 | Name / Title | Primary descriptive label | Text | Required | VAL-282 | Standard Learning Path | Public | BR-02 |
| DATA-071 | Status | Current lifecycle state | Enumeration | Required | VAL-283 | Active | Internal | BR-03 |
| DATA-071 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-284 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-072 | Transaction ID | Unique identifier for Transaction | Reference | Required | VAL-285 | TRA-8821 | Internal | BR-01 |
| DATA-072 | Name / Title | Primary descriptive label | Text | Required | VAL-286 | Standard Transaction | Public | BR-02 |
| DATA-072 | Status | Current lifecycle state | Enumeration | Required | VAL-287 | Active | Internal | BR-03 |
| DATA-072 | Amount | Transaction financial value | Currency | Required | VAL-288 | $500.00 | Financial | BR-06 |
| DATA-073 | Invoice ID | Unique identifier for Invoice | Reference | Required | VAL-289 | INV-8821 | Internal | BR-01 |
| DATA-073 | Name / Title | Primary descriptive label | Text | Required | VAL-290 | Standard Invoice | Public | BR-02 |
| DATA-073 | Status | Current lifecycle state | Enumeration | Required | VAL-291 | Active | Internal | BR-03 |
| DATA-073 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-292 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-074 | Credit Balance ID | Unique identifier for Credit Balance | Reference | Required | VAL-293 | CRE-8821 | Internal | BR-01 |
| DATA-074 | Name / Title | Primary descriptive label | Text | Required | VAL-294 | Standard Credit Balance | Public | BR-02 |
| DATA-074 | Status | Current lifecycle state | Enumeration | Required | VAL-295 | Active | Internal | BR-03 |
| DATA-074 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-296 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-075 | Plan ID | Unique identifier for Plan | Reference | Required | VAL-297 | PLA-8821 | Internal | BR-01 |
| DATA-075 | Name / Title | Primary descriptive label | Text | Required | VAL-298 | Standard Plan | Public | BR-02 |
| DATA-075 | Status | Current lifecycle state | Enumeration | Required | VAL-299 | Active | Internal | BR-03 |
| DATA-075 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-300 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-076 | Discount ID | Unique identifier for Discount | Reference | Required | VAL-301 | DIS-8821 | Internal | BR-01 |
| DATA-076 | Name / Title | Primary descriptive label | Text | Required | VAL-302 | Standard Discount | Public | BR-02 |
| DATA-076 | Status | Current lifecycle state | Enumeration | Required | VAL-303 | Active | Internal | BR-03 |
| DATA-076 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-304 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-077 | Tax Record ID | Unique identifier for Tax Record | Reference | Required | VAL-305 | TAX-8821 | Internal | BR-01 |
| DATA-077 | Name / Title | Primary descriptive label | Text | Required | VAL-306 | Standard Tax Record | Public | BR-02 |
| DATA-077 | Status | Current lifecycle state | Enumeration | Required | VAL-307 | Active | Internal | BR-03 |
| DATA-077 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-308 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-078 | Refund ID | Unique identifier for Refund | Reference | Required | VAL-309 | REF-8821 | Internal | BR-01 |
| DATA-078 | Name / Title | Primary descriptive label | Text | Required | VAL-310 | Standard Refund | Public | BR-02 |
| DATA-078 | Status | Current lifecycle state | Enumeration | Required | VAL-311 | Active | Internal | BR-03 |
| DATA-078 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-312 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-079 | Payment Method ID | Unique identifier for Payment Method | Reference | Required | VAL-313 | PAY-8821 | Internal | BR-01 |
| DATA-079 | Name / Title | Primary descriptive label | Text | Required | VAL-314 | Standard Payment Method | Public | BR-02 |
| DATA-079 | Status | Current lifecycle state | Enumeration | Required | VAL-315 | Active | Internal | BR-03 |
| DATA-079 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-316 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-080 | Billing Cycle ID | Unique identifier for Billing Cycle | Reference | Required | VAL-317 | BIL-8821 | Internal | BR-01 |
| DATA-080 | Name / Title | Primary descriptive label | Text | Required | VAL-318 | Standard Billing Cycle | Public | BR-02 |
| DATA-080 | Status | Current lifecycle state | Enumeration | Required | VAL-319 | Active | Internal | BR-03 |
| DATA-080 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-320 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-081 | Receipt ID | Unique identifier for Receipt | Reference | Required | VAL-321 | REC-8821 | Internal | BR-01 |
| DATA-081 | Name / Title | Primary descriptive label | Text | Required | VAL-322 | Standard Receipt | Public | BR-02 |
| DATA-081 | Status | Current lifecycle state | Enumeration | Required | VAL-323 | Active | Internal | BR-03 |
| DATA-081 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-324 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-082 | Notification ID | Unique identifier for Notification | Reference | Required | VAL-325 | NOT-8821 | Internal | BR-01 |
| DATA-082 | Name / Title | Primary descriptive label | Text | Required | VAL-326 | Standard Notification | Public | BR-02 |
| DATA-082 | Status | Current lifecycle state | Enumeration | Required | VAL-327 | Active | Internal | BR-03 |
| DATA-082 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-328 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-083 | Email Template ID | Unique identifier for Email Template | Reference | Required | VAL-329 | EMA-8821 | Internal | BR-01 |
| DATA-083 | Name / Title | Primary descriptive label | Text | Required | VAL-330 | Standard Email Template | Public | BR-02 |
| DATA-083 | Status | Current lifecycle state | Enumeration | Required | VAL-331 | Active | Internal | BR-03 |
| DATA-083 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-332 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-084 | SMS Log ID | Unique identifier for SMS Log | Reference | Required | VAL-333 | SMS-8821 | Internal | BR-01 |
| DATA-084 | Name / Title | Primary descriptive label | Text | Required | VAL-334 | Standard SMS Log | Public | BR-02 |
| DATA-084 | Status | Current lifecycle state | Enumeration | Required | VAL-335 | Active | Internal | BR-03 |
| DATA-084 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-336 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-085 | In-App Message ID | Unique identifier for In-App Message | Reference | Required | VAL-337 | IN--8821 | Internal | BR-01 |
| DATA-085 | Name / Title | Primary descriptive label | Text | Required | VAL-338 | Standard In-App Message | Public | BR-02 |
| DATA-085 | Status | Current lifecycle state | Enumeration | Required | VAL-339 | Active | Internal | BR-03 |
| DATA-085 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-340 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-086 | Push Notification ID | Unique identifier for Push Notification | Reference | Required | VAL-341 | PUS-8821 | Internal | BR-01 |
| DATA-086 | Name / Title | Primary descriptive label | Text | Required | VAL-342 | Standard Push Notification | Public | BR-02 |
| DATA-086 | Status | Current lifecycle state | Enumeration | Required | VAL-343 | Active | Internal | BR-03 |
| DATA-086 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-344 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-087 | Delivery Status ID | Unique identifier for Delivery Status | Reference | Required | VAL-345 | DEL-8821 | Internal | BR-01 |
| DATA-087 | Name / Title | Primary descriptive label | Text | Required | VAL-346 | Standard Delivery Status | Public | BR-02 |
| DATA-087 | Status | Current lifecycle state | Enumeration | Required | VAL-347 | Active | Internal | BR-03 |
| DATA-087 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-348 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-088 | Subscription Preference ID | Unique identifier for Subscription Preference | Reference | Required | VAL-349 | SUB-8821 | Internal | BR-01 |
| DATA-088 | Name / Title | Primary descriptive label | Text | Required | VAL-350 | Standard Subscription Preference | Public | BR-02 |
| DATA-088 | Status | Current lifecycle state | Enumeration | Required | VAL-351 | Active | Internal | BR-03 |
| DATA-088 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-352 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-089 | Alert ID | Unique identifier for Alert | Reference | Required | VAL-353 | ALE-8821 | Internal | BR-01 |
| DATA-089 | Name / Title | Primary descriptive label | Text | Required | VAL-354 | Standard Alert | Public | BR-02 |
| DATA-089 | Status | Current lifecycle state | Enumeration | Required | VAL-355 | Active | Internal | BR-03 |
| DATA-089 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-356 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-090 | Reminder ID | Unique identifier for Reminder | Reference | Required | VAL-357 | REM-8821 | Internal | BR-01 |
| DATA-090 | Name / Title | Primary descriptive label | Text | Required | VAL-358 | Standard Reminder | Public | BR-02 |
| DATA-090 | Status | Current lifecycle state | Enumeration | Required | VAL-359 | Active | Internal | BR-03 |
| DATA-090 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-360 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-091 | Digest ID | Unique identifier for Digest | Reference | Required | VAL-361 | DIG-8821 | Internal | BR-01 |
| DATA-091 | Name / Title | Primary descriptive label | Text | Required | VAL-362 | Standard Digest | Public | BR-02 |
| DATA-091 | Status | Current lifecycle state | Enumeration | Required | VAL-363 | Active | Internal | BR-03 |
| DATA-091 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-364 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-092 | Audit Log ID | Unique identifier for Audit Log | Reference | Required | VAL-365 | AUD-8821 | Internal | BR-01 |
| DATA-092 | Name / Title | Primary descriptive label | Text | Required | VAL-366 | Standard Audit Log | Public | BR-02 |
| DATA-092 | Status | Current lifecycle state | Enumeration | Required | VAL-367 | Active | Internal | BR-03 |
| DATA-092 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-368 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-093 | Access Log ID | Unique identifier for Access Log | Reference | Required | VAL-369 | ACC-8821 | Internal | BR-01 |
| DATA-093 | Name / Title | Primary descriptive label | Text | Required | VAL-370 | Standard Access Log | Public | BR-02 |
| DATA-093 | Status | Current lifecycle state | Enumeration | Required | VAL-371 | Active | Internal | BR-03 |
| DATA-093 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-372 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-094 | Change Record ID | Unique identifier for Change Record | Reference | Required | VAL-373 | CHA-8821 | Internal | BR-01 |
| DATA-094 | Name / Title | Primary descriptive label | Text | Required | VAL-374 | Standard Change Record | Public | BR-02 |
| DATA-094 | Status | Current lifecycle state | Enumeration | Required | VAL-375 | Active | Internal | BR-03 |
| DATA-094 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-376 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-095 | Error Log ID | Unique identifier for Error Log | Reference | Required | VAL-377 | ERR-8821 | Internal | BR-01 |
| DATA-095 | Name / Title | Primary descriptive label | Text | Required | VAL-378 | Standard Error Log | Public | BR-02 |
| DATA-095 | Status | Current lifecycle state | Enumeration | Required | VAL-379 | Active | Internal | BR-03 |
| DATA-095 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-380 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-096 | Compliance Report ID | Unique identifier for Compliance Report | Reference | Required | VAL-381 | COM-8821 | Internal | BR-01 |
| DATA-096 | Name / Title | Primary descriptive label | Text | Required | VAL-382 | Standard Compliance Report | Public | BR-02 |
| DATA-096 | Status | Current lifecycle state | Enumeration | Required | VAL-383 | Active | Internal | BR-03 |
| DATA-096 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-384 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-097 | Data Export Request ID | Unique identifier for Data Export Request | Reference | Required | VAL-385 | DAT-8821 | Internal | BR-01 |
| DATA-097 | Name / Title | Primary descriptive label | Text | Required | VAL-386 | Standard Data Export Request | Public | BR-02 |
| DATA-097 | Status | Current lifecycle state | Enumeration | Required | VAL-387 | Active | Internal | BR-03 |
| DATA-097 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-388 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-098 | Privacy Request ID | Unique identifier for Privacy Request | Reference | Required | VAL-389 | PRI-8821 | Internal | BR-01 |
| DATA-098 | Name / Title | Primary descriptive label | Text | Required | VAL-390 | Standard Privacy Request | Public | BR-02 |
| DATA-098 | Status | Current lifecycle state | Enumeration | Required | VAL-391 | Active | Internal | BR-03 |
| DATA-098 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-392 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-099 | Admin Action ID | Unique identifier for Admin Action | Reference | Required | VAL-393 | ADM-8821 | Internal | BR-01 |
| DATA-099 | Name / Title | Primary descriptive label | Text | Required | VAL-394 | Standard Admin Action | Public | BR-02 |
| DATA-099 | Status | Current lifecycle state | Enumeration | Required | VAL-395 | Active | Internal | BR-03 |
| DATA-099 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-396 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-100 | Login Event ID | Unique identifier for Login Event | Reference | Required | VAL-397 | LOG-8821 | Internal | BR-01 |
| DATA-100 | Name / Title | Primary descriptive label | Text | Required | VAL-398 | Standard Login Event | Public | BR-02 |
| DATA-100 | Status | Current lifecycle state | Enumeration | Required | VAL-399 | Active | Internal | BR-03 |
| DATA-100 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-400 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-101 | System Alert ID | Unique identifier for System Alert | Reference | Required | VAL-401 | SYS-8821 | Internal | BR-01 |
| DATA-101 | Name / Title | Primary descriptive label | Text | Required | VAL-402 | Standard System Alert | Public | BR-02 |
| DATA-101 | Status | Current lifecycle state | Enumeration | Required | VAL-403 | Active | Internal | BR-03 |
| DATA-101 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-404 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-102 | Analytics Snapshot ID | Unique identifier for Analytics Snapshot | Reference | Required | VAL-405 | ANA-8821 | Internal | BR-01 |
| DATA-102 | Name / Title | Primary descriptive label | Text | Required | VAL-406 | Standard Analytics Snapshot | Public | BR-02 |
| DATA-102 | Status | Current lifecycle state | Enumeration | Required | VAL-407 | Active | Internal | BR-03 |
| DATA-102 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-408 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-103 | Usage Metric ID | Unique identifier for Usage Metric | Reference | Required | VAL-409 | USA-8821 | Internal | BR-01 |
| DATA-103 | Name / Title | Primary descriptive label | Text | Required | VAL-410 | Standard Usage Metric | Public | BR-02 |
| DATA-103 | Status | Current lifecycle state | Enumeration | Required | VAL-411 | Active | Internal | BR-03 |
| DATA-103 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-412 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-104 | Performance Metric ID | Unique identifier for Performance Metric | Reference | Required | VAL-413 | PER-8821 | Internal | BR-01 |
| DATA-104 | Name / Title | Primary descriptive label | Text | Required | VAL-414 | Standard Performance Metric | Public | BR-02 |
| DATA-104 | Status | Current lifecycle state | Enumeration | Required | VAL-415 | Active | Internal | BR-03 |
| DATA-104 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-416 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-105 | Diversity Metric ID | Unique identifier for Diversity Metric | Reference | Required | VAL-417 | DIV-8821 | Internal | BR-01 |
| DATA-105 | Name / Title | Primary descriptive label | Text | Required | VAL-418 | Standard Diversity Metric | Public | BR-02 |
| DATA-105 | Status | Current lifecycle state | Enumeration | Required | VAL-419 | Active | Internal | BR-03 |
| DATA-105 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-420 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-106 | ROI Report ID | Unique identifier for ROI Report | Reference | Required | VAL-421 | ROI-8821 | Internal | BR-01 |
| DATA-106 | Name / Title | Primary descriptive label | Text | Required | VAL-422 | Standard ROI Report | Public | BR-02 |
| DATA-106 | Status | Current lifecycle state | Enumeration | Required | VAL-423 | Active | Internal | BR-03 |
| DATA-106 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-424 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-107 | Candidate Funnel ID | Unique identifier for Candidate Funnel | Reference | Required | VAL-425 | CAN-8821 | Internal | BR-01 |
| DATA-107 | Name / Title | Primary descriptive label | Text | Required | VAL-426 | Standard Candidate Funnel | Public | BR-02 |
| DATA-107 | Status | Current lifecycle state | Enumeration | Required | VAL-427 | Active | Internal | BR-03 |
| DATA-107 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-428 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-108 | Drop-off Rate ID | Unique identifier for Drop-off Rate | Reference | Required | VAL-429 | DRO-8821 | Internal | BR-01 |
| DATA-108 | Name / Title | Primary descriptive label | Text | Required | VAL-430 | Standard Drop-off Rate | Public | BR-02 |
| DATA-108 | Status | Current lifecycle state | Enumeration | Required | VAL-431 | Active | Internal | BR-03 |
| DATA-108 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-432 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-109 | Satisfaction Score ID | Unique identifier for Satisfaction Score | Reference | Required | VAL-433 | SAT-8821 | Internal | BR-01 |
| DATA-109 | Name / Title | Primary descriptive label | Text | Required | VAL-434 | Standard Satisfaction Score | Public | BR-02 |
| DATA-109 | Status | Current lifecycle state | Enumeration | Required | VAL-435 | Active | Internal | BR-03 |
| DATA-109 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-436 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-110 | Time-to-Hire ID | Unique identifier for Time-to-Hire | Reference | Required | VAL-437 | TIM-8821 | Internal | BR-01 |
| DATA-110 | Name / Title | Primary descriptive label | Text | Required | VAL-438 | Standard Time-to-Hire | Public | BR-02 |
| DATA-110 | Status | Current lifecycle state | Enumeration | Required | VAL-439 | Active | Internal | BR-03 |
| DATA-110 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-440 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-111 | Cost-per-Hire ID | Unique identifier for Cost-per-Hire | Reference | Required | VAL-441 | COS-8821 | Internal | BR-01 |
| DATA-111 | Name / Title | Primary descriptive label | Text | Required | VAL-442 | Standard Cost-per-Hire | Public | BR-02 |
| DATA-111 | Status | Current lifecycle state | Enumeration | Required | VAL-443 | Active | Internal | BR-03 |
| DATA-111 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-444 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-112 | System Configuration ID | Unique identifier for System Configuration | Reference | Required | VAL-445 | SYS-8821 | Internal | BR-01 |
| DATA-112 | Name / Title | Primary descriptive label | Text | Required | VAL-446 | Standard System Configuration | Public | BR-02 |
| DATA-112 | Status | Current lifecycle state | Enumeration | Required | VAL-447 | Active | Internal | BR-03 |
| DATA-112 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-448 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-113 | Localization Setting ID | Unique identifier for Localization Setting | Reference | Required | VAL-449 | LOC-8821 | Internal | BR-01 |
| DATA-113 | Name / Title | Primary descriptive label | Text | Required | VAL-450 | Standard Localization Setting | Public | BR-02 |
| DATA-113 | Status | Current lifecycle state | Enumeration | Required | VAL-451 | Active | Internal | BR-03 |
| DATA-113 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-452 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-114 | API Key ID | Unique identifier for API Key | Reference | Required | VAL-453 | API-8821 | Internal | BR-01 |
| DATA-114 | Name / Title | Primary descriptive label | Text | Required | VAL-454 | Standard API Key | Public | BR-02 |
| DATA-114 | Status | Current lifecycle state | Enumeration | Required | VAL-455 | Active | Internal | BR-03 |
| DATA-114 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-456 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-115 | Webhook ID | Unique identifier for Webhook | Reference | Required | VAL-457 | WEB-8821 | Internal | BR-01 |
| DATA-115 | Name / Title | Primary descriptive label | Text | Required | VAL-458 | Standard Webhook | Public | BR-02 |
| DATA-115 | Status | Current lifecycle state | Enumeration | Required | VAL-459 | Active | Internal | BR-03 |
| DATA-115 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-460 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-116 | Integration Profile ID | Unique identifier for Integration Profile | Reference | Required | VAL-461 | INT-8821 | Internal | BR-01 |
| DATA-116 | Name / Title | Primary descriptive label | Text | Required | VAL-462 | Standard Integration Profile | Public | BR-02 |
| DATA-116 | Status | Current lifecycle state | Enumeration | Required | VAL-463 | Active | Internal | BR-03 |
| DATA-116 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-464 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-117 | Business Rule Config ID | Unique identifier for Business Rule Config | Reference | Required | VAL-465 | BUS-8821 | Internal | BR-01 |
| DATA-117 | Name / Title | Primary descriptive label | Text | Required | VAL-466 | Standard Business Rule Config | Public | BR-02 |
| DATA-117 | Status | Current lifecycle state | Enumeration | Required | VAL-467 | Active | Internal | BR-03 |
| DATA-117 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-468 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-118 | Feature Flag ID | Unique identifier for Feature Flag | Reference | Required | VAL-469 | FEA-8821 | Internal | BR-01 |
| DATA-118 | Name / Title | Primary descriptive label | Text | Required | VAL-470 | Standard Feature Flag | Public | BR-02 |
| DATA-118 | Status | Current lifecycle state | Enumeration | Required | VAL-471 | Active | Internal | BR-03 |
| DATA-118 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-472 | 2026-07-09T10:00:00Z | Internal | BR-04 |
| DATA-119 | Maintenance Window ID | Unique identifier for Maintenance Window | Reference | Required | VAL-473 | MAI-8821 | Internal | BR-01 |
| DATA-119 | Name / Title | Primary descriptive label | Text | Required | VAL-474 | Standard Maintenance Window | Public | BR-02 |
| DATA-119 | Status | Current lifecycle state | Enumeration | Required | VAL-475 | Active | Internal | BR-03 |
| DATA-119 | Created Date | Timestamp of instantiation | DateTime | Required | VAL-476 | 2026-07-09T10:00:00Z | Internal | BR-04 |


## 6. Master Data
Master Data represents the core business entities that are shared across multiple business processes and domains.
### Master Data Entities
- **User / Candidate / Employer:** Core identity and profile records.
- **Company:** Enterprise client registry.
- **Skill Taxonomy:** Standardized dictionary of skills and competencies.
- **Interview Template:** Standardized rubric and question structures.
### Governance & Ownership
- **Ownership:** Managed by respective Domain Owners (e.g., VP of HR for Skills).
- **Update Frequency:** Slow-moving; changes require Data Steward approval.
- **Versioning:** Strict version control (e.g., Skill Taxonomy v2.1).
- **Consumers:** Referenced universally by Transactional Data.

## 7. Transactional Data
Transactional data represents business events that occur at a specific point in time.
- **Interview Session:** Captures the real-time execution of an interview.
- **Assessment Submission:** Captures code execution and test results.
- **Payment Transaction:** Captures billing and financial events.
- **Audit Event:** Captures user and system actions for compliance.

## 8. Reference Data
Static or highly stable data used to categorize other data.
- **Geographical:** Countries, Regions, Time Zones.
- **Financial:** Currencies, Tax Rates.
- **System:** Languages, Status Codes, Error Codes.
- **Business:** Job Levels (Junior, Mid, Senior), Industries, Skill Categories.

## 9. Data Relationships
Logical relationships mapping the business process flow:
- A **Company** employs multiple **Recruiters** and owns multiple **Campaigns**.
- A **Campaign** contains multiple **Job Postings** and aggregates a **Talent Pool**.
- A **Candidate** maintains one **Profile** and submits multiple **Applications**.
- An **Application** proceeds through a **Pipeline Stage** and triggers an **Interview** or **Assessment**.
- An **Interview** utilizes a **Rubric** and produces a **Recording**, **Transcript**, and **Feedback**.
- An **Assessment** executes **Test Cases** and generates a **Score** and **Skill Gap** report.
- A **Skill Gap** recommends a **Roadmap** containing multiple **Learning Modules**.

## 10. Data Validation Rules
Business validation rules ensure data integrity before persistence.
| Rule ID | Rule Name | Description | Error Message | Trigger | Enforcement Level |
|---|---|---|---|---|---|
| VAL-001 | User Completeness | Mandatory fields for User must be populated. | Missing required User fields. | On Save | Strict Block |
| VAL-002 | Role Completeness | Mandatory fields for Role must be populated. | Missing required Role fields. | On Save | Strict Block |
| VAL-003 | Permission Completeness | Mandatory fields for Permission must be populated. | Missing required Permission fields. | On Save | Strict Block |
| VAL-004 | Session Completeness | Mandatory fields for Session must be populated. | Missing required Session fields. | On Save | Strict Block |
| VAL-005 | MFA Token Completeness | Mandatory fields for MFA Token must be populated. | Missing required MFA Token fields. | On Save | Strict Block |
| VAL-006 | Consent Record Completeness | Mandatory fields for Consent Record must be populated. | Missing required Consent Record fields. | On Save | Strict Block |
| VAL-007 | Identity Verification Completeness | Mandatory fields for Identity Verification must be populated. | Missing required Identity Verification fields. | On Save | Strict Block |
| VAL-008 | Security Profile Completeness | Mandatory fields for Security Profile must be populated. | Missing required Security Profile fields. | On Save | Strict Block |
| VAL-009 | SSO Configuration Completeness | Mandatory fields for SSO Configuration must be populated. | Missing required SSO Configuration fields. | On Save | Strict Block |
| VAL-010 | Password History Completeness | Mandatory fields for Password History must be populated. | Missing required Password History fields. | On Save | Strict Block |
| VAL-011 | Candidate Completeness | Mandatory fields for Candidate must be populated. | Missing required Candidate fields. | On Save | Strict Block |
| VAL-012 | Profile Completeness | Mandatory fields for Profile must be populated. | Missing required Profile fields. | On Save | Strict Block |
| VAL-013 | Education Completeness | Mandatory fields for Education must be populated. | Missing required Education fields. | On Save | Strict Block |
| VAL-014 | Experience Completeness | Mandatory fields for Experience must be populated. | Missing required Experience fields. | On Save | Strict Block |
| VAL-015 | Skill Claim Completeness | Mandatory fields for Skill Claim must be populated. | Missing required Skill Claim fields. | On Save | Strict Block |
| VAL-016 | Certification Completeness | Mandatory fields for Certification must be populated. | Missing required Certification fields. | On Save | Strict Block |
| VAL-017 | Career Goal Completeness | Mandatory fields for Career Goal must be populated. | Missing required Career Goal fields. | On Save | Strict Block |
| VAL-018 | Language Proficiency Completeness | Mandatory fields for Language Proficiency must be populated. | Missing required Language Proficiency fields. | On Save | Strict Block |
| VAL-019 | Portfolio Item Completeness | Mandatory fields for Portfolio Item must be populated. | Missing required Portfolio Item fields. | On Save | Strict Block |
| VAL-020 | Availability Completeness | Mandatory fields for Availability must be populated. | Missing required Availability fields. | On Save | Strict Block |
| VAL-021 | Employer Completeness | Mandatory fields for Employer must be populated. | Missing required Employer fields. | On Save | Strict Block |
| VAL-022 | Company Completeness | Mandatory fields for Company must be populated. | Missing required Company fields. | On Save | Strict Block |
| VAL-023 | Department Completeness | Mandatory fields for Department must be populated. | Missing required Department fields. | On Save | Strict Block |
| VAL-024 | Team Completeness | Mandatory fields for Team must be populated. | Missing required Team fields. | On Save | Strict Block |
| VAL-025 | Recruiter Completeness | Mandatory fields for Recruiter must be populated. | Missing required Recruiter fields. | On Save | Strict Block |
| VAL-026 | Hiring Manager Completeness | Mandatory fields for Hiring Manager must be populated. | Missing required Hiring Manager fields. | On Save | Strict Block |
| VAL-027 | Billing Profile Completeness | Mandatory fields for Billing Profile must be populated. | Missing required Billing Profile fields. | On Save | Strict Block |
| VAL-028 | Subscription Completeness | Mandatory fields for Subscription must be populated. | Missing required Subscription fields. | On Save | Strict Block |
| VAL-029 | Company Address Completeness | Mandatory fields for Company Address must be populated. | Missing required Company Address fields. | On Save | Strict Block |
| VAL-030 | Employer Setting Completeness | Mandatory fields for Employer Setting must be populated. | Missing required Employer Setting fields. | On Save | Strict Block |
| VAL-031 | Job Posting Completeness | Mandatory fields for Job Posting must be populated. | Missing required Job Posting fields. | On Save | Strict Block |
| VAL-032 | Campaign Completeness | Mandatory fields for Campaign must be populated. | Missing required Campaign fields. | On Save | Strict Block |
| VAL-033 | Application Completeness | Mandatory fields for Application must be populated. | Missing required Application fields. | On Save | Strict Block |
| VAL-034 | Talent Pool Completeness | Mandatory fields for Talent Pool must be populated. | Missing required Talent Pool fields. | On Save | Strict Block |
| VAL-035 | Offer Completeness | Mandatory fields for Offer must be populated. | Missing required Offer fields. | On Save | Strict Block |
| VAL-036 | Pipeline Stage Completeness | Mandatory fields for Pipeline Stage must be populated. | Missing required Pipeline Stage fields. | On Save | Strict Block |
| VAL-037 | Sourcing Channel Completeness | Mandatory fields for Sourcing Channel must be populated. | Missing required Sourcing Channel fields. | On Save | Strict Block |
| VAL-038 | Referral Completeness | Mandatory fields for Referral must be populated. | Missing required Referral fields. | On Save | Strict Block |
| VAL-039 | Screening Form Completeness | Mandatory fields for Screening Form must be populated. | Missing required Screening Form fields. | On Save | Strict Block |
| VAL-040 | Shortlist Completeness | Mandatory fields for Shortlist must be populated. | Missing required Shortlist fields. | On Save | Strict Block |
| VAL-041 | Interview Completeness | Mandatory fields for Interview must be populated. | Missing required Interview fields. | On Save | Strict Block |
| VAL-042 | Session Completeness | Mandatory fields for Session must be populated. | Missing required Session fields. | On Save | Strict Block |
| VAL-043 | Question Completeness | Mandatory fields for Question must be populated. | Missing required Question fields. | On Save | Strict Block |
| VAL-044 | Answer Completeness | Mandatory fields for Answer must be populated. | Missing required Answer fields. | On Save | Strict Block |
| VAL-045 | Rubric Completeness | Mandatory fields for Rubric must be populated. | Missing required Rubric fields. | On Save | Strict Block |
| VAL-046 | Recording Completeness | Mandatory fields for Recording must be populated. | Missing required Recording fields. | On Save | Strict Block |
| VAL-047 | Transcript Completeness | Mandatory fields for Transcript must be populated. | Missing required Transcript fields. | On Save | Strict Block |
| VAL-048 | Interviewer Completeness | Mandatory fields for Interviewer must be populated. | Missing required Interviewer fields. | On Save | Strict Block |
| VAL-049 | Feedback Completeness | Mandatory fields for Feedback must be populated. | Missing required Feedback fields. | On Save | Strict Block |
| VAL-050 | Rating Completeness | Mandatory fields for Rating must be populated. | Missing required Rating fields. | On Save | Strict Block |
| VAL-051 | Interview Template Completeness | Mandatory fields for Interview Template must be populated. | Missing required Interview Template fields. | On Save | Strict Block |
| VAL-052 | Assessment Completeness | Mandatory fields for Assessment must be populated. | Missing required Assessment fields. | On Save | Strict Block |
| VAL-053 | Test Case Completeness | Mandatory fields for Test Case must be populated. | Missing required Test Case fields. | On Save | Strict Block |
| VAL-054 | Submission Completeness | Mandatory fields for Submission must be populated. | Missing required Submission fields. | On Save | Strict Block |
| VAL-055 | Score Completeness | Mandatory fields for Score must be populated. | Missing required Score fields. | On Save | Strict Block |
| VAL-056 | Skill Gap Completeness | Mandatory fields for Skill Gap must be populated. | Missing required Skill Gap fields. | On Save | Strict Block |
| VAL-057 | Proctoring Log Completeness | Mandatory fields for Proctoring Log must be populated. | Missing required Proctoring Log fields. | On Save | Strict Block |
| VAL-058 | Code Execution Result Completeness | Mandatory fields for Code Execution Result must be populated. | Missing required Code Execution Result fields. | On Save | Strict Block |
| VAL-059 | Plagiarism Report Completeness | Mandatory fields for Plagiarism Report must be populated. | Missing required Plagiarism Report fields. | On Save | Strict Block |
| VAL-060 | Question Bank Completeness | Mandatory fields for Question Bank must be populated. | Missing required Question Bank fields. | On Save | Strict Block |
| VAL-061 | Assessment Template Completeness | Mandatory fields for Assessment Template must be populated. | Missing required Assessment Template fields. | On Save | Strict Block |
| VAL-062 | Roadmap Completeness | Mandatory fields for Roadmap must be populated. | Missing required Roadmap fields. | On Save | Strict Block |
| VAL-063 | Module Completeness | Mandatory fields for Module must be populated. | Missing required Module fields. | On Save | Strict Block |
| VAL-064 | Course Completeness | Mandatory fields for Course must be populated. | Missing required Course fields. | On Save | Strict Block |
| VAL-065 | Lesson Completeness | Mandatory fields for Lesson must be populated. | Missing required Lesson fields. | On Save | Strict Block |
| VAL-066 | Progress Completeness | Mandatory fields for Progress must be populated. | Missing required Progress fields. | On Save | Strict Block |
| VAL-067 | Certificate Completeness | Mandatory fields for Certificate must be populated. | Missing required Certificate fields. | On Save | Strict Block |
| VAL-068 | Badge Completeness | Mandatory fields for Badge must be populated. | Missing required Badge fields. | On Save | Strict Block |
| VAL-069 | Recommendation Completeness | Mandatory fields for Recommendation must be populated. | Missing required Recommendation fields. | On Save | Strict Block |
| VAL-070 | Content Resource Completeness | Mandatory fields for Content Resource must be populated. | Missing required Content Resource fields. | On Save | Strict Block |
| VAL-071 | Learning Path Completeness | Mandatory fields for Learning Path must be populated. | Missing required Learning Path fields. | On Save | Strict Block |
| VAL-072 | Transaction Completeness | Mandatory fields for Transaction must be populated. | Missing required Transaction fields. | On Save | Strict Block |
| VAL-073 | Invoice Completeness | Mandatory fields for Invoice must be populated. | Missing required Invoice fields. | On Save | Strict Block |
| VAL-074 | Credit Balance Completeness | Mandatory fields for Credit Balance must be populated. | Missing required Credit Balance fields. | On Save | Strict Block |
| VAL-075 | Plan Completeness | Mandatory fields for Plan must be populated. | Missing required Plan fields. | On Save | Strict Block |
| VAL-076 | Discount Completeness | Mandatory fields for Discount must be populated. | Missing required Discount fields. | On Save | Strict Block |
| VAL-077 | Tax Record Completeness | Mandatory fields for Tax Record must be populated. | Missing required Tax Record fields. | On Save | Strict Block |
| VAL-078 | Refund Completeness | Mandatory fields for Refund must be populated. | Missing required Refund fields. | On Save | Strict Block |
| VAL-079 | Payment Method Completeness | Mandatory fields for Payment Method must be populated. | Missing required Payment Method fields. | On Save | Strict Block |
| VAL-080 | Billing Cycle Completeness | Mandatory fields for Billing Cycle must be populated. | Missing required Billing Cycle fields. | On Save | Strict Block |
| VAL-081 | Receipt Completeness | Mandatory fields for Receipt must be populated. | Missing required Receipt fields. | On Save | Strict Block |
| VAL-082 | Notification Completeness | Mandatory fields for Notification must be populated. | Missing required Notification fields. | On Save | Strict Block |
| VAL-083 | Email Template Completeness | Mandatory fields for Email Template must be populated. | Missing required Email Template fields. | On Save | Strict Block |
| VAL-084 | SMS Log Completeness | Mandatory fields for SMS Log must be populated. | Missing required SMS Log fields. | On Save | Strict Block |
| VAL-085 | In-App Message Completeness | Mandatory fields for In-App Message must be populated. | Missing required In-App Message fields. | On Save | Strict Block |
| VAL-086 | Push Notification Completeness | Mandatory fields for Push Notification must be populated. | Missing required Push Notification fields. | On Save | Strict Block |
| VAL-087 | Delivery Status Completeness | Mandatory fields for Delivery Status must be populated. | Missing required Delivery Status fields. | On Save | Strict Block |
| VAL-088 | Subscription Preference Completeness | Mandatory fields for Subscription Preference must be populated. | Missing required Subscription Preference fields. | On Save | Strict Block |
| VAL-089 | Alert Completeness | Mandatory fields for Alert must be populated. | Missing required Alert fields. | On Save | Strict Block |
| VAL-090 | Reminder Completeness | Mandatory fields for Reminder must be populated. | Missing required Reminder fields. | On Save | Strict Block |
| VAL-091 | Digest Completeness | Mandatory fields for Digest must be populated. | Missing required Digest fields. | On Save | Strict Block |
| VAL-092 | Audit Log Completeness | Mandatory fields for Audit Log must be populated. | Missing required Audit Log fields. | On Save | Strict Block |
| VAL-093 | Access Log Completeness | Mandatory fields for Access Log must be populated. | Missing required Access Log fields. | On Save | Strict Block |
| VAL-094 | Change Record Completeness | Mandatory fields for Change Record must be populated. | Missing required Change Record fields. | On Save | Strict Block |
| VAL-095 | Error Log Completeness | Mandatory fields for Error Log must be populated. | Missing required Error Log fields. | On Save | Strict Block |
| VAL-096 | Compliance Report Completeness | Mandatory fields for Compliance Report must be populated. | Missing required Compliance Report fields. | On Save | Strict Block |
| VAL-097 | Data Export Request Completeness | Mandatory fields for Data Export Request must be populated. | Missing required Data Export Request fields. | On Save | Strict Block |
| VAL-098 | Privacy Request Completeness | Mandatory fields for Privacy Request must be populated. | Missing required Privacy Request fields. | On Save | Strict Block |
| VAL-099 | Admin Action Completeness | Mandatory fields for Admin Action must be populated. | Missing required Admin Action fields. | On Save | Strict Block |
| VAL-100 | Login Event Completeness | Mandatory fields for Login Event must be populated. | Missing required Login Event fields. | On Save | Strict Block |
| VAL-101 | System Alert Completeness | Mandatory fields for System Alert must be populated. | Missing required System Alert fields. | On Save | Strict Block |
| VAL-102 | Analytics Snapshot Completeness | Mandatory fields for Analytics Snapshot must be populated. | Missing required Analytics Snapshot fields. | On Save | Strict Block |
| VAL-103 | Usage Metric Completeness | Mandatory fields for Usage Metric must be populated. | Missing required Usage Metric fields. | On Save | Strict Block |
| VAL-104 | Performance Metric Completeness | Mandatory fields for Performance Metric must be populated. | Missing required Performance Metric fields. | On Save | Strict Block |
| VAL-105 | Diversity Metric Completeness | Mandatory fields for Diversity Metric must be populated. | Missing required Diversity Metric fields. | On Save | Strict Block |
| VAL-106 | ROI Report Completeness | Mandatory fields for ROI Report must be populated. | Missing required ROI Report fields. | On Save | Strict Block |
| VAL-107 | Candidate Funnel Completeness | Mandatory fields for Candidate Funnel must be populated. | Missing required Candidate Funnel fields. | On Save | Strict Block |
| VAL-108 | Drop-off Rate Completeness | Mandatory fields for Drop-off Rate must be populated. | Missing required Drop-off Rate fields. | On Save | Strict Block |
| VAL-109 | Satisfaction Score Completeness | Mandatory fields for Satisfaction Score must be populated. | Missing required Satisfaction Score fields. | On Save | Strict Block |
| VAL-110 | Time-to-Hire Completeness | Mandatory fields for Time-to-Hire must be populated. | Missing required Time-to-Hire fields. | On Save | Strict Block |
| VAL-111 | Cost-per-Hire Completeness | Mandatory fields for Cost-per-Hire must be populated. | Missing required Cost-per-Hire fields. | On Save | Strict Block |
| VAL-112 | System Configuration Completeness | Mandatory fields for System Configuration must be populated. | Missing required System Configuration fields. | On Save | Strict Block |
| VAL-113 | Localization Setting Completeness | Mandatory fields for Localization Setting must be populated. | Missing required Localization Setting fields. | On Save | Strict Block |
| VAL-114 | API Key Completeness | Mandatory fields for API Key must be populated. | Missing required API Key fields. | On Save | Strict Block |
| VAL-115 | Webhook Completeness | Mandatory fields for Webhook must be populated. | Missing required Webhook fields. | On Save | Strict Block |
| VAL-116 | Integration Profile Completeness | Mandatory fields for Integration Profile must be populated. | Missing required Integration Profile fields. | On Save | Strict Block |
| VAL-117 | Business Rule Config Completeness | Mandatory fields for Business Rule Config must be populated. | Missing required Business Rule Config fields. | On Save | Strict Block |
| VAL-118 | Feature Flag Completeness | Mandatory fields for Feature Flag must be populated. | Missing required Feature Flag fields. | On Save | Strict Block |
| VAL-119 | Maintenance Window Completeness | Mandatory fields for Maintenance Window must be populated. | Missing required Maintenance Window fields. | On Save | Strict Block |


## 11. Data Lifecycle
Standard lifecycle stages for business data objects:
1. **Creation:** Data is captured via user input, API, or system generation.
2. **Validation:** System validates against Business Rules and Data Type constraints.
3. **Active:** Data is readily available for transactions and reporting.
4. **Archived:** Data is moved to cold storage after the operational retention period.
5. **Purge/Deletion:** Data is permanently destroyed per the Deletion Policy and GDPR compliance.

## 12. Data Classification
| Classification Level | Description | Examples |
|---|---|---|
| **Public** | Data freely accessible to the public. | Job Postings, Public Company Profiles |
| **Internal** | Data restricted to internal employees. | System Configurations, Aggregate Analytics |
| **Confidential** | Proprietary business data. | Interview Rubrics, Assessment Question Banks |
| **Restricted (PII)** | Personally Identifiable Information. | Candidate Resumes, Contact Details, Interview Transcripts |
| **Financial** | Billing and transaction records. | Invoices, Payment Methods, Credit Balances |

## 13. Data Security Requirements
- **Ownership & Access Control:** Role-Based Access Control (RBAC) enforced across all domains. Strict segregation between Employer data and Candidate data.
- **Encryption Requirements:** AES-256 for data at rest. TLS 1.3 for data in transit.
- **Data Masking:** PII and Financial data must be masked in non-production environments and analytics dashboards.
- **Backup & Recovery:** Daily encrypted backups with a 30-day rolling retention and cross-region replication.

## 14. Data Governance
- **Data Owner:** Executive accountable for data domain accuracy (e.g., VP of HR).
- **Data Steward:** Operational manager responsible for day-to-day data quality.
- **Custodian:** IT/Platform team responsible for storage, security, and technical architecture.
- **Metadata Management:** All objects and attributes must be registered in the central Metadata Registry (ISO 11179 compliance).
- **Lineage & Traceability:** Systems must track the origin and transformation history of critical data (e.g., Assessment Scores).

## 15. Data Quality Requirements
| Metric ID | Dimension | Description | Measurement Method | Target | Frequency | Owner |
|---|---|---|---|---|---|---|
| DQM-001 | Completeness | Essential fields in Identity Data are not null. | Automated Profiling | >98% | Daily | CISO |
| DQM-002 | Accuracy | Values in Identity Data reflect real-world state. | Sample Audit | >95% | Monthly | CISO |
| DQM-003 | Uniqueness | No duplicated core entities in Identity Data. | Deduplication Engine | 100% | Real-time | CISO |
| DQM-004 | Validity | Identity Data values conform to defined reference data. | Constraint Check | 100% | Real-time | CISO |
| DQM-005 | Completeness | Essential fields in Candidate Data are not null. | Automated Profiling | >98% | Daily | VP of HR |
| DQM-006 | Accuracy | Values in Candidate Data reflect real-world state. | Sample Audit | >95% | Monthly | VP of HR |
| DQM-007 | Uniqueness | No duplicated core entities in Candidate Data. | Deduplication Engine | 100% | Real-time | VP of HR |
| DQM-008 | Validity | Candidate Data values conform to defined reference data. | Constraint Check | 100% | Real-time | VP of HR |
| DQM-009 | Completeness | Essential fields in Employer Data are not null. | Automated Profiling | >98% | Daily | VP of Sales |
| DQM-010 | Accuracy | Values in Employer Data reflect real-world state. | Sample Audit | >95% | Monthly | VP of Sales |
| DQM-011 | Uniqueness | No duplicated core entities in Employer Data. | Deduplication Engine | 100% | Real-time | VP of Sales |
| DQM-012 | Validity | Employer Data values conform to defined reference data. | Constraint Check | 100% | Real-time | VP of Sales |
| DQM-013 | Completeness | Essential fields in Recruitment Data are not null. | Automated Profiling | >98% | Daily | VP of Recruitment |
| DQM-014 | Accuracy | Values in Recruitment Data reflect real-world state. | Sample Audit | >95% | Monthly | VP of Recruitment |
| DQM-015 | Uniqueness | No duplicated core entities in Recruitment Data. | Deduplication Engine | 100% | Real-time | VP of Recruitment |
| DQM-016 | Validity | Recruitment Data values conform to defined reference data. | Constraint Check | 100% | Real-time | VP of Recruitment |
| DQM-017 | Completeness | Essential fields in Interview Data are not null. | Automated Profiling | >98% | Daily | VP of Product |
| DQM-018 | Accuracy | Values in Interview Data reflect real-world state. | Sample Audit | >95% | Monthly | VP of Product |
| DQM-019 | Uniqueness | No duplicated core entities in Interview Data. | Deduplication Engine | 100% | Real-time | VP of Product |
| DQM-020 | Validity | Interview Data values conform to defined reference data. | Constraint Check | 100% | Real-time | VP of Product |
| DQM-021 | Completeness | Essential fields in Assessment Data are not null. | Automated Profiling | >98% | Daily | VP of Product |
| DQM-022 | Accuracy | Values in Assessment Data reflect real-world state. | Sample Audit | >95% | Monthly | VP of Product |
| DQM-023 | Uniqueness | No duplicated core entities in Assessment Data. | Deduplication Engine | 100% | Real-time | VP of Product |
| DQM-024 | Validity | Assessment Data values conform to defined reference data. | Constraint Check | 100% | Real-time | VP of Product |
| DQM-025 | Completeness | Essential fields in Learning Data are not null. | Automated Profiling | >98% | Daily | Chief Learning Officer |
| DQM-026 | Accuracy | Values in Learning Data reflect real-world state. | Sample Audit | >95% | Monthly | Chief Learning Officer |
| DQM-027 | Uniqueness | No duplicated core entities in Learning Data. | Deduplication Engine | 100% | Real-time | Chief Learning Officer |
| DQM-028 | Validity | Learning Data values conform to defined reference data. | Constraint Check | 100% | Real-time | Chief Learning Officer |
| DQM-029 | Completeness | Essential fields in Payment Data are not null. | Automated Profiling | >98% | Daily | CFO |
| DQM-030 | Accuracy | Values in Payment Data reflect real-world state. | Sample Audit | >95% | Monthly | CFO |
| DQM-031 | Uniqueness | No duplicated core entities in Payment Data. | Deduplication Engine | 100% | Real-time | CFO |
| DQM-032 | Validity | Payment Data values conform to defined reference data. | Constraint Check | 100% | Real-time | CFO |
| DQM-033 | Completeness | Essential fields in Notification Data are not null. | Automated Profiling | >98% | Daily | VP of Product |
| DQM-034 | Accuracy | Values in Notification Data reflect real-world state. | Sample Audit | >95% | Monthly | VP of Product |
| DQM-035 | Uniqueness | No duplicated core entities in Notification Data. | Deduplication Engine | 100% | Real-time | VP of Product |
| DQM-036 | Validity | Notification Data values conform to defined reference data. | Constraint Check | 100% | Real-time | VP of Product |
| DQM-037 | Completeness | Essential fields in Audit Data are not null. | Automated Profiling | >98% | Daily | Data Protection Officer |
| DQM-038 | Accuracy | Values in Audit Data reflect real-world state. | Sample Audit | >95% | Monthly | Data Protection Officer |
| DQM-039 | Uniqueness | No duplicated core entities in Audit Data. | Deduplication Engine | 100% | Real-time | Data Protection Officer |
| DQM-040 | Validity | Audit Data values conform to defined reference data. | Constraint Check | 100% | Real-time | Data Protection Officer |
| DQM-041 | Completeness | Essential fields in Analytics Data are not null. | Automated Profiling | >98% | Daily | CDO |
| DQM-042 | Accuracy | Values in Analytics Data reflect real-world state. | Sample Audit | >95% | Monthly | CDO |
| DQM-043 | Uniqueness | No duplicated core entities in Analytics Data. | Deduplication Engine | 100% | Real-time | CDO |
| DQM-044 | Validity | Analytics Data values conform to defined reference data. | Constraint Check | 100% | Real-time | CDO |
| DQM-045 | Completeness | Essential fields in System Configuration Data are not null. | Automated Profiling | >98% | Daily | CTO |
| DQM-046 | Accuracy | Values in System Configuration Data reflect real-world state. | Sample Audit | >95% | Monthly | CTO |
| DQM-047 | Uniqueness | No duplicated core entities in System Configuration Data. | Deduplication Engine | 100% | Real-time | CTO |
| DQM-048 | Validity | System Configuration Data values conform to defined reference data. | Constraint Check | 100% | Real-time | CTO |


## 16. Data Retention Policy
| Data Object Category | Operational Retention | Archive Policy | Deletion/Purge Policy | Legal Basis |
|---|---|---|---|---|
| Candidate Profile | Active + 2 Years | Archive after 1 year of inactivity | Purge after 2 years unless renewed | GDPR Art. 6 (Consent) |
| Interview Recording | 6 Months | Archive after 30 days | Purge after 6 months | Legitimate Interest |
| Assessment Results | 3 Years | Archive after 1 year | Purge after 3 years | Legitimate Interest |
| Payment / Invoice | 7 Years | Archive after 1 year | Purge after 7 years | Legal / Tax Compliance |
| Audit Logs | 1 Year | Archive after 3 months | Purge after 1 year | Security Compliance |
| Support Tickets | 3 Years | Archive after 6 months | Purge after 3 years | Contractual Obligation |

## 17. Reporting Data
Aggregated datasets designed explicitly for analytics and dashboards:
- **Candidate Analytics:** Skill growth trends, assessment pass rates.
- **Employer Analytics:** Time-to-hire, cost-per-hire, campaign ROI, interview conversion rates.
- **Operational Dashboard:** System uptime, concurrent users, API usage.
- **Compliance Reports:** PII deletion receipts, consent logs, access audits.

## 18. Data Traceability Matrix
| Requirement ID | Business Process | Logical Data Object | Functional Req | Business Rule | Report | User Role |
|---|---|---|---|---|---|---|
| BR-001 | Candidate Registration | Candidate Profile | FR-USR-01 | VAL-002 (Unique Email) | User Growth | Candidate |
| BR-002 | Job Campaign Setup | Campaign, Job Posting | FR-EMP-04 | VAL-012 (Budget Valid) | Campaign ROI | Recruiter |
| BR-003 | AI Video Interview | Interview, Recording | FR-INT-02 | VAL-045 (Format Valid) | Interview Funnel | System, Recruiter |
| BR-004 | Technical Assessment | Assessment, Score | FR-ASM-01 | VAL-056 (Score Bounds) | Skill Gap | Candidate, Manager |
| BR-005 | Invoice Generation | Invoice, Transaction | FR-FIN-03 | VAL-088 (Valid Amount) | Monthly Revenue | Finance Admin |

## 19. Data Risks
| Risk ID | Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|---|
| RISK-D-01 | Data Loss during migration/processing | High | Low | Automated daily backups, point-in-time recovery. |
| RISK-D-02 | Privacy Breach (PII exposure) | Critical | Low | Encryption at rest/transit, strict RBAC, data masking. |
| RISK-D-03 | Inconsistent Master Data | Medium | Medium | Implement Master Data Management (MDM) and strict validation. |
| RISK-D-04 | Retention Policy Violations | High | Low | Automated purge jobs linked to metadata retention tags. |
| RISK-D-05 | Poor Candidate Data Quality | Medium | High | Enforce mandatory fields, regex validation, email verification. |
| RISK-D-06 | Unauthorized AI Bias Data Manipulation | High | Low | Immutable audit logs on all AI rubric updates. |

## 20. Future Data Expansion
The data architecture is designed to support the following future capabilities:
- **Multi-Tenant Support:** Seamless physical data isolation for enterprise clients with strict compliance needs.
- **Data Lake Integration:** Exporting unstructured data (video, code snippets) to a Data Lake for long-term ML model training.
- **External ATS Integration:** Standardized HR-XML and JSON schemas to push/pull Candidate Data to Workday, Greenhouse, etc.
- **Predictive Analytics:** Introducing multi-variant statistical datasets for candidate success prediction modeling.

## 21. Summary
This Data Requirements Specification establishes a rigorous, logical framework for the AI-powered Interview & Skill Assessment System. By defining exactly 120 logical business entities across 12 domains, along with strict validation rules, data quality metrics, and governance policies, this architecture ensures high data integrity, strict GDPR compliance, and scalable operations for enterprise usage.

