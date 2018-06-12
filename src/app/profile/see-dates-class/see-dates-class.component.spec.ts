import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SeeDatesClassComponent } from './see-dates-class.component';

describe('SeeDatesClassComponent', () => {
  let component: SeeDatesClassComponent;
  let fixture: ComponentFixture<SeeDatesClassComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SeeDatesClassComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SeeDatesClassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
