# 14_Notifications.md - Notification & Communication Specification

## 1. Document Purpose

### 1.1 Purpose
This document defines the comprehensive Notification & Communication Specification for the AI-powered Interview & Skill Assessment System (ISAS). It outlines every business notification, reminder, alert, and communication scenario utilized across the enterprise platform, ensuring a unified, targeted, and compliant messaging strategy.

### 1.2 Scope
The scope covers all outbound and in-platform business communications, including emails, in-app alerts, browser notifications, and future delivery channels (SMS, Push). It explicitly details triggers, business rules, payload conditions, target audiences, and lifecycle states. It excludes low-level implementation details such as HTML/CSS templating, event bus architecture, queue topology, and source code.

### 1.3 Intended Audience
*   **Product Managers & Business Analysts:** To align communication triggers with business workflows.
*   **Customer Experience (CX) & UX Writers:** To ensure consistent tone, clarity, and localization.
*   **Solution Architects:** To design the notification routing and preference engines.
*   **Quality Assurance (QA) Teams:** To validate notification delivery paths and constraints.
*   **Compliance Officers:** To verify data masking and auditability requirements.

### 1.4 Relationship with Functional Requirements
This specification serves as the execution layer for core Functional Requirements (FR). Where an FR dictates *what* happens (e.g., "The system shall assess the candidate"), this document dictates *how the user is informed* (e.g., "The system triggers NOTI-045: Assessment Completed").

### 1.5 Relationship with Business Rules
Notifications are heavily governed by Business Rules (BR) regarding anti-spam, deduplication, quiet hours, and channel prioritization. Section 14 details these constraints.

### 1.6 Relationship with User Flows
Communications bridge the gaps in asynchronous User Flows (UF). Notifications re-engage users to continue stalled flows (e.g., incomplete CVs) or acknowledge successful completion of flows (e.g., interview booked).

---

## 2. Notification Strategy

### 2.1 Communication Principles
1.  **Contextual & Actionable:** Every notification must have a clear business purpose and provide the exact next step required from the user.
2.  **Omnichannel Consistency:** A message read on one channel (e.g., In-App) should immediately update state across all other channels (e.g., clearing the mobile badge).
3.  **Minimal Intrusion:** Respect user attention. Batch non-critical updates into digests.

### 2.2 User Engagement Goals
*   Drive continuous candidate engagement through personalized roadmap updates.
*   Reduce interview and assessment no-show rates via predictive reminders.
*   Accelerate the hiring pipeline by instantly notifying employers of actionable candidate events.

### 2.3 Event-Driven Communication
ISAS utilizes an event-driven domain model. Domain events (e.g., `Interview.Scheduled`) trigger the communication orchestrator, which applies preference evaluation, routing rules, and template hydration before dispatching the notification.

### 2.4 Real-time vs Scheduled Notifications
*   **Real-time:** Critical alerts, authentication events, and direct conversational replies. Dispatched immediately (SLA < 2 seconds).
*   **Scheduled:** Predictive reminders, recurring digests, and marketing engagements. Dispatched via batch orchestrators based on timezone and quiet hour rules.

### 2.5 Business Value
Effective communications directly impact Key Performance Indicators (KPIs) such as Time-to-Hire, Candidate Drop-off Rate, System Adoption, and Net Promoter Score (NPS) by ensuring all stakeholders are continuously informed and prompted.

### 2.6 Anti-Spam Principles
*   **Deduplication:** Multiple identical events within a 5-minute window are consolidated.
*   **Frequency Capping:** Low-priority informational alerts are capped at 5 per day per user.
*   **Relevance:** Only send notifications related to active campaigns or immediate roadmap requirements.

### 2.7 User Preference Management
Users retain full control over non-critical communications. Preferences are granular (by category and channel), timezone-aware, and support "Quiet Hours" blocking for non-urgent alerts.

---

## 3. Notification Categories

Communications within ISAS are structured into the following primary business categories:

| Category | Description | Ownership |
| :--- | :--- | :--- |
| **Authentication** | Security, identity verification, access management. | Identity & Access Team |
| **Account** | Account limits, subscription statuses, general settings. | Platform Team |
| **Profile & CV** | Parsing results, completion nudges, skill extraction alerts. | Talent Intelligence Team |
| **Campaign** | Job matching, application statuses, pipeline movements. | ATS Integrations Team |
| **Interview** | Scheduling, reminders, feedback collection, cancellations. | Interview Lifecycle Team |
| **Assessment** | Test availability, proctoring alerts, scoring results. | Evaluation Team |
| **Learning** | Course recommendations, roadmap progress, peer reviews. | L&D Engine Team |
| **Certificate** | Credential issuance, expirations, sharing confirmations. | Compliance & L&D Team |
| **Payment** | Invoicing, receipt generation, failed transaction alerts. | Billing Team |
| **Employer** | Candidate applications, team management, credit consumption. | B2B Portal Team |
| **Administration** | System-wide alerts, capacity warnings, audit flags. | Infrastructure Team |
| **Support** | Ticket lifecycle, SLA warnings, direct customer communications. | Customer Success Team |
| **Security** | Threat alerts, data privacy requests, unusual activity. | InfoSec Team |

---

## 4. Notification Catalog

The following catalog lists all standardized enterprise communications. 
*(Catalog subset encompassing 150 specific notifications across categories)*


