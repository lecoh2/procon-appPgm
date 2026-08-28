import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';

import { FormControl } from '@angular/forms';

import {
  debounceTime,
  distinctUntilChanged,
  Subject,
  takeUntil
} from 'rxjs';

import {
  ConsultarUsuarioResponse
} from '../../../../core/models/usuario/consultar-usuarios.response';

@Component({
  selector: 'app-selecionar-responsaveis',
  standalone: false,
  templateUrl: './cadastrar-responsaveis.component.html'
})
export class CadastrarResponsaveisComponent
  implements OnInit, OnDestroy {

  @Input() label = 'Responsáveis';

  @Input() resultados: ConsultarUsuarioResponse[] = [];

  @Input() selecionadas: ConsultarUsuarioResponse[] = [];

  @Output() selecionadasChange =
    new EventEmitter<ConsultarUsuarioResponse[]>();

  @Output() buscar = new EventEmitter<string>();

  control = new FormControl<string>('', {
    nonNullable: true
  });

  aberto = false;

  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.control.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(valor => {
        const termo = valor.trim();

        if (!termo) {
          this.aberto = false;
          this.buscar.emit('');
          return;
        }

        this.buscar.emit(termo);
        this.aberto = true;
      });
  }

  selecionar(usuario: ConsultarUsuarioResponse): void {
    const jaSelecionado = this.selecionadas.some(
      item => item.idUsuario === usuario.idUsuario
    );

    if (!jaSelecionado) {
      const novaLista = [
        ...this.selecionadas,
        usuario
      ];

      this.selecionadas = novaLista;

      this.selecionadasChange.emit([
        ...novaLista
      ]);
    }

    this.control.setValue('', {
      emitEvent: false
    });

    this.aberto = false;
  }

  remover(usuario: ConsultarUsuarioResponse): void {
    const novaLista = this.selecionadas.filter(
      item => item.idUsuario !== usuario.idUsuario
    );

    this.selecionadas = novaLista;

    this.selecionadasChange.emit([
      ...novaLista
    ]);
  }

  isSelecionado(usuario: ConsultarUsuarioResponse): boolean {
    return this.selecionadas.some(
      item => item.idUsuario === usuario.idUsuario
    );
  }

  abrir(): void {
    const termo = this.control.value.trim();

    if (termo) {
      this.aberto = true;
      this.buscar.emit(termo);
    }
  }

  fechar(): void {
    setTimeout(() => {
      this.aberto = false;
    }, 200);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}