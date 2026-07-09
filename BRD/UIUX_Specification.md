# 11_UIUX_Specification.md
**Project**: AI-Powered Interview Simulation and Assessment System (ISAS)  
**Document Version**: 1.0  
**Frameworks Referenced**: Material Design 3, Ant Design, WCAG 2.2 AA  

---

## 1. Document Purpose
### 1.1 Purpose
This document provides a comprehensive, enterprise-grade UI/UX specification for the AI-Powered Interview Simulation and Assessment System (ISAS). It dictates every interface, interaction, component behavior, state transition, and usability heuristic to ensure a seamless, human-centered experience.

### 1.2 Scope
The scope encompasses all frontend interactions, visual layouts, and user workflows. It excludes backend schemas, API endpoint definitions, and infrastructure details.

### 1.3 Audience
*   **UI/UX Designers**: To maintain design system consistency.
*   **Frontend Developers**: To implement pixel-perfect, accessible, and reactive interfaces.
*   **QA Engineers**: To validate visual states, error handling, and component behaviors.
*   **Product Owners**: To ensure business logic translates accurately to user experience.

### 1.4 Relationships
*   **Screen Inventory**: Maps 1:1 with `10_Screen_Inventory.md`.
*   **Functional Requirements**: Visualizes user capabilities defined in the FR document.
*   **User Flows**: Represents the static states of the dynamic pathways defined in UX flowcharts.

---

## 2. Global UX Principles
Driven by Human-Centered Design (HCD) and Nielsen’s Usability Heuristics, ISAS adheres to the following principles:

1.  **Consistency**: Utilize centralized design tokens (colors, typography, spacing) via Ant Design/Material Design 3 hybrids to ensure predictable behaviors across modules.
2.  **Clarity**: Present information hierarchically. The most critical action (e.g., "Start Interview") must always hold the highest visual weight.
3.  **Accessibility (WCAG 2.2 AA)**: Ensure all text maintains a minimum contrast ratio of 4.5:1. All interactive elements must be keyboard navigable (`Tab` indexing).
4.  **Efficiency**: Provide accelerators (keyboard shortcuts) for power users, particularly for employers reviewing mass candidate reports.
5.  **Feedback**: The system must acknowledge every action within 400ms (e.g., Toast notification on save, skeleton loader during API fetch).
6.  **Error Prevention**: Implement inline validation on forms before submission. Use non-destructive warnings for critical actions (e.g., exiting an active interview).
7.  **Minimal Cognitive Load**: Limit primary navigation items to 7±2. Use progressive disclosure for advanced settings.
8.  **Trust & Transparency**: Clearly indicate when the user is interacting with an AI versus a human, especially during automated feedback generation.
9.  **Performance Perception**: Utilize optimistic UI updates and skeleton screens rather than blocking spinners.
10. **Desktop-First Design**: Optimized for extensive data grids and video-rendering views, gracefully degrading to tablet and mobile via fluid grids.

---

## 3. Global Layout Standards

### 3.1 Application Shell
*   **Sidebar (Left)**: Collapsible navigation menu. Width: `240px` (expanded), `64px` (collapsed). Background: `#FAFAFA`.
*   **Top Navigation**: Height: `64px`. Contains Breadcrumbs, Global Search, Notification Bell, and User Avatar/Profile Dropdown. Sticky positioned.
*   **Content Area**: Fluid width, `min-height: calc(100vh - 64px)`. Padding: `24px` universally.
*   **Page Header**: H1 Title (`24px`, bold), optional subtitle (`14px`, text-secondary), and primary page-level actions (Top-Right).

### 3.2 Components
*   **Cards**: `border-radius: 8px`, `box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05)`. Used to group related content.
*   **Panels/Drawers**: Slide-in from right. Used for contextual editing without losing the main view context. Width: `400px`.
*   **Modals**: Centered overlays for blocking actions (e.g., Delete Confirmation, Interview Setup). Background overlay: `rgba(0,0,0,0.45)`, blur `2px`.
*   **Tables**: Ant Design standard. Sticky headers, alternating row colors (`#FFFFFF` and `#FAFAFA`). Default pagination: 10 items/page.
*   **Forms**: Top-aligned labels, `8px` spacing between label and input, `24px` spacing between form groups.

