import {
  ChangeDetectorRef,
  Component,
  inject,
  NgZone,
  OnInit
} from '@angular/core';

import { Router } from '@angular/router';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem
} from '@angular/cdk/drag-drop';

import { KanbanColuna } from '../../../../../core/models/kanban/kanban-coluna';
import { KanbanService } from '../../../../../core/services/kanban.service';
import { HistoricoService } from '../../../../../core/services/historico.service';
import { ComentarioService } from '../../../../../core/services/comenario.service';

import { TipoEntidadeEnum } from '../../../../../core/models/enums/tipo-entidade/tipo-entidadeEnum';
import { CriarComentarioResponse } from '../../../../../core/models/comentario/criar-comentario-response';

declare var bootstrap: any;

@Component({
  selector: 'app-gestao-atividades',
  standalone: false,
  templateUrl: './gestao-atividades.component.html',
  styleUrl: './gestao-atividades.component.css'
})
export class GestaoAtividadesComponent implements OnInit {

  // =====================================================
  // SERVICES
  // =====================================================

  private readonly kanbanService = inject(KanbanService);
  private readonly comentarioService = inject(ComentarioService);
  private readonly historicoService = inject(HistoricoService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);
  private readonly zone = inject(NgZone);

  // =====================================================
  // KANBAN
  // =====================================================

  colunas: KanbanColuna[] = [];
  private colunasOriginais: KanbanColuna[] = [];

  carregando = false;

  filtro = {
    periodo: null as string | null,
    atribuicao: null as string | null,
    pessoaId: null as string | null,
    tipo: null as string | null,
    status: null as string | null
  };

  // =====================================================
  // MODAL / CARD
  // =====================================================

  cardSelecionado: any = null;
  cardIdSelecionado: string | null = null;
  isLoadingDetalhe = false;

  private modalInstance: any;

  // =====================================================
  // COMENTÁRIOS
  // =====================================================

  comentarios: CriarComentarioResponse[] = [];
  novoComentario = '';

  // =====================================================
  // HISTÓRICO
  // =====================================================

  historico: any[] = [];

  // =====================================================
  // MENSAGENS
  // =====================================================

  mensagemSucesso: string[] = [];
  mensagemErro: string[] = [];

  mensagemSucessoAtual: string | null = null;
  mensagemErroAtual: string | null = null;

  // =====================================================
  // PRIORIDADE
  // =====================================================

  prioridadeLabel: Record<number, string> = {
    1: 'Baixa',
    2: 'Média',
    3: 'Alta',
    4: 'Urgente'
  };

  prioridadeCor: Record<number, string> = {
    1: '#2ecc71',
    2: '#f1c40f',
    3: '#e67e22',
    4: '#e74c3c'
  };

  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {
    this.filtro = {
      periodo: null,
      atribuicao: null,
      pessoaId: null,
      tipo: null,
      status: null
    };

    this.carregarKanban();
  }

  // =====================================================
  // NORMALIZAR TIPO
  // =====================================================

  private normalizarTipo(tipo: unknown): string {
    return (tipo ?? '')
      .toString()
      .trim()
      .toLowerCase();
  }

  // =====================================================
  // CARREGAR KANBAN
  // =====================================================

  carregarKanban(): void {
    this.kanbanService
      .consultar()
      .subscribe({
        next: (res) => {
          const colunas = (res ?? [])
            .filter(coluna => Number(coluna.status) !== 4)
            .map(coluna => ({
              ...coluna,
              cards: (coluna.cards ?? []).map(card => ({
                ...card,
                tipo: this.normalizarTipo(card.tipo)
              }))
            }))
            .filter(coluna => coluna.cards.length > 0);

          this.colunasOriginais = structuredClone(colunas);

          setTimeout(() => {
            this.aplicarFiltro();
            this.cdr.detectChanges();
          }, 0);
        },

        error: (err) => {
          console.error('ERRO AO CARREGAR KANBAN:', err);

          this.mensagemErro = [
            err?.error?.message ??
            err?.error?.mensagem ??
            'Erro ao carregar o Kanban.'
          ];

          this.cdr.detectChanges();
        }
      });
  }

