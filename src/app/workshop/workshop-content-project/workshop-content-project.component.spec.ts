import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkshopContentProjectComponent } from './workshop-content-project.component';

describe('WorkshopContentProjectComponent', () => {
    let component: WorkshopContentProjectComponent;
    let fixture: ComponentFixture<WorkshopContentProjectComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ WorkshopContentProjectComponent ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(WorkshopContentProjectComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
