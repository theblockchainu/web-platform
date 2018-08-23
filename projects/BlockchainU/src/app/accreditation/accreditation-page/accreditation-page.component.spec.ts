import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccreditationPageComponent } from './accreditation-page.component';

describe('AccreditationPageComponent', () => {
  let component: AccreditationPageComponent;
  let fixture: ComponentFixture<AccreditationPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccreditationPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccreditationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
