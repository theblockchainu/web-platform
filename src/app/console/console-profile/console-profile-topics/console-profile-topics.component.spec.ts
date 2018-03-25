import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleProfileTopicsComponent } from './console-profile-topics.component';

describe('ConsoleProfileTopicsComponent', () => {
  let component: ConsoleProfileTopicsComponent;
  let fixture: ComponentFixture<ConsoleProfileTopicsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsoleProfileTopicsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsoleProfileTopicsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
