import { ObjectType, Field, ID, InputType } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('profiles')
@InputType('ProfileInputType', { isAbstract: true })
@ObjectType()
export class Profile {
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
  @Field(() => [Social], { nullable: true })
  socials?: Social[];

  @OneToOne(() => User, (user) => user.profile)
  user: User;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}

@InputType('SocialInputType', { isAbstract: true })
@ObjectType()
export class Social {
  @Field()
  type: string;

  @Field()
  link: string;
}