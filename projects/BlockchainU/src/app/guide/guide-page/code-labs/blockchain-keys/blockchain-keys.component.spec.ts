import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockchainKeysComponent } from './blockchain-keys.component';

describe('BlockchainKeysComponent', () => {
  let component: BlockchainKeysComponent;
  let fixture: ComponentFixture<BlockchainKeysComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BlockchainKeysComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockchainKeysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