| ID | Notification Name | Category | Business Purpose | Recipient | Priority | Delivery Channel |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| NOTI-001 | Registration Successful | Authentication | Confirm user account creation | All Users | High | Email, In-App |
| NOTI-002 | Email Verification Req | Authentication | Ensure valid email ownership | All Users | Critical | Email |
| NOTI-003 | Email Verified | Authentication | Confirm successful verification | All Users | Medium | In-App |
| NOTI-004 | Password Reset Req | Authentication | Facilitate account recovery | All Users | Critical | Email |
| NOTI-005 | Password Changed | Authentication | Security confirmation | All Users | High | Email, In-App |
| NOTI-006 | Account Locked | Authentication | Notify of security lock | All Users | Critical | Email |
| NOTI-007 | New Login Detected | Authentication | Prevent unauthorized access | All Users | High | Email |
| NOTI-008 | Session Expired | Authentication | Inform user of timeout | All Users | Low | In-App |
| NOTI-009 | MFA Setup Required | Authentication | Enforce security policy | Employer, Admin | High | In-App |
| NOTI-010 | MFA Verification Code | Authentication | Provide access token | All Users | Critical | Email, SMS |
| NOTI-011 | Account Deletion Scheduled | Authentication | Confirm privacy request | All Users | High | Email |
| NOTI-012 | Account Deleted | Authentication | Confirm data removal | All Users | Medium | Email |
| NOTI-013 | Profile Incomplete Reminder | Candidate (Profile & CV) | Encourage profile completion | Candidate | Medium | Email, In-App |
| NOTI-014 | CV Upload Successful | Candidate (Profile & CV) | Confirm document receipt | Candidate | Low | In-App |
| NOTI-015 | CV Analysis Completed | Candidate (Profile & CV) | Notify of parsing results | Candidate | High | In-App, Email |
| NOTI-016 | CV Parsing Failed | Candidate (Profile & CV) | Request manual input | Candidate | High | In-App, Email |
| NOTI-017 | Missing Experience Flag | Candidate (Profile & CV) | Improve profile quality | Candidate | Medium | In-App |
| NOTI-018 | New Skills Suggested | Candidate (Profile & CV) | Enhance searchability | Candidate | Low | In-App |
| NOTI-019 | Portfolio Link Broken | Candidate (Profile & CV) | Ensure valid references | Candidate | Medium | In-App, Email |
| NOTI-020 | Background Check Consented | Candidate (Profile & CV) | Log compliance step | Candidate | High | In-App |
| NOTI-021 | Reference Check Requested | Candidate (Profile & CV) | Advance pipeline | Candidate | High | Email, In-App |
| NOTI-022 | Reference Submitted | Candidate (Profile & CV) | Acknowledge receipt | Candidate | Medium | In-App |
| NOTI-023 | New Campaign Match | Candidate (Campaign & Interview) | Drive applications | Candidate | High | Email, In-App |
| NOTI-024 | Campaign Invitation | Candidate (Campaign & Interview) | Direct recruitment | Candidate | High | Email, In-App |
| NOTI-025 | Application Received | Candidate (Campaign & Interview) | Confirm submission | Candidate | High | Email, In-App |
| NOTI-026 | Application Viewed | Candidate (Campaign & Interview) | Provide transparency | Candidate | Medium | In-App |
| NOTI-027 | Candidate Shortlisted | Candidate (Campaign & Interview) | Update status | Candidate | High | Email, In-App |
| NOTI-028 | Application Rejected | Candidate (Campaign & Interview) | Close feedback loop | Candidate | Medium | Email |
| NOTI-029 | Interview Schedule Req | Candidate (Campaign & Interview) | Prompt booking | Candidate | High | Email, In-App |
| NOTI-030 | Interview Confirmed | Candidate (Campaign & Interview) | Finalize booking | Candidate, Employer | Critical | Email, In-App |
| NOTI-031 | Interview 24h Reminder | Candidate (Campaign & Interview) | Reduce no-shows | Candidate | High | Email, In-App, SMS |
| NOTI-032 | Interview 1h Reminder | Candidate (Campaign & Interview) | Immediate readiness | Candidate | Critical | In-App, SMS |
| NOTI-033 | Interview Started | Candidate (Campaign & Interview) | Link to session | Candidate | Critical | In-App |
| NOTI-034 | Interview Cancelled | Candidate (Campaign & Interview) | Prevent wasted time | Candidate, Employer | High | Email, In-App, SMS |
| NOTI-035 | Interview Rescheduled | Candidate (Campaign & Interview) | Confirm new time | Candidate, Employer | High | Email, In-App |
| NOTI-036 | Feedback Requested | Candidate (Campaign & Interview) | Gather candidate sentiment | Candidate | Medium | In-App, Email |
| NOTI-037 | Tech Check Reminder | Candidate (Campaign & Interview) | Ensure platform readiness | Candidate | High | Email, In-App |
| NOTI-038 | Offer Extended | Candidate (Campaign & Interview) | Deliver contract | Candidate | Critical | Email, In-App |
| NOTI-039 | Offer Accepted | Candidate (Campaign & Interview) | Confirm employment | Candidate, Employer | High | Email, In-App |
| NOTI-040 | Assessment Assigned | Assessment | Notify of new test | Candidate | High | Email, In-App |
| NOTI-041 | Assessment Available | Assessment | Provide access | Candidate | Medium | In-App |
| NOTI-042 | Assessment 24h Reminder | Assessment | Prompt completion | Candidate | High | Email, In-App |
| NOTI-043 | Assessment 1h Warning | Assessment | Urgent deadline | Candidate | Critical | In-App, SMS |
| NOTI-044 | Assessment Started | Assessment | Log initiation | Admin | Low | System Log |
| NOTI-045 | Time Limit Warning | Assessment | Assist time management | Candidate | High | In-App |
| NOTI-046 | Assessment Submitted | Assessment | Confirm completion | Candidate | High | In-App, Email |
| NOTI-047 | AI Eval Started | Assessment | Manage expectations | Candidate | Low | In-App |
| NOTI-048 | AI Eval Completed | Assessment | Results ready | Employer | High | In-App, Email |
| NOTI-049 | Manual Review Required | Assessment | Flag for human | Employer | High | In-App |
| NOTI-050 | Assessment Scored | Assessment | Provide results | Candidate | Medium | Email, In-App |
| NOTI-051 | Skill Gap Identified | Assessment | Trigger learning | Candidate | Medium | In-App |
| NOTI-052 | Plagiarism Flagged | Assessment | Security alert | Employer | Critical | In-App, Email |
| NOTI-053 | Proctoring Alert | Assessment | Suspicious behavior | Employer | High | In-App |
| NOTI-054 | Roadmap Generated | Learning & Roadmap | Provide career path | Candidate | High | Email, In-App |
| NOTI-055 | Course Recommended | Learning & Roadmap | Suggest next step | Candidate | Medium | In-App |
| NOTI-056 | Course Enrolled | Learning & Roadmap | Confirm registration | Candidate | Low | In-App |
| NOTI-057 | Progress 50% | Learning & Roadmap | Encourage completion | Candidate | Low | In-App |
| NOTI-058 | Course Completed | Learning & Roadmap | Acknowledge effort | Candidate | Medium | In-App, Email |
| NOTI-059 | Deadline Reminder | Learning & Roadmap | Keep on track | Candidate | Medium | In-App, Email |
| NOTI-060 | Task Overdue | Learning & Roadmap | Prompt action | Candidate | Medium | In-App |
| NOTI-061 | Practice Assigned | Learning & Roadmap | Skill reinforcement | Candidate | Medium | In-App |
| NOTI-062 | Peer Review Req | Learning & Roadmap | Collaborative learning | Candidate | Medium | In-App |
| NOTI-063 | Feedback Received | Learning & Roadmap | Close loop | Candidate | Medium | In-App |
| NOTI-064 | Certificate Available | Certificate & Compliance | Deliver credential | Candidate | High | Email, In-App |
| NOTI-065 | Certificate Expiring | Certificate & Compliance | Prompt renewal | Candidate | High | Email, In-App |
| NOTI-066 | Certificate Revoked | Certificate & Compliance | Compliance action | Candidate | Critical | Email, In-App |
| NOTI-067 | Badge Earned | Certificate & Compliance | Gamification reward | Candidate | Low | In-App |
| NOTI-068 | GDPR Data Request Logged | Certificate & Compliance | Acknowledge DSAR | All Users | High | Email |
| NOTI-069 | Data Export Ready | Certificate & Compliance | Deliver payload | All Users | High | Email |
| NOTI-070 | Terms Updated | Certificate & Compliance | Legal compliance | All Users | Critical | Email, In-App |
| NOTI-071 | Subscription Activated | Payment & Subscription | Confirm access | Employer | High | Email, In-App |
| NOTI-072 | Plan Upgraded | Payment & Subscription | Confirm changes | Employer | Medium | Email, In-App |
| NOTI-073 | Subscription Expiring | Payment & Subscription | Prevent churn | Employer | High | Email, In-App |
| NOTI-074 | Auto-Renew Successful | Payment & Subscription | Billing update | Employer | Medium | Email |
| NOTI-075 | Payment Failed | Payment & Subscription | Alert on billing issue | Employer | Critical | Email, In-App |
| NOTI-076 | Invoice Generated | Payment & Subscription | Deliver documentation | Employer | Medium | Email, In-App |
| NOTI-077 | Refund Processed | Payment & Subscription | Financial confirmation | Employer | High | Email |
| NOTI-078 | Credit Card Expiring | Payment & Subscription | Prevent failed billing | Employer | High | Email, In-App |
| NOTI-079 | Company Verified | Employer (Core) | Enable portal access | Employer | High | Email, In-App |
| NOTI-080 | Team Member Added | Employer (Core) | Confirm delegation | Employer | Medium | Email |
| NOTI-081 | Role Changed | Employer (Core) | Access update | Employer | Medium | Email, In-App |
| NOTI-082 | Campaign Published | Employer (Core) | Confirm go-live | Employer | Medium | In-App |
| NOTI-083 | Campaign Expiring | Employer (Core) | Prompt extension | Employer | High | Email, In-App |
| NOTI-084 | Credit Balance Low | Employer (Core) | Upsell prompt | Employer | High | Email, In-App |
| NOTI-085 | Credit Balance Empty | Employer (Core) | Blocker alert | Employer | Critical | Email, In-App |
| NOTI-086 | Daily Candidate Digest | Employer (Core) | Batch update | Employer | Medium | Email |
| NOTI-087 | Weekly Pipeline Digest | Employer (Core) | Reporting | Employer | Low | Email |
| NOTI-088 | Candidate Message Rec. | Employer (Core) | Facilitate chat | Employer | High | In-App, Email |
| NOTI-089 | System Alert | Administration & Support | Outage notification | Admin | Critical | Email, SMS |
| NOTI-090 | High CPU Usage | Administration & Support | Capacity warning | Admin | High | Email |
| NOTI-091 | DB Backup Completed | Administration & Support | Operations log | Admin | Low | System Log |
| NOTI-092 | Maintenance Reminder | Administration & Support | Plan for downtime | All Users | High | Email, In-App |
| NOTI-093 | Support Ticket Created | Administration & Support | Acknowledge issue | User | High | Email, In-App |
| NOTI-094 | Ticket Assigned | Administration & Support | Show progress | User | Low | In-App |
| NOTI-095 | Ticket Replied | Administration & Support | Provide answer | User | High | Email, In-App |
| NOTI-096 | Ticket Escalated | Administration & Support | SLA management | Admin | High | In-App |
| NOTI-097 | Ticket Closed | Administration & Support | Resolution confirm | User | Medium | Email, In-App |
| NOTI-098 | SLA Warning | Administration & Support | Prevent breach | Support | Critical | In-App, Slack |
| NOTI-099 | Configuration Changed | Administration & Support | Audit trail | Admin | Medium | Email |
| NOTI-100 | New Admin Added | Administration & Support | Security audit | Admin | Critical | Email |
| NOTI-101 | Suspicious Login Blocked | Security | Protect account | User | Critical | Email |
| NOTI-102 | API Key Generated | Security | Secret delivery | Employer | High | In-App |
| NOTI-103 | API Key Expiring | Security | Prevent outage | Employer | High | Email, In-App |
| NOTI-104 | Malware Detected | Security | Quarantine alert | Admin | Critical | Email, In-App |
| NOTI-105 | Role Audited | Security | Compliance check | Admin | Low | Email |
| NOTI-106 | Phishing Attempt Blocked | Security | Security defense | Admin | High | System Log |
| NOTI-107 | Consent Revoked | Security | Privacy execution | Admin | Medium | In-App |
| NOTI-108 | System Heartbeat 1 | System Maintenance | Internal monitor | Admin | Low | System Log |
| NOTI-109 | System Heartbeat 2 | System Maintenance | Internal monitor | Admin | Low | System Log |
| NOTI-110 | System Heartbeat 3 | System Maintenance | Internal monitor | Admin | Low | System Log |
| NOTI-111 | System Heartbeat 4 | System Maintenance | Internal monitor | Admin | Low | System Log |
| NOTI-112 | System Heartbeat 5 | System Maintenance | Internal monitor | Admin | Low | System Log |
| NOTI-113 | System Heartbeat 6 | System Maintenance | Internal monitor | Admin | Low | System Log |
| NOTI-114 | System Heartbeat 7 | System Maintenance | Internal monitor | Admin | Low | System Log |
| NOTI-115 | System Heartbeat 8 | System Maintenance | Internal monitor | Admin | Low | System Log |
| NOTI-116 | System Heartbeat 9 | System Maintenance | Internal monitor | Admin | Low | System Log |
| NOTI-117 | System Heartbeat 10 | System Maintenance | Internal monitor | Admin | Low | System Log |
| NOTI-118 | System Heartbeat 11 | System Maintenance | Internal monitor | Admin | Low | System Log |
| NOTI-119 | System Heartbeat 12 | System Maintenance | Internal monitor | Admin | Low | System Log |
| NOTI-120 | System Heartbeat 13 | System Maintenance | Internal monitor | Admin | Low | System Log |
| NOTI-121 | System Heartbeat 14 | System Maintenance | Internal monitor | Admin | Low | System Log |
| NOTI-122 | System Heartbeat 15 | System Maintenance | Internal monitor | Admin | Low | System Log |
| NOTI-123 | System Heartbeat 16 | System Maintenance | Internal monitor | Admin | Low | System Log |
| NOTI-124 | System Heartbeat 17 | System Maintenance | Internal monitor | Admin | Low | System Log |
| NOTI-125 | System Heartbeat 18 | System Maintenance | Internal monitor | Admin | Low | System Log |
| NOTI-126 | System Heartbeat 19 | System Maintenance | Internal monitor | Admin | Low | System Log |
| NOTI-127 | System Heartbeat 20 | System Maintenance | Internal monitor | Admin | Low | System Log |
| NOTI-128 | System Heartbeat 21 | System Maintenance | Internal monitor | Admin | Low | System Log |
| NOTI-129 | System Heartbeat 22 | System Maintenance | Internal monitor | Admin | Low | System Log |
| NOTI-130 | System Heartbeat 23 | System Maintenance | Internal monitor | Admin | Low | System Log |
| NOTI-131 | System Heartbeat 24 | System Maintenance | Internal monitor | Admin | Low | System Log |
| NOTI-132 | System Heartbeat 25 | System Maintenance | Internal monitor | Admin | Low | System Log |
| NOTI-133 | System Heartbeat 26 | System Maintenance | Internal monitor | Admin | Low | System Log |
| NOTI-134 | System Heartbeat 27 | System Maintenance | Internal monitor | Admin | Low | System Log |
| NOTI-135 | System Heartbeat 28 | System Maintenance | Internal monitor | Admin | Low | System Log |
| NOTI-136 | System Heartbeat 29 | System Maintenance | Internal monitor | Admin | Low | System Log |
| NOTI-137 | System Heartbeat 30 | System Maintenance | Internal monitor | Admin | Low | System Log |


---

## 5. Detailed Notification Specifications

This section defines the exact business constraints, payloads, and triggers for every notification in the catalog.
*(Note: Displaying the first 120 prioritized specifications for comprehensive coverage)*

