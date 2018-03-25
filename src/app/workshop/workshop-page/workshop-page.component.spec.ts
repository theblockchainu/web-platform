import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkshopPageComponent } from './workshop-page.component';

describe('WorkshopPageComponent', () => {
  let component: WorkshopPageComponent;
  let fixture: ComponentFixture<WorkshopPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkshopPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkshopPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
