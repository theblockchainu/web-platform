import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleAccountPaymentmethodsComponent } from './console-account-paymentmethods.component';

describe('ConsoleAccountPaymentmethodsComponent', () => {
  let component: ConsoleAccountPaymentmethodsComponent;
  let fixture: ComponentFixture<ConsoleAccountPaymentmethodsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsoleAccountPaymentmethodsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsoleAccountPaymentmethodsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
