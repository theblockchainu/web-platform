import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SeeDatesWorkshopComponent } from './see-dates-workshop.component';

describe('SeeDatesWorkshopComponent', () => {
  let component: SeeDatesWorkshopComponent;
  let fixture: ComponentFixture<SeeDatesWorkshopComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SeeDatesWorkshopComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SeeDatesWorkshopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
