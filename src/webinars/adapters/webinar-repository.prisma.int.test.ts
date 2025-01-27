// Test d'intégration
// C. Ecriture de notre premier test d'intégration
import { PrismaClient } from '@prisma/client';
import { PrismaWebinarRepository } from 'src/webinars/adapters/webinar-repository.prisma';
import { Webinar } from 'src/webinars/entities/webinar.entity';

describe('PrismaWebinarRepository', () => {
  let prismaClient: PrismaClient;
  let webinarRepository: PrismaWebinarRepository;

  beforeAll(async () => {
    prismaClient = new PrismaClient();
    await prismaClient.$connect();
    webinarRepository = new PrismaWebinarRepository(prismaClient);
  });

  afterAll(async () => {
    await prismaClient.$disconnect();
  });

  beforeEach(async () => {
    await prismaClient.webinar.deleteMany();
  });

  it('should create a webinar', async () => {
    const webinar = new Webinar({
      id: 'webinar-1',
      organizerId: 'organizer-1',
      title: 'My Webinar',
      startDate: new Date('2024-01-10T10:00:00.000Z'),
      endDate: new Date('2024-01-10T11:00:00.000Z'),
      seats: 100,
    });

    await webinarRepository.create(webinar);

    const createdWebinar = await prismaClient.webinar.findUnique({
      where: { id: 'webinar-1' },
    });
    expect(createdWebinar).toEqual({
      id: 'webinar-1',
      organizerId: 'organizer-1',
      title: 'My Webinar',
      startDate: new Date('2024-01-10T10:00:00.000Z'),
      endDate: new Date('2024-01-10T11:00:00.000Z'),
      seats: 100,
    });
  });

  it('should find a webinar by id', async () => {
    await prismaClient.webinar.create({
      data: {
        id: 'webinar-1',
        organizerId: 'organizer-1',
        title: 'My Webinar',
        startDate: new Date('2024-01-10T10:00:00.000Z'),
        endDate: new Date('2024-01-10T11:00:00.000Z'),
        seats: 100,
      },
    });

    const webinar = await webinarRepository.findById('webinar-1');
    expect(webinar).toBeInstanceOf(Webinar);
    expect(webinar?.props).toEqual({
      id: 'webinar-1',
      organizerId: 'organizer-1',
      title: 'My Webinar',
      startDate: new Date('2024-01-10T10:00:00.000Z'),
      endDate: new Date('2024-01-10T11:00:00.000Z'),
      seats: 100,
    });
  });

  it('should update a webinar', async () => {
    await prismaClient.webinar.create({
      data: {
        id: 'webinar-1',
        organizerId: 'organizer-1',
        title: 'My Webinar',
        startDate: new Date('2024-01-10T10:00:00.000Z'),
        endDate: new Date('2024-01-10T11:00:00.000Z'),
        seats: 100,
      },
    });

    const webinar = new Webinar({
      id: 'webinar-1',
      organizerId: 'organizer-1',
      title: 'My Webinar Updated',
      startDate: new Date('2024-01-10T10:00:00.000Z'),
      endDate: new Date('2024-01-10T11:00:00.000Z'),
      seats: 200,
    });

    await webinarRepository.update(webinar);

    const updatedWebinar = await prismaClient.webinar.findUnique({
      where: { id: 'webinar-1' },
    });
    expect(updatedWebinar).toEqual({
      id: 'webinar-1',
      organizerId: 'organizer-1',
      title: 'My Webinar Updated',
      startDate: new Date('2024-01-10T10:00:00.000Z'),
      endDate: new Date('2024-01-10T11:00:00.000Z'),
      seats: 200,
    });
  });
});