---

## 4. Navigation Specification

*   **Primary Navigation**: Located in the Left Sidebar. Categories change based on Role (Candidate vs. Employer).
*   **Secondary Navigation**: Horizontal Tabs located below the Page Header for context switching (e.g., Report Overview | Skill Breakdown | Video Playback).
*   **Breadcrumbs**: Format: `Home > [Parent Module] > [Current Page]`. Truncate middle items with `...` if depth > 4.
*   **Deep Linking**: All unique views, especially candidate reports, must have distinct UUID-based URLs for sharing.
*   **Keyboard Navigation**: Tab to move forward, `Shift + Tab` to move backward. `Enter` to activate links/buttons. `Esc` to close Modals/Drawers.

---

## 5. Screen Specifications

### 5.1 SCR-CAND-002: AI Interview Room
*   **Module**: Assessment Execution
*   **Purpose**: The real-time environment where a candidate interacts with the AI avatar/prompt for their simulation.
*   **Primary Persona**: Candidate (e.g., Software Engineering Graduate).
*   **Business Goal**: Accurately capture audio, video, and textual responses under timed conditions.

#### Layout Structure
*   **Grid System**: 12-column layout. Main stage (Video/AI Prompts) occupies 8 columns, Side Panel (Questions/Timer/Notes) occupies 4 columns.
*   **Responsive Behavior**: Main stage moves to top, Side Panel stacks below on screens < 992px.

#### UI Components & Behaviors
*   **Video Feed (Candidate)**: Displays local camera feed. 
    *   *State*: Loading (Camera permissions request) -> Active (Green border).
*   **AI Avatar/Prompt Area**: 
    *   *State*: Speaking (Waveform animation) -> Listening (Pulsing mic icon).
*   **Timer Badge**: 
    *   *Default*: Gray. 
    *   *Warning*: Turns Orange at 2 minutes remaining. 
    *   *Error*: Turns Red and pulses at 30 seconds remaining.
*   **Progress Bar**: Steps (1 of N questions). 
    *   *Behavior*: Fills horizontally as questions are completed.
*   **Action Buttons**: "Skip Question" (Secondary), "Submit & Next" (Primary).

#### Form & Input Specification (Code/Text Response if applicable)
*   **Code Editor Component**: Monaco Editor integration.
    *   *Placeholder*: `// Write your Java/Spring Boot or TypeScript code here...`
    *   *Auto-complete*: Disabled (Business rule for assessment).
    *   *Keyboard Behavior*: `Tab` inputs 2 spaces.

#### User Actions & System Responses
*   **Action**: Click "Submit & Next".
    *   **Response**: 
        1. Local video snippet frozen and upload begins (Background Sync).
        2. UI optimistically loads next question.
        3. Toast Notification: "Response saved securely."
*   **Action**: Network disconnect.
    *   **Response**: Pause timer, blur screen, show Dialog: "Connection lost. Reconnecting... Do not close window."

#### Accessibility & Empty States
*   **Empty State (Pre-start)**: "Awaiting System Checks (Mic/Cam)."
*   **ARIA**: Read out loud: "Time remaining: 2 minutes."
*   **Validation**: Ensure Candidate selected an interview type (e.g., "Technical Java", "JLPT N3 Simulation").

---

### 5.2 SCR-CAND-003: Assessment Report
*   **Module**: Results & Analytics
*   **Purpose**: Display AI-generated feedback, scoring, and skill gaps to the candidate.
*   **Primary Persona**: Candidate.

#### Layout Structure
*   **Header**: Overall Score (Out of 100) prominently displayed as a circular progress dial.
*   **Body**: Three primary Tabs: 
    1. **Overview** (Spider/Radar chart of skills).
    2. **Detailed Breakdown** (Question by question analysis).
    3. **Actionable Roadmap** (AI-suggested courses/improvements).

