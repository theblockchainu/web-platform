import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificateVerificationComponent } from './certificate-verification.component';

describe('CertificateVerificationComponent', () => {
  let component: CertificateVerificationComponent;
  let fixture: ComponentFixture<CertificateVerificationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CertificateVerificationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CertificateVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
