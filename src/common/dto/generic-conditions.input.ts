import { Field, InputType, Int, registerEnumType } from '@nestjs/graphql';
import { IsOptional, IsString, IsArray, IsEnum, IsNumber } from 'class-validator';

export enum SQLOperator {
  EQ = 'EQ',
  NEQ = 'NEQ',
  GT = 'GT',
  GTE = 'GTE',
  LT = 'LT',
  LTE = 'LTE',
  IN = 'IN',
  NOT_IN = 'NOT_IN',
  BETWEEN = 'BETWEEN',
  LIKE = 'LIKE',
  ILIKE = 'ILIKE',
}

registerEnumType(SQLOperator, {
  name: 'SQLOperator',
});

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

registerEnumType(SortOrder, {
  name: 'SortOrder',
});

@InputType()
export class WhereHasConditions {
  @Field(() => SQLOperator, { defaultValue: SQLOperator.EQ })
  @IsOptional()
  @IsEnum(SQLOperator)
  operator?: SQLOperator = SQLOperator.EQ;

  @Field()
  @IsString()
  value: string;
}

@InputType()
export class WhereHasArrayConditions {
  @Field(() => SQLOperator, { defaultValue: SQLOperator.IN })
  @IsOptional()
  @IsEnum(SQLOperator)
  operator?: SQLOperator = SQLOperator.IN;

  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  value: string[];
}

@InputType()
export class WhereInConditions {
  @Field(() => SQLOperator, { defaultValue: SQLOperator.IN })
  @IsOptional()
  @IsEnum(SQLOperator)
  operator?: SQLOperator = SQLOperator.IN;

  @Field()
  @IsString()
  value: string;
}

@InputType()
export class WhereGTEConditions {
  @Field(() => String)
  @IsString()
  relation: string;

  @Field(() => SQLOperator, { defaultValue: SQLOperator.GTE })
  @IsOptional()
  @IsEnum(SQLOperator)
  operator?: SQLOperator = SQLOperator.GTE;

  @Field(() => Int, { defaultValue: 1 })
  @IsOptional()
  @IsNumber()
  amount?: number = 1;
}

@InputType()
export class WhereHasConditionsRelation {
  @Field()
  @IsString()
  relation: string;

  @Field(() => SQLOperator)
  @IsEnum(SQLOperator)
  operator: SQLOperator;

  @Field(() => Int, { defaultValue: 1 })
  @IsOptional()
  @IsNumber()
  amount?: number = 1;
}