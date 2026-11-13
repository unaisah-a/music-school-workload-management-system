# Milestone 2 Prototype Audit and Coverage

Audit date: 13 November 2026. Baseline: Milestone 1 FR01-FR27, NFR01-NFR12, UC-01-UC-15 and AUC-01-AUC-07; Milestone 2 rubric/template; final class-diagram change list; supplied component diagram.

Status meanings:

- **Full (prototype):** the complete wireframe flow is present and was inspected or exercised, with browser-local state where persistence is needed.
- **Simulated:** the demonstration is explicit, but no production service, scheduler or external integration exists.
- **Partial:** some required behaviour is absent, simplified or not fully verified.
- **Missing:** no meaningful implementation is present.

## Prioritised issues

| Priority | Finding | Resolution / remaining action |
| --- | --- | --- |
| Critical | Allocation allowed teachers who had not submitted accepted availability. | Fixed: validation and recommendations now block missing submissions. |
| Critical | Continuous-teaching validation treated any gap as a break instead of requiring at least one hour. | Fixed and regression-tested for a sub-one-hour gap. |
| Critical | Locked or inactive users could still sign in; deactivating a teacher left assigned lessons untouched. | Fixed: sign-in is denied and future lessons are flagged for reassignment with workload, notification and audit updates. |
| High | Editing/reassigning an allocated lesson bypassed hard constraints and did not consistently recalculate or notify. | Fixed: edits revalidate teacher/studio/time, require warning acknowledgement, recalculate weekly/monthly hours, notify and audit. |
| High | UC-07 exposed only five dates, not every date of the next calendar month. | Fixed: all 31 December dates are available in a scrollable editor with copy-week support. |
| High | Student matching displayed a name but could not approve/link the recommendation and did not fully validate the slot. | Fixed: recommendations use full allocation validation and can be approved to link the teacher. |
| High | Recurring lessons, missed-submission handling and unavailable-change clashes were incomplete. | Fixed: weekly x4 creation, manager late-slot/unavailable decisions, affected-lesson reassignment, notifications and audit. |
| High | Holiday corrections did not surface conflicts with existing lessons. | Fixed: affected users receive conflict notifications. |
| High | Normal rejection had no 12-hour escalation demonstration and the three-in-30-days rule was absent. | Fixed: deadline, simulated expiry/escalation, history and manager-review flag added. |
| High | Week/month controls, cancellation confirmation, date audit filtering and several scenario controls were inert or incomplete. | Fixed and wired to observable behaviour. |
| High | Seed data contained four studios although the project brief specifies five. | Fixed and tested. |
| High, report artifact | The supplied class diagram image still shows obsolete `IAccountService`, `IAvailabilityService`, `ISchedulingService` and `IAdministrationService`, contrary to the final change list. | Not a code defect. Update the report diagram to `IAccount`, `IAvailability`, `ISchedule`, `IAudit`, `IHolidayCalendar` and `INotificationService` before submission. |
| Medium | FR20 same-studio preference is not used as a ranking tie-break. | Remains missing because it is a Could-have requirement. |
| Medium | Deadline, automatic unlock, reset expiry, reminders and rejection expiry do not advance from a real background clock. | Clearly labelled simulation controls; production scheduler remains out of scope. |
| Medium | Architecture is a monolithic browser prototype, not separately deployed components implementing the final interfaces. | Documentation corrected; component/class alignment is conceptual only. |
| Medium | Chrome and Safari, concurrent load, backup/recovery, availability and long-term retention are not verified. | Requires deployment/acceptance infrastructure beyond this wireframe. |

## Functional requirement coverage

