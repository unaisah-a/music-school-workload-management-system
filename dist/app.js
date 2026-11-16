import {
  loadState, saveState, resetState, accountFor, teacherFor, studentFor, studioFor,
  validateAllocation, recommendTeachers, addAudit, addNotification, timeToMinutes
} from './logic.js';

let state = loadState();
let selectedLoginId = null;
let currentPage = null;
let availabilityMode = 'regular';
let availabilityDraft = buildAvailabilityDraft();
let allocationForm = { lessonId: 'L-104', teacherId: '', studioId: 'ST-2', date: '2026-11-18', start: '15:00' };
let allocationResult = null;
let managerFilters = { instrument: 'All', shift: 'All', availability: 'All' };
let dashboardRange = 'Week';

function buildAvailabilityDraft() {
  const seeded = {
    '2026-12-01': ['09:00', '17:00'],
    '2026-12-02': ['10:00', '18:00'],
    '2026-12-03': ['09:00', '13:00'],
    '2026-12-04': ['12:00', '20:00'],
    '2026-12-05': ['09:00', '14:00']
  };
  return Array.from({ length: 31 }, (_, index) => {
    const date = `2026-12-${String(index + 1).padStart(2, '0')}`;
    const [start = '', end = ''] = seeded[date] || [];
    return { date, start, end };
  });
}

const el = id => document.getElementById(id);
const main = el('main-content');
const safe = value => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
const initials = name => name.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase();
const formatDate = value => new Intl.DateTimeFormat('en-SG', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Singapore' }).format(new Date(`${value}T00:00:00+08:00`));
const formatDateTime = value => new Intl.DateTimeFormat('en-SG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Singapore' }).format(new Date(value));
const currentUser = () => accountFor(state, state.currentUserId);

const navByRole = {
  Teacher: [
    ['Workspace', 'Dashboard', 'dashboard', '▦'],
    ['Workspace', 'Availability', 'availability', '◫'],
    ['Workspace', 'Job Preferences', 'preferences', '◎'],
    ['Teaching', 'Lessons & Open Jobs', 'lessons', '♫'],
    ['Teaching', 'Notifications', 'notifications', '◌']
  ],
  Manager: [
    ['Workspace', 'Dashboard', 'dashboard', '▦'],
    ['Records', 'Students', 'students', '◉'],
    ['Records', 'Lesson Roster', 'roster', '▤'],
    ['Scheduling', 'Allocate Lesson', 'allocate', '◇'],
    ['Scheduling', 'Availability Requests', 'requests', '◫'],
    ['Scheduling', 'Rejections', 'rejections', '!'],
    ['Governance', 'Audit History', 'audit', '⌁']
  ],
  'IT Administrator': [
    ['Administration', 'Accounts', 'accounts', '◉'],
    ['Administration', 'Holiday Calendar', 'holidays', '◫'],
    ['Governance', 'Audit History', 'audit', '⌁'],
    ['Governance', 'System Alerts', 'alerts', '!']
  ]
};

function pageHeader(title, subtitle, actions = '') {
  return `<header class="page-header"><div><p class="eyebrow">${safe(currentUser().role)} portal</p><h1>${safe(title)}</h1><p>${safe(subtitle)}</p></div>${actions ? `<div class="page-actions">${actions}</div>` : ''}</header>`;
}

function status(value) {
  const tone = /active|assigned|approved|submitted|available|sent/i.test(value) ? 'green' : /pending|unassigned|open|warning|due/i.test(value) ? 'amber' : /inactive|cancelled|rejected|locked|critical/i.test(value) ? 'red' : 'gray';
  return `<span class="status status--${tone}">${safe(value)}</span>`;
}

function person(id, detail = '') {
  const account = accountFor(state, id);
  return account ? `<div class="person"><span class="avatar">${initials(account.name)}</span><div><strong>${safe(account.name)}</strong><small>${safe(detail || account.instrument || account.role)}</small></div></div>` : '<span class="muted">Unassigned</span>';
}

function metric(label, value, detail, icon = '•') {
  return `<article class="card metric"><div class="metric__label"><span>${safe(label)}</span><span class="metric__icon">${icon}</span></div><div class="metric__value">${safe(value)}</div><div class="metric__detail">${detail}</div></article>`;
}

function renderLogin() {
  const groups = [
    ['Teachers', ['t1', 't4']],
    ['Management', ['m1', 'a1']]
  ];
  el('demo-accounts').innerHTML = groups.map(([label, ids]) => `<section class="account-group"><h3>${label}</h3><div class="account-grid">${ids.map(id => {
    const account = accountFor(state, id);
    const locked = account.lockedUntil && new Date(account.lockedUntil) > new Date(state.demoDate);
    const access = account.status !== 'Active' ? 'Inactive' : locked ? 'Locked' : 'Ready';
    return `<button class="account-card ${selectedLoginId === id ? 'is-selected' : ''}" data-login-id="${id}"><span class="avatar">${initials(account.name)}</span><span><strong>${safe(account.name)}</strong><small>${safe(account.role)}${account.instrument ? ` · ${safe(account.instrument)}` : ''} · ${access}</small></span></button>`;
  }).join('')}</div></section>`).join('');
  el('sign-in-button').disabled = !selectedLoginId;
}

function enterApp() {
  const account = accountFor(state, selectedLoginId);
  if (!account || account.status !== 'Active') {
    toast('Access denied', 'This account is inactive and cannot sign in.');
    return;
  }
  if (account.lockedUntil && new Date(account.lockedUntil) > new Date(state.demoDate)) {
    toast('Account locked', `Try again after ${formatDateTime(account.lockedUntil)} or ask IT to unlock the account.`);
    return;
  }
  if (account.lockedUntil) {
    account.lockedUntil = null;
    account.failedLogins = 0;
  }
  state.currentUserId = selectedLoginId;
  saveState(state);
  el('login-view').hidden = true;
  el('app-view').hidden = false;
  currentPage = currentUser().role === 'IT Administrator' ? 'accounts' : 'dashboard';
  renderShell();
}

function renderShell() {
  const user = currentUser();
  if (!user) return;
  el('sidebar-role').innerHTML = `<div class="role-chip"><span class="avatar">${initials(user.name)}</span><span><strong>${safe(user.role)}</strong><small>Demo workspace</small></span></div>`;
  el('profile-avatar').textContent = initials(user.name);
  el('profile-name').textContent = user.name;
  el('profile-role').textContent = user.role;
  renderNavigation();
  renderNotifications();
  renderPage();
}

function renderNavigation() {
  const items = navByRole[currentUser().role];
  let lastSection = '';
  el('primary-nav').innerHTML = items.map(([section, label, page, icon]) => {
    const sectionMarkup = section !== lastSection ? `<div class="nav-section-label">${section}</div>` : '';
    lastSection = section;
    return `${sectionMarkup}<button class="nav-link ${currentPage === page ? 'is-active' : ''}" data-page="${page}"><span class="nav-symbol">${icon}</span><span>${label}</span></button>`;
  }).join('');
  const label = items.find(item => item[2] === currentPage)?.[1] || 'Workspace';
  el('breadcrumbs').innerHTML = `Cadence&nbsp;&nbsp;/&nbsp;&nbsp;<strong>${safe(label)}</strong>`;
}

function renderNotifications() {
  const list = state.notifications.filter(item => item.recipientId === state.currentUserId);
  el('notification-dot').hidden = !list.some(item => item.status === 'Unread');
  el('notification-list').innerHTML = list.length ? list.map(item => `<article class="notification-item ${item.status === 'Unread' ? 'is-unread' : ''}"><div class="notification-item__head"><strong>${safe(item.title)}</strong>${status(item.status)}</div><p>${safe(item.message)}</p><small>${safe(item.channel)} · ${formatDateTime(item.createdAt)}</small></article>`).join('') : `<div class="empty-state"><strong>All clear</strong>No notifications for this demo account.</div>`;
}

function renderPage() {
  renderNavigation();
  const role = currentUser().role;
  const routes = {
    Teacher: { dashboard: teacherDashboard, availability: teacherAvailability, preferences: teacherPreferences, lessons: teacherLessons, notifications: notificationsPage },
    Manager: { dashboard: managerDashboard, students: studentsPage, roster: rosterPage, allocate: allocationPage, requests: requestsPage, rejections: rejectionsPage, audit: auditPage },
    'IT Administrator': { accounts: accountsPage, holidays: holidaysPage, audit: auditPage, alerts: alertsPage }
  };
  main.innerHTML = routes[role]?.[currentPage]?.() || `<div class="empty-state"><strong>Page unavailable</strong>This screen is not part of the selected role.</div>`;
  main.focus({ preventScroll: true });
}

function teacherDashboard() {
  const teacher = teacherFor(state, state.currentUserId);
  const lessons = state.lessons.filter(lesson => lesson.teacherId === state.currentUserId && lesson.status === 'Assigned' && !lesson.internalBlock);
  const dayNames = ['Mon 16', 'Tue 17', 'Wed 18', 'Thu 19', 'Fri 20', 'Sat 21', 'Sun 22'];
  const dates = ['2026-11-16','2026-11-17','2026-11-18','2026-11-19','2026-11-20','2026-11-21','2026-11-22'];
  return `${pageHeader('Good morning, ' + currentUser().name.split(' ')[0], 'Your lessons, workload, and availability status for 16-22 November 2026.', '<button class="button button--secondary" data-page="availability">Update availability</button>')}
    <section class="grid grid--4">
      ${metric('Teaching this week', `${teacher.weekHours.toFixed(1)} h`, '<span class="metric__delta">2.5 h below desired</span>', '◷')}
      ${metric('Teaching this month', `${teacher.monthHours.toFixed(1)} h`, 'Across 4 teaching weeks', '▥')}
      ${metric('Upcoming lessons', lessons.length, 'Next: ' + (lessons[0] ? `${formatDate(lessons[0].date)} at ${lessons[0].start}` : 'None'), '♫')}
      ${metric('Availability', teacher.submitted ? 'Submitted' : 'Due 19 Nov', teacher.submitted ? 'December cycle complete' : '6 days remaining', '✓')}
    </section>
    <section class="grid grid--main" style="margin-top:18px">
      <article class="card"><div class="card__header"><div><h2>Weekly timetable</h2><p>Assigned 30-minute lessons</p></div><span class="tag">Singapore time</span></div><div class="card__body table-wrap"><div class="calendar-strip">${dates.map((date, index) => {
        const dayLessons = lessons.filter(lesson => lesson.date === date);
        return `<div class="calendar-day"><div class="calendar-day__head"><span>${dayNames[index].split(' ')[0]}</span><strong>${dayNames[index].split(' ')[1]}</strong></div>${dayLessons.map(lesson => `<div class="lesson-block"><strong>${lesson.start} · ${safe(studentFor(state, lesson.studentId)?.name)}</strong><span>${safe(lesson.instrument)} · ${safe(studioFor(state, lesson.studioId)?.name)}</span></div>`).join('') || '<small class="muted">No lessons</small>'}</div>`;
      }).join('')}</div></div></article>
      <div class="grid">
        <article class="card"><div class="card__header"><div><h3>Workload trend</h3><p>Allocated hours by week</p></div></div><div class="card__body"><div class="bar-chart">${[28,30.5,teacher.weekHours,34].map((hours,index) => `<div class="bar-group"><strong>${hours}h</strong><div class="bar ${index===2?'is-current':''}" style="height:${Math.min(100,hours/40*100)}%"></div><small>W${index+1}</small></div>`).join('')}</div></div></article>
        <article class="card"><div class="card__header"><div><h3>Next lessons</h3><p>Details at a glance</p></div></div><div class="card__body"><div class="timeline">${lessons.slice(0,3).map(lesson => `<div class="timeline-item"><div class="timeline-time">${lesson.start}</div><div class="timeline-line"></div><div class="timeline-content"><strong>${safe(studentFor(state,lesson.studentId)?.name)}</strong><span>${formatDate(lesson.date)} · ${safe(studioFor(state,lesson.studioId)?.name)}</span></div></div>`).join('') || '<p class="muted">No upcoming lessons.</p>'}</div></div></article>
      </div>
    </section>`;
}

