import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkshopContentOnlineComponent } from './workshop-content-online.component';

describe('WorkshopContentOnlineComponent', () => {
    let component: WorkshopContentOnlineComponent;
    let fixture: ComponentFixture<WorkshopContentOnlineComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ WorkshopContentOnlineComponent ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(WorkshopContentOnlineComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
