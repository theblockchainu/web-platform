import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PathSectionComponent } from './path-section.component';

describe('PathSectionComponent', () => {
  let component: PathSectionComponent;
  let fixture: ComponentFixture<PathSectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PathSectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PathSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
