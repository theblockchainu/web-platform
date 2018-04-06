import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageParticipantComponent } from './message-participant.component';

describe('MessageParticipantComponent', () => {
  let component: MessageParticipantComponent;
  let fixture: ComponentFixture<MessageParticipantComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MessageParticipantComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessageParticipantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
