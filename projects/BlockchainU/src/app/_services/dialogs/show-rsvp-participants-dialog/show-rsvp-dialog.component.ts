import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { CollectionService } from '../../collection/collection.service';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-rsvp-dialog',
    templateUrl: './show-rsvp-dialog.component.html',
    styleUrls: ['./show-rsvp-dialog.component.scss']
})
export class ShowRSVPPopupComponent implements OnInit {

    public userType = 'public';
    public experienceId = '';
    public envVariable;
    public hasChanged = false;
    public loadingRsvpDetail = false;
    constructor(public dialogRef: MatDialogRef<ShowRSVPPopupComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private dialog: MatDialog,
        public _collectionService: CollectionService
    ) {
        this.envVariable = environment;
    }

    ngOnInit() {
    }

    /**
     * markAbsent
     */
    public markPresence(attendie, isPresent) {
        let paramIsPresent = false;
        if (isPresent) {
            paramIsPresent = true;
        }
        this._collectionService.markPresence(attendie.id, attendie.rsvpId, paramIsPresent).subscribe((response: any) => {
            this.hasChanged = true;
            console.log('removed rsvp');
        });
    }

    closeDialog() {
        this.dialogRef.close(this.hasChanged);
    }

}
