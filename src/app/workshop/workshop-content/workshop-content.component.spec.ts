import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkshopContentComponent } from './workshop-content.component';

describe('WorkshopContentComponent', () => {
  let component: WorkshopContentComponent;
  let fixture: ComponentFixture<WorkshopContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkshopContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkshopContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
