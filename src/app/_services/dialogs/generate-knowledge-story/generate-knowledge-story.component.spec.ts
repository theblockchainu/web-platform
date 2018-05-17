import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateKnowledgeStoryComponent } from './generate-knowledge-story.component';

describe('GenerateKnowledgeStoryComponent', () => {
  let component: GenerateKnowledgeStoryComponent;
  let fixture: ComponentFixture<GenerateKnowledgeStoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GenerateKnowledgeStoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerateKnowledgeStoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
