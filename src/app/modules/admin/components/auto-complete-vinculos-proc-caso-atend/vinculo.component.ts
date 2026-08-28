import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output
} from '@angular/core';

import { FormControl } from '@angular/forms';
import { debounceTime, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-vinculo',
  standalone: false,
  templateUrl: './vinculo.component.html'
})
export class VinculoComponent implements OnDestroy {

  control = new FormControl<string>('', {
    nonNullable: true
  });

  mostrarSugestoes = false;

  @Input() tipoVinculo: string | null = null;
  @Input() resultados: any[] = [];

  private _vinculoSelecionado: any = null;
  private readonly destruir$ = new Subject<void>();

  @Input()
  set vinculoSelecionado(value: any) {
    this._vinculoSelecionado = value;

    const label = value
      ? this.getLabel(value)
      : '';

    this.control.setValue(label, {
      emitEvent: false
    });
  }

  get vinculoSelecionado(): any {
    return this._vinculoSelecionado;
  }

  @Output() buscar = new EventEmitter<string>();
  @Output() selecionado = new EventEmitter<any>();

  constructor() {
    this.control.valueChanges
      .pipe(
        debounceTime(300),
        takeUntil(this.destruir$)
      )
      .subscribe(valor => {
        const termo = valor.trim();

        // Ao começar uma nova busca, remove a seleção anterior.
        if (
          this._vinculoSelecionado &&
          termo !== this.getLabel(this._vinculoSelecionado)
        ) {
          this._vinculoSelecionado = null;
          this.selecionado.emit(null);
        }

        if (termo.length >= 2) {
          this.mostrarSugestoes = true;

          console.log('Emitindo consulta:', termo);

          this.buscar.emit(termo);
          return;
        }

        this.mostrarSugestoes = false;
        this.buscar.emit('');
      });
  }

  selecionar(item: any): void {
    this._vinculoSelecionado = item;

    this.control.setValue(
      this.getLabel(item),
      { emitEvent: false }
    );

    this.mostrarSugestoes = false;
    this.selecionado.emit(item);
  }

  getLabel(item: any): string {
    if (!item) {
      return '';
    }

    const partes: string[] = [];

    if (item.numeroProcesso) {
      partes.push(item.numeroProcesso);
    }

    if (item.pasta) {
      partes.push(item.pasta);
    }

    if (item.titulo) {
      partes.push(item.titulo);
    }

    if (item.assunto) {
      partes.push(item.assunto);
    }

    return partes.join(' - ');
  }

  abrir(): void {
    const termo = this.control.value.trim();

    if (termo.length >= 2) {
      this.mostrarSugestoes = true;

      // Refaz a consulta ao focar no campo.
      this.buscar.emit(termo);
    }
  }

  fechar(): void {
    setTimeout(() => {
      this.mostrarSugestoes = false;
    }, 200);
  }

  limpar(): void {
    this._vinculoSelecionado = null;

    this.control.setValue('', {
      emitEvent: true
    });

    this.mostrarSugestoes = false;
    this.selecionado.emit(null);
  }

  ngOnDestroy(): void {
    this.destruir$.next();
    this.destruir$.complete();
  }
}