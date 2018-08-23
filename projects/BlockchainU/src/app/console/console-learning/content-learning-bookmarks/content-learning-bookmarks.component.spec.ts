import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentLearningBookmarksComponent } from './content-learning-bookmarks.component';

describe('ContentLearningBookmarksComponent', () => {
  let component: ContentLearningBookmarksComponent;
  let fixture: ComponentFixture<ContentLearningBookmarksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContentLearningBookmarksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentLearningBookmarksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