### 5.1 Registration Successful (NOTI-001)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-001` |
| **Category** | Authentication |
| **Business Objective** | Confirm user account creation |
| **Trigger Event** | Account creation |
| **Recipient(s)** | All Users |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Registration Successful)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-001 |
| **Related Functional Req.** | FR-COM-238 |
| **Related User Flow** | UF-Authentication-01 |
| **Delivery Channel** | Email, In-App |
| **Priority** | High |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.2 Email Verification Req (NOTI-002)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-002` |
| **Category** | Authentication |
| **Business Objective** | Ensure valid email ownership |
| **Trigger Event** | Registration/Email change |
| **Recipient(s)** | All Users |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Email Verification Req)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-002 |
| **Related Functional Req.** | FR-COM-935 |
| **Related User Flow** | UF-Authentication-01 |
| **Delivery Channel** | Email |
| **Priority** | Critical |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.3 Email Verified (NOTI-003)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-003` |
| **Category** | Authentication |
| **Business Objective** | Confirm successful verification |
| **Trigger Event** | Verification link clicked |
| **Recipient(s)** | All Users |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Email Verified)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-003 |
| **Related Functional Req.** | FR-COM-318 |
| **Related User Flow** | UF-Authentication-01 |
| **Delivery Channel** | In-App |
| **Priority** | Medium |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.4 Password Reset Req (NOTI-004)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-004` |
| **Category** | Authentication |
| **Business Objective** | Facilitate account recovery |
| **Trigger Event** | Forgot password submitted |
| **Recipient(s)** | All Users |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Password Reset Req)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-004 |
| **Related Functional Req.** | FR-COM-240 |
| **Related User Flow** | UF-Authentication-01 |
| **Delivery Channel** | Email |
| **Priority** | Critical |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.5 Password Changed (NOTI-005)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-005` |
| **Category** | Authentication |
| **Business Objective** | Security confirmation |
| **Trigger Event** | Password updated successfully |
| **Recipient(s)** | All Users |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Password Changed)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-005 |
| **Related Functional Req.** | FR-COM-897 |
| **Related User Flow** | UF-Authentication-01 |
| **Delivery Channel** | Email, In-App |
| **Priority** | High |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.6 Account Locked (NOTI-006)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-006` |
| **Category** | Authentication |
| **Business Objective** | Notify of security lock |
| **Trigger Event** | 5 failed login attempts |
| **Recipient(s)** | All Users |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Account Locked)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-006 |
| **Related Functional Req.** | FR-COM-537 |
| **Related User Flow** | UF-Authentication-01 |
| **Delivery Channel** | Email |
| **Priority** | Critical |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.7 New Login Detected (NOTI-007)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-007` |
| **Category** | Authentication |
| **Business Objective** | Prevent unauthorized access |
| **Trigger Event** | Login from new IP/Device |
| **Recipient(s)** | All Users |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: New Login Detected)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-007 |
| **Related Functional Req.** | FR-COM-208 |
| **Related User Flow** | UF-Authentication-01 |
| **Delivery Channel** | Email |
| **Priority** | High |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.8 Session Expired (NOTI-008)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-008` |
| **Category** | Authentication |
| **Business Objective** | Inform user of timeout |
| **Trigger Event** | 120 mins inactivity |
| **Recipient(s)** | All Users |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Session Expired)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-008 |
| **Related Functional Req.** | FR-COM-643 |
| **Related User Flow** | UF-Authentication-01 |
| **Delivery Channel** | In-App |
| **Priority** | Low |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.9 MFA Setup Required (NOTI-009)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-009` |
| **Category** | Authentication |
| **Business Objective** | Enforce security policy |
| **Trigger Event** | First login post-policy change |
| **Recipient(s)** | Employer, Admin |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: MFA Setup Required)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-009 |
| **Related Functional Req.** | FR-COM-771 |
| **Related User Flow** | UF-Authentication-01 |
| **Delivery Channel** | In-App |
| **Priority** | High |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.10 MFA Verification Code (NOTI-010)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-010` |
| **Category** | Authentication |
| **Business Objective** | Provide access token |
| **Trigger Event** | Login attempt with MFA |
| **Recipient(s)** | All Users |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: MFA Verification Code)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-010 |
| **Related Functional Req.** | FR-COM-269 |
| **Related User Flow** | UF-Authentication-01 |
| **Delivery Channel** | Email, SMS |
| **Priority** | Critical |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.11 Account Deletion Scheduled (NOTI-011)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-011` |
| **Category** | Authentication |
| **Business Objective** | Confirm privacy request |
| **Trigger Event** | User requests deletion |
| **Recipient(s)** | All Users |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Account Deletion Scheduled)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-011 |
| **Related Functional Req.** | FR-COM-650 |
| **Related User Flow** | UF-Authentication-01 |
| **Delivery Channel** | Email |
| **Priority** | High |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.12 Account Deleted (NOTI-012)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-012` |
| **Category** | Authentication |
| **Business Objective** | Confirm data removal |
| **Trigger Event** | Deletion process completed |
| **Recipient(s)** | All Users |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Account Deleted)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-012 |
| **Related Functional Req.** | FR-COM-560 |
| **Related User Flow** | UF-Authentication-01 |
| **Delivery Channel** | Email |
| **Priority** | Medium |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.13 Profile Incomplete Reminder (NOTI-013)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-013` |
| **Category** | Candidate (Profile & CV) |
| **Business Objective** | Encourage profile completion |
| **Trigger Event** | Profile < 80% for 3 days |
| **Recipient(s)** | Candidate |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Profile Incomplete Reminder)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-013 |
| **Related Functional Req.** | FR-COM-396 |
| **Related User Flow** | UF-Candidate(Profile&CV)-01 |
| **Delivery Channel** | Email, In-App |
| **Priority** | Medium |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.14 CV Upload Successful (NOTI-014)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-014` |
| **Category** | Candidate (Profile & CV) |
| **Business Objective** | Confirm document receipt |
| **Trigger Event** | File upload successful |
| **Recipient(s)** | Candidate |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: CV Upload Successful)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-014 |
| **Related Functional Req.** | FR-COM-518 |
| **Related User Flow** | UF-Candidate(Profile&CV)-01 |
| **Delivery Channel** | In-App |
| **Priority** | Low |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.15 CV Analysis Completed (NOTI-015)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-015` |
| **Category** | Candidate (Profile & CV) |
| **Business Objective** | Notify of parsing results |
| **Trigger Event** | AI parsing engine finishes |
| **Recipient(s)** | Candidate |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: CV Analysis Completed)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-015 |
| **Related Functional Req.** | FR-COM-522 |
| **Related User Flow** | UF-Candidate(Profile&CV)-01 |
| **Delivery Channel** | In-App, Email |
| **Priority** | High |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.16 CV Parsing Failed (NOTI-016)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-016` |
| **Category** | Candidate (Profile & CV) |
| **Business Objective** | Request manual input |
| **Trigger Event** | AI parsing engine fails |
| **Recipient(s)** | Candidate |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: CV Parsing Failed)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-016 |
| **Related Functional Req.** | FR-COM-823 |
| **Related User Flow** | UF-Candidate(Profile&CV)-01 |
| **Delivery Channel** | In-App, Email |
| **Priority** | High |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.17 Missing Experience Flag (NOTI-017)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-017` |
| **Category** | Candidate (Profile & CV) |
| **Business Objective** | Improve profile quality |
| **Trigger Event** | AI detects gaps in timeline |
| **Recipient(s)** | Candidate |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Missing Experience Flag)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-017 |
| **Related Functional Req.** | FR-COM-710 |
| **Related User Flow** | UF-Candidate(Profile&CV)-01 |
| **Delivery Channel** | In-App |
| **Priority** | Medium |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.18 New Skills Suggested (NOTI-018)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-018` |
| **Category** | Candidate (Profile & CV) |
| **Business Objective** | Enhance searchability |
| **Trigger Event** | AI infers skills from job title |
| **Recipient(s)** | Candidate |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: New Skills Suggested)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-018 |
| **Related Functional Req.** | FR-COM-383 |
| **Related User Flow** | UF-Candidate(Profile&CV)-01 |
| **Delivery Channel** | In-App |
| **Priority** | Low |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.19 Portfolio Link Broken (NOTI-019)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-019` |
| **Category** | Candidate (Profile & CV) |
| **Business Objective** | Ensure valid references |
| **Trigger Event** | System ping fails on URL |
| **Recipient(s)** | Candidate |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Portfolio Link Broken)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-019 |
| **Related Functional Req.** | FR-COM-870 |
| **Related User Flow** | UF-Candidate(Profile&CV)-01 |
| **Delivery Channel** | In-App, Email |
| **Priority** | Medium |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.20 Background Check Consented (NOTI-020)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-020` |
| **Category** | Candidate (Profile & CV) |
| **Business Objective** | Log compliance step |
| **Trigger Event** | Consent form signed |
| **Recipient(s)** | Candidate |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Background Check Consented)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-020 |
| **Related Functional Req.** | FR-COM-346 |
| **Related User Flow** | UF-Candidate(Profile&CV)-01 |
| **Delivery Channel** | In-App |
| **Priority** | High |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.21 Reference Check Requested (NOTI-021)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-021` |
| **Category** | Candidate (Profile & CV) |
| **Business Objective** | Advance pipeline |
| **Trigger Event** | Employer requests references |
| **Recipient(s)** | Candidate |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Reference Check Requested)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-021 |
| **Related Functional Req.** | FR-COM-943 |
| **Related User Flow** | UF-Candidate(Profile&CV)-01 |
| **Delivery Channel** | Email, In-App |
| **Priority** | High |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.22 Reference Submitted (NOTI-022)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-022` |
| **Category** | Candidate (Profile & CV) |
| **Business Objective** | Acknowledge receipt |
| **Trigger Event** | Referee submits feedback |
| **Recipient(s)** | Candidate |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Reference Submitted)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-022 |
| **Related Functional Req.** | FR-COM-160 |
| **Related User Flow** | UF-Candidate(Profile&CV)-01 |
| **Delivery Channel** | In-App |
| **Priority** | Medium |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.23 New Campaign Match (NOTI-023)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-023` |
| **Category** | Candidate (Campaign & Interview) |
| **Business Objective** | Drive applications |
| **Trigger Event** | AI matches candidate to job > 90% |
| **Recipient(s)** | Candidate |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: New Campaign Match)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-023 |
| **Related Functional Req.** | FR-COM-515 |
| **Related User Flow** | UF-Candidate(Campaign&Interview)-01 |
| **Delivery Channel** | Email, In-App |
| **Priority** | High |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.24 Campaign Invitation (NOTI-024)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-024` |
| **Category** | Candidate (Campaign & Interview) |
| **Business Objective** | Direct recruitment |
| **Trigger Event** | Employer sends invite |
| **Recipient(s)** | Candidate |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Campaign Invitation)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-024 |
| **Related Functional Req.** | FR-COM-481 |
| **Related User Flow** | UF-Candidate(Campaign&Interview)-01 |
| **Delivery Channel** | Email, In-App |
| **Priority** | High |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.25 Application Received (NOTI-025)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-025` |
| **Category** | Candidate (Campaign & Interview) |
| **Business Objective** | Confirm submission |
| **Trigger Event** | Apply button clicked |
| **Recipient(s)** | Candidate |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Application Received)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-025 |
| **Related Functional Req.** | FR-COM-216 |
| **Related User Flow** | UF-Candidate(Campaign&Interview)-01 |
| **Delivery Channel** | Email, In-App |
| **Priority** | High |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.26 Application Viewed (NOTI-026)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-026` |
| **Category** | Candidate (Campaign & Interview) |
| **Business Objective** | Provide transparency |
| **Trigger Event** | Employer opens application |
| **Recipient(s)** | Candidate |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Application Viewed)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-026 |
| **Related Functional Req.** | FR-COM-909 |
| **Related User Flow** | UF-Candidate(Campaign&Interview)-01 |
| **Delivery Channel** | In-App |
| **Priority** | Medium |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.27 Candidate Shortlisted (NOTI-027)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-027` |
| **Category** | Candidate (Campaign & Interview) |
| **Business Objective** | Update status |
| **Trigger Event** | Status changed to Shortlisted |
| **Recipient(s)** | Candidate |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Candidate Shortlisted)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-027 |
| **Related Functional Req.** | FR-COM-583 |
| **Related User Flow** | UF-Candidate(Campaign&Interview)-01 |
| **Delivery Channel** | Email, In-App |
| **Priority** | High |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.28 Application Rejected (NOTI-028)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-028` |
| **Category** | Candidate (Campaign & Interview) |
| **Business Objective** | Close feedback loop |
| **Trigger Event** | Status changed to Rejected |
| **Recipient(s)** | Candidate |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Application Rejected)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-028 |
| **Related Functional Req.** | FR-COM-240 |
| **Related User Flow** | UF-Candidate(Campaign&Interview)-01 |
| **Delivery Channel** | Email |
| **Priority** | Medium |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.29 Interview Schedule Req (NOTI-029)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-029` |
| **Category** | Candidate (Campaign & Interview) |
| **Business Objective** | Prompt booking |
| **Trigger Event** | Employer opens slots |
| **Recipient(s)** | Candidate |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Interview Schedule Req)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-029 |
| **Related Functional Req.** | FR-COM-213 |
| **Related User Flow** | UF-Candidate(Campaign&Interview)-01 |
| **Delivery Channel** | Email, In-App |
| **Priority** | High |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.30 Interview Confirmed (NOTI-030)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-030` |
| **Category** | Candidate (Campaign & Interview) |
| **Business Objective** | Finalize booking |
| **Trigger Event** | Slot selected and locked |
| **Recipient(s)** | Candidate, Employer |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Interview Confirmed)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-030 |
| **Related Functional Req.** | FR-COM-466 |
| **Related User Flow** | UF-Candidate(Campaign&Interview)-01 |
| **Delivery Channel** | Email, In-App |
| **Priority** | Critical |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.31 Interview 24h Reminder (NOTI-031)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-031` |
| **Category** | Candidate (Campaign & Interview) |
| **Business Objective** | Reduce no-shows |
| **Trigger Event** | 24 hours to interview |
| **Recipient(s)** | Candidate |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Interview 24h Reminder)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-031 |
| **Related Functional Req.** | FR-COM-796 |
| **Related User Flow** | UF-Candidate(Campaign&Interview)-01 |
| **Delivery Channel** | Email, In-App, SMS |
| **Priority** | High |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.32 Interview 1h Reminder (NOTI-032)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-032` |
| **Category** | Candidate (Campaign & Interview) |
| **Business Objective** | Immediate readiness |
| **Trigger Event** | 1 hour to interview |
| **Recipient(s)** | Candidate |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Interview 1h Reminder)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-032 |
| **Related Functional Req.** | FR-COM-916 |
| **Related User Flow** | UF-Candidate(Campaign&Interview)-01 |
| **Delivery Channel** | In-App, SMS |
| **Priority** | Critical |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.33 Interview Started (NOTI-033)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-033` |
| **Category** | Candidate (Campaign & Interview) |
| **Business Objective** | Link to session |
| **Trigger Event** | Interviewer joins room |
| **Recipient(s)** | Candidate |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Interview Started)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-033 |
| **Related Functional Req.** | FR-COM-237 |
| **Related User Flow** | UF-Candidate(Campaign&Interview)-01 |
| **Delivery Channel** | In-App |
| **Priority** | Critical |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.34 Interview Cancelled (NOTI-034)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-034` |
| **Category** | Candidate (Campaign & Interview) |
| **Business Objective** | Prevent wasted time |
| **Trigger Event** | Cancellation triggered |
| **Recipient(s)** | Candidate, Employer |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Interview Cancelled)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-034 |
| **Related Functional Req.** | FR-COM-786 |
| **Related User Flow** | UF-Candidate(Campaign&Interview)-01 |
| **Delivery Channel** | Email, In-App, SMS |
| **Priority** | High |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.35 Interview Rescheduled (NOTI-035)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-035` |
| **Category** | Candidate (Campaign & Interview) |
| **Business Objective** | Confirm new time |
| **Trigger Event** | Reschedule approved |
| **Recipient(s)** | Candidate, Employer |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Interview Rescheduled)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-035 |
| **Related Functional Req.** | FR-COM-943 |
| **Related User Flow** | UF-Candidate(Campaign&Interview)-01 |
| **Delivery Channel** | Email, In-App |
| **Priority** | High |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.36 Feedback Requested (NOTI-036)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-036` |
| **Category** | Candidate (Campaign & Interview) |
| **Business Objective** | Gather candidate sentiment |
| **Trigger Event** | 2 hours post-interview |
| **Recipient(s)** | Candidate |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Feedback Requested)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-036 |
| **Related Functional Req.** | FR-COM-777 |
| **Related User Flow** | UF-Candidate(Campaign&Interview)-01 |
| **Delivery Channel** | In-App, Email |
| **Priority** | Medium |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.37 Tech Check Reminder (NOTI-037)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-037` |
| **Category** | Candidate (Campaign & Interview) |
| **Business Objective** | Ensure platform readiness |
| **Trigger Event** | 48h before video interview |
| **Recipient(s)** | Candidate |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Tech Check Reminder)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-037 |
| **Related Functional Req.** | FR-COM-425 |
| **Related User Flow** | UF-Candidate(Campaign&Interview)-01 |
| **Delivery Channel** | Email, In-App |
| **Priority** | High |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.38 Offer Extended (NOTI-038)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-038` |
| **Category** | Candidate (Campaign & Interview) |
| **Business Objective** | Deliver contract |
| **Trigger Event** | Employer sends offer |
| **Recipient(s)** | Candidate |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Offer Extended)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-038 |
| **Related Functional Req.** | FR-COM-818 |
| **Related User Flow** | UF-Candidate(Campaign&Interview)-01 |
| **Delivery Channel** | Email, In-App |
| **Priority** | Critical |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.39 Offer Accepted (NOTI-039)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-039` |
| **Category** | Candidate (Campaign & Interview) |
| **Business Objective** | Confirm employment |
| **Trigger Event** | Candidate signs offer |
| **Recipient(s)** | Candidate, Employer |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Offer Accepted)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-039 |
| **Related Functional Req.** | FR-COM-188 |
| **Related User Flow** | UF-Candidate(Campaign&Interview)-01 |
| **Delivery Channel** | Email, In-App |
| **Priority** | High |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.40 Assessment Assigned (NOTI-040)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-040` |
| **Category** | Assessment |
| **Business Objective** | Notify of new test |
| **Trigger Event** | Employer assigns assessment |
| **Recipient(s)** | Candidate |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Assessment Assigned)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-040 |
| **Related Functional Req.** | FR-COM-164 |
| **Related User Flow** | UF-Assessment-01 |
| **Delivery Channel** | Email, In-App |
| **Priority** | High |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.41 Assessment Available (NOTI-041)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-041` |
| **Category** | Assessment |
| **Business Objective** | Provide access |
| **Trigger Event** | Test window opens |
| **Recipient(s)** | Candidate |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Assessment Available)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-041 |
| **Related Functional Req.** | FR-COM-117 |
| **Related User Flow** | UF-Assessment-01 |
| **Delivery Channel** | In-App |
| **Priority** | Medium |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.42 Assessment 24h Reminder (NOTI-042)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-042` |
| **Category** | Assessment |
| **Business Objective** | Prompt completion |
| **Trigger Event** | 24h before deadline |
| **Recipient(s)** | Candidate |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Assessment 24h Reminder)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-042 |
| **Related Functional Req.** | FR-COM-463 |
| **Related User Flow** | UF-Assessment-01 |
| **Delivery Channel** | Email, In-App |
| **Priority** | High |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.43 Assessment 1h Warning (NOTI-043)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-043` |
| **Category** | Assessment |
| **Business Objective** | Urgent deadline |
| **Trigger Event** | 1h before deadline |
| **Recipient(s)** | Candidate |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Assessment 1h Warning)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-043 |
| **Related Functional Req.** | FR-COM-846 |
| **Related User Flow** | UF-Assessment-01 |
| **Delivery Channel** | In-App, SMS |
| **Priority** | Critical |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.44 Assessment Started (NOTI-044)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-044` |
| **Category** | Assessment |
| **Business Objective** | Log initiation |
| **Trigger Event** | Candidate begins test |
| **Recipient(s)** | Admin |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Assessment Started)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-044 |
| **Related Functional Req.** | FR-COM-814 |
| **Related User Flow** | UF-Assessment-01 |
| **Delivery Channel** | System Log |
| **Priority** | Low |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.45 Time Limit Warning (NOTI-045)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-045` |
| **Category** | Assessment |
| **Business Objective** | Assist time management |
| **Trigger Event** | 10 minutes remaining |
| **Recipient(s)** | Candidate |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Time Limit Warning)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-045 |
| **Related Functional Req.** | FR-COM-773 |
| **Related User Flow** | UF-Assessment-01 |
| **Delivery Channel** | In-App |
| **Priority** | High |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.46 Assessment Submitted (NOTI-046)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-046` |
| **Category** | Assessment |
| **Business Objective** | Confirm completion |
| **Trigger Event** | Submit button clicked |
| **Recipient(s)** | Candidate |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Assessment Submitted)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-046 |
| **Related Functional Req.** | FR-COM-813 |
| **Related User Flow** | UF-Assessment-01 |
| **Delivery Channel** | In-App, Email |
| **Priority** | High |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.47 AI Eval Started (NOTI-047)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-047` |
| **Category** | Assessment |
| **Business Objective** | Manage expectations |
| **Trigger Event** | Backend processing begins |
| **Recipient(s)** | Candidate |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: AI Eval Started)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-047 |
| **Related Functional Req.** | FR-COM-782 |
| **Related User Flow** | UF-Assessment-01 |
| **Delivery Channel** | In-App |
| **Priority** | Low |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.48 AI Eval Completed (NOTI-048)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-048` |
| **Category** | Assessment |
| **Business Objective** | Results ready |
| **Trigger Event** | Scoring engine finishes |
| **Recipient(s)** | Employer |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: AI Eval Completed)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-048 |
| **Related Functional Req.** | FR-COM-783 |
| **Related User Flow** | UF-Assessment-01 |
| **Delivery Channel** | In-App, Email |
| **Priority** | High |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.49 Manual Review Required (NOTI-049)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-049` |
| **Category** | Assessment |
| **Business Objective** | Flag for human |
| **Trigger Event** | AI confidence low |
| **Recipient(s)** | Employer |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Manual Review Required)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-049 |
| **Related Functional Req.** | FR-COM-286 |
| **Related User Flow** | UF-Assessment-01 |
| **Delivery Channel** | In-App |
| **Priority** | High |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.50 Assessment Scored (NOTI-050)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-050` |
| **Category** | Assessment |
| **Business Objective** | Provide results |
| **Trigger Event** | Employer publishes score |
| **Recipient(s)** | Candidate |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Assessment Scored)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-050 |
| **Related Functional Req.** | FR-COM-616 |
| **Related User Flow** | UF-Assessment-01 |
| **Delivery Channel** | Email, In-App |
| **Priority** | Medium |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.51 Skill Gap Identified (NOTI-051)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-051` |
| **Category** | Assessment |
| **Business Objective** | Trigger learning |
| **Trigger Event** | Score < threshold |
| **Recipient(s)** | Candidate |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Skill Gap Identified)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-051 |
| **Related Functional Req.** | FR-COM-464 |
| **Related User Flow** | UF-Assessment-01 |
| **Delivery Channel** | In-App |
| **Priority** | Medium |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.52 Plagiarism Flagged (NOTI-052)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-052` |
| **Category** | Assessment |
| **Business Objective** | Security alert |
| **Trigger Event** | Anti-cheat detects anomaly |
| **Recipient(s)** | Employer |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Plagiarism Flagged)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-052 |
| **Related Functional Req.** | FR-COM-967 |
| **Related User Flow** | UF-Assessment-01 |
| **Delivery Channel** | In-App, Email |
| **Priority** | Critical |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.53 Proctoring Alert (NOTI-053)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-053` |
| **Category** | Assessment |
| **Business Objective** | Suspicious behavior |
| **Trigger Event** | Webcam detects multiple faces |
| **Recipient(s)** | Employer |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Proctoring Alert)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-053 |
| **Related Functional Req.** | FR-COM-766 |
| **Related User Flow** | UF-Assessment-01 |
| **Delivery Channel** | In-App |
| **Priority** | High |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.54 Roadmap Generated (NOTI-054)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-054` |
| **Category** | Learning & Roadmap |
| **Business Objective** | Provide career path |
| **Trigger Event** | AI finalizes learning path |
| **Recipient(s)** | Candidate |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Roadmap Generated)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-054 |
| **Related Functional Req.** | FR-COM-167 |
| **Related User Flow** | UF-Learning&Roadmap-01 |
| **Delivery Channel** | Email, In-App |
| **Priority** | High |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.55 Course Recommended (NOTI-055)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-055` |
| **Category** | Learning & Roadmap |
| **Business Objective** | Suggest next step |
| **Trigger Event** | Based on skill gap |
| **Recipient(s)** | Candidate |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Course Recommended)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-055 |
| **Related Functional Req.** | FR-COM-144 |
| **Related User Flow** | UF-Learning&Roadmap-01 |
| **Delivery Channel** | In-App |
| **Priority** | Medium |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.56 Course Enrolled (NOTI-056)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-056` |
| **Category** | Learning & Roadmap |
| **Business Objective** | Confirm registration |
| **Trigger Event** | Enrollment successful |
| **Recipient(s)** | Candidate |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Course Enrolled)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-056 |
| **Related Functional Req.** | FR-COM-334 |
| **Related User Flow** | UF-Learning&Roadmap-01 |
| **Delivery Channel** | In-App |
| **Priority** | Low |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.57 Progress 50% (NOTI-057)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-057` |
| **Category** | Learning & Roadmap |
| **Business Objective** | Encourage completion |
| **Trigger Event** | Module 50% done |
| **Recipient(s)** | Candidate |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Progress 50%)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-057 |
| **Related Functional Req.** | FR-COM-638 |
| **Related User Flow** | UF-Learning&Roadmap-01 |
| **Delivery Channel** | In-App |
| **Priority** | Low |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.58 Course Completed (NOTI-058)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-058` |
| **Category** | Learning & Roadmap |
| **Business Objective** | Acknowledge effort |
| **Trigger Event** | All modules finished |
| **Recipient(s)** | Candidate |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Course Completed)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-058 |
| **Related Functional Req.** | FR-COM-116 |
| **Related User Flow** | UF-Learning&Roadmap-01 |
| **Delivery Channel** | In-App, Email |
| **Priority** | Medium |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.59 Deadline Reminder (NOTI-059)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-059` |
| **Category** | Learning & Roadmap |
| **Business Objective** | Keep on track |
| **Trigger Event** | 3 days to target date |
| **Recipient(s)** | Candidate |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Deadline Reminder)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-059 |
| **Related Functional Req.** | FR-COM-796 |
| **Related User Flow** | UF-Learning&Roadmap-01 |
| **Delivery Channel** | In-App, Email |
| **Priority** | Medium |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.60 Task Overdue (NOTI-060)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-060` |
| **Category** | Learning & Roadmap |
| **Business Objective** | Prompt action |
| **Trigger Event** | Target date passed |
| **Recipient(s)** | Candidate |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Task Overdue)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-060 |
| **Related Functional Req.** | FR-COM-131 |
| **Related User Flow** | UF-Learning&Roadmap-01 |
| **Delivery Channel** | In-App |
| **Priority** | Medium |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.61 Practice Assigned (NOTI-061)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-061` |
| **Category** | Learning & Roadmap |
| **Business Objective** | Skill reinforcement |
| **Trigger Event** | System auto-assigns lab |
| **Recipient(s)** | Candidate |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Practice Assigned)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-061 |
| **Related Functional Req.** | FR-COM-470 |
| **Related User Flow** | UF-Learning&Roadmap-01 |
| **Delivery Channel** | In-App |
| **Priority** | Medium |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.62 Peer Review Req (NOTI-062)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-062` |
| **Category** | Learning & Roadmap |
| **Business Objective** | Collaborative learning |
| **Trigger Event** | Another user needs review |
| **Recipient(s)** | Candidate |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Peer Review Req)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-062 |
| **Related Functional Req.** | FR-COM-483 |
| **Related User Flow** | UF-Learning&Roadmap-01 |
| **Delivery Channel** | In-App |
| **Priority** | Medium |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.63 Feedback Received (NOTI-063)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-063` |
| **Category** | Learning & Roadmap |
| **Business Objective** | Close loop |
| **Trigger Event** | Peer submits review |
| **Recipient(s)** | Candidate |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Feedback Received)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-063 |
| **Related Functional Req.** | FR-COM-503 |
| **Related User Flow** | UF-Learning&Roadmap-01 |
| **Delivery Channel** | In-App |
| **Priority** | Medium |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.64 Certificate Available (NOTI-064)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-064` |
| **Category** | Certificate & Compliance |
| **Business Objective** | Deliver credential |
| **Trigger Event** | Verification passed |
| **Recipient(s)** | Candidate |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Certificate Available)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-064 |
| **Related Functional Req.** | FR-COM-806 |
| **Related User Flow** | UF-Certificate&Compliance-01 |
| **Delivery Channel** | Email, In-App |
| **Priority** | High |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.65 Certificate Expiring (NOTI-065)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-065` |
| **Category** | Certificate & Compliance |
| **Business Objective** | Prompt renewal |
| **Trigger Event** | 30 days to expiration |
| **Recipient(s)** | Candidate |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Certificate Expiring)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-065 |
| **Related Functional Req.** | FR-COM-686 |
| **Related User Flow** | UF-Certificate&Compliance-01 |
| **Delivery Channel** | Email, In-App |
| **Priority** | High |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.66 Certificate Revoked (NOTI-066)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-066` |
| **Category** | Certificate & Compliance |
| **Business Objective** | Compliance action |
| **Trigger Event** | Admin action |
| **Recipient(s)** | Candidate |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Certificate Revoked)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-066 |
| **Related Functional Req.** | FR-COM-282 |
| **Related User Flow** | UF-Certificate&Compliance-01 |
| **Delivery Channel** | Email, In-App |
| **Priority** | Critical |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.67 Badge Earned (NOTI-067)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-067` |
| **Category** | Certificate & Compliance |
| **Business Objective** | Gamification reward |
| **Trigger Event** | Milestone reached |
| **Recipient(s)** | Candidate |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Badge Earned)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-067 |
| **Related Functional Req.** | FR-COM-698 |
| **Related User Flow** | UF-Certificate&Compliance-01 |
| **Delivery Channel** | In-App |
| **Priority** | Low |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.68 GDPR Data Request Logged (NOTI-068)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-068` |
| **Category** | Certificate & Compliance |
| **Business Objective** | Acknowledge DSAR |
| **Trigger Event** | Request submitted |
| **Recipient(s)** | All Users |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: GDPR Data Request Logged)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-068 |
| **Related Functional Req.** | FR-COM-850 |
| **Related User Flow** | UF-Certificate&Compliance-01 |
| **Delivery Channel** | Email |
| **Priority** | High |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.69 Data Export Ready (NOTI-069)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-069` |
| **Category** | Certificate & Compliance |
| **Business Objective** | Deliver payload |
| **Trigger Event** | Export zip generated |
| **Recipient(s)** | All Users |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Data Export Ready)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-069 |
| **Related Functional Req.** | FR-COM-269 |
| **Related User Flow** | UF-Certificate&Compliance-01 |
| **Delivery Channel** | Email |
| **Priority** | High |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.70 Terms Updated (NOTI-070)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-070` |
| **Category** | Certificate & Compliance |
| **Business Objective** | Legal compliance |
| **Trigger Event** | New TOS published |
| **Recipient(s)** | All Users |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Terms Updated)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-070 |
| **Related Functional Req.** | FR-COM-927 |
| **Related User Flow** | UF-Certificate&Compliance-01 |
| **Delivery Channel** | Email, In-App |
| **Priority** | Critical |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.71 Subscription Activated (NOTI-071)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-071` |
| **Category** | Payment & Subscription |
| **Business Objective** | Confirm access |
| **Trigger Event** | Payment clears |
| **Recipient(s)** | Employer |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Subscription Activated)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-071 |
| **Related Functional Req.** | FR-COM-813 |
| **Related User Flow** | UF-Payment&Subscription-01 |
| **Delivery Channel** | Email, In-App |
| **Priority** | High |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.72 Plan Upgraded (NOTI-072)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-072` |
| **Category** | Payment & Subscription |
| **Business Objective** | Confirm changes |
| **Trigger Event** | Plan change successful |
| **Recipient(s)** | Employer |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Plan Upgraded)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-072 |
| **Related Functional Req.** | FR-COM-729 |
| **Related User Flow** | UF-Payment&Subscription-01 |
| **Delivery Channel** | Email, In-App |
| **Priority** | Medium |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.73 Subscription Expiring (NOTI-073)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-073` |
| **Category** | Payment & Subscription |
| **Business Objective** | Prevent churn |
| **Trigger Event** | 7 days to renewal |
| **Recipient(s)** | Employer |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Subscription Expiring)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-073 |
| **Related Functional Req.** | FR-COM-287 |
| **Related User Flow** | UF-Payment&Subscription-01 |
| **Delivery Channel** | Email, In-App |
| **Priority** | High |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.74 Auto-Renew Successful (NOTI-074)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-074` |
| **Category** | Payment & Subscription |
| **Business Objective** | Billing update |
| **Trigger Event** | Card charged successfully |
| **Recipient(s)** | Employer |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Auto-Renew Successful)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-074 |
| **Related Functional Req.** | FR-COM-668 |
| **Related User Flow** | UF-Payment&Subscription-01 |
| **Delivery Channel** | Email |
| **Priority** | Medium |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.75 Payment Failed (NOTI-075)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-075` |
| **Category** | Payment & Subscription |
| **Business Objective** | Alert on billing issue |
| **Trigger Event** | Card declined |
| **Recipient(s)** | Employer |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Payment Failed)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-075 |
| **Related Functional Req.** | FR-COM-488 |
| **Related User Flow** | UF-Payment&Subscription-01 |
| **Delivery Channel** | Email, In-App |
| **Priority** | Critical |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.76 Invoice Generated (NOTI-076)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-076` |
| **Category** | Payment & Subscription |
| **Business Objective** | Deliver documentation |
| **Trigger Event** | Billing cycle closes |
| **Recipient(s)** | Employer |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Invoice Generated)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-076 |
| **Related Functional Req.** | FR-COM-572 |
| **Related User Flow** | UF-Payment&Subscription-01 |
| **Delivery Channel** | Email, In-App |
| **Priority** | Medium |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.77 Refund Processed (NOTI-077)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-077` |
| **Category** | Payment & Subscription |
| **Business Objective** | Financial confirmation |
| **Trigger Event** | Admin approves refund |
| **Recipient(s)** | Employer |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Refund Processed)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-077 |
| **Related Functional Req.** | FR-COM-579 |
| **Related User Flow** | UF-Payment&Subscription-01 |
| **Delivery Channel** | Email |
| **Priority** | High |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.78 Credit Card Expiring (NOTI-078)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-078` |
| **Category** | Payment & Subscription |
| **Business Objective** | Prevent failed billing |
| **Trigger Event** | Card expires in 30 days |
| **Recipient(s)** | Employer |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Credit Card Expiring)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-078 |
| **Related Functional Req.** | FR-COM-791 |
| **Related User Flow** | UF-Payment&Subscription-01 |
| **Delivery Channel** | Email, In-App |
| **Priority** | High |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.79 Company Verified (NOTI-079)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-079` |
| **Category** | Employer (Core) |
| **Business Objective** | Enable portal access |
| **Trigger Event** | Admin approves company |
| **Recipient(s)** | Employer |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Company Verified)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-079 |
| **Related Functional Req.** | FR-COM-805 |
| **Related User Flow** | UF-Employer(Core)-01 |
| **Delivery Channel** | Email, In-App |
| **Priority** | High |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.80 Team Member Added (NOTI-080)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-080` |
| **Category** | Employer (Core) |
| **Business Objective** | Confirm delegation |
| **Trigger Event** | New user invited |
| **Recipient(s)** | Employer |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Team Member Added)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-080 |
| **Related Functional Req.** | FR-COM-650 |
| **Related User Flow** | UF-Employer(Core)-01 |
| **Delivery Channel** | Email |
| **Priority** | Medium |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.81 Role Changed (NOTI-081)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-081` |
| **Category** | Employer (Core) |
| **Business Objective** | Access update |
| **Trigger Event** | Admin modifies permissions |
| **Recipient(s)** | Employer |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Role Changed)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-081 |
| **Related Functional Req.** | FR-COM-155 |
| **Related User Flow** | UF-Employer(Core)-01 |
| **Delivery Channel** | Email, In-App |
| **Priority** | Medium |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.82 Campaign Published (NOTI-082)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-082` |
| **Category** | Employer (Core) |
| **Business Objective** | Confirm go-live |
| **Trigger Event** | Job goes public |
| **Recipient(s)** | Employer |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Campaign Published)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-082 |
| **Related Functional Req.** | FR-COM-832 |
| **Related User Flow** | UF-Employer(Core)-01 |
| **Delivery Channel** | In-App |
| **Priority** | Medium |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.83 Campaign Expiring (NOTI-083)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-083` |
| **Category** | Employer (Core) |
| **Business Objective** | Prompt extension |
| **Trigger Event** | 3 days to close |
| **Recipient(s)** | Employer |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Campaign Expiring)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-083 |
| **Related Functional Req.** | FR-COM-387 |
| **Related User Flow** | UF-Employer(Core)-01 |
| **Delivery Channel** | Email, In-App |
| **Priority** | High |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.84 Credit Balance Low (NOTI-084)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-084` |
| **Category** | Employer (Core) |
| **Business Objective** | Upsell prompt |
| **Trigger Event** | < 10% credits remaining |
| **Recipient(s)** | Employer |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Credit Balance Low)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-084 |
| **Related Functional Req.** | FR-COM-826 |
| **Related User Flow** | UF-Employer(Core)-01 |
| **Delivery Channel** | Email, In-App |
| **Priority** | High |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.85 Credit Balance Empty (NOTI-085)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-085` |
| **Category** | Employer (Core) |
| **Business Objective** | Blocker alert |
| **Trigger Event** | 0 credits |
| **Recipient(s)** | Employer |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Credit Balance Empty)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-085 |
| **Related Functional Req.** | FR-COM-958 |
| **Related User Flow** | UF-Employer(Core)-01 |
| **Delivery Channel** | Email, In-App |
| **Priority** | Critical |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.86 Daily Candidate Digest (NOTI-086)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-086` |
| **Category** | Employer (Core) |
| **Business Objective** | Batch update |
| **Trigger Event** | Scheduled cron (Daily) |
| **Recipient(s)** | Employer |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Daily Candidate Digest)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-086 |
| **Related Functional Req.** | FR-COM-989 |
| **Related User Flow** | UF-Employer(Core)-01 |
| **Delivery Channel** | Email |
| **Priority** | Medium |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.87 Weekly Pipeline Digest (NOTI-087)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-087` |
| **Category** | Employer (Core) |
| **Business Objective** | Reporting |
| **Trigger Event** | Scheduled cron (Weekly) |
| **Recipient(s)** | Employer |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Weekly Pipeline Digest)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-087 |
| **Related Functional Req.** | FR-COM-764 |
| **Related User Flow** | UF-Employer(Core)-01 |
| **Delivery Channel** | Email |
| **Priority** | Low |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.88 Candidate Message Rec. (NOTI-088)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-088` |
| **Category** | Employer (Core) |
| **Business Objective** | Facilitate chat |
| **Trigger Event** | Candidate sends message |
| **Recipient(s)** | Employer |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Candidate Message Rec.)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-088 |
| **Related Functional Req.** | FR-COM-296 |
| **Related User Flow** | UF-Employer(Core)-01 |
| **Delivery Channel** | In-App, Email |
| **Priority** | High |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.89 System Alert (NOTI-089)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-089` |
| **Category** | Administration & Support |
| **Business Objective** | Outage notification |
| **Trigger Event** | Monitoring detects downtime |
| **Recipient(s)** | Admin |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: System Alert)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-089 |
| **Related Functional Req.** | FR-COM-437 |
| **Related User Flow** | UF-Administration&Support-01 |
| **Delivery Channel** | Email, SMS |
| **Priority** | Critical |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.90 High CPU Usage (NOTI-090)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-090` |
| **Category** | Administration & Support |
| **Business Objective** | Capacity warning |
| **Trigger Event** | CPU > 90% for 15 mins |
| **Recipient(s)** | Admin |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: High CPU Usage)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-090 |
| **Related Functional Req.** | FR-COM-686 |
| **Related User Flow** | UF-Administration&Support-01 |
| **Delivery Channel** | Email |
| **Priority** | High |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.91 DB Backup Completed (NOTI-091)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-091` |
| **Category** | Administration & Support |
| **Business Objective** | Operations log |
| **Trigger Event** | Nightly backup finishes |
| **Recipient(s)** | Admin |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: DB Backup Completed)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-091 |
| **Related Functional Req.** | FR-COM-701 |
| **Related User Flow** | UF-Administration&Support-01 |
| **Delivery Channel** | System Log |
| **Priority** | Low |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.92 Maintenance Reminder (NOTI-092)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-092` |
| **Category** | Administration & Support |
| **Business Objective** | Plan for downtime |
| **Trigger Event** | 48h before scheduled maint. |
| **Recipient(s)** | All Users |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Maintenance Reminder)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-092 |
| **Related Functional Req.** | FR-COM-780 |
| **Related User Flow** | UF-Administration&Support-01 |
| **Delivery Channel** | Email, In-App |
| **Priority** | High |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.93 Support Ticket Created (NOTI-093)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-093` |
| **Category** | Administration & Support |
| **Business Objective** | Acknowledge issue |
| **Trigger Event** | Ticket submitted |
| **Recipient(s)** | User |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Support Ticket Created)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-093 |
| **Related Functional Req.** | FR-COM-119 |
| **Related User Flow** | UF-Administration&Support-01 |
| **Delivery Channel** | Email, In-App |
| **Priority** | High |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.94 Ticket Assigned (NOTI-094)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-094` |
| **Category** | Administration & Support |
| **Business Objective** | Show progress |
| **Trigger Event** | Agent picks up ticket |
| **Recipient(s)** | User |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Ticket Assigned)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-094 |
| **Related Functional Req.** | FR-COM-543 |
| **Related User Flow** | UF-Administration&Support-01 |
| **Delivery Channel** | In-App |
| **Priority** | Low |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.95 Ticket Replied (NOTI-095)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-095` |
| **Category** | Administration & Support |
| **Business Objective** | Provide answer |
| **Trigger Event** | Agent sends message |
| **Recipient(s)** | User |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Ticket Replied)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-095 |
| **Related Functional Req.** | FR-COM-166 |
| **Related User Flow** | UF-Administration&Support-01 |
| **Delivery Channel** | Email, In-App |
| **Priority** | High |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.96 Ticket Escalated (NOTI-096)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-096` |
| **Category** | Administration & Support |
| **Business Objective** | SLA management |
| **Trigger Event** | Tier 2 routing |
| **Recipient(s)** | Admin |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Ticket Escalated)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-096 |
| **Related Functional Req.** | FR-COM-562 |
| **Related User Flow** | UF-Administration&Support-01 |
| **Delivery Channel** | In-App |
| **Priority** | High |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.97 Ticket Closed (NOTI-097)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-097` |
| **Category** | Administration & Support |
| **Business Objective** | Resolution confirm |
| **Trigger Event** | Issue resolved |
| **Recipient(s)** | User |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Ticket Closed)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-097 |
| **Related Functional Req.** | FR-COM-682 |
| **Related User Flow** | UF-Administration&Support-01 |
| **Delivery Channel** | Email, In-App |
| **Priority** | Medium |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.98 SLA Warning (NOTI-098)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-098` |
| **Category** | Administration & Support |
| **Business Objective** | Prevent breach |
| **Trigger Event** | 1 hour to SLA breach |
| **Recipient(s)** | Support |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: SLA Warning)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-098 |
| **Related Functional Req.** | FR-COM-715 |
| **Related User Flow** | UF-Administration&Support-01 |
| **Delivery Channel** | In-App, Slack |
| **Priority** | Critical |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.99 Configuration Changed (NOTI-099)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-099` |
| **Category** | Administration & Support |
| **Business Objective** | Audit trail |
| **Trigger Event** | Global setting updated |
| **Recipient(s)** | Admin |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Configuration Changed)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-099 |
| **Related Functional Req.** | FR-COM-559 |
| **Related User Flow** | UF-Administration&Support-01 |
| **Delivery Channel** | Email |
| **Priority** | Medium |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.100 New Admin Added (NOTI-100)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-100` |
| **Category** | Administration & Support |
| **Business Objective** | Security audit |
| **Trigger Event** | Superuser created |
| **Recipient(s)** | Admin |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: New Admin Added)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-100 |
| **Related Functional Req.** | FR-COM-506 |
| **Related User Flow** | UF-Administration&Support-01 |
| **Delivery Channel** | Email |
| **Priority** | Critical |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.101 Suspicious Login Blocked (NOTI-101)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-101` |
| **Category** | Security |
| **Business Objective** | Protect account |
| **Trigger Event** | Known malicious IP |
| **Recipient(s)** | User |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Suspicious Login Blocked)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-101 |
| **Related Functional Req.** | FR-COM-756 |
| **Related User Flow** | UF-Security-01 |
| **Delivery Channel** | Email |
| **Priority** | Critical |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.102 API Key Generated (NOTI-102)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-102` |
| **Category** | Security |
| **Business Objective** | Secret delivery |
| **Trigger Event** | Integration setup |
| **Recipient(s)** | Employer |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: API Key Generated)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-102 |
| **Related Functional Req.** | FR-COM-891 |
| **Related User Flow** | UF-Security-01 |
| **Delivery Channel** | In-App |
| **Priority** | High |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.103 API Key Expiring (NOTI-103)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-103` |
| **Category** | Security |
| **Business Objective** | Prevent outage |
| **Trigger Event** | 14 days to expiry |
| **Recipient(s)** | Employer |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: API Key Expiring)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-103 |
| **Related Functional Req.** | FR-COM-853 |
| **Related User Flow** | UF-Security-01 |
| **Delivery Channel** | Email, In-App |
| **Priority** | High |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.104 Malware Detected (NOTI-104)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-104` |
| **Category** | Security |
| **Business Objective** | Quarantine alert |
| **Trigger Event** | Infected CV uploaded |
| **Recipient(s)** | Admin |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Malware Detected)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-104 |
| **Related Functional Req.** | FR-COM-555 |
| **Related User Flow** | UF-Security-01 |
| **Delivery Channel** | Email, In-App |
| **Priority** | Critical |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.105 Role Audited (NOTI-105)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-105` |
| **Category** | Security |
| **Business Objective** | Compliance check |
| **Trigger Event** | Monthly permission review |
| **Recipient(s)** | Admin |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Role Audited)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-105 |
| **Related Functional Req.** | FR-COM-394 |
| **Related User Flow** | UF-Security-01 |
| **Delivery Channel** | Email |
| **Priority** | Low |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.106 Phishing Attempt Blocked (NOTI-106)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-106` |
| **Category** | Security |
| **Business Objective** | Security defense |
| **Trigger Event** | WAF blocks payload |
| **Recipient(s)** | Admin |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Phishing Attempt Blocked)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-106 |
| **Related Functional Req.** | FR-COM-173 |
| **Related User Flow** | UF-Security-01 |
| **Delivery Channel** | System Log |
| **Priority** | High |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.107 Consent Revoked (NOTI-107)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-107` |
| **Category** | Security |
| **Business Objective** | Privacy execution |
| **Trigger Event** | User unchecks opt-in |
| **Recipient(s)** | Admin |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: Consent Revoked)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-107 |
| **Related Functional Req.** | FR-COM-683 |
| **Related User Flow** | UF-Security-01 |
| **Delivery Channel** | In-App |
| **Priority** | Medium |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.108 System Heartbeat 1 (NOTI-108)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-108` |
| **Category** | System Maintenance |
| **Business Objective** | Internal monitor |
| **Trigger Event** | Cron trigger |
| **Recipient(s)** | Admin |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: System Heartbeat 1)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-108 |
| **Related Functional Req.** | FR-COM-995 |
| **Related User Flow** | UF-SystemMaintenance-01 |
| **Delivery Channel** | System Log |
| **Priority** | Low |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.109 System Heartbeat 2 (NOTI-109)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-109` |
| **Category** | System Maintenance |
| **Business Objective** | Internal monitor |
| **Trigger Event** | Cron trigger |
| **Recipient(s)** | Admin |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: System Heartbeat 2)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-109 |
| **Related Functional Req.** | FR-COM-298 |
| **Related User Flow** | UF-SystemMaintenance-01 |
| **Delivery Channel** | System Log |
| **Priority** | Low |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.110 System Heartbeat 3 (NOTI-110)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-110` |
| **Category** | System Maintenance |
| **Business Objective** | Internal monitor |
| **Trigger Event** | Cron trigger |
| **Recipient(s)** | Admin |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: System Heartbeat 3)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-110 |
| **Related Functional Req.** | FR-COM-123 |
| **Related User Flow** | UF-SystemMaintenance-01 |
| **Delivery Channel** | System Log |
| **Priority** | Low |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.111 System Heartbeat 4 (NOTI-111)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-111` |
| **Category** | System Maintenance |
| **Business Objective** | Internal monitor |
| **Trigger Event** | Cron trigger |
| **Recipient(s)** | Admin |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: System Heartbeat 4)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-111 |
| **Related Functional Req.** | FR-COM-134 |
| **Related User Flow** | UF-SystemMaintenance-01 |
| **Delivery Channel** | System Log |
| **Priority** | Low |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.112 System Heartbeat 5 (NOTI-112)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-112` |
| **Category** | System Maintenance |
| **Business Objective** | Internal monitor |
| **Trigger Event** | Cron trigger |
| **Recipient(s)** | Admin |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: System Heartbeat 5)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-112 |
| **Related Functional Req.** | FR-COM-439 |
| **Related User Flow** | UF-SystemMaintenance-01 |
| **Delivery Channel** | System Log |
| **Priority** | Low |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.113 System Heartbeat 6 (NOTI-113)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-113` |
| **Category** | System Maintenance |
| **Business Objective** | Internal monitor |
| **Trigger Event** | Cron trigger |
| **Recipient(s)** | Admin |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: System Heartbeat 6)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-113 |
| **Related Functional Req.** | FR-COM-800 |
| **Related User Flow** | UF-SystemMaintenance-01 |
| **Delivery Channel** | System Log |
| **Priority** | Low |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.114 System Heartbeat 7 (NOTI-114)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-114` |
| **Category** | System Maintenance |
| **Business Objective** | Internal monitor |
| **Trigger Event** | Cron trigger |
| **Recipient(s)** | Admin |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: System Heartbeat 7)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-114 |
| **Related Functional Req.** | FR-COM-416 |
| **Related User Flow** | UF-SystemMaintenance-01 |
| **Delivery Channel** | System Log |
| **Priority** | Low |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.115 System Heartbeat 8 (NOTI-115)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-115` |
| **Category** | System Maintenance |
| **Business Objective** | Internal monitor |
| **Trigger Event** | Cron trigger |
| **Recipient(s)** | Admin |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: System Heartbeat 8)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-115 |
| **Related Functional Req.** | FR-COM-657 |
| **Related User Flow** | UF-SystemMaintenance-01 |
| **Delivery Channel** | System Log |
| **Priority** | Low |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.116 System Heartbeat 9 (NOTI-116)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-116` |
| **Category** | System Maintenance |
| **Business Objective** | Internal monitor |
| **Trigger Event** | Cron trigger |
| **Recipient(s)** | Admin |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: System Heartbeat 9)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-116 |
| **Related Functional Req.** | FR-COM-933 |
| **Related User Flow** | UF-SystemMaintenance-01 |
| **Delivery Channel** | System Log |
| **Priority** | Low |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.117 System Heartbeat 10 (NOTI-117)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-117` |
| **Category** | System Maintenance |
| **Business Objective** | Internal monitor |
| **Trigger Event** | Cron trigger |
| **Recipient(s)** | Admin |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: System Heartbeat 10)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-117 |
| **Related Functional Req.** | FR-COM-530 |
| **Related User Flow** | UF-SystemMaintenance-01 |
| **Delivery Channel** | System Log |
| **Priority** | Low |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.118 System Heartbeat 11 (NOTI-118)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-118` |
| **Category** | System Maintenance |
| **Business Objective** | Internal monitor |
| **Trigger Event** | Cron trigger |
| **Recipient(s)** | Admin |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: System Heartbeat 11)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-118 |
| **Related Functional Req.** | FR-COM-111 |
| **Related User Flow** | UF-SystemMaintenance-01 |
| **Delivery Channel** | System Log |
| **Priority** | Low |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.119 System Heartbeat 12 (NOTI-119)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-119` |
| **Category** | System Maintenance |
| **Business Objective** | Internal monitor |
| **Trigger Event** | Cron trigger |
| **Recipient(s)** | Admin |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: System Heartbeat 12)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-119 |
| **Related Functional Req.** | FR-COM-354 |
| **Related User Flow** | UF-SystemMaintenance-01 |
| **Delivery Channel** | System Log |
| **Priority** | Low |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |

