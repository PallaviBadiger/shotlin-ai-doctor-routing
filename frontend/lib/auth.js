export function getToken()  { return localStorage.getItem('token'); }
export function setToken(t) { localStorage.setItem('token', t); }
export function clearToken(){ localStorage.removeItem('token'); }
export function getRole()   { return localStorage.getItem('role'); }
export function setRole(r)  { localStorage.setItem('role', r); }