import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { MessageParticipantComponent } from '../message-participant/message-participant.component';
import { CollectionService } from '../../../_services/collection/collection.service';
@Component({
  selector: 'app-view-participants',
  templateUrl: './view-participants.component.html',
  styleUrls: ['./view-participants.component.scss']
})
export class ViewParticipantsComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<ViewParticipantsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog,
    public _collectionService: CollectionService
  ) { }

  ngOnInit() {
  }


  /**
   * messageParticipant
   */
  public messageParticipant(participant: any) {
    console.log(participant);
    const dialogRef = this.dialog.open(MessageParticipantComponent, {
      data: participant,
      width: '600px'
    });
  }

  /**
  * removeParticipant
  */
  public removeParticipant(participantId: string) {
    this._collectionService.removeParticipant(this.data.workshopId, participantId).subscribe((response) => {
      location.reload();
      console.log('deleted');
    });
  }


}
