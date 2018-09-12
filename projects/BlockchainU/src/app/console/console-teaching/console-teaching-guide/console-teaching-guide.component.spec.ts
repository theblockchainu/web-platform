import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleTeachingGuideComponent } from './console-teaching-guide.component';

describe('ConsoleTeachingGuideComponent', () => {
  let component: ConsoleTeachingGuideComponent;
  let fixture: ComponentFixture<ConsoleTeachingGuideComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsoleTeachingGuideComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsoleTeachingGuideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
