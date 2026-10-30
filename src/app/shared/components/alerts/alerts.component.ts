import {
  Component,
  ElementRef,
  Input,
  ViewChild,
  SimpleChanges,
  OnChanges,
  OnDestroy
} from '@angular/core';

@Component({
  selector: 'app-alerts',
  standalone: false,
  templateUrl: './alerts.component.html',
  styleUrl: './alerts.component.css'
})
export class AlertsComponent implements OnChanges, OnDestroy {

  // =====================================================
  // INPUTS
  // =====================================================

  @Input() icone: string = '';

  @Input() titulo: string = '';

  @Input() mensagens: string[] = [];

  @Input() tipo:
    | 'success'
    | 'danger'
    | 'warning'
    | 'info' = 'success';


  // =====================================================
  // VIEW CHILD
  // =====================================================

  @ViewChild('modalElement')
  modalElement!: ElementRef;


  // =====================================================
  // CONTROLE
  // =====================================================

  fading = false;

  // 30 segundos
  readonly tempoDuracao = 30000;

  private timeoutFade?: ReturnType<typeof setTimeout>;

  private timeoutFechar?: ReturnType<typeof setTimeout>;


  // =====================================================
  // ALTERAÇÃO DAS MENSAGENS
  // =====================================================

  ngOnChanges(changes: SimpleChanges): void {

    if (
      changes['mensagens'] &&
      this.mensagens.length > 0
    ) {

      // Remove qualquer contador anterior
      this.limparTimers();

      // Reinicia estado
      this.fading = false;

      // Inicia novo contador
      this.timeoutFade = setTimeout(() => {

        this.fading = true;

        // Pequeno tempo para finalizar
        this.timeoutFechar = setTimeout(() => {

          this.fecharMensagem();

        }, 100);

      }, this.tempoDuracao);

    }

  }


  // =====================================================
  // FECHAR MENSAGEM
  // =====================================================

  fecharMensagem(): void {

    this.limparTimers();

    this.mensagens = [];

  }


  // =====================================================
  // LIMPAR TIMERS
  // =====================================================

  private limparTimers(): void {

    if (this.timeoutFade) {

      clearTimeout(this.timeoutFade);

      this.timeoutFade = undefined;

    }

    if (this.timeoutFechar) {

      clearTimeout(this.timeoutFechar);

      this.timeoutFechar = undefined;

    }

  }


  // =====================================================
  // DESTRUIR COMPONENTE
  // =====================================================

  ngOnDestroy(): void {

    this.limparTimers();

  }

}