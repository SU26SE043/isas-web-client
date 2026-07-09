# User Flow Specification

## 1. Document Purpose

**Purpose of User Flows**
The User Flow Specification defines the end-to-end user journeys within the AI-powered Interview & Skill Assessment System (ISAS). It outlines how different personas interact with the system to achieve their business goals, detailing the step-by-step interactions, decision points, and systemic responses without prescribing specific user interface layouts.

**Relationship with BRD**
This document translates the high-level business goals and requirements established in the Business Requirements Document (BRD) into practical, human-centric interaction models.

**Relationship with Business Process**
User flows represent the systemic execution of the Business Process Models (BPMN). While business processes focus on organizational workflows, user flows focus on the human-computer interaction required to execute those workflows.

**Relationship with Functional Requirements**
Every step within a user flow directly traces to one or more Functional Requirements (FR). User flows provide the context for *why* and *when* a functional requirement is invoked.

**Intended Audience**
- UX/UI Designers
- Business Analysts
- Product Owners & Product Managers
- Development & QA Teams
- Solution Architects

## 2. User Personas

| Persona ID | Persona | Description | Goals | Pain Points | Primary Tasks | Success Criteria |
|---|---|---|---|---|---|---|
| PR-01 | Guest | Unauthenticated visitor exploring ISAS. | Understand system value; view public campaigns; register. | Lack of understanding of AI assessment; unclear pricing. | Browse public pages; Sign up. | Successful registration conversion. |
| PR-02 | Candidate | Job seeker or professional assessing skills. | Take AI interviews; receive actionable feedback; get hired. | Anxiety regarding AI interviews; technical setup issues. | Complete profile; take interview; view reports. | Completion of interview and positive feedback perception. |
| PR-03 | Employer Administrator | Main account holder for an enterprise. | Manage subscription; oversee all recruitment activities. | Billing complexites; lack of holistic visibility. | Purchase plans; manage team roles; review ROI. | Efficient budget utilization and high recruitment ROI. |
| PR-04 | Recruiter | Operational user creating campaigns. | Source candidates quickly; filter top talent. | Sifting through unqualified CVs; slow hiring cycles. | Create campaigns; invite candidates; shortlist. | Reduction in time-to-hire by 40%. |
| PR-05 | Hiring Manager | Decision maker for a specific role. | Find the best technical fit; review deep AI insights. | Interviews taking too much time; inconsistent evaluations. | Review AI assessment reports; compare candidates. | Successful hire with high retention rate. |
| PR-06 | Interviewer | Subject matter expert involved in final rounds. | Review AI preliminary notes before live interactions. | Lack of context on candidate's base skills. | View candidate history and specific skill scores. | Streamlined final interview focus. |
| PR-07 | Support | Tier 1/2 customer service agent. | Resolve candidate/employer issues rapidly. | Lack of tools to diagnose technical/AI failures. | View tickets; check user session logs; escalate. | SLA adherence; high CSAT. |
| PR-08 | Finance | Internal financial controller. | Ensure revenue recognition; audit billing. | Discrepancies in usage vs. billing. | View financial dashboards; export transaction logs. | 100% reconciliation accuracy. |
| PR-09 | Administrator | Internal ISAS operational manager. | Moderate content; configure system rules. | Manual intervention in automated processes. | Manage users; moderate campaigns; set rules. | System uptime and operational efficiency. |
| PR-10 | System Administrator | IT/Infra specialist. | Maintain system health, security, and AI integrations. | System downtime; API rate limits. | Monitor logs; configure AI settings; manage security. | 99.99% system availability. |

## 3. User Journey Overview

### Guest Journey
Landing Page -> Feature Exploration -> Pricing -> Registration -> Candidate/Employer Dashboard.

### Candidate Journey
Onboarding -> Profile & CV Upload -> AI CV Analysis -> Campaign Discovery -> System/Device Check -> AI Interview Execution -> Report Generation -> Learning Roadmap & Practice -> Skill Certification.

### Employer Journey
Registration & Verification -> Plan Purchase -> Campaign Creation -> Candidate Invitation -> Real-time Monitoring -> AI Report Review -> Shortlisting & Hiring -> Team & Billing Management.