#### UI Components
*   **Radar Chart**: Dimensions: 400x400px. Axes map to core competencies (e.g., Algorithm, Architecture, Communication).
*   **Accordions**: For each question in the "Detailed Breakdown" tab.
    *   *Default*: Collapsed. Shows Question Title and Score.
    *   *Expanded*: Shows Candidate Answer Transcript, AI Ideal Answer, and specific critique.
*   **Tags**: Used for detected skills. 
    *   *Success (Green)*: "Strong". 
    *   *Warning (Orange)*: "Needs Improvement".

#### Microinteractions
*   **Hover Effects**: Hovering over a node on the Radar Chart displays a tooltip with the exact sub-score and a 1-sentence summary.
*   **Progressive Loading**: Report data loads in chunks (Overall score first -> Charts -> Detailed transcripts) to reduce Time to Interactive.

---

### 5.3 SCR-EMP-001: Employer Dashboard
*   **Module**: Employer Core
*   **Purpose**: High-level overview of active hiring campaigns and candidate throughput.
*   **Primary Persona**: Technical Recruiter / Hiring Manager.

#### UI Components
*   **Metric Cards (Top Row)**: 
    *   "Total Candidates", "Interviews Completed", "Average Score", "Pending Reviews". 
    *   Include a sparkline chart in the background of each card indicating 7-day trend.
*   **Data Table (Recent Candidates)**:
    *   Columns: Name, Role Applied, Match %, Status, Actions.
    *   *Behavior*: Sortable by Match %. Filterable by Role.
*   **Quick Action Button**: "Create New Assessment Campaign" (Floating or Top Right).

#### System Responses
*   **Action**: Filter Table by "Match % > 80".
    *   **Response**: Table skeleton loader (300ms) -> Filtered results update. URL updates query parameters `?match=80` for deep linking.

---

## 6. Component Mapping

| Screen ID | Component | Purpose | Reusable | Design System Token | Priority |
| :--- | :--- | :--- | :---: | :--- | :--- |
| **All** | Sidebar Navigation | Core routing | Yes | `nav-bg`, `nav-text` | High |
| **SCR-CAND-002** | Timer Badge | Time management | Yes | `color-warning`, `color-error` | High |
| **SCR-CAND-002** | WebRTC Video Player | Render local/remote feed | No | `radius-md`, `shadow-lg` | Critical |
| **SCR-CAND-003** | Radar Chart | Skill visualization | Yes | `chart-palette-1` | Medium |
| **SCR-EMP-001** | Metric Card | KPI Display | Yes | `surface-card`, `text-h3` | High |
| **Global** | Toast Notification | Non-blocking feedback | Yes | `z-index-toast`, `color-success` | High |

---

## 7. Interaction Matrix

| User Action | Component | System Response | Business Rule | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| Click "Start" | Primary Button | System checks A/V hardware | Must have hardware perms | Transition to Interview Room |
| Press `Esc` | Modal Window | Close Modal | Only if action is non-critical | Modal disappears, focus returns |
| Type in IDE | Code Editor | Syntax highlighting updates | Allowed languages only | Code formats dynamically |
| Submit File | Dropzone | Progress bar appears (0-100%) | Max file size 10MB | File uploads, success icon shows |
| Change Tab | Tab Navigation | Panel content swaps | None | Instant view change without reload |

---

## 8. Responsive Behavior

While ISAS is Desktop-first for deep analytical tasks, responsive rules apply:

*   **Large Desktop (1440px+)**: Standard layout. Maximum container width constrained to `1600px` to prevent text stretching.
*   **Laptop (1024px - 1439px)**: Fluid grids. Side panels compress slightly.
*   **Minimum Supported Resolution (1024x768)**: Standard target for typical enterprise displays. No horizontal scrolling permitted on main views.
*   **Window Resize**: Echarts/D3 charts must re-render via `ResizeObserver` to fit new container dimensions dynamically.
*   **Browser Zoom**: UI must remain fully functional and legible at up to `200%` zoom per WCAG 2.2 guidelines.

---

## 9. UX Metrics (KPIs)

