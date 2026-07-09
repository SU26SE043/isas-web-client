# Business Requirements Document: Business Processes
*Document ID: ISAS-BRD-04*
*Version: 1.0*

## 1. Document Purpose
The purpose of this Business Process Document is to define and structure the operational workflows for the AI-powered Interview & Skill Assessment System (ISAS). It articulates how business value is delivered through standard processes, detailing the interactions between candidates, employers, administrators, and the AI engine. 

As a core component of the Business Requirements Document (BRD), this document translates high-level business needs into actionable, governed workflows adhering to BPMN 2.0 and BABOK v3 enterprise standards. 

**Intended Audience:**
*   Business Stakeholders (HR Leaders, Recruitment Managers)
*   Enterprise Solution Architects
*   Product Managers and Business Analysts
*   Quality Assurance and Compliance Teams

**Process Governance:**
All processes outlined herein are governed by the ISAS Process Management Board. Any changes to core workflows (Level 2 and above) require formal Change Advisory Board (CAB) approval.

---

## 2. Business Process Overview
The ISAS platform operates across a unified business lifecycle designed to evaluate, assess, and upskill candidates while providing actionable insights to employers. The ecosystem spans the following major business domains:

*   **User Management:** Onboarding, authentication, and security governance for all actors.
*   **Candidate Journey:** Profile building, CV parsing, and continuous skill tracking.
*   **Employer Journey:** Campaign creation, candidate tracking, and recruitment analytics.
*   **AI Assessment:** The core cognitive engine managing real-time interviews, behavioral tracking, and rubric-based scoring.
*   **Learning & Roadmap:** Post-assessment upskilling pathways and practice environments.
*   **Payment:** Subscription, credit management, and transactional processing.
*   **Administration:** Master data management, system configuration, and holistic oversight.
*   **Analytics & Reporting:** Value-driven insights, candidate matching, and enterprise dashboards.
*   **Notifications & Support:** Omnichannel communication and exception handling.

---

## 3. End-to-End Business Process Landscape

### Level 0: Enterprise Landscape
*   **L0-01** ISAS End-to-End Value Stream

### Level 1: Business Domains
*   **L1-01** Acquire & Manage Users
*   **L1-02** Assess Candidate Skills
*   **L1-03** Develop Candidate Capability
*   **L1-04** Facilitate Employer Recruitment
*   **L1-05** Manage Platform Operations

### Level 2: Core Processes & Level 3: Sub-Processes
*   **L2-01 User & Profile Operations**
    *   BP-001 User Registration
    *   BP-002 Authentication
    *   BP-003 Candidate Profile Management
    *   BP-004 CV Upload
    *   BP-005 CV Analysis
*   **L2-02 Engagement & Commerce**
    *   BP-006 Campaign Discovery
    *   BP-007 Campaign Enrollment
    *   BP-008 Payment
*   **L2-03 Interview & Assessment Operations**
    *   BP-009 Identity Verification
    *   BP-010 Device Check
    *   BP-011 Interview Initialization
    *   BP-012 AI Interview Session
    *   BP-013 Interview Monitoring
    *   BP-014 AI Assessment
    *   BP-015 Report Generation
    *   BP-016 Session History
*   **L2-04 Continuous Learning**
    *   BP-017 Learning Roadmap Generation
    *   BP-018 Learning Module Recommendation
    *   BP-019 Practice Session
    *   BP-020 Progress Tracking
    *   BP-021 Leaderboard
    *   BP-022 Certificate Generation
*   **L2-05 Employer Operations**
    *   BP-023 Employer Campaign Management
    *   BP-024 Employer Dashboard
*   **L2-06 Platform Administration**
    *   BP-025 Admin Operations
    *   BP-026 Notification Management
    *   BP-027 Analytics
    *   BP-028 Audit Logging
    *   BP-029 Support Process
    *   BP-030 System Maintenance

---

## 4. Core Business Processes

### BP-001 User Registration
| Attribute | Description |
|---|---|
| **Process ID** | BP-001 |
| **Business Goal** | Establish a unique business identity for system actors. |
| **Description** | The end-to-end flow for capturing user details, validating them, and creating an official platform profile. |
| **Primary Actor** | Candidate / Employer |
| **Supporting Actor** | System |
| **Trigger** | User initiates sign-up. |
| **Preconditions** | User has a valid email address. |
| **Inputs** | Email, Password, Name, Role |
| **Outputs** | User Account, Verification Email |
| **Business Rules** | Email must be unique. Password must meet complexity policy. |
| **Postconditions** | Account status is Unverified pending OTP. |
| **Success Criteria** | Account record created. |
| **Exceptions** | Duplicate email; Invalid data format. |
| **Frequency** | Ad-hoc, frequent |
| **Priority** | High |
| **Business Value** | Critical for user acquisition. |

### BP-002 Authentication
| Attribute | Description |
|---|---|
| **Process ID** | BP-002 |
| **Business Goal** | Verify user identity to grant system access securely. |
| **Description** | Process of logging into the platform using credentials or SSO. |
| **Primary Actor** | All Users |
| **Supporting Actor** | Authentication Provider |
| **Trigger** | User requests access. |
| **Preconditions** | Account exists and is verified. |
| **Inputs** | Credentials or SSO Token |
| **Outputs** | Session Token |
| **Business Rules** | Account locks after 5 failed attempts. |
| **Postconditions** | User session is active. |
| **Success Criteria** | Session token generated. |
| **Exceptions** | Invalid credentials; Account locked. |
| **Frequency** | Very frequent |
| **Priority** | Critical |
| **Business Value** | Ensures system security and integrity. |

### BP-003 Candidate Profile Management
| Attribute | Description |
|---|---|
| **Process ID** | BP-003 |
| **Business Goal** | Maintain accurate and up-to-date professional profiles. |
| **Description** | Process for a candidate to update their skills, experience, and personal details. |
| **Primary Actor** | Candidate |
| **Supporting Actor** | System |
| **Trigger** | User accesses profile settings. |
| **Preconditions** | User is logged in. |
| **Inputs** | Profile data (skills, experience, bio) |
| **Outputs** | Updated Profile |
| **Business Rules** | Mandatory fields must be completed before campaign application. |
| **Postconditions** | Profile data updated in repository. |
| **Success Criteria** | Profile saves successfully. |
| **Exceptions** | Validation failure on fields. |
| **Frequency** | Ad-hoc |
| **Priority** | Medium |
| **Business Value** | Provides accurate data for AI matching. |

### BP-004 CV Upload
| Attribute | Description |
|---|---|
| **Process ID** | BP-004 |
| **Business Goal** | Ingest candidate resume documents into the platform. |
| **Description** | Candidates upload their CVs in standard formats for platform usage. |
| **Primary Actor** | Candidate |
| **Supporting Actor** | System |
| **Trigger** | Candidate initiates upload. |
| **Preconditions** | Logged in. |
| **Inputs** | File (PDF/DOCX) |
| **Outputs** | Stored File ID |
| **Business Rules** | Max file size 10MB. Must be PDF or DOCX. |
| **Postconditions** | File queued for analysis. |
| **Success Criteria** | File safely stored. |
| **Exceptions** | Invalid format; File too large. |
| **Frequency** | Ad-hoc |
| **Priority** | High |
| **Business Value** | Foundation for AI parsing and matching. |