### Administrator Journey
Dashboard Review -> User & Campaign Moderation -> Support Escalation Handling -> System Configuration -> Audit & Reporting.

### Support Journey
Ticket Receipt -> User Context Retrieval -> Issue Diagnosis (e.g., Video failure) -> Resolution Formulation -> Communication -> Ticket Closure.

## 4. Candidate User Flows

- UF-001 Registration
- UF-002 Login
- UF-003 Forgot Password
- UF-004 Email Verification
- UF-005 Complete Profile
- UF-006 Upload CV
- UF-007 AI CV Analysis
- UF-008 Browse Campaigns
- UF-009 Campaign Details
- UF-010 Purchase Credits / Subscription
- UF-011 Start Interview
- UF-012 Identity Verification
- UF-013 Device Check
- UF-014 AI Interview
- UF-015 Pause Interview
- UF-016 Resume Interview
- UF-017 Complete Interview
- UF-018 View AI Report
- UF-019 Compare Results
- UF-020 Generate Learning Roadmap
- UF-021 Learning Hub
- UF-022 Practice Session
- UF-023 Track Progress
- UF-024 Earn Certificate
- UF-025 Download Certificate
- UF-026 View History
- UF-027 Manage Profile
- UF-028 Notifications
- UF-029 Contact Support
- UF-030 Logout

## 5. Employer User Flows

- UF-101 Employer Registration
- UF-102 Company Verification
- UF-103 Create Campaign
- UF-104 Edit Campaign
- UF-105 Publish Campaign
- UF-106 Invite Candidates
- UF-107 Review AI Reports
- UF-108 Manage Candidates
- UF-109 Purchase Plans
- UF-110 Analytics Dashboard
- UF-111 Close Campaign
- UF-112 Generate Reports
- UF-113 Manage Team
- UF-114 Billing
- UF-115 Notifications

## 6. Administrator User Flows

- UF-201 User Management
- UF-202 Role Assignment
- UF-203 Permission Management
- UF-204 Campaign Moderation
- UF-205 System Configuration
- UF-206 AI Configuration
- UF-207 Content Management
- UF-208 Learning Management
- UF-209 Notification Templates
- UF-210 Audit Logs
- UF-211 Analytics Dashboard
- UF-212 Support Management
- UF-213 System Maintenance

## 7. Support User Flows

- UF-301 View Tickets
- UF-302 Assign Tickets
- UF-303 Resolve Tickets
- UF-304 Escalation
- UF-305 Knowledge Base
- UF-306 Customer Communication
- UF-307 Incident Tracking

## 8. Detailed Flow Specification

### Flow Specification: UF-014 AI Interview

**Flow ID**: UF-014  
**Flow Name**: AI Interview Execution  
**Primary Persona**: Candidate (PR-02)  
**Business Goal**: Conduct an automated, bias-free technical and behavioral assessment.  
**Trigger**: Candidate clicks 'Start Assessment' after completing UF-013 (Device Check).  
**Preconditions**: User is authenticated, verified, device check passed, campaign is active.  
**Postconditions**: Interview data captured, AI report generated, Candidate status updated.  
**Success Criteria**: Candidate completes all questions; AI successfully parses and scores responses.  
**Priority**: Critical (P0)  
**Related Business Process**: BP-04 Assessment Execution  
**Related Functional Requirements**: FR-AI-01 to FR-AI-15  
**Related Business Rules**: BR-INT-01 (Max duration 60 mins), BR-INT-02 (Proctoring active).  

## 9. Step-by-Step Flow

### UF-014 Steps