  // =====================================================
  // FILTROS
  // =====================================================

  filtrarPorStatus(): void {
    if (!this.filtro.status) {
      this.colunas = structuredClone(this.colunasOriginais);
      return;
    }

    this.colunas = this.colunasOriginais
      .map(coluna => ({
        ...coluna,
        cards: (coluna.cards ?? []).filter(
          card => Number(card.status) === Number(this.filtro.status)
        )
      }))
      .filter(coluna => coluna.cards.length > 0);
  }

  limparFiltro(): void {
    this.filtro = {
      periodo: null,
      atribuicao: null,
      pessoaId: null,
      tipo: null,
      status: null
    };

    this.aplicarFiltro();
  }

  aplicarFiltro(): void {
    let dados = structuredClone(this.colunasOriginais);

    const statusFiltro = this.filtro.status
      ? Number(this.filtro.status)
      : null;

    const tipoFiltro = this.normalizarTipo(this.filtro.tipo);

    dados = dados
      .map(coluna => {
        let cards = coluna.cards ?? [];

        if (statusFiltro !== null) {
          cards = cards.filter(
            card => Number(card.status) === statusFiltro
          );
        }

        if (tipoFiltro) {
          cards = cards.filter(
            card => this.normalizarTipo(card.tipo) === tipoFiltro
          );
        }

        return {
          ...coluna,
          cards
        };
      })
      .filter(coluna => coluna.cards.length > 0);

    this.colunas = dados;
  }

  // =====================================================
  // STATUS
  // =====================================================

  getStatusLabel(status: number): string {
    switch (status) {
      case 1: return 'A Fazer';
      case 2: return 'Em Andamento';
      case 3: return 'Concluído';
      case 4: return 'Cancelado';
      default: return '---';
    }
  }

  getCorColuna(status: number): string {
    switch (status) {
      case 1: return 'bg-info';
      case 2: return 'bg-primary';
      case 3: return 'bg-success';
      default: return 'bg-dark';
    }
  }

  mudarStatus(
    id: string,
    status: number
  ): void {
    this.zone.run(() => {
      this.carregando = true;
      this.mensagemErro = [];
      this.mensagemSucesso = [];
      this.cdr.detectChanges();
    });

    this.kanbanService
      .atualizarStatus(id, status)
      .subscribe({
        next: (res: any) => {
          this.zone.run(() => {
            this.carregando = false;
            this.mensagemErro = [];
            this.mensagemSucesso = [
              res?.message ??
              'Status atualizado com sucesso.'
            ];

            this.fecharModal();

            this.cardSelecionado = null;
            this.cardIdSelecionado = null;

            this.carregarKanban();

            this.cdr.markForCheck();

            setTimeout(() => {
              this.zone.run(() => {
                this.cdr.detectChanges();
              });
            }, 0);

            setTimeout(() => {
              this.zone.run(() => {
                this.mensagemSucesso = [];
                this.cdr.detectChanges();
              });
            }, 3000);
          });
        },

        error: (err: any) => {
          this.zone.run(() => {
            this.carregando = false;
            this.mensagemSucesso = [];
            this.mensagemErro = [
              err?.error?.message ??
              err?.error?.mensagem ??
              'Erro ao atualizar status.'
            ];

            this.cdr.markForCheck();

            setTimeout(() => {
              this.zone.run(() => {
                this.cdr.detectChanges();
              });
            }, 0);
          });
        }
      });
  }

  // =====================================================
  // PRIORIDADE
  // =====================================================

  getPrioridadeLabel(p: number): string {
    return this.prioridadeLabel[p] ?? '---';
  }

  getPrioridadeCor(p: number): string {
    return this.prioridadeCor[p] ?? '#6c757d';
  }