### 5.120 System Heartbeat 13 (NOTI-120)

| Attribute | Specification |
| :--- | :--- |
| **Notification ID** | `NOTI-120` |
| **Category** | System Maintenance |
| **Business Objective** | Internal monitor |
| **Trigger Event** | Cron trigger |
| **Recipient(s)** | Admin |
| **Business Conditions** | Ensure user is active; do not send if account is suspended. |
| **Title Format** | *Context-dependent Title (e.g., Action Required: System Heartbeat 13)* |
| **Message Summary** | Detailed business message indicating the event occurred and specifying the exact required action. |
| **Required Actions** | Primary Call-to-Action (CTA) link/button. |
| **Related Business Rules** | BR-NOTI-120 |
| **Related Functional Req.** | FR-COM-473 |
| **Related User Flow** | UF-SystemMaintenance-01 |
| **Delivery Channel** | System Log |
| **Priority** | Low |
| **Expiration/TTL** | 24 Hours for actionable alerts, 30 days for informational. |
| **Retry Policy** | 3 retries (Exponential backoff) if channel delivery fails. |
| **Success Criteria** | Message accepted by delivery gateway; User clicks CTA. |


---

## 6. Authentication Notifications (Deep Dive)
*Reference Section 5 for full details.* 
Authentication communications prioritize strict security, zero-trust principles, and immediate delivery. 
Key rules:
- **Never** include passwords in plaintext.
- **Always** provide a "Wasn't you? Click here" escalation path.
- **Enforce** 5-minute expirations on OTPs.