| Step | Actor | Action | System Response | Decision | Alternative Path | Business Rule | Expected Outcome |
|---|---|---|---|---|---|---|---|
| 1 | Candidate | Clicks 'Start Assessment' | Initializes interview environment, locks browser tab. | - | - | BR-INT-02 | UI enters fullscreen mode. |
| 2 | System | AI sets context | Retrieves campaign skill graph and generates introductory greeting. | - | - | FR-AI-01 | Avatar/Voice welcomes candidate. |
| 3 | Candidate | Listens/Reads intro | Activates recording indicator. | - | - | - | Candidate ready for Q1. |
| 4 | System | Asks Question 1 | AI synthesizes speech for Q1 based on dynamic generation. | - | - | FR-AI-03 | Q1 presented audibly and visually. |
| 5 | Candidate | Answers Q1 verbally | Captures audio/video, transcribes speech in real-time. | - | UF-014-A1 (Silence) | BR-INT-05 | Transcript generated. |
| 6 | System | Analyzes response | NLP evaluates technical accuracy, tone, and keywords. | Follow-up? | UF-014-A2 (Follow-up) | FR-AI-06 | Score buffered internally. |
| 7 | System | Continues loop | Iterates Steps 4-6 for all required skills. | Last Q? | - | BR-INT-01 | All skills assessed. |
| 8 | System | Monitors integrity | Continuous background check of eye-tracking and background noise. | Violation? | EX-045 (Cheating detected) | BR-PROC-01 | High integrity maintained. |
| 9 | Candidate | Clicks 'Finish' | Stops recording, uploads final data packets. | - | EX-015 (Network failure) | - | Data secured on server. |
| 10 | System | Calculates Score | Aggregates all AI sub-scores into final report. | - | - | FR-REP-01 | Processing state initiated. |
| 11 | System | Redirects user | Shows 'Thank You' page and next steps. | - | - | - | Flow complete. |

## 10. Decision Points

| Decision ID | Condition | Yes Flow | No Flow | Business Rule |
|---|---|---|---|---|
| DP-01 | Is User Authenticated? | Proceed to Dashboard | Redirect to Login | BR-SEC-01 |
| DP-02 | Is Email Verified? | Allow Profile Access | Prompt Verification | BR-SEC-02 |
| DP-03 | Is Subscription Active? | Allow Campaign Creation | Redirect to Pricing | BR-PAY-01 |
| DP-04 | Did Device Check Pass? | Proceed to Identity Check | Show Troubleshooting | BR-SYS-05 |
| DP-05 | Is Identity Verified? | Proceed to Interview | Flag for Manual Review | BR-SEC-08 |
| DP-06 | Does Resume Match JD? (AI) | Show High Match | Show Low Match Warning | BR-AI-04 |
| DP-07 | Is Candidate Eligible for Certificate? | Show Certificate Button | Show Learning Roadmap | BR-CERT-01 |
| DP-08 | Did AI Detect Cheating? | Terminate / Flag Session | Continue Interview | BR-PROC-03 |
| DP-09 | Does Employer have Credits? | Send Invitations | Prompt Purchase | BR-PAY-02 |
| DP-10 | Is Campaign Deadline Passed? | Hide Campaign | Show Campaign | BR-CAMP-09 |

## 11. Alternative Flows

### UF-014-A1: Candidate Silence (No response detected)
If the candidate does not speak for 15 seconds, the AI issues a prompt: 'I didn't quite catch that. Would you like me to repeat the question?' If still silent after 15 more seconds, the AI moves to the next question and marks the current question score as 0.

### UF-014-A2: Dynamic Follow-up Question
If the candidate gives a partial answer, the AI dynamically generates a follow-up question (e.g., 'Can you elaborate on how you optimized the database query?'). This adds one step to the loop and refines the technical score.

### UF-103-A1: Campaign Save as Draft
The employer decides not to publish immediately. They click 'Save Draft'. The system bypasses validation rules for required candidate lists and saves the state. Trigger: UF-104 Edit Campaign to resume.

## 12. Exception Flows

