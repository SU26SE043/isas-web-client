# 19_Glossary

## 1. Document Purpose

**Purpose:** This document establishes the official, standardized vocabulary for the AI-powered Interview & Skill Assessment System (ISAS).

**Scope:** Covers all business, technical, operational, security, and AI terminology utilized throughout the project lifecycle.

**Intended Audience:** Business Analysts, Product Owners, Software Engineers, AI/ML Scientists, QA Engineers, HR Stakeholders, and Executive Sponsors.

**Relationship with BRD & Functional Requirements:** This glossary serves as the foundational dictionary. Any term used in the Business Requirements Document (BRD), Software Requirements Specification (SRS), or User Stories must strictly adhere to the definitions provided herein.

**Importance:** Standardized terminology prevents cross-departmental miscommunication, accelerates development, and ensures strict alignment between business intent and technical execution.


## 2. Glossary Usage Guidelines

* **Naming Conventions:** Terms are primarily listed as singular nouns unless the plural form is the industry standard.

* **Capitalization:** Business Objects (e.g., Campaign, Candidate) are capitalized in formal documentation.

* **Acronym Rules:** Do not use acronyms in requirements without first defining them or referencing Section 12 of this glossary.

* **Versioning:** This is a living document. Version history is tracked via the enterprise version control system.

* **Ownership & Governance:** Controlled by the Enterprise Information Architecture team. See Section 15 for governance procedures.


## 3. Business Terminology

| Glossary ID | Term | Definition | Business Context | Related Modules | Synonyms | Notes |
|---|---|---|---|---|---|---|
| GLS-BUS-001 | **Analytics** | Aggregated data analysis for reporting purposes. | Provides insights into campaign and candidate metrics. | Reporting | Metrics |  |
| GLS-BUS-002 | **Assessment** | A standardized test or evaluation to measure skills. | Used to quantify candidate capabilities. | Assessment | Test, Evaluation |  |
| GLS-BUS-003 | **Behavioral Marker** | Specific actions demonstrating a competency. | Used by the AI to score qualitative answers. | Assessment, AI Coach | Indicator |  |
| GLS-BUS-004 | **Benchmarking** | Comparing candidate scores against industry standards. | Provides context to assessment results. | Analytics | Norming |  |
| GLS-BUS-005 | **Billing** | The process of generating invoices and collecting payments. | Manages financial transactions. | Billing, Organization | Invoicing |  |
| GLS-BUS-006 | **Calibration** | The process of aligning scoring standards across evaluators. | Reduces bias and ensures fairness. | Assessment, Quality | Standardization |  |
| GLS-BUS-007 | **Campaign** | A structured recruitment initiative targeting specific roles. | Organizes candidates, job descriptions, and assessments. | Campaigns | Job Requisition |  |
| GLS-BUS-008 | **Candidate** | An individual undergoing assessment or applying for a position. | Primary actor evaluated by ISAS. | Assessment, Profile | Applicant |  |
| GLS-BUS-009 | **Candidate Experience** | The overall perception a candidate has of the recruitment process. | A key metric for employer branding. | Analytics | CX |  |
| GLS-BUS-010 | **Certificate** | A digital credential awarded upon mastery of a skill or roadmap. | Verifies candidate competencies. | Learning, Profile | Credential |  |
| GLS-BUS-011 | **Competency** | A demonstrable skill, knowledge, or ability. | The primary unit of measurement in ISAS. | Assessment, Profiling | Skill |  |
| GLS-BUS-012 | **Consent Form** | A legal agreement allowing data processing and AI evaluation. | Mandatory for compliance (GDPR/CCPA). | Security, User Flow | Agreement |  |
| GLS-BUS-013 | **Credit** | A unit of currency within the system used to pay for AI services. | Consumed for AI interviews and token usage. | Billing | Token |  |
| GLS-BUS-014 | **Credit Balance** | The remaining number of prepaid units available for AI services. | Dictates active usage limits. | Billing | Allowance |  |
| GLS-BUS-015 | **Custom Report** | A user-defined data extract tailored to specific KPIs. | Supports ad-hoc business intelligence needs. | Reporting | Ad-hoc Report |  |
| GLS-BUS-016 | **Dashboard** | A visual interface summarizing key system metrics. | The default landing page for logged-in users. | Dashboard, UI | Portal |  |
| GLS-BUS-017 | **Data Export** | The extraction of system data into portable formats (CSV/PDF). | Used for offline analysis or external integrations. | Reporting, Admin | Download |  |
| GLS-BUS-018 | **Employer** | A corporate entity utilizing ISAS to hire or evaluate staff. | The paying customer and primary B2B user. | Tenant, Billing | Organization, Client |  |
| GLS-BUS-019 | **Event Trigger** | A business rule that initiates an automated workflow. | Drives CI/CD and automated notifications. | Automation | Trigger |  |
| GLS-BUS-020 | **Feedback** | Qualitative and quantitative evaluation provided to a user. | Generated by AI or human reviewers. | Interview, Reporting | Review |  |
| GLS-BUS-021 | **Hiring Manager** | A business stakeholder who makes final recruitment decisions. | Reviews shortlists and assessment results. | Reporting, Review | Decision Maker |  |
| GLS-BUS-022 | **Integration Hub** | A module connecting ISAS to external ATS and HRIS platforms. | Enables seamless data flow across enterprise tools. | Settings, Admin | Connectors |  |
| GLS-BUS-023 | **Interview** | A formal evaluation session, either live or asynchronous. | The core evaluation event. | Interview, AI Coach | Session |  |
| GLS-BUS-024 | **Interview Template** | A predefined structure of questions and criteria for an interview. | Ensures consistency across assessments. | Interviews, Campaign | Rubric |  |
| GLS-BUS-025 | **Job Description** | A formal document detailing the responsibilities and requirements of a role. | Used by AI to extract required skills. | Campaign Management | JD |  |
| GLS-BUS-026 | **Learning Path** | A curated collection of learning modules. | Targets specific competency improvements. | Learning | Curriculum |  |
| GLS-BUS-027 | **License** | A legal authorization to use the ISAS software. | Governed by subscription tiers. | Billing | Seat |  |
| GLS-BUS-028 | **Matching Score** | A numerical value representing fit between candidate and job. | Calculated by AI based on extracted skills. | Campaign, Analytics | Fit Index |  |
| GLS-BUS-029 | **Module** | A distinct functional area of the ISAS application. | Organizes features logically. | System | Component |  |
| GLS-BUS-030 | **Notification** | System-generated alerts via email, SMS, or in-app. | Keeps users informed of status changes. | Notifications | Alert |  |
| GLS-BUS-031 | **Offer Letter** | A formal document extending employment terms. | Generated post-selection. | Campaign | Contract |  |
| GLS-BUS-032 | **On-Demand Video** | An asynchronous interview format where candidates record answers. | Reviewed later by AI and recruiters. | Interview | Asynchronous Interview |  |
| GLS-BUS-033 | **Onboarding** | The process of integrating a new hire into the organization. | Can be initiated post-offer in ISAS. | HRIS Integration | Induction |  |
| GLS-BUS-034 | **Practice Session** | A non-scored, simulated interview for candidate preparation. | Allows candidates to refine skills with AI feedback. | AI Coach | Mock Interview |  |
| GLS-BUS-035 | **Pricing Tier** | A predefined level of service with associated costs and limits. | Defines feature availability. | Billing | Plan Level |  |
| GLS-BUS-036 | **Profile** | A digital representation of a user's identity, skills, and history. | The core entity for individuals. | User Management | Account |  |
| GLS-BUS-037 | **Question Bank** | A centralized repository of interview and test questions. | Sourced for dynamic generation of assessments. | Content Management | Item Bank |  |
| GLS-BUS-038 | **Recruiter** | A user responsible for managing campaigns and sourcing candidates. | Operates the campaign logic and candidate pipelines. | Campaigns, ATS Integration | Talent Acquisition Specialist |  |
| GLS-BUS-039 | **Roadmap** | A sequential learning or development plan for a user. | Guides upskilling post-assessment. | Learning | Development Plan |  |
| GLS-BUS-040 | **Role** | A predefined set of permissions assigned to a user. | Controls system access (e.g., Admin, Recruiter). | Security, IAM | Access Level |  |
| GLS-BUS-041 | **Rubric** | A scoring guide used to evaluate performance. | Standardizes the grading process. | Assessment | Scoring Guide |  |
| GLS-BUS-042 | **Screening** | The initial phase of filtering candidates against basic criteria. | Automated by AI to reduce manual effort. | Campaign | Filtering |  |
| GLS-BUS-043 | **Skill Gap** | The difference between current competencies and required competencies. | Identified via assessments to trigger learning paths. | Analytics, Learning | Competency Gap |  |
| GLS-BUS-044 | **Skill Matrix** | A visual representation of an organization's competencies. | Used for talent mapping and gap analysis. | Analytics | Competency Map |  |
| GLS-BUS-045 | **Sourcing** | The proactive identification of potential candidates. | Often automated via AI matching. | Campaign | Prospecting |  |
| GLS-BUS-046 | **Standard Question** | A universal question used across multiple campaigns. | Ensures baseline comparability. | Question Bank | Common Question |  |
| GLS-BUS-047 | **Subscription** | A recurring billing agreement for ISAS access. | Defines tier, limits, and feature access. | Billing | Plan |  |
| GLS-BUS-048 | **Support Ticket** | A formal request for technical or business assistance. | Tracked for SLA compliance. | Support, Helpdesk | Issue |  |
| GLS-BUS-049 | **Tag** | A custom label applied to profiles or objects for categorization. | Enhances searchability. | System-wide | Label |  |
| GLS-BUS-050 | **Talent Pool** | A segmented database of candidates organized by skills. | Used for future sourcing and matching. | Candidate Management | Bench |  |
| GLS-BUS-051 | **Task** | An actionable item assigned to a user within a workflow. | Drives process completion. | Dashboard, Workflow | Action Item |  |
| GLS-BUS-052 | **Tenant** | A distinct, isolated instance of data for a specific organization. | Ensures data privacy in SaaS architecture. | System Architecture | Workspace |  |
| GLS-BUS-053 | **Threshold** | A minimum required score to pass an assessment stage. | Used for automated progression/rejection. | Assessment | Cut-off |  |
| GLS-BUS-054 | **User Acceptance** | The formal approval of a system feature by business stakeholders. | Part of the release lifecycle. | Project | UAT |  |
| GLS-BUS-055 | **Workflow** | A sequence of automated steps defining a business process. | Streamlines operations. | Automation | Process Flow |  |
| GLS-BUS-056 | **Workspace** | A collaborative area for recruiters within a specific tenant. | Organizes campaigns and candidate data. | Campaign | Dashboard |  |


