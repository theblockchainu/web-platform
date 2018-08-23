import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResponsibleTeachingComponent } from './responsible-teaching.component';

describe('ResponsibleTeachingComponent', () => {
  let component: ResponsibleTeachingComponent;
  let fixture: ComponentFixture<ResponsibleTeachingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResponsibleTeachingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResponsibleTeachingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
