import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID, HideField } from '@nestjs/graphql';
import { RoleEntity } from './role.entity';
import { RefreshTokenEntity } from './refresh-token.entity';
import { ProfileEntity } from './profile.entity';

@Entity('users')
@ObjectType('AuthUser')
export class UserEntity {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: number;

  @Column({ unique: true })
  @Field()
  email: string;

  @Column()
  @Field()
  name: string;

  @Column()
  @HideField()
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

  @ManyToMany(() => RoleEntity, (role) => role.users)
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'roleId', referencedColumnName: 'id' },
  })
  @Field(() => [RoleEntity])
  roles: RoleEntity[];

  @OneToMany(() => RefreshTokenEntity, (token) => token.user)
  @HideField()
  refreshTokens: RefreshTokenEntity[];

  @OneToOne(() => ProfileEntity, (profile) => profile.user, { cascade: true })
  @JoinColumn()
  @Field(() => ProfileEntity, { nullable: true })
  profile?: ProfileEntity;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}