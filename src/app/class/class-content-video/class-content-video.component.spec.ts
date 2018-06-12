import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassContentVideoComponent } from './class-content-video.component';

describe('ClassContentOnlineComponent', () => {
    let component: ClassContentVideoComponent;
    let fixture: ComponentFixture<ClassContentVideoComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ ClassContentVideoComponent ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ClassContentVideoComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
