import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatSnackBar } from '@angular/material';
import { CommunityService } from '../../community/community.service';

@Component({
    selector: 'app-exit-community-dialog',
    templateUrl: './exit-community-dialog.component.html',
    styleUrls: ['./exit-community-dialog.component.scss']
})
export class ExitCommunityDialogComponent implements OnInit {

    constructor(public dialogRef: MatDialogRef<ExitCommunityDialogComponent>
        , @Inject(MAT_DIALOG_DATA) public data: any,
        private _communityService: CommunityService,
        private snackBar: MatSnackBar) { }

    ngOnInit() {
    }

    dropOut() {
        this._communityService.removeParticipant(this.data.communityId, this.data.userId).subscribe((response : any) => {
            this.dialogRef.close(true);
        }, err => {
            this.snackBar.open('Couldn&#39;t cancel membership', 'Retry', {
                duration: 5000
            }).onAction().subscribe(res => {
                this.dropOut();
            });
        });
    }

}
