import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApplyJobDto {
  @ApiProperty()
  @IsString()
  resumeId: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  message?: string;
}

export class UpdateApplicationDto {
  @ApiProperty({ enum: ['VIEWED', 'ACCEPTED', 'REJECTED', 'CHATTING'] })
  @IsString()
  @IsIn(['VIEWED', 'ACCEPTED', 'REJECTED', 'CHATTING'])
  status: string;
}
