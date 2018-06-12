import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PeerCardComponent } from './peer-card.component';

describe('PeerCardComponent', () => {
  let component: PeerCardComponent;
  let fixture: ComponentFixture<PeerCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PeerCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PeerCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
