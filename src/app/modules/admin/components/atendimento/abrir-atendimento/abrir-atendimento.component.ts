import { Component, inject, ViewChild, OnInit, ElementRef, AfterViewInit } from '@angular/core';
import { PessoaService } from '../../../../../core/services/pessoa.service';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ConsultarPessoaResponse } from '../../../../../core/models/pessoa/consultar-pessoa-response';
import { AutenticarUsuarioResponse } from '../../../../../core/models/usuario/autenticar-usuario.response';
import { catchError, debounceTime, filter, of, switchMap } from 'rxjs';
import { AuthHelper } from '../../../../../core/helpers/auth.helper';

import { HorariosDisponiveisResponse } from '../../../../../core/models/reclamacao/horarios-disponiveis-response';
//import Quill from 'quill';
import { environment } from '../../../../../../environments/environment.development';
import { AtendimentoService } from '../../../../../core/services/atendimento.service';
import { CadastrarAtendimentoRequest } from '../../../../../core/models/atendimento/cadastrar-atendimento-request';
import { ArtigoService } from '../../../../../core/services/artigo.service';
import { ConsultarArtigoResponse } from '../../../../../core/models/artigo/consultar-artigo-response';

@Component({
  selector: 'app-abrir-reclamacao',
  standalone: false,
  templateUrl: './abrir-atendimento.component.html',
  styleUrl: './abrir-atendimento.component.css'
})
export class AbrirAtendimentoComponent implements OnInit /*AfterViewInit*/ {
  // --- Injeção de dependências via inject()
  private atendimentoService = inject(AtendimentoService);
  private pessoaService = inject(PessoaService);
  private artigoService = inject(ArtigoService);
  private builder = inject(FormBuilder);
  private router = inject(Router);
  private authHelper = inject(AuthHelper);

  /*@ViewChild('editorContainer', { static: false }) editorContainer!: ElementRef;
  private quillEditor!: Quill;*/

  // --- Controles reativos / autocomplete
  artigoNomeControl = new FormControl('');
  protocoloControl = new FormControl('');
  pessoaFisicaNomeControl = new FormControl('');
  pessoaJuridicaNomeControl = new FormControl('');
  representantesFisicaControl = new FormControl('');
  representantesJuridicaControl = new FormControl('');
  pessoaPJNomeControl = new FormControl('');

  // --- Flags para exibir sugestões
  mostrarSugestoesArtigo = false;
  mostrarSugestoesPessoaFisica = false;
  mostrarSugestoesPessoaJuridica = false;
  mostrarSugestoesPJ = false;
  mostrarSugestoesRepresentantesFisico = false;
  mostrarSugestoesRepresentantesJuridico = false;

  tipoEmpresa: 'pf' | 'pj' = 'pj';

  empresasFisicasSelecionadas: ConsultarPessoaResponse[] = [];
  empresasFisicasFiltradas: ConsultarPessoaResponse[] = [];

  empresaFisicaNomeControl = new FormControl('');
  mostrarSugestoesEmpresaFisica = false;

  // --- Listas de sugestões retornadas pelos serviços
  artigoFiltradas: ConsultarArtigoResponse[] = [];
  pessoasFisicaFiltradas: ConsultarPessoaResponse[] = [];
  pessoasJuridicasFiltradas: ConsultarPessoaResponse[] = [];
  pessoasPJFiltradas: ConsultarPessoaResponse[] = [];
  representanteFisicaFiltradas: ConsultarPessoaResponse[] = [];
  representanteJuridicaFiltradas: ConsultarPessoaResponse[] = [];

  // --- Listas de selecionados (estado)
  artigosSelecionados: ConsultarArtigoResponse[] = [];
  pessoasSelecionadas: ConsultarPessoaResponse[] = []; // reclamantes (PF)
  pessoasJuridicaSelecionadas: ConsultarPessoaResponse[] = []; // reclamadas (PJ)
  pessoasPJSelecionadas: ConsultarPessoaResponse[] = []; // reclamadas (PJ)
  representantesFisicoSelecionadas: ConsultarPessoaResponse[] = []; // representantes PF
  representantesJuridicoSelecionadas: ConsultarPessoaResponse[] = []; // representantes PJ