  getPrioridade(
    p?: number | null
  ): { label: string; cor: string } {
    if (!p) {
      return {
        label: 'Sem prioridade',
        cor: '#6c757d'
      };
    }

    switch (p) {
      case 1:
        return { label: 'Baixa', cor: '#2ecc71' };
      case 2:
        return { label: 'Média', cor: '#f1c40f' };
      case 3:
        return { label: 'Alta', cor: '#e67e22' };
      case 4:
        return { label: 'Urgente', cor: '#e74c3c' };
      default:
        return { label: '---', cor: '#6c757d' };
    }
  }

  // =====================================================
  // MODALIDADE
  // =====================================================

  getModalidadeLabel(status: number): string {
    switch (status) {
      case 1: return 'Presencial';
      case 2: return 'Online';
      case 3: return 'Híbrido';
      case 4: return 'Não se aplica';
      default: return '---';
    }
  }

  // =====================================================
  // SELECIONAR CARD
  // =====================================================

  selecionarCard(card: any): void {
    this.mensagemSucessoAtual = null;
    this.mensagemErroAtual = null;

    this.comentarios = [];
    this.historico = [];
    this.novoComentario = '';

    const tipo = this.normalizarTipo(card?.tipo);

    if (
      tipo !== 'tarefa' &&
      tipo !== 'evento'
    ) {
      console.error('Tipo de card inválido:', card);

      this.mensagemErroAtual =
        'Não foi possível identificar o tipo da atividade.';

      return;
    }

    // IMPORTANTE:
    // já salva o card com o tipo normalizado.
    // Assim comentários, histórico e detalhes usam o mesmo valor.
    this.cardSelecionado = {
      ...card,
      tipo
    };

    this.cardIdSelecionado = card.id;
    this.isLoadingDetalhe = true;

    this.cdr.detectChanges();

    const modalElement =
      document.getElementById('modalDetalhes');

    if (!modalElement) {
      console.error('Modal modalDetalhes não encontrado.');

      this.isLoadingDetalhe = false;
      return;
    }

    this.modalInstance =
      bootstrap.Modal.getOrCreateInstance(modalElement);

    setTimeout(() => {
      this.modalInstance.show();
    }, 0);

    // Comentários e histórico não dependem da chamada de detalhes.
    this.carregarComentarios();
    this.carregarHistorico(this.cardSelecionado);

    this.kanbanService
      .obterDetalhes(card.id, tipo)
      .subscribe({
        next: (res) => {
          this.zone.run(() => {
            this.cardSelecionado = {
              ...card,
              ...res,
              tipo,

              vinculoDescricao:
                res?.vinculoDescricao ??
                card?.vinculoDescricao,

              tipoVinculo:
                res?.tipoVinculo ??
                card?.tipoVinculo,

              responsaveis:
                res?.responsaveis ??
                [],

              etiquetas:
                res?.etiquetas ??
                []
            };

            this.isLoadingDetalhe = false;

            this.cdr.markForCheck();

            setTimeout(() => {
              this.cdr.detectChanges();
            }, 0);
          });
        },

        error: (err) => {
          this.zone.run(() => {
            console.error(
              'Erro ao carregar detalhes:',
              err
            );

            // Mantém o card original no modal.
            // Comentários e histórico continuam funcionando.
            this.cardSelecionado = {
              ...this.cardSelecionado,
              tipo,
              responsaveis:
                this.cardSelecionado?.responsaveis ?? [],
              etiquetas:
                this.cardSelecionado?.etiquetas ?? []
            };

            this.isLoadingDetalhe = false;

            this.mensagemErroAtual =
              err?.error?.message ??
              err?.error?.mensagem ??
              'Erro ao carregar os detalhes.';

            this.cdr.detectChanges();
          });
        }
      });
  }

  // =====================================================
  // HISTÓRICO
  // =====================================================