| Exception ID | Exception Scenario | Trigger | System Handling / Recovery | Resolution Persona |
|---|---|---|---|---|
| EX-01 | Invalid Credentials | UF-002 | Display error, increment failed attempt. Lock after 5. | Candidate/Support |
| EX-02 | Account Locked | UF-002 | Show lockout message, send unlock email. | Candidate |
| EX-03 | Password Reset Link Expired | UF-003 | Prompt user to request a new link. | Candidate |
| EX-04 | Email Already Exists | UF-001 | Suggest login or forgot password. | Candidate |
| EX-05 | CV File Too Large | UF-006 | Reject file, show size limit (5MB). | Candidate |
| EX-06 | CV Format Unsupported | UF-006 | Reject file, list supported formats (PDF, DOCX). | Candidate |
| EX-07 | AI CV Parsing Failure | UF-007 | Fallback to manual form entry. | Candidate |
| EX-08 | Payment Declined by Bank | UF-010 | Show gateway error, suggest alternative card. | Employer |
| EX-09 | Insufficient Credits | UF-106 | Block invite, route to UF-109. | Employer |
| EX-10 | Campaign Name Duplicate | UF-103 | Prompt for unique name. | Employer |
| EX-11 | No Candidates Selected | UF-106 | Disable 'Send Invite' button. | Employer |
| EX-12 | Webcam Not Detected | UF-013 | Halt flow, provide device troubleshooting guide. | Candidate |
| EX-13 | Microphone Not Detected | UF-013 | Halt flow, provide device troubleshooting guide. | Candidate |
| EX-14 | Insufficient Bandwidth | UF-013 | Show warning, block interview if < 1Mbps. | Candidate |
| EX-15 | Network Drop During Interview | UF-014 | Auto-pause, save buffer, show reconnecting spinner. | System |
| EX-16 | Browser Crash During Interview | UF-014 | Save state on server; allow resume via UF-016. | Candidate |
| EX-17 | ID Verification Blur | UF-012 | Request retake of ID photo. | Candidate |
| EX-18 | Face Mismatch | UF-012 | Flag for manual recruiter review, allow provisional start. | Candidate/Recruiter |
| EX-19 | AI Speech-to-Text Timeout | UF-014 | Switch to fallback API, notify system admin. | System |
| EX-20 | Multiple Faces Detected | UF-014 | Issue warning on screen, log infraction. | System |
| EX-21 | User Leaves Screen | UF-014 | Pause interview, issue warning. | Candidate |
| EX-22 | Background Voice Detected | UF-014 | Log event for report, issue visual warning. | System |
| EX-23 | Session Timeout (Idle) | General | Auto-logout, require re-authentication. | Candidate/Employer |
| EX-24 | Database Write Failure | System | Queue transaction, alert admin, show generic error. | Admin |
| EX-25 | AI Service Unavailable | UF-014 | Graceful halt, notify candidate to retry later, alert IT. | Admin |
| EX-26 | Role Permission Denied | General | Redirect to dashboard, log unauthorized access. | System |
| EX-27 | Invalid Campaign URL | UF-008 | Show 404/Campaign Expired page. | Candidate |
| EX-28 | Certificate Generation Failed | UF-024 | Add to retry queue, inform user to check back. | System |
| EX-29 | Video Render Failure | UF-107 | Show text transcript only, log video error. | Employer |
| EX-30 | Export Data Too Large | UF-112 | Process async, send email when ready. | Employer |
| EX-31 | Unsupported Browser | UF-011 | Block entry, list supported browsers (Chrome, Edge). | Candidate |
| EX-32 | Ad-Blocker Interference | UF-013 | Prompt user to disable ad-blocker for WebRTC. | Candidate |
| EX-33 | Screen Sharing Denied | UF-013 | Halt flow, explain requirement for proctoring. | Candidate |
| EX-34 | Candidate Opt-Out of AI | UF-011 | Halt flow, notify employer of refusal. | Candidate |
| EX-35 | Report Generation Timeout | UF-018 | Display 'Processing', notify via email on completion. | System |
| EX-36 | Invalid Discount Code | UF-010 | Highlight field, display 'Code Invalid or Expired'. | Employer |
| EX-37 | Subscription Expired | UF-103 | Redirect to billing, lock campaign creation. | Employer |
| EX-38 | Maximum Users Reached | UF-113 | Prompt upsell to higher tier. | Employer |
| EX-39 | API Rate Limit Exceeded | System | Throttle requests, implement exponential backoff. | System |
| EX-40 | Support Ticket Submission Fail | UF-029 | Save draft locally, prompt manual email fallback. | Candidate |
| EX-41 | Invalid Phone Number | UF-005 | Regex validation failure, prompt correct format. | Candidate |
| EX-42 | Audio Echo Detected | UF-013 | Prompt user to use headphones. | Candidate |
| EX-43 | Low Light Detected | UF-013 | Prompt user to improve room lighting. | Candidate |
| EX-44 | VPN/Proxy Detected | UF-011 | Warning or block based on employer geo-fencing rules. | Candidate |
| EX-45 | Cheating Confidence High | UF-014 | Auto-terminate interview (Configurable by Employer). | System |
| EX-46 | User Requests Data Deletion | UF-027 | Initiate 30-day cool-off soft delete process. | Admin |
| EX-47 | Malicious File Upload | UF-006 | Quarantine file, ban IP, notify SecOps. | System Admin |
| EX-48 | Concurrent Login Detected | UF-002 | Invalidate previous session, force new login. | System |
| EX-49 | Missing JD Information | UF-103 | Prevent AI skill extraction, prompt manual entry. | Employer |
| EX-50 | External ATS Sync Failed | System | Queue payload, alert Employer Admin. | Employer |

