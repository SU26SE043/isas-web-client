# 08_Business_Rules.md

## 1. Document Purpose

### 1.1 Purpose
This Business Rules Specification (BRS) establishes the definitive set of operational policies, constraints, validations, decision logic, and governance structures controlling the AI-powered Interview & Skill Assessment System (ISAS). It acts as the operational constitution of the platform, formalizing how business concepts interact, enforcing regulatory compliance, and protecting organizational integrity.

### 1.2 Scope
This document covers all core functional areas of the ISAS enterprise ecosystem, including but not limited to Multi-Factor Authentication, Multi-Tenant Account Management, Advanced CV & Candidate Profile Management, Automated Campaign Lifecycles, Multi-currency Subscriptions, AI-driven Synchronous/Asynchronous Interviewing, Real-time Cheating and Fraud Detection, Weighted AI Skill Assessments, Dynamic Learning Roadmap generation, Cryptographically Verified Digital Certificates, and Enterprise Compliance Frameworks. It excludes any technical implementation details such as UI/UX components, specific database indexing, API routing structures, or low-level cloud infrastructure definitions.

### 1.3 Intended Audience
This document is designed for stakeholders across the enterprise lifecycle:
*   **Product Owners and Senior Business Analysts:** To validate operational alignment and evaluate change requests.
*   **Enterprise Solution Architects and Developers:** To build deterministic software architectures that accurately reflect organizational constraints.
*   **Quality Assurance Engineers:** To design automated test cases, validation scripts, and compliance checklists.
*   **Compliance and Legal Officers:** To audit adherence to global data privacy laws (GDPR, CCPA), security protocols, and fair-hiring standards.

### 1.4 Relationship with Business Requirements Document (BRD)
While the BRD outlines *what* the high-level goals and capabilities of the platform are, the BRS formalizes *how* those goals are systematically bounded. The BRD states the business desire for automated candidate screening; this BRS defines the exact structural conditions, algorithmic thresholds, and hard constraints under which that screening must operate.

### 1.5 Relationship with Functional Requirements
Functional requirements define the software actions and user interactions. This BRS provides the underlying logical foundations that those functional requirements must invoke. A functional requirement specifies that a user can click a "Submit Payment" button; the corresponding business rule defines whether the credit calculation, tier limits, and invoice generation criteria are met prior to executing that software function.

### 1.6 Importance of Business Rules
Business rules preserve organizational intelligence, enforce operational consistency across distributed environments, minimize compliance risk, and enable automated decision-making. By decoupling business logic from code, the organization ensures agility, auditability, and absolute deterministic behavior of its automated AI engines.

---

## 2. Business Rules Overview

### 2.1 Definition of Business Rules
As aligned with the Semantics of Business Vocabulary and Business Rules (SBVR) and BABOK v3, a business rule is a directive that defines or constrains some aspect of the business. It is intended to assert business structure or to control or influence the behavior of the business.

### 2.2 Categories of Rules
To ensure strict structural classification, the ISAS framework categorizes its operational logic into six distinct types:
*   **Policy Rules (PLY):** High-level operational directives governing organizational strategy, legal stances, and platform-wide paradigms.
*   **Validation Rules (VAL):** Structural constraints applied to inputs, configurations, and data states to ensure system correctness and prevent errors.
*   **Decision Rules (DEC):** Conditional, multi-variable structural logic that evaluates sets of inputs to produce a deterministic operational outcome or status change.
*   **Calculation Rules (CAL):** Mathematical, statistical, and algebraic formulations that compute pricing, dynamic thresholds, AI scores, and metric aggregations.
*   **Authorization Rules (AUT):** Explicit constraint boundaries mapping organizational roles, subscription tiers, and multi-tenant hierarchies to system interactions.
*   **Compliance Rules (CMP):** Legal, ethical, regulatory, and audit mandates ensuring strict compliance with local and international statutes.

### 2.3 Rule Governance
Every business rule in this document is treated as an enterprise asset. Rules are subject to strict versioning, formal change management, annual reviews, and automated traceability mapping. No business rule may be modified, bypassed, or deprecated without formal approval from the Change Advisory Board (CAB) and the designated Business Rules Architect.

---

## 3. Business Rule Categories

The ISAS platform segregates its rules into twenty (20) core operational categories to guarantee complete, zero-gap functional coverage:

| Category Code | Category Name | Functional Scope Description |
| :--- | :--- | :--- |
| **AUT** | Authentication | Security boundaries, multi-factor policies, and session integrity constraints. |
| **ACC** | Account Management | Tenant structures, registration workflows, and organizational bounds. |
| **PRF** | Profile Management | Structural data integrity for individual and institutional portfolios. |
| **CVM** | CV Management | Document parsing thresholds, data validation, and extraction constraints. |
| **CAM** | Campaign Management | Operational lifecycle, limits, and visibility parameters of hiring tasks. |
| **PAY** | Payment & Subscriptions | Fee structures, billing schedules, credit logic, and transaction boundaries. |
| **INT** | Interview Execution | Real-time candidate streaming limits, environmental rules, and timers. |
| **IDV** | Identity Verification | Biometric matching criteria, fraud controls, and legal verification bounds. |
| **AIA** | AI Assessment | Scoring logic, normalization, confidence values, and recommendation criteria. |
| **RDM** | Learning Roadmap | Dynamic curriculum construction, skill gaps, and adaptive progression. |
| **CRT** | Certificates | Issuance criteria, cryptographic integrity validation, and revocation logic. |
| **REP** | Reports & Analytics | Data aggregation, masking rules, cross-tenant limits, and metrics. |
| **NOT** | Notifications | Event triggers, channel preferences, dispatch schedules, and SLA limits. |
| **ADM** | Administration | System-wide configuration controls, feature flags, and tenant isolation overrides. |
| **SEC** | Security | Encryption, zero-trust rules, cross-site scripting limits, and firewall policies. |
| **CMP** | Compliance & Legal | Regulatory frameworks, GDPR/CCPA criteria, and equal opportunity filters. |
| **AUD** | Audit & Logging | Immutable historical tracing, compliance tracking, and administrative tracking. |
| **DGV** | Data Governance | Data masking, destruction schedules, historical archiving, and data localized boundaries. |
| **VAL** | Input Validation | Primitive and complex structured data verification across all system entry points. |
| **DEC** | Core Operational Decisions | Macro-level business state changes determined by multi-variable evaluations. |

---

## 4. Detailed Business Rules

This section contains the comprehensive master directory of foundational enterprise rules. (Note: Category-specific rules and comprehensive validation tables are fully expanded in Sections 5 through 17).

### 4.1 Structural Layout Model
Each rule follows strict structural attributes defined below to ensure absolute measurability and testability:
*   **Rule ID:** Unique, predictable alphanumeric string (`BRL-XXX`).
*   **Rule Statement:** Explicit structural constraint utilizing mandatory modal verbs (`MUST`, `MUST NOT`, `SHOULD`, `SHOULD NOT`) as defined in ISO/IEC/IEEE 29148.
*   **Business Justification:** Clear corporate, risk-management, financial, or legal rationale for the rule's existence.

### 4.2 Comprehensive Core Rule Registry (BRL-001 to BRL-070)

