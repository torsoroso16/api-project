import { Entity, PrimaryGeneratedColumn, Column, OneToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectType, Field, ID, InputType } from '@nestjs/graphql';
import { UserEntity } from './user.entity';

@Entity('profiles')
@InputType('ProfileInputType', { isAbstract: true })
@ObjectType('AuthProfile')
export class ProfileEntity {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: number;

  @Column({ nullable: true })
  @Field({ nullable: true })
  bio?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  avatar?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  contact?: string;

  @Column('simple-json', { nullable: true })
  @Field(() => [SocialEntity], { nullable: true })
  socials?: SocialEntity[];

  @OneToOne(() => UserEntity, (user) => user.profile)
  user: UserEntity;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}

@InputType('SocialInputType', { isAbstract: true })
@ObjectType('AuthSocial')
export class SocialEntity {
  @Field()
  type: string;

  @Field()
  link: string;
}