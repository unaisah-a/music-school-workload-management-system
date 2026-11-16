export const STORAGE_KEY = 'cadence-msms-state-v2';

const teacherAvailability = (date, start = '08:00', end = '21:00') => ({ date, start, end });

export function createInitialState() {
  return {
    version: 2,
    demoDate: '2026-11-13T10:00:00+08:00',
    currentUserId: null,
    accounts: [
      { id: 't1', name: 'Amelia Tan', email: 'amelia.teacher@demo.local', role: 'Teacher', instrument: 'Guitar', status: 'Active', lockedUntil: null, failedLogins: 0 },
      { id: 't2', name: 'Marcus Lee', email: 'marcus.teacher@demo.local', role: 'Teacher', instrument: 'Piano', status: 'Active', lockedUntil: null, failedLogins: 0 },
      { id: 't3', name: 'Nadia Rahman', email: 'nadia.teacher@demo.local', role: 'Teacher', instrument: 'Drums', status: 'Active', lockedUntil: null, failedLogins: 0 },
      { id: 't4', name: 'Daniel Wong', email: 'daniel.teacher@demo.local', role: 'Teacher', instrument: 'Guitar', status: 'Active', lockedUntil: null, failedLogins: 0 },
      { id: 't5', name: 'Sarah Ng', email: 'sarah.teacher@demo.local', role: 'Teacher', instrument: 'Violin', status: 'Active', lockedUntil: null, failedLogins: 0 },
      { id: 't6', name: 'Ethan Koh', email: 'ethan.teacher@demo.local', role: 'Teacher', instrument: 'Piano', status: 'Active', lockedUntil: null, failedLogins: 0 },
      { id: 't7', name: 'Priya Nair', email: 'priya.teacher@demo.local', role: 'Teacher', instrument: 'Violin', status: 'Active', lockedUntil: null, failedLogins: 0 },
      { id: 't8', name: 'Leo Chen', email: 'leo.teacher@demo.local', role: 'Teacher', instrument: 'Drums', status: 'Active', lockedUntil: null, failedLogins: 0 },
      { id: 't9', name: 'Aisha Malik', email: 'aisha.teacher@demo.local', role: 'Teacher', instrument: 'Piano', status: 'Active', lockedUntil: null, failedLogins: 0 },
      { id: 'm1', name: 'Michelle Goh', email: 'michelle.manager@demo.local', role: 'Manager', status: 'Active', lockedUntil: null, failedLogins: 0 },
      { id: 'a1', name: 'Iris Tan', email: 'iris.admin@demo.local', role: 'IT Administrator', status: 'Active', lockedUntil: null, failedLogins: 0 }
    ],
    teachers: [
      { id: 't1', weekHours: 32, monthHours: 118.5, shift: 'Day', desiredHours: 34, preferredDays: ['Mon', 'Tue', 'Wed', 'Thu'], preferredBands: ['Morning'], remarks: 'Prefer Studio Harmony for consecutive lessons.', submitted: false, availability: [teacherAvailability('2026-11-14'), teacherAvailability('2026-11-17'), teacherAvailability('2026-11-18'), teacherAvailability('2026-12-01'), teacherAvailability('2026-12-02')] },
      { id: 't2', weekHours: 18.5, monthHours: 76, shift: 'Evening', desiredHours: 24, preferredDays: ['Mon', 'Wed', 'Fri'], preferredBands: ['Afternoon', 'Evening'], remarks: '', submitted: true, availability: [teacherAvailability('2026-11-16', '12:00'), teacherAvailability('2026-11-18', '14:00')] },
      { id: 't3', weekHours: 38.5, monthHours: 144, shift: 'Day', desiredHours: 40, preferredDays: ['Tue', 'Wed', 'Thu'], preferredBands: ['Afternoon'], remarks: 'Available for urgent drum cover.', submitted: true, availability: [teacherAvailability('2026-11-18', '10:00', '20:00')] },
      { id: 't4', weekHours: 21, monthHours: 84, shift: 'Evening', desiredHours: 30, preferredDays: ['Tue', 'Thu', 'Sat'], preferredBands: ['Afternoon', 'Evening'], remarks: '', submitted: true, availability: [teacherAvailability('2026-11-17'), teacherAvailability('2026-11-18'), teacherAvailability('2026-11-21')] },
      { id: 't5', weekHours: 41, monthHours: 157.5, shift: 'Day', desiredHours: 36, preferredDays: ['Mon', 'Tue', 'Wed'], preferredBands: ['Morning'], remarks: 'No additional hours preferred.', submitted: true, availability: [teacherAvailability('2026-11-18')] },
      { id: 't6', weekHours: 39.75, monthHours: 151, shift: 'Day', desiredHours: 40, preferredDays: ['Wed', 'Thu'], preferredBands: ['Morning', 'Afternoon'], remarks: '', submitted: true, availability: [teacherAvailability('2026-11-18', '09:00', '18:00')] },
      { id: 't7', weekHours: 14, monthHours: 59, shift: 'Evening', desiredHours: 24, preferredDays: ['Fri', 'Sat', 'Sun'], preferredBands: ['Afternoon'], remarks: '', submitted: true, availability: [teacherAvailability('2026-11-20'), teacherAvailability('2026-11-21')] },
      { id: 't8', weekHours: 22, monthHours: 89.5, shift: 'Evening', desiredHours: 28, preferredDays: ['Wed', 'Fri', 'Sun'], preferredBands: ['Afternoon', 'Evening'], remarks: '', submitted: true, availability: [teacherAvailability('2026-11-18', '14:00', '21:00')] },
      { id: 't9', weekHours: 27, monthHours: 105, shift: 'Day', desiredHours: 32, preferredDays: ['Mon', 'Wed', 'Thu'], preferredBands: ['Afternoon'], remarks: '', submitted: false, availability: [teacherAvailability('2026-11-18', '12:00', '19:00')] }
    ],
    students: [
      { id: 'S-201', name: 'Sophie Lim', instrument: 'Guitar', level: 'Intermediate', preferredStart: '09:00', preferredEnd: '12:00', status: 'Active', assignedTeacherId: 't1' },
      { id: 'S-202', name: 'Maya Pillai', instrument: 'Drums', level: 'Beginner', preferredStart: '14:00', preferredEnd: '18:00', status: 'Active', assignedTeacherId: null },
      { id: 'S-203', name: 'Jonas Tan', instrument: 'Piano', level: 'Grade 3', preferredStart: '15:00', preferredEnd: '19:00', status: 'Active', assignedTeacherId: 't2' },
      { id: 'S-204', name: 'Wei En Lee', instrument: 'Violin', level: 'Beginner', preferredStart: '10:00', preferredEnd: '15:00', status: 'Active', assignedTeacherId: 't7' },
      { id: 'S-205', name: 'Noah Rahim', instrument: 'Guitar', level: 'Grade 2', preferredStart: '09:00', preferredEnd: '13:00', status: 'Active', assignedTeacherId: 't1' }
    ],
    studios: [
      { id: 'ST-1', name: 'Harmony Studio', hasDrumKit: false, status: 'Available' },
      { id: 'ST-2', name: 'Rhythm Studio', hasDrumKit: true, status: 'Available' },
      { id: 'ST-3', name: 'Melody Studio', hasDrumKit: false, status: 'Available' },
      { id: 'ST-4', name: 'Sonata Studio', hasDrumKit: false, status: 'Available' },
      { id: 'ST-5', name: 'Tempo Studio', hasDrumKit: false, status: 'Available' }
    ],
    lessons: [
      { id: 'L-101', studentId: 'S-201', teacherId: 't1', instrument: 'Guitar', date: '2026-11-17', start: '10:00', duration: 30, studioId: 'ST-1', status: 'Assigned' },
      { id: 'L-102', studentId: 'S-205', teacherId: 't1', instrument: 'Guitar', date: '2026-11-14', start: '09:30', duration: 30, studioId: 'ST-1', status: 'Assigned' },
      { id: 'L-103', studentId: 'S-203', teacherId: 't2', instrument: 'Piano', date: '2026-11-16', start: '16:00', duration: 30, studioId: 'ST-3', status: 'Assigned' },
      { id: 'L-104', studentId: 'S-202', teacherId: null, instrument: 'Drums', date: '2026-11-18', start: '15:00', duration: 30, studioId: null, status: 'Unassigned' },
      { id: 'L-105', studentId: 'S-203', teacherId: null, instrument: 'Piano', date: '2026-11-18', start: '17:00', duration: 30, studioId: null, status: 'Unassigned' },
      { id: 'L-106', studentId: 'S-202', teacherId: 't3', instrument: 'Drums', date: '2026-11-18', start: '11:00', duration: 30, studioId: 'ST-2', status: 'Assigned' },
      { id: 'L-201', studentId: 'S-203', teacherId: 't6', instrument: 'Piano', date: '2026-11-18', start: '09:00', duration: 240, studioId: 'ST-3', status: 'Assigned', internalBlock: true }
    ],
    holidays: [
      { id: 'H-1', date: '2026-12-25', description: 'Christmas Day', source: 'Manually recorded official public holiday' }
    ],
    availabilityRequests: [
      { id: 'AR-002', teacherId: 't9', changeType: 'Available', date: '2026-12-03', start: '14:00', end: '18:00', reason: 'Late confirmation of medical appointment schedule.', status: 'Pending', submittedAt: '2026-11-20T08:30:00+08:00' }
    ],
    rejections: [],
    rejectionHistory: [
      { id: 'RH-1', teacherId: 't1', lessonId: 'L-H01', reason: 'Medical appointment', submittedAt: '2026-11-03T09:00:00+08:00', status: 'Reassigned' },
      { id: 'RH-2', teacherId: 't1', lessonId: 'L-H02', reason: 'Family emergency', submittedAt: '2026-11-08T12:00:00+08:00', status: 'Reassigned' }
    ],
    notifications: [
      { id: 'N-1', recipientId: 't1', title: 'Availability due 19 November', message: 'Submit December availability by 23:59 on 19 November.', channel: 'In-app + simulated email', status: 'Unread', createdAt: '2026-11-13T08:00:00+08:00' },
      { id: 'N-2', recipientId: 'm1', title: 'Two availability submissions missing', message: 'Amelia Tan and Aisha Malik have not submitted December availability.', channel: 'In-app', status: 'Unread', createdAt: '2026-11-13T08:05:00+08:00' }
    ],
    audit: [
      { id: 'A-1', actorId: 'm1', action: 'Lesson allocated', record: 'L-103', before: 'Unassigned', after: 'Marcus Lee, Melody Studio', timestamp: '2026-11-12T16:15:00+08:00' },
      { id: 'A-2', actorId: 'a1', action: 'Holiday added', record: 'H-1', before: 'Not recorded', after: '25 Dec 2026 - Christmas Day', timestamp: '2026-11-10T11:20:00+08:00' },
      { id: 'A-3', actorId: 'm1', action: 'Student updated', record: 'S-203', before: 'Preferred 16:00-18:00', after: 'Preferred 15:00-19:00', timestamp: '2026-11-09T14:40:00+08:00' }
    ]
  };
}

