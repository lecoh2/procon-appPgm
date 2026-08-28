import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  inject,
  NgZone,
  OnInit
} from '@angular/core';

import {
  FormBuilder,
  Validators
} from '@angular/forms';

import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { CriarEventoRequest } from '../../../../../core/models/evento/criar-evento-request';
import { ConsultarEtiquetaResponse } from '../../../../../core/models/etiqueta/consultar-etiqueta-response';
import { ConsultarUsuarioResponse } from '../../../../../core/models/usuario/consultar-usuarios.response';
import { AutenticarUsuarioResponse } from '../../../../../core/models/usuario/autenticar-usuario.response';
import { AtendimentoAutoComplete } from '../../../../../core/models/atendimento/atendimento-auto-complete';

import { StatusGeralKanbanEnum } from '../../../../../core/models/enums/status-kaban/status-kaban-geralEnum';

import { EventoService } from '../../../../../core/services/evento.service';
import { UsuarioService } from '../../../../../core/services/usuario.service';
import { EtiquetaService } from '../../../../../core/services/etiqueta.service';
import { AtendimentoService } from '../../../../../core/services/atendimento.service';

import { AuthHelper } from '../../../../../core/helpers/auth.helper';

type TipoVinculo =
  | 'processo'
  | 'caso'
  | 'atendimento'
  | null;

type VinculoAutoComplete = AtendimentoAutoComplete;

@Component({
  selector: 'app-cadastrar-evento',
  standalone: false,
  templateUrl: './cadastrar-evento.component.html',
  styleUrl: './cadastrar-evento.component.css'
})
export class CadastrarEventoComponent implements OnInit {

  // =========================================================
  // DEPENDÊNCIAS
  // =========================================================

  private readonly builder = inject(FormBuilder);
  private readonly router = inject(Router);

  private readonly eventoService = inject(EventoService);
  private readonly etiquetaService = inject(EtiquetaService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly atendimentoService = inject(AtendimentoService);

  private readonly authHelper = inject(AuthHelper);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly zone = inject(NgZone);

  // =========================================================
  // USUÁRIO
  // =========================================================

  usuarioLogado?: AutenticarUsuarioResponse | null;

  // =========================================================
  // MENSAGENS / CARREGAMENTO
  // =========================================================

  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];

  carregando = false;

  // =========================================================
  // STATUS
  // =========================================================

  statusEnum = StatusGeralKanbanEnum;

  // =========================================================
  // VÍNCULO
  // =========================================================

  resultadosVinculo: VinculoAutoComplete[] = [];

  vinculoSelecionado: VinculoAutoComplete | null = null;

  // =========================================================
  // RESPONSÁVEIS
  // =========================================================

  responsaveis: ConsultarUsuarioResponse[] = [];

  responsaveisFiltrados: ConsultarUsuarioResponse[] = [];

  responsaveisSelecionados: ConsultarUsuarioResponse[] = [];

  // =========================================================
  // ETIQUETAS
  // =========================================================

  etiquetas: ConsultarEtiquetaResponse[] = [];

  etiquetasSelecionadas: ConsultarEtiquetaResponse[] = [];

  grupoEventoEtiquetas: ConsultarEtiquetaResponse[] = [];

  // =========================================================
  // FORMULÁRIO
  // =========================================================

  form = this.builder.group({

    titulo: [
      '',
      [
        Validators.required,
        Validators.minLength(5)
      ]
    ],

    endereco: [''],

    observacao: [''],

    dataInicial: [
      '',
      Validators.required
    ],

    dataFinal: [''],

    horaInicial: [''],

    horaFinal: [''],

    diaInteiro: [false],

    statusKaban: [null],

    intervaloRecorrencia: [1],

    tipoRecorrencia: [0],

    modalidade: [0],

    dataFimRecorrencia: [''],

    quantidadeOcorrencias: [0],

    tipoVinculo:
      this.builder.control<TipoVinculo>(null),

    processoId:
      this.builder.control<string | null>(null),

    casoId:
      this.builder.control<string | null>(null),

    atendimentoId:
      this.builder.control<string | null>(null)

  });

  // =========================================================
  // GETTERS
  // =========================================================

  get podeEnviar(): boolean {
    return this.form.valid && !this.carregando;
  }

  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    this.usuarioLogado = this.authHelper.get();

    this.carregarDados();

