import { Profile } from '../../entities/profile.entity';

export interface ProfileRepositoryInterface {
  findById(id: number): Promise<Profile | null>;
  findByUserId(userId: number): Promise<Profile | null>;
  create(profile: Profile): Promise<Profile>;
  update(id: number, data: Partial<Profile>): Promise<Profile>;
  delete(id: number): Promise<void>;
}
