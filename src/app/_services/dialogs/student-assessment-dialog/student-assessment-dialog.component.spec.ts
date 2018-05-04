import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentAssessmentDialogComponent } from './student-assessment-dialog.component';

describe('StudentAssessmentDialogComponent', () => {
  let component: StudentAssessmentDialogComponent;
  let fixture: ComponentFixture<StudentAssessmentDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentAssessmentDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentAssessmentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
