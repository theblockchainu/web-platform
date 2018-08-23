import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RateParticipantComponent } from './rate-participant-dialog.component';

describe('RateParticipantComponent', () => {
  let component: RateParticipantComponent;
  let fixture: ComponentFixture<RateParticipantComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RateParticipantComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RateParticipantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
