// Tests unitaires
import { ChangeSeats } from 'src/webinars/use-cases/change-seats';
import { InMemoryWebinarRepository } from 'src/webinars/adapters/webinar-repository.in-memory';
import { Webinar } from 'src/webinars/entities/webinar.entity';
import { User } from 'src/users/entities/user.entity';
import { WebinarNotFoundException } from 'src/webinars/exceptions/webinar-not-found';
import { WebinarNotOrganizerException } from 'src/webinars/exceptions/webinar-not-organizer';
import { WebinarReduceSeatsException } from 'src/webinars/exceptions/webinar-reduce-seats';
import { WebinarTooManySeatsException } from 'src/webinars/exceptions/webinar-too-many-seats';

describe('Feature: Change seats', () => {
  let webinarRepository: InMemoryWebinarRepository;
  let useCase: ChangeSeats;

  const organizer = new User({
    id: 'organizer-1',
    email: 'organizer@example.com',
    password: 'password123',
  });

  const webinar = new Webinar({
    id: 'webinar-1',
    organizerId: organizer.props.id,
    title: 'My Webinar',
    startDate: new Date('2024-01-10T10:00:00.000Z'),
    endDate: new Date('2024-01-10T11:00:00.000Z'),
    seats: 100,
  });

  beforeEach(() => {
    webinarRepository = new InMemoryWebinarRepository([webinar]);
    useCase = new ChangeSeats(webinarRepository);
  });

  describe('Scenario: Happy path', () => {
    it('should change the number of seats for a webinar', async () => {
      const payload = {
        user: organizer,
        webinarId: 'webinar-1',
        seats: 200,
      };

      await useCase.execute(payload);

      const updatedWebinar = await webinarRepository.findById('webinar-1');
      expect(updatedWebinar?.props.seats).toBe(200);
    });
  });

  describe('Scenario: Webinar not found', () => {
    it('should throw an error', async () => {
      const payload = {
        user: organizer,
        webinarId: 'non-existent-webinar',
        seats: 200,
      };

      await expect(useCase.execute(payload)).rejects.toThrow(
        WebinarNotFoundException,
      );
    });
  });

  describe('Scenario: User is not the organizer', () => {
    it('should throw an error', async () => {
      const nonOrganizer = new User({
        id: 'user-2',
        email: 'user2@example.com',
        password: 'password123',
      });

      const payload = {
        user: nonOrganizer,
        webinarId: 'webinar-1',
        seats: 200,
      };

      await expect(useCase.execute(payload)).rejects.toThrow(
        WebinarNotOrganizerException,
      );
    });
  });

  describe('Scenario: Reduce the number of seats', () => {
    it('should throw an error', async () => {
      const payload = {
        user: organizer,
        webinarId: 'webinar-1',
        seats: 50,
      };

      await expect(useCase.execute(payload)).rejects.toThrow(
        WebinarReduceSeatsException,
      );
    });
  });

  describe('Scenario: Too many seats', () => {
    it('should throw an error', async () => {
      const payload = {
        user: organizer,
        webinarId: 'webinar-1',
        seats: 1001,
      };

      await expect(useCase.execute(payload)).rejects.toThrow(
        WebinarTooManySeatsException,
      );
    });
  });
});
