import { SignupComponentDialogComponent } from './signup-dialog/signup-dialog.component';
import { LoginComponentDialog } from './login-dialog/login-dialog.component';
import { AddCardDialogComponent } from './add-card-dialog/add-card-dialog.component';
import { LiveSessionDialogComponent } from './live-session-dialog/live-session-dialog.component';
import { MultiselectTopicDialogComponent } from './multiselect-topic-dialog/multiselect-topic-dialog.component';
import { Observable } from 'rxjs/Observable';
import { VerifyIdDialogComponent } from './verify-id-dialog/verify-id-dialog.component';
import { VerifyEmailDialogComponent } from './verify-email-dialog/verify-email-dialog.component';
import { IdPolicyDialogComponent } from './id-policy-dialog/id-policy-dialog.component';
import { VideoDialogComponent } from './video-dialog/video-dialog.component';
import { VerifyPhoneDialogComponent } from './verify-phone-dialog/verify-phone-dialog.component';
import { CollectionGridDialogComponent } from './collection-grid-dialog/collection-grid-dialog.component';
import { MatDialogRef, MatDialog, MatDialogConfig } from '@angular/material';
import { Injectable } from '@angular/core';
import { ProfilePopupCardComponent } from './profile-popup-card/profile-popup-card.component';
import { RequestPasswordDialogComponent } from './forgot-pwd-dialog/forgot-pwd-dialog.component';
import { ExitCollectionDialogComponent } from './exit-collection-dialog/exit-collection-dialog.component';
import { CancelCollectionDialogComponent } from './cancel-collection-dialog/cancel-collection-dialog.component';
import { DeleteCollectionDialogComponent } from './delete-collection-dialog/delete-collection-dialog.component';
import { EditCalendarDialogComponent } from './edit-calendar-dialog/edit-calendar-dialog.component';
import { AddTopicDialogComponent } from './add-topic-dialog/add-topic-dialog.component';
import { AddLanguageDialogComponent } from './add-language-dialog/add-language-dialog.component';
import { ViewConflictDialogComponent } from './view-conflict-dialog/view-conflict-dialog.component';
import { } from './';
import {
    CalendarEvent
} from 'angular-calendar';
import { SelectDateDialogComponent } from './select-date-dialog/select-date-dialog.component';
import { CollectionCloneDialogComponent } from './collection-clone-dialog/collection-clone-dialog.component';
import { CollectionSubmitDialogComponent } from './collection-submit-dialog/collection-submit-dialog.component';
import { SubmissionViewComponent } from './submission-view/submission-view.component';
import { SubmitEntryComponent } from './submit-entry/submit-entry.component';
import { ViewEntryDialogComponent } from './view-entry-dialog/view-entry-dialog.component';
import { InviteFriendsDialogComponent } from './invite-friends-dialog/invite-friends-dialog.component';
import { ReportProfileComponent } from './report-profile/report-profile.component';
import { DeleteCohortDialogComponent } from './delete-cohort-dialog/delete-cohort-dialog.component';
import { RateParticipantComponent } from './rate-participant-dialog/rate-participant-dialog.component';
import { ShareDialogComponent } from './share-dialog/share-dialog.component';
import { DeleteCommunityDialogComponent } from './delete-community-dialog/delete-community-dialog.component';
import { ExitCommunityDialogComponent } from './exit-community-dialog/exit-community-dialog.component';
import { DateConflictDialogComponent } from './date-conflict-dialog/date-conflict-dialog.component';
@Injectable()
export class DialogsService {

    constructor(public dialog: MatDialog
    ) { }

    public openSignup() {
        let dialogRef: MatDialogRef<SignupComponentDialogComponent>;

        dialogRef = this.dialog.open(SignupComponentDialogComponent);

        return dialogRef.afterClosed();
    }

    public openLogin() {
        console.log('openLogin dialog');
        const dialogRef1: MatDialogRef<LoginComponentDialog> = this.dialog.open(LoginComponentDialog);
        return dialogRef1.afterClosed();
    }
    public addCard() {
        let dialogRef4: MatDialogRef<AddCardDialogComponent>;

        dialogRef4 = this.dialog.open(AddCardDialogComponent, {
            width: '610px',
            height: '380px'
        });
        return dialogRef4.afterClosed();
    }
    public openIdVerify() {
        let dialogRef5: MatDialogRef<VerifyIdDialogComponent>;

        dialogRef5 = this.dialog.open(VerifyIdDialogComponent, {
            width: '60vw',
            height: '100vh'
        });
        return dialogRef5.afterClosed();
    }
    public openEmailVerify() {
        let dialogRef6: MatDialogRef<VerifyEmailDialogComponent>;

        dialogRef6 = this.dialog.open(VerifyEmailDialogComponent, {
            width: '50vw',
            height: '80vh'
        });
        return dialogRef6.afterClosed();
    }
    public openIdPolicy() {
        let dialogRef7: MatDialogRef<IdPolicyDialogComponent>;

        dialogRef7 = this.dialog.open(IdPolicyDialogComponent, {
            width: '45vw',
            height: '100vh'
        });
        return dialogRef7.afterClosed();
    }

