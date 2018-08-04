import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPromocodeDialogComponent } from './view-promocode-dialog.component';

describe('ViewPromocodeDialogComponent', () => {
  let component: ViewPromocodeDialogComponent;
  let fixture: ComponentFixture<ViewPromocodeDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewPromocodeDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewPromocodeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
