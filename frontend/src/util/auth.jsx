// src/utils/auth.js
export function getUser() {
  try { return JSON.parse(localStorage.getItem('user')) || null; } catch { return null; }
}
export function getRole(user = getUser()) {
  return String(user?.role || '').toLowerCase();
}
export function isAuthed() {
  return Boolean(localStorage.getItem('token'));
}
export function isAdmin(user = getUser()) {
  const r = getRole(user);
  return r === 'admin' || r === 'super_admin';
}
