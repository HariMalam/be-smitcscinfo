import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export async function hashValue(value: string): Promise<string> {
  return await bcrypt.hash(value, SALT_ROUNDS);
}

export async function compareValue(
  value: string,
  hashedValue: string,
): Promise<boolean> {
  return await bcrypt.compare(value, hashedValue);
}
