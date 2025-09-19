import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, OneToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID, HideField } from '@nestjs/graphql';
import { RoleEntity } from '../../auth/entities/role.entity';
import { ProfileEntity } from './profile.entity';

@Entity('users')
@ObjectType('UserUser')
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

  @Column({ nullable: true })
  @Field({ nullable: true })
  shopId?: number;

  @ManyToMany(() => RoleEntity, (role) => role.users)
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'roleId', referencedColumnName: 'id' },
  })
  @Field(() => [RoleEntity])
  roles: RoleEntity[];

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

  // GraphQL computed field for permissions
  @Field(() => [PermissionEntity])
  get permissions(): PermissionEntity[] {
    return this.roles?.map(role => ({
      id: role.id,
      name: role.name
    })) || [];
  }
}

@ObjectType('Permission')
export class PermissionEntity {
  @Field(() => ID)
  id: number;

  @Field()
  name: string;
}