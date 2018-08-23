
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmissionViewComponent } from './submission-view.component';

describe('SubmissionViewComponent', () => {
  let component: SubmissionViewComponent;
  let fixture: ComponentFixture<SubmissionViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubmissionViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubmissionViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
