# 05 User Roles and Permissions

## 1. Document Purpose
### 1.1 Purpose of Role Management
The purpose of this document is to define the User Roles and Permissions for the AI-powered Interview & Skill Assessment System (ISAS). It outlines the foundational Identity and Access Management (IAM) framework required to secure system resources, enforce accountability, and ensure that individuals and service accounts are granted only the access necessary to perform their respective duties. 

### 1.2 Relationship with BRD
This document serves as an annex and critical extension to the primary Business Requirements Document (BRD). While the BRD defines the functional and non-functional capabilities of ISAS, this document strictly governs the authorization layer—defining *who* can execute the business processes outlined in the BRD and *what* boundaries restrict their actions.

### 1.3 Security Objectives
The roles and permissions model is engineered to achieve the following enterprise security objectives:
*   **Confidentiality:** Protect PII (Personally Identifiable Information), candidate assessments, and proprietary AI evaluation logic.
*   **Integrity:** Prevent unauthorized modification of AI scores, assessment reports, financial records, and system configurations.
*   **Availability:** Ensure seamless, uninterrupted access to authorized entities based on their operational schedules and business needs.
*   **Accountability:** Guarantee that all system actions can be uniquely traced to an authenticated individual or service account.

### 1.4 Intended Audience
This document is intended for:
*   **Business Stakeholders:** To validate that business access requirements and data silos are accurately represented.
*   **Security & IAM Architects:** To design the logical access control implementation, directories, and SSO integrations.
*   **Development Teams:** To build backend authorization checks and access control interceptors.
*   **Audit & Compliance Teams:** To verify alignment with ISO 27001, SOC 2, and data privacy regulations (GDPR/CCPA).

---

## 2. RBAC Overview
### 2.1 Role-Based Access Control Concept
ISAS employs a rigorous Role-Based Access Control (RBAC) model aligned with the NIST RBAC standard. Access to system resources is not assigned directly to users; instead, permissions are aggregated into logical Roles. Users are subsequently assigned to these Roles based on their employment status, departmental function, and business requirements.

### 2.2 Permission Inheritance
To reduce administrative overhead, the system supports role hierarchy and permission inheritance. Higher-level roles implicitly inherit the baseline permissions of their subordinate roles within the same departmental vertical, supplemented by elevated administrative privileges.

### 2.3 Least Privilege Principle
All roles are constructed strictly upon the Principle of Least Privilege (PoLP). By default, implicit denial is enforced across the platform. Users are provisioned with the minimum permissions, shortest duration, and narrowest scope necessary to perform their required tasks.

### 2.4 Separation of Duties (SoD)
Critical business processes are divided among multiple roles to prevent conflict of interest and reduce the risk of internal fraud or malicious data manipulation. For example, the capability to execute a financial payment and the capability to authorize a payment refund are strictly separated.

### 2.5 Role Hierarchy
The role hierarchy structure delineates the escalation paths of permissions and administrative oversight. Lateral access across different verticals (e.g., Finance vs. Operations) requires explicit secondary role assignment rather than inheritance.

### 2.6 Authorization Lifecycle
The authorization lifecycle encompasses Role Definition, Provisioning, Enforcement, Periodic Review, and Revocation. This lifecycle guarantees that access remains synchronized with the dynamic nature of organizational roles and business relationships.

---

## 3. User Role Hierarchy
The hierarchical relationships dictate the escalation of authority and inherited permissions. 

```text
[Executive Level]
      |--- ROL-015: Executive Viewer

[Administrative & Security Level]
      |--- ROL-012: Platform Administrator
            |--- ROL-013: System Administrator
            |--- ROL-014: Security Administrator
            |--- ROL-011: Business Analyst

[Employer / Client Level]
      |--- ROL-003: Employer Administrator
            |--- ROL-004: Recruiter
            |--- ROL-005: Hiring Manager
                  |--- ROL-006: Interviewer

[Candidate & Public Level]
      |--- ROL-002: Candidate
            |--- ROL-001: Guest User

[Internal Operations Level]
      |--- ROL-010: Operations Team
      |--- ROL-007: Training Manager
      |--- ROL-008: Support Agent
      |--- ROL-009: Finance Officer

[Machine / Service Level]
      |--- ROL-016: AI Service Account
      |--- ROL-017: Integration Service Account
      |--- ROL-018: Audit Account
      |--- ROL-019: Monitoring Account
```

---

## 4. User Role Profiles

### ROL-001: Guest User
*   **Description:** Unauthenticated or unregistered user browsing the public-facing ISAS portal.
*   **Business Purpose:** General platform discovery, viewing public job postings, and initiating the registration process.
*   **Responsibilities:** None.
*   **System Access Level:** Public.
*   **Permission Scope:** Read-only access to public campaigns, marketing materials, and landing pages.
*   **Limitations:** Cannot access any PII, proprietary assessments, or internal interfaces.
*   **Success Criteria:** Ability to successfully register or view public data without encountering unauthorized access errors.

### ROL-002: Candidate
*   **Description:** Authenticated individual seeking employment or skill validation.
*   **Business Purpose:** To participate in assessments, interviews, and manage their personal skill profile.
*   **Responsibilities:** Maintain accurate personal profile data, complete assessments ethically, and manage interview schedules.
*   **System Access Level:** Restricted Tenant User.
*   **Permission Scope:** Access limited strictly to own profile, own assessment results (if permitted by employer), and assigned learning roadmaps.
*   **Limitations:** Cannot view other candidates' data; cannot modify AI scores; cannot view employer internal comments.
*   **Success Criteria:** Seamless completion of assessments and interviews with secure access to personal records.

