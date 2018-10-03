import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmissionReviewDialogComponent } from './submission-review-dialog.component';

describe('SubmissionReviewDialogComponent', () => {
  let component: SubmissionReviewDialogComponent;
  let fixture: ComponentFixture<SubmissionReviewDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubmissionReviewDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubmissionReviewDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