function teacherAvailability() {
  const teacher = teacherFor(state, state.currentUserId);
  const submitted = teacher.submitted;
  const readyDates = availabilityDraft.filter(slot => slot.start && slot.end).length;
  return `${pageHeader('Availability', 'Plan every date in December 2026 or preview the post-deadline exception flow.', '<button class="button button--secondary" data-action="copy-week">Copy first week to later weeks</button>')}
    <div class="tabs" style="width:max-content;margin-bottom:18px"><button class="tab ${availabilityMode==='regular'?'is-active':''}" data-action="availability-mode" data-mode="regular">Before deadline</button><button class="tab ${availabilityMode==='change'?'is-active':''}" data-action="availability-mode" data-mode="change">After-deadline scenario</button></div>
    ${availabilityMode === 'regular' ? `<div class="grid grid--main">
      <article class="card"><div class="card__header"><div><h2>December planning cycle</h2><p>All 31 dates · deadline 23:59 on 19 November 2026</p></div>${status(submitted?'Submitted':'Due soon')}</div><div class="card__body"><div class="notice notice--info" style="margin-bottom:16px"><span>i</span><div><strong>Availability and preferences are separate.</strong>These slots define when you can be scheduled. Job preferences only guide manager recommendations.</div></div><div class="availability-grid">${availabilityDraft.map((slot,index) => `<div class="availability-row"><div class="availability-date"><strong>${formatDate(slot.date)}</strong><small>${new Intl.DateTimeFormat('en-SG',{weekday:'long',timeZone:'Asia/Singapore'}).format(new Date(slot.date+'T00:00:00+08:00'))}</small></div><input type="time" aria-label="Start time ${formatDate(slot.date)}" data-slot-index="${index}" data-slot-field="start" value="${slot.start}"><input type="time" aria-label="End time ${formatDate(slot.date)}" data-slot-index="${index}" data-slot-field="end" value="${slot.end}"><button class="button button--small button--secondary" data-action="clear-slot" data-index="${index}">Clear</button></div>`).join('')}</div></div><div class="card__header" style="border-top:1px solid var(--ink-100);border-bottom:0"><span class="muted">${submitted?'Resubmitting before the deadline replaces the monthly submission.':`${readyDates} of 31 dates ready to submit.`}</span><button class="button button--primary" data-action="submit-availability">${submitted?'Update submission':'Submit availability'}</button></div></article>
      <aside class="grid"><article class="card"><div class="card__header"><div><h3>Planning rules</h3></div></div><div class="card__body notice-list"><div class="notice notice--success"><span>✓</span><div><strong>Before deadline</strong>Edit freely and notify the manager.</div></div><div class="notice notice--warning"><span>!</span><div><strong>After deadline</strong>Direct editing closes. A reasoned change request needs manager approval.</div></div><div class="notice notice--info"><span>→</span><div><strong>Five-week horizon</strong>The monthly cycle opens every date in the target month.</div></div></div></article></aside></div>` : changeRequestMarkup()}`;
}

function changeRequestMarkup() {
  const own = state.availabilityRequests.filter(request => request.teacherId === state.currentUserId);
  return `<div class="grid grid--main"><article class="card"><div class="card__header"><div><h2>Post-deadline change request</h2><p>Scenario state after 23:59 on the 19th</p></div><span class="status status--amber">Manager approval required</span></div><div class="card__body"><form id="change-request-form" class="form-grid"><label class="field"><span>Change</span><select name="changeType"><option value="Available">Add availability</option><option value="Unavailable">Become unavailable</option></select></label><label class="field"><span>Date</span><input name="date" type="date" value="2026-12-08" min="2026-12-01" max="2026-12-31" required></label><label class="field"><span>From</span><input name="start" type="time" value="14:00" required></label><label class="field"><span>Until</span><input name="end" type="time" value="18:00" required></label><label class="field field--full"><span>Reason</span><textarea name="reason" required placeholder="Explain why this availability changed after the deadline."></textarea><small>A reason is mandatory and will be visible to the manager.</small></label><div class="field--full"><button class="button button--primary" type="submit">Submit change request</button></div></form></div></article><aside class="card"><div class="card__header"><div><h3>Request history</h3><p>Shared manager decisions</p></div></div><div class="card__body">${own.length ? own.map(request => `<div class="notification-item"><div class="notification-item__head"><strong>${safe(request.changeType || 'Available')} · ${formatDate(request.date)} · ${request.start}-${request.end}</strong>${status(request.status)}</div><p>${safe(request.reason)}</p><small>Submitted ${formatDateTime(request.submittedAt)}</small></div>`).join('') : '<div class="empty-state"><strong>No requests yet</strong>Submit the form to start Scenario 5.</div>'}</div></aside></div>`;
}

function teacherPreferences() {
  const teacher = teacherFor(state, state.currentUserId);
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const bands = ['Morning','Afternoon','Evening'];
  return `${pageHeader('Job Preferences', 'Tell managers what you prefer without changing when you are actually available.')}
    <div class="grid grid--main"><article class="card"><div class="card__header"><div><h2>Weekly preferences</h2><p>Used to rank otherwise eligible allocations</p></div><span class="tag">Guidance only</span></div><div class="card__body"><form id="preferences-form" class="form-grid"><div class="field field--full"><span>Preferred working days</span><div class="checkbox-row">${days.map(day => `<label class="check-pill"><input type="checkbox" name="days" value="${day}" ${teacher.preferredDays.includes(day)?'checked':''}><span>${day}</span></label>`).join('')}</div></div><div class="field field--full"><span>Preferred time bands</span><div class="checkbox-row">${bands.map(band => `<label class="check-pill"><input type="checkbox" name="bands" value="${band}" ${teacher.preferredBands.includes(band)?'checked':''}><span>${band}</span></label>`).join('')}</div></div><label class="field"><span>Desired teaching hours</span><input name="hours" type="number" min="0" max="60" step="0.5" value="${teacher.desiredHours}" required></label><label class="field field--full"><span>Optional remarks</span><textarea name="remarks" maxlength="240">${safe(teacher.remarks)}</textarea></label><div class="field--full"><button class="button button--primary" type="submit">Save preferences</button></div></form></div></article><aside class="card"><div class="card__header"><div><h3>How matching works</h3><p>Preference never bypasses a rule</p></div></div><div class="card__body notice-list"><div class="notice notice--success"><span>1</span><div><strong>Eligibility first</strong>Qualification, availability, studio, calendar, and break constraints must pass.</div></div><div class="notice notice--info"><span>2</span><div><strong>Preference ranking</strong>Workload, preferred days, and desired hours influence the shortlist.</div></div><div class="notice notice--warning"><span>3</span><div><strong>Manager confirms</strong>The manager may choose another eligible teacher.</div></div></div></aside></div>`;
}

function teacherLessons() {
  const account = currentUser();
  const assigned = state.lessons.filter(lesson => lesson.teacherId === account.id && lesson.status === 'Assigned' && !lesson.internalBlock);
  const open = state.lessons.filter(lesson => lesson.status === 'Open' && lesson.instrument === account.instrument);
  return `${pageHeader('Lessons & Open Jobs', 'Review assigned lessons, reject with a reason, or accept eligible open work.')}
    <div class="grid"><article class="card"><div class="card__header"><div><h2>Assigned lessons</h2><p>A rejection always alerts the manager</p></div><span class="tag">${assigned.length} assigned</span></div><div class="card__body card__body--flush table-wrap"><table><thead><tr><th>Lesson</th><th>Student</th><th>Date and time</th><th>Studio</th><th>Status</th><th></th></tr></thead><tbody>${assigned.map(lesson => `<tr><td class="table-primary">${lesson.id}<div class="table-secondary">${lesson.instrument}</div></td><td>${safe(studentFor(state,lesson.studentId)?.name)}</td><td>${formatDate(lesson.date)}<div class="table-secondary">${lesson.start} · ${lesson.duration} min</div></td><td>${safe(studioFor(state,lesson.studioId)?.name)}</td><td>${status(lesson.status)}</td><td><div class="row-actions"><button class="button button--small button--secondary" data-action="lesson-details" data-id="${lesson.id}">Details</button><button class="button button--small button--danger" data-action="reject-lesson" data-id="${lesson.id}">Reject</button></div></td></tr>`).join('') || '<tr><td colspan="6"><div class="empty-state">No assigned lessons.</div></td></tr>'}</tbody></table></div></article>
    <article class="card"><div class="card__header"><div><h2>Eligible open lessons</h2><p>Same-instrument jobs that still pass your constraints</p></div>${status(open.length?'Open':'None')}</div><div class="card__body card__body--flush table-wrap">${open.length ? `<table><thead><tr><th>Lesson</th><th>Student</th><th>Date and time</th><th>Response window</th><th></th></tr></thead><tbody>${open.map(lesson => `<tr><td class="table-primary">${lesson.id}<div class="table-secondary">${lesson.instrument}</div></td><td>${safe(studentFor(state,lesson.studentId)?.name)}</td><td>${formatDate(lesson.date)} · ${lesson.start}</td><td>${lesson.urgent?status('Urgent'):status('12 hours')}</td><td><button class="button button--small button--primary" data-action="accept-open" data-id="${lesson.id}">Validate & accept</button></td></tr>`).join('')}</tbody></table>` : '<div class="empty-state"><strong>No eligible open work</strong>Rejected lessons for your instrument will appear here.</div>'}</div></article></div>`;
}

function notificationsPage() {
  const list = state.notifications.filter(item => item.recipientId === state.currentUserId);
  return `${pageHeader('Notifications', 'In-application activity and simulated email delivery records.', '<button class="button button--secondary" data-action="mark-all-read">Mark all read</button>')}<article class="card"><div class="card__body">${list.map(item => `<article class="notification-item ${item.status==='Unread'?'is-unread':''}"><div class="notification-item__head"><strong>${safe(item.title)}</strong>${status(item.status)}</div><p>${safe(item.message)}</p><small>${safe(item.channel)} · ${formatDateTime(item.createdAt)}</small></article>`).join('') || '<div class="empty-state">No notifications.</div>'}</div></article>`;
}

