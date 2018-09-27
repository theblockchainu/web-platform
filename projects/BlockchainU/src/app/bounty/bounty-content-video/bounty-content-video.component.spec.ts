import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BountyContentVideoComponent } from './bounty-content-video.component';

describe('BountyContentOnlineComponent', () => {
    let component: BountyContentVideoComponent;
    let fixture: ComponentFixture<BountyContentVideoComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ BountyContentVideoComponent ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(BountyContentVideoComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