### BP-005 CV Analysis
| Attribute | Description |
|---|---|
| **Process ID** | BP-005 |
| **Business Goal** | Extract structured data (skills, experience) from unstructured CVs. |
| **Description** | System parses uploaded CVs using NLP and updates the candidate's profile autonomously. |
| **Primary Actor** | System (AI Engine) |
| **Supporting Actor** | N/A |
| **Trigger** | Successful CV Upload (BP-004). |
| **Preconditions** | File exists in storage. |
| **Inputs** | Stored File ID |
| **Outputs** | Parsed JSON structure |
| **Business Rules** | Must identify baseline skills, tenure, and education. |
| **Postconditions** | Candidate profile is auto-populated. |
| **Success Criteria** | Data maps to profile fields. |
| **Exceptions** | Parsing failure; Unreadable text. |
| **Frequency** | Per upload |
| **Priority** | High |
| **Business Value** | Reduces manual data entry and enables smart matching. |

### BP-006 Campaign Discovery
| Attribute | Description |
|---|---|
| **Process ID** | BP-006 |
| **Business Goal** | Allow candidates to find relevant interview/assessment campaigns. |
| **Description** | Candidates search, filter, and view details of active employer or platform campaigns. |
| **Primary Actor** | Candidate |
| **Supporting Actor** | Search Engine |
| **Trigger** | Candidate navigates to campaigns. |
| **Preconditions** | None. |
| **Inputs** | Search criteria |
| **Outputs** | Campaign List |
| **Business Rules** | Only active and public campaigns are visible. |
| **Postconditions** | Candidate views campaign details. |
| **Success Criteria** | Results match criteria. |
| **Exceptions** | No results found. |
| **Frequency** | Frequent |
| **Priority** | Medium |
| **Business Value** | Drives engagement and assessment volume. |

### BP-007 Campaign Enrollment
| Attribute | Description |
|---|---|
| **Process ID** | BP-007 |
| **Business Goal** | Register a candidate for a specific assessment campaign. |
| **Description** | Candidate confirms intent to participate in a campaign and reserves a spot. |
| **Primary Actor** | Candidate |
| **Supporting Actor** | System |
| **Trigger** | Candidate clicks 'Enroll'. |
| **Preconditions** | Logged in, profile completed. |
| **Inputs** | Campaign ID, Candidate ID |
| **Outputs** | Enrollment Record |
| **Business Rules** | Candidate cannot enroll twice in the same active campaign. |
| **Postconditions** | Candidate is eligible for Payment or Interview Initiation. |
| **Success Criteria** | Enrollment status = Active. |
| **Exceptions** | Campaign full; Eligibility failure. |
| **Frequency** | Frequent |
| **Priority** | High |
| **Business Value** | Secures candidate participation. |

### BP-008 Payment
| Attribute | Description |
|---|---|
| **Process ID** | BP-008 |
| **Business Goal** | Process financial transactions for premium features or campaigns. |
| **Description** | Handles credit card processing, credit deductions, and invoicing via external gateways. |
| **Primary Actor** | Candidate / Employer |
| **Supporting Actor** | Payment Gateway |
| **Trigger** | Checkout initiated. |
| **Preconditions** | Cart or invoice generated. |
| **Inputs** | Payment Details |
| **Outputs** | Transaction Receipt |
| **Business Rules** | Services are provisioned only upon successful transaction settlement. |
| **Postconditions** | Account credits updated or premium feature unlocked. |
| **Success Criteria** | Gateway returns Success code. |
| **Exceptions** | Card declined; Gateway timeout. |
| **Frequency** | Ad-hoc |
| **Priority** | Critical |
| **Business Value** | Direct revenue realization. |

### BP-009 Identity Verification
| Attribute | Description |
|---|---|
| **Process ID** | BP-009 |
| **Business Goal** | Ensure the candidate taking the interview is the registered owner. |
| **Description** | Real-time biometric or ID check prior to entering the assessment environment. |
| **Primary Actor** | Candidate |
| **Supporting Actor** | AI Vision Service |
| **Trigger** | Candidate starts interview flow. |
| **Preconditions** | Enrollment complete. |
| **Inputs** | Webcam Image |
| **Outputs** | Verification Confidence Score |
| **Business Rules** | Confidence score must exceed 85% to proceed automatically. |
| **Postconditions** | Candidate authorized for interview. |
| **Success Criteria** | Verified status granted. |
| **Exceptions** | Face mismatch; No face detected. |
| **Frequency** | Per interview |
| **Priority** | Critical |
| **Business Value** | Maintains assessment integrity. |

### BP-010 Device Check
| Attribute | Description |
|---|---|
| **Process ID** | BP-010 |
| **Business Goal** | Confirm hardware and network capability before assessment. |
| **Description** | Systematic verification of microphone, camera, and bandwidth. |
| **Primary Actor** | System |
| **Supporting Actor** | Candidate Device |
| **Trigger** | Post-identity verification. |
| **Preconditions** | Identity verified. |
| **Inputs** | Hardware streams |
| **Outputs** | Diagnostic Report |
| **Business Rules** | Mic and Cam must be active. Ping < 200ms. |
| **Postconditions** | Environment locked for interview. |
| **Success Criteria** | All checks pass. |
| **Exceptions** | Hardware not found; Poor network. |
| **Frequency** | Per interview |
| **Priority** | High |
| **Business Value** | Prevents technical failures during assessment. |

### BP-011 Interview Initialization
| Attribute | Description |
|---|---|
| **Process ID** | BP-011 |
| **Business Goal** | Provision the AI environment and load assessment logic. |
| **Description** | System allocates AI resources, loads the appropriate domain rubric, and establishes connection. |
| **Primary Actor** | System |
| **Supporting Actor** | AI Engine |
| **Trigger** | Device check passes. |
| **Preconditions** | Device approved. |
| **Inputs** | Campaign Rubric ID |
| **Outputs** | Active Session ID |
| **Business Rules** | AI instance must provision within 15 seconds. |
| **Postconditions** | Interview UI renders for candidate. |
| **Success Criteria** | Session status = Active. |
| **Exceptions** | Resource allocation timeout. |
| **Frequency** | Per interview |
| **Priority** | High |
| **Business Value** | Sets up the core product experience. |

### BP-012 AI Interview Session
| Attribute | Description |
|---|---|
| **Process ID** | BP-012 |
| **Business Goal** | Conduct a dynamic, interactive conversational assessment. |
| **Description** | The core interview loop: AI asks questions, candidate answers, AI evaluates in real-time to determine the next question. |
| **Primary Actor** | AI Engine |
| **Supporting Actor** | Candidate |
| **Trigger** | Initialization complete. |
| **Preconditions** | Active Session ID. |
| **Inputs** | Candidate Audio/Text |
| **Outputs** | Transcripts & Real-time Metrics |
| **Business Rules** | Interview concludes when rubric criteria are met or time expires. |
| **Postconditions** | Session transitions to completed state. |
| **Success Criteria** | All required topics covered. |
| **Exceptions** | Candidate drop-off; AI unresponsiveness. |
| **Frequency** | Per interview |
| **Priority** | Critical |
| **Business Value** | Primary value delivery of the ISAS platform. |

