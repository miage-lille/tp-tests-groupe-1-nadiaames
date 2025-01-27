import fastify, { FastifyInstance } from 'fastify';
import { webinarRoutes } from './routes';
import { container } from 'src/container';
import { PrismaClient } from '@prisma/client';
import { Webinar } from 'src/webinars/entities/webinar.entity';
import { User } from 'src/users/entities/user.entity';

describe('Feature: Webinar routes', () => {
  let app: FastifyInstance;
  let prismaClient: PrismaClient;

  const testUser = new User({
    id: 'test-user',
    email: 'test@test.com',
    password: 'fake',
  });

  const testWebinar = new Webinar({
    id: 'webinar-id',
    organizerId: testUser.props.id,
    title: 'Webinar title',
    startDate: new Date('2024-01-01T00:00:00Z'),
    endDate: new Date('2024-01-01T01:00:00Z'),
    seats: 100,
  });

  beforeAll(async () => {
    prismaClient = new PrismaClient();
    container.init(prismaClient);

    app = fastify();
    app.register(webinarRoutes, container);
    await app.ready();

    await prismaClient.webinar.deleteMany();
  });

  beforeEach(async () => {
    await prismaClient.webinar.deleteMany();
  });

  afterAll(async () => {
    await prismaClient.$disconnect();
    await app.close();
  });

  describe('Scenario: Change seats', () => {
    it('should return 200 when seats are updated', async () => {
      await prismaClient.webinar.create({
        data: {
          id: testWebinar.props.id,
          title: testWebinar.props.title,
          startDate: testWebinar.props.startDate,
          endDate: testWebinar.props.endDate,
          seats: testWebinar.props.seats,
          organizerId: testWebinar.props.organizerId,
        },
      });

      const response = await app.inject({
        method: 'POST',
        url: `/webinars/${testWebinar.props.id}/seats`,
        payload: { seats: '200' },
      });

      expect(response.statusCode).toEqual(200);
      expect(response.json()).toEqual({ message: 'Seats updated' });

      const updatedWebinar = await prismaClient.webinar.findUnique({
        where: { id: testWebinar.props.id },
      });
      expect(updatedWebinar?.seats).toEqual(200);
    });

    it('should return 404 when webinar is not found', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/webinars/unknown-id/seats',
        payload: { seats: '200' },
      });

      expect(response.statusCode).toEqual(404);
      expect(response.json()).toEqual({
        error: 'Webinar not found',
      });
    });

    it('should return 401 when user is not the organizer', async () => {
      await prismaClient.webinar.create({
        data: {
          id: testWebinar.props.id,
          title: testWebinar.props.title,
          startDate: testWebinar.props.startDate,
          endDate: testWebinar.props.endDate,
          seats: testWebinar.props.seats,
          organizerId: 'another-organizer-id', // Another organizer
        },
      });

      const response = await app.inject({
        method: 'POST',
        url: `/webinars/${testWebinar.props.id}/seats`,
        payload: { seats: '200' },
      });

      expect(response.statusCode).toEqual(401);
      expect(response.json()).toEqual({
        error: 'User is not allowed to update this webinar',
      });
    });
  });
});
