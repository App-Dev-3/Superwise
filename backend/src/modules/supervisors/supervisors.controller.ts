import { Controller, Post, Body, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { SupervisorsService } from './supervisors.service';
import { SupervisorRegistrationDto } from './dto/register-supervisor.dto';
import { Request } from 'express';

@ApiTags('Supervisors')
@Controller('supervisors')
export class SupervisorsController {
  constructor(private readonly supervisorsService: SupervisorsService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register as a supervisor',
    description: 'Updates supervisor profile with tags and priorities',
  })
  @ApiResponse({
    status: 201,
    description: 'Supervisor registered successfully.',
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
  @ApiHeader({
    name: 'X-API-Key',
    description: 'API Key',
  })
  @ApiHeader({
    name: 'X-User-ID',
    description: 'User ID',
  })
  @ApiHeader({
    name: 'X-Request-Timestamp',
    description: 'Request timestamp (ISO format)',
  })
  @ApiHeader({
    name: 'X-Request-Signature',
    description: 'HMAC signature',
  })
  register(
    @Body() registerDto: SupervisorRegistrationDto,
    @Req() req: Request,
  ) {
    const userId = req['userId'];
    return this.supervisorsService.register(userId, registerDto);
  }
}
