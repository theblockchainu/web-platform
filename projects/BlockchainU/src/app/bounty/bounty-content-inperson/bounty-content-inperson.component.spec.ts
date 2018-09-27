import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BountyContentInpersonComponent } from './bounty-content-inperson.component';

describe('BountyContentInpersonComponent', () => {
  let component: BountyContentInpersonComponent;
  let fixture: ComponentFixture<BountyContentInpersonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BountyContentInpersonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BountyContentInpersonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
