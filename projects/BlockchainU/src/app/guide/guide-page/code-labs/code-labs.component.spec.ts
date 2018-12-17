import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeLabsComponent } from './code-labs.component';

describe('CodeLabsComponent', () => {
  let component: CodeLabsComponent;
  let fixture: ComponentFixture<CodeLabsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CodeLabsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CodeLabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
