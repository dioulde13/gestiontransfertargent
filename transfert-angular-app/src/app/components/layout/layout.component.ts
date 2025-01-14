import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterOutlet } from '@angular/router';
// import { RouterLink} from '@angular/router';


@Component({
  selector: 'app-layout',
  imports: [
    CommonModule ,
    RouterOutlet,
    ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
  isSidebarOpen = false;
  activeMenu = 'home'; // Home sélectionné par défaut

  selectMenu(menu: string) {
    this.activeMenu = menu;
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSideBar() {
    this.isSidebarOpen = false;
  }
}
