import { Component, inject, ViewChild, OnInit, ElementRef, AfterViewInit, AfterViewChecked } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
//import Quill from 'quill';

import { AudienciaService } from '../../../../../core/services/audiencia.service';
import { AcordoService } from '../../../../../core/services/acordo.service';
import { AuthHelper } from '../../../../../core/helpers/auth.helper';
import { AutenticarUsuarioResponse } from '../../../../../core/models/usuario/autenticar-usuario.response';
import { AcordoResponse } from '../../../../../core/models/acordo/acordo-response';
import { environment } from '../../../../../../environments/environment.development';
import { AtendimentoService } from '../../../../../core/services/atendimento.service';

@Component({
  selector: 'app-cadastrar-audiencia',
  standalone: false,
  templateUrl: './cadastrar-audiencia.component.html',
  styleUrls: ['./cadastrar-audiencia.component.css']
})
export class CadastrarAudienciaComponent implements OnInit /*AfterViewInit, AfterViewChecked */{
  private audienciaService = inject(AudienciaService);
  private atendimentoService = inject(AtendimentoService);
  private acordoService = inject(AcordoService);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private authHelper = inject(AuthHelper);
  private route = inject(ActivatedRoute);

  /*@ViewChild('editorContainer', { static: false }) editorContainer!: ElementRef;
  private quillEditor!: Quill;
  private quillInitialized = false;*/

