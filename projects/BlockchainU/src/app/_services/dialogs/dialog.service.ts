import { SignupComponentDialogComponent } from './signup-dialog/signup-dialog.component';
import { LoginComponentDialog } from './login-dialog/login-dialog.component';
import { AddCardDialogComponent } from './add-card-dialog/add-card-dialog.component';
import { LiveSessionDialogComponent } from './live-session-dialog/live-session-dialog.component';
import { MultiselectTopicDialogComponent } from './multiselect-topic-dialog/multiselect-topic-dialog.component';
import { Observable } from 'rxjs';
import { VerifyIdDialogComponent } from './verify-id-dialog/verify-id-dialog.component';
import { VerifyEmailDialogComponent } from './verify-email-dialog/verify-email-dialog.component';
import { IdPolicyDialogComponent } from './id-policy-dialog/id-policy-dialog.component';
import { VideoDialogComponent } from './video-dialog/video-dialog.component';
import { VerifyPhoneDialogComponent } from './verify-phone-dialog/verify-phone-dialog.component';
import { CollectionGridDialogComponent } from './collection-grid-dialog/collection-grid-dialog.component';
import { MatDialogRef, MatDialog } from '@angular/material';
import { Injectable } from '@angular/core';
import { ProfilePopupCardComponent } from './profile-popup-card/profile-popup-card.component';
import { RequestPasswordDialogComponent } from './forgot-pwd-dialog/forgot-pwd-dialog.component';
import { ExitCollectionDialogComponent } from './exit-collection-dialog/exit-collection-dialog.component';
import { CancelCollectionDialogComponent } from './cancel-collection-dialog/cancel-collection-dialog.component';
import { DeleteCollectionDialogComponent } from './delete-collection-dialog/delete-collection-dialog.component';
import { EditCalendarDialogComponent } from './edit-calendar-dialog/edit-calendar-dialog.component';
import { AddTopicDialogComponent } from './add-topic-dialog/add-topic-dialog.component';
import { AddLanguageDialogComponent } from './add-language-dialog/add-language-dialog.component';
import {
	CalendarEvent
} from 'angular-calendar';
import { FormGroup } from '@angular/forms';
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
import { MessageParticipantDialogComponent } from './message-participant-dialog/message-participant-dialog.component';
import { StudentAssessmentDialogComponent } from './student-assessment-dialog/student-assessment-dialog.component';
import { GyanTransactionsDialogComponent } from './gyan-transactions-dialog/gyan-transactions-dialog.component';
import { RequestCommunityDialogComponent } from './request-community-dialog/request-community-dialog.component';
import { ScholarshipDialogComponent } from './scholarship-dialog/scholarship-dialog.component';
import { GenerateKnowledgeStoryComponent } from './generate-knowledge-story/generate-knowledge-story.component';
import { RequestKnowledgeStoryComponent } from './request-knowledge-story/request-knowledge-story.component';
import { ConfirmPasswordDialogComponent } from './confirm-password-dialog/confirm-password-dialog.component';
import { AddViewerDialogComponent } from './add-viewer-dialog/add-viewer-dialog.component';
import { GyanPromptComponent } from './gyan-prompt/gyan-prompt.component';
import { AddCommunityDialogComponent } from './add-community-dialog/add-community-dialog.component';
import { ViewParticipantsComponent } from './view-participants/view-participants.component';
import { CreateAccreditationDialogComponent } from './create-accreditation-dialog/create-accreditation-dialog.component';
import { SelectFieldDialogComponent } from './select-field-dialog/select-field-dialog.component';
import { CertificateVerificationComponent } from './certificate-verification/certificate-verification.component';
import { CollectionStandardsDialogComponent } from './collection-standards-dialog/collection-standards-dialog.component';
import { TermsAndConditionsDialogComponent } from './terms-and-conditions-dialog/terms-and-conditions-dialog.component';
import { CancelCohortDialogComponent } from './cancel-cohort-dialog/cancel-cohort-dialog.component';
import { OnboardingDialogComponent } from './onboarding-dialog/onboarding-dialog.component';
import { AddPromoCodeDialogComponent } from './add-promo-code-dialog/add-promo-code-dialog.component';
import { ViewPromocodeDialogComponent } from './view-promocode-dialog/view-promocode-dialog.component';
import { AddParticipantDialogComponent } from './add-participant-dialog/add-participant-dialog.component';
import { ConfirmDeleteAccountComponent } from './confirm-delete-account/confirm-delete-account.component';
import { AddImageDialogComponent } from './add-image-dialog/add-image-dialog.component';
import { AskQuestionDialogComponent } from './ask-question-dialog/ask-question-dialog.component';
import { SubmissionReviewDialogComponent } from './submission-review-dialog/submission-review-dialog.component';
import { WinnerDialogComponent } from './winner-dialog/winner-dialog.component';
import { ViewQuizSubmissionComponent } from './view-quiz-submission/view-quiz-submission.component';
import { ShowRSVPPopupComponent } from './show-rsvp-participants-dialog/show-rsvp-dialog.component';
import { ContentOnlineDialogComponent } from './content-online-dialog/content-online-dialog.component';
import { ContentQuizDialogComponent } from './content-quiz-dialog/content-quiz-dialog.component';
import { ContentVideoDialogComponent } from './content-video-dialog/content-video-dialog.component';
import { ContentProjectDialogComponent } from './content-project-dialog/content-project-dialog.component';
import { ContentInpersonDialogComponent } from './content-inperson-dialog/content-inperson-dialog.component';
@Injectable()
export class DialogsService {

