import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowRSVPPopupComponent } from './show-rsvp-dialog.component';

describe('ContentOnlineComponent', () => {
  let component: ShowRSVPPopupComponent;
  let fixture: ComponentFixture<ShowRSVPPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShowRSVPPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowRSVPPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