  usuarioLogado?: AutenticarUsuarioResponse | null;
  tiposAcordos: AcordoResponse[] = [];
  representantes: string[] = [];
  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];
  carregando = false;
  pdfGerado = false;
  urlBase = environment.apiProcon;
  codigoAudiencia?: number;
  anoBaseAudiencia?: string;
  grupoReclamantes: string[] = [];
  grupoRepresentanteAtendimentoFisico: string[] = [];
  grupoReclamadas: string[] = [];
  grupoRepresentanteAtendimentoJuridica: string[] = [];
  grupoArtigos: string[] = [];
  codigoAtendimento: string = '';
  anoBaseAtendimento: string = '';
  codigoReclamacao: string = '';
  idAtendimento: string = '';
  anoBaseReclamacao: string = '';
  dataReclamacao: string = '';
  dataAtendimento: string = '';
  usuarioCadastro: string = '';
  usuarioAtendimento: string = '';
  dataCadastro: string = '';
  titulo: string = '';

  mostrarCamposExtras = false;
  mostrarCamposNovaAudiencia = false;

  readonly GUID_ACORDO_REALIZADO = 'f8bd5321-5cd2-4e61-9c26-7060d650c0b0';
  readonly GUID_IDSETOR = '298b07b4-057f-41be-8363-59ca913dd45d';

  form = this.formBuilder.group({
    idUsuario: ['', Validators.required],
    idAcordo: ['', Validators.required],
    idAtendimento: [''],
    idSetores: [this.GUID_IDSETOR, Validators.required],
    idReclamacao: ['', Validators.required],
    prazo: [''],       // opcional
    dias: [''],        // número de dias (int)
    fato: ['', Validators.required],
    dataFinal: [''],
    hora: ['']
  });

  searchInput: string = '';

  get podeEnviar(): boolean {
    return this.form.valid;
  }

  ngOnInit(): void {
    this.carregando = true;

    this.usuarioLogado = this.authHelper.get();
    if (this.usuarioLogado) {
      this.form.get('idUsuario')?.setValue(this.usuarioLogado.idUsuario ?? null);
    }

    this.carregarTiposAcordo();

    // Ajustar campos exibidos ao mudar o tipo de acordo
    this.form.get('idAcordo')?.valueChanges.subscribe((valorSelecionado: string | null) => {
      if (valorSelecionado) {
        this.atualizarCamposVisiveis(valorSelecionado);
      }
    });

    // Verifica query params para carregar audiência automaticamente
    this.route.queryParams.subscribe(params => {
      const codigo = params['codigo'];
      const anoBase = params['anoBase'];

      if (codigo && anoBase) {
        this.pesquisarPorQueryParams(codigo, anoBase);
      }
    });
  }

 /* ngAfterViewInit(): void {
    this.inicializarQuill();
  }

  ngAfterViewChecked(): void {
    if (this.editorContainer && !this.quillInitialized) {
      this.inicializarQuill();
      this.quillInitialized = true;
    }
  }*/

  carregarTiposAcordo(): void {
    this.acordoService.consultar().subscribe({
      next: (tipos) => {
        this.tiposAcordos = tipos;
        this.carregando = false;
      },
      error: () => {
        this.mensagemErro = ['Erro ao carregar os tipos de acordo.'];
        this.carregando = false;
      }
    });
  }
  onSearchInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let valor = input.value.replace(/\D/g, '');
    if (valor.length > 11) {
      valor = valor.slice(0, 11);
    }

    if (valor.length > 4) {
      const codigo = valor.slice(0, -4);
      const ano = valor.slice(-4);
      input.value = `${codigo}/${ano}`;
      this.searchInput = input.value;
    } else {
      input.value = valor;
      this.searchInput = valor;
    }
  } onPasteOnlyNumbers(event: ClipboardEvent) {
    const pasted = event.clipboardData?.getData('text') || '';
    if (/\D/.test(pasted)) {
      event.preventDefault(); // impede colar se tiver letras
    }
  }
  atualizarCamposVisiveis(valorSelecionado: string): void {
    const acordoRealizadoSelecionado = valorSelecionado === this.GUID_ACORDO_REALIZADO;
    const acordoSelecionadoObj = this.tiposAcordos.find(a => a.idAcordo === valorSelecionado);
    const novaAudienciaSelecionada = acordoSelecionadoObj?.nomeAcordo?.toLowerCase() === 'nova audiência';

    this.mostrarCamposExtras = acordoRealizadoSelecionado;
    this.mostrarCamposNovaAudiencia = novaAudienciaSelecionada;

    // Validadores dinâmicos
    if (this.mostrarCamposExtras) {
      this.form.get('prazo')?.clearValidators();
      this.form.get('dias')?.clearValidators();
    } else {
      this.form.get('prazo')?.clearValidators();
      this.form.get('dias')?.clearValidators();
      this.form.get('prazo')?.setValue(null);
      this.form.get('dias')?.setValue(null);
    }

    if (this.mostrarCamposNovaAudiencia) {
      this.form.get('dataFinal')?.clearValidators();
      this.form.get('hora')?.clearValidators();
    } else {
      this.form.get('dataFinal')?.clearValidators();
      this.form.get('hora')?.clearValidators();
      this.form.get('dataFinal')?.setValue(null);
      this.form.get('hora')?.setValue(null);
    }

    this.form.get('prazo')?.updateValueAndValidity();
    this.form.get('dias')?.updateValueAndValidity();
    this.form.get('dataFinal')?.updateValueAndValidity();
    this.form.get('hora')?.updateValueAndValidity();
  }

  /*inicializarQuill(): void {
    this.quillEditor = new Quill(this.editorContainer.nativeElement, {
      theme: 'snow',
      placeholder: 'Digite aqui a descrição...',
      modules: {
        toolbar: [['bold', 'italic', 'underline']]
      }
    });

    this.quillEditor.on('text-change', () => {
      const html = this.quillEditor.root.innerHTML;
      this.form.get('fato')?.setValue(html);
    });
  }*/

  pesquisar(): void {
    const valor = this.searchInput.trim();

    if (!valor) {
      this.mensagemErro = ['Informe o número e ano da audiência no formato "número/ano"'];
      return;
    }

    const partes = valor.split('/');
    if (partes.length !== 2) {
      this.mensagemErro = ['Formato inválido. Use "número/ano", por exemplo: 26/2025'];
      return;
    }

    const codigo = Number(partes[0]);
    const anoBase = partes[1];

    if (isNaN(codigo) || !anoBase) {
      this.mensagemErro = ['Número ou ano inválido'];
      return;
    }

    this.mensagemErro = [];

    this.consultarAudiencia(codigo, anoBase);
  }

  pesquisarPorQueryParams(codigo: string, anoBase: string) {
    const codigoNum = Number(codigo);

    if (!isNaN(codigoNum) && anoBase) {
      this.consultarAudiencia(codigoNum, anoBase);
      this.searchInput = `${codigo}/${anoBase}`; // opcional, atualiza input
    } else {
      this.mensagemErro = ['Parâmetros inválidos na URL.'];
    }
  }

  consultarAudiencia(codigo: number, anoBase: string): void {
    this.audienciaService.consultarCadastrarAudiencia(codigo, anoBase).subscribe({
      next: (reclamacao) => {
        console.log('Dados', reclamacao);
        this.usuarioCadastro = reclamacao.usuario || '';
        this.titulo = reclamacao.titulo || '';
        this.form.get('idReclamacao')?.setValue(reclamacao.idReclamacao ?? null);
        this.grupoReclamantes = reclamacao.grupoReclamantesAtendimento || [];
        this.grupoReclamadas = reclamacao.grupoReclamadasAtendimento || [];
        this.grupoRepresentanteAtendimentoFisico = reclamacao.grupoRepresentanteAtendimentoFisico || [];
        this.grupoRepresentanteAtendimentoJuridica = reclamacao.grupoRepresentanteAtendimentoJuridica || [];
        this.grupoArtigos = reclamacao.grupoArtigos || [];
        this.codigoReclamacao = reclamacao.codigo || '';
        this.anoBaseReclamacao = reclamacao.anoBase || '';
        this.dataReclamacao = reclamacao.dataReclamacao || '',
          this.dataAtendimento = reclamacao.dataAtendimento || '',
          this.codigoAtendimento = reclamacao.codigoAtendimento || '',
          this.anoBaseAtendimento = reclamacao.anoBaseAtendimento || '',
          // this.usuarioCadastro = reclamacao.usuario || '';
          this.usuarioAtendimento = reclamacao.usuarioAtendimento
          || '';
        this.dataCadastro = reclamacao.dataReclamacao || '';
        this.representantes = reclamacao.representantes || [];
        this.idAtendimento = reclamacao.idAtendimento ?? '';
      },
      error: (error) => {
        this.mensagemErro = [];

        if (error.error?.mensagem) {
          this.mensagemErro.push(error.error.mensagem);
        } else if (error.error?.message) {
          this.mensagemErro.push(error.error.message);
        } else {
          this.mensagemErro.push('Erro inesperado ao criar audiência.');
        }
        this.carregando = false;
      }
    });
  }

  onSubmit() {
    this.carregando = true;
    this.mensagemErro = [];
    this.mensagemSucesso = [];

   // const conteudoFato = this.quillEditor.root.innerHTML;
    //const textoSemHtml = conteudoFato.replace(/<[^>]*>/g, '').trim();

    /*if (!textoSemHtml) {
      this.mensagemErro = ['A descrição do fato não pode estar vazia.'];
      this.carregando = false;
      return;
    }*/

    if (!this.podeEnviar) {
      this.mensagemErro = ['Preencha todos os campos obrigatórios corretamente.'];
      this.carregando = false;
      return;
    }

    //const descricaoFormatada = this.converterHtmlParaTagsBasicas(this.form.value.fato!);
    const descricaoFormatada = (this.form.value.fato ?? '').replace(/\r\n|\r|\n/g, '<br>');
    const request = {
      idUsuario: this.form.value.idUsuario || undefined,
      idAcordo: this.form.value.idAcordo || undefined,
      idSetores: this.GUID_IDSETOR || undefined,
      idReclamacao: this.form.value.idReclamacao || undefined,

      prazo: this.form.value.prazo ? Number(this.form.value.prazo) : undefined,
      dataFinal: this.form.value.dataFinal ? new Date(this.form.value.dataFinal).toISOString() : undefined,

      hora: this.form.value.hora || undefined,
      dias: this.form.value.dias ? Number(this.form.value.dias) : undefined,

      fato: descricaoFormatada
    };

    this.audienciaService.cadastrar(request).subscribe({
      next: (response) => {
        this.codigoAudiencia = Number(response?.dados.codigo);
        this.anoBaseAudiencia = response?.dados.anoBase;
        this.pdfGerado = !!this.codigoAudiencia && !!this.anoBaseAudiencia;
        this.form.patchValue({
          idUsuario: this.usuarioLogado?.idUsuario ?? '',
          idAcordo: '',
          idReclamacao: '',
          prazo: '',
          dias: '',
          fato: '',
          dataFinal: '',
          hora: ''
        });

        this.form.markAsPristine();
        this.form.markAsUntouched();
        this.form.updateValueAndValidity();
        //this.quillEditor.setContents([]);

        setTimeout(() => {
          this.carregando = false;
          this.mensagemSucesso = [response?.mensagem || 'Audiência cadastrada com sucesso!'];
          this.router.navigate(['/admin/cadastrar-audiencia']);
        }, 2000);
      },
      error: (error) => {
        if (error.error && error.error.mensagem) {
          this.mensagemErro = [error.error.mensagem];
        } else {
          this.mensagemErro = ['Erro inesperado.'];
        }
        this.carregando = false;
      }
    });
  }

  private converterHtmlParaTagsBasicas(html: string): string {
    if (!html) return '';

    return html
      .replace(/<strong>/g, '<b>')
      .replace(/<\/strong>/g, '</b>')
      .replace(/<em>/g, '<i>')
      .replace(/<\/em>/g, '</i>')
      .replace(/<span[^>]*>/g, '')
      .replace(/<\/span>/g, '')
      .replace(/<h[1-6][^>]*>/gi, '<b>')
      .replace(/<\/h[1-6]>/gi, '</b><br><br>')
      .replace(/<div[^>]*>/gi, '')
      .replace(/<\/div>/gi, '<br>')
      .replace(/<p>/gi, '')
      .replace(/<\/p>/gi, '<br><br>')
      .replace(/<br\s*\/?>/gi, '<br>')
      .replace(/&nbsp;/gi, ' ')
      .replace(/\n/g, '')
      .replace(/\r/g, '')
      .replace(/(<br>\s*){3,}/g, '<br><br>')
      .trim();
  }

  consultarAtendimento(codigo: number, anoBase: string): void {
    this.atendimentoService.consultarCadastrarReclamacaoAtendimento(codigo, anoBase).subscribe({
      next: (atendimento) => {
        console.log('Resposta completa da API de histórico:', atendimento);

        this.usuarioCadastro = atendimento.usuario || '';
        this.form.get('idAtendimento')?.setValue(atendimento.idAtendimento ?? null);

        this.grupoReclamantes = atendimento.grupoReclamantesAtendimento || [];
        this.grupoRepresentanteAtendimentoFisico = atendimento.grupoRepresentanteAtendimentoFisico || [];
        this.grupoReclamadas = atendimento.grupoReclamadasAtendimento || [];
        this.grupoRepresentanteAtendimentoJuridica = atendimento.grupoRepresentanteAtendimentoJuridica || [];

        // ⚡️ Preenche também as variáveis que controlam o *ngIf
        //this.codigoAtendimento = atendimento.codigo;
        //this.anoBaseReclamacao = atendimento.anoBase;

        this.codigoAtendimento = atendimento.codigo || '';
        this.anoBaseAtendimento = atendimento.anoBase || '';
        this.dataCadastro = atendimento.dataCadastro || '';
        this.grupoArtigos = atendimento.grupoArtigosSimples || [];
      },
      error: (error) => {
        this.mensagemErro = [];

        if (error.error?.mensagem) {
          this.mensagemErro.push(error.error.mensagem);
        } else if (error.error?.message) {
          this.mensagemErro.push(error.error.message);
        } else {
          this.mensagemErro.push('Erro inesperado ao criar audiência.');
        }
        this.carregando = false;
      }
    });
  }
}
