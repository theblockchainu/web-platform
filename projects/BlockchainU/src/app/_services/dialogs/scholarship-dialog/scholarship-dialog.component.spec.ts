import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScholarshipDialogComponent } from './scholarship-dialog.component';

describe('ScholarshipDialogComponent', () => {
  let component: ScholarshipDialogComponent;
  let fixture: ComponentFixture<ScholarshipDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScholarshipDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScholarshipDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
