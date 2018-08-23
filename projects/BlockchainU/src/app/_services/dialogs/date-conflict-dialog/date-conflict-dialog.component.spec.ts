import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DateConflictDialogComponent } from './date-conflict-dialog.component';

describe('DateConflictDialogComponent', () => {
  let component: DateConflictDialogComponent;
  let fixture: ComponentFixture<DateConflictDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DateConflictDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DateConflictDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
