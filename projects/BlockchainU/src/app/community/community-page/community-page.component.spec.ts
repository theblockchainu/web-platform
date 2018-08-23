import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunityPageComponent} from './community-page.component';

describe('CommunityPageComponent', () => {
  let component: CommunityPageComponent;
  let fixture: ComponentFixture<CommunityPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommunityPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommunityPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