### BP-013 Interview Monitoring
| Attribute | Description |
|---|---|
| **Process ID** | BP-013 |
| **Business Goal** | Detect anomalies, cheating, or technical issues during the session. |
| **Description** | Background process analyzing video/audio feeds for multiple faces, background voices, or tab switching. |
| **Primary Actor** | System (Anti-Cheat) |
| **Supporting Actor** | N/A |
| **Trigger** | Interview starts. |
| **Preconditions** | Session active. |
| **Inputs** | Telemetry & A/V feeds |
| **Outputs** | Anomaly Flags |
| **Business Rules** | Terminate session if severe violation (e.g., multiple faces > 10s) detected. |
| **Postconditions** | Flags appended to session report. |
| **Success Criteria** | Continuous monitoring without false positives. |
| **Exceptions** | Monitoring service crash. |
| **Frequency** | Continuous during interview |
| **Priority** | High |
| **Business Value** | Maintains trust and validity of assessments. |

### BP-014 AI Assessment
| Attribute | Description |
|---|---|
| **Process ID** | BP-014 |
| **Business Goal** | Evaluate the collected interview data against the job rubric. |
| **Description** | Post-processing of transcripts and behavioral data to generate standardized scores. |
| **Primary Actor** | AI Engine |
| **Supporting Actor** | System |
| **Trigger** | Interview Session completes. |
| **Preconditions** | Transcripts finalized. |
| **Inputs** | Transcripts, Rubric, Telemetry |
| **Outputs** | Raw Scorecard |
| **Business Rules** | Scores must be deterministic based on defined rubric weights. |
| **Postconditions** | Data queued for Report Generation. |
| **Success Criteria** | Scores mapped to all competencies. |
| **Exceptions** | Processing timeout. |
| **Frequency** | Post-interview |
| **Priority** | Critical |
| **Business Value** | Objective quantification of candidate skills. |

### BP-015 Report Generation
| Attribute | Description |
|---|---|
| **Process ID** | BP-015 |
| **Business Goal** | Create human-readable artifacts summarizing the assessment. |
| **Description** | Formats the raw scorecard into PDF and dashboard-ready insights for both Candidate and Employer. |
| **Primary Actor** | System |
| **Supporting Actor** | N/A |
| **Trigger** | AI Assessment completes. |
| **Preconditions** | Scorecard saved. |
| **Inputs** | Raw Scorecard |
| **Outputs** | PDF Report, Dashboard Object |
| **Business Rules** | Candidate and Employer reports have different visibility levels (e.g., anti-cheat details hidden from candidate). |
| **Postconditions** | Reports available for download. |
| **Success Criteria** | PDF generated and linked. |
| **Exceptions** | Rendering failure. |
| **Frequency** | Post-assessment |
| **Priority** | High |
| **Business Value** | Tangible output of the platform for stakeholders. |

### BP-016 Session History
| Attribute | Description |
|---|---|
| **Process ID** | BP-016 |
| **Business Goal** | Provide access to past interviews and outcomes. |
| **Description** | Archival and retrieval process for candidates and employers to review past performance. |
| **Primary Actor** | User |
| **Supporting Actor** | System |
| **Trigger** | User accesses History tab. |
| **Preconditions** | Logged in. |
| **Inputs** | User ID |
| **Outputs** | List of historical sessions |
| **Business Rules** | Data retained per data privacy policy (e.g., 3 years). |
| **Postconditions** | N/A |
| **Success Criteria** | Records displayed. |
| **Exceptions** | N/A |
| **Frequency** | Frequent |
| **Priority** | Low |
| **Business Value** | Supports longitudinal tracking. |

### BP-017 Learning Roadmap Generation
| Attribute | Description |
|---|---|
| **Process ID** | BP-017 |
| **Business Goal** | Provide actionable growth paths based on skill gaps. |
| **Description** | Analyzes the AI Assessment scorecard to identify weaknesses and generates a structured learning path. |
| **Primary Actor** | AI Engine |
| **Supporting Actor** | System |
| **Trigger** | Report generation completes. |
| **Preconditions** | Assessment finalized. |
| **Inputs** | Scorecard gaps |
| **Outputs** | Personalized Roadmap |
| **Business Rules** | Roadmap must address competencies scoring below 70%. |
| **Postconditions** | Roadmap available in Candidate portal. |
| **Success Criteria** | Nodes created. |
| **Exceptions** | N/A |
| **Frequency** | Post-assessment |
| **Priority** | Medium |
| **Business Value** | Extends platform value from assessment to development. |

### BP-018 Learning Module Recommendation
| Attribute | Description |
|---|---|
| **Process ID** | BP-018 |
| **Business Goal** | Suggest specific content (videos, articles) to address roadmap nodes. |
| **Description** | Matches external or internal learning content to the specified gaps. |
| **Primary Actor** | System |
| **Supporting Actor** | Content Integration |
| **Trigger** | Roadmap generation. |
| **Preconditions** | Roadmap exists. |
| **Inputs** | Roadmap Nodes |
| **Outputs** | Content Links |
| **Business Rules** | Links must be active and relevant. |
| **Postconditions** | Candidate can click to learn. |
| **Success Criteria** | Links populate in UI. |
| **Exceptions** | External API failure. |
| **Frequency** | Ad-hoc |
| **Priority** | Medium |
| **Business Value** | Actionable learning. |

### BP-019 Practice Session
| Attribute | Description |
|---|---|
| **Process ID** | BP-019 |
| **Business Goal** | Allow candidates to simulate interviews without employer visibility. |
| **Description** | A low-stakes AI interview environment focused on feedback rather than scoring. |
| **Primary Actor** | Candidate |
| **Supporting Actor** | AI Engine |
| **Trigger** | Candidate starts practice. |
| **Preconditions** | Sufficient practice credits. |
| **Inputs** | Selected Topic |
| **Outputs** | Feedback Report |
| **Business Rules** | Practice results do not impact public profile. |
| **Postconditions** | Practice credit deducted. |
| **Success Criteria** | Session finishes and provides feedback. |
| **Exceptions** | Out of credits. |
| **Frequency** | Frequent |
| **Priority** | High |
| **Business Value** | Improves candidate confidence and platform engagement. |

### BP-020 Progress Tracking
| Attribute | Description |
|---|---|
| **Process ID** | BP-020 |
| **Business Goal** | Visualize candidate improvement over time. |
| **Description** | Aggregates historical scores and practice results into trend graphs. |
| **Primary Actor** | System |
| **Supporting Actor** | N/A |
| **Trigger** | Dashboard load. |
| **Preconditions** | Data exists. |
| **Inputs** | Historical Scores |
| **Outputs** | Trend Charts |
| **Business Rules** | N/A |
| **Postconditions** | N/A |
| **Success Criteria** | Charts render accurately. |
| **Exceptions** | N/A |
| **Frequency** | Frequent |
| **Priority** | Low |
| **Business Value** | Gamification and motivation. |

### BP-021 Leaderboard
| Attribute | Description |
|---|---|
| **Process ID** | BP-021 |
| **Business Goal** | Promote gamification among candidates in open campaigns. |
| **Description** | Ranks candidates based on anonymized scores for specific skills. |
| **Primary Actor** | System |
| **Supporting Actor** | N/A |
| **Trigger** | Scheduled job / View load. |
| **Preconditions** | Campaign allows leaderboard. |
| **Inputs** | Aggregated Scores |
| **Outputs** | Ranked List |
| **Business Rules** | Must anonymize PII unless user opts in. |
| **Postconditions** | N/A |
| **Success Criteria** | Accurate ranking. |
| **Exceptions** | N/A |
| **Frequency** | Daily |
| **Priority** | Low |
| **Business Value** | Drives competitive engagement. |

