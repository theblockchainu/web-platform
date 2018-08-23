import { TestBed, inject } from '@angular/core/testing';

import { TwilioServicesService } from './twilio-services.service';

describe('TwilioServicesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TwilioServicesService]
    });
  });

  it('should be created', inject([TwilioServicesService], (service: TwilioServicesService) => {
    expect(service).toBeTruthy();
  }));
});
