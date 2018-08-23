import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunityPageLinksComponent } from './community-page-links.component';

describe('CommunityPageLinksComponent', () => {
  let component: CommunityPageLinksComponent;
  let fixture: ComponentFixture<CommunityPageLinksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommunityPageLinksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommunityPageLinksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
