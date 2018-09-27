import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BountyContentComponent } from './bounty-content.component';

describe('BountyContentComponent', () => {
  let component: BountyContentComponent;
  let fixture: ComponentFixture<BountyContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BountyContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BountyContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
