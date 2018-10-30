import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { RequestHeaderService } from '../requestHeader/request-header.service';
import { UcFirstPipe, UcWordsPipe } from 'ngx-pipes';
import { Observable } from 'rxjs';
@Injectable()
export class SearchService {

    public httpSubscription: any;
    public envVariable;

    constructor(
        private router: Router,
        private http: HttpClient,
        private ucfirst: UcFirstPipe,
        private ucwords: UcWordsPipe,
        private requestHeaderService: RequestHeaderService
    ) {
        this.envVariable = environment;
    }

    public getAllSearchResults(userId?, query?: any, cb?) {
        if (this.httpSubscription) {
            this.httpSubscription.unsubscribe();
        }
        this.httpSubscription = this.http
            .get(environment.searchUrl + '/searchAll?' + 'query=' + query, this.requestHeaderService.options)
            .subscribe((response: any) => {
                console.log(response);
                cb(null, response);
            }, (err) => {
                cb(err);
            });
    }
	
	public getPeerSearch(query: any, cb) {
		this.http
			.get(environment.searchUrl + '/searchPeer?' + 'query=' + query, this.requestHeaderService.options)
			.subscribe((response: any) => {
				console.log(response);
				cb(null, response);
			}, (err) => {
				cb(err);
			});
	}

    public getPeerSearchResults(query: any) {
        if (query.length > 0) {
            return this.http
                .get(environment.searchUrl + '/api/search/'
                    + environment.uniqueDeveloperCode + '_peers/suggest?field=username&query=' + query, this.requestHeaderService.options);
        } else {
            return new Observable(observer => {
                observer.next([]);
                return;
            });
        }
    }

    public searchForCommunities(query: any) {
        if (query.length > 0) {
            return this.http
                .get(environment.searchUrl + '/api/search/' + environment.uniqueDeveloperCode +
                    '_communities/suggest?field=title&query=' + query, this.requestHeaderService.options);
        } else {
            return new Observable(observer => {
                observer.next([]);
                return;
            });
        }
    }

    public getCommunitySearchResults(userId, query: any, cb) {
        this.http
            .get(environment.searchUrl + '/searchCommunity?' + 'query=' + query, this.requestHeaderService.options)
            .subscribe((response: any) => {
                console.log(response);
                cb(null, response);
            }, (err) => {
                cb(err);
            });
    }

    public getSearchOptionText(option) {
		if (option && option.index) {
			switch (option.index.split('_')[1]) {
				case 'collection':
					switch (option.data.type) {
						case 'class':
							return this.ucfirst.transform(option.data.title);
						case 'experience':
							return this.ucfirst.transform(option.data.title);
						case 'guide':
							return this.ucfirst.transform(option.data.title);
						case 'bounty':
							return this.ucfirst.transform(option.data.title);
						default:
							return this.ucfirst.transform(option.data.title);
					}
				case 'topic':
					return this.ucwords.transform(option.data.name);
				case 'community':
					return this.ucfirst.transform(option.data.title);
				case 'question':
					return this.ucfirst.transform(option.data.text);
				case 'peer':
					if (option.data.profiles[0] === undefined) {
						return option.data.id;
					} else if (option.data.profiles[0] !== undefined && option.data.profiles[0].first_name === undefined) {
						return option.data.id;
					} else {
						return this.ucwords.transform(option.data.profiles[0].first_name + ' ' + option.data.profiles[0].last_name);
					}
				default:
					return;
			}
		} else {
			return option;
		}
    }


    public getSearchOptionImage(option) {
		if (option && option.index) {
			switch (option.index.split('_')[1]) {
				case 'collection':
					switch (option.data.type) {
						case 'class':
							return option.data.imageUrls ? environment.apiUrl + option.data.imageUrls[0] + '/100' : '/assets/images/collection-placeholder.jpg';
						case 'experience':
							return option.data.imageUrls ? environment.apiUrl + option.data.imageUrls[0] + '/100' : '/assets/images/collection-placeholder.jpg';
						case 'bounty':
							return option.data.imageUrls ? environment.apiUrl + option.data.imageUrls[0] + '/100' : '/assets/images/collection-placeholder.jpg';
						case 'guide':
							return option.data.imageUrls ? environment.apiUrl + option.data.imageUrls[0] + '/100' : '/assets/images/collection-placeholder.jpg';
						default:
							return option.data.imageUrls ? environment.apiUrl + option.data.imageUrls[0] + '/100' : '/assets/images/collection-placeholder.jpg';
					}
				case 'topic':
					return option.data.imageUrls ? environment.apiUrl + option.data.imageUrl + '/100' : '/assets/images/collection-placeholder.jpg';
				case 'community':
					return option.data.imageUrls ? environment.apiUrl + option.data.imageUrls[0] + '/100' : '/assets/images/community-banner-bg.jpg';
				case 'question':
					return '/assets/images/question-icon.png';
				case 'peer':
					if (option.data.profiles[0] === undefined) {
						return '/assets/images/user-placeholder.jpg';
					} else if (option.data.profiles[0] !== undefined && option.data.profiles[0].picture_url === undefined) {
						return '/assets/images/user-placeholder.jpg';
					} else {
						return environment.apiUrl + option.data.profiles[0].picture_url + '/100';
					}
				default:
					return '/assets/images/collection-placeholder.jpg';
			}
		} else {
			return '/assets/images/collection-placeholder.jpg';
		}
    }

    public getSearchOptionType(option) {
		if (option && option.index) {
			switch (option.index.split('_')[1]) {
				case 'collection':
					switch (option.data.type) {
						case 'class':
							return 'Online Course';
						case 'experience':
							return 'In-person Experience';
						case 'bounty':
							return 'Reward Bounty';
						case 'guide':
							return 'Learning Guide';
						default:
							return 'Collection';
					}
				case 'topic':
					return 'Topic';
				case 'community':
					return 'Community';
				case 'question':
					return 'Question';
				case 'peer':
					return 'User';
				default:
					return;
			}
		} else {
			return '';
		}
    }

    public onSearchOptionClicked(option) {
    	if (option && option.index) {
			switch (option.index.split('_')[1]) {
				case 'collection':
					switch (option.data.type) {
						case 'class':
							this.router.navigate(['/class', option.data.id]);
							break;
						case 'experience':
							this.router.navigate(['/experience', option.data.id]);
							break;
						case 'bounty':
							this.router.navigate(['/bounty', option.data.id]);
							break;
						case 'guide':
							this.router.navigate(['/guide', option.data.id]);
							break;
						default:
							this.router.navigate(['/console/dashboard']);
							break;
					}
					break;
				case 'topic':
					this.router.navigate(['/console/profile/topics']);
					break;
				case 'community':
					this.router.navigate(['/community', option.data.id]);
					break;
				case 'question':
					this.router.navigate(['/question', option.data.id]);
					break;
				case 'peer':
					this.router.navigate(['/profile', option.data.id]);
					break;
				default:
					break;
			}
		} else {
			this.router.navigateByUrl('/home/experiences?title=' + option);
		}
    }

    public getTopics() {
        return this.http.get(environment.searchUrl + '/api/search/' + environment.uniqueDeveloperCode + '_topics', this.requestHeaderService.options);
    }
}
