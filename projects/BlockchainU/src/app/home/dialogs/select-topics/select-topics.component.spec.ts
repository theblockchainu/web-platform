import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectTopicsComponent } from './select-topics.component';

describe('SelectTopicsComponent', () => {
  let component: SelectTopicsComponent;
  let fixture: ComponentFixture<SelectTopicsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectTopicsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectTopicsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
