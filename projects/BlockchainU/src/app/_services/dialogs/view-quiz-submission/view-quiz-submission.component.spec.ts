import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewQuizSubmissionComponent } from './view-quiz-submission.component';

describe('ViewQuizSubmissionComponent', () => {
  let component: ViewQuizSubmissionComponent;
  let fixture: ComponentFixture<ViewQuizSubmissionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewQuizSubmissionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewQuizSubmissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
