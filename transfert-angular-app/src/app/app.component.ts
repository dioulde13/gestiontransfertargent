// app.component.ts
import { Component, OnInit } from '@angular/core';
import { ApiService } from './api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  
  // message: string = '';
  // constructor(private apiService: ApiService) {}

  // ngOnInit(): void {
  //   this.apiService.getData().subscribe(
  //     (data) => {
  //       this.message = data.message;
  //     },
  //     (error) => {
  //       console.error('Error fetching data', error);
  //     }
  //   );
  // }
}
