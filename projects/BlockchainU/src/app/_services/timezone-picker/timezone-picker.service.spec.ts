import { TestBed, inject } from '@angular/core/testing';

import { TimezonePickerService } from './timezone-picker.service';

describe('TimezonePickerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TimezonePickerService]
    });
  });

  it('should be created', inject([TimezonePickerService], (service: TimezonePickerService) => {
    expect(service).toBeTruthy();
  }));
});
