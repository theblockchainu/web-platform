import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassContentComponent } from './class-content.component';

describe('ClassContentComponent', () => {
  let component: ClassContentComponent;
  let fixture: ComponentFixture<ClassContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClassContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
