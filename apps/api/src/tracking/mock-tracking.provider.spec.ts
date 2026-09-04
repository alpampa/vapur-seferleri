import { Test, TestingModule } from '@nestjs/testing';
import { MockTrackingProvider } from './mock-tracking.provider';

describe('MockTrackingProvider', () => {
  let provider: MockTrackingProvider;
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [MockTrackingProvider],
    }).compile();

    provider = moduleRef.get<MockTrackingProvider>(MockTrackingProvider);
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  it('should return initial vessel positions', async () => {
    const positions = await provider.getPositions();
    expect(positions).toBeDefined();
    expect(positions.length).toBeGreaterThan(0);
    expect(positions[0]).toHaveProperty('vesselId');
    expect(positions[0]).toHaveProperty('latitude');
    expect(positions[0]).toHaveProperty('longitude');
  });
});
