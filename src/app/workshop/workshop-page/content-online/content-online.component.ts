import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { CollectionService } from '../../../_services/collection/collection.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommentService } from '../../../_services/comment/comment.service';
import { CookieUtilsService } from '../../../_services/cookieUtils/cookie-utils.service';
import { DialogsService } from '../../../_services/dialogs/dialog.service';
import { ContentService } from '../../../_services/content/content.service';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-content-online',
    templateUrl: './content-online.component.html',
    styleUrls: ['./content-online.component.scss']
})
export class ContentOnlineComponent implements OnInit {

    public userType = 'public';
    public workshopId = '';
    public chatForm: FormGroup;
    public replyForm: FormGroup;
    public replyingToCommentId: string;
    public comments: Array<any>;
    public userId;
    public attachmentUrls = [];
    public duration = 0;
    public envVariable: any;
    constructor(
        public _collectionService: CollectionService,
        @Inject(MAT_DIALOG_DATA) public data: any,
        public dialogRef: MatDialogRef<ContentOnlineComponent>,
        private _fb: FormBuilder,
        private _commentService: CommentService,
        private _cookieUtilsService: CookieUtilsService,
        private dialogsService: DialogsService,
        private contentService: ContentService,
        private router: Router
    ) {
        this.userType = data.userType;
        this.workshopId = data.collectionId;
        this.userId = _cookieUtilsService.getValue('userId');
        data.content.supplementUrls.forEach(file => {
            this.contentService.getMediaObject(file).subscribe((res) => {
                this.attachmentUrls.push(res[0]);
            });
        });
        const startMoment = moment(data.content.schedules[0].startTime);
        const endMoment = moment(data.content.schedules[0].endTime);
        const contentLength = moment.utc(endMoment.diff(startMoment)).format('HH');
        this.duration = parseInt(contentLength, 10);
        this.envVariable = environment;
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
        this._collectionService.postContentComments(this.data.content.id, this.chatForm.value, (err, response) => {
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
        this._collectionService.getContentComments(this.data.content.id, query, (err, response) => {
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
                    comment.upvotes.push(response);
                } else {
                    comment.upvotes = [];
                    comment.upvotes.push(response);
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
                    reply.upvotes.push(response);
                } else {
                    reply.upvotes = [];
                    reply.upvotes.push(response);
                }
            }, err => {
                console.log(err);
            }
        );
    }

    /**
     * joinSession
     */
    public joinSession() {
        console.log('Handle Online session here');
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
        return comment.peer[0].id === this.userId;
    }

    /**
     * joinLiveSession
     */
    public joinLiveSession(content: any) {
        const data = {
            roomName: content.id + this.data.calendarId,
            teacherId: this.data.collection.owners[0].id,
            content: content,
            participants: this.data.collection.participants
        };
        this.dialogsService.startLiveSession(data).subscribe(result => {
        });
    }

    public openProfilePage(peerId) {
        this.router.navigate(['profile', peerId]);
    }

}