### ROL-003: Employer Administrator
*   **Description:** Top-level administrator for a specific client/employer organization.
*   **Business Purpose:** To configure the employer's workspace, manage organizational billing, and oversee recruitment operations.
*   **Responsibilities:** User management within their organization, billing oversight, global campaign management.
*   **System Access Level:** Tenant Administrator.
*   **Permission Scope:** Full read/write/manage access to all resources within the specific Employer Tenant boundary.
*   **Limitations:** Cannot access data of other employers; cannot modify global ISAS platform settings.
*   **Dependencies:** Requires active organization subscription.

### ROL-004: Recruiter
*   **Description:** HR professional managing candidate pipelines.
*   **Business Purpose:** Source candidates, manage campaigns, review initial AI assessments, and coordinate interviews.
*   **Responsibilities:** Campaign creation, candidate shortlisting, interview scheduling, reviewing AI-generated CV parses.
*   **System Access Level:** Tenant Operational.
*   **Permission Scope:** Manage campaigns, view candidate PII, view assessment scores within assigned campaigns.
*   **Limitations:** Cannot modify billing configurations; cannot alter AI algorithms.

### ROL-005: Hiring Manager
*   **Description:** Departmental leader requiring final candidate validation.
*   **Business Purpose:** Review deep-dive technical assessments, conduct final-stage interviews, and make hiring decisions.
*   **Responsibilities:** Review specific candidate profiles submitted by recruiters, conduct live interviews, input manual evaluations.
*   **System Access Level:** Tenant Restricted Operational.
*   **Permission Scope:** View candidates assigned to their specific job requisitions; read/write feedback for their specific interviews.
*   **Limitations:** Cannot manage users; cannot view billing; cannot view campaigns outside their department.

### ROL-006: Interviewer
*   **Description:** Subject matter expert assigned to conduct specific technical or behavioral interviews.
*   **Business Purpose:** Evaluate candidate competency in a live or asynchronous interview format.
*   **Responsibilities:** Join scheduled interviews, submit interview feedback, review candidate technical baseline.
*   **System Access Level:** Tenant Task-Based.
*   **Permission Scope:** Read access to assigned candidate CVs; Write access to specific interview evaluation forms.
*   **Limitations:** Access to candidate data expires automatically 48 hours post-interview; cannot view broader campaign data.

### ROL-007: Training Manager
*   **Description:** Internal or Employer personnel responsible for upskilling and learning roadmaps.
*   **Business Purpose:** Create, map, and manage post-assessment learning materials and certifications.
*   **Responsibilities:** Update learning modules, verify certificates, track candidate upskilling progress.
*   **System Access Level:** Tenant/Platform Content Manager.
*   **Permission Scope:** CRUD operations on Learning Content, Roadmaps, and Certificates.
*   **Limitations:** Cannot view interview sessions; cannot access financial data.

### ROL-008: Support Agent
*   **Description:** ISAS Level 1/Level 2 technical support representative.
*   **Business Purpose:** Assist users (candidates and employers) with platform navigation, access issues, and technical errors.
*   **Responsibilities:** Ticket resolution, password resets (via managed workflow), impersonation (with strict audit).
*   **System Access Level:** Platform Operational.
*   **Permission Scope:** Read access to user metadata; ability to trigger system diagnostics and view non-sensitive system logs.
*   **Limitations:** Cannot view decrypted PII (e.g., full CVs); cannot view candidate assessment results; cannot view financial data.

### ROL-009: Finance Officer
*   **Description:** ISAS internal billing and revenue management personnel.
*   **Business Purpose:** Handle invoicing, subscription validation, refunds, and financial reporting.
*   **Responsibilities:** Process manual payments, resolve billing disputes, manage subscription tiers.
*   **System Access Level:** Platform Financial.
*   **Permission Scope:** Full access to Payment, Invoice, and Subscription modules.
*   **Limitations:** Complete restriction from Candidate, Assessment, Interview, and AI configuration modules (Strict SoD).

### ROL-010: Operations Team
*   **Description:** General internal staff monitoring business health and non-technical operations.
*   **Business Purpose:** Platform usage monitoring, employer onboarding assistance, and broad reporting.
*   **Responsibilities:** Generate platform usage metrics, assist with tenant setup, manage global templates.
*   **System Access Level:** Platform Operational.
*   **Permission Scope:** Read access to aggregated operational metrics, CRUD on global notification templates.
*   **Limitations:** No access to underlying infrastructure, security configurations, or financial transaction processing.

### ROL-011: Business Analyst
*   **Description:** Internal data analyst focused on product metrics.
*   **Business Purpose:** Analyze AI assessment effectiveness, user journey drop-offs, and platform ROI.
*   **Responsibilities:** Extract anonymized data for BI tools, generate systemic reports.
*   **System Access Level:** Platform Analytical.
*   **Permission Scope:** Read-only access to Analytics and anonymized/aggregated Assessment databases.
*   **Limitations:** Absolutely no access to raw PII or individual candidate identifies.

### ROL-012: Platform Administrator
*   **Description:** Top-level application administrator.
*   **Business Purpose:** Manage global platform settings, tier configurations, and overarching business rules.
*   **Responsibilities:** Global tenant management, subscription tier feature toggling, high-level support escalation.
*   **System Access Level:** Platform Super User.
*   **Permission Scope:** Broad business-administrative control over system functionality.
*   **Limitations:** Does not possess System Admin or Security Admin rights (cannot access OS-level, database-level, or security architecture configs).

