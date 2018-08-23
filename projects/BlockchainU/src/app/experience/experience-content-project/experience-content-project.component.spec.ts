import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExperienceContentProjectComponent } from './experience-content-project.component';

describe('ExperienceContentProjectComponent', () => {
    let component: ExperienceContentProjectComponent;
    let fixture: ComponentFixture<ExperienceContentProjectComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ ExperienceContentProjectComponent ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ExperienceContentProjectComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
