import { Component, OnInit } from '@angular/core';
import { CollectionService } from '../../../_services/collection/collection.service';
import { ActivatedRoute } from '@angular/router';
import { first, flatMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-learning-path-page',
  templateUrl: './learning-path-page.component.html',
  styleUrls: ['./learning-path-page.component.scss']
})
export class LearningPathPageComponent implements OnInit {

  public learningPath: any;
  public learningPathId: string;
  public learningPathUrl: string;
  private toOpenDialogName: string;
  private previewAs: boolean;

  constructor(
    private _collectionService: CollectionService,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.setup();
  }

  setup() {
    this.initialiseVariables();
    this.fetchPathParams()
      .pipe(
        flatMap(res => {
          return this.fetchData();
        }),
        flatMap(res => {
          return this.processData(res);
        })
      )
      .subscribe(res => {
        console.log('Page Data Loaded');
      });
  }


  fetchData() {
    const query = {
      'where': {
        'customUrl': this.learningPathUrl
      },
      'include': [
        'topics',
        { 'participants': [{ 'profiles': ['work'] }] },
        { 'owners': ['profiles', 'topics'] },
        {
          'relation': 'contents',
          'scope': {
            'include': [{ 'courses': [{ 'owners': ['profiles'] }] }],
            'order': 'contentIndex ASC'
          }
        },
      ]

    };
    return this._collectionService.getAllCollections(query);
  }

  private initialiseVariables() {
  }

  private fetchPathParams() {
    return this.activatedRoute.params.pipe(
      first(),
      flatMap(params => {
        this.learningPathUrl = params['collectionCustomUrl'];
        this.toOpenDialogName = params['dialogName'];
        return this.activatedRoute.queryParams;
      }),
      flatMap(params => {
        if (params['previewAs']) {
          this.previewAs = params['previewAs'];
          console.log('Previewing as ' + this.previewAs);
        }
        if (params['referredBy']) {
          this._collectionService.saveRefferedBY(params['referredBy']);
        }
        return new Observable(obs => {
          obs.next();
        });
      }));
  }

  private processData(data: any) {
    console.log(data);
    this.learningPath = data[0];
    return new Observable(obs => {
      obs.next();
    });
  }

}
