import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-texto-cnpi-animado',
  standalone:false,
  templateUrl: './texto-cnpi-animado.component.html',
  styleUrls: ['./texto-cnpi-animado.component.css']
})
export class TextoCnpiAnimadoComponent implements OnInit {
 // @Input() frase: string = 'Programa de Proteção e\nDefesa do Consumidor'; // duas linhas
  @Input() frase: string = 'Controle de Processo e Contratos'; // duas linhas
 
   
  textoExibido: string = '';
  private index: number = 0;

  ngOnInit(): void {
    this.digitar();
  }

  private digitar() {
    if (this.index < this.frase.length) {
      this.textoExibido += this.frase[this.index];
      this.index++;
      setTimeout(() => this.digitar(), 50); // mais rápido
    }
  }
}