### ROL-013: System Administrator
*   **Description:** IT Infrastructure and Backend manager.
*   **Business Purpose:** Maintain application uptime, manage infrastructure, configure integrations.
*   **Responsibilities:** API management, DB synchronization, system maintenance windows, technical logging.
*   **System Access Level:** Technical Infrastructure Admin.
*   **Permission Scope:** High-level access to system configurations, technical integrations, and infrastructure monitoring.
*   **Limitations:** Avoids business-level data manipulation; cannot override Security Administrator policies.

### ROL-014: Security Administrator
*   **Description:** Information Security Officer.
*   **Business Purpose:** Define and enforce access policies, review audit logs, and manage high-privilege accounts.
*   **Responsibilities:** Identity governance, MFA enforcement, IAM policy configuration, incident investigation.
*   **System Access Level:** Security Super User.
*   **Permission Scope:** Exclusive rights to assign ROL-012, ROL-013, ROL-014 roles; full access to immutable Audit Logs; configuration of auth requirements.
*   **Limitations:** Restricted from day-to-day business data access to maintain objective oversight (SoD).

### ROL-015: Executive Viewer
*   **Description:** C-Level executive or Board Member.
*   **Business Purpose:** High-level strategic oversight and organizational health monitoring.
*   **Responsibilities:** Review financial summaries, platform growth metrics, and high-level risk reports.
*   **System Access Level:** Platform Executive (Read-Only).
*   **Permission Scope:** Read-only access to global Dashboards and rolled-up Analytics.
*   **Limitations:** Cannot perform any write/execute actions across the platform.

### ROL-016: AI Service Account
*   **Description:** System-level non-human account for AI/ML inference and scoring.
*   **Business Purpose:** Process CVs, analyze interview transcripts, and generate assessment scores autonomously.
*   **Responsibilities:** Read raw inputs, write analyzed outputs and scores.
*   **System Access Level:** Automated Process (Machine).
*   **Permission Scope:** Strict API-level access to Assessment and CV parsing modules.
*   **Limitations:** Cannot interface with authentication modules, finance, or billing.

### ROL-017: Integration Service Account
*   **Description:** System account used for third-party ATS (Applicant Tracking System) or HRIS integrations.
*   **Business Purpose:** Sync candidates, jobs, and statuses with external client systems (e.g., Workday, Greenhouse).
*   **System Access Level:** Automated Process (Tenant Bound).
*   **Permission Scope:** Scoped API access restricted to specific Tenant data boundaries for CRUD operations on Candidates and Campaigns.
*   **Limitations:** Must authenticate via strict mutual TLS or scoped OAuth 2.0 tokens.

### ROL-018: Audit Account
*   **Description:** Read-only account utilized by external third-party auditors (e.g., SOC 2 / ISO 27001 auditors).
*   **Business Purpose:** Independent verification of system access, security controls, and log integrity.
*   **System Access Level:** External Auditor.
*   **Permission Scope:** Read-only access strictly confined to Audit Logs and Security Configuration definitions.
*   **Limitations:** Zero access to candidate PII, raw CVs, or financial transaction data.

### ROL-019: Monitoring Account
*   **Description:** Service account utilized by external APM (Application Performance Monitoring) tools.
*   **Business Purpose:** Health checks, uptime monitoring, latency tracking.
*   **System Access Level:** Technical Monitoring.
*   **Permission Scope:** Execute basic ping/health-check endpoints and read system telemetry data.
*   **Limitations:** Zero access to application business logic or databases.

---

## 5. Permission Categories
Permissions are grouped logically to streamline assignment and review.
1.  **Authentication (AUTH):** Login, Logout, MFA, Session management.
2.  **User Management (USER):** CRUD operations on user identities and role assignments.
3.  **Profile Management (PROF):** Management of basic user demographic and contact data.
4.  **CV Management (CVMG):** Document upload, parsing, and storage.
5.  **Campaign Management (CAMP):** Creation and lifecycle of recruitment drives.
6.  **Interview Management (INTV):** Scheduling, executing, and reviewing live/async interviews.
7.  **Assessment (ASMT):** AI testing, grading, technical evaluations.
8.  **Reports (REPT):** Generation and sharing of candidate/employer evaluations.
9.  **Learning Roadmap (LMRM):** Skilling paths and course assignments.
10. **Learning Content (LMCT):** Course material and educational resources.
11. **Certificates (CERT):** Skill validation and credentialing.
12. **Payments (PAYM):** Billing, invoicing, refunds, and subscriptions.
13. **Notifications (NOTF):** Email/SMS templates and dispatch logs.
14. **Analytics (ANLY):** Aggregated data dashboards and BI.
15. **Audit (AUDT):** Immutable security and activity logs.
16. **Administration (ADMN):** Global settings and tenant configurations.
17. **Configuration (CONF):** Feature toggles and UI settings.
18. **System Monitoring (SYSM):** Health checks and telemetry.
19. **Support (SUPP):** Ticketing, user assistance, diagnostics.
20. **Integrations (INTG):** API keys, webhooks, third-party syncing.

---

## 6. Permission Catalog
*This catalog lists the unique, granular permissions evaluated by the system's authorization engine.*

