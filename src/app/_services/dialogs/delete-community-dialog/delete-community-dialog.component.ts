import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef, MatSnackBar} from '@angular/material';
import {CommunityService} from '../../community/community.service';

@Component({
    selector: 'app-delete-community-dialog',
    templateUrl: './delete-community-dialog.component.html',
    styleUrls: ['./delete-community-dialog.component.scss']
})
export class DeleteCommunityDialogComponent implements OnInit {

    constructor(public dialogRef: MatDialogRef<DeleteCommunityDialogComponent>,
                @Inject(MAT_DIALOG_DATA) public data: any,
                private _communityService: CommunityService,
                private snackBar: MatSnackBar) {
    }

    public deleteable: boolean;

    ngOnInit() {
        if (!this.data.participants || this.data.participants.length === 0) {
            this.deleteable = true;
        } else {
            this.deleteable = false;
        }
    }

    public delete() {
        this._communityService.deleteCommunity(this.data.id).subscribe(res => {
            if (res) {
                console.log(res);
                this.dialogRef.close(true);
            }
        }, err => {
            this.snackBar.open('Community couldn&#39;t be deleted', 'Retry', {
                duration: 800
            }).onAction().subscribe(res => {
                this.delete();
            });
        });
    }

}
