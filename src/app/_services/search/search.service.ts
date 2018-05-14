import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {RequestHeaderService} from '../requestHeader/request-header.service';

@Injectable()
export class SearchService {

    public httpSubscription: any;
    public envVariable;
    private options;

    constructor(
    	private router: Router,
        private http: HttpClient,
		private requestHeaderService: RequestHeaderService
	) {
        this.envVariable = environment;
        this.options = this.requestHeaderService.getOptions();
    }
    
    public getAllSearchResults(userId, query: any, cb) {
        if (userId) {
            if (this.httpSubscription) {
                this.httpSubscription.unsubscribe();
            }
            this.httpSubscription = this.http
                .get(environment.searchUrl + '/searchAll?' + 'query=' + query, this.options)
                .map((response) => {
                    console.log(response);
                    cb(null, response);
                }, (err) => {
                    cb(err);
                }).subscribe();
        }
    }

    public getCommunitySearchResults(userId, query: any, cb) {
        if (userId) {
            this.http
                .get(environment.searchUrl + '/searchCommunity?' + 'query=' + query, this.options)
                .map((response) => {
                    console.log(response);
                    cb(null, response);
                }, (err) => {
                    cb(err);
                }).subscribe();
        }
    }

    public getSearchOptionText(option) {
        switch (option.index.split('_')[1]) {
            case 'collection':
                switch (option.data.type) {
                    case 'workshop':
                        return option.data.title;
                    case 'experience':
                        return option.data.title;
                    default:
                        return option.data.title;
                }
            case 'topic':
                return option.data.name;
            case 'community':
                return option.data.title;
            case 'question':
                return option.data.text;
            case 'peer':
                if (option.data.profiles[0] === undefined) {
                    return option.data.id;
                } else if (option.data.profiles[0] !== undefined && option.data.profiles[0].first_name === undefined) {
                    return option.data.id;
                } else {
                    return option.data.profiles[0].first_name + ' ' + option.data.profiles[0].last_name;
                }
            default:
                return;
        }
    }
	
	
	public getSearchOptionImage(option) {
		switch (option.index.split('_')[1]) {
			case 'collection':
				switch (option.data.type) {
					case 'workshop':
						return option.data.imageUrls ? environment.apiUrl + option.data.imageUrls[0] + '/100' : '/assets/images/placeholder-image.jpg';
					case 'experience':
						return option.data.imageUrls ? environment.apiUrl + option.data.imageUrls[0] + '/100': '/assets/images/placeholder-image.jpg';
					default:
						return option.data.imageUrls ? environment.apiUrl + option.data.imageUrls[0] + '/100' : '/assets/images/placeholder-image.jpg';
				}
			case 'topic':
				return environment.apiUrl + option.data.imageUrl + '/100';
			case 'community':
				return option.data.imageUrls ? environment.apiUrl + option.data.imageUrls[0] + '/100' : '/assets/images/placeholder-image.jpg';
			case 'question':
				return '/assets/images/placeholder-image.jpg';
			case 'peer':
				if (option.data.profiles[0] === undefined) {
					return '/assets/images/user-placeholder.jpg';
				} else if (option.data.profiles[0] !== undefined && option.data.profiles[0].picture_url === undefined) {
					return '/assets/images/user-placeholder.jpg';
				} else {
					return environment.apiUrl + option.data.profiles[0].picture_url + '/100';
				}
			default:
				return;
		}
	}

    public getSearchOptionType(option) {
        switch (option.index.split('_')[1]) {
            case 'collection':
                switch (option.data.type) {
                    case 'workshop':
                        return 'Workshop : ';
                    case 'experience':
                        return 'Experience : ';
                    default:
                        return 'Collection : ';
                }
            case 'topic':
                return 'Topic : ';
            case 'community':
                return 'Community: ';
            case 'question':
                return 'Question: ';
            case 'peer':
                return 'Peer : ';
            default:
                return;
        }
    }

    public onSearchOptionClicked(option) {
        switch (option.index.split('_')[1]) {
            case 'collection':
                switch (option.data.type) {
                    case 'workshop':
                        this.router.navigate(['/workshop', option.data.id]);
                        break;
                    case 'experience':
                        this.router.navigate(['/experience', option.data.id]);
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
    }

}
