import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StepMediaComponent } from './step-media.component';

describe('StepMediaComponent', () => {
  let component: StepMediaComponent;
  let fixture: ComponentFixture<StepMediaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StepMediaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StepMediaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
