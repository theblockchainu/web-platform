import { TestBed, inject } from '@angular/core/testing';

import { RequestHeaderService } from './request-header.service';

describe('RequestHeaderService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RequestHeaderService]
    });
  });

  it('should be created', inject([RequestHeaderService], (service: RequestHeaderService) => {
    expect(service).toBeTruthy();
  }));
});