| Rule ID | Rule Name | Category | Rule Statement | Business Justification | Expected Outcome | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **BRL-001** | Cross-Tenant Isolation | Account | Data belonging to a Tenant MUST NOT be visible, accessible, or queryable by any user from another Tenant under any circumstances. | Data privacy, regulatory liability, and strict legal multi-tenant segregation. | Absolute data isolation between separate commercial enterprise clients. | Critical |
| **BRL-002** | Explicit Candidate Consent | Compliance | A candidate MUST explicitly accept the AI Assessment and Data Processing Consent Policy before any interview or recording can initiate. | Compliance with GDPR Article 6/9 and CCPA biometric guidelines. | Blocked execution if consent is denied or withdrawn. | Critical |
| **BRL-003** | Currency Standardization | Payment | All transactional records, invoices, and credit values inside the core system MUST be computed and tracked in USD base value. | Eliminates accounting discrepancy and cross-currency fluctuation errors. | Unified, consistent, auditable multi-currency ledger sheets. | High |
| **BRL-004** | Base64 Image Exclusion | CV Mgmt | CV files containing parsed content MUST NOT retain inline raw base64 images within the extracted searchable textual data object. | Optimization of operational storage costs and system performance stability. | Clean text extraction indices devoid of heavy payload overheads. | Medium |
| **BRL-005** | Interview Room Singularity | Interview | A Candidate MUST NOT possess more than one active, non-expired interview session across the entire platform at any single point in time. | Prevention of platform abuse, concurrency exploitation, and parallel cheating. | Secondary room initialization attempts are immediately terminated. | High |
| **BRL-006** | Score Normalization Mandate | AI Assess | Every raw AI assessment model score MUST be mathematically normalized to a standardized scale of 0.00 to 100.00 before being stored. | Enables fair, transparent cross-model comparison and unified talent screening. | Consistently structured candidate performance metrics across campaigns. | High |
| **BRL-007** | Certificate Revocation Lock | Certificates | Once an issued skill certificate is formally marked as Revoked, its validation status MUST permanently return false and cannot be undone. | Preserves absolute credibility, security, and integrity of the platform credentials. | Attempted third-party verifications fail with a descriptive 'Revoked' state. | Critical |
| **BRL-008** | Inactive User Hibernation | Account | Accounts showing no successful login activity for 365 consecutive days MUST be automatically flagged as Inactive and suspended from logins. | Reduces security surface attack vectors and operational system licensing overheads. | User access is blocked until explicit administrative reactivation occurs. | Medium |
| **BRL-009** | Dynamic Token Lifetime | Auth | An API authentication session token MUST automatically expire exactly 15 minutes post-issuance if zero transactional activity occurs. | Mitigation of active session hijacking, unauthorized token use, and data leak. | Expiration requires the client application to complete silent re-auth. | High |
| **BRL-010** | Enterprise Audit Immutability | Audit | Entries written to the system enterprise audit ledger MUST NOT be updated, deleted, or re-ordered by any user role, including Super Admins. | Compliance with Sox, SOC2, and international anti-tampering regulations. | Cryptographically validated append-only log execution model. | Critical |
| **BRL-011** | Minimum Pass Threshold | Learning | A student MUST achieve an aggregated module grade of 80.00% or above to mark a core roadmap topic module as Completed. | Ensures strict skill mastery prior to advanced concept promotion. | Automatic lock on downstream modules until target score is achieved. | High |
| **BRL-012** | Campaign Publication Bound | Campaign | An Employer MUST NOT publish an interview campaign without defining at least one explicit target skill and one required assessment model. | Prevents broken user workflows and protects downstream AI parser tasks. | System throws validation error blocking the change to "Published" status. | High |
| **BRL-013** | Subscription Feature Check | Payment | The system MUST block access to advanced analytics features if the Employer’s current active subscription plan status is Grace_Period. | Encourages timely subscription payments and protects premium system value. | Users are safely redirected to the account subscription renewal screen. | High |
| **BRL-014** | Proctored Integrity Scoreout | Interview | If the automated proctoring module detects a "Severe Violation" condition, the system MUST instantly flags the test execution log. | Maintains absolute structural integrity of the automated screening process. | Candidate is allowed to finish but the record is instantly flagged to HR. | High |
| **BRL-015** | PII Masking Rule | Analytics | Candidate PII fields (Name, Phone, Email) MUST be masked when raw assessment data is exported into public benchmark reports. | Prevents accidental data leaks and adheres to global compliance laws. | Export files display anonymous identifier tokens in place of true PII. | Critical |
| **BRL-016** | Notification SLA Limit | Notification | System-critical security alerts (Password Change, MFA Disable) MUST be dispatched to the recipient's registered channel within 3 seconds. | Mitigates active account takeover risks and enhances user protection. | Immediate delivery via low-latency queuing networks. | Critical |
| **BRL-017** | Retention Schedule Purge | Data Gov | Candidate profiles marked for full deletion MUST be completely purged from active data storage systems within 30 days of the request. | Enforces legal adherence to the GDPR "Right to be Forgotten" framework. | Irreversible destruction of all physical records and related backups. | Critical |
| **BRL-018** | Minimum CV Size Limit | CV Mgmt | Any uploaded candidate curriculum vitae document file size MUST NOT be less than 10 Kilobytes (KB). | Precludes the parsing of blank files, corrupted payloads, or system exploits. | Prompt rejection of the file before hitting downstream processing queues. | Low |
| **BRL-019** | Multi-Factor Enforcement | Auth | Users possessing administrative roles (Tenant Admin, Super Admin) MUST complete Multi-Factor Authentication upon every login sequence. | Safeguards elevated systemic permissions from credential compromise. | Access is denied until a secondary verification token is successfully supplied. | Critical |
| **BRL-020** | Fraud Scoring Bias Filter | AI Assess | The system assessment weights MUST NOT utilize candidate gender, age, race, or localized ethnic accents as variables in scoring algorithms. | Enforces equal employment opportunity laws and eliminates algorithmic bias. | Standardized compliance metrics across all trained AI models. | Critical |
| **BRL-021** | Maximum Workspace Seats | Account | An Enterprise Tenant MUST NOT exceed the maximum active seat allocations defined within their current active Subscription contract. | Ensures correct licensing compliance and revenue protection. | Seat addition attempts are rejected with an explicit billing upgrade offer. | High |
| **BRL-022** | Invitation Expiration Rule | Campaign | A Candidate interview invitation link MUST automatically become void after exactly 14 calendar days from the moment of generation. | Manages recruitment pipeline validity and prevents outdated test attempts. | Accessing an expired link renders a dynamic request-renewal interface. | Medium |
| **BRL-023** | Feedback Disclosure Lock | AI Assess | Detailed AI evaluation sub-scores and feedback notes MUST NOT be disclosed to candidates unless explicitly authorized by the Campaign Owner. | Protects proprietary employer screening methods and corporate strategies. | Candidate interface displays only high-level completion status updates. | Medium |
| **BRL-024** | Invoice Generation Timing | Payment | A verifiable PDF invoice MUST be dynamically generated and timestamped within 60 seconds of any successful payment transaction. | Satisfies legal financial accounting and corporate taxation standards. | Automated dispatch of payment receipt to the billing contact email. | High |
| **BRL-025** | Device Camera Validation | Interview | The system MUST block entry to a proctored assessment room if a functional, hardware-activated camera stream is not actively verified. | Necessary prerequisite for automated visual anti-cheating verification. | Display of an informative diagnostic barrier instructing hardware checks. | Critical |
| **BRL-026** | Roadmap Re-generation Limit | Learning | A candidate user MUST NOT trigger an AI learning roadmap re-generation action more than twice within a single 24-hour cycle. | Prevents intentional or accidental high-cost AI compute loop exploitation. | Request is throttle-blocked with an active time-to-availability counter. | Medium |
| **BRL-027** | Verification Expiration | IDV | A Candidate identity verification approval token MUST remain structurally valid for a maximum duration of 180 calendar days. | Ensures up-to-date physical identification records for compliance reasons. | System forces re-verification if a candidate takes a test post-expiry. | High |
| **BRL-028** | Grace Period Allocation | Payment | Subscriptions failing automated payment processing rules MUST be granted a hard limit of 7 calendar days in a functional Grace_Period. | Prevents catastrophic customer business interruption due to transient bank faults. | Daily automated notifications are fired while platform access continues. | High |
| **BRL-029** | Maintenance Window Access | Admin | During a scheduled system maintenance window, all non-administrative user sessions MUST be gracefully disconnected with a status notification. | Protects active operational database states from mutation and sync failure. | Users see a clean, branded offline message with an exact recovery ETA. | Medium |
| **BRL-030** | Certificate Uniqueness Key | Certificates | Every issued certificate MUST contain a globally unique SHA-256 cryptographic hash calculated from the candidate ID, skill ID, and issue date. | Precludes dynamic forgery, duplication, or credential manipulation. | Publicly verifiable, unalterable digital tracking record. | Critical |
| **BRL-031** | Max Campaign Pool | Campaign | Standard Tier commercial tenants MUST NOT maintain more than 5 concurrently active hiring assessment campaigns at any moment. | Establishes commercial plan boundaries and drives platform monetization. | System requires pausing an old campaign before launching a new one. | High |
| **BRL-032** | Profile Completeness Check | Profile | A candidate profile completion metric MUST equal or exceed 70% before the user can apply directly to open enterprise campaigns. | Guarantees employers receive a baseline standard of operational applicant data. | Action blocked with highlighted visual indicators of missing fields. | Medium |
| **BRL-033** | Concurrent Admin Sessions | Auth | A single unique user account possessing administrative privileges MUST NOT maintain concurrent active authentication sessions. | Controls credential sharing and enhances enterprise forensic accountability. | The oldest active session is automatically terminated upon new login. | High |
| **BRL-034** | Microsecond Precision | Audit | Every transaction record and historical audit ledger timestamp MUST be captured utilizing UTC format with microsecond precision. | Essential for cryptographic ordering and forensic security post-mortems. | Absolute, unarguable sequence validation inside database layers. | Critical |
| **BRL-035** | Network Disconnect Buffer | Interview | The system MUST afford a candidate an aggregated total of 300 seconds of un-penalized network disconnection buffer per interview. | Accounts for realistic global connectivity variances without unfair failure. | The assessment timer pauses, resuming instantly upon link recovery. | High |
| **BRL-036** | Model Weight Consistency | AI Assess | The sum total of all distinct skill weights assigned to an assessment evaluation model MUST equal exactly 100.00%. | Mathematical prerequisite for valid, predictable, deterministic score metrics. | Campaign configuration cannot be saved if total deviations exist. | Critical |
| **BRL-037** | Campaign Closure Cleanup | Campaign | Upon a hiring campaign transitioning to a "Closed" state, all un-executed candidate invitations MUST be automatically invalidated. | Prevents late candidate entries into finalized corporate hiring pipelines. | Access to the assessment link triggers a campaign-closed status page. | Medium |
| **BRL-038** | Dynamic Pricing Invariance | Payment | A change in a subscription plan's public retail pricing tier MUST NOT alter the active billing rate of a customer on a locked-in term contract. | Ensures predictable financial invoicing and legally honors price locks. | System maps existing accounts to legacy tariff versions during renewals. | High |
| **BRL-039** | Legal Age Restriction | Account | The platform MUST NOT allow the registration of any candidate user account whose declared date of birth indicates an age under 16 years. | Ensures absolute compliance with COPPA, GDPR minor rules, and child labor statutes. | Registration fails immediately with an age-ineligibility message. | Critical |
| **BRL-040** | Notification Suppression | Notification | The system MUST suppress all promotional notification types for users who have toggled their account communication preference to Disabled. | Adheres to international anti-spam legislation (CAN-SPAM, CASL). | Only transactional and security-critical notifications pass to the user. | Critical |
| **BRL-041** | Bulk Candidate Export Bound | Analytics | A Tenant Admin user MUST NOT export more than 10,000 complete candidate assessment portfolios within a single batch file export operation. | Protects system resources from data extraction denial-of-service attempts. | Exceeded limits trigger an administrative warning to break up the query. | Medium |
| **BRL-042** | Auto-Submit Timeout Rule | Interview | When an interview question timer explicitly hits 00:00, the system MUST force-save and upload the current recorded answer buffer. | Eliminates candidate response length manipulation and levels field logic. | Seamless automated promotion to the subsequent sequence question block. | High |
| **BRL-043** | Skill Discrepancy Flag | AI Assess | If the statistical divergence between AI evaluation engines exceeds 30.00%, the system MUST route the profile to human audit. | Mitigates erratic neural network outputs and provides absolute scoring safety. | The candidate assessment status changes to "Pending Human Review". | High |
| **BRL-044** | Cryptographic Document Link | Certificates | All publicly accessible certificate verification pages MUST employ HTTPS exclusive transport and look up records via a non-sequential GUID. | thwarts systematic sequential scraping attacks and protects candidate records. | Safe public validation URLs readable by authorized external verifiers. | High |
| **BRL-045** | Refund Execution Window | Payment | Refund allocations approved by administration MUST be electronically processed and settled against the payment gateway within 3 business days. | Ensures positive enterprise customer relations and structured balance books. | Automated credit ledger entry balance reconciliation tracking. | Medium |
| **BRL-046** | Maximum CV Upload Limit | CV Mgmt | A candidate user account MUST NOT store more than 5 distinct CV document versions simultaneously within their active workspace. | Restricts storage consumption overheads and reduces user profile confusion. | Uploading a 6th document prompts a required selection to overwrite an old file. | Low |
| **BRL-047** | Password Minimum Entropy | Auth | User-defined passwords MUST satisfy a minimum entropy calculation of 60 bits before being validated for database hashing. | Defends against sophisticated automated dictionary and brute-force cracking. | Visual interactive indicator prevents submit actions until rules pass. | Critical |
| **BRL-048** | Pre-Requisite Roadmap Lock | Learning | The system MUST block access to a learning module if the user has not completed all explicitly mapped structural pre-requisite items. | Assures foundational pedagogical structures and logical student growth paths. | Locked states display clear itemized dependency tracking roadmaps. | Medium |
| **BRL-049** | Secondary Proctor Stream | Interview | If an enterprise campaign mandates dual-camera proctoring, the system MUST terminate the session if the secondary mobile link drops for >60s. | Ensures advanced compliance bounds are rigidly maintained during high-stake tests. | Graceful warning sequence leading to lock out if stream fails to rebind. | High |
| **BRL-050** | Single Currency Invoicing | Payment | An invoice ledger object MUST NOT combine line items calculated in different underlying currency types within a single statement document. | Prerequisite for clean compliance, regulatory tax accounting, and auditing. | Disparate purchases invoke separate invoice creation tasks cleanly. | Critical |
| **BRL-051** | CV Parsing Time Limit | CV Mgmt | The automated parsing engine MUST complete text and entity extraction from an uploaded CV file within an absolute threshold of 45 seconds. | Maintains tight operational system SLAs and ensures positive UX metrics. | Timeout drops the task, updates status to Failed, and logs system warnings. | Medium |
| **BRL-052** | Mandatory Company Domain | Account | Employer registrations requesting corporate access tier privileges MUST utilize a verifiable non-public email domain address. | mitigates credential phishing, impersonation, and false enterprise setups. | Generic domains (gmail, yahoo) are blocked from enterprise workspace setup. | High |
| **BRL-053** | System Configuration Signoff | Admin | Global operational configuration mutations impacting pricing, limits, or AI models MUST receive a dual digital signature approval. | Implements classic four-eyes compliance security to block insider threats. | System holds mutations in a pending state until a second authorized admin signs. | Critical |
| **BRL-054** | Assessment Verification Lock | AI Assess | Once an Employer user formally marks a candidate assessment score as "Reviewed", the calculated score value MUST be permanently locked. | Prevents intentional post-test metric tampering or human recruiting fraud. | The editing capability on scores is entirely removed from the workspace UI. | High |
| **BRL-055** | Workspace Deactivation Logic | Account | Deactivating an enterprise main workspace account MUST immediately cascade an inherit-suspend status down to all linked sub-user seats. | Ensures immediate operational control and termination of corporate data access. | All linked recruiters lose application access inside 5 seconds of change. | Critical |
| **BRL-056** | Temporary Session Ban | Auth | An IP address exhibiting more than 50 failed authentication attempts within a rolling 5-minute window MUST be temporarily blacklisted for 1 hour. | Standard high-volume network layer brute-force mitigation strategy. | Drops connection packets at edge gateway before processing resources. | Critical |
| **BRL-057** | Dynamic Report Aggregation | Analytics | Analytical summaries spanning historical periods MUST NOT compute metrics from datasets that are older than the tenant's data retention plan. | Aligns analytic execution bounds with legal data destruction policies. | System hard-caps data date ranges to allowable archival visibility windows. | High |
| **BRL-058** | Certificate Expiration Check | Certificates | The system automated validation daemon MUST check certificate validity dates nightly and update expired items to status "Expired". | Preserves chronological relevance and industry accuracy of skills certificates. | Public validation views automatically update status indicators dynamically. | Medium |
| **BRL-059** | Multi-Language Alignment | Campaign | If a campaign is flagged for a specific localized language, the interview questions and AI engines MUST utilize that matching configuration. | Avoids cognitive misalignment, scoring anomalies, and parsing errors. | Standard localized validation across candidate-facing interfaces. | High |
| **BRL-060** | Feature Flag Isolation | Admin | The system MUST execute separate instances of feature flag trees per tenant, ensuring pilot features do not bleed into global production tiers. | Guarantees runtime stability and isolates beta failures from core enterprises. | Target features activate strictly for configured tenant workspace GUIDs. | High |
| **BRL-061** | Assessment Restart Ban | Interview | A candidate user who has successfully completed and submitted an interview assessment MUST NOT be allowed to restart that session. | Eliminates unfair iterative testing benefits and maintains score validity. | Subsequent room navigation requests redirect straight to completion screens. | High |
| **BRL-062** | Negative Balance Prevention | Payment | No operational platform transaction or credit usage calculation MUST ever cause an enterprise subscription credit balance to fall below zero. | Eradicates revenue loss vectors and manages transaction integrity constraints. | Operations requesting resource expenditure beyond current balances are aborted. | Critical |
| **BRL-063** | Biometric Hash Destruction | Data Gov | Raw facial reference photos captured during identity checks MUST be destroyed within 24 hours of successful verification status approval. | Conforms to strict biometric compliance frameworks and minimizes leak impacts. | Retains only an anonymized mathematical vector mathematical coordinate string. | Critical |
| **BRL-064** | Equal Opportunity Masking | Compliance | When an option for blind-hiring is active, the system MUST systematically strip all profile demographic indicators from recruiter views. | Prevents subconscious hiring bias and complies with equal opportunity standards. | Candidate names are replaced by generic color codes or sequence tags. | Medium |
| **BRL-065** | System Heartbeat Log | Audit | Automated system infrastructure integrity monitors MUST log functional health check heartbeats at a rigid interval of every 10 seconds. | Crucial for early system degradation detection and high availability SLAs. | Direct routing of anomaly indicators to network administration teams. | High |
| **BRL-066** | Manual Score Override Trail | AI Assess | Any manual adjustment applied by an employer to an automated AI assessment rating MUST require an accompanying text justification string. | Assures clear forensic accountability and legal defensibility of evaluations. | Changes reject without a descriptive note containing a minimum of 20 characters. | High |
| **BRL-067** | Mandatory CV Text Match | CV Mgmt | An uploaded CV file MUST yield at least 50 distinct alpha words upon text extraction to be considered an eligible parsing candidate. | Filters corrupted attachments, completely illegible graphics, or dummy documents. | Rejection notification with instructions to upload standard textual resumes. | Medium |
| **BRL-068** | Roadmap Dependency Purge | Learning | If a candidate deletes an underlying core skill profile capability, any dependent paths on active learning roadmaps MUST be frozen. | Maintains continuous relevance of educational targets to user reality states. | System triggers an alert indicating required skill profile adjustments. | Low |
| **BRL-069** | Secure Webhook Signature | Admin | Every outbound webhook payload dispatched by the system to external third-party tools MUST be signed using a SHA-256 HMAC key token. | Prevents transaction spoofing, external message injections, and data tampering. | Receivers validate payload integrity against shared workspace secrets. | High |
| **BRL-070** | Emergency System Lock | Security | If a data breach indicator flag is enabled for a tenant, the system MUST instantaneously invalidate all active user sessions for that tenant workspace. | Immediate zero-trust containment pattern to protect corporate information asset blocks. | Users are bounced out to safe unauthenticated login terminals immediately. | Critical |