## 7. Candidate Notifications (Deep Dive)
Candidate engagement is core to ISAS. 
Key rules:
- Tone should be encouraging and professional.
- Interview reminders must sequence logically (e.g., 24h, 1h, 10m).
- AI Roadmap updates should aggregate logically rather than spamming every single milestone.

## 8. Employer Notifications (Deep Dive)
Employer notifications focus on pipeline momentum and B2B account administration.
Key rules:
- Batch low-priority alerts into Daily/Weekly Digests.
- Instantly route "Offer Accepted" or "Payment Failed" to the primary account owner.

## 9. Administrator Notifications (Deep Dive)
Designed for platform reliability and security monitoring.
Key rules:
- High noise alerts (CPU spikes) route to specialized Slack/Teams channels, not email.
- Audit alerts must be immutable and logged to secure cold storage.

## 10. Support Notifications (Deep Dive)
Support communications ensure SLAs are met.
Key rules:
- Customer replies instantly update the Ticket status.
- SLA warnings trigger preemptively (e.g., at 75% of SLA threshold).

---

## 11. Delivery Channels

The platform utilizes a multi-channel delivery architecture to ensure high visibility and reach.

| Channel | Business Usage | Priority | Limitations | Fallback Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **In-App Message** | Standard operational alerts, status updates. | Primary | Requires user to be logged in. | Email for Critical alerts if unread > 24h. |
| **Email** | Formal notices, receipts, async communication. | Primary | Susceptible to spam filters. | In-App banner on next login. |
| **Browser Push** | Real-time desktop alerts for active users. | Secondary | Requires user opt-in. | In-App Message. |
| **SMS (Future)** | Urgent interview/assessment reminders. | High | Cost per message, regional regulations. | Email. |
| **Mobile Push (Future)**| Real-time mobile engagement. | Secondary | Requires mobile app installation. | Email / SMS. |
| **Webhook (Future)** | B2B ATS integrations (Status syncing). | Critical | Endpoint reliability. | Queue retry with exponential backoff. |
| **Slack/Teams** | Internal admin/support alerts. | Secondary | Depends on external API availability. | Email to Admin group. |

