import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BountyCardComponent } from './bounty-card.component';

describe('BountyCardComponent', () => {
  let component: BountyCardComponent;
  let fixture: ComponentFixture<BountyCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BountyCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BountyCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
