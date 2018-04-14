import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PeerIntroComponent } from './peer-intro.component';

describe('PeerIntroComponent', () => {
  let component: PeerIntroComponent;
  let fixture: ComponentFixture<PeerIntroComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PeerIntroComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PeerIntroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
