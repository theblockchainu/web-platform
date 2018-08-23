import { TestBed, inject } from '@angular/core/testing';

import { KnowledgeStoryService } from './knowledge-story.service';

describe('KnowledgeStoryService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [KnowledgeStoryService]
    });
  });

  it('should be created', inject([KnowledgeStoryService], (service: KnowledgeStoryService) => {
    expect(service).toBeTruthy();
  }));
});