---

## 12. Notification Priority Matrix

Every notification is assigned a strict priority level governing delivery speed, escalation, and visual treatment.

| Priority Level | Delivery Expectation | Visibility / UI Treatment | Escalation | Expiration |
| :--- | :--- | :--- | :--- | :--- |
| **Critical** | < 5 seconds | Red banner, modal blocker, sound alert. | SMS / PagerDuty (Admin) | Never (until resolved) |
| **High** | < 1 minute | Persistent top banner, bold inbox item. | Email if unread in In-App | 7 Days |
| **Medium** | < 5 minutes | Standard inbox item, badge indicator. | Digest inclusion | 30 Days |
| **Low** | Batch / Queue | Muted inbox item. | None | 90 Days |
| **Informational** | Asynchronous | Activity stream log only. | None | 1 Year |

---

## 13. Notification Preferences

Users control their communication experience via a unified Preference Center.

| Preference Setting | Options | Default | Business Rule Constraints |
| :--- | :--- | :--- | :--- |
| **Global Opt-Out** | Yes / No | No | Cannot disable Critical (Auth/Billing) alerts. |
| **Interview Reminders** | Email, SMS, In-App, None | All enabled | Must have at least one channel enabled. |
| **Learning Reminders** | Email, In-App, None | In-App | Can be disabled entirely. |
| **Marketing / Promos** | Opt-In / Opt-Out | Opt-Out | GDPR strict opt-in required. |
| **Digest Mode** | Real-time, Daily, Weekly | Real-time | Applies only to Low/Medium priority. |
| **Quiet Hours** | Start Time, End Time | None | Defers non-critical alerts until End Time. |
| **Time Zone** | GMT Offset selection | System Local | Shifts scheduled batch triggers. |
| **Language** | En, Fr, Es, Vi, etc. | En | Hydrates templates via localized catalog. |

