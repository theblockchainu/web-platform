import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleTeachingWorkshopComponent } from './console-teaching-workshop.component';

describe('ConsoleTeachingWorkshopComponent', () => {
  let component: ConsoleTeachingWorkshopComponent;
  let fixture: ComponentFixture<ConsoleTeachingWorkshopComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsoleTeachingWorkshopComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsoleTeachingWorkshopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
