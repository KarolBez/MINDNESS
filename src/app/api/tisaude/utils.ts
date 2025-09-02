export const BASE = 'https://app.tisaude.com/api';

export function authHeadersPatient() {
  const bearer = process.env.TISAUDE_PATIENT_BEARER || '';
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (bearer) headers.Authorization = `Bearer ${bearer}`;
  return headers;
}

export function authHeadersClinic() {
  const bearer = process.env.TISAUDE_CLINIC_BEARER || '';
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (bearer) headers.Authorization = `Bearer ${bearer}`;
  return headers;
}

export function getHash() {
  return process.env.NEXT_PUBLIC_TISAUDE_HASH || '';
}