function filteredTeachers() {
  return state.teachers.filter(teacher => {
    const account = accountFor(state, teacher.id);
    return account?.role === 'Teacher'
      && (managerFilters.instrument === 'All' || account.instrument === managerFilters.instrument)
      && (managerFilters.shift === 'All' || teacher.shift === managerFilters.shift)
      && (managerFilters.availability === 'All' || (managerFilters.availability === 'Available' ? teacher.availability.some(slot => slot.date === '2026-11-18') : !teacher.availability.some(slot => slot.date === '2026-11-18')));
  });
}

function managerDashboard() {
  const rows = filteredTeachers().sort((a, b) => (dashboardRange === 'Week' ? a.weekHours - b.weekHours : a.monthHours - b.monthHours));
  const shortlistLesson = state.lessons.find(lesson => lesson.id === 'L-104');
  const eligible = recommendTeachers(state, { ...shortlistLesson, studioId: 'ST-2' });
  const missing = state.teachers.filter(teacher => accountFor(state,teacher.id)?.role==='Teacher' && !teacher.submitted);
  const unassigned = state.lessons.filter(lesson => ['Unassigned','Open','Needs reassignment'].includes(lesson.status)).length;
  return `${pageHeader('Workload overview', 'Monitor teacher capacity and move directly into weekly allocation.', '<button class="button button--primary" data-page="allocate">Allocate a lesson</button>')}
    <section class="grid grid--4">${metric('Active teachers', state.teachers.filter(t=>{const a=accountFor(state,t.id);return a?.role==='Teacher'&&a.status==='Active'}).length, 'Across 4 instruments', '◉')}${metric('Unassigned lessons', unassigned, '<span class="metric__delta">Ready for allocation</span>', '◇')}${metric('Above 40 hours', state.teachers.filter(t=>accountFor(state,t.id)?.role==='Teacher'&&t.weekHours>40).length, 'Warning threshold', '!')}${metric('Pending requests', state.availabilityRequests.filter(r=>r.status==='Pending').length, 'Availability exceptions', '◫')}</section>
    <section class="grid grid--main" style="margin-top:18px"><article class="card"><div class="card__header"><div><h2>Teacher workload</h2><p>${dashboardRange === 'Week' ? 'Week of 16-22 November' : 'November monthly totals'} · sorted lowest first</p></div><div class="segmented"><button class="${dashboardRange==='Week'?'is-active':''}" data-action="dashboard-range" data-range="Week">Week</button><button class="${dashboardRange==='Month'?'is-active':''}" data-action="dashboard-range" data-range="Month">Month</button></div></div><div class="card__body"><div class="filter-bar"><label class="field"><span>Instrument</span><select data-filter="instrument"><option>All</option>${['Guitar','Piano','Drums','Violin'].map(v=>`<option ${managerFilters.instrument===v?'selected':''}>${v}</option>`).join('')}</select></label><label class="field"><span>Shift</span><select data-filter="shift"><option>All</option>${['Day','Evening'].map(v=>`<option ${managerFilters.shift===v?'selected':''}>${v}</option>`).join('')}</select></label><label class="field"><span>18 Nov availability</span><select data-filter="availability"><option>All</option><option ${managerFilters.availability==='Available'?'selected':''}>Available</option><option ${managerFilters.availability==='Unavailable'?'selected':''}>Unavailable</option></select></label></div><div class="table-wrap"><table><thead><tr><th>Teacher</th><th>Shift</th><th>Week</th><th>Month</th><th>Desired</th><th>Status</th></tr></thead><tbody>${rows.map(teacher=>{const account=accountFor(state,teacher.id);const pct=Math.min(100,teacher.weekHours/40*100);return `<tr><td>${person(teacher.id)}</td><td>${teacher.shift}</td><td><strong>${teacher.weekHours} h</strong><div class="progress ${teacher.weekHours>40?'is-danger':teacher.weekHours>=38?'is-warning':''}" style="margin-top:5px"><span style="width:${pct}%"></span></div></td><td><strong>${teacher.monthHours} h</strong></td><td>${teacher.desiredHours} h</td><td>${teacher.weekHours>40?status('Above 40h'):status('Within target')}</td></tr>`}).join('')}</tbody></table></div></div></article>
    <aside class="grid"><article class="card"><div class="card__header"><div><h3>L-104 eligible shortlist</h3><p>Drums · 18 Nov at 15:00 · all hard constraints applied</p></div></div><div class="card__body recommendation-list">${eligible.map((item,index)=>{const teacher=teacherFor(state,item.teacherId);const account=accountFor(state,item.teacherId);return `<div class="recommendation"><span class="avatar">${index+1}</span><div><strong>${safe(account.name)}</strong><div class="recommendation__meta">${safe(account.instrument)} · ${teacher.weekHours} h this week</div></div><span class="tag">Eligible</span></div>`}).join('') || '<div class="empty-state">No eligible teachers for L-104.</div>'}</div></article><article class="card"><div class="card__header"><div><h3>Planning status</h3><p>December cycle</p></div></div><div class="card__body notice-list"><div class="notice ${missing.length?'notice--warning':'notice--success'}"><span>${missing.length}</span><div><strong>${missing.length?'Missing submissions':'All submissions resolved'}</strong>${missing.length?missing.map(teacher=>accountFor(state,teacher.id).name).join(', '):'Every teacher has a manager-resolved cycle status.'}</div></div><button class="button button--secondary button--wide" data-page="requests">Review exceptions</button></div></article></aside></section>`;
}

function studentsPage() {
  return `${pageHeader('Students', 'Maintain enrolment records and prepare suitable teacher recommendations.', '<button class="button button--primary" data-action="student-form">Create student</button>')}<article class="card"><div class="card__header"><div><h2>Student records</h2><p>Fictional demonstration data</p></div><span class="tag">${state.students.length} records</span></div><div class="card__body card__body--flush table-wrap"><table><thead><tr><th>Student</th><th>Instrument</th><th>Level</th><th>Preferred time</th><th>Assigned teacher</th><th>Status</th><th></th></tr></thead><tbody>${state.students.map(student=>`<tr><td class="table-primary">${safe(student.name)}<div class="table-secondary">${student.id}</div></td><td>${safe(student.instrument)}</td><td>${safe(student.level)}</td><td>${student.preferredStart}-${student.preferredEnd}</td><td>${student.assignedTeacherId?safe(accountFor(state,student.assignedTeacherId)?.name):'<span class="muted">Recommendation pending</span>'}</td><td>${status(student.status)}</td><td><div class="row-actions"><button class="button button--small button--secondary" data-action="student-form" data-id="${student.id}">Edit</button><button class="button button--small button--ghost" data-action="student-recommend" data-id="${student.id}">Recommend</button></div></td></tr>`).join('')}</tbody></table></div></article>`;
}

function rosterPage() {
  const lessons = state.lessons.filter(lesson=>!lesson.internalBlock);
  return `${pageHeader('Lesson roster', 'Create, edit, cancel, and reassign individual 30-minute lesson occurrences.', '<button class="button button--secondary" data-action="lesson-form">Create lesson</button><button class="button button--primary" data-page="allocate">Open allocation</button>')}<article class="card"><div class="card__header"><div><h2>Week of 16-22 November</h2><p>Changes update workload and notifications immediately</p></div><span class="tag">${lessons.length} lessons</span></div><div class="card__body card__body--flush table-wrap"><table><thead><tr><th>Lesson</th><th>Student</th><th>When</th><th>Teacher</th><th>Studio</th><th>Status</th><th></th></tr></thead><tbody>${lessons.map(lesson=>`<tr><td class="table-primary">${lesson.id}<div class="table-secondary">${lesson.instrument}</div></td><td>${safe(studentFor(state,lesson.studentId)?.name)}</td><td>${formatDate(lesson.date)}<div class="table-secondary">${lesson.start} · ${lesson.duration} min</div></td><td>${lesson.teacherId?safe(accountFor(state,lesson.teacherId)?.name):'<span class="muted">Unassigned</span>'}</td><td>${lesson.studioId?safe(studioFor(state,lesson.studioId)?.name):'—'}</td><td>${status(lesson.status)}</td><td><div class="row-actions"><button class="button button--small button--secondary" data-action="lesson-form" data-id="${lesson.id}">Edit</button>${lesson.status!=='Cancelled'?`<button class="button button--small button--danger" data-action="cancel-lesson" data-id="${lesson.id}">Cancel</button>`:''}</div></td></tr>`).join('')}</tbody></table></div></article>`;
}