### BP-022 Certificate Generation
| Attribute | Description |
|---|---|
| **Process ID** | BP-022 |
| **Business Goal** | Provide verifiable credentials for passing critical assessments. |
| **Description** | Issues a cryptographic or verifiable PDF certificate when a candidate exceeds benchmark scores. |
| **Primary Actor** | System |
| **Supporting Actor** | N/A |
| **Trigger** | Score > 85% in certified campaign. |
| **Preconditions** | Assessment complete. |
| **Inputs** | Assessment Score |
| **Outputs** | Certificate Asset |
| **Business Rules** | Only specific premium campaigns are eligible. |
| **Postconditions** | Certificate emailed and available on profile. |
| **Success Criteria** | Asset minted. |
| **Exceptions** | N/A |
| **Frequency** | Ad-hoc |
| **Priority** | Medium |
| **Business Value** | Provides tangible value to candidate's career. |

### BP-023 Employer Campaign Management
| Attribute | Description |
|---|---|
| **Process ID** | BP-023 |
| **Business Goal** | Allow employers to create and configure assessment drives. |
| **Description** | Employer sets up job description, required skills, passing criteria, and timeline. |
| **Primary Actor** | Employer |
| **Supporting Actor** | System |
| **Trigger** | Employer clicks 'New Campaign'. |
| **Preconditions** | Active employer account. |
| **Inputs** | Campaign Parameters |
| **Outputs** | Active Campaign |
| **Business Rules** | Must have sufficient platform credits to launch. |
| **Postconditions** | Campaign is visible to target candidates. |
| **Success Criteria** | Status changes to Active. |
| **Exceptions** | Insufficient credits. |
| **Frequency** | Ad-hoc |
| **Priority** | High |
| **Business Value** | B2B core functionality. |

### BP-024 Employer Dashboard
| Attribute | Description |
|---|---|
| **Process ID** | BP-024 |
| **Business Goal** | Provide aggregate insights and applicant tracking. |
| **Description** | Employer views pipelines, candidate scores, and interview recordings. |
| **Primary Actor** | Employer |
| **Supporting Actor** | System |
| **Trigger** | Login. |
| **Preconditions** | Campaigns exist. |
| **Inputs** | Employer ID |
| **Outputs** | Dashboard UI |
| **Business Rules** | Cannot view candidate PII if candidate revoked access. |
| **Postconditions** | N/A |
| **Success Criteria** | Data aggregates correctly. |
| **Exceptions** | N/A |
| **Frequency** | Frequent |
| **Priority** | High |
| **Business Value** | Decision support for HR. |

### BP-025 Admin Operations
| Attribute | Description |
|---|---|
| **Process ID** | BP-025 |
| **Business Goal** | Manage platform master data and tenant configuration. |
| **Description** | Super-admin actions including taxonomy updates, user bans, and global settings. |
| **Primary Actor** | Administrator |
| **Supporting Actor** | System |
| **Trigger** | Admin portal access. |
| **Preconditions** | Admin role. |
| **Inputs** | Config changes |
| **Outputs** | Updated System State |
| **Business Rules** | All admin actions must be strictly audited. |
| **Postconditions** | State changes applied globally. |
| **Success Criteria** | Changes commit. |
| **Exceptions** | Permission denied. |
| **Frequency** | Low |
| **Priority** | Medium |
| **Business Value** | Platform maintenance. |

### BP-026 Notification Management
| Attribute | Description |
|---|---|
| **Process ID** | BP-026 |
| **Business Goal** | Route alerts reliably to users. |
| **Description** | Process of generating and sending Emails/SMS/Push based on system events. |
| **Primary Actor** | System |
| **Supporting Actor** | Comms Gateway |
| **Trigger** | Event bus trigger. |
| **Preconditions** | N/A |
| **Inputs** | Event payload |
| **Outputs** | Dispatched Message |
| **Business Rules** | Respect user opt-out preferences for non-critical alerts. |
| **Postconditions** | N/A |
| **Success Criteria** | 200 OK from gateway. |
| **Exceptions** | Gateway offline. |
| **Frequency** | Continuous |
| **Priority** | High |
| **Business Value** | Keeps users informed. |

### BP-027 Analytics
| Attribute | Description |
|---|---|
| **Process ID** | BP-027 |
| **Business Goal** | Generate internal BI metrics for platform health. |
| **Description** | ETL jobs processing system data into internal data warehouses. |
| **Primary Actor** | System (Batch) |
| **Supporting Actor** | Data Warehouse |
| **Trigger** | Cron schedule. |
| **Preconditions** | N/A |
| **Inputs** | Transactional DB |
| **Outputs** | OLAP Cubes |
| **Business Rules** | N/A |
| **Postconditions** | BI dashboards updated. |
| **Success Criteria** | Job finishes. |
| **Exceptions** | Job crash. |
| **Frequency** | Daily |
| **Priority** | Medium |
| **Business Value** | Strategic insights. |

### BP-028 Audit Logging
| Attribute | Description |
|---|---|
| **Process ID** | BP-028 |
| **Business Goal** | Ensure compliance and traceabilty of actions. |
| **Description** | Immutable logging of sensitive events (Auth, Admin changes, PII access). |
| **Primary Actor** | System |
| **Supporting Actor** | Audit DB |
| **Trigger** | Sensitive event. |
| **Preconditions** | N/A |
| **Inputs** | Event payload |
| **Outputs** | Immutable Record |
| **Business Rules** | Logs cannot be deleted or modified. |
| **Postconditions** | N/A |
| **Success Criteria** | Written to WORM storage. |
| **Exceptions** | Storage failure. |
| **Frequency** | Continuous |
| **Priority** | Critical |
| **Business Value** | Security and compliance. |

### BP-029 Support Process
| Attribute | Description |
|---|---|
| **Process ID** | BP-029 |
| **Business Goal** | Resolve user issues efficiently. |
| **Description** | Ticketing workflow from user submission to agent resolution. |
| **Primary Actor** | User |
| **Supporting Actor** | Support Agent |
| **Trigger** | Ticket submission. |
| **Preconditions** | N/A |
| **Inputs** | Issue details |
| **Outputs** | Resolved Ticket |
| **Business Rules** | SLA adherence based on severity. |
| **Postconditions** | N/A |
| **Success Criteria** | User confirms resolution. |
| **Exceptions** | SLA breach. |
| **Frequency** | Ad-hoc |
| **Priority** | Medium |
| **Business Value** | Customer satisfaction. |

### BP-030 System Maintenance
| Attribute | Description |
|---|---|
| **Process ID** | BP-030 |
| **Business Goal** | Ensure platform stability and apply updates. |
| **Description** | Planned downtime workflow including communication, execution, and verification. |
| **Primary Actor** | Operations |
| **Supporting Actor** | System |
| **Trigger** | Scheduled window. |
| **Preconditions** | CAB Approval. |
| **Inputs** | Patch / Update |
| **Outputs** | Upgraded System |
| **Business Rules** | Users must be notified 48 hours in advance. |
| **Postconditions** | System health checks pass. |
| **Success Criteria** | Downtime ends. |
| **Exceptions** | Rollback required. |
| **Frequency** | Monthly |
| **Priority** | High |
| **Business Value** | Platform reliability. |

