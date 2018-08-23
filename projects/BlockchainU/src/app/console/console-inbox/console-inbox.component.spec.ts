import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleInboxComponent } from './console-inbox.component';

describe('ConsoleInboxComponent', () => {
  let component: ConsoleInboxComponent;
  let fixture: ComponentFixture<ConsoleInboxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsoleInboxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsoleInboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
