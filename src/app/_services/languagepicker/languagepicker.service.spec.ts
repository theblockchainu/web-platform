import { TestBed, inject } from '@angular/core/testing';

import { LanguagePickerService } from './languagepicker.service';

describe('LanguagePickerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LanguagePickerService]
    });
  });

  it('should be created', inject([LanguagePickerService], (service: LanguagePickerService) => {
    expect(service).toBeTruthy();
  }));
});
