import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {ConsoleTeachingLearningPathComponent} from './console-teaching-learning-path.component';


describe('ConsoleTeachingLearningPathComponent', () => {
  let component: ConsoleTeachingLearningPathComponent;
  let fixture: ComponentFixture<ConsoleTeachingLearningPathComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsoleTeachingLearningPathComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsoleTeachingLearningPathComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
