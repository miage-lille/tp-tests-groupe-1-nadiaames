// Test d'intégration
// A. Création d'un repository avec Prisma
import { PrismaClient } from '@prisma/client';
import { Webinar } from 'src/webinars/entities/webinar.entity';
import { IWebinarRepository } from 'src/webinars/ports/webinar-repository.interface';

export class PrismaWebinarRepository implements IWebinarRepository {
  constructor(private readonly prismaClient: PrismaClient) {}

  async create(webinar: Webinar): Promise<void> {
    await this.prismaClient.webinar.create({
      data: {
        id: webinar.props.id,
        organizerId: webinar.props.organizerId,
        title: webinar.props.title,
        startDate: webinar.props.startDate,
        endDate: webinar.props.endDate,
        seats: webinar.props.seats,
      },
    });
  }

  async findById(id: string): Promise<Webinar | null> {
    const webinar = await this.prismaClient.webinar.findUnique({
      where: { id },
    });

    if (!webinar) return null;

    return new Webinar({
      id: webinar.id,
      organizerId: webinar.organizerId,
      title: webinar.title,
      startDate: webinar.startDate,
      endDate: webinar.endDate,
      seats: webinar.seats,
    });
  }

  async update(webinar: Webinar): Promise<void> {
    await this.prismaClient.webinar.update({
      where: { id: webinar.props.id },
      data: {
        title: webinar.props.title,
        startDate: webinar.props.startDate,
        endDate: webinar.props.endDate,
        seats: webinar.props.seats,
      },
    });
  }
}