---

## 5. Authentication Rules

This section formalizes the core identity, validation, and session lifecycle boundaries for all system interaction layers.

### 5.1 Authentication Rule Specification Table (AUT-001 to AUT-015)

| Rule ID | Rule Name | Operational Rule Statement | Business Justification | Expected Outcome |
| :--- | :--- | :--- | :--- | :--- |
| **AUT-001** | Unique Identity Key | Every registered user account email address MUST be globally unique across the entire system database context. | Eliminates identity collisions and routing ambiguity. | Rejects duplicate registration attempts with non-revealing errors. |
| **AUT-002** | Password Complexity Structure | User passwords MUST contain a minimum of 12 characters, including at least 1 uppercase letter, 1 lowercase letter, 1 digit, and 1 special symbol. | Mitigation of automated dictionary and credential stuffing attacks. | Input reject prior to hashing if parameters are unmet. |
| **AUT-003** | Brute Force Lockout Threshold | An account MUST be systematically locked for 30 minutes after exactly 5 consecutive failed authentication attempts. | Protects system endpoints against automated credential guessing. | Session blocks, and an account notification email is fired. |
| **AUT-004** | Active Email Requirement | A user account MUST NOT log in to the platform if its associated verification status field is set to False. | Ensures communication path validity and blocks robot registrations. | Login sequence stops at credential check with verification prompt. |
| **AUT-005** | Suspended Account Interdiction | An account with an explicit operational status flag of "Suspended" MUST be immediately blocked from initializing any session context. | Enforces legal and administrative policy actions without delay. | System throws an account disabled notification on login screens. |
| **AUT-006** | Inactive Session Termination | An interactive web session MUST be destroyed after exactly 30 minutes of absolute inactivity from the user client interface. | Reduces risk of local device session hijacking in public environments. | Token is invalidated; browser forces redirection to login. |
| **AUT-007** | Strict Concurrent Multi-Login | A Candidate user role account MUST NOT maintain more than one active web session token simultaneously. | Prevents candidate multi-device cheating and account sharing. | Initializing a new session cleanly invalidates the prior session. |
| **AUT-008** | Multi-Factor Mandate | All Administrative and Employer roles MUST provide a valid time-based one-time password (TOTP) during authentication sequences. | Secures higher privilege accounts holding corporate candidate PII data. | Blocks workspace access until secondary numeric token is validated. |
| **AUT-009** | Re-Authentication Threshold | A user MUST be prompted to re-enter their primary password before changing critical profile items (Email, Password, MFA settings). | Step-up security to protect account control against local hijacking. | Action blocked until fresh valid credential token is re-submitted. |
| **AUT-010** | Magic Link Lifecycle Limit | Password reset tokens and login magic links sent via notification channels MUST automatically expire exactly 1 hour post-generation. | Minimizes vulnerabilities related to unread or intercepted email items. | Accessing an expired token renders an invalid link interface screen. |
| **AUT-011** | Historical Password Lockout | When a user modifies their password, the new value MUST NOT match any of the previous 5 password hashes stored in their history. | Disrupts systematic rotational password switching behaviors. | Input rejected with a password reuse constraint error message. |
| **AUT-012** | Compromised Credential Filter | The system MUST cross-check new password selections against recognized public breached credential databases before accepting changes. | Avoids adoption of widespread known compromised passwords. | Rejects password if flagged in public leak databases. |
| **AUT-013** | Cross-Origin Authentication | Authentication requests MUST only be evaluated if dispatched from corporate-authorized, white-listed system origin domains. | Defends the core identity system from cross-site request forgery risks. | Requests originating from unregistered domains are instantly dropped. |
| **AUT-014** | API Access Key Rotation | System-generated corporate API access keys MUST be forcefully rotated or invalidated exactly 365 days from creation. | Limits the damage footprint of un-rotated static legacy developer keys. | API requests using expired keys return a 401 Unauthorized status. |
| **AUT-015** | Captcha Injection Directive | The system MUST inject a mandatory cryptographic CAPTCHA challenge after 3 failed login attempts from a singular IP. | Throttles high-velocity script attacks before hardware lockout triggers. | User must solve a visual/auditory puzzle to resubmit inputs. |

---

## 6. Candidate Rules

Operational policies managing the onboarding, profiling, and workspace limits of talent applicants.

### 6.1 Candidate Rule Specification Table (CND-001 to CND-015)

| Rule ID | Rule Name | Operational Rule Statement | Business Justification | Expected Outcome |
| :--- | :--- | :--- | :--- | :--- |
| **CND-001** | Mandatory Onboarding Step | A candidate MUST complete their primary identity fields (Full Name, Country, Target Skill) prior to entering an interview room. | Ensures complete contextual records exist for the evaluation engine. | Access to active assessment campaigns is blocked until complete. |
| **CND-002** | Explicit CV Attachment Policy | A candidate MUST attach a valid curriculum vitae file to their profile before accessing automated campaign screening tools. | Necessary baseline parsing dataset for standard AI resume alignment. | The submission pipeline remains locked, displaying missing requirements. |
| **CND-003** | Allowed CV Document Formats | CV attachments MUST be submitted exclusively in PDF, DOC, or DOCX structural document formats. | Maintains operational safety and compatibility of downstream parsers. | Non-compliant file formats are instantly rejected during selection. |
| **CND-004** | Document Size Boundary Rule | An uploaded CV file size MUST NOT exceed an absolute top operational ceiling of 15 Megabytes (MB). | Avoids memory buffer exhaustion and denial-of-service vectors. | Upload process blocks immediately with an explicit file size message. |
| **CND-005** | Completeness Scoring Engine | Candidate profile completeness metrics MUST compute to at least 70% to enable open public talent marketplace indexing. | Protects platform quality reputation among searching recruiters. | Profiles falling short are omitted from search results. |
| **CND-006** | Curricular Roadmap Ceiling | A single candidate user workspace MUST NOT hold more than one active dynamically building AI Learning Roadmap at a time. | Concentrates candidate processing focus and preserves AI system metrics. | Creating a new roadmap automatically archives the active path. |
| **CND-007** | Single Room Execution Limit | A candidate user MUST NOT execute more than one assessment question response workflow at any single instance in time. | Eliminates multi-browser layout trick loops and fraud opportunities. | Subsequent attempts return a concurrent assessment error barrier. |
| **CND-008** | Subscription Validation Bound | Accessing premium career analytics or advanced industry comparative reports MUST require an active valid Premium candidate subscription tier. | Protects monetization strategy for advanced self-service analytics modules. | Non-premium accounts see feature upgrades and pricing screens. |
| **CND-009** | Profile Name Alignment Rule | The name provided in the candidate text profile MUST match the extracted name from validated legal physical photo documentation. | Essential verification baseline for cross-matching identity to scores. | Flagged discrepancies force a manual admin verification queue. |
| **CND-010** | Practice Session Throttling | Candidate accounts on the Free Tier tier MUST NOT execute more than 3 practice interview simulations within a rolling 30-day period. | Infrastructure cost control and tier separation encouragement. | Interface disables simulation buttons with a clear upgrade path option. |
| **CND-011** | Skill Self-Declaration Boundary | A candidate user profile MUST NOT self-declare more than 20 separate professional skill taxonomy nodes within their core profile. | Prevents profile keyword stuffing that compromises machine alignment. | Input forms block additional skill tags once 20 items are active. |
| **CND-012** | Complete Submission Finality | Once a candidate explicitly confirms final interview submission, the test instance status MUST permanently change to Review_Pending. | Prevents unauthorized revision, deletion, or manipulation of answers. | Data entry paths close completely; access transitions to view-only. |
| **CND-013** | Account Deletion Retention Delay | When a candidate triggers full account deletion, data purging workflows MUST initiate a 14-day safety grace hold window. | Allows accidental deletion recovery and preserves active application data. | Profiles remain hidden from public view during the temporary hold phase. |
| **CND-014** | Multi-Application Cooldown | A candidate MUST NOT re-apply to the exact same corporate assessment campaign within 90 days of an explicit rejection action. | Prevents spam re-testing and stabilizes employer pipeline queues. | Application buttons change to a dynamic countdown indicator interface. |
| **CND-015** | Verified Badge Issuance | A candidate profile MUST NOT display a 'Verified Talent' token unless both ID Verification and 1 Core Assessment score exceed 85%. | Preserves external marketplace trust metrics and credential validation. | Systematic status generation occurs only when both logic keys pass. |

---

## 7. Employer Rules

Policies governing organizational workspaces, campaign management, and cross-tenant interaction constraints.

### 7.1 Employer Rule Specification Table (EMP-001 to EMP-015)

