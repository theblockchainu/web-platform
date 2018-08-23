import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExperienceContentVideoComponent } from './experience-content-video.component';

describe('ExperienceContentOnlineComponent', () => {
    let component: ExperienceContentVideoComponent;
    let fixture: ComponentFixture<ExperienceContentVideoComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ ExperienceContentVideoComponent ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ExperienceContentVideoComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
