import { PeerCardModule } from './peer-card.module';

describe('PeerCardModule', () => {
  let peerCardModule: PeerCardModule;

  beforeEach(() => {
    peerCardModule = new PeerCardModule();
  });

  it('should create an instance', () => {
    expect(peerCardModule).toBeTruthy();
  });
});
