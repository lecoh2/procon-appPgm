import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-spinner-consulta', // <-- mudar para o selector que você vai usar no HTML
  standalone: false,
  templateUrl: './spinnerconsulta.component.html',
  styleUrls: ['./spinnerconsulta.component.css']
})
export class SpinnerConsultaComponent {  // <-- nome da classe padronizado
  @Input() carregando: boolean = false;
  @Input() message: string = 'Consultando...';
}
