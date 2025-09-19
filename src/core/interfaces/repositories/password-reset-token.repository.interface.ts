export interface PasswordResetToken {
  token: string;
  userId: number;
  email: string;
  expiresAt: Date;
}

export interface PasswordResetTokenRepositoryInterface {
  /**
   * Simpan reset token baru
   */
  save(data: PasswordResetToken): Promise<void>;

  /**
   * Cari token berdasarkan value token
   */
  findByToken(token: string): Promise<PasswordResetToken | null>;

  /**
   * Hapus token tertentu
   */
  delete(token: string): Promise<void>;

  /**
   * Opsional: hapus semua token milik user (extra security)
   */
  deleteByUserId(userId: number): Promise<void>;
}
