import { ApiProperty } from "@nestjs/swagger";

export class MeDto {
  @ApiProperty()
  username: string;

  @ApiProperty()
  role: string;
}