	constructor(public dialog: MatDialog
	) { }

	/**
	 * Open sign-up dialog
	 * @param {string} returnTo
	 * @returns {Observable<any>}
	 */
	public openSignup(returnTo: string) {
		let dialogRef: MatDialogRef<SignupComponentDialogComponent>;

		dialogRef = this.dialog.open(SignupComponentDialogComponent, {
			panelClass: 'responsive-dialog',
			width: '30vw',
			data: {
				returnTo: returnTo
			}
		});
		return dialogRef.afterClosed();
	}

	/**
	 * Open login dialog.
	 * @returns {Observable<any>}
	 */
	public openLogin() {
		console.log('openLogin dialog');
		const dialogRef1: MatDialogRef<LoginComponentDialog> = this.dialog.open(LoginComponentDialog, {
			panelClass: 'responsive-dialog',
			maxHeight: '90vh'
		});
		return dialogRef1.afterClosed();
	}

	/**
	 * Open dialog to add a new credit/debit card to user's Stripe account.
	 * @returns {Observable<any>}
	 */
	public addCard() {
		let dialogRef4: MatDialogRef<AddCardDialogComponent>;

		dialogRef4 = this.dialog.open(AddCardDialogComponent, {
			panelClass: 'responsive-dialog', width: '610px',
			height: '380px'
		});
		return dialogRef4.afterClosed();
	}

	/**
	 * Open dialog to verify Government ID of a user.
	 * @returns {Observable<any>}
	 */
	public openIdVerify() {
		let dialogRef5: MatDialogRef<VerifyIdDialogComponent>;

		dialogRef5 = this.dialog.open(VerifyIdDialogComponent, {
			panelClass: 'responsive-dialog', width: '60vw',
			height: '90vh'
		});
		return dialogRef5.afterClosed();
	}

	/**
	 * Open dialog to verify Email ID of a user.
	 * @returns {Observable<any>}
	 */
	public openEmailVerify() {
		let dialogRef6: MatDialogRef<VerifyEmailDialogComponent>;

		dialogRef6 = this.dialog.open(VerifyEmailDialogComponent, {
			panelClass: 'responsive-dialog', width: '50vw',
			height: '80vh'
		});
		return dialogRef6.afterClosed();
	}

	/**
	 * Open dialog to show ID card policy of Blockchain University
	 * @returns {Observable<any>}
	 */
	public openIdPolicy() {
		let dialogRef7: MatDialogRef<IdPolicyDialogComponent>;

		dialogRef7 = this.dialog.open(IdPolicyDialogComponent, {
			panelClass: 'responsive-dialog', width: '45vw',
			height: '100vh'
		});
		return dialogRef7.afterClosed();
	}

	/**
	 * Open dialog to show a pre-recorded video on the home page.
	 * @param {string} url
	 * @returns {Observable<any>}
	 */
	public openVideo(url: string) {
		let dialogRef8: MatDialogRef<VideoDialogComponent>;

		dialogRef8 = this.dialog.open(VideoDialogComponent, {
			width: '1000px',
			panelClass: 'video-popup',
			data: url
		});
		return dialogRef8.afterClosed();
	}

	/**
	 * Open dialog to verify phone number of the user.
	 * @returns {Observable<any>}
	 */
	public openPhoneVerify() {
		let dialogRef9: MatDialogRef<VerifyPhoneDialogComponent>;

		dialogRef9 = this.dialog.open(VerifyPhoneDialogComponent, {
			panelClass: 'responsive-dialog', width: '50vw',
			height: '80vh'
		});
		return dialogRef9.afterClosed();
	}

	/**
	 * Open dialog to show the on-boaring flow for a new user.
	 * @param {boolean} isSkippable - whether the onboarding flow is skippable by the user or not.
	 * @returns {Observable<any>}
	 */
	public openOnboardingDialog(isSkippable?: boolean) {
		let dialogRef: MatDialogRef<OnboardingDialogComponent>;

		dialogRef = this.dialog.open(OnboardingDialogComponent, {
			panelClass: 'responsive-dialog',
			width: '30vw',
			disableClose: true,
			data: {
				isSkippable: isSkippable
			}
		});
		return dialogRef.afterClosed();
	}

