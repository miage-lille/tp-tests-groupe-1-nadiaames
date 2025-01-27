import supertest from 'supertest';
import { TestServerFixture } from 'src/tests/fixtures';

describe('Webinar Routes E2E', () => {
  let fixture: TestServerFixture;

  beforeAll(async () => {
    fixture = new TestServerFixture();
    await fixture.init();
  });

  beforeEach(async () => {
    await fixture.reset();
  });

  afterAll(async () => {
    await fixture.stop();
  });

  it('should update webinar seats', async () => {
    const prisma = fixture.getPrismaClient();
    const server = fixture.getServer();

    const webinar = await prisma.webinar.create({
      data: {
        id: 'test-webinar',
        title: 'Webinar Test',
        seats: 10,
        startDate: new Date(),
        endDate: new Date(),
        organizerId: 'test-user',
      },
    });

    const response = await supertest(server)
      .post(`/webinars/${webinar.id}/seats`)
      .send({ seats: '30' })
      .expect(200);

    expect(response.body).toEqual({ message: 'Seats updated' });

    const updatedWebinar = await prisma.webinar.findUnique({
      where: { id: webinar.id },
    });
    expect(updatedWebinar?.seats).toBe(30);
  });

  it('should return 404 if webinar is not found', async () => {
    const server = fixture.getServer();

    const response = await supertest(server)
      .post(`/webinars/webinar-non-existant/seats`)
      .send({ seats: '30' })
      .expect(404);

    expect(response.body).toEqual({
      error: 'Webinar not found',
    });
  });

  it('should return 403 if user is not the organizer', async () => {
    const prisma = fixture.getPrismaClient();
    const server = fixture.getServer();

    const webinar = await prisma.webinar.create({
      data: {
        id: 'test-webinar',
        title: 'Webinar Test',
        seats: 10,
        startDate: new Date(),
        endDate: new Date(),
        organizerId: 'organizer-user',
      },
    });

    const response = await supertest(server)
      .post(`/webinars/${webinar.id}/seats`)
      // User is not the organizer
      .send({ seats: 30 })
      .expect(401);

    expect(response.body).toEqual({
      error: 'User is not allowed to update this webinar',
    });
  });
});
