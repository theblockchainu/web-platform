import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LabCredentialsComponent } from './lab-credentials.component';

describe('LabCredentialsComponent', () => {
  let component: LabCredentialsComponent;
  let fixture: ComponentFixture<LabCredentialsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LabCredentialsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LabCredentialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