| Perm ID | Permission Name | Description | Category | Risk Level |
| :--- | :--- | :--- | :--- | :--- |
| PER-001 | Log In | Allows the user to log in. | AUTH | Low |
| PER-002 | Log Out | Allows the user to log out. | AUTH | Low |
| PER-003 | Reset Password | Allows the user to reset password. | AUTH | Low |
| PER-004 | Configure MFA | Allows the user to configure mfa. | AUTH | Low |
| PER-005 | Revoke Session | Allows the user to revoke session. | AUTH | Low |
| PER-006 | View Login History | Allows the user to view login history. | AUTH | Low |
| PER-007 | Bypass MFA | Allows the user to bypass mfa. | AUTH | High |
| PER-008 | Manage SSO Config | Allows the user to manage sso config. | AUTH | Low |
| PER-009 | Create User | Allows the user to create user. | USER | Medium |
| PER-010 | View User | Allows the user to view user. | USER | Low |
| PER-011 | Update User | Allows the user to update user. | USER | Medium |
| PER-012 | Deactivate User | Allows the user to deactivate user. | USER | Low |
| PER-013 | Delete User | Allows the user to delete user. | USER | High |
| PER-014 | Assign Basic Role | Allows the user to assign basic role. | USER | Low |
| PER-015 | Assign Privileged Role | Allows the user to assign privileged role. | USER | High |
| PER-016 | Impersonate User | Allows the user to impersonate user. | USER | High |
| PER-017 | View Own Profile | Allows the user to view own profile. | PROF | Low |
| PER-018 | Edit Own Profile | Allows the user to edit own profile. | PROF | Low |
| PER-019 | Delete Own Profile | Allows the user to delete own profile. | PROF | High |
| PER-020 | View Other Profile | Allows the user to view other profile. | PROF | Low |
| PER-021 | Edit Other Profile | Allows the user to edit other profile. | PROF | Low |
| PER-022 | Export Profile Data | Allows the user to export profile data. | PROF | Medium |
| PER-023 | Upload CV | Allows the user to upload cv. | CVMG | Low |
| PER-024 | View Own CV | Allows the user to view own cv. | CVMG | Low |
| PER-025 | Delete Own CV | Allows the user to delete own cv. | CVMG | High |
| PER-026 | View Any CV | Allows the user to view any cv. | CVMG | Low |
| PER-027 | Parse CV (Trigger AI) | Allows the user to parse cv (trigger ai). | CVMG | Low |
| PER-028 | Download Any CV | Allows the user to download any cv. | CVMG | Low |
| PER-029 | Bulk Export CVs | Allows the user to bulk export cvs. | CVMG | Medium |
| PER-030 | Redact CV Data | Allows the user to redact cv data. | CVMG | Low |
| PER-031 | Create Campaign | Allows the user to create campaign. | CAMP | Medium |
| PER-032 | View Campaign | Allows the user to view campaign. | CAMP | Low |
| PER-033 | Update Campaign | Allows the user to update campaign. | CAMP | Medium |
| PER-034 | Publish Campaign | Allows the user to publish campaign. | CAMP | Low |
| PER-035 | Close Campaign | Allows the user to close campaign. | CAMP | Low |
| PER-036 | Delete Campaign | Allows the user to delete campaign. | CAMP | High |
| PER-037 | Assign Recruiter | Allows the user to assign recruiter. | CAMP | Low |
| PER-038 | View Campaign Roster | Allows the user to view campaign roster. | CAMP | Low |
| PER-039 | Schedule Interview | Allows the user to schedule interview. | INTV | Low |
| PER-040 | View Schedule | Allows the user to view schedule. | INTV | Low |
| PER-041 | Cancel Interview | Allows the user to cancel interview. | INTV | Low |
| PER-042 | Join Interview (Host) | Allows the user to join interview (host). | INTV | Low |
| PER-043 | Join Interview (Participant) | Allows the user to join interview (participant). | INTV | Low |
| PER-044 | Record Interview | Allows the user to record interview. | INTV | Low |
| PER-045 | Pause Interview | Allows the user to pause interview. | INTV | Low |
| PER-046 | View Interview Playback | Allows the user to view interview playback. | INTV | Low |
| PER-047 | Delete Recording | Allows the user to delete recording. | INTV | High |
| PER-048 | Submit Interview Feedback | Allows the user to submit interview feedback. | INTV | Low |
| PER-049 | Create Assessment | Allows the user to create assessment. | ASMT | Medium |
| PER-050 | View Assessment | Allows the user to view assessment. | ASMT | Low |
| PER-051 | Edit Assessment | Allows the user to edit assessment. | ASMT | Low |
| PER-052 | Take Assessment | Allows the user to take assessment. | ASMT | Low |
| PER-053 | Grade Assessment (Manual) | Allows the user to grade assessment (manual). | ASMT | Low |
| PER-054 | View AI Grade | Allows the user to view ai grade. | ASMT | Low |
| PER-055 | Override AI Grade | Allows the user to override ai grade. | ASMT | High |
| PER-056 | Publish Assessment Results | Allows the user to publish assessment results. | ASMT | Low |
| PER-057 | Delete Assessment | Allows the user to delete assessment. | ASMT | High |
| PER-058 | Archive Assessment | Allows the user to archive assessment. | ASMT | Low |
| PER-059 | Generate Candidate Report | Allows the user to generate candidate report. | REPT | Low |
| PER-060 | Generate Campaign Report | Allows the user to generate campaign report. | REPT | Low |
| PER-061 | View Report | Allows the user to view report. | REPT | Low |
| PER-062 | Export Report | Allows the user to export report. | REPT | Medium |
| PER-063 | Share Report Securely | Allows the user to share report securely. | REPT | Low |
| PER-064 | Delete Report | Allows the user to delete report. | REPT | High |
| PER-065 | Mask Report Data | Allows the user to mask report data. | REPT | Low |
| PER-066 | Generate Roadmap | Allows the user to generate roadmap. | LMRM | Low |
| PER-067 | View Roadmap | Allows the user to view roadmap. | LMRM | Low |
| PER-068 | Update Roadmap | Allows the user to update roadmap. | LMRM | Medium |
| PER-069 | Assign Roadmap | Allows the user to assign roadmap. | LMRM | Low |
| PER-070 | Delete Roadmap | Allows the user to delete roadmap. | LMRM | High |
| PER-071 | Create Module | Allows the user to create module. | LMCT | Medium |
| PER-072 | View Module | Allows the user to view module. | LMCT | Low |
| PER-073 | Update Module | Allows the user to update module. | LMCT | Medium |
| PER-074 | Publish Module | Allows the user to publish module. | LMCT | Low |
| PER-075 | Delete Module | Allows the user to delete module. | LMCT | High |
| PER-076 | Issue Certificate | Allows the user to issue certificate. | CERT | Low |
| PER-077 | View Certificate | Allows the user to view certificate. | CERT | Low |
| PER-078 | Revoke Certificate | Allows the user to revoke certificate. | CERT | Low |
| PER-079 | Download Certificate | Allows the user to download certificate. | CERT | Low |
| PER-080 | Verify Certificate | Allows the user to verify certificate. | CERT | Low |
| PER-081 | Process Payment | Allows the user to process payment. | PAYM | Low |
| PER-082 | View Invoice | Allows the user to view invoice. | PAYM | Low |
| PER-083 | Download Invoice | Allows the user to download invoice. | PAYM | Low |
| PER-084 | Dispute Charge | Allows the user to dispute charge. | PAYM | Low |
| PER-085 | Issue Refund | Allows the user to issue refund. | PAYM | High |
| PER-086 | Update Billing Config | Allows the user to update billing config. | PAYM | Medium |
| PER-087 | View Payment History | Allows the user to view payment history. | PAYM | Low |
| PER-088 | Cancel Subscription | Allows the user to cancel subscription. | PAYM | Low |
| PER-089 | Create Template | Allows the user to create template. | NOTF | Medium |
| PER-090 | View Template | Allows the user to view template. | NOTF | Low |
| PER-091 | Update Template | Allows the user to update template. | NOTF | Medium |
| PER-092 | Delete Template | Allows the user to delete template. | NOTF | High |
| PER-093 | Trigger Manual Notification | Allows the user to trigger manual notification. | NOTF | Low |
| PER-094 | View Dispatch Logs | Allows the user to view dispatch logs. | NOTF | Low |
| PER-095 | View Standard Dashboard | Allows the user to view standard dashboard. | ANLY | Low |
| PER-096 | Create Custom Dashboard | Allows the user to create custom dashboard. | ANLY | Medium |
| PER-097 | Export Analytics Data | Allows the user to export analytics data. | ANLY | Medium |
| PER-098 | View Raw Telemetry | Allows the user to view raw telemetry. | ANLY | Low |
| PER-099 | Manage KPI Definitions | Allows the user to manage kpi definitions. | ANLY | Low |
| PER-100 | View Audit Logs | Allows the user to view audit logs. | AUDT | Low |
| PER-101 | Search Audit Logs | Allows the user to search audit logs. | AUDT | Low |
| PER-102 | Export Audit Logs | Allows the user to export audit logs. | AUDT | Medium |
| PER-103 | Configure Log Retention | Allows the user to configure log retention. | AUDT | Low |
| PER-104 | Delete Audit Logs | Allows the user to delete audit logs. | AUDT | High |
| PER-105 | Archive Audit Logs | Allows the user to archive audit logs. | AUDT | Low |
| PER-106 | Configure Tenant Settings | Allows the user to configure tenant settings. | ADMN | Low |
| PER-107 | View Tenant Settings | Allows the user to view tenant settings. | ADMN | Low |
| PER-108 | Suspend Tenant | Allows the user to suspend tenant. | ADMN | Low |
| PER-109 | Delete Tenant | Allows the user to delete tenant. | ADMN | High |
| PER-110 | Manage Global Metadata | Allows the user to manage global metadata. | ADMN | Low |
| PER-111 | Broadcast Global Alert | Allows the user to broadcast global alert. | ADMN | Low |
| PER-112 | Update UI Branding | Allows the user to update ui branding. | CONF | Medium |
| PER-113 | Manage Feature Toggles | Allows the user to manage feature toggles. | CONF | Low |
| PER-114 | View System Config | Allows the user to view system config. | CONF | Low |
| PER-115 | Modify System Config | Allows the user to modify system config. | CONF | Low |
| PER-116 | Reset Config to Default | Allows the user to reset config to default. | CONF | Low |
| PER-117 | View Health Dashboard | Allows the user to view health dashboard. | SYSM | Low |
| PER-118 | Acknowledge Alerts | Allows the user to acknowledge alerts. | SYSM | Low |
| PER-119 | Download Server Logs | Allows the user to download server logs. | SYSM | Low |
| PER-120 | Restart Service | Allows the user to restart service. | SYSM | Low |
| PER-121 | Manage Resource Quotas | Allows the user to manage resource quotas. | SYSM | Low |
| PER-122 | Create Support Ticket | Allows the user to create support ticket. | SUPP | Medium |
| PER-123 | View Assigned Tickets | Allows the user to view assigned tickets. | SUPP | Low |
| PER-124 | Update Ticket Status | Allows the user to update ticket status. | SUPP | Medium |
| PER-125 | Close Ticket | Allows the user to close ticket. | SUPP | Low |
| PER-126 | View User Diagnostics | Allows the user to view user diagnostics. | SUPP | Low |
| PER-127 | Escalate Ticket | Allows the user to escalate ticket. | SUPP | Low |
| PER-128 | Generate API Key | Allows the user to generate api key. | INTG | Low |
| PER-129 | Revoke API Key | Allows the user to revoke api key. | INTG | Low |
| PER-130 | Configure Webhooks | Allows the user to configure webhooks. | INTG | Low |
| PER-131 | View Integration Logs | Allows the user to view integration logs. | INTG | Low |
| PER-132 | Trigger Manual Sync | Allows the user to trigger manual sync. | INTG | Low |
| PER-133 | Delete Integration Config | Allows the user to delete integration config. | INTG | High |