  carregarHistorico(card: any): void {
    if (!card?.id) {
      return;
    }

    const tipo = this.normalizarTipo(card.tipo);

    if (
      tipo !== 'tarefa' &&
      tipo !== 'evento'
    ) {
      console.error(
        'Tipo inválido para carregar histórico:',
        card
      );

      return;
    }

    const entidade =
      tipo === 'evento'
        ? TipoEntidadeEnum.Evento
        : TipoEntidadeEnum.Tarefa;

    this.historicoService
      .ConsultarHistorico(
        entidade,
        card.id
      )
      .subscribe({
        next: (res) => {
          this.historico = (res ?? [])
            .map(h => ({
              ...h,
              antes: this.parseJsonSeguro(h.dadosAntes),
              depois: this.parseJsonSeguro(h.dadosDepois)
            }));

          this.cdr.detectChanges();
        },

        error: (err) => {
          console.error(
            'ERRO HISTÓRICO:',
            err
          );

          this.historico = [];
          this.cdr.detectChanges();
        }
      });
  }

  private parseJsonSeguro(valor: string | null | undefined): any {
    if (!valor) {
      return null;
    }

    try {
      return JSON.parse(valor);
    }
    catch {
      return null;
    }
  }

  getMudancas(
    h: any
  ): { campo: string; antes: any; depois: any }[] {
    if (!h?.antes || !h?.depois) {
      return [];
    }

    const mudancas: {
      campo: string;
      antes: any;
      depois: any;
    }[] = [];

    Object.keys(h.depois).forEach(key => {
      const antes = h.antes[key];
      const depois = h.depois[key];

      if (
        JSON.stringify(antes) !==
        JSON.stringify(depois)
      ) {
        mudancas.push({
          campo: key,
          antes,
          depois
        });
      }
    });

    return mudancas;
  }

  formatarCampo(campo: string): string {
    const map: Record<string, string> = {
      Titulo: 'Título',
      DataInicial: 'Data Inicial',
      DataFinal: 'Data Final',
      HoraInicial: 'Hora Inicial',
      HoraFinal: 'Hora Final',
      DiaInteiro: 'Dia Inteiro',
      Endereco: 'Endereço',
      Observacao: 'Observação',
      Modalidade: 'Modalidade',
      StatusGeralKanban: 'Status',
      Responsaveis: 'Responsáveis'
    };

    return map[campo] || campo;
  }

  formatarValor(
    valor: any,
    campo: string
  ): string {
    if (
      valor === null ||
      valor === undefined
    ) {
      return '-';
    }

    if (Array.isArray(valor)) {
      return valor.join(', ');
    }

    if (typeof valor === 'boolean') {
      return valor ? 'Sim' : 'Não';
    }

    if (campo === 'StatusGeralKanban') {
      return this.getStatusLabel(valor);
    }

    if (campo === 'Modalidade') {
      return this.getModalidadeLabel(valor);
    }

    if (campo.toLowerCase().includes('data')) {
      return new Date(valor)
        .toLocaleDateString('pt-BR');
    }

    if (campo.toLowerCase().includes('hora')) {
      return valor.toString();
    }

    return valor.toString();
  }

  // =====================================================
  // COMENTÁRIOS - CADASTRAR
  // =====================================================

  adicionarComentario(): void {
    const texto =
      this.novoComentario?.trim();

    if (!texto) {
      return;
    }

    if (!this.cardSelecionado?.id) {
      this.mensagemErroAtual =
        'Nenhuma atividade foi selecionada.';

      return;
    }

    const tipo =
      this.normalizarTipo(
        this.cardSelecionado.tipo
      );

    if (
      tipo !== 'tarefa' &&
      tipo !== 'evento'
    ) {
      console.error(
        'Tipo de card inválido:',
        this.cardSelecionado
      );

      this.mensagemErroAtual =
        'Não foi possível identificar o tipo da atividade.';

      return;
    }

    const request = {
      tarefaId:
        tipo === 'tarefa'
          ? this.cardSelecionado.id
          : null,

      eventoId:
        tipo === 'evento'
          ? this.cardSelecionado.id
          : null,

      texto
    };

    this.comentarioService
      .criarComentario(request)
      .subscribe({
        next: (res) => {
          this.novoComentario = '';

          this.mensagemSucessoAtual =
            res?.message ??
            'Comentário cadastrado com sucesso.';

          this.mensagemErroAtual = null;

          this.carregarComentarios();
          this.carregarKanban();

          this.cdr.detectChanges();

          setTimeout(() => {
            this.mensagemSucessoAtual = null;
            this.cdr.detectChanges();
          }, 3000);
        },

        error: (err) => {
          console.error(
            'ERRO AO CADASTRAR COMENTÁRIO:',
            err
          );

          this.mensagemSucessoAtual = null;

          this.mensagemErroAtual =
            err?.error?.message ??
            err?.error?.mensagem ??
            'Erro ao cadastrar comentário.';

          this.cdr.detectChanges();
        }
      });
  }

