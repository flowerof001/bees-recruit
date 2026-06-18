import { IsString, IsOptional, IsInt, IsArray, Min, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateJobDto {
  @ApiProperty({ example: '高级 Flutter 开发工程师' })
  @IsString()
  title: string;

  @ApiProperty({ example: '负责 Flutter 跨平台应用开发...' })
  @IsString()
  description: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  requirements?: string;

  @ApiProperty({ example: '北京' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ example: 'ONSITE', enum: ['ONSITE', 'REMOTE', 'HYBRID'] })
  @IsString()
  @IsOptional()
  @IsIn(['ONSITE', 'REMOTE', 'HYBRID'])
  locationType?: string;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  salaryMin?: number;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  salaryMax?: number;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  @Min(1)
  headcount?: number;

  @ApiProperty({ required: false })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  educationReq?: string;
}

export class SearchJobDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  keyword?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  salaryMin?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  tag?: string;

  @ApiProperty({ required: false, default: 1 })
  @IsInt()
  @IsOptional()
  page?: number;

  @ApiProperty({ required: false, default: 20 })
  @IsInt()
  @IsOptional()
  pageSize?: number;
}
