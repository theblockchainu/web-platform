import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportProfileComponent } from './report-profile.component';

describe('ReportProfileComponent', () => {
  let component: ReportProfileComponent;
  let fixture: ComponentFixture<ReportProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