| Rule ID | Rule Name | Operational Rule Statement | Business Justification | Expected Outcome |
| :--- | :--- | :--- | :--- | :--- |
| **EMP-001** | Company Legitimacy Audit | An Employer workspace MUST pass formal corporate registry check rules before their status changes to Active_Verified. | Prevents shell companies and fraudulent operations from scraping talent. | Unverified accounts remain restricted from publishing public campaigns. |
| **EMP-002** | Mandatory Campaign Metadata | A hiring campaign configuration MUST explicitly define Title, Job Description, Expiry Date, and Target Skills before publishing. | Guarantees candidates possess clear target objectives during testing. | Publication attempts throw validation errors flagging missing fields. |
| **EMP-003** | Campaign Lifecycle Expiration | A campaign's active operational lifespan MUST NOT exceed a absolute maximum cap of 180 calendar days from publication date. | Prevents data stagnation and structural resource locking in workspaces. | Upon day 181, the campaign state shifts to Archived automatically. |
| **EMP-004** | Tier Campaign Pool Caps | The maximum number of concurrently active hiring campaigns MUST conform strictly to limits defined by the active subscription tier. | Protects enterprise subscription monetization models. | New campaigns remain in Draft status until older ones are archived. |
| **EMP-005** | Candidate Invitation Limits | An Employer MUST NOT dispatch an assessment invite link unless their active workspace credit balance is greater than zero. | Enforces credit consumption billing rules prior to resource use. | Dispatch triggers fail with immediate credit replenishment modal popups. |
| **EMP-006** | Cross-Tenant Analytics Isolation | Employer users MUST NOT view individual candidate analytical assessment summaries generated for a different commercial tenant. | Fundamental data security boundary preventing talent poaching. | Systems reject illegal analytical cross-queries with explicit logging. |
| **EMP-007** | Subscription Expiry Access State | If an Employer's subscription state shifts to Lapsed, their active dashboard access MUST transition into a read-only state. | Drives contract renewals while preventing data loss grievances. | Creation or modification of campaigns and viewing new scores is blocked. |
| **EMP-008** | Multi-Recruiter Seat Constraints | A Tenant Admin user MUST NOT allocate more recruiter sub-accounts than the total seat volume specified by their enterprise plan. | Enforces user licensing compliance metrics across enterprise segments. | The invite-user execution path blocks further inputs when max is hit. |
| **EMP-009** | Bulk Custom Question Limit | An Employer user MUST NOT upload more than 100 custom situational questions per individual assessment campaign block. | Manages database configuration weights and protects testing bounds. | UI arrays reject item additions past 100 with a warning box. |
| **EMP-010** | Talent Pool Export Boundary | An Employer user role MUST NOT download raw candidate biometric verification records under any tier context. | Legal liability mitigation under strict privacy and identity data rules. | Export payloads strictly exclude raw images, retaining status fields only. |
| **EMP-011** | Campaign Reactivation Window | An archived or closed hiring campaign SHOULD NOT be reactivated if its historical closure timestamp is older than 365 days. | Preserves archival data integrity and structural historical data states. | Workspace prompts the creator to instantiate a new campaign clone. |
| **EMP-012** | Custom Branding File Formats | Employer custom logos used for applicant facing portals MUST be submitted in PNG or SVG vector formats under 2 Megabytes. | Ensures layout consistency and UI integrity across dynamic screens. | Rejects files failing dimension, format, or payload checks. |
| **EMP-013** | Candidate Disclosure Window | An Employer MUST NOT edit an assessment campaign's core skill target schema once a candidate has successfully submitted an entry. | Prevents moving goalposts that skew scoring alignment mid-flight. | Layout inputs freeze, showing an active dependency lock flag. |
| **EMP-014** | Shared Workspace Permission | Access to an internal hiring folder item MUST follow explicit role structures mapped within that tenant's workspace tree. | Internal organizational security compliance and separation of duties. | Users without matching roles encounter permission denied interfaces. |
| **EMP-015** | Audit Log Retention Mandate | Employer workspace administrative activities MUST remain queryable in system audit databases for at least 7 operational years. | Corporate accounting compliance and regulatory forensic standards. | Data purging daemons bypass admin log databases during normal cleanup. |

---

## 8. Payment Rules

Monetary logic, ledger structures, calculations, and transactional lifecycle constraints.

### 8.1 Payment Rule Specification Table (PAY-001 to PAY-015)

| Rule ID | Rule Name | Operational Rule Statement | Business Justification | Expected Outcome |
| :--- | :--- | :--- | :--- | :--- |
| **PAY-001** | Pre-Authorization Validation | Access to premium enterprise platform services MUST be blocked until a valid success callback token is received from the processor gateway. | Eradicates fraudulent balance utilization and prevents revenue loss. | Real-time activation happens only when transaction state returns clear. |
| **PAY-002** | Explicit Refund Window Bound | Subscription refund requests MUST NOT be processed if initiated more than 14 calendar days post-transaction timestamp. | Establishes solid operational income bounds and prevents platform gaming. | Requests beyond 14 days are auto-rejected by financial admin workflows. |
| **EMP-003 / PAY-003** | Automated PDF Statement Dispatch | The system MUST dynamically construct a valid tax invoice document within 60 seconds of any transactional charge event. | Satisfies legal enterprise accounting mandates across global territories. | Automated background workers output and mail signed billing attachments. |
| **PAY-004** | Transaction State Machine Alignment | A payment ledger item MUST NOT transition to an Active state if its primary verification indicator returns Failed. | Preserves double-entry accounting correctness across data clusters. | Transaction maps to Aborted state; all relevant asset creation stops. |
| **PAY-005** | Transaction Currency Isolation | All core financial calculation systems MUST calculate transactional amounts based on the USD currency exchange value. | Eliminates complex multi-currency tracking variance across system books. | Real-time conversions occur at payment gateways prior to core mapping. |
| **PAY-006** | Subscription Auto-Renewal Logic | Active subscription models MUST automatically trigger a charge cycle exactly 24 hours prior to the current period expiration timestamp. | Prevents customer operational service interruption due to time-zone delays. | Gateway fires payment call; success extends access period values. |
| **PAY-007** | Automated Credit Deduction | Initiating an automated AI resume parsing sequence MUST instantly consume exactly 1 credit unit from the tenant's workspace balance. | Strict pay-per-use monetization execution tracking. | Balance drops by 1; background worker activates upon successful deduction. |
| **PAY-008** | Multi-Tier Transaction Retry Scheduling | If a subscription charge fails, the system MUST retry the transaction exactly 3 times over a 7-day period before suspending workspace access. | Optimizes revenue collection while minimizing abrupt user lockouts. | Retries execute on Day 1, Day 3, and Day 7, tracking failure metrics. |
| **PAY-009** | Minimum Micro-Purchase Bounds | Single localized credit replenishment transactions MUST NOT possess a financial value lower than $10.00 USD. | Manages gateway processing overhead costs to protect margin metrics. | Interface input validation restricts arbitrary low-value entries. |
| **PAY-010** | Failed State Workspace Preservation | When a tenant enters a Suspended state due to billing failure, core user data MUST NOT be purged for at least 90 calendar days. | Provides customer recovery pathways while preventing catastrophic data loss. | Account freezes completely but database entries remain intact for restoration. |
| **PAY-011** | Chargeback Security Quarantine | Any account workspace triggering a formal financial chargeback claim MUST be immediately placed into a Security Lockdown state. | Mitigates transactional fraud risks and limits potential financial liability. | All system access features are frozen until dispute resolution finishes. |
| **PAY-012** | Corporate Tax Calculation Formula | Applicable regional sales tax values MUST be calculated dynamically based on the corporate location address provided in billing setup. | Ensures total adherence to state, national, and international tax rules. | Invoices clearly segment base fees from dynamically determined tax lines. |
| **PAY-013** | Enterprise Pricing Override Code | Custom negotiated corporate contract pricing rates MUST utilize an authorized override code signed by a VP-level workspace role. | Controls corporate discounting parameters and protects profitability. | System blocks custom billing configurations devoid of authorized signatures. |
| **PAY-014** | Credit Expiration Boundary | Individual operational assessment credits purchased outside standard recurring subscription packages MUST expire exactly 365 days post-purchase. | Manages long-term balance sheet liabilities and promotes platform activity. | System balances adjust down, logging a clear expiration event ledger item. |
| **PAY-015** | Tier Downgrade Resource Truncation | When a customer downgrades plans, active workspace configurations MUST be systematically truncated to meet new target tier caps. | Prevents exploitation of high-tier features inside low-cost plans. | Excess active campaigns shift to Paused states based on creation order. |

---

## 9. Interview Rules

Environmental, behavioral, operational, and procedural constraints managing live and automated test execution.

### 9.1 Interview Rule Specification Table (INT-001 to INT-015)

| Rule ID | Rule Name | Operational Rule Statement | Business Justification | Expected Outcome |
| :--- | :--- | :--- | :--- | :--- |
| **INT-001** | Device Camera Access Mandate | The interview testing interface MUST verify active system camera permissions prior to unlocking test question elements. | Core structural requirement for automated visual tracking and verification. | Candidate remains on hardware diagnostic screens until permission passes. |
| **INT-002** | Audio Capture Stream Requirement | The testing application MUST continuously sample audio signals from verified hardware microphone inputs during sessions. | Required for vocal analysis, entity processing, and noise detection. | Session initialization aborts if microphone stream drops to zero input. |
| **INT-003** | Biometric Matching Baseline | Candidates MUST complete facial identity matching validation checks before accessing secure campaign test rooms. | Prevents candidate substitution and ensures exam integrity. | The screen blocks access if the real-time photo matches poorly with records. |
| **INT-004** | Singular Face Presence Constraint | Automated proctoring models MUST raise a severe violation alert if more than one distinct face is detected within the video grid. | Prevents third-party assistance and collaboration during examination blocks. | Flagged indicators register on timelines; real-time alerts warn candidates. |
| **INT-005** | Question Countdown Execution | Every assessment question MUST operate under an independent countdown timer defined by campaign rules. | Normalizes execution conditions and prevents response length padding. | Question input access cuts off when the timer reaches 00:00. |
| **INT-006** | Interview Session Pause Ceiling | A candidate user MUST NOT pause a standard proctored interview assessment session more than 2 times total. | Restricts opportunities for offline external reference searching. | Pause control options disappear from interface views once the limit is hit. |
| **INT-007** | Absolute Timeout Auto-Submission | When an interview session's total allowed runtime expires, the system MUST force-save and submit all captured data. | Prevents incomplete sessions from stalling downstream processing queues. | The testing environment closes, sending responses directly to AI queues. |
| **INT-008** | Intermittent Connection Recovery | The system MUST allow a disconnected candidate to re-enter an active interview room if the session time remains valid. | Fair treatment regarding realistic real-world networking drops. | Browser layout attempts automatic reconnection and state restoration. |
| **INT-009** | Cheating Response Escalation | Upon detecting a structural cheating event, the system MUST log the incident and flag the final scoring record. | Protects candidate experience from abrupt stops while securing system trust. | Candidate completes the session, but the dashboard marks the entry as Compromised. |
| **INT-010** | Session Resumption State Locking | Upon re-entering an active test room after a crash, the candidate MUST resume from the exact question index currently in execution. | Prevents candidates from navigating backwards to manipulate prior answers. | Interface elements render only the active chronological state data. |
| **INT-011** | Minimum Answer Length Rule | An interview answer submission MUST contain at least 15 seconds of spoken audio content to be categorized as valid. | Ensures the presence of substantive verbal data for AI acoustic models. | Shorter submissions trigger an immediate prompt to provide a complete answer. |
| **INT-012** | Fullscreen Browser Lock | Proctored interview sessions MUST require the candidate's browser interface to operate in exclusive fullscreen mode. | Restricts concurrent desktop application usage or searching behavior. | Exiting fullscreen triggers a violation event and increments the warning counter. |
| **INT-013** | Background Noise Threshold | The system MUST issue a warning indicator if ambient noise levels exceed 65 decibels for over 10 consecutive seconds. | Preserves clear audio tracking signals for accurate language evaluation. | Candidate receives a visual warning block to find a quieter space. |
| **INT-014** | Explicit Session Expiry Boundary | An uncompleted interview room instance MUST automatically switch to status Expired exactly 24 hours after initialization. | Keeps recruitment pipeline data fresh and frees processing resources. | Active connection tokens become invalid, blocking subsequent test access. |
| **INT-015** | Human Proctor Override Path | A Tenant Admin role user MUST possess the authorization to clear an automated proctoring fraud flag after manual review. | Allows human judgment to correct false-positive algorithmic evaluations. | Form comments record the administrator's structural rationale for audit tracking. |

---

## 10. AI Assessment Rules

Algorithmic, statistical, evaluative, and disclosure governance policies for automated scoring modules.

### 10.1 AI Assessment Rule Specification Table (AIA-001 to AIA-015)

