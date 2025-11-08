// Simple localStorage-backed helpers for demo purposes
// In real app, replace with API calls + proper auth

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem('ssaems_user');
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  // fallback demo user
  return {
    idNumber: 'STU2023001',
    name: 'John Doe',
    email: 'john.doe@example.edu',
    role: 'student',
    cgpa: '8.7',
  };
}

export function saveCurrentUser(user) {
  localStorage.setItem('ssaems_user', JSON.stringify(user));
}

export function getSubjects() {
  try {
    const raw = localStorage.getItem('ssaems_subjects');
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return null;
}

export function saveSubjects(list) {
  localStorage.setItem('ssaems_subjects', JSON.stringify(list));
  // Dispatch custom event to notify other components
  window.dispatchEvent(new CustomEvent('subjectsUpdated', { detail: list }));
}

export function getPreferences() {
  try {
    const raw = localStorage.getItem('ssaems_prefs');
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return null;
}

export function savePreferences(list) {
  localStorage.setItem('ssaems_prefs', JSON.stringify(list));
}

export function saveChangeRequest(payload) {
  // Append to a list for demo
  try {
    const raw = localStorage.getItem('ssaems_change_requests');
    const arr = raw ? JSON.parse(raw) : [];
    arr.push({ ...payload, createdAt: new Date().toISOString() });
    localStorage.setItem('ssaems_change_requests', JSON.stringify(arr));
  } catch (_) {}
}