## 4. AI Terminology

| Glossary ID | Term | Definition | Business Context | Related Modules | Synonyms | Notes |
|---|---|---|---|---|---|---|
| GLS-AI-001 | **Agentic AI** | AI systems that can autonomously plan and execute complex tasks. | Future feature for automated end-to-end recruitment. | AI Engine | AI Agents |  |
| GLS-AI-002 | **AI Coach** | An interactive AI assistant providing feedback to candidates. | Enhances candidate preparation and experience. | Learning | Virtual Coach |  |
| GLS-AI-003 | **AI Evaluation** | The process of an AI model assessing a candidate's response. | The core automated scoring mechanism. | Assessment | Machine Scoring |  |
| GLS-AI-004 | **Artificial Intelligence** | The simulation of human intelligence processes by computer systems. | Core technology driving ISAS capabilities. | System-wide | AI |  |
| GLS-AI-005 | **Attention Mechanism** | A technique allowing models to focus on relevant parts of input data. | Key to understanding long candidate responses. | AI Architecture | Self-Attention |  |
| GLS-AI-006 | **Bias** | Systematic errors in AI output favoring specific groups. | Must be audited to ensure fair hiring practices. | AI Governance | Algorithmic Bias |  |
| GLS-AI-007 | **Checkpoint** | A saved state of an AI model during the training process. | Allows rollback and version control of models. | AI Governance | Model Version |  |
| GLS-AI-008 | **Chunking** | Breaking large documents into smaller segments for AI processing. | Essential for processing long resumes or JDs. | Data Processing | Segmentation |  |
| GLS-AI-009 | **Confidence Score** | A statistical probability that the AI's prediction is correct. | Used to determine if human review is needed. | Analytics | Probability |  |
| GLS-AI-010 | **Context Window** | The maximum amount of text an LLM can process at once. | Limits the length of interview transcripts analyzed. | AI Configuration | Context Limit |  |
| GLS-AI-011 | **Cosine Similarity** | A metric used to measure how similar two text embeddings are. | Used to calculate matching scores. | Algorithm | Similarity Metric |  |
| GLS-AI-012 | **Deep Learning** | A subset of machine learning based on multi-layered neural networks. | Powers advanced STT and NLP tasks. | AI Engine | DL |  |
| GLS-AI-013 | **Embedding** | A mathematical vector representation of text data. | Used for semantic search and skill matching. | Data, Search | Vector |  |
| GLS-AI-014 | **Explainability** | The ability to understand and interpret AI decision-making processes. | Required for compliance and trust. | AI Governance | XAI |  |
| GLS-AI-015 | **Few-shot Learning** | Providing an AI model with a few examples to guide its output. | Used to format specific assessment reports. | AI Engine | Few-shot |  |
| GLS-AI-016 | **Fine-tuning** | Adjusting a pre-trained language model on domain-specific data. | Enhances ISAS accuracy for HR terminology. | AI Engine | Transfer Learning |  |
| GLS-AI-017 | **Generative AI** | AI that can create new content (text, audio) based on training data. | Powers dynamic interview questions and coaching feedback. | AI Engine | GenAI |  |
| GLS-AI-018 | **Hallucination** | When an AI model generates false or illogical information confidently. | Must be mitigated via grounding and RAG. | Quality Assurance | Fabrication |  |
| GLS-AI-019 | **Inference** | The process of running live data through a trained AI model to make predictions. | The operational phase of AI in production. | AI Engine | Prediction |  |
| GLS-AI-020 | **Knowledge Base** | A centralized repository of validated information used to ground AI. | Prevents hallucinations via RAG. | AI Engine, Data | Corpus |  |
| GLS-AI-021 | **Large Language Model** | A deep learning algorithm that can recognize, summarize, and generate text. | The foundation of ISAS NLP capabilities. | AI Engine | LLM |  |
| GLS-AI-022 | **Latent Space** | A multi-dimensional space where AI models represent learned concepts. | Used for clustering similar candidate profiles. | Data Architecture | Embedding Space |  |
| GLS-AI-023 | **Machine Learning** | Algorithms that improve automatically through experience and data. | Used for predictive analytics in hiring. | Analytics, AI Engine | ML |  |
| GLS-AI-024 | **Model Drift** | The degradation of an AI model's accuracy over time as data changes. | Requires continuous monitoring and fine-tuning. | AI Governance | Decay |  |
| GLS-AI-025 | **Multimodal AI** | AI models capable of processing multiple data types (text, audio, video). | Evaluates both spoken words and tone of voice. | AI Engine | Multimodal |  |
| GLS-AI-026 | **Natural Language Processing** | AI focused on the interaction between computers and human language. | Used for candidate answer evaluation. | AI Engine | NLP |  |
| GLS-AI-027 | **Neural Network** | A computational model inspired by the human brain. | The underlying architecture of deep learning models. | AI Engine | ANN |  |
| GLS-AI-028 | **Prompt** | The input text provided to an LLM to elicit a specific response. | Crucial for guiding AI behavior in interviews. | AI Engine | Input |  |
| GLS-AI-029 | **Prompt Chaining** | Linking multiple LLM prompts together to complete a complex workflow. | Used for detailed assessment grading pipelines. | AI Engineering | Chaining |  |
| GLS-AI-030 | **Prompt Injection** | A cyberattack where malicious inputs manipulate an LLM's output. | A key security risk requiring mitigation. | Security | Injection Attack |  |
| GLS-AI-031 | **Reasoning** | The AI's ability to logically deduce conclusions from premises. | Used in complex multi-step candidate evaluations. | AI Engine | Logic Inference |  |
| GLS-AI-032 | **Recommendation Engine** | A system that predicts a user's preference or fit. | Recommends learning paths and job matches. | Learning, Campaign | Recommender |  |
| GLS-AI-033 | **Reinforcement Learning** | Training AI models using reward and punishment mechanisms. | Used to optimize AI coaching responses. | AI Engine | RLHF |  |
| GLS-AI-034 | **Retrieval-Augmented Generation** | A framework that grounds LLM responses in external knowledge bases. | Ensures accurate, context-aware AI outputs. | AI Engine | RAG |  |
| GLS-AI-035 | **Semantic Search** | Search techniques that use meaning and context rather than exact keywords. | Improves skill and candidate querying. | Search, Data | Contextual Search |  |
| GLS-AI-036 | **Skill Extraction** | The automated identification of competencies from unstructured text. | Used on resumes and interview transcripts. | Data Processing | Entity Extraction |  |
| GLS-AI-037 | **Speech-to-Text** | Technology that transcribes spoken audio into written text. | Enables NLP processing of live interviews. | Interview, Integration | STT, ASR |  |
| GLS-AI-038 | **Temperature** | A parameter controlling the randomness of an LLM's output. | Set low for factual scoring, higher for conversational chat. | AI Configuration | Randomness |  |
| GLS-AI-039 | **Text-to-Speech** | Technology that synthesizes human-like voice from text. | Powers the AI avatar's verbal communication. | Interview, Integration | TTS |  |
| GLS-AI-040 | **Tokenization** | The process of breaking text into smaller units (tokens) for AI processing. | Affects billing and AI context limits. | AI Engine | Parsing |  |
| GLS-AI-041 | **Vector Database** | A database designed to store and query embeddings efficiently. | Powers semantic search and matching. | Data Architecture | Vector Store |  |
| GLS-AI-042 | **Zero-shot Learning** | An AI model performing a task without prior specific examples. | Used for generalized behavioral questions. | AI Engine | Zero-shot |  |


