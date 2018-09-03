import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddParticipantDialogComponent } from './add-participant-dialog.component';

describe('AddParticipantDialogComponent', () => {
  let component: AddParticipantDialogComponent;
  let fixture: ComponentFixture<AddParticipantDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddParticipantDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddParticipantDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
