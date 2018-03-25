import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import {environment} from '../../../environments/environment';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { CountryPickerService } from '../../_services/countrypicker/countrypicker.service';
import { Observable } from 'rxjs/Observable';
import * as _ from 'lodash';

@Component({
    selector: 'app-add-location-dialog',
    templateUrl: './add-location-dialog.component.html',
    styleUrls: ['./add-location-dialog.component.scss']
})
export class AddLocationDialogComponent implements OnInit {

    public contentFormArray: FormArray;
    public contentForm: FormGroup;
    public locationForm: FormGroup;
    public contentTitle = '';
    public isEdit;
    public resultData = {
        status: 'discard'
    };
    public userSettings: any = {
        geoLocation: [37.76999, -122.44696],
        geoRadius: 5,
        inputPlaceholderText: 'Where will you meet?',
        showSearchButton: false,
    };
    public lat = 37.76999;
    public lng = -122.44696;
    public envVariable;
    public filteredCountryOptions: Observable<string[]>;
    private countriesArray: any[];
    public busyCountry = false;
    public selectedCountry;

    constructor(
        @Inject(MAT_DIALOG_DATA) public inputData: any,
        public dialogRef: MatDialogRef<AddLocationDialogComponent>,
        private countryPickerService: CountryPickerService
    ) {
        this.envVariable = environment;
    }

    ngOnInit() {
        this.locationForm = <FormGroup>this.inputData.locationForm;
        this.contentForm = <FormGroup>this.inputData.contentForm;
        this.contentFormArray = <FormArray>this.inputData.contentFormArray;
        this.contentTitle = this.contentForm.controls.title.value.length !== 0 ? this.contentForm.controls.title.value : 'new activity';
        this.isEdit = this.inputData.isEdit;

        this.initializeFormFields();
    }

    /**
     * Get data to return on closing this dialog.
     * @returns {any}
     */
    getSaveDialogData() {
        this.resultData['status'] = 'save';
        this.resultData['locationForm'] = this.locationForm.value;
        return JSON.stringify(this.resultData);
    }

    /**
     * Get data to return on editing this dialog.
     * @returns {any}
     */
    getEditDialogData() {
        this.resultData['status'] = 'edit';
        this.resultData['locationForm'] = this.locationForm.value;
        return JSON.stringify(this.resultData);
    }

    /**
     * Get data to return on discarding this dialog
     * @returns {any}
     */
    getDiscardDialogData() {
        this.resultData['status'] = 'discard';
        return JSON.stringify(this.resultData);
    }

    /**
     * Get data to return on discarding this dialog
     * @returns {any}
     */
    getDeleteDialogData() {
        this.resultData['status'] = 'delete';
        this.resultData['locationForm'] = this.locationForm.value;
        return JSON.stringify(this.resultData);
    }

    /**
     * Get data to return on discarding this dialog
     * @returns {any}
     */
    getCloseDialogData() {
        this.resultData['status'] = 'close';
        return JSON.stringify(this.resultData);
    }

    /**
     * Get title text based on edit mode or add mode
     * @returns {any}
     */
    getAddOrEditText() {
        if (!this.isEdit) {
            return 'Add';
        } else {
            return 'Edit';
        }
    }

    autoCompleteCallback(geoData: any): any {
        console.log(geoData);
        if (geoData.response) {
            const data = geoData.data;
            const addressObj = this.filterAddressArray(data.address_components);
            console.log(addressObj);
            this.locationForm.controls['location_name'].patchValue(data.name);
            this.locationForm.controls['map_lat'].patchValue(data.geometry.location.lat);
            this.locationForm.controls['map_lng'].patchValue(data.geometry.location.lng);
            this.locationForm.controls['country'].patchValue(addressObj.country);
            this.locationForm.controls['street_address'].patchValue(addressObj.route + ',' + addressObj.neighborhood + ',' + addressObj.locality);
            this.locationForm.controls['apt_suite'].patchValue(addressObj.subpremise);
            this.locationForm.controls['city'].patchValue(addressObj.administrative_area_level_2);
            this.locationForm.controls['state'].patchValue(addressObj.administrative_area_level_1);
            this.locationForm.controls['zip'].patchValue(addressObj.postal_code);
            this.lat = data.geometry.location.lat;
            this.lng = data.geometry.location.lng;
        }
    }

    private filterAddressArray(addressArray: Array<any>) {
        const addressObj = {
            postal_code: '',
            country: '',
            administrative_area_level_1: '',
            administrative_area_level_2: '',
            locality: '',
            neighborhood: '',
            route: '',
            street_number: '',
            subpremise: ''
        };

        addressArray.forEach(part => {
            part.types.forEach(address_type => {
                if (addressObj.hasOwnProperty(address_type)) {
                    addressObj[address_type] = part.long_name;
                }
            });
        });
        return addressObj;
    }

    filter(val: string): string[] {
        return this.countriesArray.filter(option =>
            option.toLowerCase().indexOf(val.toLowerCase()) === 0);
    }

    private initializeFormFields() {
        this.selectedCountry = this.locationForm.controls.country.value;
        this.countryPickerService.getCountries()
            .subscribe((countries) => {
                this.countriesArray = _.map(countries, 'name');
                this.filteredCountryOptions = this.locationForm.controls.country.valueChanges
                    .startWith(null)
                    .map(val => val ? this.filter(val) : this.countriesArray.slice());
            });
    }

    public countryChange(event) {
        this.busyCountry = true;
        if (event) {
            this.selectedCountry = event;
            this.busyCountry = false;
        }
    }

}
