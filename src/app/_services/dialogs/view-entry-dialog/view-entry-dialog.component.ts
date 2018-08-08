import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { CollectionService } from '../../collection/collection.service';
import { ProjectSubmissionService } from '../../project-submission/project-submission.service';
import { SubmissionViewComponent } from '../submission-view/submission-view.component';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-view-entry-dialog',
    templateUrl: './view-entry-dialog.component.html',
    styleUrls: ['./view-entry-dialog.component.scss']
})
export class ViewEntryDialogComponent implements OnInit {

    public noImage = 'assets/images/no-image.jpg';
    public defaultProfileUrl = '/assets/images/avatar.png';
    public envVariable;

    constructor(
        public dialogRef: MatDialogRef<ViewEntryDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private dialog: MatDialog,
        private _collectionService: CollectionService,
        private _projectSubmissionService: ProjectSubmissionService
    ) {
        this.envVariable = environment;
    }

    ngOnInit() {

    }

    imgErrorHandler(event) {
        event.target.src = '/assets/images/placeholder-image.jpg';
    }

    public viewSubmission(submissionId) {
        const query = '{"include":[{"upvotes":"peer"}, {"peer": "profiles"}, ' +
            '{"comments": [{"peer": {"profiles": "work"}}, {"replies": [{"peer": {"profiles": "work"}}]}]}]}';
        this._projectSubmissionService.viewSubmission(submissionId, query).subscribe((response : any) => {
            if (response) {
                const dialogRef = this.dialog.open(SubmissionViewComponent, {
                    data: {
                        userType: this.data.userType,
                        submission: response,
                        peerHasSubmission: this.data.peerHasSubmission,
                        collectionId: this.data.collectionId
                    },
                    panelClass: 'responsive-dialog',
                    width: '45vw',
                    height: '100vh'
                });
            }
        });
    }

}
