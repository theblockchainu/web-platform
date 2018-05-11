import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SholarshipPageComponent } from './sholarship-page.component';

describe('SholarshipPageComponent', () => {
  let component: SholarshipPageComponent;
  let fixture: ComponentFixture<SholarshipPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SholarshipPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SholarshipPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
