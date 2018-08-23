import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunityPageExperiencesComponent } from './community-page-experiences.component';

describe('CommunityPageExperiencesComponent', () => {
  let component: CommunityPageExperiencesComponent;
  let fixture: ComponentFixture<CommunityPageExperiencesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommunityPageExperiencesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommunityPageExperiencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
