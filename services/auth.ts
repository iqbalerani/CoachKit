import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { AuthAccount, AuthSession } from '../types';

const ACCOUNTS_KEY = 'coachkit_accounts';
const SESSION_KEY = 'coachkit_active_session';

// --- Account Storage ---

async function getAccounts(): Promise<AuthAccount[]> {
  const data = await SecureStore.getItemAsync(ACCOUNTS_KEY);
  return data ? JSON.parse(data) : [];
}

async function saveAccounts(accounts: AuthAccount[]): Promise<void> {
  await SecureStore.setItemAsync(ACCOUNTS_KEY, JSON.stringify(accounts));
}

// --- Session Storage ---

export async function getActiveSession(): Promise<AuthSession | null> {
  const data = await SecureStore.getItemAsync(SESSION_KEY);
  return data ? JSON.parse(data) : null;
}

async function setActiveSession(session: AuthSession): Promise<void> {
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
}

// --- Password Hashing ---

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function hashPassword(password: string, salt: string): Promise<string> {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    salt + password
  );
}

// --- Auth Operations ---

export async function signUp(
  email: string,
  password: string
): Promise<AuthSession> {
  const normalizedEmail = email.toLowerCase().trim();

  const accounts = await getAccounts();
  if (accounts.find(a => a.email === normalizedEmail)) {
    throw new Error('An account with this email already exists');
  }

  const saltBytes = Crypto.getRandomBytes(16);
  const salt = bytesToHex(saltBytes);
  const passwordHash = await hashPassword(password, salt);
  const userId = Crypto.randomUUID();

  const account: AuthAccount = {
    userId,
    email: normalizedEmail,
    passwordHash,
    salt,
    createdAt: new Date().toISOString(),
  };

  accounts.push(account);
  await saveAccounts(accounts);

  const session: AuthSession = {
    userId,
    email: normalizedEmail,
    lastLoginAt: new Date().toISOString(),
  };
  await setActiveSession(session);

  return session;
}

export async function signIn(
  email: string,
  password: string
): Promise<AuthSession> {
  const normalizedEmail = email.toLowerCase().trim();

  const accounts = await getAccounts();
  const account = accounts.find(a => a.email === normalizedEmail);
  if (!account) {
    throw new Error('No account found with this email');
  }

  const hash = await hashPassword(password, account.salt);
  if (hash !== account.passwordHash) {
    throw new Error('Incorrect password');
  }

  const session: AuthSession = {
    userId: account.userId,
    email: account.email,
    lastLoginAt: new Date().toISOString(),
  };
  await setActiveSession(session);

  return session;
}

export async function signOut(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_KEY);
}
