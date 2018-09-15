import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GuideContentInpersonComponent } from './guide-content-inperson.component';

describe('GuideContentInpersonComponent', () => {
  let component: GuideContentInpersonComponent;
  let fixture: ComponentFixture<GuideContentInpersonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GuideContentInpersonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GuideContentInpersonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
