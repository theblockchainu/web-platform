import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunityIntroComponent } from './community-intro.component';

describe('CommunityIntroComponent', () => {
  let component: CommunityIntroComponent;
  let fixture: ComponentFixture<CommunityIntroComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommunityIntroComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommunityIntroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
