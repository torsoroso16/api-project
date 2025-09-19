export interface PasswordServiceInterface {
  hash(password: string): Promise<string>;
  verify(hashedPassword: string, plainPassword: string): Promise<boolean>;
}