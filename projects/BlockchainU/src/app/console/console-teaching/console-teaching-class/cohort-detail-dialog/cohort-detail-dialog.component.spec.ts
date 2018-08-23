import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CohortDetailDialogComponent } from './cohort-detail-dialog.component';

describe('CohortDetailDialogComponent', () => {
  let component: CohortDetailDialogComponent;
  let fixture: ComponentFixture<CohortDetailDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CohortDetailDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CohortDetailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
