import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleTeachingBountyComponent } from './console-teaching-bounty.component';

describe('ConsoleTeachingBountyComponent', () => {
  let component: ConsoleTeachingBountyComponent;
  let fixture: ComponentFixture<ConsoleTeachingBountyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ConsoleTeachingBountyComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsoleTeachingBountyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
