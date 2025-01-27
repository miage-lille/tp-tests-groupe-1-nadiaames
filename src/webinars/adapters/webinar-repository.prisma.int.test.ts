// Test d'intégration
// C. Ecriture de notre premier test d'intégration
import { PrismaClient } from '@prisma/client';
import { PrismaWebinarRepository } from './webinar-repository.prisma';
import { Webinar } from '../entities/webinar.entity';

describe('Feature: PrismaWebinarRepository', () => {
  let prismaClient: PrismaClient;
  let webinarRepository: PrismaWebinarRepository;

  const webinar = new Webinar({
    id: 'webinar-id',
    organizerId: 'organizer-id',
    title: 'Webinar title',
    startDate: new Date('2024-01-01T00:00:00Z'),
    endDate: new Date('2024-01-01T01:00:00Z'),
    seats: 100,
  });

  beforeEach(async () => {
    prismaClient = new PrismaClient();
    webinarRepository = new PrismaWebinarRepository(prismaClient);

    // Nettoyer la base de données avant chaque test
    await prismaClient.webinar.deleteMany();
  });

  afterEach(async () => {
    await prismaClient.$disconnect();
  });

  describe('Scenario: Save and find a webinar', () => {
    it('should save and retrieve a webinar', async () => {
      // Act
      await webinarRepository.create(webinar);
      const foundWebinar = await webinarRepository.findById('webinar-id');

      // Assert
      expect(foundWebinar?.props).toEqual(webinar.initialState);
    });
  });

  describe('Scenario: Update a webinar', () => {
    it('should update the webinar', async () => {
      // Arrange
      await webinarRepository.create(webinar);
      webinar.update({ seats: 200 });

      // Act
      await webinarRepository.update(webinar);
      const updatedWebinar = await webinarRepository.findById('webinar-id');

      // Assert
      expect(updatedWebinar?.props.seats).toEqual(200);
    });
  });
});
