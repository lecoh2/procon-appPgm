import { Component } from '@angular/core';
import { AccessService } from '../../../../../core/services/access.service';

@Component({
  selector: 'app-consultas-estagiarios',
  standalone:false,
  templateUrl: './consultas-estagiarios.component.html',
  styleUrl: './consultas-estagiarios.component.css'
})
export class ConsultasEstagiariosComponent {
 constructor(public access: AccessService
    ) { }

     currentYear: number = new Date().getFullYear(); // <- adiciona isso
}