---

## 7. Role-Permission Matrix
*Representative matrix for key operations. (✔ = Allowed, ✖ = Denied, R = Read Only, M = Manage/Write, A = Approve).*
*Note: Tenant limits apply (e.g., Recruiter only manages within their Employer Tenant).*

| Permission / Role | Guest | Cand. | Emp. Admin | Recruiter | Interviewer | Support | Finance | Sys Admin | Sec Admin |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **AUTH: Login** | ✖ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| **AUTH: Bypass MFA** | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | ✔ |
| **USER: Impersonate User** | ✖ | ✖ | ✖ | ✖ | ✖ | ✔ | ✖ | ✖ | ✖ |
| **USER: Assign Priv. Role** | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | ✔ |
| **PROF: Edit Profile** | ✖ | ✔ (Own) | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ |
| **CVMG: Upload CV** | ✖ | ✔ | ✔ | ✔ | ✖ | ✖ | ✖ | ✖ | ✖ |
| **CVMG: Download Any CV** | ✖ | ✖ | ✔ | ✔ | R (Scpd) | ✖ | ✖ | ✖ | ✖ |
| **CAMP: Manage Campaign** | ✖ | ✖ | M | M | ✖ | ✖ | ✖ | ✖ | ✖ |
| **INTV: Join Interview** | ✖ | ✔ (Scpd) | R | R | ✔ (Host)| ✖ | ✖ | ✖ | ✖ |
| **ASMT: Override AI Grade**| ✖ | ✖ | A | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ |
| **ASMT: Take Assessment** | ✖ | ✔ | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ |
| **PAYM: Issue Refund** | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | A | ✖ | ✖ |
| **AUDT: View Audit Logs** | ✖ | ✖ | R (Scpd) | ✖ | ✖ | ✖ | ✖ | ✖ | R |
| **AUDT: Delete Audit Logs**| ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ (Immutable)|
| **SYSM: Restart Service** | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | M | ✖ |