| Rule ID | Rule Name | Operational Rule Statement | Business Justification | Expected Outcome |
| :--- | :--- | :--- | :--- | :--- |
| **AIA-001** | Serialization Sequence Rule | An AI assessment pipeline MUST NOT execute until all interview answer text and audio artifacts are saved. | Prevents data corruption and ensures stable scoring model runs. | Processing queues hold items until complete data availability is verified. |
| **AIA-002** | Minimum Response Duration | The AI evaluation models MUST ignore spoken response segments that fall below a total duration of 5 seconds. | Avoids generating mathematical errors from insufficient acoustic input. | Scoring blocks skip the brief segment, recording an un-evaluable tag. |
| **AIA-003** | Algorithmic Confidence Threshold | If an AI scoring dimension returns a model confidence score lower than 60%, the system MUST mark the metric as Unreliable. | Protects assessment reliability and prevents erratic automatic decisions. | The specific dimension triggers a manual verification track for human review. |
| **AIA-004** | Target Range Score Normalization | Every generated competency sub-score MUST be normalized using standard z-score distributions to fit a 0 to 100 range. | Enables valid skill comparisons across different test variations. | Employers see consistent, standardized performance scales on dashboards. |
| **AIA-005** | Weighted Multivariable Calculation | The composite assessment score MUST be computed using the exact skill weight values specified in the campaign setup. | Respects the specific hiring priorities defined by the employer team. | Changing weights updates historical candidate scores across that campaign. |
| **AIA-006** | Recommendation Engine Logic | The system MUST NOT generate a 'Highly Recommended' badge unless the candidate's core composite score is 85 or above. | Maintains a premium talent standard for top automated recommendations. | Candidates below 85 receive standard classification tags based on performance. |
| **AIA-007** | Immediate Score Publication Barrier | Calculated assessment scores MUST NOT be published or visible until all internal model tasks finish successfully. | Prevents displaying incomplete or erratic partial scores on dashboards. | Record states remain as Processing until all engine confirmations clear. |
| **AIA-008** | Multi-Tenant Data Separation | An AI model instance MUST NOT use raw scoring data from Tenant A to optimize or train custom models for Tenant B. | Strictly protects corporate IP boundaries and conforms to privacy laws. | Model parameters are stored within isolated tenant storage systems. |
| **AIA-009** | Roadmap Core Eligibility Key | A candidate's learning roadmap generation logic MUST focus on skill gaps where assessment scores fell below 70. | Targets training content to verified skill deficiencies. | The system populates curriculums with modules matching weak skill nodes. |
| **AIA-010** | Technical Keyword Density Verification | Automated code evaluation models MUST verify syntax correctness before evaluating structural skill logic. | Ensures the scoring engine evaluates working logic rather than text inputs. | Broken syntax submissions default to a zero score on compilation tasks. |
| **AIA-011** | Sentiment Analysis Exclusion | The system core competency scoring algorithms MUST NOT use emotional sentiment parameters to alter technical skill values. | Minimizes neurological diversity bias and protects scoring neutrality. | Evaluation components extract technical capability independently of tone. |
| **AIA-012** | Model Version Consistency Lock | Assessments within a single campaign MUST use the same AI model version from start to finish. | Ensures fair evaluation by preventing model changes during a campaign. | System upgrades apply to new campaigns without changing active pools. |
| **AIA-013** | Plagiarism Index Filtering | Text responses showing an automated plagiarism match score above 40% MUST be flagged for review. | Detects copy-paste cheating from public web documentation or AI prompts. | The candidate portfolio displays an active plagiarism warning indicator. |
| **AIA-014** | Automated Dynamic Insight Parsing | The AI summary engine MUST extract at least 3 distinct positive traits and 2 growth areas for every complete test file. | Provides practical, actionable feedback value for reviewing recruitment teams. | Reports generate structured feedback grids rather than generic text blocks. |
| **AIA-015** | Continuous Drift Verification | The system MUST monitor average campaign score shifts and alert administrators if deviation changes by 15% month-over-month. | Detects potential underlying model drift or changes in prompt behaviors early. | System signals engineering teams to audit model consistency metrics. |

---

## 11. Learning Roadmap Rules

Curriculum generation, educational milestones, and skill gap remediation constraints.

### 11.1 Learning Roadmap Rule Specification Table (RDM-001 to RDM-015)

| Rule ID | Rule Name | Operational Rule Statement | Business Justification | Expected Outcome |
| :--- | :--- | :--- | :--- | :--- |
| **RDM-001** | Practice Run Prerequisite | A candidate user MUST complete at least 1 skill diagnostic test before triggering a custom AI Learning Roadmap. | Provides the required capability baseline data to build the training plan. | Generation requests are blocked until diagnostic testing data exists. |
| **RDM-002** | Skill Gap Threshold Map | The roadmap generation engine MUST only include skills where candidate assessment performance fell below 75%. | Focuses training time on verified developmental areas rather than known skills. | Topics exceeding 75% are excluded from remediation plans. |
| **RDM-003** | Roadmap Refresh Rate Limitation | A candidate user MUST NOT trigger a manual roadmap recreation action more than twice in 30 days. | Controls processing resource costs and encourages focus on current plans. | Interface update options lock, showing the next available reset date. |
| **RDM-004** | Chronological Learning Order | A generated roadmap layout MUST display learning modules in sequential order from foundational to advanced. | Follows structured learning patterns to ensure solid concept retention. | Advanced skill elements remain locked until basic modules clear. |
| **RDM-005** | Module Prerequisite Validation | The learning interface MUST block entry to advanced modules until prerequisite tests achieve an 80% pass score. | Ensures necessary concept mastery before moving to high-level content. | Selection actions display required prerequisite items still pending completion. |
| **RDM-006** | Clear Completion Criteria | A roadmap module status MUST NOT change to Completed until both video modules and validation quizzes are finished. | Ensures thorough engagement with learning materials before granting credit. | Status tracking updates dynamically when both completion conditions clear. |
| **RDM-007** | Linear Progress Measurement Formula | Roadmap progress metrics MUST be computed as the percentage of completed core modules against the total assigned set. | Provides clear, honest advancement visibility for candidate workspaces. | Dashboards update progress bars when module states change to Complete. |
| **RDM-008** | External Certificate Bridge Policy | The learning engine MUST NOT recognize external completion inputs unless verified through an official API bridge. | Protects platform credibility by validating external training claims. | Manual declarations remain marked as Unverified until data sync completes. |
| **RDM-009** | Dynamic Duration Estimates | Every generated roadmap path MUST calculate an estimated completion hour metric based on content complexity variables. | Helps candidate users plan time commitment requirements effectively. | The interface displays clear time estimates next to active topic headers. |
| **RDM-010** | Content Expiry Validation Check | If a roadmap module uses content that is retired, the system MUST replace the module with an active equivalent within 24 hours. | Prevents user frustration by keeping learning material active and accurate. | Nightly maintenance tasks swap broken links with valid active elements. |
| **RDM-011** | Recruiter Assessment Sharing Policy | A candidate's detailed learning roadmap progress metrics MUST NOT be shared with employers without explicit user consent. | Protects candidate privacy and supports low-stakes skill growth spaces. | Dashboards show recruitment teams only verified exam certifications. |
| **RDM-012** | Recommended Module Priority | The roadmap generation logic MUST prioritize modules directly linked to open hiring campaigns in the user's region. | Maximizes the practical employment value of candidate learning tracks. | Matching modules display high-priority focus badges in workspace views. |
| **RDM-013** | Quiz Interative Failure Cooldown | If a user fails a module validation quiz 3 times, the system MUST enforce a 24-hour study lock on that quiz. | Prevents random guessing tactics and encourages review of study materials. | Test entry interfaces lock, showing an active countdown timer. |
| **RDM-014** | Micro-Learning Path Creation | The system MUST segment learning tracks into clear milestone blocks that take no more than 120 minutes to finish. | Supports modern micro-learning habits and reduces interface fatigue. | Long courses break down into manageable, independent sub-topic structures. |
| **RDM-015** | Archive Retention Rules | Inactive or abandoned candidate learning roadmaps MUST be moved to historical archive files after 180 days of non-use. | Cleans active storage tables and improves overall dashboard load performance. | Data shifts to cold storage while remaining restorable upon user request. |

---

## 12. Certificate Rules

Credential design, digital signatures, validation, and programmatic revocation boundaries.

### 12.1 Certificate Rule Specification Table (CRT-001 to CRT-015)

| Rule ID | Rule Name | Operational Rule Statement | Business Justification | Expected Outcome |
| :--- | :--- | :--- | :--- | :--- |
| **CRT-001** | Passing Threshold Lock | The system MUST NOT generate a skill certificate unless the related assessment score is 80.00% or above. | Standardizes certification values and maintains external market trust. | Scores below 80 template target paths instead of generating documents. |
| **CRT-002** | Absolute Course Completion Cap | A certificate for a learning path MUST require a 100% completion status across all mapped roadmap modules. | Confirms thorough engagement with all required training elements. | Automated generation triggers activate when the final status changes to Complete. |
| **CRT-003** | Cryptographic Identification Key | Every skill certificate MUST contain a globally unique SHA-256 validation string embedded into its record. | Prevents forgery and supports independent third-party credential checks. | Output structures append a unique verification string to each file. |
| **CRT-004** | Definitive Revocation Status | If a certificate is revoked due to fraud, its system verification status MUST permanently return False. | Protects platform credibility against cheating or profile misrepresentation. | Verification links update to show a bold, clear Revoked status message. |
| **CRT-005** | Public Verification Access | The verification interface MUST allow third-party corporate users to validate certificates without logging in. | Simplifies credential checking for external HR teams and hiring networks. | Accessing the verification URL shows credential details smoothly. |
| **CRT-006** | Expiration Window Policy | Certificates generated by the platform MUST remain valid for a maximum duration of 730 calendar days from issuance. | Ensures skills data remains contemporary with changing industry standards. | Expired profiles show an explicit status warning banner on public views. |
| **CRT-007** | PDF Download Limitation | Candidates MUST NOT download digital certificates unless their profile verification status is confirmed. | Prevents unverified users from exporting platform-branded credentials. | Download interface options unlock only after identity checks pass. |
| **CRT-008** | Automated Metadata Injection | Generated certificate metadata records MUST include the Candidate ID, Skill ID, Issue Date, and Model Version. | Maintains full historical traceability for corporate audit trails. | Data records compile complete tracing matrices before final file signing. |
| **CRT-009** | Corporate Badge Bridge Placement | The system MUST provide standardized metadata sharing structures for LinkedIn, Twitter, and professional networks. | Drives brand visibility and organic growth through public sharing. | Candidate profiles render direct social media sharing links upon issuance. |
| **CRT-010** | Retroactive Revocation Path | A Super Admin role user MUST hold the authority to retroactively revoke certificates if cheating is confirmed later. | Allows corrective action when systemic testing fraud is discovered post-facto. | Status field mutations update historical ledger entries instantly. |
| **CRT-011** | Duplicate Generation Block | The system MUST block the creation of a duplicate active certificate for a skill that already holds a valid certificate. | Prevents duplicate records and maintains clean user profile histories. | Subsequent high scores update existing records rather than generating new files. |
| **CRT-012** | Decentralized Verification Cache | The verification engine MUST cross-check certificate statuses against an append-only ledger database. | Implements high-security tracking to prevent direct data tampering. | Verification calls validate system signatures against cryptographic roots. |
| **CRT-013** | Custom Enterprise Branding | Enterprise clients MUST NOT include custom corporate logos on certificates unless using a Premium subscription tier. | Protects corporate branding rules and drives platform tier upgrades. | Standard tiers generate certificates using standard platform templates. |
| **CRT-014** | Name Change Lock | The name displayed on an issued certificate MUST NOT change unless legal identity documents are re-verified. | Prevents users from transferring earned credentials to other individuals. | Form fields lock post-generation, forcing an admin ticket path for changes. |
| **CRT-015** | Automated Expiry Warning | The notification system MUST send an update 60 days before a skill certificate hits its expiration date. | Reminds candidates to re-test, supporting continuous platform engagement. | Automated schedulers queue reminder notices to the candidate's account. |

---

## 13. Notification Rules

Event-driven customer interactions, service level timelines, and multichannel routing logic.

### 13.1 Notification Rule Specification Table (NOT-001 to NOT-015)

