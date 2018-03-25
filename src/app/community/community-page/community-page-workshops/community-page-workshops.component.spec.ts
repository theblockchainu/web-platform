import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunityPageWorkshopsComponent } from './community-page-workshops.component';

describe('CommunityPageWorkshopsComponent', () => {
  let component: CommunityPageWorkshopsComponent;
  let fixture: ComponentFixture<CommunityPageWorkshopsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommunityPageWorkshopsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommunityPageWorkshopsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
