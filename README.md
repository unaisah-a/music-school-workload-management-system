# Cadence Music School Management Prototype

Cadence is a responsive, interactive INF2001 Milestone 2 wireframe for the Music School Workload Management System. It covers the Teacher, Manager, and IT Administrator portals with shared deterministic browser state.

## Start locally

Requirements: Node.js 18 or newer. No dependency installation is required.

```powershell
cd "music-school-wireframe"
npm start
```

Open `http://127.0.0.1:4173`.

## Demo accounts

- Amelia Tan - Teacher, Guitar. Use for availability submission, post-deadline requests, and lesson rejection.
- Daniel Wong - Teacher, Guitar. Use to accept Amelia's normal open lesson.
- Michelle Goh - Manager. Use for allocation, request decisions, reassignment, records, and audit.
- Iris Tan - IT Administrator. Use for accounts, holiday calendar, audit, and system alerts.

No password is required. Authentication and email are explicitly simulated.

## Verification

```powershell
npm run check
```

The check validates JavaScript syntax and eleven scheduling/data rules: qualification, drum studio suitability, holidays, the 40-hour warning, the four-hour break rule including short gaps, missing submissions, inactive-account blocking, safe lesson-edit workload calculation, the five-studio baseline, and recommendation eligibility.

## Reset

Choose **Reset demo data** in the sidebar. This replaces browser-local changes with the deterministic seed without changing source files.

## Architecture and traceability

- `docs/IMPLEMENTATION-PLAN.md` describes the reconciled five-component design and simulation boundary.
- `docs/TRACEABILITY.md` maps UC-01 through UC-15 and AUC-01 through AUC-07 to screens and interactions.
- `docs/PROTOTYPE-DOCUMENTATION.md` lists screens, workflows, report support, and a presentation sequence.
- `docs/AUDIT-AND-COVERAGE.md` records resolved issues, test evidence, and honest requirement/use-case coverage.
