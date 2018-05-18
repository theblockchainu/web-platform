import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestKnowledgeStoryComponent } from './request-knowledge-story.component';

describe('RequestKnowledgeStoryComponent', () => {
  let component: RequestKnowledgeStoryComponent;
  let fixture: ComponentFixture<RequestKnowledgeStoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RequestKnowledgeStoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestKnowledgeStoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
