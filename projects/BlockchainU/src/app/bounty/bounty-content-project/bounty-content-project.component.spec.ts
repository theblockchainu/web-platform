import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BountyContentProjectComponent } from './bounty-content-project.component';

describe('BountyContentProjectComponent', () => {
    let component: BountyContentProjectComponent;
    let fixture: ComponentFixture<BountyContentProjectComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ BountyContentProjectComponent ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(BountyContentProjectComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
