import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GuideContentProjectComponent } from './guide-content-project.component';

describe('GuideContentProjectComponent', () => {
    let component: GuideContentProjectComponent;
    let fixture: ComponentFixture<GuideContentProjectComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ GuideContentProjectComponent ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(GuideContentProjectComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