---

## 5. Business Workflow Details

This section maps the specific chronological steps for each core process defined in Section 4.

### Flow: BP-001 User Registration
| Step | Actor | Business Activity | Decision | Input | Output | Rule | Exception | Expected Result |
|---|---|---|---|---|---|---|---|---|
| 1 | User | Provide registration details | N/A | Form data | Data package | N/A | N/A | Data submitted |
| 2 | System | Validate uniqueness | Is email unique? | Data package | Validation status | BR-001 | Duplicate error | Data validated |
| 3 | System | Create account record | N/A | Valid data | Account ID | N/A | Database exception | Record created |
| 4 | System | Send verification OTP | N/A | Email | OTP Message | N/A | SMTP failure | Email sent |

### Flow: BP-002 Authentication
| Step | Actor | Business Activity | Decision | Input | Output | Rule | Exception | Expected Result |
|---|---|---|---|---|---|---|---|---|
| 1 | User | Submit credentials | N/A | Email/Password | Request | N/A | N/A | Credentials received |
| 2 | System | Validate credentials | Match found? | Credentials | Auth Status | BR-002 | Auth failure | Validated |
| 3 | System | Check account status | Is locked? | Account ID | Status | BR-003 | Locked exception | Status confirmed |
| 4 | System | Generate session | N/A | User ID | Auth Token | N/A | Token error | Access granted |

### Flow: BP-003 Candidate Profile Management
| Step | Actor | Business Activity | Decision | Input | Output | Rule | Exception | Expected Result |
|---|---|---|---|---|---|---|---|---|
| 1 | Candidate | Update profile details | N/A | New profile data | Data package | N/A | N/A | Updates entered |
| 2 | System | Validate input data | Valid format? | Data package | Validation Status | BR-004 | Validation Error | Data validated |
| 3 | System | Save to repository | N/A | Valid data | Success confirmation | N/A | Storage failure | Profile updated |

### Flow: BP-004 CV Upload
| Step | Actor | Business Activity | Decision | Input | Output | Rule | Exception | Expected Result |
|---|---|---|---|---|---|---|---|---|
| 1 | Candidate | Select and upload file | N/A | Document | File stream | N/A | N/A | Upload started |
| 2 | System | Verify format and size | Valid file? | File stream | Verification status | BR-005 | Rejection notice | File approved |
| 3 | System | Store securely | N/A | Document | File ID | N/A | Storage timeout | File saved |

### Flow: BP-005 CV Analysis
| Step | Actor | Business Activity | Decision | Input | Output | Rule | Exception | Expected Result |
|---|---|---|---|---|---|---|---|---|
| 1 | System | Retrieve CV file | N/A | File ID | Document text | N/A | Fetch error | Document loaded |
| 2 | AI Engine | Execute OCR/NLP parsing | Legible? | Document text | Raw JSON | N/A | Parsing error | Data extracted |
| 3 | System | Map to profile schema | N/A | Raw JSON | Mapped Data | BR-006 | Mapping warning | Data structured |
| 4 | System | Update user profile | N/A | Mapped Data | Update Confirmation | N/A | N/A | Profile populated |

### Flow: BP-006 Campaign Discovery
| Step | Actor | Business Activity | Decision | Input | Output | Rule | Exception | Expected Result |
|---|---|---|---|---|---|---|---|---|
| 1 | Candidate | Input search parameters | N/A | Keywords, filters | Query | N/A | N/A | Search executed |
| 2 | System | Retrieve matching campaigns | Matches found? | Query | Campaign List | BR-007 | Empty state | List returned |
| 3 | System | Render details | N/A | Campaign ID | Full Description | N/A | N/A | Details viewed |

### Flow: BP-007 Campaign Enrollment
| Step | Actor | Business Activity | Decision | Input | Output | Rule | Exception | Expected Result |
|---|---|---|---|---|---|---|---|---|
| 1 | Candidate | Request enrollment | N/A | Campaign ID | Request | N/A | N/A | Request received |
| 2 | System | Check eligibility & capacity | Eligible? | Request | Status | BR-008 | Rejection error | Approved |
| 3 | System | Create enrollment record | N/A | Status | Enrollment ID | N/A | DB error | Enrolled |

### Flow: BP-008 Payment
| Step | Actor | Business Activity | Decision | Input | Output | Rule | Exception | Expected Result |
|---|---|---|---|---|---|---|---|---|
| 1 | User | Submit payment details | N/A | Card info | Secure payload | N/A | N/A | Data secured |
| 2 | Payment Gateway | Process transaction | Approved? | Payload | Auth Code | BR-009 | Decline notice | Funds secured |
| 3 | System | Update account entitlement | N/A | Auth Code | Updated balance | N/A | Sync delay | Entitlement granted |
| 4 | System | Issue receipt | N/A | Transaction ID | PDF Receipt | N/A | N/A | Receipt sent |

### Flow: BP-009 Identity Verification
| Step | Actor | Business Activity | Decision | Input | Output | Rule | Exception | Expected Result |
|---|---|---|---|---|---|---|---|---|
| 1 | System | Request camera snapshot | N/A | Camera feed | Image frame | N/A | Camera block | Frame captured |
| 2 | AI Engine | Compare with profile baseline | Match > 85%? | Image frame | Score | BR-010 | Verification failed | Match confirmed |
| 3 | System | Log verification event | N/A | Score | Audit log | N/A | N/A | Identity verified |

### Flow: BP-010 Device Check
| Step | Actor | Business Activity | Decision | Input | Output | Rule | Exception | Expected Result |
|---|---|---|---|---|---|---|---|---|
| 1 | System | Test A/V permissions | Granted? | Browser API | Status | BR-011 | Permission denied | A/V active |
| 2 | System | Measure network latency | Ping < 200ms? | Packets | Latency metric | BR-012 | Connection warning | Network OK |
| 3 | System | Approve device | N/A | Metrics | Approval token | N/A | N/A | Ready to start |

### Flow: BP-011 Interview Initialization
| Step | Actor | Business Activity | Decision | Input | Output | Rule | Exception | Expected Result |
|---|---|---|---|---|---|---|---|---|
| 1 | System | Fetch campaign rubric | N/A | Campaign ID | Rubric JSON | N/A | Fetch error | Rubric loaded |
| 2 | System | Allocate AI Agent | Available? | Rubric JSON | Agent ID | N/A | Timeout | Agent ready |
| 3 | System | Establish WebRTC/Socket | N/A | Agent ID | Session ID | N/A | Socket error | Connection live |

### Flow: BP-012 AI Interview Session
| Step | Actor | Business Activity | Decision | Input | Output | Rule | Exception | Expected Result |
|---|---|---|---|---|---|---|---|---|
| 1 | AI Engine | Generate and deliver prompt | N/A | Rubric state | Audio/Text prompt | N/A | Synthesis error | Prompt delivered |
| 2 | Candidate | Provide response | N/A | Audio/Text | Response payload | N/A | Silence timeout | Response captured |
| 3 | AI Engine | Process NLP & Transcript | Valid input? | Response payload | Semantic data | N/A | Unintelligible | Data parsed |
| 4 | AI Engine | Determine next state | Rubric complete? | Semantic data | Next state logic | BR-013 | N/A | Loop continues or ends |

