declare var bootstrap: any;

import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild
} from '@angular/core';

import {
  FormBuilder,
  Validators
} from '@angular/forms';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  finalize
} from 'rxjs';

import {
  AtendimentoService
} from '../../../../../core/services/atendimento.service';

import {
  AuthHelper
} from '../../../../../core/helpers/auth.helper';

import {
  TarefaService
} from '../../../../../core/services/tarefa.service';

import {
  EtiquetaService
} from '../../../../../core/services/etiqueta.service';

import {
  UsuarioService
} from '../../../../../core/services/usuario.service';

import {
  HistoricoService
} from '../../../../../core/services/historico.service';

import {
  ConsultarEtiquetaResponse
} from '../../../../../core/models/etiqueta/consultar-etiqueta-response';

import {
  PrioridadeTarefaEnum
} from '../../../../../core/models/enums/prioridade/prioridade-tarefaEnum';

import {
  StatusGeralKanbanEnum
} from '../../../../../core/models/enums/status-kaban/status-kaban-geralEnum';

import {
  ConsultarUsuarioResponse
} from '../../../../../core/models/usuario/consultar-usuarios.response';

import {
  EditarTarefaRequest
} from '../../../../../core/models/tarefa/editar-tarefa-request';

import {
  TipoEntidadeEnum
} from '../../../../../core/models/enums/tipo-entidade/tipo-entidadeEnum';

