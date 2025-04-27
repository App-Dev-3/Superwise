import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { SupervisorsService } from './supervisors.service';
import { registerSupervisorDto } from './dto/register-supervisor.dto';
import { Request } from 'express';
import { SupervisorRegistrationResponse } from './entities/supervisor-registration.entity';
import { ApiAuthGuard } from '../auth/guards/api-auth.guard';

@ApiTags('Supervisors')
@Controller('supervisors')
export class SupervisorsController {
  constructor(private readonly supervisorsService: SupervisorsService) {}
  
// Do we need auth api documentation here in the controller? we would need to upate main.ts aswell i think 

  @Post('register')
  @UseGuards(ApiAuthGuard) 
  @ApiOperation({
    summary: 'Register as a supervisor',
    description: 'Updates supervisor profile with tags and priorities',
  })
  @ApiBody({
    type: registerSupervisorDto,
    description: 'Supervisor Tag and priority data',
  })
  @ApiResponse({
    status: 201,
    description: 'Supervisor registered successfully.',
    type: SupervisorRegistrationResponse
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid authentication.',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found - User not found or not a supervisor.',
  })
  register(
    @Body() registerDto: registerSupervisorDto,
    @Req() req: Request,
  ): Promise<SupervisorRegistrationResponse> {
    const userId = req['userId'];
    return this.supervisorsService.register(userId, registerDto);
  }
}