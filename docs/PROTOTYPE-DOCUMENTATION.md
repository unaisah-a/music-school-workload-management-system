# Cadence Prototype Documentation

## Overview

Cadence is a buildless single-page prototype. HTML and CSS provide the presentation layer, `app.js` coordinates the five logical system components, and `logic.js` contains deterministic scheduling rules and shared mock data. Browser localStorage simulates persistence so actions completed in one portal are visible when another demo account signs in.

## Implemented screens

### Teacher portal

- Dashboard: weekly timetable, weekly/monthly hours, workload chart, availability status, and upcoming lessons.
- Availability: December planning cycle, time-slot editing, copy-week interaction, direct submission, post-deadline change requests, and request history.
- Job Preferences: working days, time bands, desired hours, and remarks, clearly separated from availability.
- Lessons and Open Jobs: lesson details, normal/urgent rejection, eligibility validation, and open-job acceptance.
- Notifications: in-application and simulated email events.

### Manager portal

- Workload Dashboard: teacher workload table, 40-hour highlighting, filters, shortlist, missing submissions, and planning metrics.
- Students: create, edit, deactivate, and recommend suitable teachers.
- Lesson Roster: create, edit, cancel, and inspect separate lesson occurrences.
- Allocate Lesson: shortlist, manual selection, studio selection, hard-rule validation, alternatives, acknowledgement warnings, roster/workload updates, notifications, and audit.
- Availability Requests: approve or reject post-deadline changes and review missed submissions.
- Rejections: review normal/urgent workflows and continue into reassignment.
- Audit History: filter read-only before/after records.

### IT Administrator portal

- Accounts: create/edit/deactivate users, change roles, assign exactly one teacher instrument, simulate lockout, and unlock.
- Holiday Calendar: add/correct manually maintained public holidays and demonstrate their scheduling effect.
- Audit History: review governance records.
- System Alerts: simulated lockout, backup, availability, and critical-event status.

## Major workflows

1. Availability submission covers every date in the target month, validates time ranges, updates the teacher record, and creates a manager notification.
2. Allocation evaluates hard constraints, creates an acknowledgeable warning above 40 hours, updates the roster/workload, and creates notification/audit evidence.
3. Rejection branches by the 48-hour threshold. A normal rejection opens for up to 12 hours; an urgent rejection immediately requires manager action.
4. Availability exceptions stay pending until a manager decision updates availability, affected lessons, notification, workload, and audit state.
5. Deactivating an account prevents sign-in and flags that teacher's future lessons for reassignment; holiday changes notify users when an existing lesson is affected.
6. A normal rejection has a simulated 12-hour acceptance window and three rejections in 30 days create a manager-review flag.

## Simulated and implemented boundaries

Implemented in browser logic: role navigation, forms, local persistence, shared state, filters, scheduling validation, workload changes, recommendations, notifications, audit events, reset, and responsive layout.

Simulated: credential verification, password reset token delivery, email dispatch, server-side access enforcement, database durability, backup execution, inactivity logout, cloud availability, and cryptographic audit immutability. The interface labels these boundaries rather than presenting them as production functions.

## Recommended presentation sequence

1. Reset demo data.
2. Enter Amelia Tan's portal and submit December availability.
3. Submit a post-deadline change request.
4. Switch to Michelle Goh; review workload filters and approve the request.
5. Open Allocate Lesson; load the conflict example, validate, and discuss the blocking messages.
6. Select the recommended drum teacher and Rhythm Studio, validate, and confirm.
7. Load the 40-hour example, validate, acknowledge the warning, and confirm.
8. Switch to Amelia; reject L-101 with a reason.
9. Switch to Daniel; accept the eligible open Guitar lesson.
10. Switch to Iris; create or modify an account, add the prefilled 18 November demo holiday, and inspect audit history.
11. Return to Manager allocation to show the holiday block.

## Report screenshot suggestions

- Login account selector: UC-01, AUC-01, and role-specific navigation.
- Teacher Dashboard: UC-03 and FR10.
- Availability regular submission and change-request tabs: UC-07 and UC-08.
- Manager Workload Dashboard: UC-03, FR11-FR13.
- Allocation with a blocking conflict: UC-11 and AUC-05.
- Allocation with the 40-hour acknowledgement: AUC-03 and FR22.
- Teacher rejection/open-job screens: UC-13 and UC-14.
- Manager Availability Requests: UC-10.
- IT Accounts and Holiday Calendar: UC-02 and UC-04.
- Audit History: UC-15 and AUC-06.

## Known limitations

- Shared state is limited to one browser profile and is not multi-user concurrent.
- Closing or clearing browser storage removes unsaved demo changes.
- The prototype does not send email, call government services, or use genuine identities.
- Deadlines, reset-link expiry, automatic unlock, lesson reminders, rejection escalation and inactivity logout use labelled demonstration controls rather than a real background scheduler.
- The five components and final interfaces are represented by traceability and workflow boundaries, not by separately deployed services or JavaScript interface classes.
- Automated tests cover core scheduling rules; full production security, load, backup, and browser-compatibility testing are outside the wireframe scope.
- See `AUDIT-AND-COVERAGE.md` for verified coverage and unresolved limitations; no claim of complete production coverage is made.
