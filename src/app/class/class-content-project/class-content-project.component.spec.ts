import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassContentProjectComponent } from './class-content-project.component';

describe('ClassContentProjectComponent', () => {
    let component: ClassContentProjectComponent;
    let fixture: ComponentFixture<ClassContentProjectComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ ClassContentProjectComponent ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ClassContentProjectComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
