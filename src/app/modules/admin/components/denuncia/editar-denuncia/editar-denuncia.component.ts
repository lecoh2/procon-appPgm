import { ChangeDetectorRef, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { DenunciaService } from '../../../../../core/services/denuncia.service';
import { PessoaService } from '../../../../../core/services/pessoa.service';
import { ArtigoService } from '../../../../../core/services/artigo.service';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { AuthHelper } from '../../../../../core/helpers/auth.helper';
import { ActivatedRoute, Router } from '@angular/router';
import Quill from 'quill';
import { ConsultarArtigoResponse } from '../../../../../core/models/artigo/consultar-artigo-response';
import { ConsultarPessoaResponse } from '../../../../../core/models/pessoa/consultar-pessoa-response';
import { AutenticarUsuarioResponse } from '../../../../../core/models/usuario/autenticar-usuario.response';
import { environment } from '../../../../../../environments/environment.development';
import { catchError, debounceTime, filter, forkJoin, of, switchMap } from 'rxjs';
import { EditarDenunciaRequest } from '../../../../../core/models/denuncia/editar-denuncia-request';
import { PessoaSimplesRequest } from '../../../../../core/models/pessoa/Pessoa-simples-request';
import { ArtigoSimplesRequest } from '../../../../../core/models/artigo/artigo-simples-request';
import { ConsultarDenunciaHistoricoResponse } from '../../../../../core/models/denuncia/consultar-historico-denuncia-response';

declare var bootstrap: any;

@Component({
  selector: 'app-editar-denuncia',
  standalone: false,
  templateUrl: './editar-denuncia.component.html',
  styleUrl: './editar-denuncia.component.css'
})
export class EditarDenunciaComponent {
  private denunciaService = inject(DenunciaService);
  private pessoaService = inject(PessoaService);
  private artigoService = inject(ArtigoService);
  private builder = inject(FormBuilder);
  private router = inject(Router);
  private authHelper = inject(AuthHelper);
  private route = inject(ActivatedRoute);
  private cd = inject(ChangeDetectorRef);

  @ViewChild('editorContainer', { static: false }) editorContainer!: ElementRef;
  private quillEditor!: Quill;
  artigosNomeControl = new FormControl('');
  pessoaNomeControl = new FormControl('');
  pessoaJuridicaNomeControl = new FormControl('');
  carregandoConsulta = true;
  carregandoCadastro = false;

  mostrarSugestoesArtigo = false;
  mostrarSugestoesPessoaFisica = false;
  mostrarSugestoesPessoaJuridica = false;
  historicoDenuncia: ConsultarDenunciaHistoricoResponse[] = [];

 artigosFiltrados: ConsultarArtigoResponse[] = [];
  pessoasFiltradas: ConsultarPessoaResponse[] = [];
  pessoasJuridicasFiltradas: ConsultarPessoaResponse[] = [];

  artigosSelecionados: ConsultarArtigoResponse[] = [];
  pessoasSelecionadas: ConsultarPessoaResponse[] = [];
  pessoasJuridicaSelecionadas: ConsultarPessoaResponse[] = [];


  usuarioLogado?: AutenticarUsuarioResponse | null;
  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];
  carregando = false;
  urlBase = environment.apiProcon;
  pdfGerado = false;
  codigo: string = '';
  anoBase: string = '';
  dataCadastro: string = '';
  usuarioCadastro: string = '';

  form = this.builder.group({
    idDenuncia: new FormControl('', Validators.required),
    codigo: new FormControl(''),
    anoBase: new FormControl(''),
    idControleDenuncia: new FormControl(''),
    nomeUsuario: new FormControl(''),
    observacoes: new FormControl('', Validators.required),
    idUsuario: [''],
    idPessoa: [''],
    idEmpresa: [''],
    denuncia_Fato: ['', Validators.required],
    grupoReclamantesDenunciaSimples: new FormControl<PessoaSimplesRequest[]>([]),
    grupoReclamadasDenunciaSimples: new FormControl<PessoaSimplesRequest[]>([]),
    grupoArtigosDenunciaSimples: new FormControl<ArtigoSimplesRequest[]>([])
  });

  quillModules = { toolbar: [['bold', 'italic', 'underline']] };

  get grupoReclamantesDenunciaSimples(): PessoaSimplesRequest[] {
    return this.form.get('grupoReclamantesDenunciaSimples')?.value ?? [];
  }

  get grupoReclamadasDenunciaSimples(): PessoaSimplesRequest[] {
    return this.form.get('grupoReclamadasDenunciaSimples')?.value ?? [];
  }
  get grupoArtigosDenunciaSimples(): ArtigoSimplesRequest[] {
    return this.form.get('grupoArtigosDenunciaSimples')?.value ?? [];
  }

  get podeEnviar(): boolean {
    return !!this.form.get('idDenuncia')?.value &&
      !!this.form.get('idUsuario')?.value &&
      !!this.form.get('denuncia_Fato')?.value &&
      !!this.form.get('observacoes')?.value &&
      this.grupoReclamantesDenunciaSimples.length > 0 &&
      this.grupoReclamadasDenunciaSimples.length > 0 &&
      this.grupoArtigosDenunciaSimples.length > 0;
  }
  ngOnInit(): void {
    this.carregando = true;
    this.usuarioLogado = this.authHelper.get();
    if (this.usuarioLogado) {
      this.form.get('idUsuario')?.setValue(this.usuarioLogado.idUsuario ?? null);
    }

    // --- Autocomplete PF
    this.pessoaNomeControl.valueChanges.pipe(
      debounceTime(300),
      filter((nome): nome is string => !!nome && nome.length >= 1),
      switchMap(nome => this.pessoaService.buscarPorNome(nome)),
      catchError(() => of([]))
    ).subscribe(pessoas => this.pessoasFiltradas = pessoas);

    // --- Autocomplete PJ
    this.pessoaJuridicaNomeControl.valueChanges.pipe(
      debounceTime(300),
      filter((n): n is string => !!n && n.length > 0),
      switchMap(nome => this.pessoaService.buscarPorNomePessoaJuridica(nome)),
      catchError(() => of([]))
    ).subscribe(p => this.pessoasJuridicasFiltradas = p);

    // --- Autocomplete Artigos
     this.artigosNomeControl.valueChanges.pipe(
    debounceTime(300),
    filter((titulo): titulo is string => !!titulo && titulo.length >= 1),
    switchMap(titulo => this.artigoService.buscarPorArtigo(titulo)),
    catchError(() => of([]))
  ).subscribe(artigos => this.artigosFiltrados = artigos);


    // --- Carregar Denúncia pelo ID
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.carregandoConsulta = false; return; }

    this.denunciaService.consultarDenunciaPorId(id).subscribe({
      next: response => {
        const denuncia = Array.isArray(response) ? response[0] : response;

        console.log('===== DEBUG DENUNCIA =====', denuncia);

        this.form.patchValue({
          idDenuncia: denuncia.idDenuncia ?? '',
          codigo: denuncia.codigo?.toString() ?? '',
          anoBase: denuncia.anoBase ?? '',
          idControleDenuncia: denuncia.idControleDenuncia ?? '',
          denuncia_Fato: denuncia.denuncia_Fato ?? '',
          idUsuario: denuncia.idUsuario ?? '',
          nomeUsuario: denuncia.usuario ?? '',
          observacoes: '', // caso o backend não retorne observações

          grupoReclamantesDenunciaSimples: (denuncia.grupoReclamantesDenunciaSimples ?? []).map((p: any) => ({
            id: p.idPessoa ?? p.id ?? '',
            nome: p.nome
          })),
          grupoReclamadasDenunciaSimples: (denuncia.grupoReclamadasDenunciaSimples ?? []).map((p: any) => ({
            id: p.idEmpresa ?? p.id ?? '',
            nome: p.nome
          })),

          grupoArtigosDenunciaSimples: (denuncia.grupoArtigosDenunciaSimples ?? []).map((a: any) => ({
            idArtigo: a.idArtigo ?? '',
            titulo: a.titulo
          })),
        });


        // --- Campos auxiliares
        this.codigo = denuncia.codigo?.toString() ?? '';
        this.anoBase = denuncia.anoBase ?? '';
        this.usuarioCadastro = denuncia.usuario ?? '';
        this.dataCadastro = denuncia.dataCadastro ?? '';

        // --- Inicializar conteúdo do Quill
        setTimeout(() => {
          if (this.quillEditor && denuncia.denuncia_Fato) {
            this.quillEditor.root.innerHTML = denuncia.denuncia_Fato;
          }
        });

        this.cd.detectChanges();
        this.carregandoConsulta = false;
      },
      error: err => {
        this.tratarErro(err);
        this.carregandoConsulta = false;
      }
    });
  }


  ngAfterViewInit(): void { this.inicializarQuill(); }

  private inicializarQuill() {
    if (!this.editorContainer) return;
    this.quillEditor = new Quill(this.editorContainer.nativeElement, {
      theme: 'snow',
      placeholder: 'Digite aqui a descrição...',
      modules: { toolbar: ['bold', 'italic', 'underline'] }
    });
    this.quillEditor.on('text-change', () => {
      const html = this.quillEditor.root.innerHTML;
      this.form.get('denuncia_Fato')?.setValue(html);
    });
  }


  // -----------------------
  ocultarSugestoesComDelay() {
    setTimeout(() => this.mostrarSugestoesPessoaFisica = false, 200);
  }

  ocultarSugestoesComDelayPessoaJuridica() {
    setTimeout(() => this.mostrarSugestoesPessoaJuridica = false, 200);
  }

  ocultarSugestoesComDelaArtigos() {
    setTimeout(() => this.mostrarSugestoesArtigo = false, 200);
  }


  salvarReclamantesDenuncia() {
    const idDenuncia = this.form.get('idDenuncia')?.value;

    if (!idDenuncia) {
      this.mensagemErro = ['ID do atendimento não informado'];
      return;
    }
    if (this.pessoasSelecionadas.length === 0) {
      this.mensagemErro = ['Nenhum reclamante selecionado'];
      return;
    }
    this.mensagemErro = [];
    this.mensagemSucesso = [];

    const chamadas$ = this.pessoasSelecionadas.map(p =>
      this.denunciaService.adicionarReclamanteDenuncia(idDenuncia, p.idPessoa).pipe(
        catchError(err => {
          this.mensagemErro.push(`O reclamante ${p.nome} já está vinculado.`);
          return of(null);
        })
      )
    );

    forkJoin(chamadas$).subscribe({
      next: () => {
        const atuais: PessoaSimplesRequest[] = this.form.get('grupoReclamantesDenunciaSimples')?.value ?? [];
        const novos: PessoaSimplesRequest[] = this.pessoasSelecionadas.map(p => ({ id: p.idPessoa, nome: p.nome }));
        this.form.get('grupoReclamantesDenunciaSimples')?.setValue([...atuais, ...novos]);
        this.pessoasSelecionadas = [];
        this.pessoaNomeControl.reset();
        this.mostrarSugestoesPessoaFisica = false;
        this.cd.detectChanges();
        this.fecharModalEAtualizar();
      },
      error: err => { this.mensagemErro.push('Erro inesperado ao adicionar representante.'); console.error(err); }
    });
  }
  removerReclamanteDenuncia(index: number, idReclamante: string) {
    if (!idReclamante) return;
    const idDenuncia = this.form.get('idDenuncia')?.value;
    if (!idDenuncia) return;

    const nome = this.grupoReclamantesDenunciaSimples[index]?.nome ?? 'pessoa selecionada';
    if (!confirm(`Tem certeza que deseja desvincular a ${nome} desse atendimento?`)) return;

    this.denunciaService.removerReclamanteDenuncia(idReclamante, idDenuncia).subscribe({
      next: res => {
        const lista = [...this.grupoReclamantesDenunciaSimples];
        lista.splice(index, 1);
        this.form.get('grupoReclamantesDenunciaSimples')?.setValue(lista);
        this.mensagemSucesso = [res.mensagem ?? 'Reclamante removido com sucesso.'];
        this.cd.detectChanges();
      },
      error: err => { this.mensagemErro = [err.error?.Mensagem ?? 'Erro ao remover reclamante.']; console.error(err); }
    });
  }


  salvarArtigosDenuncia() {
    const idDenuncia = this.form.get('idDenuncia')?.value;

    if (!idDenuncia) {
      this.mensagemErro = ['ID do Artigo não informado'];
      return;
    }
    if (this.artigosSelecionados.length === 0) {
      this.mensagemErro = ['Nenhum artigo selecionado'];
      return;
    }
    this.mensagemErro = [];
    this.mensagemSucesso = [];

    const chamadas$ = this.artigosSelecionados.map(p =>
      this.denunciaService.adicionarArtigosDenuncia(idDenuncia, p.idArtigo).pipe(
        catchError(err => {
          this.mensagemErro.push(`O artigo ${p.titulo} já está vinculado.`);
          return of(null);
        })
      )
    );

    forkJoin(chamadas$).subscribe({
      next: () => {
        const atuais: ArtigoSimplesRequest[] = this.form.get('grupoArtigosDenunciaSimples')?.value ?? [];
        const novos: ArtigoSimplesRequest[] = this.artigosSelecionados.map(p => ({ idArtigo: p.idArtigo, titulo: p.titulo }));
        this.form.get('grupoArtigosDenunciaSimples')?.setValue([...atuais, ...novos]);
        this.artigosSelecionados = [];
        this.artigosNomeControl.reset();
        this.mostrarSugestoesArtigo = false;
        this.cd.detectChanges();
        this.fecharModalEAtualizar();
      },
      error: err => { this.mensagemErro.push('Erro inesperado ao adicionar representante.'); console.error(err); }
    });
  }
  salvarReclamadasDenuncia() {
    const idDenuncia = this.form.get('idDenuncia')?.value;

    if (!idDenuncia) {
      this.mensagemErro = ['ID do atendimento não informado'];
      return;
    }
    if (this.pessoasJuridicaSelecionadas.length === 0) {
      this.mensagemErro = ['Nenhuma reclamaada selecionada'];
      return;
    }
    this.mensagemErro = [];
    this.mensagemSucesso = [];

    const chamadas$ = this.pessoasJuridicaSelecionadas.map(p =>
      this.denunciaService.adicionarReclamadaDenuncia(idDenuncia, p.idPessoa).pipe(
        catchError(err => {
          this.mensagemErro.push(`A reclamada ${p.nome} já está vinculado.`);
          return of(null);
        })
      )
    );

    forkJoin(chamadas$).subscribe({
      next: () => {
        const atuais: PessoaSimplesRequest[] = this.form.get('grupoReclamadasDenunciaSimples')?.value ?? [];
        const novos: PessoaSimplesRequest[] = this.pessoasJuridicaSelecionadas.map(p => ({ id: p.idPessoa, nome: p.nome }));
        this.form.get('grupoReclamadasDenunciaSimples')?.setValue([...atuais, ...novos]);
        this.pessoasJuridicaSelecionadas = [];
        this.pessoaJuridicaNomeControl.reset();
        this.mostrarSugestoesPessoaJuridica = false;
        this.cd.detectChanges();
        this.fecharModalEAtualizar();
      },
      error: err => { this.mensagemErro.push('Erro inesperado ao adicionar representante.'); console.error(err); }
    });
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
    this.artigosNomeControl.setValue('');
    this.mostrarSugestoesArtigo = false;
  }

  removerArtigoSelecionado(artigo: ConsultarArtigoResponse) {
    this.artigosSelecionados = this.artigosSelecionados.filter(a => a.idArtigo !== artigo.idArtigo);
  }
  removerArtigoADenuncia(index: number, idArtigo: string) {
    if (!idArtigo) return;
    const idDenuncia = this.form.get('idDenuncia')?.value;
    if (!idDenuncia) return;

    const titulo = this.grupoArtigosDenunciaSimples[index]?.titulo ?? 'artigo selecionado';
    if (!confirm(`Tem certeza que deseja desvincular a ${titulo} desse atendimento?`)) return;

    this.denunciaService.removerArtigosDenuncia(idArtigo, idDenuncia).subscribe({
      next: res => {
        const lista = [...this.grupoArtigosDenunciaSimples];
        lista.splice(index, 1);
        this.form.get('grupoArtigosDenunciaSimples')?.setValue(lista);
        this.mensagemSucesso = [res.mensagem ?? 'Artigo removido com sucesso.'];
        this.cd.detectChanges();
      },
      error: err => { this.mensagemErro = [err.error?.Mensagem ?? 'Erro ao remover Artigo.']; console.error(err); }
    });
  }


  selecionarPessoa(pessoa: ConsultarPessoaResponse) {
    if (this.pessoasSelecionadas.some(p => p.idPessoa === pessoa.idPessoa)) {
      this.mensagemErro = ['Essa pessoa já foi selecionada.'];
      return;
    }
    this.pessoasSelecionadas.push(pessoa);
    this.pessoaNomeControl.reset();
    this.mostrarSugestoesPessoaFisica = false;
  }

  removerPessoaSelecionada(pessoa: ConsultarPessoaResponse) {
    this.pessoasSelecionadas = this.pessoasSelecionadas.filter(p => p.idPessoa !== pessoa.idPessoa);
  }


  removerPessoaJuridicaSelecionada(pessoa: ConsultarPessoaResponse) {
    this.pessoasJuridicaSelecionadas = this.pessoasJuridicaSelecionadas.filter(p => p.idPessoa !== pessoa.idPessoa);
  }

  removerartigoSelecionada(artigo: ConsultarArtigoResponse) {
    this.artigosSelecionados = this.artigosSelecionados.filter(p => p.idArtigo !== artigo.idArtigo);
  }

  // -----------------------
  selecionarReclamada(reclamada: ConsultarPessoaResponse) {
    if (this.pessoasJuridicaSelecionadas.some(p => p.idPessoa === reclamada.idPessoa)) {
      this.mensagemErro = ['Esta reclamada já foi selecionada.'];
      return;
    }
    this.pessoasJuridicaSelecionadas.push(reclamada);
    this.pessoaJuridicaNomeControl.setValue('');
    this.mostrarSugestoesPessoaJuridica = false;
  }


  removerReclamadasDenuncia(index: number, idReclamada: string) {
    if (!idReclamada) return;
    const idDenuncia = this.form.get('idDenuncia')?.value;
    if (!idDenuncia) return;

    const nome = this.grupoReclamadasDenunciaSimples[index]?.nome ?? 'pessoa selecionada';
    if (!confirm(`Tem certeza que deseja desvincular a ${nome} desse atendimento?`)) return;

    this.denunciaService.removerclamadaDenuncia(idReclamada, idDenuncia).subscribe({
      next: res => {
        const lista = [...this.grupoReclamadasDenunciaSimples];
        lista.splice(index, 1);
        this.form.get('grupoReclamadasDenunciaSimples')?.setValue(lista);
        this.mensagemSucesso = [res.mensagem ?? 'Reclamante removido com sucesso.'];
        this.cd.detectChanges();
      },
      error: err => { this.mensagemErro = [err.error?.Mensagem ?? 'Erro ao remover representante.']; console.error(err); }
    });
  }
  // -----------------------
  // Submit
  // -----------------------
  onSubmit() {
    this.carregandoCadastro = true;
    this.mensagemErro = [];
    this.mensagemSucesso = [];

    if (this.form.invalid) {
      this.mensagemErro = ['Preencha todos os campos obrigatórios corretamente.'];
      this.carregandoCadastro = false;
      return;
    }

    const fatoFormatada = this.converterHtmlParaTagsBasicas(this.form.value.denuncia_Fato!);
    const request: EditarDenunciaRequest = {
      idDenuncia: this.form.value.idDenuncia!,
      idUsuario: this.form.value.idUsuario!,
      denuncia_Fato: fatoFormatada,
      observacoes: this.form.value.observacoes!,

    };

    this.denunciaService.editarPorId(request).subscribe({
      next: response => {
        this.mensagemSucesso = [response?.mensagem || 'Denuncia editado com sucesso!'];
        this.carregandoCadastro = false;
        setTimeout(() => this.router.navigate(['/admin/consultar-denuncia']), 2000);
      },
      error: e => {
        this.tratarErro(e);
        this.carregandoCadastro = false;
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
  abrirModalHistorico(): void {
    const idDenuncia = this.form.get('idDenuncia')?.value;

    if (!idDenuncia) return;

    this.carregandoCadastro = true;

    this.denunciaService.consultarHistoricoDenuncia(idDenuncia).subscribe({
      next: response => {
        console.log('Resposta completa da API de histórico:', response); // <-- log completo
        const listaHistoricos = (response as any).historicos || response || [];
        this.historicoDenuncia = listaHistoricos.map((item: any) => {
          return {
            idHistoricoDenuncia: item.idHistoricoDenuncia,
            idDenuncia: item.idDenuncia,
            idUsuario: item.idUsuario,
            dataAlteracao: item.dataAlteracao,          
            observacoes: item.observacoes,
            dadosAntes: item.dadosAntes,
            dadosDepois: item.dadosDepois,
            dadosAntesObj: item.dadosAntes ? JSON.parse(item.dadosAntes) : {},
            dadosDepoisObj: item.dadosDepois ? JSON.parse(item.dadosDepois) : {},
            nomeUsuario: item.usuario?.nome ?? '',
            emailUsuario: item.usuario?.email ?? '',

          };
        });
        this.carregandoCadastro = false;
      },
      error: err => {
        this.mensagemErro.push('Erro ao carregar histórico do atendimento.');
        this.carregandoCadastro = false;
        console.error(err);
      }
    });
  }

  fecharModal() {
    const modalEl = document.getElementById('taskModal');
    if (modalEl) {
      const modal = bootstrap.Modal.getInstance(modalEl);
      modal?.hide();
    }
  }

  fecharModalEAtualizar() {
    document.querySelectorAll('.modal.show').forEach(modalEl => {
      const modal = bootstrap.Modal.getInstance(modalEl);
      modal?.hide();
    });
    setTimeout(() => location.reload(), 300);
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
