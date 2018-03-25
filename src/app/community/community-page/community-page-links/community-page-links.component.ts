import { Component, OnInit } from '@angular/core';
import {CommunityPageComponent} from '../community-page.component';
import {ActivatedRoute} from '@angular/router';
import {CommunityService} from '../../../_services/community/community.service';
import {AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {CookieUtilsService} from '../../../_services/cookieUtils/cookie-utils.service';
import {QuestionService} from '../../../_services/question/question.service';
import {CommentService} from '../../../_services/comment/comment.service';
import {MatSnackBar} from '@angular/material';
import {ProfileService} from '../../../_services/profile/profile.service';

@Component({
  selector: 'app-community-page-links',
  templateUrl: './community-page-links.component.html',
  styleUrls: ['./community-page-links.component.scss']
})
export class CommunityPageLinksComponent implements OnInit {

    public activeTab;
    public communityId;
    public userId;
    public linksForm: FormGroup;
    public loadingLinks = false;
    public links: any;
    public loggedInUser;
    public loadingUser = true;
    public linksFilter = 'descending';
    public busyLink = false;
    public userType = 'public';

    constructor(activatedRoute: ActivatedRoute,
                public communityPageComponent: CommunityPageComponent,
                public _cookieUtilsService: CookieUtilsService,
                public _questionsService: QuestionService,
                public _communityService: CommunityService,
                public _commentService: CommentService,
                public _fb: FormBuilder,
                public snackBar: MatSnackBar,
                public _profileService: ProfileService) {

        activatedRoute.pathFromRoot[3].url.subscribe((urlSegment) => {
            console.log('activated route is: ' + JSON.stringify(urlSegment));
            if (urlSegment[0] === undefined) {
                this.communityId = '';
            } else {
                this.communityId = urlSegment[0].path;
            }
        });

        activatedRoute.pathFromRoot[5].url.subscribe((urlSegment) => {
            console.log('activated route is: ' + JSON.stringify(urlSegment));
            if (urlSegment[0] === undefined) {
                _communityService.setActiveTab('links');
            } else {
                _communityService.setActiveTab(urlSegment[0].path);
            }
        });
        this.userId = _cookieUtilsService.getValue('userId');
    }

    ngOnInit() {
        this.getLoggedInUser();
        this.getLinks();
        this.initializeForms();
    }

    public getLinks() {
        this.loadingLinks = true;
        const query = {
            'include': [
                {'peer': 'profiles'}
            ],
            'order' : 'createdAt desc'
        };

        if (this.communityId) {
            this._communityService.getLinks(this.communityId, query, (err, response) => {
                if (err) {
                    console.log(err);
                } else {
                    this.links = response;
                    this.loadingLinks = false;
                }
            });
        } else {
            console.log('NO LINKS');
        }
    }

    private initializeForms() {
        this.linksForm = this._fb.group({
            text: ['', this.urlValidator(new RegExp('^(https?:\\/\\/)?((([a-zd]([a-zd-]*[a-zd])*).)+[a-z]{2,}|((d{1,3}.){3}d{1,3}))(:d+)?(\\/[-a-zd%_.~+]*)*(\\?[;&a-zd%_.~+=-]*)?(#[-a-zd_]*)?$', 'i'))]
        });
    }

    private getLoggedInUser() {
        this._profileService.getPeerData(this.userId, {'include': ['profiles', 'reviewsAboutYou', 'ownedCollections']}).subscribe(res => {
            this.loggedInUser = res;
            this.loadingUser = false;
            console.log(this.loggedInUser);
            this.userType = this.communityPageComponent.getUserType();
        });
    }

    public postLink() {
        const linkUrl = this.linksForm.controls.text.value;
        this.linksForm.controls.text.reset();
        if (linkUrl !== null && linkUrl.length > 0) {
            const linkBody = {
                mediaUrl: linkUrl
            };
            this._communityService.addLinkToCommunity(this.communityId, linkBody, (err: any, response: any) => {
                if (err) {
                    console.log(err);
                } else {
                    this.getLinks();
                }
            });
        }
    }

    private urlValidator(nameRe: RegExp): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } => {
            const isUrl = nameRe.test(control.value);
            return isUrl ? null : {'wrongUrl': {value: control.value}};
        };
    }

}
