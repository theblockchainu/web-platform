import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleTeachingSessionComponent } from './console-teaching-session.component';

describe('ConsoleTeachingSessionComponent', () => {
  let component: ConsoleTeachingSessionComponent;
  let fixture: ComponentFixture<ConsoleTeachingSessionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsoleTeachingSessionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsoleTeachingSessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