## 5. Recruitment Terminology

| Glossary ID | Term | Definition | Business Context | Related Modules | Synonyms | Notes |
|---|---|---|---|---|---|---|
| GLS-REC-001 | **Active Candidate** | A person actively applying for open roles. | The primary users interacting with Job Descriptions. | Candidate Management | Active Job Seeker |  |
| GLS-REC-002 | **Applicant** | A person who has formally applied for a job opening. | The initial state of a candidate in the hiring funnel. | Campaign | Job Seeker |  |
| GLS-REC-003 | **Applicant Tracking System** | Software that manages the recruitment process and candidate database. | ISAS integrates with enterprise ATS platforms. | Integration | ATS |  |
| GLS-REC-004 | **Background Check** | Verifying a candidate's employment, criminal, and educational history. | Conducted post-offer, outside of core ISAS. | HRIS Integration | Verification |  |
| GLS-REC-005 | **Behavioral Interview** | An interview focusing on past behavior to predict future performance. | Often utilizes the STAR method. | Interview | Competency Interview |  |
| GLS-REC-006 | **Boolean Search** | Using operators (AND, OR, NOT) to filter candidate databases. | A standard feature in the Talent Pool search. | Search | Advanced Search |  |
| GLS-REC-007 | **Cost per Hire** | The total cost involved in hiring a new employee. | Reduced by automating interviews via ISAS. | Analytics | CPH |  |
| GLS-REC-008 | **Diversity & Inclusion** | Initiatives ensuring fair representation across demographics. | AI models are audited to support D&I goals. | AI Governance | DEI |  |
| GLS-REC-009 | **Employer Branding** | The reputation of an organization as an employer. | Enhanced by a smooth AI interview experience. | Campaign | Company Image |  |
| GLS-REC-010 | **Equal Employment Opportunity** | Legal framework prohibiting discrimination in hiring. | ISAS algorithms are tested for EEO compliance. | Compliance | EEO |  |
| GLS-REC-011 | **Hard Skills** | Teachable, measurable abilities like programming or foreign languages. | Evaluated via specific technical questions. | Assessment | Technical Skills |  |
| GLS-REC-012 | **Headhunting** | Targeting highly skilled passive candidates for executive roles. | A specialized form of sourcing. | Campaign | Executive Search |  |
| GLS-REC-013 | **Hiring Funnel** | The staged process candidates move through, from awareness to offer. | Used for pipeline conversion analytics. | Analytics | Recruitment Funnel |  |
| GLS-REC-014 | **Job Family** | A grouping of jobs with similar characteristics or skill requirements. | Used to structure Question Banks and Rubrics. | System Architecture | Job Category |  |
| GLS-REC-015 | **Job Matching** | The process of aligning candidate skills with job requirements. | Automated via AI semantic search. | Campaign | Skill Matching |  |
| GLS-REC-016 | **Offer** | A formal proposal of employment terms extended to a candidate. | The final stage of a successful campaign. | Campaign | Employment Offer |  |
| GLS-REC-017 | **Offer Acceptance Rate** | The percentage of extended offers that are accepted by candidates. | Indicates competitiveness and candidate experience. | Analytics | OAR |  |
| GLS-REC-018 | **Passive Candidate** | A professional not actively looking for a job but open to opportunities. | Targeted via proactive sourcing. | Candidate Management | Passive Job Seeker |  |
| GLS-REC-019 | **Pay Grade** | A defined salary tier based on the level of responsibility. | Extracted from JDs for candidate matching. | Campaign | Salary Band |  |
| GLS-REC-020 | **Probation** | An initial period of employment where performance is closely evaluated. | Can trigger post-hire learning roadmaps. | HRIS Integration | Trial Period |  |
| GLS-REC-021 | **Quality of Hire** | A metric evaluating the value a new employee brings to the company. | Correlated with high assessment scores. | Analytics | QoH |  |
| GLS-REC-022 | **Recruitment Campaign** | A strategic effort to attract and hire candidates for specific roles. | Manages sourcing, interviewing, and selection. | Campaign | Hiring Drive |  |
| GLS-REC-023 | **Reference Check** | Contacting previous employers to validate a candidate's performance. | Can be partially automated via ISAS questionnaires. | Campaign | Referencing |  |
| GLS-REC-024 | **Requisition** | A formal request to create a new job opening and start hiring. | Initiates a new Campaign in ISAS. | Campaign | Job Req |  |
| GLS-REC-025 | **Retention Rate** | The percentage of employees who remain with the company over time. | Improved by accurate job matching. | Analytics | Retention |  |
| GLS-REC-026 | **Screening** | Evaluating candidates against minimum required criteria. | The first filter in the recruitment process. | Campaign | Pre-screening |  |
| GLS-REC-027 | **Soft Skills** | Interpersonal attributes like communication, teamwork, and adaptability. | Evaluated via NLP analysis of candidate responses. | Assessment | Interpersonal Skills |  |
| GLS-REC-028 | **Sourcing** | Proactively searching for and engaging potential candidates. | Fills the top of the hiring funnel. | Campaign | Prospecting |  |
| GLS-REC-029 | **STAR Method** | Situation, Task, Action, Result—a framework for behavioral answers. | Used by AI to structure and evaluate responses. | Interview | STAR Framework |  |
| GLS-REC-030 | **Talent Pipeline** | A continuous pool of candidates ready to fill future roles. | Reduces time-to-hire for recurring positions. | Candidate Management | Pipeline |  |
| GLS-REC-031 | **Technical Interview** | An assessment of hard skills and technical knowledge. | May involve coding tests or architecture discussions. | Assessment | Tech Screen |  |
| GLS-REC-032 | **Time to Hire** | A metric tracking the duration from job requisition to offer acceptance. | Key performance indicator for recruiters. | Analytics | TTH |  |


## 6. Learning & Assessment Terminology

