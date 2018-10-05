import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleLearningBountiesComponent } from './console-learning-bounties.component';

describe('ConsoleLearningBountiesComponent', () => {
  let component: ConsoleLearningBountiesComponent;
  let fixture: ComponentFixture<ConsoleLearningBountiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsoleLearningBountiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsoleLearningBountiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
