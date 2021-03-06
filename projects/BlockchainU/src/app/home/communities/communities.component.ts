import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CollectionService } from '../../_services/collection/collection.service';
import { TopicService } from '../../_services/topic/topic.service';
import { ProfileService } from '../../_services/profile/profile.service';
import { CookieUtilsService } from '../../_services/cookieUtils/cookie-utils.service';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material';
import { SelectTopicsComponent } from '../dialogs/select-topics/select-topics.component';

import * as moment from 'moment';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { DialogsService } from '../../_services/dialogs/dialog.service';
import { CommunityService } from '../../_services/community/community.service';
import { environment } from '../../../environments/environment';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { map } from 'rxjs/operators';
@Component({
    selector: 'app-communities',
    templateUrl: './communities.component.html',
    styleUrls: ['./communities.component.scss'],
    animations: [
        trigger('slideInOut', [
            state('in', style({
                transform: 'translate3d(0, 0, 0)'
            })),
            state('out', style({
                transform: 'translate3d(100%, 0, 0)'
            })),
            transition('in => out', animate('400ms ease-in-out')),
            transition('out => in', animate('400ms ease-in-out'))
        ]),
    ]
})
export class CommunitiesComponent implements OnInit {

    public availableTopics: Array<any>;
    public topicsBackup: Array<any>;
    public envVariable;

    public userId;
    public communities: Array<any>;
    @ViewChild('topicButton') topicButton;
    @ViewChild('priceButton') priceButton;
    public availableRange: Array<number>;
    public selectedRange: Array<number>;
    public initialized: boolean;
    public selectedTopics: Array<any>;
    public loading = false;
    private today = moment();


    constructor(public _collectionService: CollectionService,
        public _profileService: ProfileService,
        private _cookieUtilsService: CookieUtilsService,
        private _topicService: TopicService,
        public dialog: MatDialog,
        public elRef: ElementRef,
        public _dialogsService: DialogsService,
        private titleService: Title,
        private metaService: Meta,
        private router: Router,
        private titlecasepipe: TitleCasePipe,
        public _communityService: CommunityService
    ) {
        this.userId = _cookieUtilsService.getValue('userId');
        this.envVariable = environment;
    }

    ngOnInit() {
        this.fetchData();
        this.setTags();
    }

    private setTags() {
        this.titleService.setTitle('Communities');
        this.metaService.updateTag({
            property: 'og:title',
            content: 'Explore Communities'
        });
        this.metaService.updateTag({
            property: 'og:site_name',
            content: 'theblockchainu.com'
        });
        this.metaService.updateTag({
            property: 'og:image',
            content: 'https://theblockchainu.com/bu_logo_square.png'
        });
        this.metaService.updateTag({
            property: 'og:url',
            content: environment.clientUrl + this.router.url
        });
    }

    fetchData() {
        this.loading = true;
        this.fetchTopics().subscribe(
            response => {
                this.availableTopics = response;
                this.topicsBackup = _.cloneDeep(response);
                this.fetchCommunities();
            }, err => {
                this.loading = false;
                console.log(err);
            });
    }

    fetchTopics(): Observable<Array<any>> {
        const query = {
            order: 'name ASC'
        };
        return this._topicService.getTopics(query).pipe(
            map(
                (response: any) => {
                    const availableTopics = [];
                    response.forEach(topic => {
                        availableTopics.push({ 'topic': topic, 'checked': false });
                    });
                    return availableTopics;
                }, (err) => {
                    console.log(err);
                }
            )
        );
    }

    fetchCommunities(): void {
    	this.loading = true;
        let query;
        this.selectedTopics = [];
        for (const topicObj of this.availableTopics) {
            if (topicObj['checked']) {
                this.selectedTopics.push({ 'name': topicObj['topic'].name });
            }
        }
        if (this.selectedTopics.length < 1) {
            for (const topicObj of this.availableTopics) {
                this.selectedTopics.push({ 'name': topicObj['topic'].name });
            }
        }
        query = {
            'include': [
                {
                    'relation': 'communities', 'scope': {
                        'include': [
                            'topics',
                            'views',
                            'questions',
                            'invites',
                            'rooms',
                            { 'collections': ['owners'] },
                            'links',
                            { 'participants': [{ 'profiles': ['work'] }] },
                            { 'owners': [{ 'profiles': ['work'] }] }
                        ],
                        'order': 'createdAt desc'
                    }
                }
            ],
            'where': { or: this.selectedTopics }
        };

        this._topicService.getTopics(query)
            .subscribe(
                (response: any) => {
                    const communities = [];
                    for (const responseObj of response) {
                        responseObj.communities.forEach(community => {
                            if (community.status === 'active') {
                                let totalGyan = 0;
                                if (community.questions) {
                                    community.questions.forEach(question => {
                                        if (question.gyan !== undefined && question.gyan > 0) {
                                            totalGyan += parseInt(question.gyan, 10);
                                        }
                                    });
                                }
                                const participants = [];
                                community.allParticipants = community.participants;
                                if (community.participants) {
                                    community.participants.forEach((participant, index) => {
                                        if (index < 4) {
                                            participants.push(participant);
                                        }
                                    });
                                }
                                community.participants = participants;
                                const topics = [];
                                community.topics.forEach(topicObj => {
                                    topics.push(this.titlecasepipe.transform(topicObj.name));
                                });
                                if (topics.length > 0) {
                                    community.topics = topics;
                                } else {
                                    topics.push('No topics selected');
                                    community.topics = topics;
                                }
                                community.gyan = totalGyan;
                                communities.push(community);
                            }
                        });
                    }
                    this.communities = _.uniqBy(communities, 'id');
                    this.communities = _.orderBy(this.communities, ['createdAt'], ['desc']);
                    if (!this.initialized) {
                        this.initialized = true;
                    }
					this.loading = false;
                }, (err) => {
					this.loading = false;
                    console.log(err);
                }
            );
    }

    openTopicsDialog(): void {
        const dialogRef = this.dialog.open(SelectTopicsComponent, {
            width: '250px',
            height: '300px',
            panelClass: ['responsive-dialog', 'responsive-fixed-position'],
            data: this.availableTopics,
            disableClose: true,
            position: {
                top: this.topicButton._elementRef.nativeElement.getBoundingClientRect().top + 'px',
                left: this.topicButton._elementRef.nativeElement.getBoundingClientRect().left + 'px'
            }
        });

        dialogRef.afterClosed().subscribe((result: any) => {
            if (result) {
                this.availableTopics = result;
                this.fetchCommunities();
            }
        });
    }

    public filterClickedTopic(index) {
        this.availableTopics = _.cloneDeep(this.topicsBackup);
        this.availableTopics[index]['checked'] = true;
        this.fetchCommunities();
    }

    public resetTopics() {
        this.availableTopics = _.cloneDeep(this.topicsBackup);
        this.fetchCommunities();
    }

    public onCommunityRefresh(event) {
        if (event) {
            this.fetchCommunities();
        }
    }

}