| Glossary ID | Term | Definition | Business Context | Related Modules | Synonyms | Notes |
|---|---|---|---|---|---|---|
| GLS-LRN-001 | **Achievement** | A recognition of completing a milestone or mastering a skill. | Gamifies the learning experience. | Profile | Accomplishment |  |
| GLS-LRN-002 | **Badge** | A visual icon representing a specific Achievement. | Displayed on the user's Profile. | Profile | Digital Badge |  |
| GLS-LRN-003 | **Benchmark** | A standard against which user progress or scores are compared. | Used to evaluate relative performance. | Analytics | Standard |  |
| GLS-LRN-004 | **Blended Learning** | An approach combining digital media with traditional instructor-led methods. | Supported by ISAS external course tracking. | Learning | Hybrid Learning |  |
| GLS-LRN-005 | **Competency Matrix** | A grid mapping required skills against employee proficiency levels. | Identifies organizational skill gaps. | Analytics | Skill Grid |  |
| GLS-LRN-006 | **Feedback Loop** | The process of using assessment results to refine learning recommendations. | Ensures continuous improvement. | Learning | Continuous Feedback |  |
| GLS-LRN-007 | **Gamification** | Applying game-design elements (points, badges) to non-game contexts. | Increases user engagement in Learning Paths. | Learning | Game Mechanics |  |
| GLS-LRN-008 | **Leaderboard** | A ranked display of users based on points or achievements. | Fosters healthy competition among internal staff. | Dashboard | Ranking |  |
| GLS-LRN-009 | **Learning Experience Platform** | A modern learning platform focused on personalized, AI-driven discovery. | ISAS incorporates LXP features in its Learning module. | Learning | LXP |  |
| GLS-LRN-010 | **Learning Management System** | Enterprise software for administering educational courses. | ISAS can integrate with external LMS platforms. | Integration | LMS |  |
| GLS-LRN-011 | **Learning Module** | A discrete unit of educational content focusing on a specific topic. | Building blocks of a Learning Path. | Learning | Course |  |
| GLS-LRN-012 | **Learning Outcome** | The expected knowledge or skill acquired after completing a module. | Defines the objective of a Learning Path. | Learning | Objective |  |
| GLS-LRN-013 | **Mastery** | A high level of demonstrated proficiency in a specific Competency. | Triggers the award of a Certificate. | Assessment | Expertise |  |
| GLS-LRN-014 | **Microlearning** | Delivering educational content in small, highly focused chunks. | The preferred format for AI Coach interventions. | Learning | Bite-sized Learning |  |
| GLS-LRN-015 | **Peer Review** | Evaluation of work by one or more people with similar competencies. | An optional human-in-the-loop assessment step. | Assessment | Peer Evaluation |  |
| GLS-LRN-016 | **Personalized Learning** | Tailoring the educational experience to the individual user's needs. | Generated dynamically by the Recommendation Engine. | Learning | Adaptive Learning |  |
| GLS-LRN-017 | **Prerequisite** | A condition or skill required before enrolling in a Learning Module. | Enforced by system workflows. | Learning | Requirement |  |
| GLS-LRN-018 | **Progress** | The tracked advancement of a user through a Learning Path. | Displayed on the Learning Dashboard. | Dashboard | Completion Rate |  |
| GLS-LRN-019 | **Quiz** | A short, informal assessment used to check knowledge retention. | Used within Learning Modules. | Assessment | Knowledge Check |  |
| GLS-LRN-020 | **Reskilling** | Training employees for an entirely new role within the company. | Facilitates internal mobility. | Learning | Retraining |  |
| GLS-LRN-021 | **SCORM** | A set of technical standards for e-learning software products. | Standard format for importing external courses. | Integration | Sharable Content Object Reference Model |  |
| GLS-LRN-022 | **Skill Gap Analysis** | The process of identifying discrepancies between current and required skills. | Automatically generated post-Assessment. | Analytics | Needs Analysis |  |
| GLS-LRN-023 | **Syllabus** | An outline of the subjects in a course of study or Learning Path. | Provides candidates with learning expectations. | Learning | Course Outline |  |
| GLS-LRN-024 | **Upskilling** | Teaching employees new skills to optimize their performance. | A primary goal of the Learning module. | Learning | Skill Enhancement |  |


## 7. Security Terminology

| Glossary ID | Term | Definition | Business Context | Related Modules | Synonyms | Notes |
|---|---|---|---|---|---|---|
| GLS-SEC-001 | **Access Control** | Mechanisms that restrict access to system resources. | Managed via the Security module. | Security | Permissions |  |
| GLS-SEC-002 | **Audit** | A systematic review of system logs to ensure compliance and security. | Tracked via the Audit Log module. | Security | Audit Trail |  |
| GLS-SEC-003 | **Authentication** | The process of verifying the identity of a user or system. | The first step in secure system access. | Security | Login, AuthN |  |
| GLS-SEC-004 | **Authorization** | Determining the access rights and privileges of an authenticated user. | Governed by RBAC. | Security | AuthZ |  |
| GLS-SEC-005 | **Brute Force** | An attack method submitting many passwords to guess correctly. | Mitigated via Rate Limiting and account lockouts. | Security | Password Guessing |  |
| GLS-SEC-006 | **Compliance** | Adhering to regulatory standards (e.g., GDPR, SOC 2). | Mandates data handling procedures. | Security | Regulatory Adherence |  |
| GLS-SEC-007 | **Consent** | Explicit permission granted by a user for data processing. | Required before AI analysis of interviews. | Security | Opt-in |  |
| GLS-SEC-008 | **Cross-Origin Resource Sharing** | A mechanism allowing restricted resources to be requested from another domain. | Configured securely on APIs. | Security | CORS |  |
| GLS-SEC-009 | **Cross-Site Request Forgery** | An attack forcing a user to execute unwanted actions. | Mitigated via anti-CSRF tokens. | Security | CSRF |  |
| GLS-SEC-010 | **Cross-Site Scripting** | An attack injecting malicious scripts into web pages. | Mitigated via input sanitization. | Security | XSS |  |
| GLS-SEC-011 | **Data Masking** | Obscuring specific data elements within a database. | Used to hide PII in lower environments. | Data | Obfuscation |  |
| GLS-SEC-012 | **Distributed Denial of Service** | An attack aimed at disrupting network traffic by overwhelming servers. | Mitigated via WAF and load balancers. | Security | DDoS |  |
| GLS-SEC-013 | **Encryption** | Converting data into a secure format to prevent unauthorized access. | Applied data-at-rest and data-in-transit. | Security | Cryptography |  |
| GLS-SEC-014 | **Hash** | A one-way mathematical function used to secure passwords. | ISAS uses bcrypt or Argon2. | Security | Hashing |  |
| GLS-SEC-015 | **JSON Web Token** | A compact, URL-safe means of representing claims between parties. | Used for API authentication in ISAS. | Security | JWT |  |
| GLS-SEC-016 | **Key Management** | The administration of cryptographic keys within the system. | Managed via secure HSMs or Cloud KMS. | Security | KMS |  |
| GLS-SEC-017 | **Least Privilege** | The principle of granting users only the permissions necessary for their tasks. | A core security design standard. | Security | Minimal Access |  |
| GLS-SEC-018 | **Malware** | Software intentionally designed to cause disruption or damage. | Scanned for in user file uploads (Resumes). | Security | Malicious Software |  |
| GLS-SEC-019 | **Multi-Factor Authentication** | Requiring two or more verification methods for access. | Mandatory for Admin and Recruiter roles. | Security | MFA, 2FA |  |
| GLS-SEC-020 | **OAuth2** | An authorization framework enabling application access to HTTP services. | Used for third-party API integrations. | Integration | OAuth |  |
| GLS-SEC-021 | **OIDC** | An identity layer on top of the OAuth 2.0 protocol. | Used for modern SSO implementations. | Integration | OpenID Connect |  |
| GLS-SEC-022 | **Penetration Testing** | An authorized simulated cyberattack to evaluate system security. | Conducted annually by third parties. | Security | Pen Test |  |
| GLS-SEC-023 | **Personally Identifiable Information** | Any data that could potentially identify a specific individual. | Subject to strict encryption and retention rules. | Data | PII |  |
| GLS-SEC-024 | **Phishing** | A cyber attack attempting to steal sensitive data via deceptive emails. | Mitigated via MFA and security awareness. | Security | Social Engineering |  |
| GLS-SEC-025 | **Ransomware** | Malware that encrypts data and demands payment for the key. | Mitigated via immutable backups. | Security | Extortionware |  |
| GLS-SEC-026 | **Rate Limiting** | Controlling the number of requests a user can make to an API. | Prevents abuse and DDoS attacks. | Architecture | Throttling |  |
| GLS-SEC-027 | **Role-Based Access Control** | Restricting system access based on the user's role. | Ensures least privilege across modules. | Security | RBAC |  |
| GLS-SEC-028 | **Salt** | Random data added to a password before hashing. | Prevents rainbow table attacks. | Security | Salting |  |
| GLS-SEC-029 | **SAML** | An XML-based standard for exchanging authentication data. | Used for enterprise SSO integrations. | Integration | Security Assertion Markup Language |  |
| GLS-SEC-030 | **Session** | A temporary interactive information exchange between a user and the system. | Times out automatically for security. | Security | User Session |  |
| GLS-SEC-031 | **SIEM** | Software providing real-time analysis of security alerts. | Used by the DevOps team for monitoring. | Security | Security Information and Event Management |  |
| GLS-SEC-032 | **Single Sign-On** | An authentication scheme allowing users to log in to multiple systems with one ID. | Integrated via SAML or OIDC. | Integration | SSO |  |
| GLS-SEC-033 | **SOC 2** | An auditing procedure ensuring secure data management. | ISAS compliance target for enterprise sales. | Compliance | System and Organization Controls |  |
| GLS-SEC-034 | **SQL Injection** | An attack executing malicious SQL statements via input fields. | Mitigated via ORM and parameterized queries. | Security | SQLi |  |
| GLS-SEC-035 | **Token** | A digital key used for authentication or API access (e.g., JWT). | Used for stateless session management. | Security | Access Token |  |
| GLS-SEC-036 | **Vulnerability Scanning** | Automated process of identifying security weaknesses. | Integrated into the CI/CD pipeline. | DevOps | Vuln Scan |  |
| GLS-SEC-037 | **Web Application Firewall** | A firewall monitoring and filtering HTTP traffic to web applications. | Protects against OWASP Top 10 vulnerabilities. | Security | WAF |  |
| GLS-SEC-038 | **Zero Trust** | A security model requiring strict identity verification for every request. | Implemented across all microservices. | Architecture | Zero Trust Architecture |  |


