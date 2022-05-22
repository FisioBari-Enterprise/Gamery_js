import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class HomeService {


  constructor(
    private http: HttpClient,
    private base: BaseService
  ) {   }

}
