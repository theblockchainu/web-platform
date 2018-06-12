import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunityPageClassesComponent } from './community-page-classes.component';

describe('CommunityPageClassesComponent', () => {
  let component: CommunityPageClassesComponent;
  let fixture: ComponentFixture<CommunityPageClassesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommunityPageClassesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommunityPageClassesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