    public openVideo(url: string) {
        let dialogRef8: MatDialogRef<VideoDialogComponent>;

        dialogRef8 = this.dialog.open(VideoDialogComponent, {
            width: '1000px',
            panelClass: 'video-popup',
            data: url
        });
        return dialogRef8.afterClosed();
    }
    public openPhoneVerify() {
        let dialogRef9: MatDialogRef<VerifyPhoneDialogComponent>;

        dialogRef9 = this.dialog.open(VerifyPhoneDialogComponent, {
            width: '50vw',
            height: '80vh'
        });
        return dialogRef9.afterClosed();
    }

    public openFollowTopicDialog(type, inputs) {
        let dialogRef5: MatDialogRef<MultiselectTopicDialogComponent>;

        dialogRef5 = this.dialog.open(MultiselectTopicDialogComponent,
            {
                disableClose: true,
                hasBackdrop: true,
                width: '50vw',
                height: '70vh'
            }
        );
        dialogRef5.componentInstance.searchUrl = inputs.searchTopicURL;
		dialogRef5.componentInstance.title = inputs.title;
		dialogRef5.componentInstance.minSelection = inputs.minSelection;
		dialogRef5.componentInstance.maxSelection = inputs.maxSelection;
		dialogRef5.componentInstance.suggestedTopics = inputs.suggestedTopics;
        dialogRef5.componentInstance.data = {
            searchUrl: inputs.searchTopicURL,
            selected: []
        };

        return dialogRef5.afterClosed();
    }

    // /**
    //  * startLiveSession
    //  */
    // public startLiveSession() {
    //     let dialogRef5: MatDialogRef<LiveSessionDialogComponent>;

    //     dialogRef5 = this.dialog.open(LiveSessionDialogComponent, {
    //         width: '100vw',
    //         height: '100vh'
    //     });
    //     return dialogRef5.afterClosed();
    // }

    /**
     * openCollectionGrid
     */
    public openCollectionGrid(title, collections) {
        let dialogRef: MatDialogRef<CollectionGridDialogComponent>;

        dialogRef = this.dialog.open(CollectionGridDialogComponent, {
            width: '80vw',
            height: '80vh',
            data: {
                title: title,
                collections: collections
            }
        });

        return dialogRef.afterClosed();
    }


    openDeleteCollection(collection: any) {
        const dialogRef = this.dialog.open(DeleteCollectionDialogComponent, {
            data: collection,
            width: '30vw'
        });

        return dialogRef.afterClosed();
    }

    openExitCollection(collectionId: string, userId: string) {
        const dialogRef = this.dialog.open(ExitCollectionDialogComponent, {
            data: {
                collectionId: collectionId,
                userId: userId
            },
            width: '30vw'
        });
        return dialogRef.afterClosed();
    }

    openDeleteCommunity(community: any) {
        const dialogRef = this.dialog.open(DeleteCommunityDialogComponent, {
            data: community,
            width: '30vw'
        });

        return dialogRef.afterClosed();
    }

    openExitCommunity(communityId: string, userId: string) {
        const dialogRef = this.dialog.open(ExitCommunityDialogComponent, {
            data: {
                communityId: communityId,
                userId: userId
            },
            width: '30vw'
        });
        return dialogRef.afterClosed();
    }

    openCancelCollection(collection: any) {
        const dialogRef = this.dialog.open(CancelCollectionDialogComponent, {
            data: collection,
            width: '30vw'
        });
        return dialogRef.afterClosed();
    }

    openDeleteCohort(calendarId: string) {
        return this.dialog.open(DeleteCohortDialogComponent, {
            data: calendarId,
            width: '30vw'
        }).afterClosed();
    }

    openProfilePopup(config: any) {
        return this.dialog.open(ProfilePopupCardComponent, config);
    }

