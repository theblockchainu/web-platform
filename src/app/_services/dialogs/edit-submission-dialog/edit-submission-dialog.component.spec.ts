import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSubmissionDialogComponent } from './edit-submission-dialog.component';

describe('EditSubmissionDialogComponent', () => {
  let component: EditSubmissionDialogComponent;
  let fixture: ComponentFixture<EditSubmissionDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditSubmissionDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditSubmissionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
