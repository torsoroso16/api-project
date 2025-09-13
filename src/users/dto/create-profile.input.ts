import { Field, ID, InputType, PickType } from '@nestjs/graphql';
import { IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class SocialInput {
  @Field()
  @IsString()
  type: string;

  @Field()
  @IsString()
  link: string;
}

@InputType()
export class CreateProfileInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  bio?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  avatar?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  contact?: string;

  @Field(() => [SocialInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SocialInput)
  socials?: SocialInput[];
}

// Export ProfileInput as alias to CreateProfileInput for backward compatibility
export const ProfileInput = CreateProfileInput;

@InputType()
export class ConnectBelongsTo {
  @Field(() => ID)
  connect: number;
}

// Backward compatibility export
@InputType()
export class ProfileInputCompat extends CreateProfileInput {
  @Field(() => ConnectBelongsTo, { nullable: true })
  @IsOptional()
  customer?: ConnectBelongsTo;
}