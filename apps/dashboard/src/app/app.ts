import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Permission } from '@secure-task/auth';
import { AuthService } from './core/services/auth.service';
import { ThemeService } from './core/services/theme.service';

@Component({
  imports: [RouterLink, RouterOutlet],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected auth = inject(AuthService);
  protected theme = inject(ThemeService);
  protected Permission = Permission;

  ngOnInit() {
    if (this.auth.getToken()) this.auth.loadMe();
    this.theme.init();
  }
}