function allocationPage() {
  const lesson = state.lessons.find(item=>item.id===allocationForm.lessonId) || state.lessons.find(item=>['Unassigned','Open','Needs reassignment'].includes(item.status));
  if (lesson && allocationForm.lessonId !== lesson.id) allocationForm.lessonId = lesson.id;
  const recommendations = lesson ? recommendTeachers(state,{...lesson,date:allocationForm.date,start:allocationForm.start,studioId:allocationForm.studioId}) : [];
  const selectedTeacher = allocationForm.teacherId;
  const proposal = lesson && selectedTeacher ? { lessonId:lesson.id, studentId:lesson.studentId, teacherId:selectedTeacher, studioId:allocationForm.studioId, instrument:lesson.instrument, date:allocationForm.date, start:allocationForm.start, duration:lesson.duration } : null;
  const resultMarkup = allocationResult ? `<div class="notice-list" style="margin-top:15px">${allocationResult.blocking.map(message=>`<div class="notice notice--danger"><span>×</span><div><strong>Blocking constraint</strong>${safe(message)}</div></div>`).join('')}${allocationResult.warnings.map(message=>`<div class="notice notice--warning"><span>!</span><div><strong>Manager acknowledgement</strong>${safe(message)}</div></div>`).join('')}${allocationResult.alternatives.map(message=>`<div class="notice notice--info"><span>→</span><div><strong>Suggested alternative</strong>${safe(message)}</div></div>`).join('')}${!allocationResult.blocking.length&&!allocationResult.warnings.length?'<div class="notice notice--success"><span>✓</span><div><strong>All constraints passed</strong>This lesson can be allocated.</div></div>':''}</div>` : '';
  const canConfirm = allocationResult && allocationResult.blocking.length===0;
  return `${pageHeader('Allocate lesson', 'Compare eligible teachers, validate constraints, and confirm the weekly roster.', '<button class="button button--secondary" data-action="conflict-demo">Load conflict example</button><button class="button button--secondary" data-action="warning-demo">Load 40h warning</button>')}
    <div class="grid grid--main"><article class="card"><div class="card__header"><div><h2>Allocation workspace</h2><p>Hard constraints block; workload threshold warns</p></div><span class="status status--purple">UC-11</span></div><div class="card__body"><div class="form-grid"><label class="field field--full"><span>Unassigned, open, or released lesson</span><select id="allocation-lesson">${state.lessons.filter(item=>['Unassigned','Open','Needs reassignment'].includes(item.status)).map(item=>`<option value="${item.id}" ${allocationForm.lessonId===item.id?'selected':''}>${item.id} · ${safe(studentFor(state,item.studentId)?.name)} · ${item.instrument} · ${formatDate(item.date)} ${item.start}</option>`).join('')}</select></label><label class="field"><span>Date</span><input id="allocation-date" type="date" value="${allocationForm.date}"></label><label class="field"><span>Start time</span><input id="allocation-start" type="time" value="${allocationForm.start}"></label><label class="field"><span>Teacher</span><select id="allocation-teacher"><option value="">Select teacher</option>${state.teachers.filter(teacher=>{const account=accountFor(state,teacher.id);return account?.status==='Active'&&account.role==='Teacher'}).map(teacher=>{const account=accountFor(state,teacher.id);return `<option value="${teacher.id}" ${selectedTeacher===teacher.id?'selected':''}>${safe(account.name)} · ${safe(account.instrument)} · ${teacher.weekHours}h</option>`}).join('')}</select></label><label class="field"><span>Studio</span><select id="allocation-studio"><option value="">Select studio</option>${state.studios.map(studio=>`<option value="${studio.id}" ${allocationForm.studioId===studio.id?'selected':''}>${safe(studio.name)}${studio.hasDrumKit?' · Drum kit':''}</option>`).join('')}</select></label></div>
      <div style="display:flex;flex-wrap:wrap;gap:9px;margin-top:16px"><button class="button button--secondary" data-action="validate-allocation" ${!proposal?'disabled':''}>Validate constraints</button><button class="button button--primary" data-action="confirm-allocation" ${!canConfirm?'disabled':''}>Confirm allocation</button></div>${allocationResult?.warnings.length&&canConfirm?'<label class="field" style="margin-top:13px"><span><input id="warning-ack" type="checkbox"> I acknowledge the workload warning and want to proceed.</span></label>':''}${resultMarkup}</div></article>
      <aside class="grid"><article class="card"><div class="card__header"><div><h3>Recommended teachers</h3><p>Eligible shortlist, lowest workload first</p></div><span class="tag">Up to 3</span></div><div class="card__body recommendation-list">${recommendations.length?recommendations.map((item,index)=>{const teacher=teacherFor(state,item.teacherId);const account=accountFor(state,item.teacherId);return `<button class="recommendation ${selectedTeacher===item.teacherId?'is-selected':''}" data-action="select-recommendation" data-id="${item.teacherId}"><span class="avatar">${index+1}</span><div style="text-align:left"><strong>${safe(account.name)}</strong><div class="recommendation__meta">${teacher.weekHours}h allocated · ${item.preferenceFit?'Preference fit':'Available'}</div></div><span class="tag">${safe(account.instrument)}</span></button>`}).join(''):'<div class="empty-state"><strong>No automatic shortlist</strong>Adjust the lesson date/time or search manually.</div>'}</div></article><article class="card"><div class="card__header"><div><h3>Constraint legend</h3><p>Decision behaviour</p></div></div><div class="card__body notice-list"><div class="notice notice--danger"><span>×</span><div><strong>Blocks allocation</strong>Qualification, availability, student time, studio, hours, holiday, or break.</div></div><div class="notice notice--warning"><span>!</span><div><strong>Can acknowledge</strong>Resulting weekly workload exceeds 40 hours.</div></div></div></article></aside></div>`;
}

function requestsPage() {
  const requests = state.availabilityRequests;
  return `${pageHeader('Availability requests', 'Review post-deadline changes and resolve missed submissions.', '<button class="button button--secondary" data-action="missing-submissions">Review missed submissions</button>')}<article class="card"><div class="card__header"><div><h2>Exception queue</h2><p>Decisions update availability, flag roster clashes, notify the teacher, and create an audit record</p></div><span class="tag">${requests.filter(r=>r.status==='Pending').length} pending</span></div><div class="card__body card__body--flush table-wrap"><table><thead><tr><th>Teacher</th><th>Change</th><th>Requested slot</th><th>Reason</th><th>Submitted</th><th>Status</th><th></th></tr></thead><tbody>${requests.map(request=>`<tr><td>${person(request.teacherId)}</td><td>${status(request.changeType || 'Available')}</td><td>${formatDate(request.date)}<div class="table-secondary">${request.start}-${request.end}</div></td><td>${safe(request.reason)}</td><td>${formatDateTime(request.submittedAt)}</td><td>${status(request.status)}</td><td>${request.status==='Pending'?`<div class="row-actions"><button class="button button--small button--secondary" data-action="decide-request" data-id="${request.id}" data-decision="Rejected">Reject</button><button class="button button--small button--primary" data-action="decide-request" data-id="${request.id}" data-decision="Approved">Approve</button></div>`:'—'}</td></tr>`).join('')}</tbody></table></div></article>`;
}

function rejectionsPage() {
  const flagged=state.rejections.filter(rejection=>rejection.flagged).length;
  return `${pageHeader('Rejections & reassignment', 'Handle urgent cover, 12-hour response windows, and excessive rejection review.')}${flagged?`<div class="notice notice--warning" style="margin-bottom:18px"><span>!</span><div><strong>${flagged} rejection pattern flagged</strong>Three or more rejections in 30 days require manager review. No automatic penalty is applied.</div></div>`:''}${state.rejections.length?`<article class="card"><div class="card__body card__body--flush table-wrap"><table><thead><tr><th>Lesson</th><th>Rejecting teacher</th><th>Reason</th><th>Workflow</th><th>Response deadline</th><th>Status</th><th></th></tr></thead><tbody>${state.rejections.map(rejection=>`<tr><td>${rejection.lessonId}${rejection.flagged?'<div class="table-secondary">30-day pattern flagged</div>':''}</td><td>${person(rejection.teacherId)}</td><td>${safe(rejection.reason)}</td><td>${rejection.urgent?status('Urgent'):status('12-hour open job')}</td><td>${rejection.acceptanceDeadline?formatDateTime(rejection.acceptanceDeadline):'Immediate manager action'}</td><td>${status(rejection.status)}</td><td><div class="row-actions">${!rejection.urgent&&rejection.status==='Open to eligible teachers'?`<button class="button button--small button--secondary" data-action="escalate-rejection" data-id="${rejection.id}">Simulate 12h expiry</button>`:''}<button class="button button--small button--primary" data-action="reassign-rejection" data-id="${rejection.id}">Find replacement</button></div></td></tr>`).join('')}</tbody></table></div></article>`:'<div class="card empty-state"><strong>No active rejected lessons</strong>Sign in as Amelia Tan and reject an assigned lesson to start Scenario 4. Two prior November rejections are retained for the 30-day review demonstration.</div>'}`;
}

function auditPage() {
  return `${pageHeader('Audit history', 'Read-only records for required account, schedule, availability, rejection, and holiday changes.')}<article class="card"><div class="card__header"><div><h2>Recorded activity</h2><p>Role-appropriate access: managers and IT administrators only</p></div><span class="tag">${state.audit.length} entries</span></div><div class="card__body"><div class="filter-bar"><label class="field"><span>Date</span><input id="audit-date" type="date"></label><label class="field"><span>Actor</span><select id="audit-actor"><option value="">All actors</option>${state.accounts.map(account=>`<option value="${account.id}">${safe(account.name)}</option>`).join('')}</select></label><label class="field"><span>Action contains</span><input id="audit-action" placeholder="e.g. allocated"></label><button class="button button--secondary" data-action="filter-audit" style="align-self:end">Apply filter</button></div><div class="table-wrap"><table><thead><tr><th>Timestamp</th><th>Actor</th><th>Action</th><th>Record</th><th>Before</th><th>After</th></tr></thead><tbody id="audit-table-body">${auditRows(state.audit)}</tbody></table></div></div></article>`;
}

function auditRows(rows) { return rows.map(item=>`<tr><td>${formatDateTime(item.timestamp)}</td><td>${safe(accountFor(state,item.actorId)?.name||'System')}</td><td class="table-primary">${safe(item.action)}</td><td><span class="mono">${safe(item.record)}</span></td><td class="table-secondary">${safe(item.before)}</td><td class="table-secondary">${safe(item.after)}</td></tr>`).join('') || '<tr><td colspan="6"><div class="empty-state">No matching audit records.</div></td></tr>'; }

function accountsPage() {
  return `${pageHeader('User accounts', 'Provision role-based access, teacher qualifications, lock states, and deactivation.', '<button class="button button--primary" data-action="account-form">Create account</button>')}<section class="grid grid--4">${metric('Active accounts',state.accounts.filter(a=>a.status==='Active').length,'Teachers, managers, and IT','◉')}${metric('Teachers',state.accounts.filter(a=>a.role==='Teacher').length,'Exactly one instrument each','♫')}${metric('Locked',state.accounts.filter(a=>a.lockedUntil).length,'Available for IT unlock','!')}${metric('Inactive',state.accounts.filter(a=>a.status==='Inactive').length,'Retained, never deleted','○')}</section><article class="card" style="margin-top:18px"><div class="card__header"><div><h2>Directory</h2><p>Demo credentials are never real passwords</p></div></div><div class="card__body card__body--flush table-wrap"><table><thead><tr><th>User</th><th>Email</th><th>Role</th><th>Qualification</th><th>Access</th><th>Login state</th><th></th></tr></thead><tbody>${state.accounts.map(account=>`<tr><td>${person(account.id)}</td><td>${safe(account.email)}</td><td>${safe(account.role)}</td><td>${safe(account.instrument||'—')}</td><td>${status(account.status)}</td><td>${account.lockedUntil?status('Locked'):status('Ready')}</td><td><div class="row-actions"><button class="button button--small button--secondary" data-action="account-form" data-id="${account.id}">Edit</button>${account.lockedUntil?`<button class="button button--small button--ghost" data-action="unlock-account" data-id="${account.id}">Unlock</button>`:''}</div></td></tr>`).join('')}</tbody></table></div></article>`;
}

function holidaysPage() {
  return `${pageHeader('Holiday calendar', 'Manually maintain official public holidays and expose them to scheduling validation.', '<button class="button button--primary" data-action="holiday-form">Add holiday</button>')}<div class="grid grid--main"><article class="card"><div class="card__header"><div><h2>Recorded holidays</h2><p>Each addition or correction is audited</p></div><span class="tag">2026</span></div><div class="card__body card__body--flush table-wrap"><table><thead><tr><th>Date</th><th>Description</th><th>Maintenance source</th><th>Status</th><th></th></tr></thead><tbody>${state.holidays.map(holiday=>`<tr><td class="table-primary">${formatDate(holiday.date)}</td><td>${safe(holiday.description)}</td><td>${safe(holiday.source)}</td><td>${status('Blocks scheduling')}</td><td><button class="button button--small button--secondary" data-action="holiday-form" data-id="${holiday.id}">Correct</button></td></tr>`).join('')}</tbody></table></div></article><aside class="card"><div class="card__header"><div><h3>Scheduling effect</h3></div></div><div class="card__body notice-list"><div class="notice notice--danger"><span>×</span><div><strong>Hard constraint</strong>Every recorded holiday blocks lesson confirmation.</div></div><div class="notice notice--info"><span>i</span><div><strong>Manual maintenance</strong>IT records dates from the official Ministry of Manpower list. No automatic API is simulated.</div></div><button class="button button--secondary button--wide" data-action="holiday-effect-demo">Show allocation effect</button></div></aside></div>`;
}

