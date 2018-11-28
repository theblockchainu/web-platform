import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CcavenuePaymentComponent } from './ccavenue-payment.component';

describe('CcavenuePaymentComponent', () => {
  let component: CcavenuePaymentComponent;
  let fixture: ComponentFixture<CcavenuePaymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CcavenuePaymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CcavenuePaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
