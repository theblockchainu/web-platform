import { TestBed, inject } from '@angular/core/testing';

import { MediaUploaderService } from './media-uploader.service';

describe('MediaUploaderService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MediaUploaderService]
    });
  });

  it('should be created', inject([MediaUploaderService], (service: MediaUploaderService) => {
    expect(service).toBeTruthy();
  }));
});