| Rule ID | Rule Name | Operational Rule Statement | Business Justification | Expected Outcome |
| :--- | :--- | :--- | :--- | :--- |
| **NOT-001** | Automated Interview Reminders | The system MUST send interview reminders 24 hours and 1 hour before a scheduled live assessment session. | Reduces candidate no-show rates and helps keep hiring processes on time. | Scheduled cron systems fire message actions precisely at target marks. |
| **NOT-002** | Real-Time Payment Receipts | Transaction receipts MUST be sent to the user's billing contact email within 30 seconds of a successful charge. | Provides clear financial confirmation and reduces billing support queries. | Payment success triggers immediate receipt generation and mailing tasks. |
| **NOT-003** | Learning Roadmap Readiness Alert | The system MUST alert a candidate within 5 minutes of their dynamic learning roadmap finishing generation. | Encourages immediate user engagement with newly generated training content. | Completion tasks trigger instant in-app alerts and email notifications. |
| **NOT-004** | Immediate Certificate Notice | The notification module MUST message a candidate immediately upon the successful creation of a skill certificate. | Delivers a positive user experience by celebrating candidate achievements. | Certificate generation workflows pass success calls straight to messaging queues. |
| **NOT-005** | Real-Time Campaign Milestones | The system MUST update employer owners when candidate application volumes hit 50%, 100%, and 150% of targets. | Helps recruitment teams monitor pipeline health without manual tracking. | Count checks evaluate targets on entry, triggering updates as milestones pass. |
| **NOT-006** | System Downtime Advisory | Notifications for scheduled maintenance windows MUST be sent to all active users 48 hours before down-times. | Follows professional enterprise service SLA communication standards. | System-wide banner assets and email broadcasts launch at the 48-hour mark. |
| **NOT-007** | Support Ticket Update SLA | Helpdesk response updates MUST dispatch to the user's registered communication channel within 2 minutes of submission. | Maintains customer service experience loops across system workspaces. | Support interface actions trigger immediate outbound notification routines. |
| **NOT-008** | Critical Security Event Alerts | Security notices (MFA updates, password modifications) MUST trigger immediate email and SMS dispatches. | Helps users detect and respond to unauthorized account changes quickly. | Security updates bypass standard notification queues for instant routing. |
| **NOT-009** | Intelligent Digest Batching | Non-critical updates (such as profile views) MUST compile into a single daily email summary digest block. | Avoids communication fatigue and keeps users from marking emails as spam. | Background processes collect non-urgent events for a daily 08:00 dispatch. |
| **NOT-010** | Direct Candidate-Recruiter Chat | Communication channels between recruiters and applicants MUST go through platform internal messaging templates. | Protects candidate PII privacy and maintains compliance trails. | Direct displays of personal contact data are hidden in workspace UI layers. |
| **NOT-011** | Failure Bounce Deactivation | If a user email drops into a permanent hard-bounce state, the system MUST mark that contact as Inactive. | Protects system domain authority ratings with global email service engines. | Webhook monitors catch bounce events and update delivery tables. |
| **NOT-012** | Local Timezone Delivery Rules | Marketing or promotional updates MUST NOT deliver to users between the hours of 21:00 and 08:00 local time. | Respects user rest hours and improves overall message conversion rates. | Scheduling systems adjust delivery queues using the user's timezone data. |
| **NOT-013** | Multi-Language Template Match | System notifications MUST match the preferred language configuration specified in the recipient's user profile. | Ensures clear, accessible communication for global system users. | Localization logic loads matching language files during text building. |
| **NOT-014** | Operational Opt-Out Constraint | Users MUST NOT opt out of receiving critical security, billing, or transaction-related notices. | Ensures delivery of vital regulatory, legal, and system-status information. | Management interfaces disable opt-out checkboxes for essential system updates. |
| **NOT-015** | Message Trail Archival Rule | All dispatched communication records MUST be archived in system audit files for at least 3 years. | Supports resolution of recruitment disputes and provides legal compliance trails. | Outbound message workers write copies to historical log tables. |

---

## 14. Administrative Rules

System configurations, enterprise adjustments, feature flags, and global master controls.

### 14.1 Administrative Rule Specification Table (ADM-001 to ADM-015)

| Rule ID | Rule Name | Operational Rule Statement | Business Justification | Expected Outcome |
| :--- | :--- | :--- | :--- | :--- |
| **ADM-001** | Role Assignment Limits | Super Admin roles MUST NOT be assigned without explicit approval from the Chief Information Security Officer (CISO). | Minimizes internal access risks by limiting top-level system controls. | Changes to admin permissions remain pending until secondary security sign-off. |
| **ADM-002** | Multi-Factor Authentication Reset | Resetting a user's MFA settings MUST require identity verification by two separate support agents. | Prevents social engineering attacks aimed at gaining unauthorized account access. | MFA controls remain locked until a second agent approves the reset request. |
| **ADM-003** | System Variable Change Logs | Global system variables (pricing, limits) MUST NOT change without a formal, logged change order record. | Maintains full business configuration audit trails for compliance. | Update attempts block unless linked to an approved change management ID. |
| **ADM-004** | Enterprise System Backups | Complete, encrypted database backups MUST run automatically every 24 hours and be stored in multi-region setups. | Ensures business continuity and protects against catastrophic data loss. | Automated backup processes execute at 01:00 UTC, creating secure records. |
| **ADM-005** | Production Feature Flag Isolations | New features behind feature flags MUST isolate by tenant ID to prevent unapproved rollout leaks. | Allows safe testing of new features with select users before full deployment. | Systems evaluate flag states against tenant configs before rendering views. |
| **ADM-006** | Scheduled Maintenance Caps | Regular system maintenance windows MUST NOT exceed a total of 4 hours per calendar month. | Protects high-availability agreements and platform reliability targets. | Maintenance operations are planned to fit within approved monthly schedules. |
| **ADM-007** | Inactive Data Retention Rule | Candidate data for accounts inactive for 3 years MUST move to secure historical archive storage. | Lowers active database storage costs and meets standard retention rules. | Annual data migration tasks clear old records into long-term files. |
| **ADM-008** | Cold Storage Recovery Rules | Restoring data from cold archive storage MUST complete within 48 hours of an authorized admin request. | Balances cost-effective storage use with reasonable data access timelines. | Restoration workflows move data back to active tables within 48 hours. |
| **ADM-009** | Complete Account Purge Policy | Hard-purging an enterprise account workspace MUST require a 30-day pending window before irreversible deletion. | Prevents accidental data loss from mistaken or unauthorized deletion requests. | Workspaces enter a hidden, pending-deletion state for 30 days before purging. |
| **ADM-010** | Third-Party IP Whitelisting | Enterprise api integrations MUST require incoming traffic to originate from whitelisted IP addresses. | Adds network-level protection for sensitive enterprise corporate endpoints. | Requests from unlisted IPs are dropped with a connection error. |
| **ADM-011** | Automatic System Scaling Rules | Dynamic resource groups MUST scale up when total system memory utilization hits 75% for 5 minutes. | Prevents performance slowdowns during sudden candidate testing peaks. | Resource monitors trigger automatic scaling actions to add processing units. |
| **ADM-012** | API Request Rate Limits | Standard API keys MUST operate under a maximum usage limit of 1,000 requests per rolling 60-second window. | Protects platform stability by preventing intentional or accidental API abuse. | Exceeded limits return standard rate-limiting notices to calling apps. |
| **ADM-013** | Database Encryption Rules | Sensitive data fields (passwords, identity hashes) MUST use AES-256 encryption at rest. | Protects personal candidate information from unauthorized access if data leaks. | Storage processes encrypt target fields before saving to database tables. |
| **ADM-014** | Session Invalidation Triggers | Updating a tenant's plan status to Suspended MUST immediately end all active user sessions for that tenant. | Enforces billing controls quickly when accounts are deactivated. | Session tokens for the tenant are invalidated across the network within seconds. |
| **ADM-015** | Vulnerability Scan Routines | Automated security vulnerability scans MUST run on all core platform networks every week. | Helps find and fix potential security weaknesses before they can be exploited. | Security systems generate reports and alert administration teams. |

---

## 15. Compliance Rules

Data privacy laws, equal opportunity hiring regulations, and international audit compliance.

### 15.1 Compliance Rule Specification Table (CMP-001 to CMP-015)

| Rule ID | Rule Name | Operational Rule Statement | Business Justification | Expected Outcome |
| :--- | :--- | :--- | :--- | :--- |
| **CMP-001** | General Privacy Framework | The system MUST provide users with clear options to export all personal data files upon request. | Meets strict data portability mandates required by GDPR Article 20. | Profile interfaces include a downloadable data export option. |
| **CMP-002** | Explicit Biometric Opt-In | Candidate biometric data MUST NOT be recorded or processed without an explicit opt-in confirmation. | Complies with strict CCPA and Illinois BIPA biometric privacy standards. | Processing engines remain locked until explicit consent is recorded. |
| **CMP-003** | Data Retention Lifecycles | Unused candidate application records MUST be automatically removed from active views after 24 months. | Follows standard data minimization guidelines outlined by global privacy frameworks. | Background processes clear unapplied profiles every month. |
| **CMP-004** | Immutable Logging Records | Audit log systems MUST save all user access privilege changes to permanent, append-only files. | Ensures compliance with SOC2 Trust Principles and standard corporate audit rules. | Log systems prevent any updates or deletions of access records. |
| **CMP-005** | Role-Based Access Controls | User access to candidate profile details MUST strictly follow predefined role permissions. | Prevents internal data misuse by restricting access to authorized roles. | Access attempts from unauthorized accounts are blocked and logged. |
| **CMP-006** | PII Field Encryption Rules | Personally Identifiable Information (PII) fields MUST use secure encryption methods while in transit and at rest. | Protects sensitive user data from unauthorized interception during delivery. | Network transport layers enforce secure HTTPS and TLS connections exclusively. |
| **CMP-007** | Equal Opportunity Filtering | System matching models MUST NOT include demographic data fields when ranking candidate profiles. | Promotes fair hiring practices and satisfies global equal opportunity laws. | Candidate age, gender, and nationality are excluded from screening logic. |
| **CMP-008** | Regional Data Localization | Candidate profile data MUST be stored in cloud infrastructure located within the user's home region. | Adheres to national data residency laws and regional sovereignty rules. | Routing systems send data to matching regional storage centers during onboarding. |
| **CMP-009** | Automated Right-to-Forget Purges | Verified requests for profile deletion MUST completely erase all candidate records within 30 days. | Satisfies legal "Right to be Forgotten" mandates under GDPR Article 17. | Data deletion workers clear matching records across all system tables. |
| **CMP-010** | Clear AI Usage Disclosures | The system MUST show a prominent notification stating that automated AI models are used to evaluate responses. | Follows emerging algorithmic transparency standards and global AI regulations. | Welcome screens for assessments display clear notices before testing begins. |
| **CMP-011** | Accessible Interface Design | Candidate-facing test environments MUST follow WCAG 2.1 Level AA accessibility standards. | Ensures equal access to testing for candidates with diverse physical needs. | Platform layouts include standard screen reader support and keyboard navigation. |
| **ADM-012 / CMP-012** | Third-Party Privacy Audits | Data processing partners MUST complete formal privacy and data safety audits every year. | Lowers supply chain data risks and protects corporate compliance standing. | Integration links are paused if partners miss audit verification deadlines. |
| **CMP-013** | Age Verification Controls | The registration workflow MUST prevent account creation for users under 16 years old. | Complies with children's online privacy protection laws (COPPA, GDPR minor rules). | Users entering birthdates under 16 are blocked from finishing registration. |
| **CMP-014** | Data Breach Warning Routines | If a data leak is confirmed, the system MUST send out notifications within 72 hours. | Meets strict regulatory breach notification timelines required by GDPR. | Automated emergency systems queue notification updates for all affected users. |
| **CMP-015** | Fair Automated Screening Rights | Candidates rejected by automated AI screening MUST have the right to request a manual human review. | Protects users against automated errors and satisfies EU consumer rights. | Rejection notices include clear options to request a manual profile review. |

---

## 16. Validation Rules

This section details the explicit business data validation checks across entry points. The system must process inputs deterministically according to these boundaries.

### 16.1 Comprehensive Validation Schema Table (VAL-001 to VAL-080)

