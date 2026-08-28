import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-logo-animada',
  standalone:false,
  templateUrl: './logo-animada.component.html',
  styleUrls: ['./logo-animada.component.css']
})
export class LogoAnimadaComponent {
  @Input() tamanho: 'pequena' | 'media' | 'grande' = 'media'; // valor padrão
}
