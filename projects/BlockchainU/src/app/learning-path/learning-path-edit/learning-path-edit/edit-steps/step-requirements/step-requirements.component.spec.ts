import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StepRequirementsComponent } from './step-requirements.component';

describe('StepRequirementsComponent', () => {
  let component: StepRequirementsComponent;
  let fixture: ComponentFixture<StepRequirementsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StepRequirementsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StepRequirementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
