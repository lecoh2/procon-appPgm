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
  EventoService
} from '../../../../../core/services/evento.service';

import {
  UsuarioService
} from '../../../../../core/services/usuario.service';

import {
  EtiquetaService
} from '../../../../../core/services/etiqueta.service';

import {
  AuthHelper
} from '../../../../../core/helpers/auth.helper';

import {
  AtendimentoService
} from '../../../../../core/services/atendimento.service';

import {
  ConsultarEtiquetaResponse
} from '../../../../../core/models/etiqueta/consultar-etiqueta-response';

import {
  ConsultarUsuarioResponse
} from '../../../../../core/models/usuario/consultar-usuarios.response';

import {
  AutenticarUsuarioResponse
} from '../../../../../core/models/usuario/autenticar-usuario.response';

import {
  StatusGeralKanbanEnum
} from '../../../../../core/models/enums/status-kaban/status-kaban-geralEnum';

import {
  AtendimentoAutoComplete
} from '../../../../../core/models/atendimento/atendimento-auto-complete';

import {
  TipoEntidadeEnum
} from '../../../../../core/models/enums/tipo-entidade/tipo-entidadeEnum';

import {
  HistoricoService
} from '../../../../../core/services/historico.service';


@Component({
  selector: 'app-editar-evento',
  standalone: false,
  templateUrl: './editar-evento.component.html',
  styleUrls: ['./editar-evento.component.css']
})
export class EditarEventoComponent implements OnInit {

  @ViewChild('modalHistorico')
  modalHistorico!: ElementRef;


  // =========================
  // DEPENDÊNCIAS
  // =========================

  private fb =
    inject(FormBuilder);

  private router =
    inject(Router);

  private route =
    inject(ActivatedRoute);

  private cdr =
    inject(ChangeDetectorRef);

  private eventoService =
    inject(EventoService);

  private etiquetaService =
    inject(EtiquetaService);

  private usuarioService =
    inject(UsuarioService);

  private atendimentoService =
    inject(AtendimentoService);

  private authHelper =
    inject(AuthHelper);

  private historicoService =
    inject(HistoricoService);


  // =========================
  // VARIÁVEIS
  // =========================

  id!: string;

  carregando = false;

  carregandoHistorico = false;

  usuarioLogado?:
    AutenticarUsuarioResponse | null;

  mensagemErro: string[] = [];

  mensagemSucesso: string[] = [];


  // =========================
  // ATENDIMENTO
  // =========================

  resultadosVinculo:
    AtendimentoAutoComplete[] = [];

  vinculoSelecionado:
    AtendimentoAutoComplete | null = null;


  // =========================
  // RESPONSÁVEIS
  // =========================

  responsaveis:
    ConsultarUsuarioResponse[] = [];

  responsaveisFiltrados:
    ConsultarUsuarioResponse[] = [];

  responsaveisSelecionados:
    ConsultarUsuarioResponse[] = [];


  // =========================
  // ETIQUETAS
  // =========================

  grupoEventoEtiquetas:
    ConsultarEtiquetaResponse[] = [];

  etiquetasSelecionadas:
    ConsultarEtiquetaResponse[] = [];


  // =========================
  // STATUS
  // =========================

  statusEnum =
    StatusGeralKanbanEnum;


  // =========================
  // HISTÓRICO
  // =========================

  historico: any[] = [];


  // =========================
  // FORMULÁRIO
  // =========================