To validate the success of the ISAS UX design, the following 30+ metrics will be tracked:

### Efficiency & Effectiveness
1.  Task Completion Rate (TCR) for Interview Setup.
2.  Average Task Time for Candidate Onboarding.
3.  Click Count to access a Candidate's Detailed Report.
4.  Form Error Rate on Registration.
5.  Search Success Rate (Employer finding a specific skill).
6.  Time to First Action (Post-login).
7.  Navigation Success Rate without using Search.
8.  Form Completion Rate (System Configuration).
9.  Form Abandonment Rate (Checkout/Subscription).
10. System Error Rate (Unhandled exceptions visible to user).

### Engagement & Retention
11. Drop-off Rate during Hardware Check.
12. Interview Abandonment Rate (Mid-assessment).
13. Post-Interview Report View Rate by Candidate.
14. Bounce Rate on ISAS Public Landing Pages.
15. Feature Adoption Rate (e.g., Custom AI Prompts).
16. Daily Active Users (DAU) Engagement Time.
17. User Retention Rate (30-day, Employer Persona).
18. Average Session Duration.

### Satisfaction & Sentiment
19. System Usability Scale (SUS) Score (Target: >80).
20. Customer Satisfaction (CSAT) for Technical Support.
21. Net Promoter Score (NPS).
22. Feedback Submission Rate (In-app bug reporting).
23. Support Ticket Volume related specifically to UI Confusion.

### Technical UX & Performance
24. Rage Click Count (Tracked via Hotjar/LogRocket).
25. Dead Click Count (Clicks on non-interactive elements).
26. Component Load Time Perception (Time to Interactive).
27. Largest Contentful Paint (LCP) across Dashboards.
28. Layout Shift (CLS) Score (Target: <0.1).

### Accessibility
29. Accessibility Compliance Rate (WCAG automated scans).
30. Screen Reader Successful Navigation Rate (Manual testing).
31. Contrast Error Count per Screen.
32. Keyboard-only Task Completion Rate.

---

## 10. Traceability Matrix

| Business Req | Functional Req | User Flow | Screen ID | UI Component | Business Rule |
| :--- | :--- | :--- | :--- | :--- | :--- |
| BR-01: AI Assessment | FR-01: Record Video | UF-03: Take Test | SCR-CAND-002 | WebRTC Player | Video must be strictly 720p |
| BR-02: Skill Reports | FR-05: View Analytics | UF-05: Review | SCR-CAND-003 | Radar Chart | Display 5 core dimensions |
| BR-03: Employer CRM | FR-10: Manage Candidates | UF-08: Campaign | SCR-EMP-001 | Data Table | Filter by threshold > 70% |
| BR-04: Secure Access | FR-15: Authentication | UF-01: Login | SCR-AUTH-001 | SSO Buttons | Token expires in 60 mins |

---

## 11. Future UX Enhancements
To ensure product longevity, the following features are planned for subsequent iterations:
1.  **Dark Mode**: A complete system-wide dark theme to reduce eye strain for recruiters and engineers reviewing reports at night.
2.  **Multi-language Support (i18n)**: UI toggles to support Vietnamese and Japanese interfaces seamlessly, supporting international employment programs.
3.  **AI Voice Navigation**: Allowing visually impaired users to navigate reports using natural language queries.
4.  **Advanced Keyboard Shortcuts**: Global command palette (e.g., `Cmd + K`) for rapid navigation between campaigns and candidate profiles.
5.  **Gamification**: Achievement badges for candidates completing complex technical challenges or language milestones.
6.  **Adaptive UI**: Dashboards that automatically rearrange widgets based on the user's most frequently accessed data.

---

## 12. Summary
The ISAS UI/UX Specification ensures a robust, professional, and accessible interface tailored to both candidates experiencing high-stakes assessments and employers managing volume recruitment. By strictly adhering to Material/Ant Design standards, progressive enhancement, and WCAG accessibility, the resulting interface will be predictable, efficient, and highly performant. This document serves as the absolute source of truth for all frontend implementation and QA validation.

