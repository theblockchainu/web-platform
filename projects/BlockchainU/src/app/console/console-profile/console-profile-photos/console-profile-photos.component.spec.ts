import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleProfilePhotosComponent } from './console-profile-photos.component';

describe('ConsoleProfilePhotosComponent', () => {
  let component: ConsoleProfilePhotosComponent;
  let fixture: ComponentFixture<ConsoleProfilePhotosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsoleProfilePhotosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsoleProfilePhotosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