    openForgotPassword(email: string) {
        return this.dialog.open(RequestPasswordDialogComponent, {
            data: email
        });
    }


    public editCalendar(collection, contents, calendars, allItinerary, participants, events: CalendarEvent[], userId: string, startDate: Date, endDate: Date): Observable<boolean> {
        let dialogRef: MatDialogRef<EditCalendarDialogComponent>;

        dialogRef = this.dialog.open(EditCalendarDialogComponent, {
            width: '80vw',
            height: '100vh'
        }
        );
        dialogRef.componentInstance.collection = collection;
        dialogRef.componentInstance.contents = contents;
        dialogRef.componentInstance.calendars = calendars;
        dialogRef.componentInstance.allItenaries = allItinerary;
        dialogRef.componentInstance.participants = participants;
        dialogRef.componentInstance.inpEvents = events;
        dialogRef.componentInstance.userId = userId;
        dialogRef.componentInstance.startDate = startDate;
        dialogRef.componentInstance.endDate = endDate;

        return dialogRef.afterClosed();
    }


    public addNewTopic() {
        let dialogRef: MatDialogRef<AddTopicDialogComponent>;

        dialogRef = this.dialog.open(AddTopicDialogComponent);

        return dialogRef.afterClosed();

    }

    public addNewLanguage() {
        let dialogRef: MatDialogRef<AddLanguageDialogComponent>;

        dialogRef = this.dialog.open(AddLanguageDialogComponent);

        return dialogRef.afterClosed();

    }

    /**
     * startLiveSession
     */
    public startLiveSession(data: any) {
        let dialogRef5: MatDialogRef<LiveSessionDialogComponent>;

        dialogRef5 = this.dialog.open(LiveSessionDialogComponent, {
            panelClass: 'my-full-screen-dialog',
			width: '100vw',
			height: '100vh',
			maxWidth: '100%',
            data: data
        });
        return dialogRef5.afterClosed();
    }

    public selectDateDialog(allItenaries, mode, participants, userType) {
        return this.dialog.open(SelectDateDialogComponent, {
            width: '45vw',
            height: '100vh',
            data: { itineraries: allItenaries, mode: mode, participants: participants, userType: userType }
        }).afterClosed();
    }

    public openCollectionCloneDialog(collection: any) {
        return this.dialog.open(CollectionCloneDialogComponent,
            {
                data: collection,
                disableClose: true, hasBackdrop: true, width: '30vw'
            }).afterClosed();
    }

    public openCollectionSubmitDialog(collection: any) {
        return this.dialog.open(CollectionSubmitDialogComponent,
            {
                data: collection,
                disableClose: true, hasBackdrop: true, width: '40vw'
            }).afterClosed();
    }

    public submissionView(userType, submission, peerHasSubmission, collectionId) {
        return this.dialog.open(SubmissionViewComponent, {
            data: {
                userType: userType,
                submission: submission,
                peerHasSubmission: peerHasSubmission,
                collectionId: collectionId
            },
            width: '45vw',
            height: '100vh'
        }).afterClosed();
    }

    /**
     * submitEntry
     */
    public submitEntry(data) {
        return this.dialog.open(SubmitEntryComponent, {
            data: data,
            width: '45vw',
            height: '100vh'
        }).afterClosed();
    }

    public viewEntry(data) {
        return this.dialog.open(ViewEntryDialogComponent, {
            data: data,
            width: '45vw',
            height: '100vh'
        }).afterClosed();
    }

    public inviteFriends(collection) {
        return this.dialog.open(InviteFriendsDialogComponent, {
            data: {
                url: collection.type + '/' + collection.id
            },
            width: '40vw'
        }).afterClosed();
    }

    public reportProfile() {
        return this.dialog.open(ReportProfileComponent, {
            width: '40vw',
            height: '70vh'
        }).afterClosed();
    }

    public rateParticipant(data) {
        return this.dialog.open(RateParticipantComponent, {
            data: data,
            width: '50vw',
            height: '80vh'
        }).afterClosed();
    }

    public shareCollection(type: string, Id: string, title: string, cohortId?: string) {
        return this.dialog.open(ShareDialogComponent,
            {
                data: {
                    type: type,
                    id: Id,
                    cohortId: cohortId,
                    title: title
                },
                width: '40vw',
                height: '31vh'
            }
        ).afterClosed();
    }

    public dateConflictDialog() {
        return this.dialog.open(DateConflictDialogComponent, {
            width: '40vw',
            height: '31vh'
        }).afterClosed();
    }

}
