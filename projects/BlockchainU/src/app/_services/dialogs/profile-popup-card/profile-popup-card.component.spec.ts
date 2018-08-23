import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilePopupCardComponent } from './profile-popup-card.component';

describe('ProfilePopupCardComponent', () => {
  let component: ProfilePopupCardComponent;
  let fixture: ComponentFixture<ProfilePopupCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfilePopupCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfilePopupCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