## 13. Cross-Role Interaction Flows

**Candidate ↔ Employer**
The primary interaction is asynchronous. Employer creates a Campaign (UF-103) and Invites Candidate (UF-106). Candidate receives notification, completes AI Interview (UF-014). Employer reviews the AI Report (UF-107) and updates candidate status (UF-108), triggering a notification back to the Candidate (UF-028).

**Employer ↔ Administrator**
If an employer flags an AI report for inaccuracy, it triggers a support ticket. The Administrator (PR-09) accesses the backend (UF-204) to moderate the AI output, adjust the scoring weights (UF-206), and resolve the ticket (UF-303).

**Candidate ↔ AI**
The most intensive interaction. The AI dynamically adjusts its behavior based on the candidate's real-time performance. This involves speech-to-text, natural language processing, dynamic prompt generation, and real-time behavioral analysis.

## 14. User Flow Matrix

| User Flow | Guest | Candidate | Employer | Recruiter | Interviewer | Support | Admin | System |
|---|---|---|---|---|---|---|---|---|
| UF-001 Registration | C | C | - | - | - | - | - | R |
| UF-014 AI Interview | - | C | - | - | - | - | - | R/U |
| UF-103 Create Campaign | - | - | C | C | - | - | - | R |
| UF-107 Review Reports | - | - | R | R | R | - | - | U |
| UF-303 Resolve Ticket | - | - | - | - | - | C/U | U | R |
*(C = Create/Initiate, R = Read/Process, U = Update, D = Delete)*

## 15. User Flow KPIs

| KPI ID | Metric | Measurement | Target |
|---|---|---|---|
| KPI-01 | Registration Conversion Rate | Visitors vs Completed UF-001 | > 15% |
| KPI-02 | CV Upload Success Rate | Attempts vs Completed UF-006 | > 98% |
| KPI-03 | AI CV Parsing Accuracy | Manual edits required post UF-007 | < 5% |
| KPI-04 | Interview Drop-off Rate | Started UF-011 vs Completed UF-017 | < 10% |
| KPI-05 | Device Check Failure Rate | Failed UF-013 instances | < 5% |
| KPI-06 | Average Interview Duration | Time from UF-014 start to finish | 25 - 45 mins |
| KPI-07 | Report Generation Latency | Time between UF-017 and UF-018 availability | < 2 mins |
| KPI-08 | Candidate Satisfaction Score | Post-interview survey | > 4.2 / 5.0 |
| KPI-09 | Campaign Creation Time | Time to complete UF-103 | < 5 mins |
| KPI-10 | Employer AI Confidence Rate | Reports manually overridden by Employer | < 2% |
| KPI-11 | Time to Hire | Campaign publish to Candidate Hired state | Reduced by 40% |
| KPI-12 | Identity Verification Success | Pass rate of UF-012 on first try | > 95% |
| KPI-13 | Network Exception Frequency | Occurrences of EX-15 | < 3% of interviews |
| KPI-14 | Learning Roadmap Generation | Candidates utilizing UF-020 | > 30% |
| KPI-15 | Practice Session Utilization | Candidates using UF-022 | > 20% |
| KPI-16 | Certificate Completion Rate | Started UF-024 vs Earned | > 15% |
| KPI-17 | Subscription Renewal Rate | Employers renewing in UF-109 | > 85% |
| KPI-18 | Payment Failure Rate | Occurrences of EX-08 | < 2% |
| KPI-19 | Support Ticket Deflection | Use of UF-305 Knowledge Base | > 40% |
| KPI-20 | First Call Resolution (FCR) | Tickets resolved in UF-303 immediately | > 70% |
| KPI-21 | System Uptime | Overall availability of all UFs | 99.99% |
| KPI-22 | Daily Active Users (Candidate) | Unique candidate logins (UF-002) | Monitor Growth |
| KPI-23 | Daily Active Users (Employer) | Unique employer logins | Monitor Growth |
| KPI-24 | Fraud Detection Rate | Interviews flagged by EX-45 | < 1% (True Positives) |
| KPI-25 | API Response Time (AI) | Average latency of AI generation step | < 800ms |
| KPI-26 | Email Verification Speed | Time to complete UF-004 | < 1 min |
| KPI-27 | Notification Deliverability | Success rate of UF-028 triggers | > 99% |
| KPI-28 | Browser Compatibility Issues | Occurrences of EX-31 | < 1% |
| KPI-29 | Admin Moderation Action Time | Time to complete UF-204 tasks | < 24 hrs |
| KPI-30 | Audit Log Integrity | Completeness of UF-210 tracking | 100% |