function alertsPage() {
  const alerts = state.notifications.filter(item=>item.recipientId==='a1');
  return `${pageHeader('System alerts', 'Account lockouts, repeated failures, backup warnings, and critical errors are simulated here.','<button class="button button--secondary" data-action="simulate-lockout">Simulate lockout alert</button>')}<div class="grid grid--3">${metric('Availability','99.98%','Current calendar month','✓')}${metric('Last backup','6 h ago','30 daily recovery points','↺')}${metric('Critical alerts',alerts.filter(a=>/critical/i.test(a.title)).length,'No unresolved production events','!')}</div><article class="card" style="margin-top:18px"><div class="card__header"><div><h2>Administrator notifications</h2><p>Email channel is simulated</p></div></div><div class="card__body">${alerts.map(item=>`<div class="notification-item ${item.status==='Unread'?'is-unread':''}"><div class="notification-item__head"><strong>${safe(item.title)}</strong>${status(item.status)}</div><p>${safe(item.message)}</p><small>${formatDateTime(item.createdAt)} · ${safe(item.channel)}</small></div>`).join('')||'<div class="empty-state">No administrator alerts.</div>'}</div></article>`;
}

function showModal(title, body, footer = '<button class="button button--secondary" data-action="close-modal">Close</button>', eyebrow = 'Prototype action') {
  el('modal-title').textContent = title;
  el('modal-eyebrow').textContent = eyebrow;
  el('modal-body').innerHTML = body;
  el('modal-footer').innerHTML = footer;
  el('modal-backdrop').hidden = false;
  requestAnimationFrame(() => el('modal').querySelector('input,select,textarea,button')?.focus());
}

function closeModal() { el('modal-backdrop').hidden = true; }

function toast(title, message) {
  const node = document.createElement('div');
  node.className = 'toast';
  node.innerHTML = `<span>✓</span><div><strong>${safe(title)}</strong><span>${safe(message)}</span></div>`;
  el('toast-region').append(node);
  setTimeout(() => node.remove(), 4200);
}

function persist(message = '') {
  saveState(state);
  renderNotifications();
  renderPage();
  if (message) toast('Demo state updated', message);
}

function openRejectModal(lessonId) {
  const lesson = state.lessons.find(item=>item.id===lessonId);
  const hoursAway = (new Date(`${lesson.date}T${lesson.start}:00+08:00`) - new Date(state.demoDate)) / 36e5;
  const urgent = hoursAway < 48;
  showModal('Reject assigned lesson', `<div class="notice ${urgent?'notice--danger':'notice--warning'}" style="margin-bottom:16px"><span>!</span><div><strong>${urgent?'Urgent rejection':'Normal rejection'}</strong>${urgent?'Less than 48 hours remain. The manager and eligible teachers will be alerted immediately.':'The lesson will open to eligible same-instrument teachers for up to 12 hours.'}</div></div><p><strong>${lesson.id}</strong> · ${safe(studentFor(state,lesson.studentId)?.name)} · ${formatDate(lesson.date)} at ${lesson.start}</p><form id="reject-form" class="field"><span>Mandatory reason</span><textarea name="reason" required placeholder="Explain why you cannot teach this lesson."></textarea><small>You should also contact the manager directly.</small><input type="hidden" name="lessonId" value="${lesson.id}"><input type="hidden" name="urgent" value="${urgent}"></form>`, '<button class="button button--secondary" data-action="close-modal">Keep lesson</button><button class="button button--danger" data-action="submit-rejection">Reject and notify</button>', 'UC-13');
}

function openStudentForm(id) {
  const student = state.students.find(item=>item.id===id) || { id:'', name:'', instrument:'Piano', level:'Beginner', preferredStart:'15:00', preferredEnd:'18:00', status:'Active', assignedTeacherId:null };
  showModal(id?'Edit student':'Create student', `<form id="student-form" class="form-grid"><input type="hidden" name="existingId" value="${safe(id||'')}"><label class="field field--full"><span>Name</span><input name="name" value="${safe(student.name)}" required></label><label class="field"><span>Instrument</span><select name="instrument">${['Piano','Guitar','Violin','Drums'].map(v=>`<option ${student.instrument===v?'selected':''}>${v}</option>`).join('')}</select></label><label class="field"><span>Level</span><input name="level" value="${safe(student.level)}" required></label><label class="field"><span>Preferred from</span><input name="preferredStart" type="time" value="${student.preferredStart}" required></label><label class="field"><span>Preferred until</span><input name="preferredEnd" type="time" value="${student.preferredEnd}" required></label><label class="field"><span>Status</span><select name="status"><option ${student.status==='Active'?'selected':''}>Active</option><option ${student.status==='Inactive'?'selected':''}>Inactive</option></select></label></form>`, '<button class="button button--secondary" data-action="close-modal">Cancel</button><button class="button button--primary" data-action="save-student">Save student</button>', 'UC-05');
}

function openAccountForm(id) {
  const account = state.accounts.find(item=>item.id===id) || { name:'', email:'', role:'Teacher', instrument:'Piano', status:'Active' };
  showModal(id?'Edit user account':'Create user account', `<form id="account-form" class="form-grid"><input type="hidden" name="existingId" value="${safe(id||'')}"><label class="field field--full"><span>Full name</span><input name="name" value="${safe(account.name)}" required></label><label class="field field--full"><span>Demo email</span><input name="email" type="email" value="${safe(account.email)}" required></label><label class="field"><span>Role</span><select name="role" id="account-role"><option ${account.role==='Teacher'?'selected':''}>Teacher</option><option ${account.role==='Manager'?'selected':''}>Manager</option><option ${account.role==='IT Administrator'?'selected':''}>IT Administrator</option></select></label><label class="field"><span>Teacher instrument</span><select name="instrument"><option value="">Not applicable</option>${['Piano','Guitar','Violin','Drums'].map(v=>`<option ${account.instrument===v?'selected':''}>${v}</option>`).join('')}</select><small>Exactly one is required for teachers.</small></label><label class="field"><span>Access status</span><select name="status"><option ${account.status==='Active'?'selected':''}>Active</option><option ${account.status==='Inactive'?'selected':''}>Inactive</option></select></label></form>`, '<button class="button button--secondary" data-action="close-modal">Cancel</button><button class="button button--primary" data-action="save-account">Save account</button>', 'UC-02');
}

function openHolidayForm(id) {
  const holiday = state.holidays.find(item=>item.id===id) || { date:'2026-11-18', description:'Demo Public Holiday', source:'Manually recorded official public holiday' };
  showModal(id?'Correct public holiday':'Add public holiday', `<form id="holiday-form" class="form-grid"><input type="hidden" name="existingId" value="${safe(id||'')}"><label class="field"><span>Date</span><input name="date" type="date" value="${holiday.date}" required></label><label class="field field--full"><span>Description</span><input name="description" value="${safe(holiday.description)}" required></label><label class="field field--full"><span>Source note</span><input name="source" value="${safe(holiday.source)}" required></label></form>`, '<button class="button button--secondary" data-action="close-modal">Cancel</button><button class="button button--primary" data-action="save-holiday">Save holiday</button>', 'UC-04');
}

function openLessonForm(id) {
  const lesson = state.lessons.find(item=>item.id===id) || { studentId:state.students[0].id, instrument:state.students[0].instrument, date:'2026-11-19', start:'15:00', duration:30, status:'Unassigned' };
  const assignmentFields = id ? `<label class="field"><span>Teacher</span><select name="teacherId"><option value="">Unassigned</option>${state.teachers.filter(teacher=>{const account=accountFor(state,teacher.id);return account?.status==='Active'&&account.role==='Teacher'}).map(teacher=>{const account=accountFor(state,teacher.id);return `<option value="${teacher.id}" ${lesson.teacherId===teacher.id?'selected':''}>${safe(account.name)} · ${safe(account.instrument)}</option>`}).join('')}</select></label><label class="field"><span>Studio</span><select name="studioId"><option value="">Unassigned</option>${state.studios.map(studio=>`<option value="${studio.id}" ${lesson.studioId===studio.id?'selected':''}>${safe(studio.name)}</option>`).join('')}</select></label><label class="field field--full"><span><input type="checkbox" name="warningAck"> I acknowledge any resulting workload warning.</span><small>Hard constraints can never be overridden.</small></label>` : `<label class="field"><span>Occurrences</span><select name="recurrence"><option value="1">One occurrence</option><option value="4">Weekly for 4 weeks</option></select></label>`;
  showModal(id?'Edit or reassign lesson':'Create lesson record', `<form id="lesson-form" class="form-grid"><input type="hidden" name="existingId" value="${safe(id||'')}"><label class="field field--full"><span>Student</span><select name="studentId">${state.students.filter(s=>s.status==='Active').map(student=>`<option value="${student.id}" ${lesson.studentId===student.id?'selected':''}>${safe(student.name)} · ${student.instrument}</option>`).join('')}</select></label><label class="field"><span>Date</span><input name="date" type="date" value="${lesson.date}" required></label><label class="field"><span>Start</span><input name="start" type="time" value="${lesson.start}" required></label><label class="field"><span>Duration</span><select name="duration"><option value="30">30 minutes</option></select></label>${assignmentFields}</form>`, '<button class="button button--secondary" data-action="close-modal">Cancel</button><button class="button button--primary" data-action="save-lesson">Validate and save</button>', id ? 'UC-12' : 'UC-06');
}

function handleAllocationInput() {
  const lesson = state.lessons.find(item=>item.id===allocationForm.lessonId);
  if (lesson) {
    allocationForm.date = lesson.date;
    allocationForm.start = lesson.start;
    allocationForm.teacherId = '';
    allocationForm.studioId = lesson.instrument === 'Drums' ? 'ST-2' : 'ST-1';
  }
  allocationResult = null;
  renderPage();
}

function confirmAllocation() {
  const lesson = state.lessons.find(item=>item.id===allocationForm.lessonId);
  const proposal = { lessonId:lesson.id, studentId:lesson.studentId, teacherId:allocationForm.teacherId, studioId:allocationForm.studioId, instrument:lesson.instrument, date:allocationForm.date, start:allocationForm.start, duration:lesson.duration };
  const result = validateAllocation(state, proposal);
  if (result.blocking.length) { allocationResult=result; renderPage(); return; }
  if (result.warnings.length && !el('warning-ack')?.checked) { toast('Acknowledgement required','Tick the workload warning acknowledgement before confirming.'); return; }
  const before = `${lesson.status}; ${lesson.teacherId||'unassigned'}; ${lesson.studioId||'no studio'}`;
  lesson.teacherId = proposal.teacherId; lesson.studioId = proposal.studioId; lesson.date=proposal.date; lesson.start=proposal.start; lesson.status='Assigned';
  adjustTeacherHours(proposal.teacherId, lesson.duration/60);
  addAudit(state,state.currentUserId,'Lesson allocated',lesson.id,before,`${accountFor(state,proposal.teacherId).name}, ${studioFor(state,proposal.studioId).name}`);
  addNotification(state,proposal.teacherId,'New lesson assigned',`${lesson.id} is scheduled on ${formatDate(lesson.date)} at ${lesson.start} in ${studioFor(state,lesson.studioId).name}.`);
  allocationResult=null;
  persist(`${lesson.id} assigned to ${accountFor(state,proposal.teacherId).name}.`);
}

