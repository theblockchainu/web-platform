import {
    Component, Input, forwardRef, ElementRef, Inject, EventEmitter
    , HostBinding, HostListener, Output
} from '@angular/core';
import {
    FormControl, ControlValueAccessor, NG_VALUE_ACCESSOR
    , NG_VALIDATORS, Validator
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { RequestHeaderService } from '../../_services/requestHeader/request-header.service';

import * as _ from 'lodash';

@Component({
    selector: 'app-generic-multiselect-autocomplete',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => GenericMultiselectAutocompleteComponent),
            multi: true,
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => GenericMultiselectAutocompleteComponent),
            multi: true,
        }],
    styleUrls: ['./generic-multiselect-autocomplete.component.scss'],
    templateUrl: './generic-multiselect-autocomplete.component.html'
})
export class GenericMultiselectAutocompleteComponent {
    // implements ControlValueAccessor
    public query = '';
    public selected = [];
    public removed = [];
    public filteredList = [];
    public elementRef;
    public placeholderString;


    // Input parameter - jsonObject of collection
    @Input()
    public list: any = {};

    // Optional Input Parameter
    @Input()
    public searchUrl = '';

    // Optional Input Parameter
    @Input()
    public multiSelect = true;

    @Input()
    public create = false;

    @Input()
    private createURL = '';

    @Input('title')
    public title = '';

    @Input()
    public preSelectedItems = [];

    @Input('maxSelection')
    public maxSelection = -1;

    @Output()
    selectedOutput = new EventEmitter<any>();

    @Output()
    removedOutput = new EventEmitter<any>();

    constructor(myElement: ElementRef,
        private http: HttpClient,
        public requestHeaderService: RequestHeaderService) {
        this.elementRef = myElement;
        this.placeholderString = this.title;
    }

    @HostListener('document:click', ['$event'])
    private handleClick(event) {
        let clickedComponent = event.target;
        let inside = false;
        do {
            if (clickedComponent === this.elementRef.nativeElement) {
                inside = true;
            }
            clickedComponent = clickedComponent.parentNode;
        } while (clickedComponent);
        if (!inside) {
            this.filteredList = [];
        }
    }

    onChanges() {
        if (!!this.preSelectedItems) {
            console.log(this.preSelectedItems);
        }
        this.preSelectedItems = _.filter(this.preSelectedItems, (item) => item !== '');
        this.preSelectedItems.forEach(element => {
            this.selected.push({
                name: element
            });
        });
        this.selected = _.uniqBy(this.selected, 'name');
        // this.selected = _.union(_.filter(this.preSelectedItems, (item)=> { return item != ''}), this.selected);
    }

    ngViewInitChanges() {
        // console.log("View");
        // this.selected = _.union(this.preSelectedItems, this.selected);
        // console.log(this.selected);
    }

    public filter() {
        if (!this.multiSelect) {
            if (this.filteredList.length !== 0) {
                // Force only 1 selection
                // TBD
            }
        }
        if (this.query !== '') {
            if (this.list) {
                this.filteredList = _.filter(this.list, (item) => {
                    return item.name.toLowerCase().indexOf(this.query.toLowerCase()) > -1;
                });
            }
            if (this.searchUrl) {
                const finalSearchURL = this.searchUrl + this.query;
                this.http.get(finalSearchURL, this.requestHeaderService.options)
                    .map((res: any) => {
                        this.filteredList = [];
                        res.map(item => {
                            const obj = {};
                            obj['id'] = item.id;
                            obj['name'] = item.name;
                            obj['type'] = item.type;
                            obj['createdAt'] = item.createdAt;
                            obj['updatedAt'] = item.updatedAt;
                            this.filteredList.push(obj);
                        });
                        // if(this.filteredList.length === 0 && this.create)
                        // {
                        //   //Post the new item into the respective collection
                        //   const body = {
                        //     'name' : this.query,
                        //     'type': 'user'
                        //   };
                        //   this.http.post(this.createURL, body, this.requestHeaderService.options)
                        //             .map((res: any) => {
                        //               this.select(res);
                        //             })
                        //             .subscribe();
                        // }
                    })
                    .subscribe();
            }
        } else {
            this.filteredList = [];
        }
    }

    private select(item) {
        if (this.selected.length >= this.maxSelection && this.maxSelection !== -1) {

            this.query = '';
            this.filteredList = [];
            return;
        }
        // if(this.preSelectedItems.length != 0){
        //   this.selected = _.union(_.filter(this.preSelectedItems, (item)=> { return item != ''}), this.selected);
        // }
        // this.preSelectedItems.forEach(element => {
        //   this.selected.push({
        //     name: element
        //   });
        // });
        this.selected.push(item);
        this.selected = _.uniqBy(this.selected, 'name');
        this.selectedOutput.emit(this.selected);
        this.query = '';
        this.filteredList = [];
    }

    public remove(item) {
        this.selected.splice(this.selected.indexOf(item), 1);
        this.removed.push(item);
        this.selectedOutput.emit(this.selected);
        this.removedOutput.emit(this.removed);
    }

}