## 16. User Experience Principles

- **Consistency**: Terminology (e.g., 'Campaign', 'Credits', 'Assessment') must remain identical across all flows.
- **Minimal Friction**: Guest-to-Candidate onboarding (UF-001) should require minimal fields. Progressive disclosure applies to UF-005 (Complete Profile).
- **Accessibility**: All flows must meet WCAG 2.1 AA standards. AI Interview (UF-014) must support screen readers and closed captioning for hearing impaired.
- **Clear Feedback**: System state must always be visible. For instance, during report generation, a progress bar or estimated time remaining must be displayed.
- **Error Prevention over Recovery**: Device Check (UF-013) prevents failure in AI Interview (UF-014). This proactive design stops cascading exceptions.
- **Trust & Transparency**: Identity Verification (UF-012) and Proctoring must display clear privacy disclaimers before activating hardware.

## 17. User Flow Traceability Matrix

| Business Req | Business Process | Functional Req | User Flow | Acceptance Criteria |
|---|---|---|---|---|
| BR-01 Reduce time to hire | BP-02 Sourcing | FR-EMP-05 | UF-103 Create Campaign | Campaign published in < 5 mins. |
| BR-02 Automated Assessment | BP-04 Execution | FR-AI-03 | UF-014 AI Interview | AI conducts a 5-question interview successfully. |
| BR-03 Unbiased Scoring | BP-05 Evaluation | FR-AI-08 | UF-018 View AI Report | Scores generated purely on configured rubrics. |
| BR-04 Skill Upskilling | BP-06 Development | FR-LRN-01 | UF-020 Generate Roadmap | Roadmap maps to weak skills from UF-018. |
| BR-05 Enterprise Security | BP-07 Admin | FR-SEC-02 | UF-012 Identity Verification | User face matches ID document. |

## 18. Future User Flows

- **Mobile App (UF-4xx)**: Native flows for iOS/Android focusing on Push Notifications and on-the-go practice sessions.
- **Enterprise SSO (UF-5xx)**: SAML/OAuth integration flows bypassing standard registration for corporate clients.
- **ATS Integration (UF-6xx)**: Flow pushing AI reports directly into Workday, Greenhouse, or Lever without leaving the ATS UI.
- **Gamification (UF-7xx)**: Leaderboard and achievement flows for Candidate Learning Hub.
- **Live Interview Hand-off (UF-8xx)**: Flow transitioning a successful AI interview into a scheduled live video conference with a human Interviewer (PR-06).

## 19. Summary

The User Flow Specification comprehensively maps the ISAS ecosystem across 8 distinct personas. 
- The **Candidate Journey** heavily emphasizes a seamless, low-anxiety progression from onboarding to AI evaluation and continuous learning.
- The **Employer Journey** focuses on rapid campaign deployment, bulk processing, and data-driven shortlisting.
- The **Administrator Journey** provides the necessary levers to maintain system integrity, AI accuracy, and overall support.

By adhering strictly to these flows, the development and design teams ensure that functional requirements are met within an optimized, human-centered framework, fulfilling the enterprise product vision.

