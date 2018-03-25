import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleProfileReviewsComponent } from './console-profile-reviews.component';

describe('ConsoleProfileReviewsComponent', () => {
  let component: ConsoleProfileReviewsComponent;
  let fixture: ComponentFixture<ConsoleProfileReviewsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsoleProfileReviewsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsoleProfileReviewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
