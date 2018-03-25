import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleProfileVerificationComponent } from './console-profile-verification.component';

describe('ConsoleProfileVerificationComponent', () => {
  let component: ConsoleProfileVerificationComponent;
  let fixture: ComponentFixture<ConsoleProfileVerificationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsoleProfileVerificationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsoleProfileVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
