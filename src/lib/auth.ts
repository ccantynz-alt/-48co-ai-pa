import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { getSql } from './db';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'change-this-secret-in-production'
);
const JWT_EXPIRY = '7d';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  businessName?: string;
  plan: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

async function query(strings: TemplateStringsArray, ...values: unknown[]): Promise<Row[]> {
  const db = getSql();
  const result = await db(strings, ...values);
  return result as unknown as Row[];
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signToken(user: AuthUser): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as AuthUser;
  } catch {
    return null;
  }
}

export async function getTokenFromRequest(request: Request): Promise<string | null> {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map((c) => {
        const [k, ...v] = c.trim().split('=');
        return [k, v.join('=')];
      })
    );
    return cookies['auth_token'] || null;
  }

  return null;
}

export async function getUserFromRequest(request: Request): Promise<AuthUser | null> {
  const token = await getTokenFromRequest(request);
  if (!token) return null;
  return verifyToken(token);
}

export async function registerUser(
  email: string,
  password: string,
  name: string,
  businessName?: string
): Promise<{ user: AuthUser; token: string } | { error: string }> {
  const existing = await query`SELECT id FROM users WHERE email = ${email}`;
  if (existing.length > 0) {
    return { error: 'Email already registered' };
  }

  const passwordHash = await hashPassword(password);

  const rows = await query`
    INSERT INTO users (email, password_hash, name, business_name)
    VALUES (${email}, ${passwordHash}, ${name}, ${businessName || null})
    RETURNING id, email, name, business_name, plan
  `;
  const user = rows[0];

  const authUser: AuthUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    businessName: user.business_name,
    plan: user.plan,
  };

  const token = await signToken(authUser);
  return { user: authUser, token };
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ user: AuthUser; token: string } | { error: string }> {
  const rows = await query`
    SELECT id, email, name, business_name, password_hash, plan
    FROM users WHERE email = ${email}
  `;
  const user = rows[0];

  if (!user) return { error: 'Invalid email or password' };

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) return { error: 'Invalid email or password' };

  const authUser: AuthUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    businessName: user.business_name,
    plan: user.plan,
  };

  const token = await signToken(authUser);
  return { user: authUser, token };
}