## 8. Technical Terminology

| Glossary ID | Term | Definition | Business Context | Related Modules | Synonyms | Notes |
|---|---|---|---|---|---|---|
| GLS-TECH-001 | **API Gateway** | A server acting as an API front-end, receiving API requests. | Handles routing, rate limiting, and auth. | Architecture | Gateway |  |
| GLS-TECH-002 | **Application Programming Interface** | A set of protocols for building and integrating software applications. | Connects ISAS backend to frontend and external systems. | Architecture | API |  |
| GLS-TECH-003 | **Availability** | The proportion of time a system is functional and working. | Crucial metric for SaaS products. | Architecture | Uptime |  |
| GLS-TECH-004 | **Cache** | A hardware or software component storing data for faster future access. | Improves dashboard and query performance (Redis). | Architecture | In-memory Store |  |
| GLS-TECH-005 | **Cloud** | On-demand availability of computer system resources over the internet. | ISAS is hosted on AWS/GCP/Azure. | Architecture | Cloud Computing |  |
| GLS-TECH-006 | **Cluster** | A set of node machines for running containerized applications. | Provides high availability for ISAS. | DevOps | K8s Cluster |  |
| GLS-TECH-007 | **Container** | A standard unit of software packaging code and its dependencies. | Ensures consistent execution environments (Docker). | DevOps | Docker Image |  |
| GLS-TECH-008 | **Content Delivery Network** | A geographically distributed network of proxy servers. | Speeds up delivery of static UI assets. | Architecture | CDN |  |
| GLS-TECH-009 | **Continuous Integration / Continuous Deployment** | A method to frequently deliver apps to customers by introducing automation. | Automates ISAS testing and release. | DevOps | CI/CD |  |
| GLS-TECH-010 | **DevOps** | A set of practices combining software development and IT operations. | Ensures rapid, reliable system updates. | Engineering | Development Operations |  |
| GLS-TECH-011 | **Docker** | A platform for developing, shipping, and running applications in containers. | Standard deployment method for ISAS. | DevOps | Containerization |  |
| GLS-TECH-012 | **Domain Name System** | The phonebook of the internet, translating domains to IP addresses. | Manages ISAS web routing. | Architecture | DNS |  |
| GLS-TECH-013 | **Event** | A significant change in state within the system. | Triggers asynchronous workflows via message brokers. | Architecture | State Change |  |
| GLS-TECH-014 | **GraphQL** | A data query language for APIs allowing clients to request exactly what they need. | Used for flexible frontend data fetching. | Architecture | GQL |  |
| GLS-TECH-015 | **gRPC** | A high-performance, open-source universal RPC framework. | Used for low-latency microservice communication. | Architecture | RPC |  |
| GLS-TECH-016 | **HTTP/2** | A major revision of the HTTP network protocol. | Improves web performance and latency. | Architecture | HTTP2 |  |
| GLS-TECH-017 | **Kafka** | A distributed event streaming platform. | Used for high-throughput data pipelines in ISAS. | Architecture | Event Stream |  |
| GLS-TECH-018 | **Kubernetes** | An open-source system for automating deployment and scaling of containers. | Orchestrates ISAS microservices. | DevOps | K8s |  |
| GLS-TECH-019 | **Latency** | The time delay between a user action and the system response. | Must be minimized for live AI coaching. | Architecture | Response Time |  |
| GLS-TECH-020 | **Load Balancer** | A device acting as a reverse proxy distributing network traffic. | Ensures high availability across microservices. | Architecture | LB |  |
| GLS-TECH-021 | **Logging** | The automated recording of system events and errors. | Centralized in ELK stack for troubleshooting. | DevOps | Log Management |  |
| GLS-TECH-022 | **Message Broker** | Software enabling applications to communicate and exchange information. | Manages event-driven architecture (RabbitMQ). | Architecture | Event Bus |  |
| GLS-TECH-023 | **Microservice** | An architectural style structuring an application as a collection of loose services. | Ensures ISAS scalability and fault tolerance. | Architecture | Service |  |
| GLS-TECH-024 | **Monitoring** | The continuous observation of system performance and health. | Utilizes tools like Datadog or Prometheus. | DevOps | Observability |  |
| GLS-TECH-025 | **Node** | A worker machine in Kubernetes, either virtual or physical. | Executes the application workloads. | DevOps | Server |  |
| GLS-TECH-026 | **Object-Relational Mapping** | A programming technique for converting data between incompatible systems. | Simplifies database queries in backend code. | Architecture | ORM |  |
| GLS-TECH-027 | **Pod** | The smallest deployable computing unit created in Kubernetes. | Hosts one or more application containers. | DevOps | K8s Pod |  |
| GLS-TECH-028 | **Queue** | A data structure used to manage asynchronous messages between services. | Handles background tasks like AI processing (Kafka). | Architecture | Message Queue |  |
| GLS-TECH-029 | **Redis** | An open-source, in-memory data structure store. | Used for caching and session management. | Architecture | In-memory DB |  |
| GLS-TECH-030 | **REST** | Representational State Transfer, a software architectural style for APIs. | Standard protocol for third-party integrations. | Architecture | RESTful API |  |
| GLS-TECH-031 | **Scalability** | The ability of the system to handle a growing amount of work. | Achieved via auto-scaling microservices. | Architecture | Elasticity |  |
| GLS-TECH-032 | **Serverless** | A cloud computing execution model dynamically allocating resources. | Used for discrete, bursty AI processing tasks. | Architecture | FaaS |  |
| GLS-TECH-033 | **Service Level Agreement** | A commitment between a service provider and a client regarding quality. | Dictates required uptime (e.g., 99.9%). | Business | SLA |  |
| GLS-TECH-034 | **Virtual Private Cloud** | A secure, isolated private cloud hosted within a public cloud. | Protects ISAS backend databases. | Security | VPC |  |
| GLS-TECH-035 | **Webhook** | A mechanism for an application to provide real-time data to other applications. | Triggers ATS updates upon assessment completion. | Integration | HTTP Callback |  |
| GLS-TECH-036 | **WebSocket** | A computer communications protocol providing full-duplex communication channels. | Enables real-time chat in the AI Coach. | Architecture | WS |  |


