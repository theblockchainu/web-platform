import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SocialSyncComponent } from './socialsync.component';

describe('SocialSyncComponent', () => {
  let component: SocialSyncComponent;
  let fixture: ComponentFixture<SocialSyncComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SocialSyncComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SocialSyncComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
