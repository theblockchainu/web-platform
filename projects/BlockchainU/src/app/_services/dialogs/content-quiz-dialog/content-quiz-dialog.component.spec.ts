import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentQuizDialogComponent } from './content-quiz-dialog.component';

describe('ContentQuizDialogComponent', () => {
  let component: ContentQuizDialogComponent;
  let fixture: ComponentFixture<ContentQuizDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContentQuizDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentQuizDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