### Flow: BP-013 Interview Monitoring
| Step | Actor | Business Activity | Decision | Input | Output | Rule | Exception | Expected Result |
|---|---|---|---|---|---|---|---|---|
| 1 | System | Analyze continuous feed | N/A | A/V Streams | Frame analysis | N/A | N/A | Stream processed |
| 2 | System | Evaluate anti-cheat rules | Violation found? | Frame analysis | Flag event | BR-014 | N/A | Status clean or flagged |
| 3 | System | Execute enforcement | Severe? | Flag event | Warning / Termination | BR-015 | N/A | Action taken |

### Flow: BP-014 AI Assessment
| Step | Actor | Business Activity | Decision | Input | Output | Rule | Exception | Expected Result |
|---|---|---|---|---|---|---|---|---|
| 1 | System | Compile session data | N/A | Session DB | Data aggregate | N/A | Data missing | Compilation done |
| 2 | AI Engine | Score against competencies | N/A | Data aggregate | Dimension scores | BR-016 | N/A | Scored |
| 3 | System | Save scorecard | N/A | Dimension scores | Scorecard ID | N/A | DB error | Saved |

### Flow: BP-015 Report Generation
| Step | Actor | Business Activity | Decision | Input | Output | Rule | Exception | Expected Result |
|---|---|---|---|---|---|---|---|---|
| 1 | System | Format data by role | Role=Employer? | Scorecard | Formatted views | BR-017 | N/A | Data mapped |
| 2 | System | Generate PDF document | N/A | Formatted views | PDF File | N/A | Render error | PDF created |
| 3 | System | Distribute notifications | N/A | Report ID | Alert sent | N/A | N/A | Users notified |

### Flow: BP-016 Session History
| Step | Actor | Business Activity | Decision | Input | Output | Rule | Exception | Expected Result |
|---|---|---|---|---|---|---|---|---|
| 1 | User | Request history | N/A | Filters | Query | N/A | N/A | Query executed |
| 2 | System | Retrieve records | N/A | Query | History Array | N/A | N/A | Data retrieved |

### Flow: BP-017 Learning Roadmap Generation
| Step | Actor | Business Activity | Decision | Input | Output | Rule | Exception | Expected Result |
|---|---|---|---|---|---|---|---|---|
| 1 | System | Identify skill gaps | Score < 70%? | Scorecard | Gap list | BR-018 | N/A | Gaps found |
| 2 | AI Engine | Map gaps to curriculum | N/A | Gap list | Curriculum nodes | N/A | N/A | Mapped |
| 3 | System | Publish roadmap | N/A | Curriculum nodes | Roadmap View | N/A | N/A | Published |

### Flow: BP-018 Learning Module Recommendation
| Step | Actor | Business Activity | Decision | Input | Output | Rule | Exception | Expected Result |
|---|---|---|---|---|---|---|---|---|
| 1 | System | Query content library | N/A | Node tags | Content list | N/A | API Error | Content retrieved |

### Flow: BP-019 Practice Session
| Step | Actor | Business Activity | Decision | Input | Output | Rule | Exception | Expected Result |
|---|---|---|---|---|---|---|---|---|
| 1 | Candidate | Configure practice | N/A | Settings | Config | N/A | N/A | Configured |
| 2 | System | Run un-monitored AI session | N/A | Config | Transcripts | BR-019 | N/A | Completed |
| 3 | AI Engine | Generate constructive feedback | N/A | Transcripts | Feedback View | N/A | N/A | Delivered |

### Flow: BP-020 Progress Tracking
| Step | Actor | Business Activity | Decision | Input | Output | Rule | Exception | Expected Result |
|---|---|---|---|---|---|---|---|---|
| 1 | System | Calculate deltas | N/A | History | Trend data | N/A | N/A | Calculated |

### Flow: BP-021 Leaderboard
| Step | Actor | Business Activity | Decision | Input | Output | Rule | Exception | Expected Result |
|---|---|---|---|---|---|---|---|---|
| 1 | System | Sort and anonymize | Opt-in? | Scores | Rankings | BR-020 | N/A | Ranked |

### Flow: BP-022 Certificate Generation
| Step | Actor | Business Activity | Decision | Input | Output | Rule | Exception | Expected Result |
|---|---|---|---|---|---|---|---|---|
| 1 | System | Check eligibility | Score > 85? | Scorecard | Status | BR-021 | Ineligible | Approved |
| 2 | System | Mint certificate | N/A | User Data | Asset | N/A | N/A | Minted |

### Flow: BP-023 Employer Campaign Management
| Step | Actor | Business Activity | Decision | Input | Output | Rule | Exception | Expected Result |
|---|---|---|---|---|---|---|---|---|
| 1 | Employer | Define campaign parameters | N/A | Inputs | Draft | N/A | N/A | Draft saved |
| 2 | System | Verify credits | Credits > 0? | Draft | Approval | BR-022 | Credit error | Approved |
| 3 | System | Publish campaign | N/A | Draft | Live URL | N/A | N/A | Published |

### Flow: BP-024 Employer Dashboard
| Step | Actor | Business Activity | Decision | Input | Output | Rule | Exception | Expected Result |
|---|---|---|---|---|---|---|---|---|
| 1 | System | Aggregate campaign metrics | N/A | DB | Metrics | N/A | N/A | Rendered |

### Flow: BP-025 Admin Operations
| Step | Actor | Business Activity | Decision | Input | Output | Rule | Exception | Expected Result |
|---|---|---|---|---|---|---|---|---|
| 1 | Admin | Submit global change | N/A | Config | Payload | N/A | N/A | Submitted |
| 2 | System | Verify permissions | Is Admin? | Payload | Auth | BR-023 | Denied | Authorized |
| 3 | System | Commit and Audit | N/A | Payload | DB State | BR-024 | N/A | Committed |

### Flow: BP-026 Notification Management
| Step | Actor | Business Activity | Decision | Input | Output | Rule | Exception | Expected Result |
|---|---|---|---|---|---|---|---|---|
| 1 | System | Check preferences | Opted in? | Event | Status | BR-025 | Suppressed | Proceed |
| 2 | System | Dispatch via Gateway | N/A | Payload | Response | N/A | Failure | Sent |

### Flow: BP-027 Analytics
| Step | Actor | Business Activity | Decision | Input | Output | Rule | Exception | Expected Result |
|---|---|---|---|---|---|---|---|---|
| 1 | System | Execute ETL | N/A | DB | Data Warehouse | N/A | Crash | Synced |

### Flow: BP-028 Audit Logging
| Step | Actor | Business Activity | Decision | Input | Output | Rule | Exception | Expected Result |
|---|---|---|---|---|---|---|---|---|
| 1 | System | Append log entry | N/A | Payload | Audit DB | BR-026 | Alert Ops | Logged |

### Flow: BP-029 Support Process
| Step | Actor | Business Activity | Decision | Input | Output | Rule | Exception | Expected Result |
|---|---|---|---|---|---|---|---|---|
| 1 | User | Create ticket | N/A | Details | Ticket ID | N/A | N/A | Created |
| 2 | Agent | Resolve and reply | Resolved? | Ticket ID | Closure | N/A | Escalated | Closed |