---

## 8. Resource Access Matrix
Defines access rights explicitly by Core Business Resource using CRUD (Create, Read, Update, Delete) + Approve (A), Export (E), Share (S).

| Resource | Candidate | Emp. Admin | Recruiter | Interviewer | Finance | Sec Admin | Support |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Candidate Profile** | CRU | R | R | R | - | - | R (Masked) |
| **Employer Profile** | R (Public) | CRU | R | R | R | - | R |
| **CV / Resume** | CRUD | RE | RE | R | - | - | - |
| **Interview Session** | R (Self) | CREAD | CREA | CRU | - | - | - |
| **Assessment Report** | R (If allowed)| REA | RE | R | - | - | - |
| **Campaigns** | R (Public) | CRUDEA | CRUD | R | - | - | - |
| **Payments/Invoices** | - | CR | - | - | CRUDEA | - | - |
| **Audit Logs** | - | R (Tenant) | - | - | - | RE | - |
| **System Config** | - | - | - | - | - | - | R |

---

## 9. Administrative Permissions
Administrative privileges are heavily segmented to ensure no single account holds the "keys to the kingdom".
*   **Tenant Management (Platform Admin):** Can provision, suspend, or upgrade Employer Tenants. Cannot access infrastructure.
*   **System Maintenance (System Admin):** Can restart services, manage database backups, and provision APIs. Cannot view candidate PII in plaintext.
*   **Security & Identity (Security Admin):** Can enforce MFA policies, review all audit logs, and assign other administrative roles. Cannot view or process financial data.
*   **AI Model Configuration (AI Ops/Admin):** Can retrain models, update prompt templates, and adjust scoring weights. Requires explicit secondary approval (Maker-Checker principle) for deployment.

---

## 10. Sensitive Operations
Certain actions carry high business or security risks and enforce stricter authorization boundaries.

