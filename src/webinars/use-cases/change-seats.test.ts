import { ChangeSeats } from './change-seats';
import { InMemoryWebinarRepository } from '../adapters/webinar-repository.in-memory';
import { Webinar } from '../entities/webinar.entity';
import { User } from 'src/users/entities/user.entity';
import { WebinarNotFoundException } from '../exceptions/webinar-not-found';
import { WebinarNotOrganizerException } from '../exceptions/webinar-not-organizer';
import { WebinarReduceSeatsException } from '../exceptions/webinar-reduce-seats';
import { WebinarTooManySeatsException } from '../exceptions/webinar-too-many-seats';

describe('Feature: Change seats', () => {
  let webinarRepository: InMemoryWebinarRepository;
  let useCase: ChangeSeats;

  const testUser = {
    alice: new User({
      id: 'alice-id',
      email: 'alice@test.com',
      password: 'fake',
    }),
    bob: new User({
      id: 'bob-id',
      email: 'bob@test.com',
      password: 'fake',
    }),
  };

  const webinar = new Webinar({
    id: 'webinar-id',
    organizerId: testUser.alice.props.id,
    title: 'Webinar title',
    startDate: new Date('2024-01-01T00:00:00Z'),
    endDate: new Date('2024-01-01T01:00:00Z'),
    seats: 100,
  });

  beforeEach(() => {
    webinarRepository = new InMemoryWebinarRepository([webinar]);
    useCase = new ChangeSeats(webinarRepository);
  });

  describe('Scenario: Happy path', () => {
    const payload = {
      user: testUser.alice,
      webinarId: 'webinar-id',
      seats: 200,
    };

    it('should change the number of seats for a webinar', async () => {
      await useCase.execute(payload);
      const updatedWebinar = await webinarRepository.findById('webinar-id');
      expect(updatedWebinar?.props.seats).toEqual(200);
    });
  });

  describe('Scenario: Webinar not found', () => {
    const payload = {
      user: testUser.alice,
      webinarId: 'unknown-id',
      seats: 200,
    };

    it('should throw WebinarNotFoundException', async () => {
      await expect(useCase.execute(payload)).rejects.toThrow(
        WebinarNotFoundException,
      );
    });
  });

  describe('Scenario: User is not the organizer', () => {
    const payload = {
      user: testUser.bob,
      webinarId: 'webinar-id',
      seats: 200,
    };

    it('should throw WebinarNotOrganizerException', async () => {
      await expect(useCase.execute(payload)).rejects.toThrow(
        WebinarNotOrganizerException,
      );
    });
  });

  describe('Scenario: Reduce the number of seats', () => {
    const payload = {
      user: testUser.alice,
      webinarId: 'webinar-id',
      seats: 50,
    };

    it('should throw WebinarReduceSeatsException', async () => {
      await expect(useCase.execute(payload)).rejects.toThrow(
        WebinarReduceSeatsException,
      );
    });
  });

  describe('Scenario: Set too many seats', () => {
    const payload = {
      user: testUser.alice,
      webinarId: 'webinar-id',
      seats: 2000,
    };

    it('should throw WebinarTooManySeatsException', async () => {
      await expect(useCase.execute(payload)).rejects.toThrow(
        WebinarTooManySeatsException,
      );
    });
  });
});
