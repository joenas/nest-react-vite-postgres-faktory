import { Controller, Get } from "@nestjs/common";
import { Public } from "../common/decorators/public.decorator";
import { ApiExcludeEndpoint } from "@nestjs/swagger";

@Controller("health")
@Public()
export class HealthController {
  @Get()
  @ApiExcludeEndpoint()
  async healthCheck() {
    return { status: "ok" };
  }
}