export function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved?.version === 2) return saved;
  } catch { /* fall through to deterministic seed */ }
  const initial = createInitialState();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetState() {
  const initial = createInitialState();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

export function timeToMinutes(value) {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(value) {
  const minutes = ((value % 1440) + 1440) % 1440;
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

export function overlaps(startA, durationA, startB, durationB) {
  const a = timeToMinutes(startA);
  const b = timeToMinutes(startB);
  return a < b + durationB && b < a + durationA;
}

export function accountFor(state, id) {
  return state.accounts.find(account => account.id === id);
}

export function teacherFor(state, id) {
  return state.teachers.find(teacher => teacher.id === id);
}

export function studentFor(state, id) {
  return state.students.find(student => student.id === id);
}

export function studioFor(state, id) {
  return state.studios.find(studio => studio.id === id);
}

function inAvailability(teacher, date, start, duration) {
  const startMinutes = timeToMinutes(start);
  const endMinutes = startMinutes + duration;
  return teacher.availability.some(slot => slot.date === date && timeToMinutes(slot.start) <= startMinutes && timeToMinutes(slot.end) >= endMinutes);
}

function withinOperatingHours(date, start, duration) {
  const day = new Date(`${date}T00:00:00+08:00`).getDay();
  const open = day === 0 || day === 6 ? 8 * 60 : 9 * 60;
  const close = 21 * 60;
  const proposedStart = timeToMinutes(start);
  return proposedStart >= open && proposedStart + duration <= close;
}

function continuousMinutes(state, proposal) {
  const intervals = state.lessons
    .filter(lesson => lesson.teacherId === proposal.teacherId && lesson.date === proposal.date && lesson.status !== 'Cancelled' && lesson.id !== proposal.lessonId)
    .map(lesson => [timeToMinutes(lesson.start), timeToMinutes(lesson.start) + lesson.duration]);
  intervals.push([timeToMinutes(proposal.start), timeToMinutes(proposal.start) + proposal.duration]);
  intervals.sort((a, b) => a[0] - b[0]);
  let longestTeaching = 0;
  let groupTeaching = intervals[0] ? intervals[0][1] - intervals[0][0] : 0;
  let segmentEnd = intervals[0]?.[1] || 0;
  for (let index = 1; index < intervals.length; index += 1) {
    const [start, end] = intervals[index];
    const breakMinutes = start - segmentEnd;
    if (breakMinutes >= 60) {
      longestTeaching = Math.max(longestTeaching, groupTeaching);
      groupTeaching = end - start;
    } else groupTeaching += Math.max(0, end - Math.max(start, segmentEnd));
    segmentEnd = Math.max(segmentEnd, end);
  }
  return Math.max(longestTeaching, groupTeaching);
}

export function validateAllocation(state, proposal) {
  const blocking = [];
  const warnings = [];
  const alternatives = [];
  const teacher = teacherFor(state, proposal.teacherId);
  const account = accountFor(state, proposal.teacherId);
  const student = studentFor(state, proposal.studentId);
  const studio = studioFor(state, proposal.studioId);
  const duration = Number(proposal.duration || 30);
  const existingLesson = state.lessons.find(lesson => lesson.id === proposal.lessonId);

  if (!teacher || !account || account.status !== 'Active') blocking.push('The selected teacher account is not active.');
  if (teacher && account.instrument !== proposal.instrument) blocking.push(`${account.name} is qualified for ${account.instrument}, not ${proposal.instrument}.`);
  if (teacher && !teacher.submitted) blocking.push(`${account.name} has no accepted availability submission for this planning cycle.`);
  if (student?.status !== 'Active') blocking.push('The selected student is not actively enrolled.');
  if (state.holidays.some(holiday => holiday.date === proposal.date)) blocking.push('The selected date is recorded as a public holiday.');
  if (!withinOperatingHours(proposal.date, proposal.start, duration)) blocking.push('The lesson is outside school operating hours.');
  if (teacher && !inAvailability(teacher, proposal.date, proposal.start, duration)) blocking.push(`${account.name} is not available for the full lesson period.`);
  if (student) {
    const lessonStart = timeToMinutes(proposal.start);
    if (lessonStart < timeToMinutes(student.preferredStart) || lessonStart + duration > timeToMinutes(student.preferredEnd)) {
      blocking.push(`${student.name}'s recorded lesson window is ${student.preferredStart}-${student.preferredEnd}.`);
    }
  }
  if (!studio) blocking.push('Select a studio before validating.');
  if (studio?.status !== 'Available') blocking.push(`${studio.name} is not available.`);
  if (proposal.instrument === 'Drums' && studio && !studio.hasDrumKit) blocking.push('Drum lessons require Rhythm Studio, which has the drum kit.');

  const teacherConflict = state.lessons.find(lesson => lesson.id !== proposal.lessonId && lesson.status === 'Assigned' && lesson.teacherId === proposal.teacherId && lesson.date === proposal.date && overlaps(proposal.start, duration, lesson.start, lesson.duration));
  if (teacherConflict) blocking.push(`${account?.name || 'Teacher'} already has lesson ${teacherConflict.id} at ${teacherConflict.start}.`);
  const studioConflict = state.lessons.find(lesson => lesson.id !== proposal.lessonId && lesson.status === 'Assigned' && lesson.studioId === proposal.studioId && lesson.date === proposal.date && overlaps(proposal.start, duration, lesson.start, lesson.duration));
  if (studioConflict) blocking.push(`${studio?.name || 'Studio'} is occupied by lesson ${studioConflict.id} at ${studioConflict.start}.`);
  if (teacher && continuousMinutes(state, proposal) > 240) blocking.push('This allocation exceeds four continuous teaching hours without a one-hour break.');
  const existingContribution = existingLesson?.status === 'Assigned' && existingLesson.teacherId === proposal.teacherId ? existingLesson.duration / 60 : 0;
  const resultingHours = teacher ? teacher.weekHours - existingContribution + duration / 60 : 0;
  if (teacher && resultingHours > 40) warnings.push(`${account.name} would reach ${resultingHours.toFixed(2)} hours this week. Manager acknowledgement is required.`);

  if (studio && blocking.some(message => /studio|drum kit/i.test(message))) {
    const validStudio = state.studios.find(candidate => candidate.status === 'Available' && (proposal.instrument !== 'Drums' || candidate.hasDrumKit) && !state.lessons.some(lesson => lesson.status === 'Assigned' && lesson.studioId === candidate.id && lesson.date === proposal.date && overlaps(proposal.start, duration, lesson.start, lesson.duration)));
    if (validStudio) alternatives.push(`Try ${validStudio.name}.`);
  }
  if (teacher && blocking.some(message => /teacher|qualified|available|continuous/i.test(message))) {
    const candidate = state.teachers.find(candidateTeacher => {
      const candidateAccount = accountFor(state, candidateTeacher.id);
      if (candidateTeacher.id === teacher.id || candidateAccount?.instrument !== proposal.instrument || candidateAccount?.status !== 'Active') return false;
      const next = { ...proposal, teacherId: candidateTeacher.id };
      return validateAllocationShallow(state, next).length === 0;
    });
    if (candidate) alternatives.push(`Try ${accountFor(state, candidate.id).name}, who is eligible at this time.`);
  }
  if (blocking.some(message => /four continuous/i.test(message))) alternatives.push(`Move the lesson to ${minutesToTime(timeToMinutes(proposal.start) + 60)} or schedule another eligible teacher.`);
  return { blocking: [...new Set(blocking)], warnings: [...new Set(warnings)], alternatives: [...new Set(alternatives)] };
}

function validateAllocationShallow(state, proposal) {
  const teacher = teacherFor(state, proposal.teacherId);
  const account = accountFor(state, proposal.teacherId);
  const duration = Number(proposal.duration || 30);
  const errors = [];
  if (!teacher || account?.status !== 'Active' || account.instrument !== proposal.instrument) errors.push('teacher');
  if (teacher && !teacher.submitted) errors.push('submission');
  if (teacher && !inAvailability(teacher, proposal.date, proposal.start, duration)) errors.push('availability');
  if (teacher && continuousMinutes(state, proposal) > 240) errors.push('break');
  if (state.holidays.some(holiday => holiday.date === proposal.date) || !withinOperatingHours(proposal.date, proposal.start, duration)) errors.push('calendar');
  if (state.lessons.some(lesson => lesson.id !== proposal.lessonId && lesson.status === 'Assigned' && lesson.teacherId === proposal.teacherId && lesson.date === proposal.date && overlaps(proposal.start, duration, lesson.start, lesson.duration))) errors.push('conflict');
  return errors;
}

export function recommendTeachers(state, lesson) {
  return state.teachers
    .map(teacher => {
      const account = accountFor(state, teacher.id);
      if (account?.instrument !== lesson.instrument || account.status !== 'Active' || teacher.weekHours > 40 || !teacher.submitted) return null;
      const proposal = { lessonId: lesson.id, studentId: lesson.studentId, teacherId: teacher.id, studioId: lesson.studioId || (lesson.instrument === 'Drums' ? 'ST-2' : 'ST-1'), instrument: lesson.instrument, date: lesson.date, start: lesson.start, duration: lesson.duration };
      if (validateAllocation(state, proposal).blocking.length) return null;
      const dayName = new Intl.DateTimeFormat('en-SG', { weekday: 'short', timeZone: 'Asia/Singapore' }).format(new Date(`${lesson.date}T00:00:00+08:00`));
      const preferenceFit = teacher.preferredDays.includes(dayName) ? 1 : 0;
      const score = teacher.weekHours - preferenceFit * 2 + Math.max(0, teacher.weekHours - teacher.desiredHours) * 0.5;
      return { teacherId: teacher.id, score, preferenceFit };
    })
    .filter(Boolean)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);
}

export function addAudit(state, actorId, action, record, before, after) {
  state.audit.unshift({ id: `A-${Date.now()}`, actorId, action, record, before, after, timestamp: new Date(state.demoDate).toISOString() });
}

export function addNotification(state, recipientId, title, message, channel = 'In-app + simulated email') {
  state.notifications.unshift({ id: `N-${Date.now()}-${recipientId}`, recipientId, title, message, channel, status: 'Unread', createdAt: new Date(state.demoDate).toISOString() });
}
