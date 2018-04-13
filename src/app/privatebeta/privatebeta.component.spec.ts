import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivatebetaComponent } from './privatebeta.component';

describe('PrivatebetaComponent', () => {
  let component: PrivatebetaComponent;
  let fixture: ComponentFixture<PrivatebetaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrivatebetaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivatebetaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