## 9. Data Terminology

| Glossary ID | Term | Definition | Business Context | Related Modules | Synonyms | Notes |
|---|---|---|---|---|---|---|
| GLS-DAT-001 | **ACID** | Atomicity, Consistency, Isolation, Durability—properties of database transactions. | Ensures data integrity in financial billing. | Architecture | Transaction Properties |  |
| GLS-DAT-002 | **Big Data** | Extremely large data sets analyzed computationally to reveal patterns. | Used to train foundation AI models. | Data Engineering | Massive Data |  |
| GLS-DAT-003 | **CAP Theorem** | States a distributed DB can only provide two of: Consistency, Availability, Partition tolerance. | Guides ISAS database selection. | Architecture | Brewer's Theorem |  |
| GLS-DAT-004 | **Data Catalog** | A detailed inventory of all data assets in an organization. | Helps developers find and understand datasets. | Governance | Data Inventory |  |
| GLS-DAT-005 | **Data Classification** | The process of organizing data by categories based on sensitivity. | e.g., Public, Internal, Confidential, Restricted. | Security | Information Classification |  |
| GLS-DAT-006 | **Data Dictionary** | A centralized repository of metadata about data elements. | Defines database schemas and fields. | Architecture | Metadata Repository |  |
| GLS-DAT-007 | **Data Governance** | The overall management of the availability, usability, integrity, and security of data. | Ensures enterprise compliance. | Data Governance | Data Management |  |
| GLS-DAT-008 | **Data Lake** | A centralized repository that allows storing structured and unstructured data at any scale. | Stores raw interview video/audio files. | Data Architecture | Raw Storage |  |
| GLS-DAT-009 | **Data Lineage** | The lifecycle of data, tracking its origins and movements over time. | Crucial for auditing AI decisions. | Governance | Data Flow Map |  |
| GLS-DAT-010 | **Data Mart** | A structure / access pattern specific to data warehouse environments. | Focuses on a single business line (e.g., HR Analytics). | Data Architecture | Departmental DB |  |
| GLS-DAT-011 | **Data Owner** | A senior stakeholder accountable for a specific data domain. | Approves access and usage policies. | Governance | Domain Owner |  |
| GLS-DAT-012 | **Data Pipeline** | A set of actions that ingest raw data from disparate sources and move it to a destination. | Automates data processing for AI models. | Data Engineering | Data Flow |  |
| GLS-DAT-013 | **Data Quality** | The measure of the condition of data based on accuracy and completeness. | Crucial for reliable AI matching and scoring. | Data Governance | DQ |  |
| GLS-DAT-014 | **Data Retention** | The policies determining how long data is stored before deletion. | Governed by GDPR and system configuration. | Compliance | Archiving Policy |  |
| GLS-DAT-015 | **Data Steward** | A role responsible for managing data assets on behalf of others. | Ensures Data Quality and Governance standards. | Governance | Data Champion |  |
| GLS-DAT-016 | **Data Warehouse** | A central repository of integrated data from one or more disparate sources. | Used for reporting and analytics. | Data Architecture | EDW |  |
| GLS-DAT-017 | **ELT** | Extract, Load, Transform—loading raw data before transforming it. | Used in modern cloud data warehouses. | Data Engineering | Data Integration |  |
| GLS-DAT-018 | **ETL** | Extract, Transform, Load—a data integration process. | Moves data from operational DBs to the Data Warehouse. | Data Engineering | Data Integration |  |
| GLS-DAT-019 | **Indexing** | A data structure technique to efficiently retrieve records from database files. | Speeds up search queries. | Architecture | DB Index |  |
| GLS-DAT-020 | **Master Data** | The core data essential to operations in a specific business or IT domain. | e.g., User Profiles, Company Profiles. | Data Architecture | Core Data |  |
| GLS-DAT-021 | **Metadata** | Data that provides information about other data. | e.g., Creation date, file size, embedding dimensions. | Data Architecture | Data about Data |  |
| GLS-DAT-022 | **Normalization** | Organizing data to reduce redundancy and improve data integrity. | Applied to the transactional database schema. | Architecture | Data Normalization |  |
| GLS-DAT-023 | **NoSQL** | A database providing a mechanism for storage and retrieval other than tabular relations. | Used for scalable document storage (MongoDB). | Data Architecture | Non-relational DB |  |
| GLS-DAT-024 | **Reference Data** | Data used to classify or categorize other data. | e.g., Country Codes, Job Families, Skill Categories. | Data Architecture | Lookup Data |  |
| GLS-DAT-025 | **Relational Database** | A database organized into tables with defined relationships. | Stores transactional business data (PostgreSQL). | Data Architecture | RDBMS |  |
| GLS-DAT-026 | **Replication** | Storing data across multiple locations to improve availability and reliability. | Protects against server failure. | Architecture | Data Copying |  |
| GLS-DAT-027 | **Sharding** | A type of database partitioning that separates large databases into smaller parts. | Ensures scalability for high-volume tenants. | Architecture | Horizontal Partitioning |  |
| GLS-DAT-028 | **Transaction Data** | Information capturing interactions or events. | e.g., Interview Records, Assessment Scores, Billing Invoices. | Data Architecture | Event Data |  |


## 10. Reporting Terminology

| Glossary ID | Term | Definition | Business Context | Related Modules | Synonyms | Notes |
|---|---|---|---|---|---|---|
| GLS-REP-001 | **Aggregation** | The process of gathering data and presenting it in a summarized format. | e.g., Total candidates per month. | Reporting | Summary |  |
| GLS-REP-002 | **Benchmark** | A standard or point of reference against which things may be compared. | Comparing candidate scores to the global average. | Analytics | Standard |  |
| GLS-REP-003 | **Dashboard** | A graphical user interface that visualizes key performance indicators (KPIs). | Provides an at-a-glance view of system status. | Reporting | Visual Interface |  |
| GLS-REP-004 | **Data Visualization** | The graphical representation of information and data. | Charts, graphs, and maps in the Dashboard. | Reporting | Data Viz |  |
| GLS-REP-005 | **Dimension** | A structure categorizing facts and measures to enable users to answer business questions. | e.g., Time, Location, Job Family. | Data Warehousing | Category |  |
| GLS-REP-006 | **Drill-down** | The action of moving from summary data to detailed, granular data. | Clicking a chart to see specific candidates. | Reporting | Deep Dive |  |
| GLS-REP-007 | **Fact** | A measurable, quantitative datum about a business event. | e.g., Assessment Score, Interview Duration. | Data Warehousing | Measure |  |
| GLS-REP-008 | **Forecast** | A prediction of future trends based on historical data analysis. | Predicting talent pipeline requirements. | Analytics | Prediction |  |
| GLS-REP-009 | **Key Performance Indicator** | A measurable value demonstrating how effectively objectives are met. | e.g., Offer Acceptance Rate, Cost per Hire. | Reporting | KPI |  |
| GLS-REP-010 | **Measure** | A property on which calculations can be made. | Sum, Average, Count. | Reporting | Calculation |  |
| GLS-REP-011 | **Metric** | A quantifiable measure used to track and assess the status of a specific business process. | e.g., Average Interview Duration. | Reporting | Measure |  |
| GLS-REP-012 | **Month-to-Date** | A period starting from the beginning of the current month to the present day. | Common KPI reporting timeframe. | Reporting | MTD |  |
| GLS-REP-013 | **Pivot** | A data summarization tool that sorts, reorganizes, and calculates data. | Used in custom reporting. | Reporting | Cross-tabulation |  |
| GLS-REP-014 | **Scorecard** | A statistical record used to measure achievement or progress toward goals. | Displays candidate performance across competencies. | Assessment | Report Card |  |
| GLS-REP-015 | **Snapshot** | A view of data at a specific point in time. | Used for historical reporting and audits. | Reporting | Point-in-time |  |
| GLS-REP-016 | **Time Series** | A sequence of data points indexed in time order. | Visualized in dashboards to show hiring velocity. | Analytics | Chronological Data |  |
| GLS-REP-017 | **Trend** | A general direction in which data points are developing or changing over time. | Analyzed to forecast future hiring needs. | Analytics | Pattern |  |
| GLS-REP-018 | **Variance** | The difference between an expected outcome and the actual result. | Analyzing budget vs. actual hiring costs. | Reporting | Deviation |  |
| GLS-REP-019 | **Year-to-Date** | A period starting from the beginning of the current year to the present day. | Common KPI reporting timeframe. | Reporting | YTD |  |


