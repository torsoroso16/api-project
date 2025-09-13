import { ObjectType, Field, ID, HideField } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Role } from './role.entity';
import { RefreshToken } from './refresh-token.entity';
import { Profile } from './profile.entity';

@Entity('users')
@ObjectType()
export class User {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: number;

  @Column({ unique: true })
  @Field()
  email: string;

  @Column()
  name: string;

  @Column()
  @HideField() // Hide from GraphQL schema
  passwordHash: string;

  @Column({ default: false })
  @Field()
  isEmailVerified: boolean;

  @Column({ nullable: true })
  @HideField()
  emailVerificationToken?: string;

  @Column({ default: true })
  @Field()
  isActive: boolean;

  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'roleId', referencedColumnName: 'id' },
  })
  @Field(() => [Role])
  roles: Role[];

  @OneToMany(() => RefreshToken, (token) => token.user)
  @HideField()
  refreshTokens: RefreshToken[];

  @OneToOne(() => Profile, (profile) => profile.user, { cascade: true })
  @JoinColumn()
  @Field(() => Profile, { nullable: true })
  profile?: Profile;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}