  form = this.fb.group({

    titulo: [
      '',
      Validators.required
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

    statusGeralKanban: [
      StatusGeralKanbanEnum.A_Fazer
    ],

    intervaloRecorrencia: [1],

    tipoRecorrencia: [0],

    modalidade: [0],

    dataFimRecorrencia: [''],

    quantidadeOcorrencias: [0],

    // ÚNICO VÍNCULO DO PROCON
    atendimentoId: [
      null as string | null
    ]

  });


  get podeEnviar(): boolean {

    return this.form.valid;

  }


  // =========================
  // INIT
  // =========================

  ngOnInit(): void {

    this.id =
      this.route.snapshot
        .paramMap
        .get('id')!;

    this.usuarioLogado =
      this.authHelper.get();

    this.carregarDados();

    this.carregarEvento();

  }


  // =========================
  // VOLTAR
  // =========================

  irParaLista(): void {

    this.router.navigate([
      '/admin/consultar-evento'
    ]);

  }


  // =========================
  // CARREGAR DADOS AUXILIARES
  // =========================

  carregarDados(): void {

    this.etiquetaService
      .consultar()
      .subscribe(res => {

        this.grupoEventoEtiquetas =
          res;

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
  // CARREGAR EVENTO
  // =========================

  carregarEvento(): void {

    this.carregando = true;

    this.eventoService
      .ObterEventoPorId(this.id)
      .subscribe({

        next: res => {

          console.log(
            'EVENTO COMPLETO:',
            res
          );


          // =========================
          // FORM PRINCIPAL
          // =========================

          this.form.patchValue({

            titulo:
              res.titulo,

            endereco:
              res.endereco,

            observacao:
              res.observacao,

            dataInicial:
              res.dataInicial
                ? res.dataInicial.split('T')[0]
                : null,

            dataFinal:
              res.dataFinal
                ? res.dataFinal.split('T')[0]
                : null,

            horaInicial:
              res.horaInicial,

            horaFinal:
              res.horaFinal,

            diaInteiro:
              res.diaInteiro,

            statusGeralKanban:
              res.statusGeralKanban,

            modalidade:
              res.modalidade,

            atendimentoId:
              res.atendimentoId ?? null

          }, {
            emitEvent: false
          });


          // =========================
          // ETIQUETAS
          // =========================

          this.etiquetasSelecionadas =
            res.grupoEventoEtiquetas
              ?.map((x: any) => ({

                id:
                  x.etiquetaId,

                nome:
                  x.nome,

                cor:
                  x.cor

              })) ?? [];


          // =========================
          // RESPONSÁVEIS
          // =========================

        this.responsaveisSelecionados =
  res.grupoEventoResponsaveis
    ?.map((x: any) => ({
      idUsuario: x.usuarioId,
      nomeUsuario: x.nomeUsuario ?? '',
      idPessoa: x.idPessoa ?? ''
    })) ?? [];


          // =========================
          // ATENDIMENTO VINCULADO
          // =========================

          if (res.atendimentoId) {

            this.vinculoSelecionado = {

              id:
                res.atendimentoId,

              assunto:
                res.atendimentoAssunto ?? ''

            } as AtendimentoAutoComplete;

          }
          else {

            this.vinculoSelecionado =
              null;

          }


          this.resultadosVinculo = [];

          this.carregando = false;

          this.cdr.detectChanges();

        },


        error: () => {

          this.mensagemErro = [
            'Erro ao carregar evento'
          ];

          this.carregando = false;

        }

      });

  }


  // =========================
  // BUSCAR ATENDIMENTO
  // =========================

  buscarVinculo(
    termo: string
  ): void {

    if (!termo) {

      this.resultadosVinculo = [];

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

          this.resultadosVinculo = [];

        }

      });

  }


  // =========================
  // SELECIONAR ATENDIMENTO
  // =========================

  selecionarVinculo(
    item: AtendimentoAutoComplete | null
  ): void {

    if (!item) {

      this.limparVinculo();

      return;

    }


    this.vinculoSelecionado =
      item;


    this.form.patchValue({

      atendimentoId:
        item.id ?? null

    });


    this.resultadosVinculo = [];

  }


  // =========================
  // LIMPAR ATENDIMENTO
  // =========================

  private limparVinculo(): void {

    this.form.patchValue({

      atendimentoId:
        null

    });


    this.vinculoSelecionado =
      null;


    this.resultadosVinculo =
      [];

  }


  // =========================
  // RESPONSÁVEIS
  // =========================

  buscarResponsaveis(
    termo: string
  ): void {

    const pesquisa =
      termo.toLowerCase();


    this.responsaveisFiltrados =
      this.responsaveis.filter(
        r =>
          r.nomeUsuario
            .toLowerCase()
            .includes(pesquisa)
      );

  }


  // =========================
  // SALVAR
  // =========================

  onSubmit(): void {

    this.mensagemErro = [];

    this.mensagemSucesso = [];


    if (this.form.invalid) {

      this.form.markAllAsTouched();

      return;

    }


    const f =
      this.form.value;


    this.carregando = true;


    const request: any = {

      titulo:
        f.titulo ?? '',

      endereco:
        f.endereco ?? '',

      observacao:
        f.observacao ?? '',

      dataInicial:
        f.dataInicial || null,

      dataFinal:
        f.dataFinal || null,

      horaInicial:
        f.horaInicial || null,

      horaFinal:
        f.horaFinal || null,

      diaInteiro:
        f.diaInteiro ?? false,

      statusGeralKanban:
        f.statusGeralKanban,

      modalidade:
        f.modalidade,

      intervaloRecorrencia:
        f.intervaloRecorrencia,

      tipoRecorrencia:
        f.tipoRecorrencia,

      dataFimRecorrencia:
        f.dataFimRecorrencia || null,

      quantidadeOcorrencias:
        f.quantidadeOcorrencias,


      // =========================
      // SOMENTE ATENDIMENTO
      // =========================

      atendimentoId:
        f.atendimentoId ?? null,


      // =========================
      // ETIQUETAS
      // =========================

      grupoEventoEtiquetas:
        this.etiquetasSelecionadas
          .map(e => ({

            etiquetaId:
              e.id!

          })),


      // =========================
      // RESPONSÁVEIS
      // =========================

      grupoEventoResponsavel:
        this.responsaveisSelecionados
          .filter(r =>
            r.idUsuario
          )
          .map(r => ({

            UsuarioId:
              r.idUsuario

          }))

    };


    console.log(
      'REQUEST EDITAR EVENTO:',
      request
    );


    this.eventoService
      .editarEvento(
        this.id,
        request
      )
      .pipe(

        finalize(() => {

          this.carregando =
            false;

          this.cdr.detectChanges();

        })

      )
      .subscribe({

        next: res => {

          this.mensagemSucesso = [

            res.message ??
            'Evento atualizado com sucesso.'

          ];


          setTimeout(() => {

            this.router.navigate([
              '/admin/consultar-evento'
            ]);

          }, 3000);

        },


        error: (
          err: HttpErrorResponse
        ) => {

          this.tratarErro(err);

        }

      });

  }


  // =========================
  // TRATAR ERRO
  // =========================

  private tratarErro(
    err: HttpErrorResponse
  ): void {

    this.mensagemErro = [];

    const e =
      err.error;


    if (e?.errors) {

      for (
        const key in e.errors
      ) {

        this.mensagemErro.push(
          ...e.errors[key]
        );

      }

    }
    else if (e?.mensagem) {

      this.mensagemErro.push(
        e.mensagem
      );

    }
    else if (e?.message) {

      this.mensagemErro.push(
        e.message
      );

    }
    else {

      this.mensagemErro.push(
        'Erro inesperado.'
      );

    }

  }


  // =========================
  // HISTÓRICO
  // =========================

  abrirHistoricoProcesso(
    eventoId: string
  ): void {

    this.carregandoHistorico =
      true;

    this.historico = [];


    const modal =
      new bootstrap.Modal(
        this.modalHistorico
          .nativeElement
      );


    modal.show();


    this.historicoService
      .ConsultarHistorico(
        TipoEntidadeEnum.Evento,
        eventoId
      )
      .subscribe({

        next: res => {

          this.historico =
            (res ?? [])
              .map(h => ({

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

              }));


          this.carregandoHistorico =
            false;

          this.cdr.detectChanges();

        },


        error: err => {

          console.error(err);

          this.carregandoHistorico =
            false;

        }

      });

  }


  // =========================
  // FORMATAR CAMPO
  // =========================

  formatarCampo(
    campo: string
  ): string {

    const map: any = {

      Titulo:
        'Título',

      DataInicial:
        'Data Inicial',

      DataFinal:
        'Data Final',

      HoraInicial:
        'Hora Inicial',

      HoraFinal:
        'Hora Final',

      DiaInteiro:
        'Dia Inteiro',

      Endereco:
        'Endereço',

      Observacao:
        'Observação',

      Modalidade:
        'Modalidade',

      StatusGeralKanban:
        'Status',

      Responsaveis:
        'Responsáveis',

      AtendimentoId:
        'Atendimento'

    };


    return map[campo] || campo;

  }


  // =========================
  // FORMATAR VALOR
  // =========================

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
      Array.isArray(valor)
    ) {

      return valor.join(', ');

    }


    if (
      typeof valor === 'boolean'
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
        .getStatusLabel(valor);

    }


    if (
      campo ===
      'Modalidade'
    ) {

      return this
        .getModalidadeLabel(valor);

    }


    if (
      campo
        .toLowerCase()
        .includes('data')
    ) {

      return new Date(
        valor
      ).toLocaleDateString(
        'pt-BR'
      );

    }


    if (
      campo
        .toLowerCase()
        .includes('hora')
    ) {

      return valor;

    }


    return valor.toString();

  }


  // =========================
  // STATUS
  // =========================

  getStatusLabel(
    status: number
  ): string {

    switch (status) {

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


  // =========================
  // MODALIDADE
  // =========================

  getModalidadeLabel(
    status: number
  ): string {

    switch (status) {

      case 1:
        return 'Presencial';

      case 2:
        return 'Online';

      case 3:
        return 'Híbrido';

      case 4:
        return 'Não se aplica';

      default:
        return '---';

    }

  }


  // =========================
  // MUDANÇAS DO HISTÓRICO
  // =========================

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


    const mudancas: any[] = [];


    Object
      .keys(h.depois)
      .forEach(key => {

        const antes =
          h.antes[key];

        const depois =
          h.depois[key];


        if (
          JSON.stringify(antes) !==
          JSON.stringify(depois)
        ) {

          mudancas.push({

            campo:
              key,

            antes:
              antes,

            depois:
              depois

          });

        }

      });


    return mudancas;

  }

}