| Sensitive Operation | Approval Required | Audit Required | Risk Level | Business Impact |
| :--- | :--- | :--- | :--- | :--- |
| **Delete User Account (Right to be Forgotten)** | DPO / Legal | ✔ (Immutable) | High | Compliance / Data Loss |
| **Override AI Assessment Score** | Hiring Manager | ✔ | High | Integrity / Bias |
| **Issue Payment Refund** | Finance Manager | ✔ | High | Financial / Revenue |
| **Export Personal Data (Bulk)** | Sec Admin & DPO | ✔ | Critical | Data Breach / Privacy |
| **Generate Global Admin Token**| Sec Admin + Sys Admin | ✔ | Critical | System Compromise |
| **Delete/Archive Audit Logs** | ✖ (System strictly prevents)| ✔ (Attempt Logged)| Critical | Compliance Failure |
| **Impersonate User (Support)** | User Consent + Security | ✔ (Session Recorded)| High | Unauthorized Access |

---

## 11. Access Governance
### 11.1 Role Assignment & Provisioning
*   Roles are automatically provisioned based on Azure AD / Okta group mapping via SAML/OIDC assertions during SSO login.
*   Guest and Candidate roles are self-provisioned upon registration.

### 11.2 Periodic Access Review (PAR)
*   **Employer Tenants:** Employer Admins must recertify Recruiter and Interviewer access every 90 days.
*   **Internal Admins:** Security Admin conducts a mandatory access review of all Privileged (Admin) roles every 30 days.

### 11.3 Access Revocation
*   Immediate automated revocation upon HRIS termination sync.
*   Session termination triggered simultaneously across all active devices upon revocation.

### 11.4 Temporary / Emergency Access (Firecall)
*   "Break-glass" accounts are stored in an enterprise password vault (e.g., CyberArk).
*   Retrieving a break-glass credential triggers an immediate P1 alert to the Security Operations Center (SOC).

---

## 12. Security Principles
### 12.1 Defense in Depth
Authorization is enforced at multiple layers: 
1. UI element hiding (Front-end).
2. API endpoint validation (API Gateway).
3. Data-level filtering (Row-Level Security in Database).

### 12.2 Zero Trust & Session Security
*   No implicit trust is granted based on network location (e.g., VPN).
*   Continuous authorization validates permissions on *every* API request using short-lived JWTs (15-minute expiry).

### 12.3 Multi-Factor Authentication (MFA)
*   MFA is globally mandated for all ROL-003 and higher.
*   Candidates (ROL-002) are encouraged but not forced to use MFA, except when modifying payout details (if applicable).

---

## 13. Permission Business Rules
*These predefined rules translate business logic into absolute access constraints.*

| Rule ID | Business Rule Description |
| :--- | :--- |
| BR-001 | Candidates can strictly only view and manage their own profiles. |
| BR-002 | Recruiters cannot modify AI-generated scores under any circumstances. |
| BR-003 | Finance Officers can view payment transactions but cannot access candidate assessments. |
| BR-004 | Support Agents cannot view unredacted candidate CVs or proprietary AI configurations. |
| BR-005 | System Administrators cannot modify or delete audit history (Immutable log restriction). |
| BR-006 | Only the Security Administrator can assign the Platform Admin or System Admin roles. |
| BR-007 | Only verified and scheduled Candidates may access live interview sessions. |
| BR-008 | Interviewer access to candidate data automatically expires 48 hours after the interview concludes. |
| BR-009 | A User cannot approve their own expense or payment refund (Strict SoD). |
| BR-010 | Employer Administrators can only view resources tagged to their specific Tenant ID. |
| BR-011 | Candidates cannot view the internal notes left by Recruiters or Hiring Managers. |
| BR-012 | Audit Accounts are read-only and cannot execute any state-changing HTTP requests (POST/PUT/DELETE). |
| BR-013 | Integration Service Accounts cannot generate human-interactive UI sessions. |
| BR-014 | Any bulk export of PII containing more than 100 records requires secondary approval (Maker-Checker). |
| BR-015 | Support Agents utilizing the 'Impersonate' function trigger automated session recording. |
| BR-016 | Guest Users must verify their email address before their role is elevated to Candidate. |
| BR-017 | Training Managers cannot view candidate financial transactions. |
| BR-018 | Deleted Candidate profiles are softly deleted and anonymized, inaccessible to standard queries. |
| BR-019 | Only Hiring Managers can issue final 'Hire' / 'Reject' decisions in the system. |
| BR-020 | Analytics dashboards dynamically mask PII for all roles except Employer Administrators. |
| BR-021 | AI Service Accounts operate strictly over mTLS authenticated internal network segments. |
| BR-022 | Platform Administrators cannot modify the core logic of the AI assessment algorithms. |
| BR-023 | Recruiters cannot assign the Employer Administrator role. |
| BR-024 | A single user cannot hold both Finance Officer and Security Administrator roles concurrently. |
| BR-025 | Interviewers cannot schedule interviews outside of Campaigns they are assigned to. |
| BR-026 | All permission modifications by a Security Administrator trigger an alert to the Executive Viewer. |
| BR-027 | API Keys generated by Integration Service Accounts automatically expire every 180 days. |
| BR-028 | Assessments in a 'Draft' state are invisible to Candidates. |
| BR-029 | Candidates cannot pause a live technical assessment once the timer has started. |
| BR-030 | Employer Administrators cannot delete campaigns that have active, ongoing interviews. |
| BR-031 | Recruiters can only download CVs for candidates actively applied to their assigned campaigns. |
| BR-032 | Finance Officers require secondary authorization to process refunds exceeding $5,000. |
| BR-033 | System Monitoring Accounts cannot execute queries against the Candidate Profile database table. |
| BR-034 | Security logs cannot be accessed via the standard UI; they require direct SIEM/Dashboard access. |
| BR-035 | Training Managers can only issue certificates to candidates who have met the minimum AI grade threshold. |
| BR-036 | Candidates can revoke consent for AI parsing at any time, immediately purging their raw CV data. |
| BR-037 | Support Agents can only reset passwords via secure email links, not manually set them. |
| BR-038 | Hiring Managers cannot view candidates from campaigns outside their assigned department. |
| BR-039 | Operations Team metrics are strictly aggregated and contain no granular user data. |
| BR-040 | Executive Viewers are entirely restricted from exporting data from the system. |
| BR-041 | Assessments flagged for 'Bias Review' are temporarily hidden from Hiring Managers. |
| BR-042 | Only the Platform Owner (Break-glass) can execute database-level truncation scripts. |
| BR-043 | Candidates cannot delete their accounts if they have an actively scheduled interview in the next 24 hours. |
| BR-044 | Interviewer feedback, once submitted, cannot be modified without Recruiter approval. |
| BR-045 | All roles are automatically suspended after 90 days of inactivity, except Service Accounts. |

