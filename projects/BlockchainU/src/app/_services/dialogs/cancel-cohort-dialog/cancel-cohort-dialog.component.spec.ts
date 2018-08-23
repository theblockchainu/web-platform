import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelCohortDialogComponent } from './cancel-cohort-dialog.component';

describe('CancelCohortDialogComponent', () => {
  let component: CancelCohortDialogComponent;
  let fixture: ComponentFixture<CancelCohortDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CancelCohortDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CancelCohortDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
