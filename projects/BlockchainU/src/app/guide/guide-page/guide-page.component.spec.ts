import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GuidePageComponent } from './guide-page.component';

describe('GuidePageComponent', () => {
  let component: GuidePageComponent;
  let fixture: ComponentFixture<GuidePageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GuidePageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GuidePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
