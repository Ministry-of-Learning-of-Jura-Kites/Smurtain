import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MongoDBServiceService {
  // Your MongoDB Data API URL and API Key
  private url: string = 'https://ap-southeast-1.aws.data.mongodb-api.com/app/data-mjgkltd/endpoint/data/v1'
  private API_KEY: string = 'f6RuuWhHDwuGmiouwKqytwVqs2LUABBVpn2dIIs5RL9r2hRmjX6kECBrOcgAnid7';

  constructor(private http: HttpClient) {}

  // Fetch all items from a collection
  getItems(): Observable<any> {
    const body = {
      dataSource: 'Smurtain', 
      database: 'smurtain', 
      collection: 'smurtain', 
      filter: {}, 
    };

    return this.http.post(`${this.url}/action/find`, body, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'api-key': this.API_KEY,
      }),
    });
  }

  // Insert a new item into the collection
  createItem(item: any): Observable<any> {
    const body = {
      dataSource: 'Smurtain', 
      database: 'smurtain', 
      collection: 'smurtain', 
      document: item,
    };

    return this.http.post(`${this.url}/action/insertOne`, body, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'api-key': this.API_KEY,
      }),
    });
  }
}
