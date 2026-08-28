import { Component, inject, OnInit } from '@angular/core';

import { FormBuilder, Validators } from '@angular/forms';

import { Router } from '@angular/router';

import { HttpErrorResponse } from '@angular/common/http';

import { CriarListaTarefaRequest } from '../../../../../../core/models/tarefa/criar-lista-tarefa-request';

import { CadastrarTarefaRequest } from '../../../../../../core/models/tarefa/cadastrar-tarefa.resquest';

import { UsuarioService } from '../../../../../../core/services/usuario.service';

import { ConsultarUsuarioResponse } from '../../../../../../core/models/usuario/consultar-usuarios.response';

import { AtendimentoService } from '../../../../../../core/services/atendimento.service';

import { ListaTarefasResponse } from '../../../../../../core/models/tarefa/lista-tarefas-response';

import { TarefaService } from '../../../../../../core/services/tarefa.service';

import { AuthHelper } from '../../../../../../core/helpers/auth.helper';

import { AutenticarUsuarioResponse } from '../../../../../../core/models/usuario/autenticar-usuario.response';

import { EtiquetaService } from '../../../../../../core/services/etiqueta.service';

import { PrioridadeTarefaEnum } from '../../../../../../core/models/enums/prioridade/prioridade-tarefaEnum';

import { StatusGeralKanbanEnum } from '../../../../../../core/models/enums/status-kaban/status-kaban-geralEnum';

import { ConsultarEtiquetaResponse } from '../../../../../../core/models/etiqueta/consultar-etiqueta-response';

import { AtendimentoAutoComplete } from '../../../../../../core/models/atendimento/atendimento-auto-complete';


type VinculoAutoComplete =
  AtendimentoAutoComplete;


@Component({

  selector: 'app-cadastrar-tarefa',

  standalone: false,

  templateUrl: './cadastrar-tarefa.component.html',

  styleUrl: './cadastrar-tarefa.component.css'

})

export class CadastrarTarefaComponent implements OnInit {

  private builder = inject(FormBuilder);

  private router = inject(Router);

  private tarefaService = inject(TarefaService);

  private etiquetaService = inject(EtiquetaService);

  private authHelper = inject(AuthHelper);

  private usuarioService = inject(UsuarioService);

  private atendimentoService = inject(AtendimentoService);


  usuarioLogado?: AutenticarUsuarioResponse | null;


  mensagemErro: string[] = [];

  mensagemSucesso: string[] = [];

  carregando = false;


  resultadosVinculo: VinculoAutoComplete[] = [];

  listaFiltradas: ListaTarefasResponse[] = [];


  prioridadeEnum = PrioridadeTarefaEnum;

  statusEnum = StatusGeralKanbanEnum;


  responsaveis: ConsultarUsuarioResponse[] = [];

  responsaveisFiltrados: ConsultarUsuarioResponse[] = [];

  responsaveisSelecionados: ConsultarUsuarioResponse[] = [];


  grupoTarefasEtiquetas: ConsultarEtiquetaResponse[] = [];

  etiquetasSelecionadas: ConsultarEtiquetaResponse[] = [];


  // =========================
  // LISTA DE TAREFAS
  // =========================

  listasTarefa: CriarListaTarefaRequest[] = [];


  // =========================
  // VÍNCULO
  // =========================

  vinculoSelecionado: AtendimentoAutoComplete | null = null;


  // =========================
  // FORM
  // =========================

  form = this.builder.group({

    descricao: [
      '',
      Validators.required
    ],

    dataTarefa: [
      '',
      Validators.required
    ],

    prioridade: [
      PrioridadeTarefaEnum.Media,
      Validators.required
    ],

    statusGeralKanban: [
      StatusGeralKanbanEnum.A_Fazer,
      Validators.required
    ],

    /*
     * Neste sistema existe somente
     * vínculo com Atendimento.
     */
    tipoVinculo:
      this.builder.control<
        'atendimento' | null
      >(null),

    atendimentoId:
      this.builder.control<string | null>(
        null
      ),

    responsavelId:
      this.builder.control<string | null>(
        null
      )

  });


  get podeEnviar(): boolean {

    return this.form.valid;

  }


  // =========================
  // INIT
  // =========================

  ngOnInit(): void {

    this.usuarioLogado =
      this.authHelper.get();


    this.carregarDados();


    /*
     * Sempre que trocar o tipo de vínculo,
     * limpa o atendimento selecionado.
     */
    this.form
      .get('tipoVinculo')
      ?.valueChanges
      .subscribe(() => {

        this.limparVinculos();

      });

  }


  // =========================
  // CARREGAR DADOS
  // =========================

  carregarDados(): void {

    this.etiquetaService
      .consultar()
      .subscribe({

        next: res => {

          this.grupoTarefasEtiquetas =
            res;

        },

        error: () => {

          this.mensagemErro = [
            'Erro ao carregar etiquetas'
          ];

        }

      });


    this.usuarioService
      .consultarUsuarioResponsavel()
      .subscribe({

        next: res => {

          this.responsaveis =
            res;

        },

        error: () => {

          this.mensagemErro = [
            'Erro ao carregar responsáveis'
          ];

        }

      });

  }


  // =========================
  // LISTA DE TAREFAS
  // =========================

  adicionarItemLista(): void {

    this.listasTarefa = [

      ...this.listasTarefa,

      {
        descricao: ''
      }

    ];

  }


  removerItemLista(
    index: number
  ): void {

    this.listasTarefa =
      this.listasTarefa.filter(
        (_, i) =>
          i !== index
      );

  }


  atualizarDescricaoLista(
    index: number,
    valor: string
  ): void {

    this.listasTarefa[index]
      .descricao = valor;

  }


