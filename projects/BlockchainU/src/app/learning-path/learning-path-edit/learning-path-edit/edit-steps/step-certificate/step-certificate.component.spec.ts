import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StepCertificateComponent } from './step-certificate.component';

describe('StepCertificateComponent', () => {
  let component: StepCertificateComponent;
  let fixture: ComponentFixture<StepCertificateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StepCertificateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StepCertificateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
