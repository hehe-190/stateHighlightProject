import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { debounceTime, switchMap, map, tap } from 'rxjs/operators';
import { StateService } from '../state.service';
import { GoogleMap } from '@angular/google-maps';

@Component({
  selector: 'app-state-typeahead',
  templateUrl: './state-typeahead.component.html',
  styleUrls: ['./state-typeahead.component.css']
})
export class StateTypeaheadComponent implements OnInit {
  stateControl = new FormControl();
  filteredStates!: Observable<string[]>;
  activeIndex = 0; 
  selectedState: string | null = null; 

  // Google Maps 
  zoom = 4; 
  center: google.maps.LatLngLiteral = { lat: 39.8283, lng: -98.5795 }; // the heart location of US
  options: google.maps.MapOptions = {
    mapTypeId: 'roadmap',
    disableDefaultUI: true,
    maxZoom: 15,
    minZoom: 4,
  };

  @ViewChild(GoogleMap) map!: GoogleMap;

  constructor(private stateService: StateService) {}

  ngOnInit() {
    this.filteredStates = this.stateControl.valueChanges.pipe(
      debounceTime(300),
      switchMap((value) => this._filterStates(value || '')),
      tap((states) => {
        if (states.length > 0) {
          this.activeIndex = 0;
          // highlight the first one
          this.highlightState(states[0]);
          this.selectedState = states[0];
          // update the map to the state
          this.centerMapToState(states[0]);
        }
      })
    );
  }

  private _filterStates(value: string): Observable<string[]> {
    return this.stateService.searchStates(value).pipe(
      map((states) => {
        this.activeIndex = 0; 
        return states.map((state) => state.name);
      })
    );
  }

  // selected by user
  onStateSelected(state: string) {
    this.stateControl.setValue(state);
    this.selectedState = state;

    this.centerMapToState(state);
    this.highlightState(state);
  }

  // change center location
  centerMapToState(state: string) {
    const stateCoordinates = this.getStateCoordinates(state);
    if (stateCoordinates) {
      this.center = stateCoordinates;
      this.map.panTo(this.center); // change smoothly
    }
  }

  // need to write on other location, can be stored in DB
  // stupid but can save time, need to change next version
  getStateCoordinates(state: string): google.maps.LatLngLiteral | null {
    const coordinatesMap: { [key: string]: google.maps.LatLngLiteral } = {
      'Alabama': { lat: 32.806671, lng: -86.791130 },
      'Alaska': { lat: 61.370716, lng: -152.404419 },
      'Arizona': { lat: 33.729759, lng: -111.431221 },
      'Arkansas': { lat: 34.969704, lng: -92.373123 },
      'California': { lat: 36.116203, lng: -119.681564 },
      'Colorado': { lat: 39.059811, lng: -105.311104 },
      'Connecticut': { lat: 41.597782, lng: -72.755371 },
      'Delaware': { lat: 39.318523, lng: -75.507141 },
      'Florida': { lat: 27.766279, lng: -81.686783 },
      'Georgia': { lat: 33.040619, lng: -83.643074 },
      'Hawaii': { lat: 21.094318, lng: -157.498337 },
      'Idaho': { lat: 44.240459, lng: -114.478828 },
      'Illinois': { lat: 40.349457, lng: -88.986137 },
      'Indiana': { lat: 39.849426, lng: -86.258278 },
      'Iowa': { lat: 42.011539, lng: -93.210526 },
      'Kansas': { lat: 38.526600, lng: -96.726486 },
      'Kentucky': { lat: 37.668140, lng: -84.670067 },
      'Louisiana': { lat: 31.169546, lng: -91.867805 },
      'Maine': { lat: 45.253783, lng: -69.445469 },
      'Maryland': { lat: 39.045753, lng: -76.641273 },
      'Massachusetts': { lat: 42.407211, lng: -71.382439 },
      'Michigan': { lat: 44.314844, lng: -85.602364 },
      'Minnesota': { lat: 46.729553, lng: -94.685900 },
      'Mississippi': { lat: 32.354668, lng: -89.398528 },
      'Missouri': { lat: 37.964253, lng: -91.831833 },
      'Montana': { lat: 46.879682, lng: -110.362566 },
      'Nebraska': { lat: 41.492537, lng: -99.901813 },
      'Nevada': { lat: 38.802610, lng: -116.419389 },
      'New Hampshire': { lat: 43.193852, lng: -71.572395 },
      'New Jersey': { lat: 40.058324, lng: -74.405661 },
      'New Mexico': { lat: 34.519940, lng: -105.870090 },
      'New York': { lat: 40.712776, lng: -74.005974 },
      'North Carolina': { lat: 35.759573, lng: -79.019300 },
      'North Dakota': { lat: 47.551493, lng: -101.002012 },
      'Ohio': { lat: 40.417287, lng: -82.907123 },
      'Oklahoma': { lat: 35.007752, lng: -97.092877 },
      'Oregon': { lat: 43.804133, lng: -120.554201 },
      'Pennsylvania': { lat: 41.203322, lng: -77.194525 },
      'Rhode Island': { lat: 41.580095, lng: -71.477429 },
      'South Carolina': { lat: 33.836081, lng: -81.163725 },
      'South Dakota': { lat: 43.969515, lng: -99.901813 },
      'Tennessee': { lat: 35.517491, lng: -86.580447 },
      'Texas': { lat: 31.968599, lng: -99.901810 },
      'Utah': { lat: 39.320980, lng: -111.093731 },
      'Vermont': { lat: 44.558803, lng: -72.577841 },
      'Virginia': { lat: 37.431573, lng: -78.656894 },
      'Washington': { lat: 47.751074, lng: -120.740139 },
      'West Virginia': { lat: 38.597626, lng: -80.454903 },
      'Wisconsin': { lat: 43.784440, lng: -88.787868 },
      'Wyoming': { lat: 43.075968, lng: -107.290284 }
    };

    return coordinatesMap[state] || null;
  }

  // highlight state border
  highlightState(state: string) {
    if (!this.map) return;

    // load GeoJSON
    this.map.data.loadGeoJson('assets/states.geojson', null, (features) => {
      this.map.data.setStyle((feature) => {
        const stateName = feature.getProperty('NAME');
        if (stateName === state) {
          return {
            fillOpacity: 0, // inner can be occupied by color
            strokeWeight: 2,
            strokeColor: 'blue'
          };
        } else {
          return {
            fillOpacity: 0, // no choosed state no color
            strokeWeight: 0,
            strokeColor: 'gray'
          };
        }
      });
    });
  }
}

