import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth/auth-service.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-dasboard',
  standalone:true,
  imports: [CommonModule],
  templateUrl: './dasboard.component.html',
  styleUrl: './dasboard.component.css'
})
export class DasboardComponent implements OnInit {

  userInfo: any = null;

  constructor(private authService: AuthService) { }


  ngOnInit(): void {
    this.getUserInfo();
  }

  getUserInfo() {
    this.authService.getUserInfo().subscribe(
      {
        next: (response) => {
          this.userInfo = response.user;
          console.log(this.userInfo);
        }
      }
    );
  }
}
