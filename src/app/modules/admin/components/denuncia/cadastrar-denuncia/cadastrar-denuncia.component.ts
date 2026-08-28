import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { CadastrarDenunciaRequest } from '../../../../../core/models/denuncia/cadastrar-denuncia-request';
import { ConsultarArtigoResponse } from '../../../../../core/models/artigo/consultar-artigo-response';
import { ConsultarPessoaResponse } from '../../../../../core/models/pessoa/consultar-pessoa-response';
import { AutenticarUsuarioResponse } from '../../../../../core/models/usuario/autenticar-usuario.response';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import Quill from 'quill';
import { AuthHelper } from '../../../../../core/helpers/auth.helper';
import { Router } from '@angular/router';
import { ArtigoService } from '../../../../../core/services/artigo.service';
import { PessoaService } from '../../../../../core/services/pessoa.service';
import { DenunciaService } from '../../../../../core/services/denuncia.service';
import { catchError, debounceTime, filter, of, switchMap } from 'rxjs';
import { environment } from '../../../../../../environments/environment.development';

@Component({
  selector: 'app-cadastrar-denuncia',
  standalone:false,
  templateUrl: './cadastrar-denuncia.component.html',
  styleUrl: './cadastrar-denuncia.component.css'
})
export class CadastrarDenunciaComponent {
 // --- Injeção de dependências via inject()
  private denunciaService = inject(DenunciaService);
  private pessoaService = inject(PessoaService);
  private artigoService = inject(ArtigoService);
  private builder = inject(FormBuilder);
  private router = inject(Router);
  private authHelper = inject(AuthHelper);

  /*@ViewChild('editorContainer', { static: false }) editorContainer!: ElementRef;
  private quillEditor!: Quill;*/

  // --- Controles reativos / autocomplete
  artigoNomeControl = new FormControl('');
  pessoaFisicaNomeControl = new FormControl('');
  pessoaJuridicaNomeControl = new FormControl('');


  // --- Flags para exibir sugestões
  mostrarSugestoesArtigo = false;
  mostrarSugestoesPessoaFisica = false;
  mostrarSugestoesPessoaJuridica = false;


  // --- Listas de sugestões retornadas pelos serviços
  artigoFiltradas: ConsultarArtigoResponse[] = [];
  pessoasFisicaFiltradas: ConsultarPessoaResponse[] = [];
  pessoasJuridicasFiltradas: ConsultarPessoaResponse[] = [];


  // --- Listas de selecionados (estado)
  artigosSelecionados: ConsultarArtigoResponse[] = [];
  pessoasSelecionadas: ConsultarPessoaResponse[] = []; // reclamantes (PF)
  pessoasJuridicaSelecionadas: ConsultarPessoaResponse[] = []; // reclamadas (PJ)
  representantesFisicoSelecionadas: ConsultarPessoaResponse[] = []; // representantes PF
  representantesJuridicoSelecionadas: ConsultarPessoaResponse[] = []; // representantes PJ




  // --- Usuário e mensagens
  usuarioLogado?: AutenticarUsuarioResponse | null;
  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];
  carregando = false;
  urlBase = environment.apiProcon;
  pdfGerado = false;
  codigo?: number;
  anoBase?: string;

  // --- FormGroup
  form = this.builder.group({
    idUsuario: [''],
    idPessoa: [''],    
    idEmpresa: [''],
    denuncia_fato: ['', Validators.required],  
    // controles auxiliares mantidos no form apenas se desejar bind adicional
    reclamante: this.pessoaFisicaNomeControl,
    pessoaJuridicacaNome: this.pessoaJuridicaNomeControl,

  });

  // validação para habilitar submit — exige PF e PJ pelo seu requisito original
  get podeEnviar(): boolean {
    return this.form.valid &&
      this.pessoasSelecionadas.length > 0 &&
      this.pessoasJuridicaSelecionadas.length > 0;
  }

  //quillModules = { toolbar: [['bold', 'italic', 'underline']] };

  // -----------------------
  // Ciclo de vida
  // -----------------------
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

    // Autocomplete artigos
    this.artigoNomeControl.valueChanges.pipe(
      debounceTime(300),
      filter((titulo): titulo is string => !!titulo && titulo.length >= 1),
      switchMap(titulo => this.artigoService.buscarPorArtigo(titulo)),
      catchError(() => of([]))
    ).subscribe(artigos => this.artigoFiltradas = artigos);

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
      this.form.get('denuncia_fato')?.setValue(html);
    });
  }*/

  // -----------------------
  // Helpers para esconder sugestões (delay p/ permitir mousedown)
  // -----------------------
  ocultarSugestoesComDelay() {
    setTimeout(() => {
      this.mostrarSugestoesPessoaFisica = false;
      this.mostrarSugestoesPessoaJuridica = false;

      this.mostrarSugestoesArtigo = false;
    }, 200);
  }

  ocultarSugestoesComDelayPessoaJuridica() { setTimeout(() => this.mostrarSugestoesPessoaJuridica = false, 200); }
  ocultarSugestoesComDelayArtigo() { setTimeout(() => this.mostrarSugestoesArtigo = false, 200); }

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
  onSubmit() {
  this.carregando = true;
  this.mensagemErro = [];
  this.mensagemSucesso = [];

  if (!this.podeEnviar) {
    this.mensagemErro = ['Preencha todos os campos obrigatórios corretamente.'];
    this.carregando = false;
    return;
  }

  // Pega o valor do textarea e substitui \n por <br>
  const denuncia_FatoFormatada = (this.form.value.denuncia_fato ?? '').replace(/\r\n|\r|\n/g, '<br>');

  const request: CadastrarDenunciaRequest = {
    idUsuario: this.form.value.idUsuario ?? undefined,
    denuncia_Fato: denuncia_FatoFormatada,

    GrupoReclamantesDenunciaRequest: this.pessoasSelecionadas
      .filter(p => p.idPessoa)
      .map(p => ({ idReclamante: p.idPessoa! })),

    GrupoReclamadasDenunciaRequest: this.pessoasJuridicaSelecionadas
      .filter(p => p.idPessoa)
      .map(p => ({ idReclamada: p.idPessoa! })),

    GrupoArtigoDenunciaRequest: this.artigosSelecionados
      .filter(a => a.idArtigo)
      .map(a => ({ idArtigo: a.idArtigo! })),
  };

  console.log('Objeto request enviado:', request);

  this.denunciaService.cadastrar(request).subscribe({
    next: (response) => {
      this.carregando = false;
      this.mensagemSucesso = [response.mensagem];
      console.log('Denúncia cadastrada:', response.dados);
    },
    error: (e) => {
      this.tratarErro(e);
      this.carregando = false;
    }
  });
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
