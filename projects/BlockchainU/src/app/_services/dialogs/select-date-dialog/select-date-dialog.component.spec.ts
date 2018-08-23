import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectDateDialogComponent } from './select-date-dialog.component';

describe('SelectDateDialogComponent', () => {
  let component: SelectDateDialogComponent;
  let fixture: ComponentFixture<SelectDateDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectDateDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectDateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
