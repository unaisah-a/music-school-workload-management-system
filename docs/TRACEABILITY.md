# Requirements to Wireframe Traceability Matrix

This matrix identifies where each flow is demonstrated; it is not a claim of production completeness. See `AUDIT-AND-COVERAGE.md` for Full/Simulated/Partial/Missing status and verification gaps.

| Use case | Requirement coverage | Wireframe screen | Demonstrated interaction |
| --- | --- | --- | --- |
| UC-01 Authenticate User | FR01, FR02, NFR11 | Demo login | Select a fictional account, sign in, route to its role dashboard; reset and lock states are labelled as simulated. |
| UC-02 Manage User Accounts | FR03, FR04, FR15 | IT Administration > Accounts | Create, edit, deactivate, unlock, and assign exactly one teacher instrument; write notification/audit records. |
| UC-03 View Role-Specific Dashboard | FR10-FR13 | Teacher Dashboard; Manager Dashboard | View personal timetable/workload or the school workload overview; filter and highlight teachers above 40 hours. |
| UC-04 Maintain Holiday Calendar | FR21, FR27 | IT Administration > Holidays | Add/correct a holiday and immediately make it a scheduling block with an audit entry. |
| UC-05 Manage Student Records | FR05, FR14, FR18 | Manager > Students | Create/edit/deactivate students and review a suitable teacher recommendation. |
| UC-06 Manage Lesson Records | FR06 | Manager > Lesson Roster | Create, edit, cancel, and inspect separate 30-minute lesson occurrences. |
| UC-07 Submit and Edit Availability | FR07, FR08 | Teacher > Availability | Select planning month, edit slots, copy a week, submit before the 19th, and notify the manager. |
| UC-08 Submit Availability Change Request | FR08 | Teacher > Availability > Change Request | Enter requested slots and mandatory reason after the deadline; create a pending manager request. |
| UC-09 Submit Weekly Job Preferences | FR09 | Teacher > Job Preferences | Save preferred days/time bands, desired hours, and remarks separately from availability. |
| UC-10 Manage Availability Exceptions | FR08, FR23, FR27 | Manager > Availability Requests | Approve/reject late requests, handle missed submissions, flag clashes, notify, and audit. |
| UC-11 Allocate Lesson | FR12, FR13, FR15-FR22 | Manager > Allocate Lesson | Select an unassigned lesson, compare up to three eligible teachers, validate teacher/studio, acknowledge warnings, allocate, notify, and audit. |
| UC-12 Reassign or Modify Allocated Lesson | FR23 | Manager > Lesson Roster; Rejections | Change time/studio/teacher, revalidate hard constraints, recalculate workload, notify, and audit. |
| UC-13 Reject Assigned Lesson | FR24, FR25 | Teacher > Lessons and Open Jobs | Require a reason and manager-contact warning; branch to normal or urgent handling and track rejection count. |
| UC-14 Accept Open Lesson | FR24 | Teacher > Lessons and Open Jobs | Show same-instrument open work, validate constraints, accept, update roster/workload, notify, and audit. |
| UC-15 View Audit History | FR27 | Manager > Audit; IT Administration > Audit | Read and filter actor, action, affected record, timestamp, and before/after values; teacher navigation excludes audit. |
| AUC-01 Reset Password | FR02 | Demo login > Password Reset | Create a simulated 30-minute reset-link state and notification without real email. |
| AUC-02 Lock Account | FR02 | Demo login; IT Administration > Accounts | Demonstrate five-attempt lock state, 15-minute automatic status, and early IT unlock. |
| AUC-03 Warn Over 40 Hours | FR13, FR22 | Manager > Allocate Lesson | Show a warning and require explicit acknowledgement while keeping confirmation available. |
| AUC-04 Send Notification | FR26 | Notification centre on all portals | Generate in-application records and label email delivery as simulated through IEmailService. |
| AUC-05 Validate Scheduling Constraints | FR15, FR19, FR21, FR22 | Manager > Allocate Lesson; Teacher > Open Jobs | Return pass/fail with specific blocking reasons and valid alternatives. |
| AUC-06 Log Audit Record | FR27 | Manager/IT > Audit | Add read-only event records for required state changes. |
| AUC-07 Flag Excessive Rejections | FR25 | Manager > Rejections | Flag three rejections in 30 days for review without an automatic penalty. |

## Requested end-to-end scenarios

| Scenario | Start | Completion evidence |
| --- | --- | --- |
| Teacher availability submission | Demo login as Amelia Tan > Availability | Submitted status, manager notification, and updated availability data. |
| Manager allocates a lesson | Demo login as Michelle Goh > Allocate Lesson | Assigned roster row, updated workload, teacher notification, and audit event. |
| Scheduling conflict | Allocate Lesson > Load conflict example | Blocking message, suggested correction, successful alternative; separate 40-hour acknowledgement path. |
| Lesson rejection and reassignment | Amelia rejects; Daniel accepts open lesson, or manager handles urgent rejection | Roster owner changes, workloads recalculate, notifications and audit records appear. |
| Availability change approval | Amelia submits Change Request; Michelle reviews | Approved/rejected status persists across portals with notification and audit evidence. |
| IT administration | Demo login as Iris Tan | Account/holiday change appears in audit; holiday is blocked in allocation validation. |
