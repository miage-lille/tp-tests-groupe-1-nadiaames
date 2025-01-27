import { FastifyInstance } from 'fastify';
import { AppContainer } from 'src/container';
import { webinarRoutes } from 'src/webinars/routes';
import { buildFastifyApp } from 'src/shared/fastify-app';
import { PrismaClient } from '@prisma/client';

describe('Webinar Routes', () => {
  let app: FastifyInstance;
  let container: AppContainer;

  beforeAll(async () => {
    container = new AppContainer();
    const prismaClient = new PrismaClient();
    await prismaClient.$connect();
    container.init(prismaClient);

    app = buildFastifyApp();
    app.register((app, opts, done) => {
      webinarRoutes(app, opts);
      done();
    }, container);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    await container.getPrismaClient().$disconnect();
  });

  beforeEach(async () => {
    await container.getPrismaClient().webinar.deleteMany();
  });

  it('should change the number of seats', async () => {
    await container.getPrismaClient().webinar.create({
      data: {
        id: 'webinar-1',
        organizerId: 'test-user',
        title: 'My Webinar',
        startDate: new Date('2024-01-10T10:00:00.000Z'),
        endDate: new Date('2024-01-10T11:00:00.000Z'),
        seats: 100,
      },
    });

    const response = await app.inject({
      method: 'POST',
      url: '/webinars/webinar-1/seats',
      payload: { seats: '200' },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ message: 'Seats updated' });

    const updatedWebinar = await container
      .getPrismaClient()
      .webinar.findUnique({ where: { id: 'webinar-1' } });
    expect(updatedWebinar?.seats).toBe(200);
  });

  it('should return 404 if webinar not found', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/webinars/non-existent-webinar/seats',
      payload: { seats: '200' },
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      error: 'Webinar not found',
    });
  });

  it('should return 401 if user is not the organizer', async () => {
    await container.getPrismaClient().webinar.create({
      data: {
        id: 'webinar-1',
        organizerId: 'another-user',
        title: 'My Webinar',
        startDate: new Date('2024-01-10T10:00:00.000Z'),
        endDate: new Date('2024-01-10T11:00:00.000Z'),
        seats: 100,
      },
    });

    const response = await app.inject({
      method: 'POST',
      url: '/webinars/webinar-1/seats',
      payload: { seats: '200' },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      error: 'User is not allowed to update this webinar',
    });
  });
});
