import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleAccountSecurityComponent } from './console-account-security.component';

describe('ConsoleAccountSecurityComponent', () => {
  let component: ConsoleAccountSecurityComponent;
  let fixture: ComponentFixture<ConsoleAccountSecurityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsoleAccountSecurityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsoleAccountSecurityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
