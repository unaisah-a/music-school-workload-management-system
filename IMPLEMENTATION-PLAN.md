# Music School Management System Prototype Implementation Plan

## Approved requirement baseline

The prototype follows the final Milestone 1 requirements FR01-FR27 and UC-01-UC-15. The Milestone 2 template and rubric require adequate use-case coverage, concise screenshot descriptions, and explicit traceability between requirements, design, testing, and wireframes.

The latest class-change document and component diagram supersede the older class diagram naming. The wireframe therefore maps its screens and browser logic to five conceptual modules: Account, Availability, Scheduling, Administration, and Notification. The final public contracts are IAccount, IAvailability, ISchedule, IAudit, IHolidayCalendar, INotificationService, and IEmailService. They are a design traceability target: this frontend prototype does **not** implement them as deployable interface classes or separate backend components.

## Reconciled design decisions

1. Lesson reassignment belongs to Scheduling. The class-change document notes that AccountControl flags lessons through scheduling although the component diagram does not require ISchedule from Account. The prototype resolves this by letting account deactivation emit an event; Scheduling owns affected-lesson detection and reassignment.
2. The 40-hour weekly threshold is a warning. A manager may acknowledge it and continue. It excludes a teacher from the automatic lowest-workload shortlist but does not make manual allocation impossible.
3. Instrument qualification, teacher availability, student time compatibility, studio occupancy, drum-kit suitability, school operating hours, public holidays, and the four-continuous-hour break rule are blocking constraints.
4. Weekly job preferences guide ranking only. They never make an unavailable slot available and never guarantee allocation.
5. Public holidays are maintained manually by IT administrators from the official list. The prototype does not invent a Ministry of Manpower API integration.
6. Authentication, email, persistence, and audit immutability are simulated for demonstration. No genuine personal data, passwords, production database, or real email delivery is used.

## Technical architecture

- Presentation: responsive single-page HTML/CSS interface with role-specific navigation and accessible dialogs.
- Application: a single browser controller whose functions are grouped by account, availability, scheduling, administration, and notification workflows; this is conceptual component separation only.
- Data: deterministic fictional records stored in browser localStorage so all three role portals share state on the same device.
- Validation: pure scheduling rules in `dist/logic.js`, tested independently with Node.
- Hosting: buildless static site. The same `dist` directory runs locally and deploys to Sites.

## Delivery sequence

1. Build shared design system, login, shell, navigation, dialogs, notifications, and reset controls.
2. Implement Teacher portal and direct availability submission.
3. Implement Manager records, allocation, constraint validation, exception decisions, and reassignment.
4. Implement IT accounts, holiday maintenance, and audit history.
5. Connect cross-role state, notifications, and audit events for all six demonstration scenarios.
6. Test scheduling rules, navigation, state changes, and responsive layouts.
7. Capture report-ready screenshots and finish prototype documentation.

## Acceptance checks

- All significant controls have observable prototype behaviour.
- UC-01 through UC-15 are mapped to at least one screen and interaction.
- The six requested scenarios can be completed after Reset Demo.
- Hard constraints block confirmation and explain the reason.
- The 40-hour threshold requires acknowledgement rather than blocking.
- State changes propagate across role portals on the same browser.
- Core functions remain usable at 360px width and on desktop.
- Local startup uses one documented command and no dependency installation.

