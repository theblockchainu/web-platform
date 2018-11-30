import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessSessionPaymentComponent } from './process-session-payment.component';

describe('ProcessSessionPaymentComponent', () => {
  let component: ProcessSessionPaymentComponent;
  let fixture: ComponentFixture<ProcessSessionPaymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcessSessionPaymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessSessionPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
