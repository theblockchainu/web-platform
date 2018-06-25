import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomCertificateFormComponent } from './custom-certificate-form.component';

describe('CustomCertificateFormComponent', () => {
  let component: CustomCertificateFormComponent;
  let fixture: ComponentFixture<CustomCertificateFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomCertificateFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomCertificateFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
