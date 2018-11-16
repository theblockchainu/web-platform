import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { DialogsService } from '../../../../../_services/dialogs/dialog.service';
import { CollectionService } from '../../../../../_services/collection/collection.service';
import { MatStepper } from '@angular/material';
import { EditService } from '../../edit-services/edit-services.service';
@Component({
  selector: 'app-step-review-submit',
  templateUrl: './step-review-submit.component.html',
  styleUrls: ['./step-review-submit.component.scss']
})
export class StepReviewSubmitComponent implements OnInit {

  @Input() stepper: MatStepper;
  reviewForm: FormGroup;
  isSubmitted = false;

  constructor(
    private _fb: FormBuilder,
    private dialogsService: DialogsService,
    private _collectionService: CollectionService,
    private _editService: EditService
  ) { }

  ngOnInit() {
    this.reviewForm = this._fb.group({
      standards: [false],
      terms: [false]
    });
  }

  submitForReview() {
    // Post LearningPath for review
    this._collectionService.submitForReview(this._editService.learningPathId)
      .subscribe((res: any) => {
        this.isSubmitted = true;
        this.dialogsService.openCollectionSubmitDialog({ type: 'learningPath' });
      });

  }

  standards() {
    this.dialogsService.collectionStandardsDialog().subscribe();
  }

  termsAndCondition() {
    this.dialogsService.termsAndConditionsDialog().subscribe();
  }

}
