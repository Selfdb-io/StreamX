---
name: parse-prd
description: Convert a rough product idea or feature prompt into a complete Product Requirements Document (PRD) with a customer journey, personas, user stories, and clear functional/non-functional requirements. Use when a user says “write a PRD”, “requirements doc”, “spec”, “customer journey”, or provides an app/product idea and wants a full set of requirements. Keep outputs implementation-agnostic: DO NOT recommend or choose a tech stack, frameworks, languages, cloud providers, databases, or libraries.
---

# Parse PRD

Turn a vague prompt into a **full PRD** that a product + design + engineering team can execute *without* prescribing implementation.

**Hard rule:** Do not include tech stack decisions in the PRD. If the user asks for tech stack, offer it as a separate follow-up after the PRD.

## Workflow

### 1) Restate the brief (tight, concrete)
- Summarize the product in 3–6 bullets.
- Identify the **primary user** and the **primary value**.
- Extract explicit constraints from the prompt (platform, size, “must have”, “must not”).

### 2) Ask only the missing questions (5–10)
Ask the smallest set of questions needed to remove ambiguity. Prefer multiple-choice when possible.

Use the question bank in [references/question-bank.md](references/question-bank.md).

If the user says “make assumptions”, proceed and clearly mark:
- **Assumptions** (what you guessed)
- **Open Questions** (what needs confirmation)

### 3) Define product shape
Produce crisp decisions, not “maybe”:
- Personas / user segments
- JTBD (job-to-be-done) + pain points
- Out of scope / non-goals
- Success metrics

### 4) Map the customer journey
Create an end-to-end journey for the primary persona:
- Stages: Discover → Onboard → Core use → Ongoing → Support/Recovery
- User goals, actions, system responses, and failure states per stage

Use [references/journey-template.md](references/journey-template.md).

### 5) Write requirements (with acceptance criteria)
Use a layered structure:
- **Epics** → **User stories** → **Functional requirements**
- **Acceptance criteria** in plain language (Given/When/Then optional)

Also include:
- Non-functional requirements (performance, security, privacy, accessibility, reliability)
- Data/records the product must manage (entities + key fields), without choosing storage
- Edge cases and error handling
- Roles & permissions

### 6) Deliver PRD in a standard template
Use the template in [references/prd-template.md](references/prd-template.md). Keep it skimmable.

## Output requirements

- Default output: one Markdown PRD.
- No tech stack.
- Prefer numbered sections and bullet lists.
- Include: customer journey + requirements + acceptance criteria.

## Quality checklist (run before finalizing)
- Every “must” requirement is testable.
- Requirements match the customer journey steps.
- Errors and edge cases are explicit.
- Non-goals prevent scope creep.
- Metrics are measurable.

## If the user provides only an idea (examples)
When the user prompt is like:
- “Build a snake game with special controls”
- “Build a financial tracking app with charts”
- “Build a docker container monitor”
- “Build a unified social notifications dashboard”

Do NOT jump to implementation. Convert it into:
- target users + scenarios
- journey map
- functional requirements by epic
- acceptance criteria + edge cases
- measurable success metrics