## 11. Project Terminology

| Glossary ID | Term | Definition | Business Context | Related Modules | Synonyms | Notes |
|---|---|---|---|---|---|---|
| GLS-PRJ-001 | **Acceptance Criteria** | Conditions that a software product must satisfy to be accepted by a user. | Defines 'Done' for a User Story. | Agile | Conditions of Satisfaction |  |
| GLS-PRJ-002 | **Agile** | A project management methodology characterized by iterative development. | The chosen methodology for ISAS delivery. | Methodology | Iterative Development |  |
| GLS-PRJ-003 | **Assumption** | A factor considered to be true, real, or certain without proof. | Documented during the BRD phase. | Project Management | Hypothesis |  |
| GLS-PRJ-004 | **Backlog** | A prioritized list of work for the development team. | Managed by the Product Owner. | Agile | Product Backlog |  |
| GLS-PRJ-005 | **Burn-down Chart** | A graphical representation of work left to do versus time. | Tracks sprint progress. | Agile | Burndown |  |
| GLS-PRJ-006 | **Business Requirements Document** | A formal document detailing the business solutions for a project. | Defines the 'What' and 'Why' of ISAS. | Project Management | BRD |  |
| GLS-PRJ-007 | **Change Request** | A formal proposal to alter a product or system. | Must go through the Change Control Board. | Governance | CR |  |
| GLS-PRJ-008 | **Constraint** | A limitation or restriction on the project. | e.g., Budget, time, or technical stack limits. | Project Management | Limitation |  |
| GLS-PRJ-009 | **Daily Standup** | A short daily meeting to discuss progress and impediments. | Keeps the development team aligned. | Agile | Daily Scrum |  |
| GLS-PRJ-010 | **Definition of Done** | A shared understanding of what it means for work to be complete. | Ensures quality standards are met. | Agile | DoD |  |
| GLS-PRJ-011 | **Definition of Ready** | Criteria a user story must meet before being accepted into a sprint. | Ensures requirements are clear. | Agile | DoR |  |
| GLS-PRJ-012 | **Dependency** | A relationship where one task relies on the completion of another. | Tracked to prevent project delays. | Project Management | Prerequisite |  |
| GLS-PRJ-013 | **Epic** | A large body of work that can be broken down into specific tasks (user stories). | e.g., 'AI Interview Module'. | Agile | Feature Group |  |
| GLS-PRJ-014 | **Feature** | A distinguishing characteristic of a software item. | e.g., 'Resume Parsing'. | Product Management | Capability |  |
| GLS-PRJ-015 | **Go-Live** | The point at which the system becomes available to production users. | The culmination of the release process. | Release Management | Launch |  |
| GLS-PRJ-016 | **Impediment** | Anything that prevents a team member from performing work as efficiently as possible. | Resolved by the Scrum Master. | Agile | Blocker |  |
| GLS-PRJ-017 | **Kanban** | A visual method for managing work as it moves through a process. | Used for continuous delivery workflows. | Agile | Kanban Board |  |
| GLS-PRJ-018 | **Milestone** | A significant point or event in the project timeline. | e.g., 'UAT Sign-off'. | Project Management | Checkpoint |  |
| GLS-PRJ-019 | **Release** | The deployment of a new version of the software to production. | Coordinated by DevOps and Product. | Release Management | Deployment |  |
| GLS-PRJ-020 | **Retrospective** | A meeting held at the end of a sprint to discuss what went well and what didn't. | Drives continuous improvement. | Agile | Retro |  |
| GLS-PRJ-021 | **Risk** | An uncertain event that, if it occurs, has a positive or negative effect on project objectives. | Mitigated via risk management plans. | Project Management | Threat |  |
| GLS-PRJ-022 | **Scrum** | An agile framework for developing, delivering, and sustaining complex products. | Defines roles like Scrum Master and Product Owner. | Agile | Scrum Framework |  |
| GLS-PRJ-023 | **Software Requirements Specification** | A document describing what the software will do and how it will perform. | Defines the 'How' of ISAS. | Engineering | SRS |  |
| GLS-PRJ-024 | **Sponsor** | The person or group providing resources and support for the project. | Accountable for project success. | Project Management | Executive Sponsor |  |
| GLS-PRJ-025 | **Sprint** | A set period during which specific work has to be completed and made ready for review. | Typically 2 weeks for ISAS development. | Agile | Iteration |  |
| GLS-PRJ-026 | **Stakeholder** | An individual, group, or organization affected by the project outcome. | Business users, sponsors, and customers. | Project Management | Interest Group |  |
| GLS-PRJ-027 | **Steering Committee** | An advisory group providing guidance on project direction. | Handles major escalations. | Governance | SteerCo |  |
| GLS-PRJ-028 | **Story Point** | A unit of measure used in Agile to estimate the effort required to implement a story. | Used for sprint planning. | Agile | Estimation Unit |  |
| GLS-PRJ-029 | **User Story** | A short, simple description of a feature told from the perspective of the user. | Agile requirement format. | Agile | Story |  |
| GLS-PRJ-030 | **Velocity** | A measure of the amount of work a team can tackle during a single Sprint. | Used to forecast future sprint capacity. | Agile | Pace |  |


## 12. Acronyms & Abbreviations

| Glossary ID | Acronym | Full Form | Definition | Business Context |
|---|---|---|---|---|
| GLS-ACR-001 | **AI** | Artificial Intelligence | The simulation of human intelligence by machines. | System-wide Core |
| GLS-ACR-002 | **API** | Application Programming Interface | Protocols for software integration. | Architecture |
| GLS-ACR-003 | **ATS** | Applicant Tracking System | Software managing the recruitment process. | Integration |
| GLS-ACR-004 | **BA** | Business Analyst | Bridges business needs and technical solutions. | Project Team |
| GLS-ACR-005 | **BDD** | Behavior-Driven Development | Agile software development process. | Engineering |
| GLS-ACR-006 | **BRD** | Business Requirements Document | Details business solutions and logic. | Project Phase |
| GLS-ACR-007 | **CCPA** | California Consumer Privacy Act | California data privacy law. | Compliance |
| GLS-ACR-008 | **CI/CD** | Continuous Integration/Continuous Deployment | Automated software release process. | DevOps |
| GLS-ACR-009 | **GDPR** | General Data Protection Regulation | EU data privacy and security law. | Compliance |
| GLS-ACR-010 | **HRIS** | Human Resources Information System | Software managing employee data. | Integration |
| GLS-ACR-011 | **JSON** | JavaScript Object Notation | Lightweight data-interchange format. | API Payloads |
| GLS-ACR-012 | **JWT** | JSON Web Token | Securely transmits information between parties. | API Security |
| GLS-ACR-013 | **KPI** | Key Performance Indicator | Measurable value of business performance. | Reporting |
| GLS-ACR-014 | **LLM** | Large Language Model | Deep learning algorithm for text generation. | AI Engine |
| GLS-ACR-015 | **MFA** | Multi-Factor Authentication | Security requiring multiple verification methods. | Access Control |
| GLS-ACR-016 | **NLP** | Natural Language Processing | AI focused on human language comprehension. | AI Engine |
| GLS-ACR-017 | **OCR** | Optical Character Recognition | Extracts text from images or PDFs. | Data Processing |
| GLS-ACR-018 | **OKR** | Objectives and Key Results | Goal-setting framework. | Business Strategy |
| GLS-ACR-019 | **OOTB** | Out of the Box | Features available immediately without customization. | Product Configuration |
| GLS-ACR-020 | **PM** | Project Manager | Oversees project execution and delivery. | Project Team |
| GLS-ACR-021 | **PO** | Product Owner | Represents the business in Agile development. | Agile Team |
| GLS-ACR-022 | **QA** | Quality Assurance | Process ensuring software quality. | Testing |
| GLS-ACR-023 | **RAG** | Retrieval-Augmented Generation | Grounds AI in specific data bases. | AI Engine |
| GLS-ACR-024 | **RBAC** | Role-Based Access Control | Restricts access based on user role. | Security |
| GLS-ACR-025 | **REST** | Representational State Transfer | Architectural style for web services. | API Design |
| GLS-ACR-026 | **SAML** | Security Assertion Markup Language | Standard for exchanging authentication data. | SSO Integration |
| GLS-ACR-027 | **SDK** | Software Development Kit | Tools for building applications. | Integration |
| GLS-ACR-028 | **SLA** | Service Level Agreement | Commitment regarding service quality/uptime. | Business |
| GLS-ACR-029 | **SRS** | Software Requirements Specification | Details technical software behavior. | Engineering Phase |
| GLS-ACR-030 | **SSO** | Single Sign-On | One login for multiple systems. | Access Control |
| GLS-ACR-031 | **STT** | Speech-to-Text | Converts spoken audio into written text. | Interview Audio |
| GLS-ACR-032 | **TTS** | Text-to-Speech | Synthesizes voice from text. | AI Avatar Voice |
| GLS-ACR-033 | **UAT** | User Acceptance Testing | Final business review before release. | Release Management |
| GLS-ACR-034 | **UI** | User Interface | The visual elements of the application. | Design |
| GLS-ACR-035 | **UX** | User Experience | The overall experience of a user using the product. | Design |



