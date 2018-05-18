import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleAccountKnowledgeStoryComponent } from './console-account-knowledge-story.component';

describe('ConsoleAccountKnowledgeStoryComponent', () => {
  let component: ConsoleAccountKnowledgeStoryComponent;
  let fixture: ComponentFixture<ConsoleAccountKnowledgeStoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsoleAccountKnowledgeStoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsoleAccountKnowledgeStoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