  // =====================================================
  // COMENTÁRIOS - CONSULTAR
  // =====================================================

  carregarComentarios(): void {
    if (!this.cardSelecionado?.id) {
      return;
    }

    const tipo =
      this.normalizarTipo(
        this.cardSelecionado.tipo
      );

    if (
      tipo !== 'tarefa' &&
      tipo !== 'evento'
    ) {
      console.error(
        'Tipo inválido para carregar comentários:',
        this.cardSelecionado
      );

      this.comentarios = [];
      return;
    }

    const params: {
      tarefaId?: string | null;
      eventoId?: string | null;
    } = {
      tarefaId:
        tipo === 'tarefa'
          ? this.cardSelecionado.id
          : null,

      eventoId:
        tipo === 'evento'
          ? this.cardSelecionado.id
          : null
    };

    this.comentarioService
      .obterComentario(params)
      .subscribe({
        next: (res) => {
          this.comentarios = res ?? [];
          this.cdr.detectChanges();
        },

        error: (err) => {
          console.error(
            'ERRO AO CARREGAR COMENTÁRIOS:',
            err
          );

          this.comentarios = [];

          this.mensagemErroAtual =
            err?.error?.message ??
            err?.error?.mensagem ??
            'Erro ao carregar os comentários.';

          this.cdr.detectChanges();
        }
      });
  }

  // =====================================================
  // EDITAR
  // =====================================================

  editar(
    id: string,
    tipo: string
  ): void {
    const tipoNormalizado =
      this.normalizarTipo(tipo);

    this.fecharModal();

    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';

    document
      .querySelectorAll('.modal-backdrop')
      .forEach(el => el.remove());

    setTimeout(() => {
      if (tipoNormalizado === 'tarefa') {
        this.router.navigate([
          '/admin/editar-tarefa',
          id
        ]);

        return;
      }

      if (tipoNormalizado === 'evento') {
        this.router.navigate([
          '/admin/editar-evento',
          id
        ]);
      }
    }, 200);
  }

  private fecharModal(): void {
    if (this.modalInstance) {
      this.modalInstance.hide();
      return;
    }

    const modalElement =
      document.getElementById('modalDetalhes');

    if (!modalElement) {
      return;
    }

    const modal =
      bootstrap.Modal
        .getOrCreateInstance(modalElement);

    modal.hide();
  }

  // =====================================================
  // VÍNCULO - PROCON
  // =====================================================

  getTipoVinculoLabel(
    tipo?: number | null
  ): string {
    switch (tipo) {
      case 3:
        return 'Atendimento';
      default:
        return '';
    }
  }

  // =====================================================
  // DRAG AND DROP
  // =====================================================

  drop(
    event: CdkDragDrop<any[]>,
    colunaDestino: any
  ): void {
    const card = event.item.data;

    if (
      event.previousContainer ===
      event.container
    ) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      return;
    }

    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );

    const novoStatus =
      colunaDestino.status;

    this.kanbanService
      .atualizarStatus(
        card.id,
        novoStatus
      )
      .subscribe({
        next: () => {
          card.status = novoStatus;

          this.colunasOriginais =
            structuredClone(this.colunas);

          this.cdr.detectChanges();
        },

        error: (err) => {
          console.error(
            'ERRO AO MOVER CARD:',
            err
          );

          this.carregarKanban();
        }
      });
  }
}