  horariosDisponiveis: HorariosDisponiveisResponse[] = [];
  horariosFormatados: string[] = [];

  // --- Usuário e mensagens
  usuarioLogado?: AutenticarUsuarioResponse | null;
  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];
  carregando = false;
  urlBase = environment.apiProcon;
  pdfGerado = false;
  codigoAtendimento?: number;
  anoBaseAtendimento?: string;
  tipoReclamante: 'pf' | 'pj' = 'pf';

  // --- FormGroup
  form = this.builder.group({
    idUsuario: [''],
    idPessoa: [''],
    idAtendimento: [''],
    idEmpresa: [''],
    fato: ['', Validators.required],
    protocolo: ['', Validators.required],
    prazo: [''],
    // controles auxiliares mantidos no form apenas se desejar bind adicional
    reclamante: this.pessoaFisicaNomeControl,
    reclamantePJ: this.pessoaPJNomeControl,
    pessoaJuridicacaNome: this.pessoaJuridicaNomeControl,
    representantesFisico: this.representantesFisicaControl,
    representantesJuridico: this.representantesJuridicaControl,
    pessoaPJNome: this.pessoaPJNomeControl,
  });

  // validação para habilitar submit — exige PF e PJ pelo seu requisito original
get podeEnviar(): boolean {
  const temReclamante =
    this.pessoasSelecionadas.length > 0 ||
    this.pessoasPJSelecionadas.length > 0;

  const temReclamada =
    this.empresasFisicasSelecionadas.length > 0 ||
    this.pessoasJuridicaSelecionadas.length > 0;

  return this.form.valid && temReclamante && temReclamada;
}
  //quillModules = { toolbar: [['bold', 'italic', 'underline']] };

  // -----------------------
  // Ciclo de vida
  // -----------------------
  mudarTipoEmpresa(tipo: 'pf' | 'pj'): void {
    this.tipoEmpresa = tipo;

    this.empresaFisicaNomeControl.setValue('');
    this.pessoaJuridicaNomeControl.setValue('');

    this.mostrarSugestoesEmpresaFisica = false;
    this.mostrarSugestoesPessoaJuridica = false;
  }

  selecionarEmpresaFisica(pessoa: ConsultarPessoaResponse): void {
    if (this.empresasFisicasSelecionadas.some(
      p => p.idPessoa === pessoa.idPessoa
    )) {
      this.mensagemErro = ['Essa pessoa já foi selecionada.'];
      return;
    }

    this.empresasFisicasSelecionadas.push(pessoa);
    this.empresaFisicaNomeControl.setValue('');
    this.mostrarSugestoesEmpresaFisica = false;
  }

  removerEmpresaFisica(pessoa: ConsultarPessoaResponse): void {
    this.empresasFisicasSelecionadas =
      this.empresasFisicasSelecionadas.filter(
        p => p.idPessoa !== pessoa.idPessoa
      );
  }
  mudarParaPF() {
    this.tipoReclamante = 'pf';
    this.pessoaFisicaNomeControl.setValue('');
    this.pessoaPJNomeControl.setValue('');
  }

  mudarParaPJ() {
    this.tipoReclamante = 'pj';
    this.pessoaFisicaNomeControl.setValue('');
    this.pessoaPJNomeControl.setValue('');
  }

  ngOnInit(): void {
    this.carregando = true;

    // Recupera usuário logado via AuthHelper
    this.usuarioLogado = this.authHelper.get();
    if (this.usuarioLogado) {
      this.form.get('idUsuario')?.setValue(this.usuarioLogado.idUsuario ?? null);
    }

    // Autocomplete pessoa física
    this.pessoaFisicaNomeControl.valueChanges.pipe(
      debounceTime(300),
      filter((nome): nome is string => !!nome && nome.length >= 1),
      switchMap(nome => this.pessoaService.buscarPorNome(nome)),
      catchError(() => of([]))
    ).subscribe(pessoas => this.pessoasFisicaFiltradas = pessoas);

    // Autocomplete pessoa jurídica
    this.pessoaJuridicaNomeControl.valueChanges.pipe(
      debounceTime(300),
      filter((nome): nome is string => !!nome && nome.length >= 1),
      switchMap(nome => this.pessoaService.buscarPorNomePessoaJuridica(nome)),
      catchError(() => of([]))
    ).subscribe(pessoas => this.pessoasJuridicasFiltradas = pessoas);
    // Autocomplete PJ
    this.pessoaPJNomeControl.valueChanges.pipe(
      debounceTime(300),
      filter((nome): nome is string => !!nome && nome.length >= 1),
      switchMap(nome => this.pessoaService.buscarPorNomePessoaJuridica(nome)),
      catchError(() => of([]))
    ).subscribe(pessoas => this.pessoasPJFiltradas = pessoas);


    // Autocomplete representantes (PF)
    this.representantesFisicaControl.valueChanges.pipe(
      debounceTime(300),
      filter((nome): nome is string => !!nome && nome.length >= 1),
      switchMap(nome => this.pessoaService.buscarPorNome(nome)),
      catchError(() => of([]))
    ).subscribe(pessoas => this.representanteFisicaFiltradas = pessoas);

    // Autocomplete representantes (PJ)
    this.representantesJuridicaControl.valueChanges.pipe(
      debounceTime(300),
      filter((nome): nome is string => !!nome && nome.length >= 1),
      switchMap(nome => this.pessoaService.buscarPorNomePessoaJuridica(nome)),
      catchError(() => of([]))
    ).subscribe(pessoas => this.representanteJuridicaFiltradas = pessoas);

    // Autocomplete artigos
    this.artigoNomeControl.valueChanges.pipe(
      debounceTime(300),
      filter((titulo): titulo is string => !!titulo && titulo.length >= 1),
      switchMap(titulo => this.artigoService.buscarPorArtigo(titulo)),
      catchError(() => of([]))
    ).subscribe(artigos => this.artigoFiltradas = artigos);

    this.empresaFisicaNomeControl.valueChanges.pipe(
      debounceTime(300),
      switchMap(nome =>
        nome?.trim()
          ? this.pessoaService.buscarPorNome(nome)
          : of([])
      ),
      catchError(() => of([]))
    ).subscribe(pessoas => {
      this.empresasFisicasFiltradas = pessoas;
    });

    this.carregando = false;
  }

  /*ngAfterViewInit(): void {
    this.inicializarQuill();
  }*/

  /*inicializarQuill() {
    if (!this.editorContainer) return;
    this.quillEditor = new Quill(this.editorContainer.nativeElement, {
      theme: 'snow',
      placeholder: 'Digite aqui a descrição...',
      modules: { toolbar: ['bold', 'italic', 'underline'] }
    });

    this.quillEditor.on('text-change', () => {
      const html = this.quillEditor.root.innerHTML;
      this.form.get('fato')?.setValue(html);
    });
  }*/

  // -----------------------
  // Helpers para esconder sugestões (delay p/ permitir mousedown)
  // -----------------------
  ocultarSugestoesComDelay() {
    setTimeout(() => {
      this.mostrarSugestoesPessoaFisica = false;
      this.mostrarSugestoesPessoaJuridica = false;
      this.mostrarSugestoesPJ = false;
      this.mostrarSugestoesRepresentantesFisico = false;
      this.mostrarSugestoesRepresentantesJuridico = false;
      this.mostrarSugestoesArtigo = false;
    }, 200);
  }

  ocultarSugestoesComDelayPessoaJuridica() { setTimeout(() => this.mostrarSugestoesPessoaJuridica = false, 200); }
  ocultarSugestoesComDelayRepresentantesFisico() { setTimeout(() => this.mostrarSugestoesRepresentantesFisico = false, 200); }
  ocultarSugestoesComDelayRepresentantesJuridico() { setTimeout(() => this.mostrarSugestoesRepresentantesJuridico = false, 200); }
  ocultarSugestoesComDelayArtigo() { setTimeout(() => this.mostrarSugestoesArtigo = false, 200); }
  ocultarSugestoesComDelayPJ() { setTimeout(() => this.mostrarSugestoesPJ = false, 200); }

  // -----------------------
  // Seleção / remoção — PESSOA FÍSICA (reclamantes)
  // -----------------------
  selecionarPessoa(pessoa: ConsultarPessoaResponse) {
    if (this.pessoasSelecionadas.some(p => p.idPessoa === pessoa.idPessoa)) {
      this.mensagemErro = ['Essa pessoa já foi selecionada.'];
      return;
    }
    this.pessoasSelecionadas.push(pessoa);
    // atualiza campo auxiliar (se quiser manter)
    this.pessoaFisicaNomeControl.setValue('');
    this.form.get('idPessoa')?.setValue(pessoa.idPessoa); // opcional
    this.mostrarSugestoesPessoaFisica = false;
  }

  removerPessoafisicaSelecionada(pessoa: ConsultarPessoaResponse) {
    this.pessoasSelecionadas = this.pessoasSelecionadas.filter(p => p.idPessoa !== pessoa.idPessoa);
    if (this.form.get('idPessoa')?.value === pessoa.idPessoa) {
      this.form.get('idPessoa')?.setValue('');
    }
  }

  // -----------------------
  // Seleção / remoção — PESSOA JURÍDICA (reclamadas / empresas)
  // -----------------------
  selecionarPessoaJuridica(pessoa: ConsultarPessoaResponse) {
    if (this.pessoasJuridicaSelecionadas.some(p => p.idPessoa === pessoa.idPessoa)) {
      this.mensagemErro = ['Essa empresa já foi selecionada.'];
      return;
    }
    this.pessoasJuridicaSelecionadas.push(pessoa);
    this.pessoaJuridicaNomeControl.setValue('');
    this.form.get('idEmpresa')?.setValue(pessoa.idPessoa); // usa idEmpresa para empresas
    this.mostrarSugestoesPessoaJuridica = false;
  }

  removerPessoaJuridicaSelecionada(pessoa: ConsultarPessoaResponse) {
    this.pessoasJuridicaSelecionadas = this.pessoasJuridicaSelecionadas.filter(p => p.idPessoa !== pessoa.idPessoa);
    if (this.form.get('idEmpresa')?.value === pessoa.idPessoa) {
      this.form.get('idEmpresa')?.setValue('');
    }
  }

  selecionarPJ(pessoa: ConsultarPessoaResponse) {
    if (this.pessoasPJSelecionadas.some(p => p.idPessoa === pessoa.idPessoa)) {
      this.mensagemErro = ['Essa empresa já foi selecionada.'];
      return;
    }
    this.pessoasPJSelecionadas.push(pessoa);
    this.pessoaPJNomeControl.setValue('');
    this.form.get('idEmpresa')?.setValue(pessoa.idPessoa); // usa idEmpresa para empresas
    this.mostrarSugestoesPJ = false;
  }

  removerPJSelecionada(pessoa: ConsultarPessoaResponse) {
    this.pessoasPJSelecionadas = this.pessoasPJSelecionadas.filter(p => p.idPessoa !== pessoa.idPessoa);
    if (this.form.get('idEmpresa')?.value === pessoa.idPessoa) {
      this.form.get('idEmpresa')?.setValue('');
    }
  }

  // -----------------------
  // Seleção / remoção — REPRESENTANTES (PF)
  // -----------------------
  selecionarRepresentantes(pessoa: ConsultarPessoaResponse) {
    // evita escolher um reclamante (PF) como seu próprio representante
    if (this.pessoasSelecionadas.some(p => p.idPessoa === pessoa.idPessoa)) {
      this.mensagemErro = ['Você não pode escolher um reclamante como representante legal. Por favor, escolha um representante diferente.'];
      return;
    }

    if (this.representantesFisicoSelecionadas.some(p => p.idPessoa === pessoa.idPessoa)) {
      this.mensagemErro = ['Esse representante já foi selecionado.'];
      return;
    }

    this.representantesFisicoSelecionadas.push(pessoa);
    this.representantesFisicaControl.setValue('');
    this.mostrarSugestoesRepresentantesFisico = false;
  }

  removerRepresentantefisicoSelecionado(pessoa: ConsultarPessoaResponse) {
    this.representantesFisicoSelecionadas = this.representantesFisicoSelecionadas.filter(p => p.idPessoa !== pessoa.idPessoa);
  }

  // -----------------------
  // Seleção / remoção — REPRESENTANTES (PJ)
  // -----------------------
  selecionarRepresentanteJuridico(pessoa: ConsultarPessoaResponse) {
    // evita escolher a própria empresa (reclamada) como representante jurídico
    if (this.pessoasJuridicaSelecionadas.some(p => p.idPessoa === pessoa.idPessoa)) {
      this.mensagemErro = ['Essa empresa já está selecionada como reclamada e não pode ser representante jurídico. Por favor, escolha outro representante.'];
      return;
    }

    if (this.representantesJuridicoSelecionadas.some(p => p.idPessoa === pessoa.idPessoa)) {
      this.mensagemErro = ['Esse representante jurídico já foi selecionado.'];
      return;
    }

    this.representantesJuridicoSelecionadas.push(pessoa);
    this.representantesJuridicaControl.setValue('');
    this.mostrarSugestoesRepresentantesJuridico = false;
  }

  removerRepresetanteSelecionada(pessoa: ConsultarPessoaResponse) {
    // mantive o nome do método igual ao HTML se você já estiver chamando assim; mas recomendo padronizar.
    this.representantesJuridicoSelecionadas = this.representantesJuridicoSelecionadas.filter(p => p.idPessoa !== pessoa.idPessoa);
  }

  // -----------------------
  // Artigos
  // -----------------------
  selecionarArtigo(artigo: ConsultarArtigoResponse) {
    if (this.artigosSelecionados.some(a => a.idArtigo === artigo.idArtigo)) {
      this.mensagemErro = ['Este artigo já foi selecionado.'];
      return;
    }
    this.artigosSelecionados.push(artigo);
    this.artigoNomeControl.setValue('');
    this.mostrarSugestoesArtigo = false;
  }

  removerArtigoSelecionado(artigo: ConsultarArtigoResponse) {
    this.artigosSelecionados = this.artigosSelecionados.filter(a => a.idArtigo !== artigo.idArtigo);
  }

  // -----------------------
  // Submit
  // -----------------------

