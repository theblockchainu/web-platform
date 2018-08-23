import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassContentOnlineComponent } from './class-content-online.component';

describe('ClassContentOnlineComponent', () => {
    let component: ClassContentOnlineComponent;
    let fixture: ComponentFixture<ClassContentOnlineComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ ClassContentOnlineComponent ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ClassContentOnlineComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
