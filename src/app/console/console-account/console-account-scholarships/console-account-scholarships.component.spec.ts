import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleAccountScholarshipsComponent } from './console-account-scholarships.component';

describe('ConsoleAccountScholarshipsComponent', () => {
  let component: ConsoleAccountScholarshipsComponent;
  let fixture: ComponentFixture<ConsoleAccountScholarshipsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsoleAccountScholarshipsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsoleAccountScholarshipsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
