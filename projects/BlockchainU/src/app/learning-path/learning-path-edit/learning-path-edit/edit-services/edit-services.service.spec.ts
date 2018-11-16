import { TestBed, inject } from '@angular/core/testing';

import { EditServicesService } from './edit-services.service';

describe('EditServicesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EditServicesService]
    });
  });

  it('should be created', inject([EditServicesService], (service: EditServicesService) => {
    expect(service).toBeTruthy();
  }));
});