## 13. Naming Conventions

This section defines the mandatory naming conventions for all technical and business assets within the ISAS ecosystem.

| Asset Type | Convention / Standard | Example |
|---|---|---|
| **Business Objects** | PascalCase, Singular noun | `CandidateProfile`, `InterviewSession` |
| **Modules** | Title Case, Noun | `Campaign Management`, `AI Coach` |
| **Screens / Pages** | Title Case + 'Dashboard' / 'View' | `Recruiter Dashboard`, `Assessment View` |
| **User Roles** | Title Case, Job Title format | `System Admin`, `Hiring Manager` |
| **Reports** | Descriptive Title + Frequency | `Monthly Candidate Pipeline`, `Weekly AI Token Usage` |
| **Files (Generated)** | Date(YYYYMMDD)_Topic_Version | `20260709_SLA_Report_v1.2.pdf` |
| **Database Tables** | snake_case, Plural noun | `candidate_profiles`, `interview_sessions` |
| **API Endpoints** | lowercase, kebab-case, plural resource | `GET /api/v1/interview-sessions` |
| **Version Numbers** | Semantic Versioning (Major.Minor.Patch) | `v2.1.4` |
| **Requirement IDs** | REQ-[Module]-[000] | `REQ-INT-001`, `REQ-AI-045` |
| **Glossary IDs** | GLS-[Category]-[000] | `GLS-BUS-001`, `GLS-TECH-012` |


## 14. Cross Reference Matrix

This matrix illustrates how business terminology maps directly to technical and architectural implementations.

| Business Term | Functional Requirement | Business Rule | Data Object | User Flow | Screen / UI | Report |
|---|---|---|---|---|---|---|
| **Candidate** | REQ-USR-01: Registration | BR-01: Unique Email | `candidate_profiles` | Onboarding Flow | Candidate Dashboard | Demographics Report |
| **Interview** | REQ-INT-05: AI Evaluation | BR-12: Time Limit | `interview_sessions` | Assessment Flow | Live Interview Room | Session Scorecard |
| **Campaign** | REQ-CMP-02: Publishing | BR-08: Active Limits | `recruitment_campaigns` | Creation Wizard | Campaign Manager | Funnel Analytics |
| **Assessment**| REQ-AST-01: Auto-Score | BR-15: Minimum Pass | `assessments` | Testing Flow | Quiz Interface | Skill Gap Analysis |
| **Subscription**| REQ-BIL-01: Tier Limits | BR-40: Token Caps | `subscriptions` | Checkout Flow | Billing Portal | Revenue Forecast |


## 15. Governance

Maintaining the integrity of the Business & Technical Glossary requires strict enterprise governance.

### Ownership
* **Primary Owner:** Lead Enterprise Information Architect.
* **Co-Owners:** Lead Business Analyst (Business Terms), Principal Architect (Technical Terms), Head of AI (AI Terms).

### Review Frequency
* **Major Review:** Bi-annually (Every 6 months) aligning with major Release Epics.
* **Minor Review:** Per Sprint during Sprint Planning and Refinement.

### Approval Process
1. **Proposal:** Any team member can propose a new term or revision via a Jira Change Request (CR).
2. **Review:** The designated Co-Owner reviews the technical/business accuracy.
3. **Approval:** The Primary Owner approves the merge into the Single Source of Truth (this document).
4. **Publishing:** Automated CI/CD pipeline generates the updated documentation site.

### Version Control & Change Management
* This document is maintained in the enterprise Git repository.
* All changes must go through standard Pull Request (PR) reviews.
* Semantic versioning applies to document updates.

### Glossary Maintenance
* Deprecated terms must not be deleted immediately; they must be marked with `[DEPRECATED]` and a pointer to the new term to maintain historical context.


## 16. Future Terminology

As the ISAS platform evolves, the following emerging concepts are tracked for future integration into the core platform vocabulary.

| Glossary ID | Term | Definition | Business Context |
|---|---|---|---|
| GLS-FUT-001 | **Agentic AI** | AI systems capable of pursuing complex goals with limited supervision. | End-to-end automated recruiter agents. |
| GLS-FUT-002 | **AI Governance** | Frameworks ensuring AI technologies are developed and used ethically. | Compliance, Risk Management. |
| GLS-FUT-003 | **AI Safety** | The field focused on ensuring AI systems do not cause harm. | Bias prevention, hallucination control. |
| GLS-FUT-004 | **AI Copilot** | An AI that works alongside a human user to enhance productivity. | Live recruiter assistance during interviews. |
| GLS-FUT-005 | **Digital Credential** | Cryptographically verifiable records of a user's skills. | Blockchain-backed assessment certificates. |
| GLS-FUT-006 | **Explainable AI (XAI)** | Methods enabling human users to comprehend AI decisions. | Regulatory compliance for hiring algorithms. |
| GLS-FUT-007 | **Multi-Agent Systems** | Multiple interacting intelligent agents solving problems together. | Complex simulation assessments. |
| GLS-FUT-008 | **Skills Graph** | A networked data structure mapping relationships between different skills. | Advanced dynamic learning roadmaps. |
| GLS-FUT-009 | **Talent Intelligence** | Data-driven insights combining internal HR data with external market trends. | Predictive workforce planning. |
| GLS-FUT-010 | **Responsible AI** | Designing AI that is transparent, fair, and accountable. | Enterprise brand protection and ethics. |


## 17. Summary

This **Business & Technical Glossary** serves as the definitive Single Source of Truth for the ISAS project. By establishing a unified vocabulary across business and engineering domains, the organization guarantees:

1. **Business Language Strategy:** Clear, unambiguous communication between stakeholders, reducing costly misunderstandings.
2. **Terminology Governance:** A structured, auditable process for managing enterprise knowledge.
3. **Cross-Team Consistency:** Developers, Data Scientists, HR Specialists, and Product Owners share a common mental model of the product.
4. **Knowledge Management:** Accelerated onboarding for new team members and external consultants.
5. **Future Evolution:** A scalable framework that easily integrates emerging AI capabilities and shifting market paradigms.

Strict adherence to these definitions across all requirements (BRD, SRS), architectural diagrams, user interfaces, and source code is mandatory for the successful delivery of the ISAS platform.