| ID | Status | Evidence / gap |
| --- | --- | --- |
| FR01 | Simulated | Role accounts route correctly, but email/password verification is intentionally absent. |
| FR02 | Simulated | Reset, lock, automatic-unlock state and IT early unlock are demonstrated; no email token or real-time scheduler. |
| FR03 | Full (prototype) | IT-only account creation, role changes, details and initial-login notification. |
| FR04 | Full (prototype) | Deactivation retains the account, prevents sign-in and flags affected lessons. |
| FR05 | Full (prototype) | Manager can create, update, deactivate and assign student records with all specified fields. |
| FR06 | Full (prototype) | Create/update/cancel; 30-minute records; one or weekly x4 occurrences stored separately. |
| FR07 | Full (prototype) | Every target-month date, review and week-copy are available. |
| FR08 | Partial | Direct/post-deadline paths, manager decisions and missed-submission blocking exist; deadline/reminders are scenario-driven, not clock-driven. |
| FR09 | Full (prototype) | Preferences are stored separately and only influence ranking. |
| FR10 | Full (prototype) | Teacher timetable, lesson details, selected-week/month hours and comparison chart. |
| FR11 | Full (prototype) | Week/month workload view, filters, immediate local refresh and >40-hour highlight. |
| FR12 | Full (prototype) | Availability, workload, preferences, studios and up-to-three suggestions are visible. |
| FR13 | Full (prototype) | Lesson-specific shortlist excludes ineligible, inactive, unsubmitted and >40-hour teachers. |
| FR14 | Full (prototype) | Student preferred time is stored and editable. |
| FR15 | Full (prototype) | Exactly one teacher instrument and qualification enforcement. |
| FR16 | Partial | Independent dated occurrences and several upcoming weeks are supported; there is no dedicated weekly-block planning workspace. |
| FR17 | Full (prototype) | Hard exclusions, preference/workload ranking, search/replace and manager confirmation. |
| FR18 | Full (prototype) | Manager receives a fully validated teacher/time recommendation and can approve it. |
| FR19 | Full (prototype) | Teacher/student/studio conflicts, drum-kit rule and alternative guidance. |
| FR20 | Missing | Same-studio preference is not a tie-break. |
| FR21 | Full (prototype) | Operating hours/holiday blocks plus IT holiday maintenance and audit. |
| FR22 | Full (prototype) | >40 warning/acknowledgement and non-overridable four-hours-with-one-hour-break rule. |
| FR23 | Full (prototype) | Reassign/time/studio edits revalidate, recalculate, notify and audit. |
| FR24 | Simulated | Normal/urgent branches, eligible open jobs and escalation exist; 12-hour passage is manually simulated. |
| FR25 | Full (prototype) | Three rejections in rolling 30 days are flagged with history and no automatic penalty. |
| FR26 | Partial | Required in-app events are modelled and email is labelled simulated; timed reminders and real delivery are absent. |
| FR27 | Full (prototype) | Required event categories and fields, role-restricted views, actor/action/date filters; immutability is simulated. |

## Non-functional requirement coverage

| ID | Status | Evidence / gap |
| --- | --- | --- |
| NFR01 | Partial | Responsive web app and role portals work locally; remote authorisation/deployment is not verified. |
| NFR02 | Missing | Cloud publication is not currently verified. |
| NFR03 | Partial | Google Chrome tested; current Microsoft Edge and Apple Safari not verified. |
| NFR04 | Partial | Desktop and a narrow ~500px Chrome window were inspected successfully; exact 360px plus broader device acceptance testing is still needed. |
| NFR05 | Partial | README and guided demo exist; four-of-five first-time-user test has not been run. |
| NFR06 | Missing | No eleven-session concurrency/load test or measured three-second acceptance result. |
| NFR07 | Simulated | System-status value is illustrative, not monitored monthly uptime. |
| NFR08 | Simulated | Maintenance policy appears in the prototype only. |
| NFR09 | Simulated | Backup status is illustrative; no automatic backup/30-copy retention job. |
| NFR10 | Missing | Recovery targets have not been exercised. |
| NFR11 | Partial | Role navigation, lock and inactive states exist; local HTTP, no password hashing/server enforcement and no inactivity logout. |
| NFR12 | Missing | `localStorage` has no 24-month retention/anonymisation process. |

## Use-case coverage

