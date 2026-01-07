import { ApiProperty } from "@nestjs/swagger";

export class AuthResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  role: string;
}