| ID | Input Target Field | Validation Constraint Statement (Business Context) | Error / Resolution Action |
| :--- | :--- | :--- | :--- |
| **VAL-001** | User Email | Must contain exactly one `@` symbol and a valid domain extension with no spaces. | Reject input; prompt for standard email format. |
| **VAL-002** | User Email Length | Must not exceed an absolute structural length of 255 characters total. | Truncate and block submission with field error notice. |
| **VAL-003** | Phone Number | Must contain only numeric digits, spaces, and an optional leading `+` sign. | Strip invalid characters; warn user if format is broken. |
| **VAL-004** | Phone Length | Must be between a minimum of 7 and a maximum of 15 characters long. | Reject submission; highlight out-of-range character counts. |
| **VAL-005** | CV Upload Format | File extension must explicitly match `.pdf`, `.doc`, or `.docx` patterns. | Deny upload; show allowed format requirements clearly. |
| **VAL-006** | CV File Size | Size must be greater than 10 KB and less than 15 MB. | Abort upload; display file size limit warning box. |
| **VAL-007** | Custom Logo Dimensions | Image width and height must not exceed 2048 pixels maximum. | Reject file; prompt user to resize image layout. |
| **VAL-008** | Custom Logo Size | File size must not exceed 2 MB maximum for system storage. | Drop file stream; render payload size limit alert. |
| **VAL-009** | Campaign Expiry Date | Target date must be set at least 24 hours in the future from current time. | Block selection; force calendar choice to future dates. |
| **VAL-010** | Campaign Expiry Range | Target date must not exceed 180 days from the current creation date. | Cap input field; show maximum allowable active span. |
| **VAL-011** | User Password | Must match active complexity rules (12+ characters, mixed case, symbols). | Disable submit controls; show specific missing items. |
| **VAL-012** | Date of Birth | Must place candidate age between 16 and 100 years old based on current date. | Block registration; show age restriction guidelines. |
| **VAL-013** | Workspace Seat Count | Numeric value must be an integer greater than zero. | Reject inputs; reset field to lowest valid baseline tier. |
| **VAL-014** | Workspace Seat Ceiling | Input count must not exceed maximum limits for the subscription tier. | Cap value input; open plan upgrade purchase options. |
| **VAL-015** | Campaign Title | Text string length must be between 5 and 100 characters long. | Prevent save actions; display character count guidelines. |
| **VAL-016** | Job Description | Must contain at least 100 characters to ensure adequate context. | Show a warning about description length; block active saves. |
| **VAL-017** | Skill Tags Allocation | Must include at least 1 and no more than 20 distinct taxonomy nodes. | Block update updates; show skill selection count limit notices. |
| **VAL-018** | Credit Purchase Count | Must be an integer value between 10 and 10,000 credits. | Correct entry format; clear non-numeric inputs. |
| **VAL-019** | Currency Price Value | Numeric values must not be zero or negative for standard plans. | Reset to default tier pricing; flag calculation errors. |
| **VAL-020** | Assessment Skill Weights | Total sum of all skill weight fields must equal exactly 100.00%. | Prevent active saves; show balance discrepancy values. |
| **VAL-021** | Question Timer Value | Must be an integer value between 30 and 600 seconds per item. | Force default value of 60 seconds if entries fall out of bounds. |
| **VAL-022** | Custom Question Text | Text string length must be between 10 and 1000 characters. | Block addition actions; show required length metrics. |
| **VAL-023** | Assessment Pause Limit | Integer count must be between 0 and 5 total permitted pauses. | Cap input fields automatically to top allowed ceiling values. |
| **VAL-024** | Disconnect Buffer Limit | Target time must be set between 60 and 600 seconds maximum. | Force adjustments back inside standard safe operational bounds. |
| **VAL-025** | AI Score Calibration | Calculated output scores must fit between 0.00 and 100.00 limits. | Flag exceptions; log out-of-range values for engineering audits. |
| **VAL-026** | AI Confidence Index | Output probability metric must be a decimal value from 0.00 to 1.00. | Mark values under 0.60 as low reliability for manual queues. |
| **VAL-027** | Passing Threshold Field | Must set target values between 50.00% and 95.00% pass marks. | Reject out-of-bounds adjustments; display allowed test limits. |
| **VAL-028** | Certificate Expiry Date | Must be configured exactly 730 days from generation date. | Calculate fields automatically using standard operational rules. |
| **VAL-029** | Verification Token String | Must match standard non-sequential 36-character GUID formats. | Deny access; return broken link validation errors. |
| **VAL-030** | Country Selection | Selection must match a valid ISO 3166-1 alpha-2 country code. | Default profile view to regional cluster based on IP origin. |
| **VAL-031** | Postal Code Field | Format must match alphanumeric layout criteria for the selected country. | Highlight field formatting rules; prevent submission. |
| **VAL-032** | Corporate Website URL | Must be a valid text string starting with standard secure web prefixes. | Reject inputs lacking complete domain structure elements. |
| **VAL-033** | Unique Tax Identifier | Format must match corporate registry layout styles for the selected country. | Flag unverified numbers; pause verification queues. |
| **VAL-034** | Webhook Target URL | Must resolve to a valid web address using exclusive secure transport. | Block setup actions; show network security warnings. |
| **VAL-035** | Dynamic Search Query | Search parameter text strings must not exceed 150 characters total. | Truncate long queries; run clean search sequences. |
| **VAL-036** | Notification Batch Size | Integer count must range between 10 and 500 records per batch. | Split oversized batches automatically into standard sized queues. |
| **VAL-037** | Campaign Target Capacity | Expected candidate volume parameter must be an integer above zero. | Block processing if entry values are missing or zero. |
| **VAL-038** | Voucher Discount Rate | Discount percentage must range between 1.00% and 100.00% max. | Deny coupon creation tasks if values fall outside limits. |
| **VAL-039** | Voucher Expiry Parameter | Target expiration date must be a future date within 365 calendar days. | Block updates; show maximum promotional schedule timelines. |
| **VAL-040** | Practice Session Limit | Integer count must range between 1 and 10 simulations total. | Cap choices based on active plan level constraints. |
| **VAL-041** | Profile Summary Field | Text description string length must not exceed 2000 characters. | Prevent further typing; show active remaining count text. |
| **VAL-042** | Work Experience Duration | Numeric months field must be an integer value from 0 to 600. | Reject unrealistic entries; prompt for corrected dates. |
| **VAL-043** | Academic Grade Value | Input data must match standard regional grade point average ranges. | Standardize grading metrics using global scale translation tables. |
| **VAL-044** | Base64 Content Filter | Content streams must not contain raw base64 image data strings. | Clean inputs; remove embedded media attachments dynamically. |
| **VAL-045** | Audio Recording Duration | Audio file length must range between 15 and 300 seconds long. | Save valid segments; flag brief entries as empty answers. |
| **VAL-046** | Audio Input Decibels | Sample values must show a signal level above 10 decibels to pass. | Alert candidate to check microphone connection states. |
| **VAL-047** | Video Feed Frame Rate | Stream speed must maintain at least 15 frames per second. | Log connection warnings; update live proctoring timelines. |
| **VAL-048** | Facial Overlap Index | Video alignment score must stay above 75% match threshold. | Trigger cheating warnings if candidate leaves the frame area. |
| **VAL-049** | Plagiarism Match Rate | Score metrics must sit between 0.00% and 100.00% total match. | Flag applications for manual human check if score exceeds 40%. |
| **VAL-050** | Module Sequencing Index | Sort index field must be an integer starting from 1. | Order module paths automatically according to setup rules. |
| **VAL-051** | Quiz Question Pool | Section must contain a minimum pool size of 5 question items. | Block module publication if question requirements are unmet. |
| **VAL-052** | Multiple Choice Options | Every quiz item must provide between 2 and 6 selection choices. | Prevent saving configuration if options are missing. |
| **VAL-053** | Correct Answer Index | Target selection key must map to a valid choice option. | Enforce selection of at least one right answer in configurations. |
| **VAL-054** | Content Video Duration | Lesson file length must range between 60 and 3600 seconds long. | Reject large file uploads; suggest splitting lesson videos. |
| **VAL-055** | Support Ticket Category | Input string must match one of the predefined system support tags. | Default category assignment to General if match is missing. |
| **VAL-056** | Custom Domain Field | Must use standard naming rules without paths or query text. | Reject setups failing formatting domain layout checks. |
| **VAL-057** | IP Access Filter | Must enter a valid IPv4 or IPv6 network address format. | Block submission; show standard IP subnet structure rules. |
| **VAL-058** | Session Invalidation Code | Reason code must match a valid entry in the system status tables. | Default to General Reason if codes are unrecognizable. |
| **VAL-059** | Feedback Note Length | Evaluation commentary text must be at least 20 characters long. | Require longer notes before allowing manual score changes. |
| **VAL-060** | Content Localization Code | Must match a standard language identification tag format. | Fall back to Default English if locale matches are unsupported. |
| **VAL-061** | API Payload Ceiling | Total request size must not exceed a 5 Megabyte limit. | Drop requests exceeding size limits; return payload errors. |
| **VAL-062** | Batch Upload Row Cap | File uploads must contain no more than 1000 items per batch. | Stop parsing rows above limit; request document separation. |
| **VAL-063** | Custom Skill Node Name | Label string length must be between 2 and 50 characters. | Prevent creation if name values include invalid symbol sets. |
| **VAL-064** | Evaluation Margin Error | Scoring variation check must not exceed a 30% threshold limit. | Push records to human review lines when variations are high. |
| **VAL-065** | Refund Amount Field | Value must not exceed original transaction charge amount. | Block processing if refund value is higher than charge. |
| **VAL-066** | Retry Schedule Interval | Wait time parameters must be set between 12 and 72 hours long. | Force default time separation steps if inputs match poorly. |
| **VAL-067** | Cache Lifespan Parameter | Storage timeout value must be set between 60 and 3600 seconds. | Apply default 300 second caps if settings are missing. |
| **VAL-068** | Maintenance Alert Lead | Notice lead time parameter must be set to at least 48 hours. | Block scheduling activations if lead time constraints are broken. |
| **VAL-069** | Report Date Scope | Query span must be less than or equal to 365 calendar days. | Restrict date filters automatically to match allowable limits. |
| **VAL-070** | CSV Export Field Count | Column array count must match template structure tables exactly. | Stop export tasks if data columns do not align. |
| **VAL-071** | Audit Event Identifier | Type code must map to a valid entry in system action tables. | Label unknown events as General System Activity for logs. |
| **VAL-072** | Data Masking Rule | Field targets must link to recognized sensitive classification tags. | Apply default masking models if tracking links are unclear. |
| **VAL-073** | Retention Period Field | Limit must be set between 30 and 2555 days in configuration. | Prevent out-of-bounds inputs; show allowable business ranges. |
| **VAL-074** | Profile View Increment | Count tracker must use positive step increments of 1. | Reject custom update calls attempting to alter view counters. |
| **VAL-075** | Captcha Success Token | Verification string must match valid tokens from service providers. | Block login attempt if captcha validation returns a fail state. |
| **VAL-076** | Password Expiry Schedule | Lifespan parameter must be set between 30 and 180 days long. | Apply default 90-day expiration timelines if values are blank. |
| **VAL-077** | Device Hardware String | Device name data must contain clean text character sets only. | Clean text data inputs before storing information in logs. |
| **VAL-078** | System Event Priority | Importance tag must map to Low, Medium, High, or Critical. | Default event classification to Low if tags are unrecognizable. |
| **VAL-079** | Campaign Invite Expiry | Link validity window must be set between 1 and 30 days maximum. | Force input values back within safe operational ranges. |
| **VAL-080** | Cryptographic Hash Length | Signature string length must match standard hexadecimal lengths. | Reject files that do not match expected signature lengths. |

---

## 17. Decision Rules

Deterministic business operational decisions governed by multi-variable truth conditions.

### 17.1 Macro-Level Operational Decisions Matrix

| Decision ID | Target Core Decision | Evaluated Multi-Variable Conditions | Deterministic System Outcome | Corporate Business Impact |
| :--- | :--- | :--- | :--- | :--- |
| **DEC-001** | Eligible for AI Learning Roadmap? | Diagnostic Test Completed AND Skill Score Summary < 75% AND Active Roadmap Count = 0. | Status changes to: **Eligible**; initialize roadmap generator workspace. | Focuses platform training assets toward users with verified skill gaps. |
| **DEC-002** | Eligible for Skill Certification? | Course Module Completion = 100% AND Final Exam Rating >= 80.00% AND Account Status = Verified. | Status changes to: **Approved**; generate digital certificate. | Maintains a reliable, high standard of quality for platform credentials. |
| **DEC-003** | Premium Access Granted? | Payment Callback = Success OR Workspace Balance >= Item Cost OR Active Contract Term = Valid. | Status changes to: **Access_Granted**; open premium dashboard options. | Protects platform revenue streams by enforcing billing rules. |
| **DEC-004** | Interview Assessment Passed? | Composite Score >= Campaign Baseline AND Proctor Status = Verified_Clean AND Plagiarism Rate < 40%. | Status changes to: **Passed**; move candidate to interview shortlist. | Saves recruiter review time by filtering for qualified applicants. |
| **DEC-005** | Hiring Campaign Closed? | Chronological Age > 180 Days OR Open Positions Filled = True OR Manual Employer Closure Request = True. | Status changes to: **Archived**; turn off candidate invitation links. | Keeps platform data fresh and clean by removing expired pipelines. |
| **DEC-006** | Subscription Payment Approved? | Gateway Status = Cleared AND Fraud Risk Score < Threshold AND Billing Address Format = Valid. | Status changes to: **Settled**; renew active workspace tier for 30 days. | Lowers billing collection risks and automates account renewals. |