  // =========================
  // RESPONSÁVEIS
  // =========================

  buscarResponsaveis(
    termo: string
  ): void {

    if (!termo) {

      this.responsaveisFiltrados =
        [];

      return;

    }


    const pesquisa =
      termo.toLowerCase();


    this.responsaveisFiltrados =
      this.responsaveis.filter(
        r =>
          r.nomeUsuario
            ?.toLowerCase()
            .includes(pesquisa)
      );

  }


  // =========================
  // VÍNCULO
  // =========================

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
            res;

        },

        error: () => {

          this.resultadosVinculo =
            [];

          this.mensagemErro = [
            'Erro ao consultar atendimento.'
          ];

        }

      });

  }


  selecionarVinculo(
    item: VinculoAutoComplete
  ): void {

    const tipo =
      this.form
        .get('tipoVinculo')
        ?.value;


    /*
     * Limpa atendimento anterior.
     */
    this.limparVinculos();


    /*
     * Mantém o novo item selecionado.
     */
    this.vinculoSelecionado =
      item;


    if (
      tipo === 'atendimento'
    ) {

      this.form.patchValue({

        atendimentoId:
          item.id ?? null

      });

    }


    this.resultadosVinculo =
      [];


    console.log(
      'FORM FINAL:',
      this.form.value
    );

  }


  // =========================
  // SUBMIT
  // =========================

  onSubmit(): void {

    this.mensagemErro =
      [];

    this.mensagemSucesso =
      [];


    if (
      this.form.invalid
    ) {

      this.form.markAllAsTouched();

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


    const limpar =
      (valor: any) =>
        valor ?? undefined;


    const request:
      CadastrarTarefaRequest = {

        descricao:
          limpar(
            f.descricao
          ) ?? '',


        dataTarefa:
          limpar(
            f.dataTarefa
          ),


        usuarioCriacaoId:
          this.usuarioLogado
            ?.idUsuario,


        responsavelId:
          limpar(
            f.responsavelId
          ),


        /*
         * ÚNICO VÍNCULO DESTE SISTEMA
         */
        atendimentoId:
          limpar(
            f.atendimentoId
          ),


        prioridade:
          f.prioridade!,


        statusGeralKanban:
          f.statusGeralKanban!,


        // =========================
        // ETIQUETAS
        // =========================

        grupoTarefasEtiquetas:
          this.etiquetasSelecionadas
            .map(
              etiqueta => ({

                etiquetaId:
                  etiqueta.id!

              })
            ),


        // =========================
        // RESPONSÁVEIS
        // =========================

        grupoTarefaResponsaveis:
          this.responsaveisSelecionados
            .map(
              responsavel => ({

                usuarioId:
                  responsavel.idUsuario

              })
            ),


        // =========================
        // CHECKLIST
        // =========================

        listasTarefa:
          this.listasTarefa

            .filter(
              item =>
                item.descricao
                  ?.trim()
            )

            .map(
              item => ({

                descricao:
                  item.descricao
                    .trim()

              })
            )

      };


    console.log(
      'REQUEST TAREFA:',
      request
    );


    this.tarefaService
      .cadastrarTarefa(
        request
      )
      .subscribe({

        next: res => {

          this.resetar();


          this.mensagemSucesso = [

            res.message

          ];


          this.carregando =
            false;

        },


        error: err => {

          this.tratarErro(
            err
          );

        }

      });

  }


  // =========================
  // BUSCAR LISTA
  // =========================

  buscarListaTarefas(
    termo: string
  ): void {

    if (!termo) {

      this.listaFiltradas =
        [];

      return;

    }


    this.tarefaService
      .consultarListaTarefaAutoComplete(
        termo
      )
      .subscribe({

        next: res => {

          this.listaFiltradas =
            res;

        },

        error: () => {

          this.listaFiltradas =
            [];

        }

      });

  }


  // =========================
  // RESET
  // =========================

  resetar(): void {

    this.form.reset({

      descricao:
        '',

      dataTarefa:
        '',

      prioridade:
        PrioridadeTarefaEnum.Media,

      statusGeralKanban:
        StatusGeralKanbanEnum.A_Fazer,

      tipoVinculo:
        null,

      atendimentoId:
        null,

      responsavelId:
        null

    });


    this.responsaveisSelecionados =
      [];


    this.responsaveisFiltrados =
      [];


    this.etiquetasSelecionadas =
      [];


    this.listasTarefa =
      [];


    this.resultadosVinculo =
      [];


    this.vinculoSelecionado =
      null;

  }


  // =========================
  // ERRO
  // =========================

  tratarErro(
    err: HttpErrorResponse
  ): void {

    console.error(
      'Erro completo:',
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


    if (
      e?.errors
    ) {

      for (
        const key in e.errors
      ) {

        const erros =
          e.errors[key];


        if (
          Array.isArray(erros)
        ) {

          this.mensagemErro.push(
            ...erros
          );

        }

        else if (
          erros
        ) {

          this.mensagemErro.push(
            erros
          );

        }

      }

    }

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

    else if (
      e?.message
    ) {

      this.mensagemErro.push(
        e.message
      );

    }

    else {

      this.mensagemErro.push(
        'Erro inesperado.'
      );

    }


    this.carregando =
      false;

  }


  // =========================
  // LIMPAR VÍNCULO
  // =========================

  private limparVinculos(): void {

    this.form.patchValue(
      {

        atendimentoId:
          null

      },
      {
        emitEvent: false
      }
    );


    this.vinculoSelecionado =
      null;


    this.resultadosVinculo =
      [];

  }

}