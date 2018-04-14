import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkshopIntroComponent } from './workshop-intro.component';

describe('WorkshopIntroComponent', () => {
  let component: WorkshopIntroComponent;
  let fixture: ComponentFixture<WorkshopIntroComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkshopIntroComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkshopIntroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
