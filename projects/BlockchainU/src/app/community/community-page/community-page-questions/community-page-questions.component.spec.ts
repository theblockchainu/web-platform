import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunityPageQuestionsComponent } from './community-page-questions.component';

describe('CommunityPageQuestionsComponent', () => {
  let component: CommunityPageQuestionsComponent;
  let fixture: ComponentFixture<CommunityPageQuestionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommunityPageQuestionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommunityPageQuestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
