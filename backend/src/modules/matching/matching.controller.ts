import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Match } from './entity/match.entity';
import { MatchingService } from './matching.service';

@ApiTags('Matching')
@Controller('match')
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Get(':userId')
  @ApiOperation({
    summary: 'Get all supervisors with compatibility scores for a user',
    description:
      'Calculate and retrieve a list of all supervisors with their compatibility scores for a specific student',
  })
  @ApiParam({
    name: 'userId',
    type: 'string',
    format: 'uuid',
    description: 'User unique identifier (UUID)',
    required: true,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'List of supervisors with compatibility scores for the user',
    type: [Match],
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid User ID format.',
  })
  async calculateCompatibilityScore(
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<Match[]> {
    return this.matchingService.calculateAllMatchesForUserId(userId);
  }
}
