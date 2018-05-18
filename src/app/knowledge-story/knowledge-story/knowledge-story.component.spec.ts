import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KnowledgeStoryComponent } from './knowledge-story.component';

describe('KnowledgeStoryComponent', () => {
  let component: KnowledgeStoryComponent;
  let fixture: ComponentFixture<KnowledgeStoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KnowledgeStoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KnowledgeStoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
