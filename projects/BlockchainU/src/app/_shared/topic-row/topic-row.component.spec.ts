import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TopicRowComponent } from './topic-row.component';

describe('TopicRowComponent', () => {
  let component: TopicRowComponent;
  let fixture: ComponentFixture<TopicRowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TopicRowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TopicRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