	/**
	 * Open dialog to view a particular submission entry to a quiz
	 * @param content
	 * @returns {Observable<any>}
	 */
	public openViewQuizSubmissionDialog(content: any) {
		let dialogRef: MatDialogRef<ViewQuizSubmissionComponent>;

		dialogRef = this.dialog.open(ViewQuizSubmissionComponent, {
			panelClass: 'responsive-dialog',
			width: '45vw',
			height: '100vh',
			disableClose: true,
			data: {
				content: content
			}
		});
		return dialogRef.afterClosed();
	}

	/**
	 * Open dialog to allow user to search and select multiple new topics to follow.
	 * @param type
	 * @param inputs
	 * @returns {Observable<any>}
	 */
	public openFollowTopicDialog(type, inputs) {
		let dialogRef5: MatDialogRef<MultiselectTopicDialogComponent>;

		dialogRef5 = this.dialog.open(MultiselectTopicDialogComponent,
			{
				disableClose: true,
				hasBackdrop: true,
				panelClass: 'responsive-dialog', width: '50vw',
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

	/**
	 * Open dialog to show all course cards in a grid like format
	 * @param title
	 * @param collections
	 * @returns {Observable<any>}
	 */
	public openCollectionGrid(title, collections) {
		let dialogRef: MatDialogRef<CollectionGridDialogComponent>;

		dialogRef = this.dialog.open(CollectionGridDialogComponent, {
			panelClass: 'responsive-dialog', width: '80vw',
			height: '80vh',
			data: {
				title: title,
				collections: collections
			}
		});

		return dialogRef.afterClosed();
	}

	/**
	 * Open dialog to confirm deleting of a course by a teacher.
	 * @param collection
	 * @returns {Observable<any>}
	 */
	openDeleteCollection(collection: any) {
		const dialogRef = this.dialog.open(DeleteCollectionDialogComponent, {
			data: collection,
			panelClass: 'responsive-dialog', width: '30vw'
		});

		return dialogRef.afterClosed();
	}

	/**
	 * Open dialog to confirm dropping out of a course.
	 * @param {string} collectionId
	 * @param {string} userId
	 * @param {string} type
	 * @returns {Observable<any>}
	 */
	openExitCollection(collectionId: string, userId: string, type: string) {
		const dialogRef = this.dialog.open(ExitCollectionDialogComponent, {
			data: {
				collectionId: collectionId,
				userId: userId,
				type: type
			},
			panelClass: 'responsive-dialog', width: '30vw'
		});
		return dialogRef.afterClosed();
	}

	/**
	 * Open dialog to confirm deleting a community by its manager
	 * @param community
	 * @returns {Observable<any>}
	 */
	openDeleteCommunity(community: any) {
		const dialogRef = this.dialog.open(DeleteCommunityDialogComponent, {
			data: community,
			panelClass: 'responsive-dialog', width: '30vw'
		});

		return dialogRef.afterClosed();
	}

	/**
	 * Open dialog to confirm dropping out of a community
	 * @param {string} communityId
	 * @param {string} userId
	 * @returns {Observable<any>}
	 */
	openExitCommunity(communityId: string, userId: string) {
		const dialogRef = this.dialog.open(ExitCommunityDialogComponent, {
			data: {
				communityId: communityId,
				userId: userId
			},
			panelClass: 'responsive-dialog', width: '30vw'
		});
		return dialogRef.afterClosed();
	}

	/**
	 * Open dialog to confirm cancelling a course by a teacher.
	 * @param collection
	 * @returns {Observable<any>}
	 */
	openCancelCollection(collection: any) {
		const dialogRef = this.dialog.open(CancelCollectionDialogComponent, {
			data: collection,
			panelClass: 'responsive-dialog', width: '30vw'
		});
		return dialogRef.afterClosed();
	}

	/**
	 * Open dialog to confirm deleting a cohort from a course.
	 * @param {string} calendarId
	 * @returns {Observable<any>}
	 */
	openDeleteCohort(calendarId: string) {
		return this.dialog.open(DeleteCohortDialogComponent, {
			data: calendarId,
			panelClass: 'responsive-dialog', width: '30vw'
		}).afterClosed();
	}

	/**
	 * Open dialog to show a user's profile preview in a popup format
	 * @param config
	 * @returns {MatDialogRef<ProfilePopupCardComponent, any>}
	 */
	openProfilePopup(config: any) {
		return this.dialog.open(ProfilePopupCardComponent, config);
	}

	/**
	 * Open dialog to ask user's email to send password recovery email.
	 * @param {string} email
	 * @returns {MatDialogRef<RequestPasswordDialogComponent, any>}
	 */
	openForgotPassword(email: string) {
		return this.dialog.open(RequestPasswordDialogComponent,
			{
				data: email,
				panelClass: 'responsive-dialog',
				width: '55vw',
				height: '75vh'
			});
	}

	/**
	 * Open dialog to show existing cohorts and add new cohorts to a course.
	 * @param collection
	 * @param contents
	 * @param calendars
	 * @param allItinerary
	 * @param participants
	 * @param {CalendarEvent[]} events
	 * @param {string} userId
	 * @param {Date} startDate
	 * @param {Date} endDate
	 * @returns {Observable<boolean>}
	 */
	public editCalendar(collection, contents, calendars, allItinerary, participants, events: CalendarEvent[], userId: string, startDate: Date, endDate: Date): Observable<boolean> {
		let dialogRef: MatDialogRef<EditCalendarDialogComponent>;

		dialogRef = this.dialog.open(EditCalendarDialogComponent,
			{
				panelClass: 'responsive-dialog',
				width: '100vw',
				height: '95vh'
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

	/**
	 * Open dialog to add a new supported topic from admin console.
	 * @returns {Observable<any>}
	 */
	public addNewTopic() {
		let dialogRef: MatDialogRef<AddTopicDialogComponent>;

		dialogRef = this.dialog.open(AddTopicDialogComponent, {
			panelClass: 'responsive-dialog'
		});

		return dialogRef.afterClosed();

	}

	/**
	 * Open dialog to add a new supported language from admin console
	 * @returns {Observable<any>}
	 */
	public addNewLanguage() {
		let dialogRef: MatDialogRef<AddLanguageDialogComponent>;

		dialogRef = this.dialog.open(AddLanguageDialogComponent, {
			panelClass: 'responsive-dialog'
		});
		return dialogRef.afterClosed();
	}

	/**
	 * Open dialog to start a live video session screen using Twilio video rooms.
	 * @param data
	 * @returns {Observable<any>}
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

	/**
	 * Open dialog to show available cohorts in a course and open the page of any one of them.
	 * @param allItineraries
	 * @param mode
	 * @param participants
	 * @param userType
	 * @param collectionType
	 * @param maxSeats
	 * @param accountApproved
	 * @param userId
	 * @returns {Observable<any>}
	 */
	public selectDateDialog(allItineraries, mode, participants, userType, collectionType, maxSeats, accountApproved, userId) {
		return this.dialog.open(SelectDateDialogComponent, {
			panelClass: 'responsive-dialog', width: '45vw',
			height: '100vh',
			data: {
				itineraries: allItineraries,
				mode: mode,
				participants: participants,
				userType: userType,
				collectionType: collectionType,
				maxSeats: maxSeats,
				accountApproved: accountApproved,
				userId: userId
			}
		}).afterClosed();
	}

	/**
	 * Open dialog to inform teacher that his course will be cloned to allow further editing.
	 * @param collection
	 * @returns {Observable<any>}
	 */
	public openCollectionCloneDialog(collection: any) {
		return this.dialog.open(CollectionCloneDialogComponent,
			{
				data: collection,
				disableClose: true, hasBackdrop: true, panelClass: 'responsive-dialog', width: '40vw'
			}).afterClosed();
	}

	/**
	 * Open dialog to confirm submission of a course for review.
	 * @param collection
	 * @returns {Observable<any>}
	 */
	public openCollectionSubmitDialog(collection: any) {
		return this.dialog.open(CollectionSubmitDialogComponent,
			{
				data: collection,
				disableClose: true, hasBackdrop: true, panelClass: 'responsive-dialog', width: '40vw'
			}).afterClosed();
	}

	/**
	 * Open dialog to view a particular submission made for a project in a course.
	 * @param userType
	 * @param submission
	 * @param peerHasSubmission
	 * @param collectionId
	 * @returns {Observable<any>}
	 */
	public submissionView(userType, submission, peerHasSubmission, collectionId) {
		return this.dialog.open(SubmissionViewComponent, {
			data: {
				userType: userType,
				submission: submission,
				peerHasSubmission: peerHasSubmission,
				collectionId: collectionId
			},
			panelClass: 'responsive-dialog', width: '45vw',
			height: '100vh'
		}).afterClosed();
	}

	/**
	 * Open dialog to submit a new entry for a project in a course.
	 * @param data
	 * @returns {Observable<any>}
	 */
	public submitEntry(data) {
		return this.dialog.open(SubmitEntryComponent, {
			data: data,
			panelClass: 'responsive-dialog', width: '45vw',
			height: '100vh'
		}).afterClosed();
	}

	/**
	 * Open dialog to view all submissions made on a project of a course.
	 * @param data
	 * @returns {Observable<any>}
	 */
	public viewEntry(data) {
		return this.dialog.open(ViewEntryDialogComponent, {
			data: data,
			panelClass: 'responsive-dialog', width: '45vw',
			height: '100vh'
		}).afterClosed();
	}

	/**
	 * Open dialog to show sharing information and invite friends to join a course.
	 * @param collection
	 * @returns {Observable<any>}
	 */
	public inviteFriends(collection) {
		return this.dialog.open(InviteFriendsDialogComponent, {
			data: {
				url: collection.type + '/' + collection.id,
				object: collection
			},
			panelClass: 'responsive-dialog', width: '40vw'
		}).afterClosed();
	}

	/**
	 * Open dialog to report a user profile.
	 * @returns {Observable<any>}
	 */
	public reportProfile() {
		return this.dialog.open(ReportProfileComponent, {
			panelClass: 'responsive-dialog', width: '40vw',
			height: '70vh'
		}).afterClosed();
	}

	/**
	 * Open dialog to rate a participant of a course.
	 * @param data
	 * @returns {Observable<any>}
	 */
	public rateParticipant(data) {
		return this.dialog.open(RateParticipantComponent, {
			data: data,
			panelClass: 'responsive-dialog', width: '50vw',
			height: '80vh'
		}).afterClosed();
	}

	/**
	 * Open dialog to send a message to a user.
	 * @param data
	 * @returns {Observable<any>}
	 */
	public messageParticipant(data) {
		return this.dialog.open(MessageParticipantDialogComponent, {
			data: data,
			panelClass: 'responsive-dialog', width: '50vw',
			height: '60vh'
		}).afterClosed();
	}

	/**
	 * Open dialog to share a course on any social media website.
	 * @param {string} type
	 * @param {string} Id
	 * @param {string} title
	 * @param {string} description
	 * @param {string} headline
	 * @param {string} imageUrl
	 * @param {string} cohortId
	 * @param {boolean} isTeacher
	 * @param {string} customUrl
	 * @returns {Observable<any>}
	 */
	public shareCollection(type: string, Id: string, title: string, description: string, headline: string, imageUrl: string, cohortId?: string, isTeacher?: boolean, customUrl?: string) {
		return this.dialog.open(ShareDialogComponent,
			{
				data: {
					type: type,
					id: Id,
					cohortId: cohortId,
					title: title,
					description: description,
					headline: headline,
					image: imageUrl,
					isTeacher: isTeacher,
					customUrl: customUrl
				},
				panelClass: 'responsive-dialog', width: '40vw'
			}
		).afterClosed();
	}

	/**
	 * Open dialog to show the conflicting dates when adding new calendar to a course.
	 * @returns {Observable<any>}
	 */
	public dateConflictDialog() {
		return this.dialog.open(DateConflictDialogComponent, {
			panelClass: 'responsive-dialog', width: '40vw',
			height: '31vh'
		}).afterClosed();
	}

	/**
	 * Open dialog to make assessments of participants in a course and issue them smart certificates.
	 * @param data
	 * @returns {Observable<any>}
	 */
	public studentAssessmentDialog(data: any) {
		return this.dialog.open(StudentAssessmentDialogComponent, {
			panelClass: 'responsive-dialog',
			width: '75vw',
			height: '100vh',
			data: data,
			disableClose: true
		}).afterClosed();
	}

	/**
	 * Open dialog to view all Gyan transactions of a user
	 * @param data
	 * @returns {Observable<any>}
	 */
	public gyanTransactionsDialog(data: any) {
		return this.dialog.open(GyanTransactionsDialogComponent, {
			panelClass: 'responsive-dialog',
			width: '55vw',
			height: '90vh',
			data: data
		}).afterClosed();
	}

	/**
	 * Open dialog to allow users to put in a request for a new community on the platform
	 * @returns {MatDialogRef<RequestCommunityDialogComponent, any>}
	 */
	public requestCommunityDialog() {
		return this.dialog.open(RequestCommunityDialogComponent, {
			panelClass: 'responsive-dialog',
			width: '40vw',
			height: '50vh'
		});
	}

	/**
	 * Open dialog to create a new scholarship program.
	 * @param data
	 * @returns {Observable<any>}
	 */
	public createScholarshipDialog(data?: any) {
		return this.dialog.open(ScholarshipDialogComponent, {
			panelClass: 'responsive-dialog',
			width: '55vw',
			height: '75vh',
			data: data ? data : {}
		}).afterClosed();
	}

	/**
	 * Open dialog to create a new knowledge story of the currently logged in user.
	 * @param userId
	 * @param inputs
	 * @returns {Observable<any>}
	 */
	public generateKnowledgeStoryDialog(userId, inputs) {
		const dialogRef5 = this.dialog.open(GenerateKnowledgeStoryComponent,
			{
				panelClass: 'responsive-dialog',
				width: '55vw',
				height: '75vh',
			}
		);
		dialogRef5.componentInstance.searchUrl = inputs.searchTopicURL;
		dialogRef5.componentInstance.title = inputs.title;
		dialogRef5.componentInstance.minSelection = inputs.minSelection;
		dialogRef5.componentInstance.maxSelection = inputs.maxSelection;
		dialogRef5.componentInstance.suggestedTopics = inputs.suggestedTopics;
		dialogRef5.componentInstance.data = {
			searchUrl: inputs.searchTopicURL,
			selected: [],
			userId: userId
		};
		return dialogRef5.afterClosed();
	}

	/**
	 * Open dialog to request to view knowledge story of any user
	 * @param userId
	 * @param inputs
	 * @returns {Observable<any>}
	 */
	public requestStoryDialog(userId, inputs) {
		const dialogRef5 = this.dialog.open(RequestKnowledgeStoryComponent,
			{
				panelClass: 'responsive-dialog',
				width: '55vw',
				height: '80vh',
			}
		);
		dialogRef5.componentInstance.searchUrl = inputs.searchTopicURL;
		dialogRef5.componentInstance.title = inputs.title;
		dialogRef5.componentInstance.minSelection = inputs.minSelection;
		dialogRef5.componentInstance.maxSelection = inputs.maxSelection;
		dialogRef5.componentInstance.suggestedTopics = inputs.suggestedTopics;
		dialogRef5.componentInstance.data = {
			searchUrl: inputs.searchTopicURL,
			selected: [],
			userId: userId
		};

		return dialogRef5.afterClosed();
	}

	/**
	 * Open dialog to confirm password of currently logged in user
	 * @returns {Observable<any>}
	 */
	public confirmPasswordDialog() {
		const dialogRef5 = this.dialog.open(ConfirmPasswordDialogComponent,
			{
				panelClass: 'responsive-dialog',
				width: '55vw',
				height: '75vh',
			}
		);
		return dialogRef5.afterClosed();
	}

	/**
	 * Open dialog to give a user permission to view your knowledge story.
	 * @returns {Observable<any>}
	 */
	public addViewer() {
		const dialogRef5 = this.dialog.open(AddViewerDialogComponent,
			{
				panelClass: 'responsive-dialog',
				width: '55vw',
				height: '75vh',
			}
		);
		return dialogRef5.afterClosed();
	}

	/**
	 * Open dialog to show an error when the amount of Gyan entered on the course by a teacher is more than his current Gyan.
	 * @param {number} availableGyan
	 * @param {number} requiredGyan
	 * @returns {Observable<any>}
	 */
	public showGyanNotif(availableGyan: number, requiredGyan: number) {
		const dialogRef5 = this.dialog.open(GyanPromptComponent,
			{
				panelClass: 'responsive-dialog',
				width: '55vw',
				data: {
					availableGyan: availableGyan,
					requiredGyan: requiredGyan
				}
			}
		);
		return dialogRef5.afterClosed();
	}

	/**
	 * Open dialog to create a new community
	 * @param data
	 * @returns {Observable<any>}
	 */
	public createCommunityDialog(data?: any) {
		return this.dialog.open(AddCommunityDialogComponent, {
			panelClass: 'responsive-dialog',
			width: '80vw',
			height: '75vh',
			data: data ? data : {}
		}).afterClosed();
	}

	/**
	 * Open dialog to view the list of participants
	 * @param participants
	 * @param {string} collectionId
	 * @param calendarId
	 * @param {string} userType
	 * @param chatRoomId
	 * @param calendars
	 * @param invites
	 * @returns {Observable<any>}
	 */
	public viewParticipantsDialog(participants: any, collectionId: string, calendarId: string, userType?: string, chatRoomId?: string, calendars?: any, invites?: any) {
		return this.dialog.open(ViewParticipantsComponent, {
			data: {
				participants: participants,
				collectionId: collectionId,
				userType: userType ? userType : '',
				chatRoomId: chatRoomId,
				calendars: calendars,
				invites: invites
			},
			panelClass: 'responsive-dialog',
			width: '45vw',
			height: '100vh'
		}).afterClosed();
	}

	/**
	 * Open a dialog to create a new accreditation that users can subscribe to.
	 * @param data
	 * @returns {Observable<any>}
	 */
	public createAccreditationDialog(data?: any) {
		return this.dialog.open(CreateAccreditationDialogComponent, {
			panelClass: 'responsive-dialog',
			width: '55vw',
			height: '56vh',
			data: data ? data : {}
		}).afterClosed();
	}

	/**
	 * Open dialog to select which field to add a new certificate in the certificate designer
	 * @param {Array<FormGroup>} fieldsArray
	 * @returns {Observable<any>}
	 */
	public viewFields(fieldsArray: Array<FormGroup>) {
		return this.dialog.open(SelectFieldDialogComponent, {
			panelClass: 'responsive-dialog',
			width: '40vw',
			height: '40vh',
			data: fieldsArray
		}).afterClosed();
	}

	/**
	 * Open one0x certificate verification dialog
	 * @param data
	 * @returns {Observable<any>}
	 */
	public verifyCertificateDialog(data?: any) {
		return this.dialog.open(CertificateVerificationComponent, {
			panelClass: ['responsive-dialog', 'noScrollY'],
			width: '45vw',
			maxHeight: '90vh',
			data: data ? data : {}
		}).afterClosed();
	}

	/**
	 * Open dialog to show Teaching standards for Blockchain University
	 * @param {string} type
	 * @returns {Observable<any>}
	 */
	public collectionStandardsDialog(type?: string) {
		return this.dialog.open(CollectionStandardsDialogComponent, {
			panelClass: 'responsive-dialog',
			width: '55vw',
			height: '56vh',
			data: type ? type : null
		}).afterClosed();
	}

	/**
	 * Open Terms and condition dialog for Blockchain University
	 * @param {string} type
	 * @returns {Observable<any>}
	 */
	public termsAndConditionsDialog(type?: string) {
		return this.dialog.open(TermsAndConditionsDialogComponent, {
			panelClass: 'responsive-dialog',
			width: '55vw',
			height: '56vh',
			data: type ? type : null
		}).afterClosed();
	}

	/**
	 * Open dialog to confirm the cancelling of a cohort by a teacher
	 * @param {string} calendarId
	 * @returns {Observable<any>}
	 */
	public cancelCohortDialog(calendarId: string) {
		const dialogRef = this.dialog.open(CancelCohortDialogComponent, {
			data: calendarId,
			panelClass: 'responsive-dialog', width: '30vw'
		});

		return dialogRef.afterClosed();
	}

	/**
	 * Open dialog to add a new promo code to a course
	 * @param {string} collectionId
	 * @returns {Observable<any>}
	 */
	public addPromoCodeDialog(collectionId: string) {
		const dialogRef = this.dialog.open(AddPromoCodeDialogComponent, {
			data: { collectionId: collectionId },
			panelClass: 'responsive-dialog',
			width: '55vw',
			height: '85vh'
		});

		return dialogRef.afterClosed();
	}

	/**
	 * Open dialog to view available promo codes for a course
	 * @param {string} collectionId
	 * @returns {Observable<any>}
	 */
	public viewPromoCodeDialog(collectionId: string) {
		const dialogRef = this.dialog.open(ViewPromocodeDialogComponent, {
			data: collectionId,
			panelClass: 'responsive-dialog',
			width: '55vw',
			height: '80vh'
		});

		return dialogRef.afterClosed();
	}

	/**
	 * Open dialog to add or invite a new participant to a course. Also supports bulk invitations to participants.
	 * @param {string} collectionId
	 * @param {string} calendarId
	 * @returns {Observable<any>}
	 */
	public addParticipant(collectionId: string, calendarId?: string) {
		const dialogRef = this.dialog.open(AddParticipantDialogComponent, {
			data: { collectionId: collectionId, calendarId: calendarId },
			panelClass: 'responsive-dialog',
			width: '55vw',
			height: '80vh'
		});

		return dialogRef.afterClosed();
	}

	/**
	 * Open dialog to confirm before deleting a user account.
	 * @param {string} userId
	 * @returns {Observable<any>}
	 */
	public confirmDeleteAccount(userId: string) {
		const dialogRef = this.dialog.open(ConfirmDeleteAccountComponent, {
			data: userId,
			panelClass: 'responsive-dialog',
			width: '30vw',
			height: '40vh'
		});
		return dialogRef.afterClosed();
	}

	/**
	 * Open dialog to add a new image or select one from user's gallery in the description section of course wizards.
	 * @returns {Observable<any>}
	 */
	public addImageDialog() {
		const dialogRef = this.dialog.open(AddImageDialogComponent, {
			panelClass: 'responsive-dialog',
			width: '55vw',
			height: '90vh'
		});
		return dialogRef.afterClosed();
	}

	/**
	 * Open dialog to allow user to ask a new question within any selected community.
	 * @returns {Observable<any>}
	 */
	public askQuestion() {
		const dialogRef = this.dialog.open(AskQuestionDialogComponent, {
			panelClass: 'responsive-dialog',
			width: '55vw',
			minHeight: '50vh',
			maxHeight: '90vh'
		});
		return dialogRef.afterClosed();
	}

	/**
	 * Open dialog to assess submissions made towards a bounty challenge.
	 * @param {string} collectionId
	 * @returns {Observable<any>}
	 */
	public assessSubmissions(collectionId: string) {
		const dialogRef = this.dialog.open(SubmissionReviewDialogComponent, {
			data: collectionId,
			panelClass: 'responsive-dialog',
			width: '80vw',
			minHeight: '50vh',
			maxHeight: '90vh'
		});
		return dialogRef.afterClosed();
	}

	/**
	 * Open dialog to announce rewards to winners of a bounty and ask them to update their delivery address
	 * @param rewardData
	 * @param collectionData
	 * @returns {Observable<any>}
	 */
	public winnersDialog(rewardData: any, collectionData: any) {
		const dialogRef = this.dialog.open(WinnerDialogComponent, {
			data: {
				rewardData: rewardData,
				collectionData: collectionData
			},
			panelClass: 'responsive-dialog',
			width: '80vw',
			maxHeight: '90vh'
		});
		return dialogRef.afterClosed();
	}

	/**
	 * Open dialog to show all RSVPs received for an in person session.
	 * @param userType
	 * @param content
	 * @param attendees
	 * @param collectionId
	 * @returns {Observable<any>}
	 */
	public showRSVP(userType, content, attendees, collectionId) {
		return this.dialog.open(ShowRSVPPopupComponent, {
			data: {
				userType: userType,
				contentId: content.id,
				attendies: attendees,
				experience: collectionId
			},
			panelClass: 'responsive-dialog',
			width: '45vw',
			height: '90vh'
		}).afterClosed();
	}

	/**
	 * Open dialog for content type: ONLINE
	 * @param content
	 * @param startDate
	 * @param endDate
	 * @param {string} userType
	 * @param collection
	 * @param {string} calendarId
	 * @returns {Observable<any>}
	 */
	public onlineContentDialog(content: any, startDate: any, endDate: any, userType: string, collection: any, calendarId: string) {
		return this.dialog.open(ContentOnlineDialogComponent, {
			data: {
				content: content,
				startDate: startDate,
				endDate: endDate,
				userType: userType,
				collectionId: collection.id,
				collection: collection,
				calendarId: calendarId
			},
			panelClass: 'responsive-dialog',
			width: '45vw',
			height: '100vh'
		}).afterClosed();
	}

	/**
	 * Open dialog for content type: QUIZ
	 * @param content
	 * @param startDate
	 * @param endDate
	 * @param {string} userType
	 * @param collection
	 * @param {string} calendarId
	 * @param {Array<any>} participants
	 * @returns {Observable<any>}
	 */
	public quizContentDialog(content: any, startDate: any, endDate: any, userType: string, collection: any, calendarId: string, participants: Array<any>) {
		return this.dialog.open(ContentQuizDialogComponent, {
			data: {
				content: content,
				startDate: startDate,
				endDate: endDate,
				userType: userType,
				collectionId: collection.id,
				collection: collection,
				calendarId: calendarId,
				participants: participants
			},
			panelClass: 'responsive-dialog',
			disableClose: true,
			width: '45vw',
			height: '100vh'
		}).afterClosed();

	}

	/**
	 * Open dialog for content type: VIDEO
	 * @param content
	 * @param startDate
	 * @param endDate
	 * @param {string} userType
	 * @param collection
	 * @param {string} calendarId
	 * @returns {Observable<any>}
	 */
	public videoContentDialog(content: any, startDate: any, endDate: any, userType: string, collection: any, calendarId: string) {
		return this.dialog.open(ContentVideoDialogComponent, {
			data: {
				content: content,
				startDate: startDate,
				endDate: endDate,
				userType: userType,
				collectionId: collection.id,
				collection: collection,
				calendarId: calendarId
			},
			panelClass: 'responsive-dialog',
			width: '45vw',
			height: '100vh'
		}).afterClosed();
	}

	/**
	 * Open dialog for content type: PROJECT
	 * @param content
	 * @param startDate
	 * @param endDate
	 * @param {string} userType
	 * @param {boolean} peerHasSubmission
	 * @param collection
	 * @param {string} calendarId
	 * @returns {Observable<any>}
	 */
	public projectContentDialog(content: any, startDate: any, endDate: any, userType: string, peerHasSubmission: boolean, collection: any, calendarId: string) {
		return this.dialog.open(ContentProjectDialogComponent, {
			data: {
				content: content,
				startDate: startDate,
				endDate: endDate,
				userType: userType,
				peerHasSubmission: peerHasSubmission,
				collectionId: collection.id,
				collection: collection,
				calendarId: calendarId
			},
			panelClass: 'responsive-dialog',
			width: '45vw',
			height: '100vh'
		}).afterClosed();
	}

	/**
	 * Open dialog for content type: IN-PERSON
	 * @param content
	 * @param startDate
	 * @param endDate
	 * @param {string} userType
	 * @param collection
	 * @param {string} calendarId
	 * @param {Array<any>} participants
	 * @returns {Observable<any>}
	 */
	public inPersonContentDialog(content: any, startDate: any, endDate: any, userType: string, collection: any, calendarId: string, participants: Array<any>) {
		return this.dialog.open(ContentInpersonDialogComponent, {
			data: {
				content: content,
				startDate: startDate,
				endDate: endDate,
				userType: userType,
				collectionId: collection.id,
				collection: collection,
				calendarId: calendarId,
				participants: participants
			},
			panelClass: 'responsive-dialog',
			width: '45vw',
			height: '100vh'
		}).afterClosed();
	}

	/**
	 * Close all open dialogs
	 */
	public closeAll() {
		this.dialog.closeAll();
	}

}
