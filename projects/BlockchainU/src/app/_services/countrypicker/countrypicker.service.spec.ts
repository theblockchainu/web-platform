import { TestBed, inject } from '@angular/core/testing';

import { CountryPickerService } from './countrypicker.service';

describe('CountryPickerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CountryPickerService]
    });
  });

  it('should be created', inject([CountryPickerService], (service: CountryPickerService) => {
    expect(service).toBeTruthy();
  }));
});