| Use case | Status | Verification summary |
| --- | --- | --- |
| UC-01 Authenticate User | Simulated | Role routing and blocked account states; credentials are simulated. |
| UC-02 Manage User Accounts | Full (prototype) | Create/edit/deactivate/unlock/change role and instrument. |
| UC-03 View Role-Specific Dashboard | Full (prototype) | Teacher and manager dashboards expose role-specific data and controls. |
| UC-04 Maintain Holiday Calendar | Full (prototype) | Add/correct, block scheduling, audit and flag affected lessons. |
| UC-05 Manage Student Records | Full (prototype) | CRUD-like flow, deactivate and approve recommendation. |
| UC-06 Manage Lesson Records | Full (prototype) | Create, recurring occurrences, edit, cancel with confirmation. |
| UC-07 Submit and Edit Availability | Partial | Full-month edit/copy/submit; calendar deadline is scenario-driven. |
| UC-08 Submit Availability Change Request | Full (prototype) | Mandatory reason, add/remove availability, persisted manager decision. |
| UC-09 Submit Weekly Job Preferences | Full (prototype) | Days, bands, desired hours and remark. |
| UC-10 Manage Availability Exceptions | Full (prototype) | Approve/reject, late slot/unavailable choice, clash handling, notify/audit. |
| UC-11 Allocate Lesson | Full (prototype) | Shortlist, manual selection, hard validation, warning acknowledgement and confirmation. |
| UC-12 Reassign or Modify Allocated Lesson | Full (prototype) | Revalidation, workload, roster, notification and audit updates. |
| UC-13 Reject Assigned Lesson | Simulated | Reason, warning, normal/urgent route and review count; elapsed time simulated. |
| UC-14 Accept Open Lesson | Full (prototype) | Same-instrument eligibility, validation, accept and shared-state updates. |
| UC-15 View Audit History | Full (prototype) | Manager/IT only, read-only history and actor/action/date filtering. |
| AUC-01 Reset Password | Simulated | 30-minute reset-link state and simulated email. |
| AUC-02 Lock Account | Simulated | Five-attempt lock state, early IT unlock; time-based unlock is simulated. |
| AUC-03 Warn Over 40 Hours | Full (prototype) | Warning remains allocatable only after acknowledgement. |
| AUC-04 Send Notification | Simulated | In-app record plus clearly labelled email simulation. |
| AUC-05 Validate Scheduling Constraints | Full (prototype) | Blocking/warning results, explanations and alternatives. |
| AUC-06 Log Audit Record | Full (prototype) | Required state changes add browser-local read-only entries. |
| AUC-07 Flag Excessive Rejections | Full (prototype) | Rolling-history flag and manager notification. |

## Design alignment

| Design artifact | Status | Assessment |
| --- | --- | --- |
| Component diagram | Partial | All five domains are represented by workflows, but the prototype is not packaged as five runtime components. The external email service is explicitly simulated. |
| Final class modifications | Partial | UI/controller responsibilities follow the renamed interfaces conceptually. No actual interface classes exist, and the supplied diagram image still needs its obsolete labels replaced. |
| Milestone 2 rubric | Partial-to-strong prototype alignment | Broad screen/use-case coverage, connected cross-role state, responsive design and screenshot-ready scenarios are present. Production NFRs and formal user acceptance remain unverified. |

## Verification performed

- `npm run check`: JavaScript syntax plus eleven passing rule/data tests.
- Manual code audit of every screen renderer, form handler and delegated button action.
- Google Chrome browser walkthrough: full-month availability editor rendered with a 31-date counter; hard conflict blocked with qualification/drum-studio reasons and an alternative; the 40-hour warning required acknowledgement and confirmation updated Ethan Koh from 39.75h to 40.25h; narrow-window navigation and forms remained accessible.
- Remaining flows were inspected through handler/state traces and are documented as prototype coverage, not formal browser acceptance results.

This audit deliberately does not claim 100% coverage. FR20, several production NFRs and real service integrations remain missing, simulated or only partially verified.