### Flow: BP-030 System Maintenance
| Step | Actor | Business Activity | Decision | Input | Output | Rule | Exception | Expected Result |
|---|---|---|---|---|---|---|---|---|
| 1 | Ops | Apply patch | Success? | Code | New State | N/A | Rollback | Upgraded |

---

## 6. Decision Points

| Decision ID | Business Decision | Condition | Outcome A | Outcome B | Related Process |
|---|---|---|---|---|---|
| DEC-001 | Payment successful? | Gateway confirms funds | Unlock Campaign | Display Decline Error | BP-008 |
| DEC-002 | Identity verified? | Confidence > 85% | Proceed to Hardware Check | Deny Entry / Flag | BP-009 |
| DEC-003 | Device compliant? | A/V Active, Ping < 200ms | Initialize Session | Show Troubleshooting | BP-010 |
| DEC-004 | AI evaluation complete? | Rubric targets met | End Session naturally | Continue prompting | BP-012 |
| DEC-005 | Cheating detected? | Severe violation flagged | Terminate Interview | Log Warning | BP-013 |
| DEC-006 | Roadmap eligible? | Competency score < 70% | Generate Node | Skip Competency | BP-017 |
| DEC-007 | Certificate eligible? | Overall Score > 85% | Mint Certificate | Log Standard Result | BP-022 |
| DEC-008 | Campaign active? | Current Date < End Date | Allow Enrollment | Reject Enrollment | BP-007 |
| DEC-009 | Credits sufficient? | Balance >= Campaign Cost| Publish Campaign | Prompt Payment | BP-023 |
| DEC-010 | CV legible? | OCR confidence > 80% | Parse JSON | Prompt Manual Entry| BP-005 |
| DEC-011 | Admin auth valid? | User Role = SuperAdmin | Process Config Change| Access Denied | BP-025 |
| DEC-012 | Unique Email? | Not in DB | Proceed | Throw Duplicate Error | BP-001 |
| DEC-013 | Minimum practice completed? | Count > 3 | Unlock Advanced Report| Prompt Practice | BP-019 |
| DEC-014 | Profile 100% complete? | All mandatory fields | Enable Applications | Lock Applications | BP-003 |
| DEC-015 | Opt-in to Leaderboard? | Privacy Flag = True | Show on Board | Hide from Board | BP-021 |

---

## 7. Business Rules Mapping

| Rule ID | Business Rule | Related Process | Priority | Impact |
|---|---|---|---|---|
| BR-001 | User email must be unique across the tenant. | BP-001 | High | Prevents duplicate accounts. |
| BR-002 | Candidate must complete profile before applying. | BP-003, BP-007 | High | Ensures data completeness. |
| BR-003 | Account locks after 5 consecutive failed logins. | BP-002 | Critical | Security and Anti-brute force. |
| BR-004 | Uploaded CV must be <10MB and PDF/DOCX format. | BP-004 | Medium | Prevents storage bloat. |
| BR-005 | Only one verified face allowed during interview. | BP-013 | Critical | Anti-cheat integrity. |
| BR-006 | Interview automatically ends if severe cheating detected. | BP-013 | High | Invalidates compromised sessions. |
| BR-007 | Premium reports require successful payment clearance. | BP-008, BP-015| High | Revenue protection. |
| BR-008 | Candidate must pass ID Verification to start assessment. | BP-009 | Critical | Ensures non-repudiation. |
| BR-009 | Certificate is generated only if score > 85%. | BP-022 | Medium | Maintains certificate value. |
| BR-010 | Roadmap is built for competencies scoring < 70%. | BP-017 | Low | Targets learning effectively. |
| BR-011 | Employers cannot view candidate PII if opted out. | BP-024 | Critical | Data privacy compliance. |
| BR-012 | System maintenance must notify users 48h prior. | BP-030 | Medium | SLA compliance. |
| BR-013 | Audit logs must be immutable (WORM). | BP-028 | Critical | Legal traceability. |
| BR-014 | Campaign enrollment is locked once capacity reached. | BP-007 | High | Manages assessment volume. |
| BR-015 | Practice sessions do not deduct from employer credits. | BP-019 | Medium | Encourages candidate prep. |

---

## 8. Exception Handling

| Exception ID | Cause | Business Impact | Recovery Process | User Notification | Fallback |
|---|---|---|---|---|---|
| EXC-001 | Authentication Failure | User blocked | Password Reset Flow | "Invalid Credentials" | Contact Support |
| EXC-002 | Payment Failure | Revenue delayed | Retry with new card | "Transaction Declined" | Saved Cart |
| EXC-003 | Network Interruption | Interview drops | Allow 2 min reconnect | "Connection Lost" | Resume state |
| EXC-004 | Camera Unavailable | Cannot assess | Prompt permissions | "Camera Required" | Abort Session |
| EXC-005 | Identity Verification Failed| Cheating risk | Block Session | "Verification Failed" | Manual HR Review |
| EXC-006 | AI Service Unavailable | Outage | Postpone assessment | "Service Degraded" | Email when up |
| EXC-007 | Campaign Expired | Lost opportunity| Block enrollment | "Campaign Closed" | Show Similar |
| EXC-008 | Credit Exhausted | Blocked employer| Prompt top-up | "Out of Credits" | Save Draft |
| EXC-009 | CV Parsing Failed | Missing data | Manual Entry | "Could not read CV" | Form input |
| EXC-010 | Session Timeout | Inactivity | Terminate gracefully| "Session Expired" | Require new login|

---

## 9. Business Process Dependencies

| Preceding Process | Dependent Process | Dependency Type | Description |
|---|---|---|---|
| BP-001 Registration | BP-002 Authentication | Hard | User cannot authenticate without an account. |
| BP-002 Authentication | BP-003 Profile Management | Hard | Must be logged in to edit profile. |
| BP-004 CV Upload | BP-005 CV Analysis | Hard | File must exist before parsing. |
| BP-005 CV Analysis | BP-006 Campaign Discovery | Soft | Parsed skills improve campaign recommendations. |
| BP-006 Campaign Discovery | BP-007 Campaign Enrollment | Hard | Must find a campaign to enroll. |
| BP-007 Campaign Enrollment | BP-008 Payment | Conditional | Payment required if campaign is premium. |
| BP-007 Campaign Enrollment | BP-009 Identity Verification | Hard | Must be enrolled to start the interview pre-checks. |
| BP-009 Identity Verification | BP-010 Device Check | Hard | Identity clears before allocating hardware resources. |
| BP-010 Device Check | BP-011 Interview Initialization| Hard | Device must pass to connect to AI. |
| BP-011 Interview Initialization| BP-012 AI Interview Session | Hard | Session must initialize to converse. |
| BP-012 AI Interview Session | BP-014 AI Assessment | Hard | Conversation data required for scoring. |
| BP-014 AI Assessment | BP-015 Report Generation | Hard | Raw scores needed to build PDF. |
| BP-015 Report Generation | BP-017 Roadmap Generation | Hard | Final report dictates learning gaps. |
| BP-017 Roadmap Generation | BP-018 Module Recommendation | Hard | Nodes required to recommend links. |
| BP-023 Employer Campaign | BP-006 Campaign Discovery | Hard | Employer must create campaign before candidates find it. |

---

## 10. Business Process KPIs

