import { Component } from '@angular/core';
import { ShoppingListComponent } from './shopping-list/shopping-list.component';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
 selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  imports: [RouterOutlet, RouterLinkActive, RouterLink],
})
export class AppComponent {
  title = 'shopping-realtime';
}
