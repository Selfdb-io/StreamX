# PRD Template (Implementation-Agnostic)

> Use this template to produce a complete PRD from a rough prompt.
> **Do not include tech stack choices** (frameworks, languages, hosting, databases, vendors).

## 1. Summary
- **Product / Feature name**:
- **One-liner**:
- **Problem statement**:
- **Target users**:
- **Primary value**:

## 2. Goals and non-goals
### Goals
- 

### Non-goals (explicitly out of scope)
- 

## 3. Background and context
- What triggered this need?
- Current workflow / alternatives
- Known constraints from the prompt (platform, limits, must-haves)

## 4. Personas and use contexts
For each persona:
- **Who**:
- **Context** (where/when they use it):
- **JTBD** (job to be done):
- **Pain points**:
- **Success looks like**:

## 5. Customer journey (end-to-end)
Create a journey for the primary persona.

Use stages:
1) Discover
2) Onboard / Setup
3) First success
4) Core loop / Repeat use
5) Recovery & support

For each stage include:
- **User goal**
- **User actions**
- **System behavior**
- **Key screens / surfaces** (describe, don’t implement)
- **Failure states + recovery**

## 6. User stories
Group into epics.

### Epic A: {name}
- Story A1: As a {persona}, I want {capability}, so that {outcome}.
- Story A2: …

## 7. Functional requirements
Write as “The system must …” statements. Each requirement should be testable.

For each requirement include:
- **ID**: FR-001
- **Requirement**:
- **Priority**: P0 / P1 / P2
- **Rationale**:
- **Acceptance criteria**:

## 8. Data and domain model (no storage decisions)
List entities/records the product must manage.

For each entity:
- **Entity name**:
- **Key fields**:
- **Relationships**:
- **Lifecycle** (create/update/archive/delete):

## 9. Permissions and roles
- Roles (e.g., Admin, Member, Viewer)
- What each role can see/do
- Sensitive actions requiring confirmation

## 10. Non-functional requirements
### Performance
- 

### Reliability & availability
- 

### Security & privacy
- 

### Accessibility
- 

### Observability (metrics + logs, not tools)
- 

## 11. Edge cases and error handling
- Input validation
- Network failures / offline behavior (if applicable)
- Rate limits / abuse cases (if applicable)
- Conflicts, duplicates, retries
- Data loss prevention / undo

## 12. Analytics & success metrics
### Product metrics
- Activation: 
- Engagement: 
- Retention: 

### Quality metrics
- Error rate:
- Time to complete key task:

## 13. Risks and open questions
### Risks
- 

### Open questions
- 

## 14. Milestones (optional)
Keep high-level and outcome-based.
- M1: Prototype user flow validated
- M2: MVP complete
- M3: Post-launch improvements
