import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddLocationDialogComponent } from './add-location-dialog.component';

describe('AddLocationDialogComponent', () => {
  let component: AddLocationDialogComponent;
  let fixture: ComponentFixture<AddLocationDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddLocationDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddLocationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