document.addEventListener('click', event => {
  const login = event.target.closest('[data-login-id]');
  if (login) { selectedLoginId=login.dataset.loginId; renderLogin(); return; }
  const pageButton = event.target.closest('[data-page]');
  if (pageButton) { currentPage=pageButton.dataset.page; el('sidebar').classList.remove('is-open'); renderPage(); return; }
  const actionButton = event.target.closest('[data-action]');
  if (!actionButton) return;
  const { action, id, mode, decision, range, teacherId } = actionButton.dataset;
  if (action==='close-modal') closeModal();
  if (action==='availability-mode') { availabilityMode=mode; renderPage(); }
  if (action==='dashboard-range') { dashboardRange=range; renderPage(); }
  if (action==='copy-week') { const firstWeek=availabilityDraft.slice(0,7); availabilityDraft=availabilityDraft.map((slot,index)=>index<7?slot:{...slot,start:firstWeek[index%7].start,end:firstWeek[index%7].end}); toast('Week copied','The first seven dates were copied by weekday across the rest of December.'); renderPage(); }
  if (action==='clear-slot') { availabilityDraft[Number(actionButton.dataset.index)].start=''; availabilityDraft[Number(actionButton.dataset.index)].end=''; renderPage(); }
  if (action==='submit-availability') {
    const invalid=availabilityDraft.filter(slot=>(slot.start&&!slot.end)||(!slot.start&&slot.end)||(slot.start&&slot.end&&timeToMinutes(slot.end)<=timeToMinutes(slot.start)));
    const ready=availabilityDraft.filter(slot=>slot.start&&slot.end);
    if(invalid.length){toast('Check availability times',`${invalid.length} date(s) have an incomplete or invalid time range.`);return;}
    if(!ready.length){toast('Availability required','Enter at least one valid date before submitting.');return;}
    const teacher=teacherFor(state,state.currentUserId); teacher.availability=teacher.availability.filter(slot=>!slot.date.startsWith('2026-12')).concat(ready); teacher.submitted=true;
    addNotification(state,'m1','Availability submitted',`${currentUser().name} submitted December availability before the deadline.`,'In-app');
    persist('December availability submitted and the manager was notified.');
  }
  if (action==='reject-lesson') openRejectModal(id);
  if (action==='lesson-details') { const lesson=state.lessons.find(l=>l.id===id); showModal(`Lesson ${id}`,`<div class="notice-list"><div class="notice notice--info"><span>♫</span><div><strong>${safe(studentFor(state,lesson.studentId)?.name)} · ${lesson.instrument}</strong>${formatDate(lesson.date)} at ${lesson.start}, ${lesson.duration} minutes</div></div><div class="notice notice--success"><span>⌂</span><div><strong>${safe(studioFor(state,lesson.studioId)?.name)}</strong>Assigned to ${safe(accountFor(state,lesson.teacherId)?.name)}</div></div></div>`); }
  if (action==='accept-open') acceptOpenLesson(id);
  if (action==='mark-all-read') { state.notifications.filter(n=>n.recipientId===state.currentUserId).forEach(n=>n.status='Read'); persist('All notifications marked as read.'); }
  if (action==='student-form') openStudentForm(id);
  if (action==='student-recommend') showStudentRecommendation(id);
  if (action==='assign-student-teacher') assignStudentTeacher(id,teacherId);
  if (action==='lesson-form') openLessonForm(id);
  if (action==='cancel-lesson') { const lesson=state.lessons.find(item=>item.id===id); showModal('Cancel lesson',`<div class="notice notice--warning"><span>!</span><div><strong>Confirm roster change</strong>${id} on ${formatDate(lesson.date)} at ${lesson.start} will be cancelled, workload recalculated, and the teacher notified.</div></div>`,'<button class="button button--secondary" data-action="close-modal">Keep lesson</button><button class="button button--danger" data-action="confirm-cancel-lesson" data-id="'+id+'">Cancel lesson</button>','UC-06'); }
  if (action==='confirm-cancel-lesson') { closeModal(); cancelLesson(id); }
  if (action==='select-recommendation') { allocationForm.teacherId=id; allocationResult=null; renderPage(); }
  if (action==='conflict-demo') { allocationForm={lessonId:'L-104',teacherId:'t2',studioId:'ST-1',date:'2026-11-18',start:'15:00'}; allocationResult=null; renderPage(); toast('Conflict loaded','Piano-qualified teacher and non-drum studio selected for a drum lesson.'); }
  if (action==='warning-demo') { allocationForm={lessonId:'L-105',teacherId:'t6',studioId:'ST-4',date:'2026-11-18',start:'17:00'}; allocationResult=null; renderPage(); toast('Warning example loaded','This valid allocation takes Ethan Koh above 40 weekly hours.'); }
  if (action==='validate-allocation') { const lesson=state.lessons.find(l=>l.id===allocationForm.lessonId); allocationResult=validateAllocation(state,{lessonId:lesson.id,studentId:lesson.studentId,teacherId:allocationForm.teacherId,studioId:allocationForm.studioId,instrument:lesson.instrument,date:allocationForm.date,start:allocationForm.start,duration:lesson.duration}); renderPage(); }
  if (action==='confirm-allocation') confirmAllocation();
  if (action==='decide-request') decideRequest(id,decision);
  if (action==='missing-submissions') showMissingSubmissions();
  if (action==='record-late-submission') resolveMissingSubmission(id,true);
  if (action==='leave-unavailable') resolveMissingSubmission(id,false);
  if (action==='escalate-rejection') escalateRejection(id);
  if (action==='reassign-rejection') { currentPage='allocate'; const rejection=state.rejections.find(r=>r.id===id); const lesson=state.lessons.find(l=>l.id===rejection.lessonId); allocationForm={lessonId:lesson.id,teacherId:'',studioId:lesson.instrument==='Drums'?'ST-2':'ST-1',date:lesson.date,start:lesson.start}; renderPage(); }
  if (action==='filter-audit') filterAudit();
  if (action==='account-form') openAccountForm(id);
  if (action==='unlock-account') { const account=accountFor(state,id); account.lockedUntil=null; account.failedLogins=0; addAudit(state,state.currentUserId,'Account unlocked',id,'Locked','Ready'); persist(`${account.name} was unlocked.`); }
  if (action==='holiday-form') openHolidayForm(id);
  if (action==='holiday-effect-demo') { showModal('Scheduling effect',`<div class="notice notice--danger"><span>×</span><div><strong>Allocation blocked</strong>25 December 2026 is recorded as Christmas Day. No lesson can be confirmed until the manager selects another date.</div></div><p class="muted" style="margin-top:14px">Add the prefilled 18 November demo holiday, then open Manager > Allocate Lesson to see the same rule act on L-104 and L-105.</p>`); }
  if (action==='simulate-lockout') simulateLockout();
  if (action==='submit-rejection') submitRejection();
  if (action==='save-student') saveStudent();
  if (action==='save-account') saveAccount();
  if (action==='save-holiday') saveHoliday();
  if (action==='save-lesson') saveLesson();
});

document.addEventListener('change', event => {
  if (event.target.matches('[data-slot-index]')) availabilityDraft[Number(event.target.dataset.slotIndex)][event.target.dataset.slotField]=event.target.value;
  if (event.target.matches('[data-filter]')) { managerFilters[event.target.dataset.filter]=event.target.value; renderPage(); }
  if (event.target.id==='allocation-lesson') { allocationForm.lessonId=event.target.value; handleAllocationInput(); }
  if (event.target.id==='allocation-teacher') { allocationForm.teacherId=event.target.value; allocationResult=null; renderPage(); }
  if (event.target.id==='allocation-studio') { allocationForm.studioId=event.target.value; allocationResult=null; renderPage(); }
  if (event.target.id==='allocation-date') { allocationForm.date=event.target.value; allocationResult=null; }
  if (event.target.id==='allocation-start') { allocationForm.start=event.target.value; allocationResult=null; }
});

document.addEventListener('submit', event => {
  event.preventDefault();
  if (event.target.id==='change-request-form') {
    const data=new FormData(event.target); if (!data.get('reason').trim()) return;
    if (timeToMinutes(data.get('end')) <= timeToMinutes(data.get('start'))) { toast('Invalid time range','The end time must be later than the start time.'); return; }
    const request={id:`AR-${Date.now()}`,teacherId:state.currentUserId,changeType:data.get('changeType'),date:data.get('date'),start:data.get('start'),end:data.get('end'),reason:data.get('reason').trim(),status:'Pending',submittedAt:new Date(state.demoDate).toISOString()};
    state.availabilityRequests.unshift(request); addNotification(state,'m1','Availability change requested',`${currentUser().name} requested ${formatDate(request.date)} ${request.start}-${request.end}.`,'In-app'); persist('Change request sent to the manager.');
  }
  if (event.target.id==='preferences-form') {
    const data=new FormData(event.target), teacher=teacherFor(state,state.currentUserId); teacher.preferredDays=data.getAll('days'); teacher.preferredBands=data.getAll('bands'); teacher.desiredHours=Number(data.get('hours')); teacher.remarks=data.get('remarks').trim(); persist('Weekly job preferences saved separately from availability.');
  }
});

function submitRejection() {
  const form=el('reject-form'); if(!form.reportValidity())return; const data=new FormData(form); const lesson=state.lessons.find(l=>l.id===data.get('lessonId')); const urgent=data.get('urgent')==='true';
  const acceptanceDeadline=urgent?null:new Date(new Date(state.demoDate).getTime()+12*36e5).toISOString();
  const rejection={id:`R-${Date.now()}`,lessonId:lesson.id,teacherId:state.currentUserId,reason:data.get('reason').trim(),urgent,acceptanceDeadline,status:urgent?'Manager action required':'Open to eligible teachers',submittedAt:new Date(state.demoDate).toISOString(),flagged:false};
  state.rejections.unshift(rejection); lesson.teacherId=null; lesson.status='Open'; lesson.urgent=urgent; adjustTeacherHours(state.currentUserId,-lesson.duration/60);
  const cutoff=new Date(new Date(state.demoDate).getTime()-30*24*36e5);
  const recentCount=[...(state.rejectionHistory||[]),...state.rejections].filter(item=>item.teacherId===state.currentUserId&&new Date(item.submittedAt)>=cutoff).length;
  rejection.flagged=recentCount>=3;
  addAudit(state,state.currentUserId,'Lesson rejected',lesson.id,`Assigned to ${currentUser().name}`,`${urgent?'Urgent':'Normal'} rejection: ${rejection.reason}`); addNotification(state,'m1',urgent?'Urgent lesson rejection':'Lesson opened for cover',`${currentUser().name} rejected ${lesson.id}: ${rejection.reason}`,'In-app + simulated email');
  if(rejection.flagged)addNotification(state,'m1','Excessive rejection pattern',`${currentUser().name} reached ${recentCount} rejections in the rolling 30-day window. Review is required; no penalty was applied.`);
  state.teachers.filter(t=>accountFor(state,t.id).instrument===lesson.instrument&&t.id!==state.currentUserId).forEach(t=>addNotification(state,t.id,urgent?'Urgent open lesson':'Open lesson available',`${lesson.id} on ${formatDate(lesson.date)} at ${lesson.start} needs cover.`)); closeModal(); persist(`${lesson.id} moved into the ${urgent?'urgent manager':'12-hour open job'} workflow.`);
}

