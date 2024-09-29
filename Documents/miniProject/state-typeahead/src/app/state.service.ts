import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class StateService {
  constructor(private apollo: Apollo) {}

  searchStates(searchTerm: string): Observable<{ name: string }[]> {
    return this.apollo.query<any>({
      query: gql`
        query ($search: String!) {
          states(search: $search) {
            name
          }
        }
      `,
      variables: {
        search: searchTerm
      }
    }).pipe(
        map(result => {
            console.log('GraphQL result:', result); // check GraphQL return result
            return result.data.states;
          })
    );
  }
}
