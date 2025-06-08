import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma, RequestState, Role, SupervisionRequest } from '@prisma/client';
import { SupervisionRequestWithUsersEntity } from './entities/supervision-request-with-users.entity';

@Injectable()
export class SupervisionRequestsRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find all supervision requests with filtering options
   */
  async findAllRequests(params: {
    request_state?: RequestState;
    student_id?: string;
    supervisor_id?: string;
  }): Promise<SupervisionRequestWithUsersEntity[]> {
    const { request_state, student_id, supervisor_id } = params;

    return this.prisma.supervisionRequest.findMany({
      where: {
        ...(request_state && { request_state }),
        ...(student_id && { student_id }),
        ...(supervisor_id && { supervisor_id }),
      },
      orderBy: {
        updated_at: 'desc',
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                first_name: true,
                last_name: true,
                email: true,
                profile_image: true,
              },
            },
          },
        },
        supervisor: {
          include: {
            user: {
              select: {
                first_name: true,
                last_name: true,
                email: true,
                profile_image: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Find a supervision request by its ID
   */
  async findRequestById(id: string): Promise<SupervisionRequestWithUsersEntity | null> {
    return this.prisma.supervisionRequest.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            user: {
              select: {
                first_name: true,
                last_name: true,
                email: true,
                profile_image: true,
              },
            },
          },
        },
        supervisor: {
          include: {
            user: {
              select: {
                first_name: true,
                last_name: true,
                email: true,
                profile_image: true,
              },
            },
          },
        },
      },
    });
  }

  async hasAcceptedSupervision(studentId: string, tx?: Prisma.TransactionClient): Promise<boolean> {
    const client = tx || this.prisma;

    const existingAccepted = await client.supervisionRequest.findFirst({
      where: {
        student_id: studentId,
        request_state: RequestState.ACCEPTED,
      },
    });

    return !!existingAccepted;
  }

  async withdrawCompetingRequests(
    studentId: string,
    excludeRequestId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<number> {
    const client = tx || this.prisma;

    const result = await client.supervisionRequest.updateMany({
      where: {
        student_id: studentId,
        request_state: RequestState.PENDING,
        id: { not: excludeRequestId },
      },
      data: {
        request_state: RequestState.WITHDRAWN,
      },
    });

    return result.count;
  }

  /**
   * Count supervision requests with filtering options
   * @param request_state Optional request state filter
   * @param student_id Optional student ID filter
   * @param supervisor_id Optional supervisor ID filter
   * @returns The total count of matching supervision requests
   */
  async countRequests(params: {
    request_state?: RequestState;
    student_id?: string;
    supervisor_id?: string;
  }): Promise<number> {
    const { request_state, student_id, supervisor_id } = params;

    return this.prisma.supervisionRequest.count({
      where: {
        ...(request_state && { request_state }),
        ...(student_id && { student_id }),
        ...(supervisor_id && { supervisor_id }),
      },
    });
  }

  /**
   * Create or find a student by email
   * @param email Student email
   * @param tx Optional transaction client
   * @returns Student profile and a flag indicating if a new student entry was created
   */
  async createOrFindStudentByEmail(
    email: string,
    tx?: Prisma.TransactionClient,
  ): Promise<{ id: string; user_id: string; wasCreated: boolean }> {
    // Use provided transaction client or default prisma client if not provided
    const client = tx || this.prisma;

    // Find or create the user
    let user = await client.user.findUnique({
      where: { email },
    });

    let wasCreated = false;
    if (!user) {
      // Create a new user with minimal info
      user = await client.user.create({
        data: {
          email,
          first_name: '',
          last_name: '',
          role: Role.STUDENT,
          is_registered: false,
        },
      });
      wasCreated = true;
    }

    // Find or create the student profile
    let student = await client.student.findUnique({
      where: { user_id: user.id },
    });

    if (!student) {
      student = await client.student.create({
        data: {
          user: {
            connect: {
              id: user.id,
            },
          },
        },
      });
      wasCreated = true;
    }

    return {
      id: student.id,
      user_id: user.id,
      wasCreated,
    };
  }

  /**
   * Create a new supervision request
   * Simple version: Create request with provided data
   * For ACCEPTED requests: Also handles student creation and supervisor capacity
   */
  async createSupervisionRequest(data: {
    student_id?: string;
    supervisor_id: string;
    request_state: RequestState;
    student_email?: string;
    available_spots?: number;
  }): Promise<SupervisionRequest & { studentWasCreated?: boolean }> {
    // Handle ACCEPTED requests with student email (supervisor creating)
    if (
      data.request_state === RequestState.ACCEPTED &&
      data.student_email &&
      typeof data.available_spots === 'number'
    ) {
      const availableSpots = data.available_spots;

      return this.prisma.$transaction(async tx => {
        // Find or create student using our helper method
        const studentResult = await this.createOrFindStudentByEmail(
          data.student_email as string,
          tx,
        );

        // Create the supervision request
        const request = await tx.supervisionRequest.create({
          data: {
            student_id: studentResult.id,
            supervisor_id: data.supervisor_id,
            request_state: RequestState.ACCEPTED,
          },
        });

        // Update supervisor's available spots
        await tx.supervisor.update({
          where: { id: data.supervisor_id },
          data: {
            available_spots: availableSpots - 1,
          },
        });

        await this.withdrawCompetingRequests(studentResult.id, request.id, tx);

        return {
          ...request,
          studentWasCreated: studentResult.wasCreated,
        };
      });
    }

    // For simple request creation (PENDING from students)
    return this.prisma.supervisionRequest.create({
      data: {
        student_id: data.student_id!,
        supervisor_id: data.supervisor_id,
        request_state: data.request_state,
      },
    });
  }

  /**
   * Update a supervision request state
   * If changing to/from ACCEPTED, also updates supervisor capacity
   */
  async updateRequestState(data: {
    id: string;
    newState: RequestState;
    currentState: RequestState;
    supervisor_id: string;
    available_spots: number;
    total_spots: number;
  }): Promise<SupervisionRequest> {
    const { id, newState, currentState, supervisor_id, available_spots, total_spots } = data;

    // If state isn't changing, just update without transaction
    if (newState === currentState) {
      return this.prisma.supervisionRequest.update({
        where: { id },
        data: { request_state: newState },
      });
    }

    // For changes to/from ACCEPTED, use transaction to update capacity
    const isBecomingAccepted =
      currentState !== RequestState.ACCEPTED && newState === RequestState.ACCEPTED;
    const isLeavingAccepted =
      currentState === RequestState.ACCEPTED && newState !== RequestState.ACCEPTED;

    if (isBecomingAccepted || isLeavingAccepted) {
      return this.prisma.$transaction(async tx => {
        // Update the request state
        const updatedRequest = await tx.supervisionRequest.update({
          where: { id },
          data: { request_state: newState },
        });

        // Update supervisor's available spots
        if (isBecomingAccepted) {
          // When accepting a request, decrease available spots
          await tx.supervisor.update({
            where: { id: supervisor_id },
            data: { available_spots: available_spots - 1 },
          });

          // Withdraw competing requests
          await this.withdrawCompetingRequests(updatedRequest.student_id, id, tx);
        } else {
          // When withdrawing/rejecting an accepted request, increase available spots
          const newSpots = Math.min(available_spots + 1, total_spots);
          await tx.supervisor.update({
            where: { id: supervisor_id },
            data: { available_spots: newSpots },
          });
        }

        return updatedRequest;
      });
    }

    // For other state changes that don't affect capacity
    return this.prisma.supervisionRequest.update({
      where: { id },
      data: { request_state: newState },
    });
  }
}
