import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState, validateAllocation, recommendTeachers } from '../dist/logic.js';

const proposalFor = (state, lessonId, overrides = {}) => {
  const lesson = state.lessons.find(item => item.id === lessonId);
  return { lessonId, studentId: lesson.studentId, instrument: lesson.instrument, date: lesson.date, start: lesson.start, duration: lesson.duration, ...overrides };
};

test('blocks a teacher without the lesson instrument qualification', () => {
  const state = createInitialState();
  const result = validateAllocation(state, proposalFor(state, 'L-104', { teacherId: 't2', studioId: 'ST-2' }));
  assert.ok(result.blocking.some(message => message.includes('qualified for Piano')));
});

test('blocks a drum lesson in a studio without a drum kit', () => {
  const state = createInitialState();
  const result = validateAllocation(state, proposalFor(state, 'L-104', { teacherId: 't3', studioId: 'ST-1' }));
  assert.ok(result.blocking.some(message => message.includes('drum kit')));
  assert.ok(result.alternatives.some(message => message.includes('Rhythm Studio')));
});

test('blocks lessons recorded on a public holiday', () => {
  const state = createInitialState();
  state.holidays.push({ id: 'H-X', date: '2026-11-18', description: 'Demo holiday' });
  const result = validateAllocation(state, proposalFor(state, 'L-104', { teacherId: 't3', studioId: 'ST-2' }));
  assert.ok(result.blocking.some(message => message.includes('public holiday')));
});

test('warns rather than blocks when allocation exceeds 40 weekly hours', () => {
  const state = createInitialState();
  const result = validateAllocation(state, proposalFor(state, 'L-105', { teacherId: 't6', studioId: 'ST-4' }));
  assert.equal(result.blocking.length, 0);
  assert.ok(result.warnings.some(message => message.includes('40.25 hours')));
});

test('blocks more than four continuous teaching hours', () => {
  const state = createInitialState();
  const result = validateAllocation(state, proposalFor(state, 'L-105', { teacherId: 't6', studioId: 'ST-4', start: '13:00' }));
  assert.ok(result.blocking.some(message => message.includes('four continuous teaching hours')));
});

test('a break shorter than one hour does not reset the four-hour limit', () => {
  const state = createInitialState();
  state.lessons.push(
    { id: 'L-B01', studentId: 'S-203', teacherId: 't2', instrument: 'Piano', date: '2026-11-18', start: '14:00', duration: 120, studioId: 'ST-1', status: 'Assigned' },
    { id: 'L-B02', studentId: 'S-203', teacherId: 't2', instrument: 'Piano', date: '2026-11-18', start: '16:30', duration: 120, studioId: 'ST-3', status: 'Assigned' }
  );
  const result = validateAllocation(state, proposalFor(state, 'L-105', { teacherId: 't2', studioId: 'ST-4', start: '18:30' }));
  assert.ok(result.blocking.some(message => message.includes('four continuous teaching hours')));
});

test('blocks allocation when the teacher has no accepted cycle submission', () => {
  const state = createInitialState();
  const result = validateAllocation(state, {
    lessonId: 'L-X', studentId: 'S-201', teacherId: 't1', studioId: 'ST-1',
    instrument: 'Guitar', date: '2026-11-18', start: '10:00', duration: 30
  });
  assert.ok(result.blocking.some(message => message.includes('no accepted availability submission')));
});

test('blocks allocation to a deactivated teacher account', () => {
  const state = createInitialState();
  state.accounts.find(account => account.id === 't3').status = 'Inactive';
  const result = validateAllocation(state, proposalFor(state, 'L-104', { teacherId: 't3', studioId: 'ST-2' }));
  assert.ok(result.blocking.some(message => message.includes('not active')));
});

test('editing an assigned lesson does not double-count its workload warning', () => {
  const state = createInitialState();
  const lesson = state.lessons.find(item => item.id === 'L-103');
  const teacher = state.teachers.find(item => item.id === 't2');
  teacher.weekHours = 40;
  teacher.availability.push({ date: lesson.date, start: '14:00', end: '19:00' });
  const result = validateAllocation(state, { ...lesson, lessonId: lesson.id });
  assert.equal(result.warnings.length, 0);
});

test('seed data contains all five studios from the project brief', () => {
  const state = createInitialState();
  assert.equal(state.studios.length, 5);
});

test('recommends only active qualified teachers at or below 40 hours', () => {
  const state = createInitialState();
  const lesson = state.lessons.find(item => item.id === 'L-104');
  const recommendations = recommendTeachers(state, { ...lesson, studioId: 'ST-2' });
  assert.ok(recommendations.length > 0);
  assert.ok(recommendations.every(item => ['t3', 't8'].includes(item.teacherId)));
});
