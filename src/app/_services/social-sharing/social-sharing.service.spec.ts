import { TestBed, inject } from '@angular/core/testing';

import { SocialSharingService } from './social-sharing.service';

describe('SocialSharingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SocialSharingService]
    });
  });

  it('should be created', inject([SocialSharingService], (service: SocialSharingService) => {
    expect(service).toBeTruthy();
  }));
});
