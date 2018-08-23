import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeachingBenefitsComponent } from './teaching-benefits.component';

describe('TeachingBenefitsComponent', () => {
  let component: TeachingBenefitsComponent;
  let fixture: ComponentFixture<TeachingBenefitsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeachingBenefitsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeachingBenefitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
