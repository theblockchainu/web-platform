import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BountyPageComponent } from './bounty-page.component';

describe('BountyPageComponent', () => {
  let component: BountyPageComponent;
  let fixture: ComponentFixture<BountyPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BountyPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BountyPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
