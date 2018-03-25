import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleAccountNotificationsComponent } from './console-account-notifications.component';

describe('ConsoleAccountNotificationsComponent', () => {
  let component: ConsoleAccountNotificationsComponent;
  let fixture: ComponentFixture<ConsoleAccountNotificationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsoleAccountNotificationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsoleAccountNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