---

## 18. Rule Conflict Resolution

Structural guidelines for handling overlapping constraints, rule prioritization, and operational exceptions.

### 18.1 Rule Precedence Tier Hierarchy
When business rules point to conflicting outcomes, the system must apply priority rankings in the following structural order:
1.  **Tier 1: Legal Compliance & Zero-Trust Security Rules (CMP / SEC):** absolute priority; cannot be modified by other platform configuration options.
2.  **Tier 2: Enterprise Financial and Billing Governance Rules (PAY):** takes precedence over general account operational configurations.
3.  **Tier 3: Multi-Tenant Workspace Configuration Constraints (ADM / EMP):** controls individual tenant settings.
4.  **Tier 4: General Candidate Account and Application Rules (CND / PRF):** basic baseline interactions.

### 18.2 Conflict Resolution Process
*   **Automated Conflict Handling:** If overlapping logic matches simultaneously, processing systems execute the rule with the highest precedence rank. Lower-ranked rule conflicts are dropped, and a system notice is sent to administration logs.
*   **Manual Overrides Policy:** Operational exceptions for Tier 1 or Tier 2 rules are blocked. Tier 3 settings may be updated if an enterprise client submits a formal request signed by a Tenant Admin and approved by an internal Product Manager.
*   **System Escalation Paths:** If a rule conflict causes a system process error, the transaction enters a safe hold state. The system alerts the Business Rules Architect team, who must resolve the logical conflict within 24 hours.

---

## 19. Rule Governance

Life-cycle management, change-control policies, review schedules, and documentation frameworks for business rules.

### 19.1 Structural Life-Cycle Metrics

```
  [ Draft / Proposed ] ──> [ Analyst Review ] ──> [ Board Approval ]
                                                          │
  [ Deprecated / Archive ] <── [ Rule Update ] <── [ Active Production ]
```

### 19.2 Change Control Management Policies
*   **Rule Ownership:** The platform Business Rules Architect holds ownership of overall rule structures. Individual section updates are managed by designated domain product managers.
*   **Approval Processes:** Proposed updates must clear formal review steps by a team including a Senior Business Analyst, an Enterprise Architect, and a Compliance Officer before going live.
*   **Versioning Standards:** Rules are tracked using standard semantic version controls (`vMajor.Minor`). Small wording updates change the minor version number; changes impacting core scoring logic increment the major version.
*   **Review Schedules:** All operational business rules undergo a full review every year to ensure continued alignment with changing market trends and regional privacy laws.
*   **Documentation Formats:** Master business rule entries must be updated inside the central repository file (`08_Business_Rules.md`) within 24 hours of any formal policy change approval.

---

## 20. Rule Traceability Matrix

Downstream structural validation paths from core requirements down to automated test execution parameters.

| Req ID | Business Requirement Name | Linked Core Business Process | Primary Rules Applied | Functional System Target | Primary User Roles | Verification Test Case ID |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **BR-01** | Secure Talent Screening | Candidate Onboarding | BRL-002, AUT-008, CMP-002 | Identity Verification Stream | Candidate, Recruiter | TC-AUT-094 |
| **BR-02** | Automated CV Parsing | Applicant Intake | BRL-018, CND-003, VAL-006 | Document Parsing Queue | Candidate User | TC-CVM-112 |
| **BR-03** | Algorithmic Assessment | Screening Lifecycle | BRL-006, AIA-005, DEC-004 | Assessment Compute Engine | AI Evaluator Module | TC-AIA-304 |
| **BR-04** | Skill Credentialing | Talent Marketplace | BRL-030, CRT-003, DEC-002 | Certificate Generator | Candidate, Third-Party | TC-CRT-215 |
| **BR-05** | Monetization Protection | Subscription Billing | BRL-028, PAY-006, VAL-019 | Recurring Payment Engine | Corporate Billing Contact | TC-PAY-042 |

---

## 21. Business Rule KPIs

Measurable performance metrics confirming system adherence to operational rules and optimization profiles.

### 21.1 Comprehensive KPI Target Directory

| Metric ID | Performance Metric Target Name | Target Success Boundary | Measurement Cycle | Applied Base Formula |
| :--- | :--- | :--- | :--- | :--- |
| **KPI-001** | Input Validation Accuracy | \>= 99.98% clean entries | Rolling 30 Days | (Valid entries / Total entries) * 100 |
| **KPI-002** | Complete Test Submissions | \>= 94.50% completion rate | Quarterly | (Finished tests / Started tests) * 100 |
| **KPI-003** | Learning Roadmap Building Speed | \>= 98.00% built inside 5m | Monthly | (Roadmaps built in time / Total built) * 100 |
| **KPI-004** | Accurate Certificate Creation | 100.00% zero-error builds | Annual | (Correct certs / Total issued) * 100 |
| **KPI-005** | First-Time Payment Approvals | \>= 96.50% success match | Monthly | (Successful charges / Total attempts) * 100 |
| **KPI-006** | Policy Violation Matches | <= 0.15% flagged sessions | Rolling 30 Days | (Flagged sessions / Total tests) * 100 |
| **KPI-007** | Fraud Detection Accuracy | \>= 99.10% true positive rate | Quarterly | (True fraud flags / Total fraud flags) * 100 |
| **KPI-008** | Complete AI Assessments | \>= 99.90% finished queues | Monthly | (Completed evaluations / Total tests) * 100 |
| **KPI-009** | Legal Regulatory Alignment | 100.00% zero-non-compliance | Annual | External compliance inspection outcomes |
| **KPI-010** | Tenant Separation Safety | 0 data leaks across tenants | Permanent | Verified data leak incidents |
| **KPI-011** | CV Parsing Success Rate | \>= 97.50% clean text extractions | Monthly | (Successful parses / Total uploads) * 100 |
| **KPI-012** | Average Processing Time | <= 30 seconds per resume file | Rolling 30 Days | Total processing time / Total parsed files |
| **KPI-013** | Authentication Token Lifespans | 100.00% matching 15m expiration | Weekly | Audited expired sessions / Total sessions |
| **KPI-014** | Multi-Factor Adoption Rate | 100.00% requirement compliance | Monthly | (Admins with active MFA / Total admins) * 100 |
| **KPI-015** | Profile Onboarding Completeness | \>= 82.00% hitting 70% threshold | Quarterly | (Profiles over 70% / Total profiles) * 100 |
| **KPI-016** | System Reconnection Accuracy | \>= 95.00% successful re-entries | Monthly | (Successful reconnects / Total drops) * 100 |
| **KPI-017** | Custom Test Balance Integrity | 100.00% zero negative errors | Permanent | Verified negative credit events |
| **KPI-018** | Privacy Deletion Lead Times | 100.00% completed inside 30d | Quarterly | (Purges in time / Total requests) * 100 |
| **KPI-019** | Critical Notification Dispatch | \>= 99.50% sent inside 3s | Rolling 30 Days | (Notices inside 3s / Total notices) * 100 |
| **KPI-020** | Algorithmic Score Consistency | \>= 98.90% variation stability | Quarterly | Statistical stability checks on AI outputs |
| **KPI-021** | Active Campaign Lifecycle Limits | 100.00% matching 180d archival | Weekly | (Auto-archived campaigns / Expired tasks) * 100 |
| **KPI-022** | Verification Link Expirations | 100.00% matching 14d expiration | Monthly | Audited link activities post-expiration |
| **KPI-023** | API Key Rotation Compliance | 100.00% rotated inside 365d | Annual | (Rotated API keys / Total active keys) * 100 |
| **KPI-024** | Automated Refund Timelines | \>= 95.00% settled inside 3d | Quarterly | (Refunds inside 3d / Total refunds) * 100 |
| **KPI-025** | System Infrastructure Heartbeats | \>= 99.99% active tracking entries | Monthly | (Captured heartbeats / Expected logs) * 100 |
| **KPI-026** | API Rate Limiting Blocks | 100.00% correct overuse drops | Weekly | Dropped excess requests / Total overuses |
| **KPI-027** | Custom Weights Validation Match | 100.00% matching 100% total rule | Permanent | Saved campaign configurations with weight errors |
| **KPI-028** | Public Verifications Integrity | 100.00% non-sequential access | Monthly | Audited public verification lookups |
| **KPI-029** | Inactive User Account Suspensions | \>= 99.00% auto-suspend accuracy | Annual | (Suspended old users / Total inactive users) * 100 |
| **KPI-030** | Database Encryption Accuracy | 100.00% fields encrypted at rest | Weekly | Inspected database storage tables |

---

## 22. Risks Related to Business Rules

Potential operational hazards, system vulnerabilities, and mitigation strategies related to rule logic.

### 22.1 Rule Risk Mitigation Architecture

| Risk ID | Source Rule / Area | Potential Business Operational Risk | Impact | Likelihood | System Mitigation Strategy |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **RSK-001** | BRL-020 / AI Scoring | Algorithmic drift or scoring anomalies skew candidate evaluations. | High | Medium | Run automated weekly calibration checks on sample datasets. |
| **RSK-002** | VAL-005 / CV Parsing | Sophisticated file structure payloads bypass validation filters. | Critical | Low | Isolate parsing processes inside secure, sandboxed file workers. |
| **RSK-003** | PAY-006 / Billing | Payment gateway timeout loops cause duplicate subscription charges. | High | Medium | Apply strict transaction tracking keys across payment endpoints. |
| **RSK-004** | CRT-003 / Certificates | Verification system downtime permits use of modified certificates. | High | Low | Cache verification data across secure, multi-region database networks. |
| **RSK-005** | AUT-007 / Session | Session handling gaps allow concurrent cheating attempts. | High | Medium | Enforce real-time connection status checks during test entries. |
| **RSK-006** | CMP-008 / Localization | Unexpected cloud region drops cause cross-border data syncs. | Critical | Low | Set up automatic regional data locks that prevent cross-border syncs. |
| **RSK-007** | ADM-009 / Deletion | Accidental deletion triggers erase active candidate portfolios. | High | Low | Use soft-deletion delays that hold records for 14 days before purging. |

---

## 23. Future Business Rules

Strategic planning placeholders for upcoming system expansions, feature updates, and global policy frameworks.

*   **BRL-F01 (Enterprise Federation):** Multi-company workspaces MUST allow centralized user provisioning while maintaining full multi-tenant data separation.
*   **BRL-F02 (Global Compliance Expansion):** Assessment scoring configurations MUST automatically adjust to local labor rules based on the applicant's residential region.
*   **BRL-F03 (AI Mentor Subscriptions):** Candidate learning workspaces SHOULD include options for real-time automated AI code coaching, under independent metered credit billing rules.
*   **BRL-F04 (Talent Marketplace Trading):** Certified candidate portfolios MAY be made visible to certified hiring partners, using a double opt-in authorization process.
*   **BRL-F05 (Gamified Skill Paths):** Learning paths SHOULD include point systems and leveling milestones, using standard certification rules for badge generation.

---

## 24. Summary

### 24.1 Corporate Rule Management Framework
The Interview & Skill Assessment System (ISAS) functions within a clear framework of business policies, compliance boundaries, and deterministic data handling models. This document serves as the single source of truth for platform operational rules, keeping business priorities decoupled from code execution.

### 24.2 Key System Safeguards
*   **Tenant Security:** Strict isolation patterns ensure data separation for corporate clients.
*   **Input Integrity:** Comprehensive data verification rules block invalid or malicious content at entry points.
*   **Algorithmic Consistency:** Standardized score calibration patterns ensure reliable, unbiased evaluation results.
*   **Legal Protections:** Built-in compliance checks support data privacy rights and fair hiring practices globally.

### 24.3 Continuous Growth Architecture
By following standard business analysis guidelines, this document provides a clean structure for platform scaling. The system-wide rule index ensures clear traceability, allowing the platform to adopt future features like cross-company network tools and real-time AI training assistance smoothly while maintaining operational reliability.

