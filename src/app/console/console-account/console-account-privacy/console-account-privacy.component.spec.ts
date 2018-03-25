import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleAccountPrivacyComponent } from './console-account-privacy.component';

describe('ConsoleAccountPrivacyComponent', () => {
  let component: ConsoleAccountPrivacyComponent;
  let fixture: ComponentFixture<ConsoleAccountPrivacyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsoleAccountPrivacyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsoleAccountPrivacyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
