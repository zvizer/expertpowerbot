import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  constructor(private http: HttpClient) {}

  getByeBye() {
    const url: string = 'https://type.fit/api/quotes';
    return this.http.get(url);
  }

  getWeather(city: String) {
    const url: string = 'https://api.openweathermap.org/data/2.5/weather';
    const apiKey: string = 'a6552d8e4f53051ea40c369d4704bb06';
    return this.http.get(
      url + '?q=' + city + '&units=metric' + '&appid=' + apiKey
    );
  }
}
