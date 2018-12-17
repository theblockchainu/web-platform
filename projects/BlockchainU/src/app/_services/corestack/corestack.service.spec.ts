import { TestBed, inject } from '@angular/core/testing';

import { CorestackService } from './corestack.service';

describe('CorestackService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CorestackService]
    });
  });

  it('should be created', inject([CorestackService], (service: CorestackService) => {
    expect(service).toBeTruthy();
  }));
});