---

## 14. Access Risks

| Risk ID | Risk Description | Affected Role(s) | Impact | Likelihood | Mitigation Strategy |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **RSK-01** | **Privilege Escalation:** User exploits UI bug to execute admin API calls. | All Users | Critical | Low | Enforce strict server-side API authorization & JWT scoping. |
| **RSK-02** | **Unauthorized PII Access:** Interviewer retains access to CVs post-interview. | Interviewer | High | Medium | Implement automated access revocation (48h TTL on data views). |
| **RSK-03** | **Shared Accounts:** Recruiters share login credentials to bypass limits. | Recruiter | Medium | High | Enforce strict MFA and concurrent session limits (Max 1). |
| **RSK-04** | **Data Leakage (Bulk):** Admin exports full candidate database maliciously. | Emp. Admin | Critical | Low | Implement rate limiting, Maker-Checker on bulk exports. |
| **RSK-05** | **Insider Threat (Score Mod):** Recruiter alters AI score to favor a candidate. | Recruiter | High | Low | Hardcode AI scores as Immutable; require Audit Trail for overrides. |
| **RSK-06** | **Orphaned Accounts:** Terminated employee retains system access. | All Internal | High | Medium | Automated HRIS to IdP de-provisioning sync. |
| **RSK-07** | **Excessive Permissions:** Support Agent granted full Admin rights for troubleshooting. | Support Agent | High | Medium | Enforce Just-in-Time (JIT) provisioning for elevated rights. |

---

## 15. Compliance Requirements
The roles and permissions model is explicitly designed to satisfy the following compliance frameworks:
*   **ISO 27001 (A.9 Access Control):** Enforces business requirements for access control, user access management, and system privilege limitation.
*   **SOC 2 (Security & Confidentiality):** Ensures Logical Access controls restrict unauthorized data access and enforce Separation of Duties.
*   **GDPR / CCPA:** Satisfies data minimization (Need-to-Know access) and the Right to Erasure (Role capability to securely anonymize data).
*   **Audit Logging Retention:** All permission changes and sensitive data access are logged immutably with a minimum retention of 365 days.

---

## 16. Role Lifecycle
1.  **Role Creation:** Defined by Business Analysts; approved by Security Architects; engineered into IAM codebase.
2.  **Role Assignment:** 
    *   *Automated:* via SSO SAML group attributes (e.g., Active Directory group `ISAS_Recruiters`).
    *   *Manual:* By Security Administrator or Employer Administrator within their tenant.
3.  **Role Modification:** Requires formal Change Request (CR) and code deployment if adding net-new permissions.
4.  **Role Suspension:** Automated upon inactivity (>90 days) or triggered by SIEM alert on suspicious activity.
5.  **Role Revocation:** Triggered immediately via Identity Provider (IdP) sync upon termination.
6.  **Periodic Review:** Automated quarterly workflows requiring managers to click "Approve" or "Revoke" for their subordinates' access.

---

## 17. Traceability Matrix

| Business Requirement | User Role | Required Permission(s) | Functional Requirement / Feature |
| :--- | :--- | :--- | :--- |
| Allow job seekers to upload resumes | Candidate | PER-031 (Upload CV) | CV Parsing Engine |
| Let recruiters set up new hiring events | Recruiter, Emp. Admin | PER-039 (Create Campaign) | Campaign Management Dashboard |
| Conduct live technical coding tests | Interviewer, Candidate | PER-048 (Join Interview) | Video/Code Interview Room |
| View organizational ROI on AI screening | Exec. Viewer, Emp. Admin | PER-100 (View Dashboard) | BI & Analytics Module |
| Prevent unapproved data exports | Security Admin | PER-107 (Configure Retention) | Data Loss Prevention (DLP) Rules |

---

## 18. Summary
This User Roles and Permissions document establishes a robust, scalable, and secure authorization architecture for the AI-powered Interview & Skill Assessment System (ISAS). By adhering strictly to the Principle of Least Privilege, Separation of Duties, and Zero Trust concepts, the system ensures that sensitive candidate PII, proprietary AI logic, and employer data remain heavily guarded against both internal and external threats. 

This framework is highly extensible. As new modules (e.g., advanced background checks, automated payroll sync) are integrated into ISAS, net-new permissions can be appended to the existing RBAC catalog without requiring fundamental restructuring of the core identity model.