onSubmit(): void {
  this.mensagemErro = [];
  this.mensagemSucesso = [];

  if (!this.podeEnviar) {
    this.mensagemErro = [
      'Preencha todos os campos obrigatórios e selecione pelo menos um reclamante e uma reclamada.'
    ];
    return;
  }

  this.carregando = true;

  const fatoFormatado = (this.form.value.fato ?? '')
    .replace(/\r\n|\r|\n/g, '<br>');

  const request: CadastrarAtendimentoRequest = {
    idUsuario: this.form.value.idUsuario ?? undefined,
    protocolo: this.form.value.protocolo ?? undefined,
    fato: fatoFormatado,
    prazo: 7,

    // Reclamantes PF
    GrupoReclamantesAtendimentoRequest:
      this.pessoasSelecionadas
        .filter(p => !!p.idPessoa)
        .map(p => ({
          idReclamante: p.idPessoa!
        })),

    // Reclamantes PJ
    GrupoReclamantesAtendimentoPJRequest:
      this.pessoasPJSelecionadas
        .filter(p => !!p.idPessoa)
        .map(p => ({
          idReclamante: p.idPessoa!
        })),

    // Reclamadas PJ
    GrupoReclamadasAtendimentoRequest:
      this.pessoasJuridicaSelecionadas
        .filter(p => !!p.idPessoa)
        .map(p => ({
          idReclamada: p.idPessoa!
        })),

    // Reclamadas PF
    GrupoReclamadasAtendimentoPFRequest:
      this.empresasFisicasSelecionadas
        .filter(p => !!p.idPessoa)
        .map(p => ({
          idReclamada: p.idPessoa!
        })),

    // Representantes PF
    GrupoRepresentantesAtendimentoFisicoRequest:
      this.representantesFisicoSelecionadas
        .filter(p => !!p.idPessoa)
        .map(p => ({
          idReclamante: p.idPessoa!
        })),

    // Representantes PJ
    GrupoRepresentantesAtendimentoJuridicoRequest:
      this.representantesJuridicoSelecionadas
        .filter(p => !!p.idPessoa)
        .map(p => ({
          idReclamada: p.idPessoa!
        })),

    // Artigos
    GrupoArtigoAtendimentoRequest:
      this.artigosSelecionados
        .filter(a => !!a.idArtigo)
        .map(a => ({
          idArtigo: a.idArtigo!
        }))
  };

  console.log('Request enviado:', request);

  // Seleciona o endpoint pelo tipo do RECLAMANTE,
  // independentemente do tipo das reclamadas.
  const requisicao$ =
    this.tipoReclamante === 'pf'
      ? this.atendimentoService.cadastrar(request)
      : this.atendimentoService.cadastrarPJ(request);

  requisicao$.subscribe({
    next: response => {
      this.carregando = false;
      this.mensagemSucesso = [response.mensagem];

      this.codigoAtendimento = response.dados?.codigo
        ? Number(response.dados.codigo)
        : undefined;

      this.anoBaseAtendimento = response.dados?.anoBase;
      this.pdfGerado = true;

      this.resetarFormulario();
    },
    error: e => {
      this.tratarErro(e);
      this.carregando = false;
    }
  });
}

  private resetarFormulario() {
    this.form.reset();

    this.pessoasSelecionadas = [];
    this.pessoasJuridicaSelecionadas = [];
    this.pessoasPJSelecionadas = [];
    this.representantesFisicoSelecionadas = [];
    this.representantesJuridicoSelecionadas = [];
    this.artigosSelecionados = [];

    this.pessoasFisicaFiltradas = [];
    this.pessoasJuridicasFiltradas = [];
    this.representanteFisicaFiltradas = [];
    this.representanteJuridicaFiltradas = [];
    this.artigoFiltradas = [];

    this.empresasFisicasSelecionadas = [];
this.empresasFisicasFiltradas = [];
this.empresaFisicaNomeControl.setValue('');
this.mostrarSugestoesEmpresaFisica = false;
this.tipoEmpresa = 'pj';

    if (this.usuarioLogado) {
      this.form.get('idUsuario')?.setValue(this.usuarioLogado.idUsuario ?? null);
    }

    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  // -----------------------
  // Conversão HTML -> tags básicas 
  // -----------------------
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

  // -----------------------
  // Tratamento de erros vindo do backend
  // -----------------------
  private tratarErro(e: any) {
    const errorResponse = e?.error;
    this.mensagemErro = [];

    if (errorResponse?.errors) {
      for (const key in errorResponse.errors) {
        if (Array.isArray(errorResponse.errors[key])) {
          this.mensagemErro.push(...errorResponse.errors[key]);
        }
      }
    } else if (errorResponse?.mensagem) {
      this.mensagemErro.push(errorResponse.mensagem);
      if (errorResponse.Detalhes) this.mensagemErro.push(errorResponse.Detalhes);
    } else if (errorResponse?.Message) {
      this.mensagemErro.push(errorResponse.Message);
      if (errorResponse.inner) this.mensagemErro.push(errorResponse.inner);
    } else {
      this.mensagemErro.push('Ocorreu um erro inesperado ao processar sua solicitação.');
    }
  }
}