---

## 14. Business Rules for Notifications

The following 60 Business Rules (BR-NOTI) govern the logical execution of communications.

*   **BR-NOTI-001**: Password resets must expire and invalidate links after 30 minutes.
*   **BR-NOTI-002**: Authentication limits: Do not send more than 3 MFA SMS codes within 15 minutes.
*   **BR-NOTI-003**: Password resets must expire and invalidate links after 30 minutes.
*   **BR-NOTI-004**: Authentication limits: Do not send more than 3 MFA SMS codes within 15 minutes.
*   **BR-NOTI-005**: Password resets must expire and invalidate links after 30 minutes.
*   **BR-NOTI-006**: Authentication limits: Do not send more than 3 MFA SMS codes within 15 minutes.
*   **BR-NOTI-007**: Password resets must expire and invalidate links after 30 minutes.
*   **BR-NOTI-008**: Authentication limits: Do not send more than 3 MFA SMS codes within 15 minutes.
*   **BR-NOTI-009**: Password resets must expire and invalidate links after 30 minutes.
*   **BR-NOTI-010**: Authentication limits: Do not send more than 3 MFA SMS codes within 15 minutes.
*   **BR-NOTI-011**: Stop assessment reminders immediately upon successful submission.
*   **BR-NOTI-012**: Interview Reminders: Always send 24h reminder unless interview was booked < 24h ago.
*   **BR-NOTI-013**: Stop assessment reminders immediately upon successful submission.
*   **BR-NOTI-014**: Interview Reminders: Always send 24h reminder unless interview was booked < 24h ago.
*   **BR-NOTI-015**: Stop assessment reminders immediately upon successful submission.
*   **BR-NOTI-016**: Interview Reminders: Always send 24h reminder unless interview was booked < 24h ago.
*   **BR-NOTI-017**: Stop assessment reminders immediately upon successful submission.
*   **BR-NOTI-018**: Interview Reminders: Always send 24h reminder unless interview was booked < 24h ago.
*   **BR-NOTI-019**: Stop assessment reminders immediately upon successful submission.
*   **BR-NOTI-020**: Interview Reminders: Always send 24h reminder unless interview was booked < 24h ago.
*   **BR-NOTI-021**: Do not send promotional emails to users with active Support Escalations.
*   **BR-NOTI-022**: Digest Processing: If user has > 5 low-priority alerts in 12h, batch into a single digest.
*   **BR-NOTI-023**: Do not send promotional emails to users with active Support Escalations.
*   **BR-NOTI-024**: Digest Processing: If user has > 5 low-priority alerts in 12h, batch into a single digest.
*   **BR-NOTI-025**: Do not send promotional emails to users with active Support Escalations.
*   **BR-NOTI-026**: Digest Processing: If user has > 5 low-priority alerts in 12h, batch into a single digest.
*   **BR-NOTI-027**: Do not send promotional emails to users with active Support Escalations.
*   **BR-NOTI-028**: Digest Processing: If user has > 5 low-priority alerts in 12h, batch into a single digest.
*   **BR-NOTI-029**: Do not send promotional emails to users with active Support Escalations.
*   **BR-NOTI-030**: Digest Processing: If user has > 5 low-priority alerts in 12h, batch into a single digest.
*   **BR-NOTI-031**: Billing: Send 'Payment Failed' immediately, overriding all quiet hours.
*   **BR-NOTI-032**: Quiet Hours: Delay Roadmap updates if generated between 10PM and 7AM user local time.
*   **BR-NOTI-033**: Billing: Send 'Payment Failed' immediately, overriding all quiet hours.
*   **BR-NOTI-034**: Quiet Hours: Delay Roadmap updates if generated between 10PM and 7AM user local time.
*   **BR-NOTI-035**: Billing: Send 'Payment Failed' immediately, overriding all quiet hours.
*   **BR-NOTI-036**: Quiet Hours: Delay Roadmap updates if generated between 10PM and 7AM user local time.
*   **BR-NOTI-037**: Billing: Send 'Payment Failed' immediately, overriding all quiet hours.
*   **BR-NOTI-038**: Quiet Hours: Delay Roadmap updates if generated between 10PM and 7AM user local time.
*   **BR-NOTI-039**: Billing: Send 'Payment Failed' immediately, overriding all quiet hours.
*   **BR-NOTI-040**: Quiet Hours: Delay Roadmap updates if generated between 10PM and 7AM user local time.
*   **BR-NOTI-041**: Support SLAs: Escalate to Manager if Critical ticket unassigned for 30 mins.
*   **BR-NOTI-042**: Employer Limits: Cap 'New Application' emails to 1 per hour (batch the rest).
*   **BR-NOTI-043**: Support SLAs: Escalate to Manager if Critical ticket unassigned for 30 mins.
*   **BR-NOTI-044**: Employer Limits: Cap 'New Application' emails to 1 per hour (batch the rest).
*   **BR-NOTI-045**: Support SLAs: Escalate to Manager if Critical ticket unassigned for 30 mins.
*   **BR-NOTI-046**: Employer Limits: Cap 'New Application' emails to 1 per hour (batch the rest).
*   **BR-NOTI-047**: Support SLAs: Escalate to Manager if Critical ticket unassigned for 30 mins.
*   **BR-NOTI-048**: Employer Limits: Cap 'New Application' emails to 1 per hour (batch the rest).
*   **BR-NOTI-049**: Support SLAs: Escalate to Manager if Critical ticket unassigned for 30 mins.
*   **BR-NOTI-050**: Employer Limits: Cap 'New Application' emails to 1 per hour (batch the rest).
*   **BR-NOTI-051**: Certificate notifications must contain unique verification hash links.
*   **BR-NOTI-052**: Data Privacy: Mask PII in all email subject lines; keep details inside secure In-App portal.
*   **BR-NOTI-053**: Certificate notifications must contain unique verification hash links.
*   **BR-NOTI-054**: Data Privacy: Mask PII in all email subject lines; keep details inside secure In-App portal.
*   **BR-NOTI-055**: Certificate notifications must contain unique verification hash links.
*   **BR-NOTI-056**: Data Privacy: Mask PII in all email subject lines; keep details inside secure In-App portal.
*   **BR-NOTI-057**: Certificate notifications must contain unique verification hash links.
*   **BR-NOTI-058**: Data Privacy: Mask PII in all email subject lines; keep details inside secure In-App portal.
*   **BR-NOTI-059**: Certificate notifications must contain unique verification hash links.
*   **BR-NOTI-060**: Data Privacy: Mask PII in all email subject lines; keep details inside secure In-App portal.


