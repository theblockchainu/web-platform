import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { CollectionService } from '../../collection/collection.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommentService } from '../../comment/comment.service';
import { ProjectSubmissionService } from '../../project-submission/project-submission.service';
import { CookieUtilsService } from '../../cookieUtils/cookie-utils.service';
import {environment} from '../../../../environments/environment';

@Component({
    selector: 'app-submission-view',
    templateUrl: './submission-view.component.html',
    styleUrls: ['./submission-view.component.scss']
})
export class SubmissionViewComponent implements OnInit {

    public isMySubmission = false;
    public userId;
    public iHaveUpvoted = false;
    public userType = 'public';
    public workshopId = '';
    public chatForm: FormGroup;
    public replyForm: FormGroup;
    public replyingToCommentId: string;
    public comments: Array<any>;
    public envVariable;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public _collectionService: CollectionService,
        public dialogRef: MatDialogRef<SubmissionViewComponent>,
        private _fb: FormBuilder,
        private _commentService: CommentService,
        private _submissionService: ProjectSubmissionService,
        private _cookieUtilsService: CookieUtilsService
    ) {
        this.envVariable = environment;
        this.userType = data.userType;
        this.workshopId = data.collectionId;
        this.userId = _cookieUtilsService.getValue('userId');
        if (data.submission.peer[0].id === this.userId) {
            this.isMySubmission = true;
        }
        if (data.submission.upvotes) {
            data.submission.upvotes.forEach(upvote => {
                if (upvote.peer[0].id === this.userId) {
                    this.iHaveUpvoted = true;
                }
            });
        }
    }

    ngOnInit() {
        this.initializeForms();
        this.getDiscussions();
    }

    private initializeForms() {
        this.chatForm = this._fb.group({
            description: ['', Validators.required]
        });
    }

    /**
     * postComment
     */
    public postComment() {
        this._collectionService.postSubmissionComments(this.data.submission.id, this.chatForm.value, (err, response) => {
            if (err) {
                console.log(err);
            } else {
                this.chatForm.reset();
                this.getDiscussions();
            }
        });
    }

    public createReplyForm(comment: any) {
        this.replyingToCommentId = comment.id;
        this.replyForm = this._fb.group({
            description: ''
        });
    }

    /**
     * postReply
     */
    public postReply(comment: any) {
        this._commentService.replyToComment(comment.id, this.replyForm.value).subscribe(
            response => {
                this.getDiscussions();
                delete this.replyForm;
            }, err => {
                console.log(err);
            }
        );
    }

    private getDiscussions() {
        const query = {
            'include': [
                {
                    'peer': [
                        { 'profiles': ['work'] }
                    ]
                },
                {
                    'replies': [
                        {
                            'peer': [
                                {
                                    'profiles': ['work']
                                }
                            ]
                        },
                        {
                            'upvotes': 'peer'
                        }
                    ]
                },
                {
                    'upvotes': 'peer'
                }
            ],
            'order': 'createdAt DESC'
        };
        this._collectionService.getSubmissionComments(this.data.submission.id, query, (err, response) => {
            if (err) {
                console.log(err);
            } else {
                this.comments = response;
            }
        });
    }

    addCommentUpvote(comment: any) {
        this._commentService.addCommentUpvote(comment.id, {}).subscribe(
            response => {
                if (comment.upvotes !== undefined) {
                    comment.upvotes.push(response );
                } else {
                    comment.upvotes = [];
                    comment.upvotes.push(response );
                }
            }, err => {
                console.log(err);
            }
        );
    }

    addSubmissionUpvote(submission: any) {
        this._submissionService.addSubmissionUpvote(submission.id, {}).subscribe(
            response => {
                if (submission.upvotes !== undefined) {
                    submission.upvotes.push(response );
                } else {
                    submission.upvotes = [];
                    submission.upvotes.push(response );
                }
            }, err => {
                console.log(err);
            }
        );
    }

    addReplyUpvote(reply: any) {
        this._commentService.addReplyUpvote(reply.id, {}).subscribe(
            response => {
                if (reply.upvotes !== undefined) {
                    reply.upvotes.push(response );
                } else {
                    reply.upvotes = [];
                    reply.upvotes.push(response );
                }
            }, err => {
                console.log(err);
            }
        );
    }

    closeDialog() {
        this.dialogRef.close();
    }

    public hasUpvoted(upvotes) {
        let result = false;
        if (upvotes !== undefined) {
            upvotes.forEach(upvote => {
                if (upvote.peer !== undefined) {
                    if (upvote.peer[0].id === this.userId) {
                        result = true;
                    }
                } else {
                    result = true;
                }
            });
        }
        return result;
    }

    public isMyComment(comment) {
        if (comment.peer[0] !== undefined) {
            return comment.peer[0].id === this.userId;
        } else {
            return false;
        }
    }

}