| KPI ID | Metric Name | Target | Measurement Frequency | Process Link |
|---|---|---|---|---|
| KPI-01 | Registration Success Rate | > 98% | Daily | BP-001 |
| KPI-02 | Authentication Failure Rate | < 2% | Daily | BP-002 |
| KPI-03 | Profile Completion Rate | > 85% | Weekly | BP-003 |
| KPI-04 | CV Upload Success Rate | > 99% | Daily | BP-004 |
| KPI-05 | Average CV Processing Time | < 5 sec | Real-time | BP-005 |
| KPI-06 | Campaign Enrollment Rate | > 60% view-to-enroll | Weekly | BP-007 |
| KPI-07 | Payment Success Rate | > 95% | Daily | BP-008 |
| KPI-08 | Identity Verification Pass Rate | > 90% first-try | Daily | BP-009 |
| KPI-09 | Device Check Pass Rate | > 95% | Daily | BP-010 |
| KPI-10 | Interview Abandonment Rate | < 5% | Daily | BP-012 |
| KPI-11 | Interview Completion Rate | > 95% | Daily | BP-012 |
| KPI-12 | AI Assessment Time | < 30 sec post-session | Real-time | BP-014 |
| KPI-13 | Report Generation Time | < 10 sec | Real-time | BP-015 |
| KPI-14 | Roadmap Generation Rate | 100% of assessed | Weekly | BP-017 |
| KPI-15 | Practice Session Utilization | > 40% of candidates| Monthly | BP-019 |
| KPI-16 | Learning Completion Rate | > 20% | Monthly | BP-018 |
| KPI-17 | Certification Issuance Rate | < 15% (exclusivity) | Monthly | BP-022 |
| KPI-18 | Employer Campaign Success | > 5 hires / campaign | Quarterly | BP-023 |
| KPI-19 | Employer Time-to-Hire | Reduced by 40% | Quarterly | L0-01 |
| KPI-20 | Notification Open Rate | > 60% | Weekly | BP-026 |
| KPI-21 | Average Issue Resolution Time| < 24 hours | Weekly | BP-029 |
| KPI-22 | System Uptime | 99.99% | Monthly | BP-030 |
| KPI-23 | Fraud Detection Rate | > 99% true positives | Monthly | BP-013 |
| KPI-24 | Candidate Satisfaction (CSAT) | > 4.5 / 5 | Continuous | L0-01 |
| KPI-25 | Employer Satisfaction Score | > 4.5 / 5 | Continuous | L0-01 |

---

## 11. Cross-Functional Process Matrix

*R = Responsible, A = Accountable, C = Consulted, I = Informed*

| Process Category | Candidate | Employer | HR/Recruiter | Administrator | Finance | AI Engine | Support |
|---|---|---|---|---|---|---|---|
| BP-001 to BP-005 (Profile)| R | I | I | A | - | R | C |
| BP-006 to BP-008 (Enroll) | R | C | - | A | I | - | C |
| BP-009 to BP-013 (Interview)| R | I | - | A | - | R | C |
| BP-014 to BP-016 (Assess) | I | I | C | A | - | R | C |
| BP-017 to BP-022 (Learn) | R | I | - | A | - | R | C |
| BP-023 to BP-024 (Employer)| I | R | R | A | I | - | C |
| BP-025 to BP-030 (Admin) | I | I | I | R/A | I | I | R |

---

## 12. Process Governance

*   **Process Ownership:** The Chief Operating Officer (COO) and Head of Product co-own the L0 and L1 process landscape. Individual Product Managers own L2 and L3 processes.
*   **Approval Workflow:** Any alterations to core business processes require submission to the Change Advisory Board (CAB) ensuring no adverse impact on AI scoring validity or compliance.
*   **Change Management:** Updates to workflows will be communicated via release notes (BP-026).
*   **Compliance:** Processes comply with GDPR, CCPA, and regional biometric data laws.
*   **Monitoring:** The Analytics team (BP-027) continuously monitors the process KPIs.
*   **Continuous Improvement:** Monthly review of CSAT and Abandonment Rates to streamline BP-009 (Verification) and BP-012 (Interview).
*   **Audit Requirements:** All Administrator and Employer actions must write to the WORM storage database (BP-028) for 3-year retention.

---

## 13. Process Risks

| Risk ID | Business Process | Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|---|---|
| RSK-01 | BP-012 AI Interview | Candidate abandonment mid-session due to UX | High | Medium | Implement intuitive UI, continuous autosave, and clear instructions. |
| RSK-02 | BP-008 Payment | Gateway outage prevents conversions | Critical | Low | Implement secondary fallback gateway; queued retries. |
| RSK-03 | BP-013 Monitoring | False positive fraud detection | High | Medium | Human-in-the-loop review option; tuning of AI confidence thresholds. |
| RSK-04 | BP-014 AI Assessment| AI hallucination during scoring | Critical | Low | Strictly constrain AI to deterministic rubric mapping; regular audits. |
| RSK-05 | BP-030 Maintenance | Unplanned service outage | High | Low | Multi-AZ cloud deployment; rigorous staging environments. |
| RSK-06 | BP-005 CV Analysis | Inaccurate parsing of non-standard CVs | Medium | High | Fallback to manual candidate entry flow. |
| RSK-07 | BP-009 Verification | Biometric bias causing false negatives | High | Medium | Use audited, unbiased 3rd party vision models; offer manual override. |

---

## 14. Process Traceability

| Business Process | Business Requirement | User Role | Test Scenario Link | Acceptance Criteria |
|---|---|---|---|---|
| BP-001 Registration | REQ-USR-01 | Candidate, Employer | TS-001 | User created in DB successfully |
| BP-005 CV Analysis | REQ-AI-01 | System | TS-005 | JSON maps to 90% of profile fields |
| BP-008 Payment | REQ-FIN-01 | Candidate, Employer | TS-008 | Ledger updates within 2 seconds |
| BP-012 AI Interview | REQ-AI-02 | Candidate, AI | TS-012 | Latency under 500ms per response |
| BP-014 AI Assessment | REQ-AI-03 | AI | TS-014 | Output strictly follows Rubric Schema |
| BP-017 Roadmap | REQ-LRN-01 | Candidate, AI | TS-017 | Generated nodes map to sub-70% scores |
| BP-023 Campaign | REQ-EMP-01 | Employer | TS-023 | Campaign published and searchable |
| BP-028 Audit | REQ-SEC-01 | System | TS-028 | Log entry is cryptographically signed |

---

## 15. Business Process Summary

The ISAS platform functions on a tightly integrated lifecycle designed to eliminate manual recruitment friction. By automating the candidate profiling (BP-001 to BP-005), seamlessly orchestrating secure assessments (BP-009 to BP-014), and generating actionable developmental insights (BP-017 to BP-022), the platform delivers immense B2B and B2C value.

**Success Factors:**
1.  **Frictionless Verification:** Ensuring BP-009 and BP-010 operate reliably to prevent drop-offs.
2.  **Conversational Fluidity:** The latency and accuracy of BP-012 dictate platform perception.
3.  **Objective Evaluation:** BP-014 must remain unbiased, deterministic, and fully transparent.

**Future Process Expansion:**
Future phases will introduce localized compliance processes, multi-language assessments, and deeper ATS (Applicant Tracking System) integration workflows to further embed ISAS into enterprise recruitment ecosystems.


