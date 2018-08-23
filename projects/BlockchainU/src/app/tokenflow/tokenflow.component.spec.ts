import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenflowComponent } from './tokenflow.component';

describe('TokenflowComponent', () => {
  let component: TokenflowComponent;
  let fixture: ComponentFixture<TokenflowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TokenflowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenflowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
