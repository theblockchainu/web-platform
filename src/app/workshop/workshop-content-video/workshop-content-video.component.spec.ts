import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkshopContentVideoComponent } from './workshop-content-video.component';

describe('WorkshopContentOnlineComponent', () => {
    let component: WorkshopContentVideoComponent;
    let fixture: ComponentFixture<WorkshopContentVideoComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ WorkshopContentVideoComponent ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(WorkshopContentVideoComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