@Component({
  selector: 'app-editar-tarefa',
  standalone: false,
  templateUrl: './editar-tarefa.component.html',
  styleUrl: './editar-tarefa.component.css'
})
export class EditarTarefaComponent
  implements OnInit {

  // =====================================================
  // MODAL HISTÓRICO
  // =====================================================

  @ViewChild('modalHistorico')
  modalHistorico!: ElementRef;

  // =====================================================
  // INJEÇÕES
  // =====================================================

  private fb =
    inject(FormBuilder);

  private tarefaService =
    inject(TarefaService);

  private etiquetaService =
    inject(EtiquetaService);

  private usuarioService =
    inject(UsuarioService);

  private atendimentoService =
    inject(AtendimentoService);

  private historicoService =
    inject(HistoricoService);

  private authHelper =
    inject(AuthHelper);

  private route =
    inject(ActivatedRoute);

  private router =
    inject(Router);

  private cdr =
    inject(ChangeDetectorRef);

  // =====================================================
  // ATRIBUTOS
  // =====================================================

  id!: string;

  vinculoSelecionado: any =
    null;

  mensagemErro: string[] =
    [];

  mensagemSucesso: string[] =
    [];

  carregando =
    false;

  historico: any[] =
    [];

  carregandoHistorico =
    false;

  // =====================================================
  // ENUMS
  // =====================================================

  statusEnum =
    StatusGeralKanbanEnum;

  prioridadeEnum =
    PrioridadeTarefaEnum;

  // =====================================================
  // ETIQUETAS
  // =====================================================

  grupoTarefasEtiquetas:
    ConsultarEtiquetaResponse[] =
    [];

  etiquetasSelecionadas:
    ConsultarEtiquetaResponse[] =
    [];

  // =====================================================
  // RESPONSÁVEIS
  // =====================================================

  responsaveis:
    ConsultarUsuarioResponse[] =
    [];

  responsaveisSelecionados:
    ConsultarUsuarioResponse[] =
    [];

  responsaveisFiltrados:
    ConsultarUsuarioResponse[] =
    [];

  // =====================================================
  // ATENDIMENTO
  // =====================================================

  resultadosVinculo:
    any[] =
    [];

  // =====================================================
  // FORM
  // =====================================================

  form =
    this.fb.group({

      descricao: [
        '',
        Validators.required
      ],

      dataTarefa: [
        ''
      ],

      prioridade: [
        PrioridadeTarefaEnum.Media
      ],

      statusGeralKanban: [
        StatusGeralKanbanEnum.A_Fazer
      ],

      atendimentoId:
        this.fb.control<
          string | null
        >(null),

      tipoVinculo:
        this.fb.control<
          'atendimento' | null
        >(null)

    });

  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    this.id =
      this.route
        .snapshot
        .paramMap
        .get('id')!;

    this.removerBackdrop();

    this.carregarBase();

    this.carregarTarefa();

    this.form
      .get('tipoVinculo')
      ?.valueChanges
      .subscribe(() => {

        this.limparVinculos();

      });
  }

  // =====================================================
  // REMOVER BACKDROP
  // =====================================================

  removerBackdrop(): void {

    document.body
      .classList
      .remove(
        'modal-open'
      );

    document.body.style.overflow =
      '';

    document.body.style.paddingRight =
      '';

    const backdrops =
      document.querySelectorAll(
        '.modal-backdrop'
      );

    backdrops.forEach(
      b =>
        b.remove()
    );

    const modals =
      document.querySelectorAll(
        '.modal.show'
      );

    modals.forEach(
      m =>
        m.classList.remove(
          'show'
        )
    );
  }

  // =====================================================
  // CARREGAR BASE
  // =====================================================

  carregarBase(): void {

    // =========================
    // ETIQUETAS
    // =========================

    this.etiquetaService
      .consultar()
      .subscribe({

        next: res => {

          this.grupoTarefasEtiquetas =
            res ?? [];

        },

        error: err => {

          console.error(
            'Erro ao carregar etiquetas:',
            err
          );

        }

      });

    // =========================
    // RESPONSÁVEIS
    // =========================

    this.usuarioService
      .consultarUsuarioResponsavel()
      .subscribe({

        next: res => {

          this.responsaveis =
            res ?? [];

          this.responsaveisFiltrados =
            this.responsaveis;

        },

        error: err => {

          console.error(
            'Erro ao carregar responsáveis:',
            err
          );

        }

      });
  }

  // =====================================================
  // RESPONSÁVEIS
  // =====================================================

  buscarResponsaveis(
    termo: string
  ): void {

    if (!termo) {

      this.responsaveisFiltrados =
        this.responsaveis;

      return;
    }

    const termoLower =
      termo
        .toLowerCase();

    this.responsaveisFiltrados =
      this.responsaveis
        .filter(
          x =>
            x.nomeUsuario
              ?.toLowerCase()
              .includes(
                termoLower
              )
        );
  }

  // =====================================================
  // BUSCAR ATENDIMENTO
  // =====================================================

  buscarVinculo(
    termo: string
  ): void {

    const tipo =
      this.form
        .get('tipoVinculo')
        ?.value;

    if (
      tipo !== 'atendimento' ||
      !termo
    ) {

      this.resultadosVinculo =
        [];

      return;
    }

    this.atendimentoService
      .consultarAtendimentoAutoComplete(
        termo
      )
      .subscribe({

        next: res => {

          this.resultadosVinculo =
            res ?? [];

        },

        error: err => {

          console.error(
            'Erro ao consultar atendimento:',
            err
          );

          this.resultadosVinculo =
            [];
        }

      });
  }

  // =====================================================
  // SELECIONAR ATENDIMENTO
  // =====================================================

  selecionarVinculo(
    item: any
  ): void {

    const tipo =
      this.form
        .get('tipoVinculo')
        ?.value;

    this.limparVinculos();

    this.resultadosVinculo =
      [];

    this.vinculoSelecionado =
      item;

    if (
      tipo === 'atendimento'
    ) {

      this.form.patchValue(
        {
          atendimentoId:
            item.id
        },
        {
          emitEvent:
            false
        }
      );
    }
  }

  // =====================================================
  // CARREGAR TAREFA
  // =====================================================

  carregarTarefa(): void {

    this.carregando =
      true;

    this.tarefaService
      .ObterTarefaPorId(
        this.id
      )
      .subscribe({

        next: res => {

          let tipoVinculo:
            'atendimento' | null =
            null;

          if (
            res.atendimentoId
          ) {

            tipoVinculo =
              'atendimento';
          }

          // ===============================================
          // FORM
          // ===============================================

          this.form.patchValue(
            {

              descricao:
                res.descricao,

              dataTarefa:
                res.dataTarefa

                  ? res.dataTarefa
                      .split('T')[0]

                  : null,

              prioridade:
                res.prioridade,

              statusGeralKanban:
                res.statusGeralKanban,

              atendimentoId:
                res.atendimentoId ??
                null,

              tipoVinculo:
                tipoVinculo

            },
            {
              emitEvent:
                false
            }
          );

          // ===============================================
          // RESPONSÁVEIS
          // ===============================================

          this.responsaveisSelecionados =
            res.grupoTarefaResponsaveis
              ?.map(
                (x: any) => ({

                  idUsuario:
                    x.usuarioId ??
                    x.idUsuario ??
                    x.id,

                  idPessoa:
                    x.idPessoa ??
                    '',

                  nomeUsuario:
                    x.nomeUsuario ??
                    ''

                })
              )
            ??
            [];

          // ===============================================
          // ETIQUETAS
          // ===============================================

          this.etiquetasSelecionadas =
            res.grupoTarefasEtiquetas
              ?.map(
                (x: any) => ({

                  id:
                    x.etiquetaId ??
                    x.id,

                  nome:
                    x.nome,

                  cor:
                    x.cor

                })
              )
            ??
            [];

          // ===============================================
          // ATENDIMENTO
          // ===============================================

          if (
            res.atendimentoId
          ) {

            this.vinculoSelecionado =
              {

                id:
                  res.atendimentoId,

                tipo:
                  'atendimento',

                pasta:
                  res.atendimentoAssunto,

               

              };

          }
          else {

            this.vinculoSelecionado =
              null;
          }

          this.carregando =
            false;

          this.cdr
            .detectChanges();
        },

        error: err => {

          console.error(
            'Erro ao carregar tarefa:',
            err
          );

          this.mensagemErro = [
            'Erro ao carregar tarefa'
          ];

          this.carregando =
            false;

          this.cdr
            .detectChanges();
        }

      });
  }

  // =====================================================
  // SUBMIT
  // =====================================================

  onSubmit(): void {

    this.mensagemErro =
      [];

    this.mensagemSucesso =
      [];

    if (
      this.form.invalid
    ) {

      this.form
        .markAllAsTouched();

      return;
    }

    if (
      this.carregando
    ) {

      return;
    }

    this.carregando =
      true;

    const f =
      this.form.value;

    // =====================================================
    // RESPONSÁVEIS
    // =====================================================

    const grupoTarefaResponsaveis =
      this.responsaveisSelecionados
        .filter(
          r =>
            !!r.idUsuario
        )
        .map(
          r => ({

            usuarioId:
              r.idUsuario

          })
        );

    // =====================================================
    // ETIQUETAS
    // =====================================================

    const grupoTarefasEtiquetas =
      this.etiquetasSelecionadas
        .filter(
          e =>
            !!e.id
        )
        .map(
          e => ({

            etiquetaId:
              e.id!

          })
        );

    // =====================================================
    // REQUEST
    // =====================================================

    const request:
      EditarTarefaRequest =
      {

        // =========================
        // BÁSICOS
        // =========================

        descricao:
          f.descricao ??
          '',

        dataTarefa:
          f.dataTarefa

            ? new Date(
                f.dataTarefa
              )

            : null,

        prioridade:
          f.prioridade!,

        statusGeralKanban:
          f.statusGeralKanban!,

        // =========================
        // ATENDIMENTO
        // =========================

        atendimentoId:
          f.atendimentoId ??
          null,

        // =========================
        // ETIQUETAS
        // =========================

        grupoTarefasEtiquetas:
          grupoTarefasEtiquetas,

        // =========================
        // RESPONSÁVEIS
        // =========================

        grupoTarefaResponsaveis:
          grupoTarefaResponsaveis

      };

    console.log(
      'REQUEST UPDATE:',
      request
    );

    this.tarefaService
      .editarTarefa(
        this.id,
        request
      )
      .pipe(

        finalize(
          () => {

            this.carregando =
              false;

            this.cdr
              .detectChanges();
          }
        )

      )
      .subscribe({

        next: (
          res: any
        ) => {

          this.mensagemErro =
            [];

          this.mensagemSucesso = [

            res.message ??
            'Tarefa atualizada com sucesso'

          ];

          setTimeout(
            () => {

              this.router.navigate([
                '/admin/gestao-atividades'
              ]);

            },
            3000
          );
        },

        error: (
          err: HttpErrorResponse
        ) => {

          this.tratarErro(
            err
          );

        }

      });
  }

  // =====================================================
  // ERRO
  // =====================================================

  tratarErro(
    err: HttpErrorResponse
  ): void {

    console.error(
      'Erro ao atualizar tarefa:',
      err
    );

    console.error(
      'Erro retornado pela API:',
      err.error
    );

    const e =
      err.error;

    this.mensagemErro =
      [];

    // =====================================================
    // ARRAY DE ERROS
    // =====================================================

    if (
      Array.isArray(
        e?.errors
      )
    ) {

      this.mensagemErro =
        e.errors
          .map(
            (x: any) =>
              x.erro ??
              x.errorMessage ??
              x.message ??
              String(x)
          )
          .filter(
            (x: any) =>
              !!x
          );
    }

    // =====================================================
    // MODEL STATE
    // =====================================================

    else if (
      e?.errors &&
      typeof e.errors ===
        'object'
    ) {

      for (
        const key in e.errors
      ) {

        const erros =
          e.errors[key];

        if (
          Array.isArray(
            erros
          )
        ) {

          this.mensagemErro.push(
            ...erros
          );

        }
        else if (
          erros
        ) {

          this.mensagemErro.push(
            String(
              erros
            )
          );

        }
      }
    }

    // =====================================================
    // MENSAGEM PERSONALIZADA
    // =====================================================

    else if (
      e?.mensagem
    ) {

      this.mensagemErro.push(
        e.mensagem
      );

      if (
        e?.innerException
      ) {

        this.mensagemErro.push(
          e.innerException
        );

      }

      if (
        e?.innerException2
      ) {

        this.mensagemErro.push(
          e.innerException2
        );

      }
    }

    // =====================================================
    // MESSAGE
    // =====================================================

    else if (
      e?.message
    ) {

      this.mensagemErro.push(
        e.message
      );

    }

    // =====================================================
    // FALLBACK
    // =====================================================

    else {

      this.mensagemErro.push(
        'Erro ao atualizar tarefa'
      );

    }

    this.carregando =
      false;

    this.cdr
      .detectChanges();
  }

  // =====================================================
  // VOLTAR
  // =====================================================

  irParaLista(): void {

    this.router.navigate([
      '/admin/gestao-atividades'
    ]);
  }

  // =====================================================
  // LIMPAR VÍNCULO
  // =====================================================

  private limparVinculos(): void {

    this.form.patchValue(
      {

        atendimentoId:
          null

      },
      {
        emitEvent:
          false
      }
    );

    this.vinculoSelecionado =
      null;

    this.resultadosVinculo =
      [];
  }

  // =====================================================
  // HISTÓRICO
  // =====================================================

  abrirHistoricoTarefa(
    tarefaId: string
  ): void {

    this.carregandoHistorico =
      true;

    this.historico =
      [];

    const modal =
      new bootstrap.Modal(
        this.modalHistorico
          .nativeElement
      );

    modal.show();

    this.historicoService
      .ConsultarHistorico(
        TipoEntidadeEnum.Tarefa,
        tarefaId
      )
      .subscribe({

        next: res => {

          this.historico =
            (res ?? [])
              .map(
                h => ({

                  ...h,

                  antes:
                    h.dadosAntes

                      ? JSON.parse(
                          h.dadosAntes
                        )

                      : null,

                  depois:
                    h.dadosDepois

                      ? JSON.parse(
                          h.dadosDepois
                        )

                      : null

                })
              );

          this.carregandoHistorico =
            false;

          this.cdr
            .detectChanges();
        },

        error: err => {

          console.error(
            'Erro ao carregar histórico:',
            err
          );

          this.carregandoHistorico =
            false;

          this.cdr
            .detectChanges();
        }

      });
  }

  // =====================================================
  // FORMATAR CAMPO
  // =====================================================

  formatarCampo(
    campo: string
  ): string {

    const map: any =
      {

        Descricao:
          'Descrição',

        DataTarefa:
          'Data da Tarefa',

        Prioridade:
          'Prioridade',

        StatusGeralKanban:
          'Status',

        Atendimento:
          'Atendimento',

        AtendimentoId:
          'Atendimento',

        Responsaveis:
          'Responsáveis',

        Etiquetas:
          'Etiquetas'

      };

    return (
      map[campo] ||
      campo
    );
  }

  // =====================================================
  // FORMATAR VALOR
  // =====================================================

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

    if (
      Array.isArray(
        valor
      )
    ) {

      return valor.length > 0
        ? valor.join(', ')
        : '-';
    }

    if (
      typeof valor ===
      'boolean'
    ) {

      return valor
        ? 'Sim'
        : 'Não';
    }

    if (
      campo ===
      'StatusGeralKanban'
    ) {

      return this
        .getStatusLabel(
          Number(valor)
        );
    }

    if (
      campo ===
      'Prioridade'
    ) {

      return this
        .getPrioridadeLabel(
          Number(valor)
        );
    }

    if (
      campo
        .toLowerCase()
        .includes(
          'data'
        )
    ) {

      return new Date(
        valor
      )
        .toLocaleDateString(
          'pt-BR'
        );
    }

    return valor
      .toString();
  }

  // =====================================================
  // STATUS
  // =====================================================

  getStatusLabel(
    status: number
  ): string {

    switch (
      status
    ) {

      case 1:
        return 'A Fazer';

      case 2:
        return 'Em Andamento';

      case 3:
        return 'Concluído';

      case 4:
        return 'Cancelado';

      default:
        return '---';
    }
  }

  // =====================================================
  // PRIORIDADE
  // =====================================================

  getPrioridadeLabel(
    prioridade: number
  ): string {

    switch (
      prioridade
    ) {

      case 1:
        return 'Baixa';

      case 2:
        return 'Média';

      case 3:
        return 'Alta';

      case 4:
        return 'Urgente';

      default:
        return '---';
    }
  }

  // =====================================================
  // MUDANÇAS DO HISTÓRICO
  // =====================================================

  getMudancas(
    h: any
  ): {
    campo: string;
    antes: any;
    depois: any;
  }[] {

    if (
      !h.antes ||
      !h.depois
    ) {

      return [];
    }

    const mudancas:
      {
        campo: string;
        antes: any;
        depois: any;
      }[] =
      [];

    Object
      .keys(
        h.depois
      )
      .forEach(
        key => {

          const antes =
            h.antes[key];

          const depois =
            h.depois[key];

          if (
            JSON.stringify(
              antes
            ) !==
            JSON.stringify(
              depois
            )
          ) {

            mudancas.push(
              {

                campo:
                  key,

                antes:
                  antes,

                depois:
                  depois

              }
            );
          }
        }
      );

    return mudancas;
  }
}