function acceptOpenLesson(id) {
  const lesson=state.lessons.find(l=>l.id===id); if(lesson.status!=='Open'){toast('Lesson unavailable','Another teacher already accepted this lesson.');return;}
  const studioId=lesson.studioId|| (lesson.instrument==='Drums'?'ST-2':'ST-1'); const proposal={lessonId:id,studentId:lesson.studentId,teacherId:state.currentUserId,studioId,instrument:lesson.instrument,date:lesson.date,start:lesson.start,duration:lesson.duration}; const result=validateAllocation(state,proposal);
  if(result.blocking.length){showModal('Cannot accept open lesson',result.blocking.map(m=>`<div class="notice notice--danger" style="margin-bottom:8px"><span>×</span><div>${safe(m)}</div></div>`).join(''));return;}
  lesson.teacherId=state.currentUserId; lesson.studioId=studioId; lesson.status='Assigned'; adjustTeacherHours(state.currentUserId,lesson.duration/60); const rejection=state.rejections.find(r=>r.lessonId===id); if(rejection)rejection.status='Reassigned'; addAudit(state,state.currentUserId,'Open lesson accepted',id,'Open',`Assigned to ${currentUser().name}`); addNotification(state,'m1','Open lesson filled',`${currentUser().name} accepted ${id}.`,'In-app'); persist(`${id} accepted; roster and workload updated.`);
}

function escalateRejection(id) {
  const rejection=state.rejections.find(item=>item.id===id);
  if(!rejection||rejection.status!=='Open to eligible teachers')return;
  rejection.status='Manager action required';
  addAudit(state,state.currentUserId,'Open lesson escalated',rejection.lessonId,'12-hour response window','Manager action required');
  addNotification(state,'m1','Open lesson response expired',`${rejection.lessonId} was not accepted within 12 hours and now requires manual reassignment.`);
  persist(`${rejection.lessonId} escalated to the manager.`);
}

function saveStudent() {
  const form=el('student-form'); if(!form.reportValidity())return; const data=new FormData(form), existingId=data.get('existingId'); let student=state.students.find(s=>s.id===existingId); const before=student?JSON.stringify(student):'Not created';
  const previousStatus = student?.status;
  if(!student){student={id:`S-${String(201+state.students.length).padStart(3,'0')}`,assignedTeacherId:null};state.students.push(student);} Object.assign(student,{name:data.get('name').trim(),instrument:data.get('instrument'),level:data.get('level').trim(),preferredStart:data.get('preferredStart'),preferredEnd:data.get('preferredEnd'),status:data.get('status')});
  let released = 0;
  if (previousStatus === 'Active' && student.status === 'Inactive') {
    state.lessons.filter(lesson => lesson.studentId === student.id && lesson.status !== 'Cancelled' && lesson.date >= state.demoDate.slice(0,10)).forEach(lesson => {
      if (lesson.teacherId) {
        adjustTeacherHours(lesson.teacherId, -lesson.duration / 60);
        addNotification(state, lesson.teacherId, 'Lesson released', `${lesson.id} was cancelled because ${student.name} became inactive.`);
      }
      lesson.status = 'Cancelled';
      released += 1;
    });
    student.assignedTeacherId = null;
  }
  addAudit(state,state.currentUserId,existingId?'Student updated':'Student created',student.id,before,JSON.stringify(student)); closeModal(); persist(`${student.name} saved${released ? `; ${released} future lesson(s) released` : ''}.`);
}

function showStudentRecommendation(id) {
  const student=studentFor(state,id);
  const candidates=state.teachers.map(teacher=>{
    const account=accountFor(state,teacher.id);
    if(account.instrument!==student.instrument||account.status!=='Active'||teacher.weekHours>40||!teacher.submitted)return null;
    const slot=teacher.availability.find(item=>timeToMinutes(item.end)-timeToMinutes(item.start)>=30&&timeToMinutes(item.start)<timeToMinutes(student.preferredEnd)&&timeToMinutes(item.end)>timeToMinutes(student.preferredStart));
    if(!slot)return null;
    const start=timeToMinutes(slot.start)>timeToMinutes(student.preferredStart)?slot.start:student.preferredStart;
    const studioId=student.instrument==='Drums'?'ST-2':'ST-5';
    const result=validateAllocation(state,{lessonId:`MATCH-${student.id}`,studentId:student.id,teacherId:teacher.id,studioId,instrument:student.instrument,date:slot.date,start,duration:30});
    return result.blocking.length?null:{teacher,date:slot.date,start};
  }).filter(Boolean).sort((a,b)=>a.teacher.weekHours-b.teacher.weekHours).slice(0,3);
  showModal('Suitable teacher and time recommendations',`<p class="muted">Instrument, accepted availability, the ${student.preferredStart}-${student.preferredEnd} student window, conflicts, and workload are all checked. Approving links the teacher; the lesson is created separately.</p><div class="recommendation-list">${candidates.map((item,i)=>`<div class="recommendation"><span class="avatar">${i+1}</span><div><strong>${safe(accountFor(state,item.teacher.id).name)}</strong><div class="recommendation__meta">${formatDate(item.date)} at ${item.start} · ${item.teacher.weekHours}h this week</div></div><button class="button button--small button--primary" data-action="assign-student-teacher" data-id="${student.id}" data-teacher-id="${item.teacher.id}">Approve</button></div>`).join('')||'<div class="empty-state">No teacher and time combination currently passes all constraints.</div>'}</div>`,undefined,'UC-05 recommendation');
}

function assignStudentTeacher(studentId, teacherId) {
  const student = studentFor(state, studentId);
  const teacher = accountFor(state, teacherId);
  const before = student.assignedTeacherId || 'Unassigned';
  student.assignedTeacherId = teacherId;
  addAudit(state, state.currentUserId, 'Student teacher assigned', studentId, before, teacher.name);
  addNotification(state, teacherId, 'Student linked', `${student.name} was linked to you for future scheduling.`);
  closeModal();
  persist(`${teacher.name} approved for ${student.name}.`);
}

function adjustTeacherHours(teacherId, delta) {
  const teacher = teacherFor(state, teacherId);
  if (!teacher) return;
  teacher.weekHours = Math.max(0, Number((teacher.weekHours + delta).toFixed(2)));
  teacher.monthHours = Math.max(0, Number((teacher.monthHours + delta).toFixed(2)));
}

function cancelLesson(id) { const lesson=state.lessons.find(l=>l.id===id), before=lesson.status; if(lesson.teacherId)adjustTeacherHours(lesson.teacherId,-lesson.duration/60); lesson.status='Cancelled'; addAudit(state,state.currentUserId,'Lesson cancelled',id,before,'Cancelled'); if(lesson.teacherId)addNotification(state,lesson.teacherId,'Lesson cancelled',`${id} on ${formatDate(lesson.date)} was cancelled.`); persist(`${id} cancelled and workload recalculated.`); }