    /*
     * Sempre que trocar o tipo de vínculo,
     * limpa qualquer vínculo selecionado anteriormente.
     */
    this.form
      .get('tipoVinculo')
      ?.valueChanges
      .subscribe(() => {

        this.limparVinculos();

      });
  }

  // =========================================================
  // CARREGAMENTO
  // =========================================================

  private carregarDados(): void {

    this.carregarEtiquetas();

    this.carregarResponsaveis();

  }

  private carregarEtiquetas(): void {

    this.etiquetaService
      .consultar()
      .subscribe({

        next: (res) => {

          this.etiquetas = res;

          this.grupoEventoEtiquetas = res;

        },

        error: (err) => {

          console.error(
            'Erro ao carregar etiquetas:',
            err
          );

          this.mensagemErro = [
            'Erro ao carregar etiquetas.'
          ];

        }

      });
  }

  private carregarResponsaveis(): void {

    this.usuarioService
      .consultarUsuarioResponsavel()
      .subscribe({

        next: (res) => {

          this.responsaveis = res;

        },

        error: (err) => {

          console.error(
            'Erro ao carregar responsáveis:',
            err
          );

          this.mensagemErro = [
            'Erro ao carregar responsáveis.'
          ];

        }

      });
  }

  // =========================================================
  // BUSCAR VÍNCULO
  // =========================================================

  buscarVinculo(termo: string): void {

    const tipo =
      this.form
        .get('tipoVinculo')
        ?.value;

    const termoPesquisa =
      termo?.trim();

    if (
      !tipo ||
      !termoPesquisa
    ) {

      this.resultadosVinculo = [];

      return;
    }

    /*
     * Neste componente existe somente o serviço/model
     * de autocomplete de Atendimento.
     *
     * Processo e Caso poderão ser adicionados posteriormente
     * quando existirem os respectivos services/models.
     */
    if (tipo !== 'atendimento') {

      this.resultadosVinculo = [];

      return;
    }

    const request$: Observable<AtendimentoAutoComplete[]> =
      this.atendimentoService
        .consultarAtendimentoAutoComplete(
          termoPesquisa
        );

    request$.subscribe({

      next: (res) => {

        this.resultadosVinculo = res;

      },

      error: (err) => {

        console.error(
          'Erro ao consultar vínculo:',
          err
        );

        this.resultadosVinculo = [];

        this.mensagemErro = [
          'Erro ao consultar o vínculo.'
        ];

      }

    });
  }

  // =========================================================
  // SELECIONAR VÍNCULO
  // =========================================================

  selecionarVinculo(
    item: VinculoAutoComplete
  ): void {

    const tipo =
      this.form
        .get('tipoVinculo')
        ?.value;

    if (!tipo) {
      return;
    }

    const id =
      item.id ?? null;

    /*
     * Limpa somente os IDs.
     *
     * Não usamos limparVinculos() aqui porque ele também
     * apagaria o item que acabou de ser selecionado.
     */
    this.form.patchValue({

      processoId: null,

      casoId: null,

      atendimentoId: null

    });

    switch (tipo) {

      case 'processo':

        this.form.patchValue({
          processoId: id
        });

        break;

      case 'caso':

        this.form.patchValue({
          casoId: id
        });

        break;

      case 'atendimento':

        this.form.patchValue({
          atendimentoId: id
        });

        break;

    }

    this.vinculoSelecionado = item;

    this.resultadosVinculo = [];
  }

  // =========================================================
  // RESPONSÁVEIS
  // =========================================================

  buscarResponsaveis(
    termo: string
  ): void {

    const pesquisa =
      termo?.trim().toLowerCase();

    if (!pesquisa) {

      this.responsaveisFiltrados = [];

      return;
    }

    this.responsaveisFiltrados =
      this.responsaveis.filter(
        responsavel =>

          responsavel
            .nomeUsuario
            ?.toLowerCase()
            .includes(pesquisa)

      );
  }

  // =========================================================
  // SUBMIT
  // =========================================================

  onSubmit(): void {

    this.limparMensagens();

    if (this.form.invalid) {

      this.form.markAllAsTouched();

      return;
    }

    // =====================================================
    // VALIDAÇÃO DOS VÍNCULOS
    // =====================================================

    const f =
      this.form.getRawValue();

    const quantidadeVinculos = [

      f.processoId,

      f.casoId,

      f.atendimentoId

    ].filter(Boolean).length;

    if (quantidadeVinculos > 1) {

      this.mensagemErro = [
        'O evento não pode possuir mais de um vínculo.'
      ];

      return;
    }

    this.carregando = true;

    // =====================================================
    // REQUEST
    // =====================================================

    const request: CriarEventoRequest = {

      titulo:
        f.titulo ?? '',

      endereco:
        this.stringOuUndefined(
          f.endereco
        ),

      observacao:
        this.stringOuUndefined(
          f.observacao
        ),

      dataInicial:
        f.dataInicial!,

      dataFinal:
        this.stringOuUndefined(
          f.dataFinal
        ),

      horaInicial:
        this.stringOuUndefined(
          f.horaInicial
        ),

      horaFinal:
        this.stringOuUndefined(
          f.horaFinal
        ),

      diaInteiro:
        f.diaInteiro ?? false,

      statusGeralKanban:
        f.statusKaban ?? 1,

      tipoRecorrencia:
        f.tipoRecorrencia ?? 0,

      intervaloRecorrencia:
        f.intervaloRecorrencia ?? 1,

      modalidade:
        f.modalidade ?? 0,

      dataFimRecorrencia:
        this.stringOuUndefined(
          f.dataFimRecorrencia
        ),

      quantidadeOcorrencias:
        f.quantidadeOcorrencias &&
        f.quantidadeOcorrencias > 0

          ? f.quantidadeOcorrencias

          : undefined,

      diasSemana: [],

      grupoEventoEtiquetas:
        this.etiquetasSelecionadas.map(
          etiqueta => ({
            etiquetaId: etiqueta.id!
          })
        ),

      grupoEventoResponsaveis:
        this.responsaveisSelecionados.map(
          responsavel => ({
            usuarioId: responsavel.idUsuario
          })
        ),

      processoId:
        f.processoId ?? null,

      casoId:
        f.casoId ?? null,

      atendimentoId:
        f.atendimentoId ?? null

    };

    console.log(
      'REQUEST EVENTO:',
      request
    );

    // =====================================================
    // ENVIO
    // =====================================================

    this.eventoService
      .cadastrarEvento(request)
      .subscribe({

        next: (res) => {

          this.zone.run(() => {

            const titulo =
              res?.data?.titulo ??
              request.titulo;

            this.resetar();

            this.mensagemSucesso = [
              `Evento "${titulo}" criado com sucesso!`
            ];

            this.carregando = false;

            this.cdr.detectChanges();

          });

        },

        error: (err: HttpErrorResponse) => {

          this.zone.run(() => {

            this.tratarErro(err);

            this.cdr.detectChanges();

          });

        }

      });
  }

  // =========================================================
  // RESET
  // =========================================================

  private resetar(): void {

    this.form.reset({

      titulo: '',

      endereco: '',

      observacao: '',

      dataInicial: '',

      dataFinal: '',

      horaInicial: '',

      horaFinal: '',

      diaInteiro: false,

      statusKaban: null,

      intervaloRecorrencia: 1,

      tipoRecorrencia: 0,

      modalidade: 0,

      dataFimRecorrencia: '',

      quantidadeOcorrencias: 0,

      tipoVinculo: null,

      processoId: null,

      casoId: null,

      atendimentoId: null

    });

    this.responsaveisSelecionados = [];

    this.responsaveisFiltrados = [];

    this.etiquetasSelecionadas = [];

    this.resultadosVinculo = [];

    this.vinculoSelecionado = null;

  }

  // =========================================================
  // LIMPAR VÍNCULOS
  // =========================================================

  private limparVinculos(): void {

    this.form.patchValue(
      {

        processoId: null,

        casoId: null,

        atendimentoId: null

      },
      {
        emitEvent: false
      }
    );

    this.vinculoSelecionado = null;

    this.resultadosVinculo = [];
  }

  // =========================================================
  // TRATAMENTO DE ERRO
  // =========================================================

  private tratarErro(
    err: HttpErrorResponse
  ): void {

    this.mensagemErro = [];

    const erro =
      err.error;

    if (erro?.errors) {

      for (const key in erro.errors) {

        const mensagens =
          erro.errors[key];

        if (Array.isArray(mensagens)) {

          this.mensagemErro.push(
            ...mensagens
          );

        } else if (mensagens) {

          this.mensagemErro.push(
            String(mensagens)
          );

        }

      }

    } else if (erro?.message) {

      this.mensagemErro.push(
        erro.message
      );

    } else if (erro?.mensagem) {

      this.mensagemErro.push(
        erro.mensagem
      );

    } else if (
      typeof erro === 'string' &&
      erro.trim()
    ) {

      this.mensagemErro.push(
        erro
      );

    } else {

      this.mensagemErro.push(
        'Erro inesperado ao cadastrar o evento.'
      );

    }

    this.carregando = false;
  }

  // =========================================================
  // AUXILIARES
  // =========================================================

  private limparMensagens(): void {

    this.mensagemErro = [];

    this.mensagemSucesso = [];

  }

  private stringOuUndefined(
    valor?: string | null
  ): string | undefined {

    const resultado =
      valor?.trim();

    return resultado
      ? resultado
      : undefined;
  }

}