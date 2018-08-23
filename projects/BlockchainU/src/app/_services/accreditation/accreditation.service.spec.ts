import { TestBed, inject } from '@angular/core/testing';

import { AccreditationService } from './accreditation.service';

describe('AccreditationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AccreditationService]
    });
  });

  it('should be created', inject([AccreditationService], (service: AccreditationService) => {
    expect(service).toBeTruthy();
  }));
});
