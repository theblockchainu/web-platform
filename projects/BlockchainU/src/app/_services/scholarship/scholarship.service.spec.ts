import { TestBed, inject } from '@angular/core/testing';

import { ScholarshipService } from './scholarship.service';

describe('ScholarshipService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ScholarshipService]
    });
  });

  it('should be created', inject([ScholarshipService], (service: ScholarshipService) => {
    expect(service).toBeTruthy();
  }));
});
