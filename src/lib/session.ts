import { SignJWT, jwtVerify } from 'jose'

const secret = new TextEncoder().encode(
  process.env.ADMIN_SECRET ?? 'fallback-secret-change-in-production'
)

export interface SessionPayload {
  id: string
  email: string
  role: 'admin' | 'moderator'
  name?: string
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret)
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}
