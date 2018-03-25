import { TestBed, inject } from '@angular/core/testing';

import { CurrencyPickerService } from './currencypicker.service';

describe('CurrencyPickerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CurrencyPickerService]
    });
  });

  it('should be created', inject([CurrencyPickerService], (service: CurrencyPickerService) => {
    expect(service).toBeTruthy();
  }));
});
