import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, FormControl, AbstractControl, Validators } from '@angular/forms';
import { Router, Route } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatSnackBar } from '@angular/material';
import { CollectionService } from '../../collection/collection.service';
import { ProfileService } from '../../profile/profile.service';
import {environment} from '../../../../environments/environment';
@Component({
  selector: 'app-rate-participants',
  templateUrl: './rate-participant-dialog.component.html',
  styleUrls: ['./rate-participant-dialog.component.scss']
})
export class RateParticipantComponent implements OnInit {

    public notReviewedParticipantCount = 0;
    public envVariable;

  constructor(public dialogRef: MatDialogRef<RateParticipantComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog,
    public _collectionService: CollectionService,
    public snackBar: MatSnackBar,
    public _profileService: ProfileService,
    public _fb: FormBuilder,
    private router: Router
  ) {
      this.envVariable = environment;
  }

  ngOnInit() {
    if (this.data) {
        this.notReviewedParticipantCount = this.data.participants.length;
      this.data.participants.forEach(participant => {
        participant['description'] = '';
        participant['score'] = 0;
        participant['hasReviewForPresentCollection'] = false;
        const validReview = participant['reviewsAboutYou'].find(review => review.collectionId === this.data.id);
        if (participant['reviewsAboutYou'] && participant['reviewsAboutYou'].length > 0 && validReview) {
            participant['hasReviewForPresentCollection'] = true;
            participant['description'] = validReview.description;
            participant['score'] = validReview.score;
            this.notReviewedParticipantCount--;
        } else {
            participant['reviewsAboutYou'] = [];
        }
      });
      console.log(this.data.participants);
    }
  }

  saveReviews() {
    console.log(this.data.participants);
    const collectionId = this.data.id;
    const collectionCalendarId = this.data.calendars[0].id;

    this.data.participants.forEach(participant => {
        const participantCalendarId = participant.calendarId && participant.calendarId.length > 0 ? participant.calendarId : collectionCalendarId;
      if (participant.score > 0 && participant.description.length > 0) {
          const reviewBody = {
              'description': participant.description,
              'like': true,
              'score': participant.score,
              'collectionId': collectionId,
              'collectionCalendarId': participantCalendarId
          };
          this._collectionService.postReview(participant.id, reviewBody).subscribe(
              (result: any) => {
              }, err => {
                  console.log(err);
              }
          );
      }
    });
    this.dialogRef.close();
  }

}
