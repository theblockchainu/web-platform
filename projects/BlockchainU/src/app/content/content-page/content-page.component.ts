import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { flatMap, map, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ContentService } from '../../_services/content/content.service';

@Component({
  selector: 'app-content-page',
  templateUrl: './content-page.component.html',
  styleUrls: ['./content-page.component.scss']
})
export class ContentPageComponent implements OnInit {

  contentId: string;
  data: any;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private contentService: ContentService
  ) { }

  ngOnInit() {
    console.log('content page');
    this.activatedRoute.params
      .pipe(
        flatMap(params => {
          console.log('params', params);
          this.contentId = params['contentId'];
          return this.fetchContent();
        })).subscribe(res => {
          console.log(res);
        }, err => {
          console.log(err);
        });
  }

  fetchContent(): Observable<any> {
    const query = {
      include: [
        'locations',
        'schedules',
        { 'questions': { 'answers': { 'peer': 'profiles' } } },
        { 'rsvps': 'peer' },
        { 'views': 'peer' },
        {
          'submissions': [
            { 'upvotes': 'peer' },
            { 'peer': 'profiles' }
          ]
        }
      ]
    };
    return this.contentService.getContentById(this.contentId, query)
      .pipe(map(content => {
        this.data.content = content;
        console.log(this.data);
        return this.data;
      }));
  }

  exitDialog(event) {
    console.log(event);
  }

}
