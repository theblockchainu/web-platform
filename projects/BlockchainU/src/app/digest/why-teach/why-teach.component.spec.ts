import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WhyTeachComponent } from './why-teach.component';

describe('WhyTeachComponent', () => {
  let component: WhyTeachComponent;
  let fixture: ComponentFixture<WhyTeachComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WhyTeachComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WhyTeachComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