function addDaysISO(date, days) {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

function saveLesson() {
  const form=el('lesson-form');
  if(!form.reportValidity())return;
  const data=new FormData(form), existingId=data.get('existingId'), student=studentFor(state,data.get('studentId'));
  const date=data.get('date'), start=data.get('start'), duration=Number(data.get('duration'));
  let lesson=state.lessons.find(l=>l.id===existingId);
  if (!lesson) {
    const count = Number(data.get('recurrence') || 1);
    const created = [];
    for (let index = 0; index < count; index += 1) {
      const occurrence={id:`L-${110+state.lessons.length}`,teacherId:null,studioId:null,status:'Unassigned',studentId:student.id,instrument:student.instrument,date:addDaysISO(date,index*7),start,duration};
      state.lessons.push(occurrence);
      created.push(occurrence.id);
      addAudit(state,state.currentUserId,'Lesson created',occurrence.id,'Not created',JSON.stringify(occurrence));
    }
    closeModal();
    persist(`${created.length} separate lesson occurrence(s) created: ${created.join(', ')}.`);
    return;
  }

  const teacherId=data.get('teacherId') || null, studioId=data.get('studioId') || null;
  if ((teacherId && !studioId) || (!teacherId && studioId)) {
    toast('Incomplete assignment','Select both a teacher and studio, or leave both unassigned.');
    return;
  }
  if (teacherId && studioId) {
    const result=validateAllocation(state,{lessonId:lesson.id,studentId:student.id,teacherId,studioId,instrument:student.instrument,date,start,duration});
    if(result.blocking.length){showModal('Lesson change blocked',result.blocking.map(message=>`<div class="notice notice--danger" style="margin-bottom:8px"><span>×</span><div>${safe(message)}</div></div>`).join(''),'<button class="button button--secondary" data-action="close-modal">Close</button>','UC-12 validation');return;}
    if(result.warnings.length&&!data.get('warningAck')){toast('Acknowledgement required',result.warnings[0]);return;}
  }
  const before=JSON.stringify(lesson), oldTeacherId=lesson.teacherId, oldDuration=lesson.duration;
  if(oldTeacherId&&lesson.status==='Assigned')adjustTeacherHours(oldTeacherId,-oldDuration/60);
  Object.assign(lesson,{studentId:student.id,instrument:student.instrument,date,start,duration,teacherId,studioId,status:teacherId?'Assigned':'Unassigned'});
  if(teacherId)adjustTeacherHours(teacherId,duration/60);
  addAudit(state,state.currentUserId,'Lesson modified or reassigned',lesson.id,before,JSON.stringify(lesson));
  if(oldTeacherId&&oldTeacherId!==teacherId)addNotification(state,oldTeacherId,'Lesson reassigned',`${lesson.id} was removed from your roster.`);
  if(teacherId)addNotification(state,teacherId,'Lesson schedule updated',`${lesson.id} is now ${formatDate(date)} at ${start} in ${studioFor(state,studioId).name}.`);
  closeModal();
  persist(`${lesson.id} validated, saved, and workloads recalculated.`);
}

function rangesOverlap(startA, endA, startB, durationB) {
  return timeToMinutes(startA) < timeToMinutes(startB) + durationB && timeToMinutes(startB) < timeToMinutes(endA);
}

function decideRequest(id,decision) {
  const request=state.availabilityRequests.find(r=>r.id===id), teacher=teacherFor(state,request.teacherId), changeType=request.changeType||'Available';
  request.status=decision;
  let clashes=[];
  if(decision==='Approved'){
    if(changeType==='Unavailable'){
      teacher.availability=teacher.availability.filter(slot=>slot.date!==request.date||!rangesOverlap(request.start,request.end,slot.start,timeToMinutes(slot.end)-timeToMinutes(slot.start)));
      clashes=state.lessons.filter(lesson=>lesson.teacherId===request.teacherId&&lesson.status==='Assigned'&&lesson.date===request.date&&rangesOverlap(request.start,request.end,lesson.start,lesson.duration));
      clashes.forEach(lesson=>{lesson.status='Needs reassignment';adjustTeacherHours(request.teacherId,-lesson.duration/60);lesson.teacherId=null;});
      if(clashes.length)addNotification(state,'m1','Availability clashes need reassignment',`${clashes.map(lesson=>lesson.id).join(', ')} were released after approving ${request.id}.`);
    } else teacher.availability.push({date:request.date,start:request.start,end:request.end});
  }
  addAudit(state,state.currentUserId,`Availability request ${decision.toLowerCase()}`,request.id,'Pending',`${decision}; ${changeType}; ${clashes.length} clash(es)`);
  addNotification(state,request.teacherId,`Availability request ${decision.toLowerCase()}`,`${changeType} ${formatDate(request.date)} ${request.start}-${request.end}: ${decision}.${clashes.length?` ${clashes.length} lesson(s) require reassignment.`:''}`);
  persist(`${request.id} ${decision.toLowerCase()}; ${clashes.length} roster clash(es) flagged.`);
}

function showMissingSubmissions() { const missing=state.teachers.filter(t=>!t.submitted);showModal('Missed submissions',`<div class="notice notice--warning" style="margin-bottom:14px"><span>!</span><div><strong>${missing.length} teachers not submitted</strong>Allocation remains unavailable until a manager records late availability or leaves the teacher unavailable.</div></div><div class="recommendation-list">${missing.map(t=>`<div class="recommendation"><span class="avatar">${initials(accountFor(state,t.id).name)}</span><div><strong>${safe(accountFor(state,t.id).name)}</strong><div class="recommendation__meta">${safe(accountFor(state,t.id).instrument)} · no December submission</div></div><div class="row-actions"><button class="button button--small button--secondary" data-action="leave-unavailable" data-id="${t.id}">Leave unavailable</button><button class="button button--small button--primary" data-action="record-late-submission" data-id="${t.id}">Record late slot</button></div></div>`).join('')||'<div class="empty-state">All teachers are resolved.</div>'}</div>`,undefined); }

function resolveMissingSubmission(teacherId, recordLate) {
  const teacher=teacherFor(state,teacherId), account=accountFor(state,teacherId);
  teacher.submitted=true;
  if(recordLate)teacher.availability.push({date:'2026-12-01',start:'09:00',end:'17:00'});
  addAudit(state,state.currentUserId,recordLate?'Late availability recorded':'Teacher left unavailable',teacherId,'Missing submission',recordLate?'1 Dec 09:00-17:00':'Unavailable for cycle');
  addNotification(state,teacherId,recordLate?'Late availability recorded':'Availability marked unavailable',recordLate?'The manager recorded 1 Dec 09:00-17:00 as a late submission.':'The manager left you unavailable for the December cycle.');
  closeModal();persist(`${account.name}'s missed submission was resolved.`);
}

function filterAudit() { const date=el('audit-date').value,actor=el('audit-actor').value,term=el('audit-action').value.toLowerCase(); const rows=state.audit.filter(item=>(!date||item.timestamp.slice(0,10)===date)&&(!actor||item.actorId===actor)&&(!term||item.action.toLowerCase().includes(term)));el('audit-table-body').innerHTML=auditRows(rows); }

function saveAccount() {
  const form=el('account-form');if(!form.reportValidity())return;
  const data=new FormData(form),existingId=data.get('existingId'),role=data.get('role'),instrument=data.get('instrument'),newStatus=data.get('status');
  if(role==='Teacher'&&!instrument){toast('Instrument required','Assign exactly one teacher instrument.');return;}
  let account=state.accounts.find(a=>a.id===existingId);
  const before=account?JSON.stringify(account):'Not created', wasTeacher=account?.role==='Teacher', previousStatus=account?.status;
  if(!account){const prefix=role==='Teacher'?'t':role==='Manager'?'m':'a';account={id:`${prefix}${Date.now()}`,failedLogins:0,lockedUntil:null};state.accounts.push(account);}
  Object.assign(account,{name:data.get('name').trim(),email:data.get('email').trim(),role,instrument:role==='Teacher'?instrument:undefined,status:newStatus});
  if(role==='Teacher'&&!teacherFor(state,account.id))state.teachers.push({id:account.id,weekHours:0,monthHours:0,shift:'Day',desiredHours:20,preferredDays:[],preferredBands:[],remarks:'',submitted:false,availability:[]});
  let flagged=0;
  if(wasTeacher&&(role!=='Teacher'||(previousStatus==='Active'&&newStatus==='Inactive'))){
    state.lessons.filter(lesson=>lesson.teacherId===account.id&&lesson.status==='Assigned').forEach(lesson=>{
      adjustTeacherHours(account.id,-lesson.duration/60);
      lesson.teacherId=null;
      lesson.status='Needs reassignment';
      flagged+=1;
      addAudit(state,state.currentUserId,'Lesson flagged for reassignment',lesson.id,account.name,'Unassigned after account change');
    });
    if(flagged)addNotification(state,'m1','Lessons need reassignment',`${flagged} lesson(s) were released after ${account.name}'s account change.`);
  }
  addAudit(state,state.currentUserId,existingId?'Account updated':'Account created',account.id,before,JSON.stringify(account));
  addNotification(state,account.id,existingId?'Account updated':'Demo account created',`Your ${role} account is ${account.status.toLowerCase()}.`);
  closeModal();persist(`${account.name} account saved and audited${flagged?`; ${flagged} lesson(s) flagged`:''}.`);
}

function saveHoliday() {
  const form=el('holiday-form');if(!form.reportValidity())return;
  const data=new FormData(form),existingId=data.get('existingId');let holiday=state.holidays.find(h=>h.id===existingId);const before=holiday?`${holiday.date} ${holiday.description}`:'Not recorded';
  if(!holiday){holiday={id:`H-${Date.now()}`};state.holidays.push(holiday);}
  Object.assign(holiday,{date:data.get('date'),description:data.get('description').trim(),source:data.get('source').trim()});
  addAudit(state,state.currentUserId,existingId?'Holiday corrected':'Holiday added',holiday.id,before,`${holiday.date} ${holiday.description}`);
  const affected=state.lessons.filter(lesson=>lesson.status==='Assigned'&&lesson.date===holiday.date);
  affected.forEach(lesson=>lesson.teacherId&&addNotification(state,lesson.teacherId,'Holiday scheduling conflict',`${lesson.id} falls on ${holiday.description}; the manager must reschedule it.`));
  if(affected.length)addNotification(state,'m1','Holiday conflicts detected',`${affected.length} assigned lesson(s) fall on ${formatDate(holiday.date)} and require rescheduling.`);
  closeModal();persist(`${holiday.description} now blocks scheduling on ${formatDate(holiday.date)}${affected.length?`; ${affected.length} conflict(s) notified`:''}.`);
}

function simulateLockout() { const account=accountFor(state,'t1');account.failedLogins=5;account.lockedUntil='2026-11-13T10:15:00+08:00';addNotification(state,'a1','Account locked',`${account.name} reached five failed login attempts. Automatic unlock is scheduled after 15 minutes.`);addAudit(state,'a1','Account lockout recorded',account.id,'Ready','Locked for 15 minutes');persist(`${account.name} locked and an IT alert was generated.`); }

el('sign-in-button').addEventListener('click', enterApp);
el('forgot-password-button').addEventListener('click', () => showModal('Simulate password reset',`<form id="reset-password-form" class="field"><span>Demo email</span><input type="email" value="amelia.teacher@demo.local" required><small>A simulated link remains valid for 30 minutes. No real email is sent.</small></form>`, '<button class="button button--secondary" data-action="close-modal">Cancel</button><button class="button button--primary" id="simulate-reset">Generate reset state</button>', 'AUC-01'));
el('modal-close').addEventListener('click', closeModal);
el('modal-backdrop').addEventListener('click', event => { if(event.target===el('modal-backdrop'))closeModal(); });
el('menu-button').addEventListener('click', () => { const open=el('sidebar').classList.toggle('is-open');el('menu-button').setAttribute('aria-expanded',String(open)); });
el('notification-button').addEventListener('click', () => { el('notification-drawer').classList.add('is-open');el('notification-drawer').setAttribute('aria-hidden','false');el('drawer-scrim').hidden=false; });
el('close-notifications').addEventListener('click', closeDrawer);
el('drawer-scrim').addEventListener('click', closeDrawer);
function closeDrawer(){el('notification-drawer').classList.remove('is-open');el('notification-drawer').setAttribute('aria-hidden','true');el('drawer-scrim').hidden=true;}
el('reset-demo-button').addEventListener('click', () => showModal('Reset demonstration data','<div class="notice notice--warning"><span>!</span><div><strong>Return to the original scenario</strong>All browser-local changes made during this demonstration will be replaced with the deterministic starting data.</div></div>','<button class="button button--secondary" data-action="close-modal">Keep changes</button><button class="button button--danger" id="confirm-reset">Reset demo</button>','Demo control'));
el('sign-out-button').addEventListener('click', () => { state.currentUserId=null;saveState(state);selectedLoginId=null;el('app-view').hidden=true;el('login-view').hidden=false;renderLogin(); });
el('profile-button').addEventListener('click', () => showModal(currentUser().name,`<div class="notice notice--info"><span class="avatar">${initials(currentUser().name)}</span><div><strong>${safe(currentUser().role)}</strong>${safe(currentUser().email)}${currentUser().instrument?` · ${safe(currentUser().instrument)}`:''}</div></div><p class="muted" style="margin-top:14px">This is fictional demonstration data. Use Switch account to move between portals while preserving shared state.</p>`));
document.addEventListener('click', event => {
  if(event.target.id==='confirm-reset'){const userId=state.currentUserId;state=resetState();state.currentUserId=userId;saveState(state);closeModal();currentPage=currentUser().role==='IT Administrator'?'accounts':'dashboard';renderShell();toast('Demo reset','All scenarios returned to their original state.');}
  if(event.target.id==='simulate-reset'){const target=accountFor(state,'t1');addNotification(state,target.id,'Password reset requested','A simulated reset link is valid for 30 minutes.','Simulated email');addAudit(state,'a1','Password reset requested',target.id,'No active token','Token valid for 30 minutes');saveState(state);closeModal();toast('Reset state generated','No real email was sent.');}
});

if (state.currentUserId && currentUser()) {
  el('login-view').hidden=true; el('app-view').hidden=false; currentPage=currentUser().role==='IT Administrator'?'accounts':'dashboard'; renderShell();
} else renderLogin();
