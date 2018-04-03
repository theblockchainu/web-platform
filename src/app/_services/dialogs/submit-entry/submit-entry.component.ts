import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { HttpClient } from '@angular/common/http';
import { MediaUploaderService } from '../../mediaUploader/media-uploader.service';
import { SubmissionViewComponent } from '../submission-view/submission-view.component';
import { ProjectSubmissionService } from '../../project-submission/project-submission.service';
import { CookieUtilsService } from '../../cookieUtils/cookie-utils.service';
import 'rxjs/add/operator/map';
import { ContentService } from '../../content/content.service';
import { environment } from '../../../../environments/environment';
import * as _ from 'lodash';

@Component({
    selector: 'app-submit-entry',
    templateUrl: './submit-entry.component.html',
    styleUrls: ['./submit-entry.component.scss']
})
export class SubmitEntryComponent implements OnInit {

    public userId;
    public envVariable;
    public submitEntryForm: any = FormGroup;
    public imageUrl: string;
    public submissionTopics = [];
    public removedTopics = [];
    public relTopics = [];
    public isPrivate: boolean;
    public submissionId;
    public submissionView;
    public savingDraft = false;
    public loader = 'assets/images/ajax-loader.gif';
    public uploadingImage = false;
    public urlForImages = [];
    public searchTopicURL;
    public createTopicURL;
    public placeholderStringTopic = 'Submission Tag';
    public maxTopicMsg = 'Choose max 3 related tags';

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public dialog: MatDialog,
        private _fb: FormBuilder,
        public http: HttpClient,
        private mediaUploader: MediaUploaderService,
        public projectSubmissionService: ProjectSubmissionService,
        private _cookieUtilsService: CookieUtilsService,
        private _contentService: ContentService,
        public dialogRef: MatDialogRef<SubmitEntryComponent>
    ) {
        this.envVariable = environment;
        this.userId = _cookieUtilsService.getValue('userId');
        this.searchTopicURL = environment.searchUrl + '/api/search/'
            + environment.uniqueDeveloperCode + '_topics/suggest?field=name&query=';
        this.createTopicURL = environment.apiUrl + '/api/' + environment.uniqueDeveloperCode + '_topics';

    }

    ngOnInit() {
        this.submitEntryForm = this._fb.group({
            name: ['', Validators.required],
            picture_url: [],
            description: ['', Validators.required],
            isPrivate: ['true', Validators.required]
        });
    }

    publishView() {
        const submissionForm = {
            name: this.submitEntryForm.controls['name'].value,
            description: this.submitEntryForm.controls['description'].value,
            picture_url: this.submitEntryForm.controls['picture_url'].value,
            isPrivate: this.submitEntryForm.controls['isPrivate'].value
        };
        this.savingDraft = true;
        this.projectSubmissionService.submitProject(this.data.content.id, submissionForm).subscribe((response: any) => {
            if (response) {
                this.submissionView = response;
                this.savingDraft = false;
                this.projectSubmissionService.addPeerSubmissionRelation(this.userId, this.submissionView.id).subscribe((res: any) => {
                    if (res) {
                        this.data.peerHasSubmission = true;
                        this.viewSubmission(this.submissionView.id);
                    }
                });
            }
        });
    }

    public viewSubmission(submissionId) {
        const query = '{"include":[{"upvotes":"peer"}, {"peer": "profiles"}, ' +
            '{"comments": [{"peer": {"profiles": "work"}}, {"replies": [{"peer": {"profiles": "work"}}]}]}]}';
        this.projectSubmissionService.viewSubmission(submissionId, query).subscribe((response: Response) => {
            if (response) {
                const dialogRef = this.dialog.open(SubmissionViewComponent, {
                    data: {
                        userType: this.data.userType,
                        submission: response,
                        peerHasSubmission: this.data.peerHasSubmission,
                        collectionId: this.data.collectionId
                    },
                    width: '45vw',
                    height: '100vh'
                });
                dialogRef.afterClosed().subscribe(res => {
                    this.dialogRef.close(true);
                });
            }
        });
    }

    public deleteFromContainer(fileUrl, fileType) {
        const fileurl = fileUrl;
        fileUrl = _.replace(fileUrl, 'download', 'files');
        this.http.delete(environment.apiUrl + fileUrl)
            .map((response) => {
                console.log(response);
                this.urlForImages = [];
                this.submitEntryForm.controls['picture_url'].patchValue('');
            }).subscribe();
    }

    uploadImage(event) {
        this.uploadingImage = true;
        for (const file of event.files) {
            this.mediaUploader.upload(file).subscribe((response) => {
                this.addImageUrl(response.url);
                this.uploadingImage = false;
            });
        }
    }

    public addImageUrl(value) {
        console.log('Adding image url: ' + value);
        this._contentService.getMediaObject(value).subscribe((res) => {
            this.urlForImages.push(res[0]);
        });
        const control = <FormArray>this.submitEntryForm.controls['picture_url'];
        control.patchValue(value);
    }

}
