export function isAdminAuthenticated() {
  return localStorage.getItem('deprince_admin_authenticated') === 'true';
}

export function setAdminAuthenticated(value: boolean) {
  localStorage.setItem('deprince_admin_authenticated', String(value));
}

export function logoutAdmin() {
  localStorage.removeItem('deprince_admin_authenticated');
}
