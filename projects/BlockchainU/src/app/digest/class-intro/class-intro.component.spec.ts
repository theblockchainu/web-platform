import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassIntroComponent } from './class-intro.component';

describe('ClassIntroComponent', () => {
  let component: ClassIntroComponent;
  let fixture: ComponentFixture<ClassIntroComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClassIntroComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassIntroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
