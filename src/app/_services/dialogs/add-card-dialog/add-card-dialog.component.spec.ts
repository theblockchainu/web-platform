import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCardDialogComponent } from './add-card-dialog.component';

describe('AddCardDialogComponent', () => {
  let component: AddCardDialogComponent;
  let fixture: ComponentFixture<AddCardDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddCardDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCardDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
