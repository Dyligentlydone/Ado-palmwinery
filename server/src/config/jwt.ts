// Centralized JWT secret handling.
// - In production, refuses to boot if JWT_SECRET is missing or the dev fallback.
// - In development, falls back to a well-known dev secret so local dev still works.
const isProduction = process.env.NODE_ENV === 'production';
const raw = process.env.JWT_SECRET;

if (isProduction && (!raw || raw === 'dev-secret' || raw.length < 32)) {
  throw new Error(
    'JWT_SECRET must be set to a strong value in production. ' +
    'On Render this is auto-generated via render.yaml; set it manually if missing.'
  );
}

export const JWT_SECRET: string = raw || 'dev-secret';
export const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '7d';
