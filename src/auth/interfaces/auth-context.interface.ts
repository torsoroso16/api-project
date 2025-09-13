import { User } from '../../database/entities/user.entity';

export interface AuthContext {
  user: User;
}