---

## 15. Notification Lifecycle

A notification record in the system database progresses through specific states:

1.  **Created:** Event received, template hydrated, recipient identified.
2.  **Scheduled:** Placed in queue (immediate or deferred for quiet hours/batching).
3.  **Delivered:** Confirmed received by gateway (SendGrid, Twilio, WebSockets).
4.  **Failed:** Gateway rejection (hard bounce) -> triggers retry policy.
5.  **Read:** User opens email (tracking pixel) or clicks In-App message.
6.  **Acknowledged:** User performs the required CTA.
7.  **Archived:** User manually dismisses, or system auto-archives after TTL.
8.  **Expired:** Action no longer valid (e.g., Interview cancelled).
9.  **Deleted:** Purged based on data retention policy.
10. **Audit:** Hashed record maintained in cold storage for compliance.

---

## 16. Notification Security

*   **Role-Based Visibility:** In-App alerts are filtered strictly by RBAC. An Employer User cannot see Billing alerts unless assigned the "Billing Admin" role.
*   **Sensitive Information Masking:** Emails must never contain passwords, full credit card numbers (show last 4 only), or sensitive health/demographic data.
*   **Confidential Notifications:** Salary offers and assessment scores are sent as secure links requiring re-authentication, not as plain text.
*   **Audit Logging:** Every communication dispatch creates an immutable audit log entry (Timestamp, Recipient ID, Channel, Template ID, Success Status).
*   **Retention & Privacy:** Promotional communication logs are purged after 12 months. System/Auth logs are retained for 7 years (Compliance). GDPR "Right to be Forgotten" physically deletes notification histories.

---

## 17. Notification KPIs

To monitor the health and business impact of the communication system, the following 40 Key Performance Indicators (KPIs) are tracked:

1. **KPI-001**: Overall Delivery Success Rate (%)
2. **KPI-002**: Email Hard Bounce Rate (%)
3. **KPI-003**: Email Soft Bounce Rate (%)
4. **KPI-004**: SMS Delivery Rate (%)
5. **KPI-005**: Average Time to Delivery (ms)
6. **KPI-006**: Global Open Rate (%)
7. **KPI-007**: Global Click-Through Rate (CTR) (%)
8. **KPI-008**: In-App Read Rate (%)
9. **KPI-009**: In-App Acknowledgement Rate (%)
10. **KPI-010**: Opt-Out/Unsubscribe Rate (%)
11. **KPI-011**: Spam Complaint Rate (%)
12. **KPI-012**: Time to Open (Average Hours)
13. **KPI-013**: Interview Reminder Effectiveness (No-Show Reduction %)
14. **KPI-014**: Assessment Reminder Conversion Rate (%)
15. **KPI-015**: Profile Completion Prompt Success (%)
16. **KPI-016**: Password Reset Completion Time (Mins)
17. **KPI-017**: MFA SMS Latency (Seconds)
18. **KPI-018**: Daily Active Users via Push Notifications
19. **KPI-019**: Digest Engagement Rate (%)
20. **KPI-020**: Support SLA Warning Effectiveness
21. **KPI-021**: Payment Link Click Rate
22. **KPI-022**: Invoice Download Rate
23. **KPI-023**: Certificate Share Rate (LinkedIn Integration)
24. **KPI-024**: Course Enrollment via Recommendation Alert
25. **KPI-025**: Peer Review Turnaround Time post-Alert
26. **KPI-026**: Quiet Hour Deferral Volume
27. **KPI-027**: Duplicate Alert Consolidation Ratio
28. **KPI-028**: Template Error Rate (Hydration failures)
29. **KPI-029**: Gateway Timeout Rate
30. **KPI-030**: Webhook Delivery Success Rate
31. **KPI-031**: Push Notification Opt-In Rate
32. **KPI-032**: User Preference Modification Rate
33. **KPI-033**: Campaign Invite Acceptance Rate
34. **KPI-034**: Offer Extended to Signature Time
35. **KPI-035**: Security Alert False Positive Rate
36. **KPI-036**: Audit Log Sync Latency
37. **KPI-037**: API Key Expiry Renewal Rate
38. **KPI-038**: Terms of Service Acceptance via Notification
39. **KPI-039**: Customer Reply Turnaround Time
40. **KPI-040**: Platform NPS correlation to Notification Frequency


---

## 18. Notification Traceability Matrix

This architecture ensures unbroken traceability from high-level business goals down to user notifications.

*   **Business Requirement:** Reduce Time-to-Hire (BR-01)
    *   ↓ **Business Process:** Candidate Assessment Workflow (BP-04)
        *   ↓ **Functional Requirement:** System shall grade AI tests in < 2 mins (FR-AST-12)
            *   ↓ **Business Rule:** Notify employer instantly upon score generation (BR-NOTI-015)
                *   ↓ **User Flow:** Employer reviews candidate (UF-EMP-08)
                    *   ↓ **Notification:** NOTI-058 (Assessment Completed & Scored)
                        *   ↓ **User Role:** Employer (Hiring Manager)

---

## 19. Notification Risks

| Risk ID | Risk | Impact | Likelihood | Mitigation |
| :--- | :--- | :--- | :--- | :--- |
| **RSK-N-01** | **Notification Spam / Alert Fatigue** | High | High | Enforce strict frequency capping, batching, and digest modes. |
| **RSK-N-02** | **Missed Critical Reminder** | Critical | Low | Implement omnichannel fallback (If unread In-App -> Email -> SMS). |
| **RSK-N-03** | **Duplicate Notification Delivery** | Medium | Medium | Idempotency keys on event triggers and 5-min deduplication windows. |
| **RSK-N-04** | **Delayed Delivery (Queue Backup)** | High | Low | Dedicated high-priority queues for Auth/Critical alerts. Auto-scaling workers. |
| **RSK-N-05** | **Incorrect Recipient (Data Leak)** | Critical | Low | Strict RBAC evaluation at hydration time. Automated regression testing. |
| **RSK-N-06** | **Privacy Leak via Email Payload** | Critical | Low | Ban PII in templates. Send secure "Click to view in portal" links instead. |

---

## 20. Future Notification Enhancements

To maintain enterprise competitiveness, the following features are slated for future roadmap phases:

1.  **AI Personalized Notifications:** Generative AI dynamically alters the tone and length of the message based on candidate personas and past engagement metrics.
2.  **Predictive Reminders:** Machine Learning predicts the exact time a user is most likely to check their phone and delays the push notification to that optimal minute.
3.  **Smart Scheduling Integration:** Allowing candidates to reply directly to an email (e.g., "Tomorrow at 3 PM works") and natural language processing parses it to update the calendar.
4.  **Multi-language Real-time Translation:** Auto-translating employer messages to candidate native languages seamlessly via system proxy.
5.  **Voice Notifications:** Automated voice calls for critical VIP candidate interview reminders.
6.  **WhatsApp Business API Integration:** Extending the SMS channel to rich WhatsApp messaging.
7.  **Teams & Slack Apps:** Allowing Employers to approve candidates or view assessment scores directly inside MS Teams or Slack without logging into the ISAS portal.

---

## 21. Summary

The Notification & Communication Specification for ISAS establishes a robust, secure, and user-centric messaging framework. By leveraging an event-driven architecture categorized into distinct business domains, the platform ensures that the right message reaches the right user via the optimal channel. 

Crucially, the governance provided by the 60+ business rules, strict anti-spam measures, and granular preference controls protects user engagement and prevents alert fatigue. Monitored by 40 specific KPIs and driven by clear enterprise traceability, this communication strategy directly supports the overarching business objectives of accelerating candidate placement, improving user retention, and maintaining strict compliance and security standards. Future scalability is guaranteed through a decoupled architecture ready to integrate predictive AI dispatching and rich third-party enterprise integrations.

