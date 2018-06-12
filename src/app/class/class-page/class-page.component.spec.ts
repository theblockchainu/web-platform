import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassPageComponent } from './class-page.component';

describe('ClassPageComponent', () => {
  let component: ClassPageComponent;
  let fixture: ComponentFixture<ClassPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClassPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
