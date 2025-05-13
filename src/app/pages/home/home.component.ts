import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, RouterModule, MatTooltipModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  baixarArquivo() {
    window.open('/assets/arquivo-conformidade.pdf', '_blank');
  }
}
