import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, debounceTime, filter, switchMap } from 'rxjs/operators';

import { AtendimentoService } from '../../../../../core/services/atendimento.service';
import { PessoaService } from '../../../../../core/services/pessoa.service';
import { AuthHelper } from '../../../../../core/helpers/auth.helper';
//import Quill from 'quill';

import { AutenticarUsuarioResponse } from '../../../../../core/models/usuario/autenticar-usuario.response';
import { ConsultarPessoaResponse } from '../../../../../core/models/pessoa/consultar-pessoa-response';
import { PessoaSimplesRequest } from '../../../../../core/models/pessoa/Pessoa-simples-request';
import { EditarAtendimentoRequest } from '../../../../../core/models/atendimento/editar-atendimento-request';
import { ConsultarAtendimentoHistoricoResponse } from '../../../../../core/models/atendimento/consultar-atendimento-historico-response';
import { ConsultarArtigoResponse } from '../../../../../core/models/artigo/consultar-artigo-response';
import { ArtigoSimplesRequest } from '../../../../../core/models/artigo/artigo-simples-request';
import { ArtigoService } from '../../../../../core/services/artigo.service';
import { AtendimentoStatusService } from '../../../../../core/services/atendimentostatus.service';
import { ConsultarAtendimentoStatusResponse } from '../../../../../core/models/atendimentoStatus/consulta-atendimento-status-response';


declare var bootstrap: any;

@Component({
  selector: 'app-editar-atendimento',
  standalone: false,
  templateUrl: './editar-atendimento.component.html',
  styleUrls: ['./editar-atendimento.component.css']
})
export class EditarAtendimentoComponent implements OnInit /*AfterViewInit*/ {

  private atendimentoService = inject(AtendimentoService);
  private atendimentoStatus = inject(AtendimentoStatusService);
  private artigoService = inject(ArtigoService);
  private pessoaService = inject(PessoaService);
  private builder = inject(FormBuilder);
  private router = inject(Router);
  private authHelper = inject(AuthHelper);
  private route = inject(ActivatedRoute);
  private cd = inject(ChangeDetectorRef);

  //@ViewChild('editorContainer', { static: false }) editorContainer!: ElementRef;
  //private quillEditor!: Quill;

  historicoAtendimento: ConsultarAtendimentoHistoricoResponse[] = [];
  usuarioLogado?: AutenticarUsuarioResponse | null;

  carregandoConsulta = true; // quando entra na página
  carregandoCadastro = false; // quando salva
  mensagemErro: string[] = [];
  mensagemAviso: string[] = [];
  mensagemSucesso: string[] = [];
  codigo: string = '';
  anoBase: string = '';
  dataCadastro: string = '';
  usuarioCadastro: string = '';
  // Autocomplete controls
  pessoaNomeControl = new FormControl('');
  pessoaJuridicaNomeControl = new FormControl('');
  representanteFisicoNomeControl = new FormControl('');
  representanteJuridicoNomeControl = new FormControl('');
  artigosNomeControl = new FormControl('');

  mostrarSugestoesPessoaFisica = false;
  mostrarSugestoesRepresentanteFisico = false;
  mostrarSugestoesPessoaJuridica = false;
  mostrarSugestoesRepresentanteJuridico = false;
  mostrarSugestoesArtigos = false;
  mostrarCamposNovaAudiencia = false;
  readonly GUID_STATUS_ATENDIMENTO = '4a9629fc-1ace-4e42-8270-5d8c72c87c21';
  public prazoDescricao: string = '';
  pessoasFiltradas: ConsultarPessoaResponse[] = [];
  pessoasJuridicasFiltradas: ConsultarPessoaResponse[] = [];
  representanteFisicoFiltradas: ConsultarPessoaResponse[] = [];
  representanteJuridicoFiltradas: ConsultarPessoaResponse[] = [];
  artigosFiltrados: ConsultarArtigoResponse[] = [];

  pessoasSelecionadas: ConsultarPessoaResponse[] = [];
  pessoasJuridicaSelecionadas: ConsultarPessoaResponse[] = [];
  representanteFisicoSelecionadas: ConsultarPessoaResponse[] = [];
  representanteJuridicoSelecionadas: ConsultarPessoaResponse[] = [];
  artigosSelecionados: ConsultarArtigoResponse[] = [];
  statusAtendimento: ConsultarAtendimentoStatusResponse[] = [];
  mostrarCamposExtras = false;
  // Form principal com tipagem explícita
  form = this.builder.group({
    idPessoa: new FormControl(''),
    idEmpresa: new FormControl(''),
    idArtigo: new FormControl(''),
    idAtendimento: new FormControl('', Validators.required),
    idAtendimentoStatus: new FormControl(''),
    codigo: new FormControl(''),
    anoBase: new FormControl(''),
    prazo: [''],
    dias: [''],
    idControleAtendimento: new FormControl(''),
    fato: new FormControl('', Validators.required),
    protocolo: new FormControl('', Validators.required),
    idUsuario: new FormControl('', Validators.required),
    usuario: new FormControl(''),
    nomeUsuario: new FormControl(''),
    observacoes: new FormControl('', Validators.required),
    usuarioCadastro: new FormControl(''),
    grupoReclamantesAtendimentoSimples: new FormControl<PessoaSimplesRequest[]>([]),
    grupoReclamadasAtendimentoSimples: new FormControl<PessoaSimplesRequest[]>([]),
    grupoRepresentanteAtendimentoFisicoSimples: new FormControl<PessoaSimplesRequest[]>([]),
    grupoRepresentanteAtendimentoJuridicaSimples: new FormControl<PessoaSimplesRequest[]>([]),
    grupoArtigosSimples: new FormControl<ArtigoSimplesRequest[]>([])
  });

  //quillModules = { toolbar: [['bold', 'italic', 'underline']] };

  get grupoReclamantesAtendimentoSimples(): PessoaSimplesRequest[] {
    return this.form.get('grupoReclamantesAtendimentoSimples')?.value ?? [];
  }

  get grupoReclamadasAtendimentoSimples(): PessoaSimplesRequest[] {
    return this.form.get('grupoReclamadasAtendimentoSimples')?.value ?? [];
  }

  get grupoRepresentanteAtendimentoFisicoSimples(): PessoaSimplesRequest[] {
    return this.form.get('grupoRepresentanteAtendimentoFisicoSimples')?.value ?? [];
  }

  get grupoRepresentanteAtendimentoJuridicaSimples(): PessoaSimplesRequest[] {
    return this.form.get('grupoRepresentanteAtendimentoJuridicaSimples')?.value ?? [];
  }
  get grupoArtigosSimples(): ArtigoSimplesRequest[] {
    return this.form.get('grupoArtigosSimples')?.value ?? [];
  }


  get podeEnviar(): boolean {
    return !!this.form.get('idAtendimento')?.valid &&
      !!this.form.get('fato')?.valid &&
      !!this.form.get('protocolo')?.valid &&
      !!this.form.get('idUsuario')?.valid &&
      !!this.form.get('observacoes')?.valid;
  }


  ngOnInit(): void {
    this.carregandoConsulta = true;
    this.carregarStatusAtendimento();

    // Atualiza campos visíveis ao mudar status
    this.form.get('idAtendimentoStatus')?.valueChanges.subscribe((valorSelecionado: string | null) => {
      if (valorSelecionado) {
        this.atualizarCamposVisiveis(valorSelecionado);
      }
    });

    // Usuário logado
    this.usuarioLogado = this.authHelper.get();
    if (this.usuarioLogado) {
      this.form.get('idUsuario')?.setValue(this.usuarioLogado.idUsuario ?? null);
    }

    // Autocomplete pessoa física
    this.pessoaNomeControl.valueChanges.pipe(
      debounceTime(300),
      filter((nome): nome is string => !!nome && nome.length >= 1),
      switchMap(nome => this.pessoaService.buscarPorNome(nome)),
      catchError(() => of([]))
    ).subscribe(pessoas => this.pessoasFiltradas = pessoas);

    // Autocomplete pessoa jurídica
    this.pessoaJuridicaNomeControl.valueChanges.pipe(
      debounceTime(300),
      filter((nome): nome is string => !!nome && nome.length >= 1),
      switchMap(nome => this.pessoaService.buscarPorNomePessoaJuridica(nome)),
      catchError(() => of([]))
    ).subscribe(pessoas => this.pessoasJuridicasFiltradas = pessoas);

    // Autocomplete representante físico
    this.representanteFisicoNomeControl.valueChanges.pipe(
      debounceTime(300),
      filter((nome): nome is string => !!nome && nome.length >= 1),
      switchMap(nome => this.pessoaService.buscarPorNome(nome)),
      catchError(() => of([]))
    ).subscribe(pessoas => this.representanteFisicoFiltradas = pessoas);

    // Autocomplete representante jurídico
    this.representanteJuridicoNomeControl.valueChanges.pipe(
      debounceTime(300),
      filter((nome): nome is string => !!nome && nome.length >= 1),
      switchMap(nome => this.pessoaService.buscarPorNomePessoaJuridica(nome)),
      catchError(() => of([]))
    ).subscribe(pessoas => this.representanteJuridicoFiltradas = pessoas);

    // Autocomplete artigos
    this.artigosNomeControl.valueChanges.pipe(
      debounceTime(300),
      filter((titulo): titulo is string => !!titulo && titulo.length >= 1),
      switchMap(titulo => this.artigoService.buscarPorArtigo(titulo)),
      catchError(() => of([]))
    ).subscribe(artigos => this.artigosFiltrados = artigos);

    // Consulta atendimento
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.carregandoConsulta = false;
      return;
    }

    this.atendimentoService.consultarAtendimentoPorId(id).subscribe({
      next: response => {
        const atendimento = Array.isArray(response) ? response[0] : response;

        console.log('===== DEBUG PRAZO =====');
        console.log('Resposta completa da API:', atendimento);
        console.log('Valor de atendimento.prazo:', atendimento.prazo);

        this.logAtendimento(atendimento);

        // Preenche form
        this.form.patchValue({
          idAtendimento: atendimento.idAtendimento ?? '',
          codigo: atendimento.codigo?.toString() ?? '',
          anoBase: atendimento.anoBase ?? '',
          idControleAtendimento: atendimento.idControleAtendimento ?? '',
          fato: (atendimento.fato || '').replace(/<br\s*\/?>/gi, '\n'),
          protocolo: atendimento.protocolo ?? '',
          idUsuario: atendimento.idUsuario ?? '',
          nomeUsuario: atendimento.nomeUsuario ?? '',
          observacoes: atendimento.observacoes ?? '',
          usuarioCadastro: atendimento.usuarioCadastro ?? '',
          idAtendimentoStatus: atendimento.idAtendimentoStatus ?? '',
          grupoReclamantesAtendimentoSimples: (atendimento.grupoReclamantesAtendimentoSimples ?? []).map((p: any) => ({
            id: p.idPessoa ?? p.id ?? '',
            nome: p.nome
          })),
          grupoRepresentanteAtendimentoFisicoSimples: (atendimento.grupoRepresentanteAtendimentoFisicoSimples ?? []).map((p: any) => ({
            id: p.id ?? '',
            nome: p.nome
          })),
          grupoReclamadasAtendimentoSimples: (atendimento.grupoReclamadasAtendimentoSimples ?? []).map((p: any) => ({
            id: p.idEmpresa ?? p.id ?? '',
            nome: p.nome
          })),
          grupoRepresentanteAtendimentoJuridicaSimples: (atendimento.grupoRepresentanteAtendimentoJuridicaSimples ?? []).map((p: any) => ({
            id: p.idEmpresa ?? p.id ?? '',
            nome: p.nome
          })),
          grupoArtigosSimples: (atendimento.grupoArtigosSimples ?? []).map((a: any) => ({
            idArtigo: a.idArtigo ?? '',
            titulo: a.titulo
          })),
        });

        this.codigo = atendimento.codigo?.toString() ?? '';
        this.anoBase = atendimento.anoBase ?? '';
        this.usuarioCadastro = atendimento.usuario || '';
        this.dataCadastro = atendimento.dataCadastro || '';

        // Preenche Quill editor
        //setTimeout(() => {
        //  if (this.quillEditor && atendimento.fato) {
        //    this.quillEditor.root.innerHTML = atendimento.fato;
        //   }
        // });

        // Atualiza prazo automaticamente
        this.atualizarPrazo(atendimento.prazo);

        this.cd.detectChanges();
        this.carregandoConsulta = false;
      },
      error: err => {
        this.tratarErro(err);
        this.carregandoConsulta = false;
      }
    });
  }

  // Método auxiliar
  atualizarPrazo(prazo: string | Date | null | undefined): void {
    if (!prazo) {
      this.form.get('prazo')?.setValue('');
      this.prazoDescricao = '';
      return;
    }

    const dataPrazo = new Date(prazo); // aceita string ou Date
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    dataPrazo.setHours(0, 0, 0, 0);

    const diffMs = dataPrazo.getTime() - hoje.getTime();
    const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    // Atualiza input e descrição
    this.form.get('prazo')?.setValue(diffDias.toString());

    if (diffDias > 0) {
      this.prazoDescricao = `Faltam ${diffDias} dia${diffDias > 1 ? 's' : ''}`;
    } else if (diffDias === 0) {
      this.prazoDescricao = 'Hoje';
    } else {
      this.prazoDescricao = `Venceu há ${Math.abs(diffDias)} dia${Math.abs(diffDias) > 1 ? 's' : ''}`;
    }
  }

  //ngAfterViewInit(): void {
  //  this.inicializarQuill();
  // }

  //private inicializarQuill(): void {
  //  this.quillEditor = new Quill(this.editorContainer.nativeElement, {
  //    theme: 'snow',
  //    placeholder: 'Digite aqui a descrição...',
  //     modules: { toolbar: ['bold', 'italic', 'underline'] }
  //  });

  // this.quillEditor.on('text-change', () => {
  //   const html = this.quillEditor.root.innerHTML;
  //   this.form.get('fato')?.setValue(html);
  // });
  //}

  onSubmit() {
    this.carregandoCadastro = true;
    this.mensagemErro = [];
    this.mensagemSucesso = [];

    if (this.form.invalid) {
      this.mensagemErro = ['Preencha todos os campos obrigatórios corretamente.'];
      this.carregandoCadastro = false;
      return;
    }

    const fatoFormatado = (this.form.value.fato || '')
      .replace(/\r\n/g, '<br>')
      .replace(/\n/g, '<br>')
      .replace(/\r/g, '<br>');
    const request: EditarAtendimentoRequest = {
      idAtendimento: this.form.value.idAtendimento!,
      idUsuario: this.form.value.idUsuario!,
      fato: fatoFormatado,
      protocolo: this.form.value.protocolo!,
      observacoes: this.form.value.observacoes!,
      prazo: this.form.value.prazo ? Number(this.form.value.prazo) : undefined,
      idAtendimentoStatus: this.form.value.idAtendimentoStatus || undefined,
    };

    this.atendimentoService.editarPorId(request).subscribe({
      next: response => {
        this.mensagemSucesso = [response?.mensagem || 'Atendimento editado com sucesso!'];
        this.form.reset();
        this.form.markAsPristine();
        this.form.markAsUntouched();
        this.carregandoCadastro = false;
        setTimeout(() => this.router.navigate(['/admin/consultar-atendimento']), 2000);
      },
      error: e => {
        this.tratarErro(e);
        this.carregandoCadastro = false;
      }
    });
  }

  private tratarErro(erro: any) {
    this.mensagemErro = ['Ocorreu um erro ao carregar/editar o atendimento.'];
    console.error(erro);
  }

  abrirModalHistorico(): void {
    const idAtendimento = this.form.get('idAtendimento')?.value;

    if (!idAtendimento) return;

    this.carregandoCadastro = true;

    this.atendimentoService.consultarHistoricoAtendimento(idAtendimento).subscribe({
      next: response => {
        console.log('Resposta completa da API de histórico:', response); // <-- log completo
        const listaHistoricos = (response as any).historicos || response || [];
        this.historicoAtendimento = listaHistoricos.map((item: any) => {
          return {
            idHistoricoAtendimento: item.idHistoricoAtendimento,
            idAtendimento: item.idAtendimento,
            idUsuario: item.idUsuario,
            dataAlteracao: item.dataAlteracao,
            tipoAlteracao: item.tipoAlteracao,
            observacoes: item.observacoes,
            dadosAntes: item.dadosAntes,
            dadosDepois: item.dadosDepois,
            dadosAntesObj: item.dadosAntes ? JSON.parse(item.dadosAntes) : {},
            dadosDepoisObj: item.dadosDepois ? JSON.parse(item.dadosDepois) : {},
           nomeUsuario: item.usuario?.nomeUsuario ?? item.usuario?.login ?? 'Usuário não informado',
            emailUsuario: item.usuario?.email ?? '',
            prazo: this.form.value.prazo ? Number(this.form.value.prazo) : undefined,
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
  // ===== ADICIONAR/REMOVER ARTIGOS =====
  salvarArtigosAtendimento() {
    const idAtendimento = this.form.get('idAtendimento')?.value;

    if (!idAtendimento) {
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
      this.atendimentoService.adicionarArtigos(idAtendimento, p.idArtigo).pipe(
        catchError(err => {
          this.mensagemErro.push(`O artigo ${p.titulo} já está vinculado.`);
          return of(null);
        })
      )
    );

    forkJoin(chamadas$).subscribe({
      next: () => {
        const atuais: ArtigoSimplesRequest[] = this.form.get('grupoArtigosSimples')?.value ?? [];
        const novos: ArtigoSimplesRequest[] = this.artigosSelecionados.map(p => ({ idArtigo: p.idArtigo, titulo: p.titulo }));
        this.form.get('grupoArtigosSimples')?.setValue([...atuais, ...novos]);
        this.artigosSelecionados = [];
        this.artigosNomeControl.reset();
        this.mostrarSugestoesArtigos = false;
        this.cd.detectChanges();
        this.fecharModalEAtualizar();
      },
      error: err => { this.mensagemErro.push('Erro inesperado ao adicionar representante.'); console.error(err); }
    });
  }

  removerArtigoAtendimento(index: number, idArtigo: string) {
    if (!idArtigo) return;
    const idAtendimento = this.form.get('idAtendimento')?.value;
    if (!idAtendimento) return;

    const titulo = this.grupoArtigosSimples[index]?.titulo ?? 'artigo selecionado';
    if (!confirm(`Tem certeza que deseja desvincular a ${titulo} desse atendimento?`)) return;

    this.atendimentoService.removerArtigos(idArtigo, idAtendimento).subscribe({
      next: res => {
        const lista = [...this.grupoArtigosSimples];
        lista.splice(index, 1);
        this.form.get('grupoArtigosSimples')?.setValue(lista);
        this.mensagemSucesso = [res.mensagem ?? 'Artigo removido com sucesso.'];
        this.cd.detectChanges();
      },
      error: err => { this.mensagemErro = [err.error?.Mensagem ?? 'Erro ao remover reclamante.']; console.error(err); }
    });
  }
  // ===== ADICIONAR/REMOVER RECLAMANTES =====
  salvarReclamantesAtendimento() {
    const idAtendimento = this.form.get('idAtendimento')?.value;

    if (!idAtendimento) {
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
      this.atendimentoService.adicionarReclamante(idAtendimento, p.idPessoa).pipe(
        catchError(err => {
          this.mensagemErro.push(`O reclamante ${p.nome} já está vinculado.`);
          return of(null);
        })
      )
    );

    forkJoin(chamadas$).subscribe({
      next: () => {
        const atuais: PessoaSimplesRequest[] = this.form.get('grupoReclamantesAtendimentoSimples')?.value ?? [];
        const novos: PessoaSimplesRequest[] = this.pessoasSelecionadas.map(p => ({ id: p.idPessoa, nome: p.nome }));
        this.form.get('grupoReclamantesAtendimentoSimples')?.setValue([...atuais, ...novos]);
        this.pessoasSelecionadas = [];
        this.pessoaNomeControl.reset();
        this.mostrarSugestoesPessoaFisica = false;
        this.cd.detectChanges();
        this.fecharModalEAtualizar();
      },
      error: err => { this.mensagemErro.push('Erro inesperado ao adicionar representante.'); console.error(err); }
    });
  }

  removerReclamanteAtendimento(index: number, idReclamante: string) {
    if (!idReclamante) return;
    const idAtendimento = this.form.get('idAtendimento')?.value;
    if (!idAtendimento) return;

    const nome = this.grupoReclamantesAtendimentoSimples[index]?.nome ?? 'pessoa selecionada';
    if (!confirm(`Tem certeza que deseja desvincular a ${nome} desse atendimento?`)) return;

    this.atendimentoService.removerReclamanteAtendimento(idReclamante, idAtendimento).subscribe({
      next: res => {
        const lista = [...this.grupoReclamantesAtendimentoSimples];
        lista.splice(index, 1);
        this.form.get('grupoReclamantesAtendimentoSimples')?.setValue(lista);
        this.mensagemSucesso = [res.mensagem ?? 'Reclamante removido com sucesso.'];
        this.cd.detectChanges();
      },
      error: err => { this.mensagemErro = [err.error?.Mensagem ?? 'Erro ao remover reclamante.']; console.error(err); }
    });
  }


  // ===== ADICIONAR/REMOVER RECLAMADAS =====
  salvarReclamadasAtendimento() {
    const idAtendimento = this.form.get('idAtendimento')?.value;

    if (!idAtendimento) {
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
      this.atendimentoService.adicionarReclamada(idAtendimento, p.idPessoa).pipe(
        catchError(err => {
          this.mensagemErro.push(`A reclamada ${p.nome} já está vinculado.`);
          return of(null);
        })
      )
    );

    forkJoin(chamadas$).subscribe({
      next: () => {
        const atuais: PessoaSimplesRequest[] = this.form.get('grupoReclamadasAtendimentoSimples')?.value ?? [];
        const novos: PessoaSimplesRequest[] = this.pessoasJuridicaSelecionadas.map(p => ({ id: p.idPessoa, nome: p.nome }));
        this.form.get('grupoReclamadasAtendimentoSimples')?.setValue([...atuais, ...novos]);
        this.pessoasJuridicaSelecionadas = [];
        this.pessoaJuridicaNomeControl.reset();
        this.mostrarSugestoesPessoaJuridica = false;
        this.cd.detectChanges();
        this.fecharModalEAtualizar();
      },
      error: err => { this.mensagemErro.push('Erro inesperado ao adicionar representante.'); console.error(err); }
    });
  }

  removerReclamadasAtendimento(index: number, idReclamada: string) {
    if (!idReclamada) return;
    const idAtendimento = this.form.get('idAtendimento')?.value;
    if (!idAtendimento) return;

    const nome = this.grupoReclamadasAtendimentoSimples[index]?.nome ?? 'pessoa selecionada';
    if (!confirm(`Tem certeza que deseja desvincular a ${nome} desse atendimento?`)) return;

    this.atendimentoService.removerclamadaAtendimento(idReclamada, idAtendimento).subscribe({
      next: res => {
        const lista = [...this.grupoReclamadasAtendimentoSimples];
        lista.splice(index, 1);
        this.form.get('grupoReclamadasAtendimentoSimples')?.setValue(lista);
        this.mensagemSucesso = [res.mensagem ?? 'Reclamante removido com sucesso.'];
        this.cd.detectChanges();
      },
      error: err => { this.mensagemErro = [err.error?.Mensagem ?? 'Erro ao remover representante.']; console.error(err); }
    });
  }

  // ===== ADICIONAR/REMOVER REPRESENTENTE FISICO =====
  salvarRepresentanteReclamantesAtendimento() {
    const idAtendimento = this.form.get('idAtendimento')?.value;

    if (!idAtendimento) {
      this.mensagemErro = ['ID do atendimento não informado'];
      return;
    }
    if (this.representanteFisicoSelecionadas.length === 0) {
      this.mensagemErro = ['Nenhum representante selecionado'];
      return;
    }
    this.mensagemErro = [];
    this.mensagemSucesso = [];

    const chamadas$ = this.representanteFisicoSelecionadas.map(p =>
      this.atendimentoService.adicionarRepresentanteReclamante(idAtendimento, p.idPessoa).pipe(
        catchError(err => {
          this.mensagemErro.push(`O reclamante ${p.nome} já está vinculado.`);
          return of(null);
        })
      )
    );

    forkJoin(chamadas$).subscribe({
      next: () => {
        const atuais: PessoaSimplesRequest[] = this.form.get('grupoRepresentanteAtendimentoFisicoSimples')?.value ?? [];
        const novos: PessoaSimplesRequest[] = this.representanteFisicoSelecionadas.map(p => ({ id: p.idPessoa, nome: p.nome }));
        this.form.get('grupoRepresentanteAtendimentoFisicoSimples')?.setValue([...atuais, ...novos]);
        this.representanteFisicoSelecionadas = [];
        this.representanteFisicoNomeControl.reset();
        this.mostrarSugestoesRepresentanteFisico = false;
        this.cd.detectChanges();
        this.fecharModalEAtualizar();
      },
      error: err => { this.mensagemErro.push('Erro inesperado ao adicionar representante.'); console.error(err); }
    });
  }


  removerFisicoAtendimento(index: number, idReclamante: string) {
    if (!idReclamante) return;
    const idAtendimento = this.form.get('idAtendimento')?.value;
    if (!idAtendimento) return;

    const nome = this.grupoRepresentanteAtendimentoFisicoSimples[index]?.nome ?? 'pessoa selecionada';
    if (!confirm(`Tem certeza que deseja desvincular a ${nome} desse atendimento?`)) return;

    this.atendimentoService.removerReclamanteRepresentanteAtendimento(idReclamante, idAtendimento).subscribe({
      next: res => {
        const lista = [...this.grupoRepresentanteAtendimentoFisicoSimples];
        lista.splice(index, 1);
        this.form.get('grupoRepresentanteAtendimentoFisicoSimples')?.setValue(lista);
        this.mensagemSucesso = [res.mensagem ?? 'Representante removido com sucesso.'];
        this.cd.detectChanges();
      },
      error: err => { this.mensagemErro = [err.error?.Mensagem ?? 'Erro ao remover representante.']; console.error(err); }
    });
  }




  // ===== ADICIONAR/REMOVER REPRESENTENTE Juridico =====
  salvarRepresentanteReclamadasAtendimento() {
    const idAtendimento = this.form.get('idAtendimento')?.value;

    if (!idAtendimento) {
      this.mensagemErro = ['ID do atendimento não informado'];
      return;
    }
    if (this.representanteJuridicoSelecionadas.length === 0) {
      this.mensagemErro = ['Nenhum representante selecionado'];
      return;
    }
    this.mensagemErro = [];
    this.mensagemSucesso = [];

    const chamadas$ = this.representanteJuridicoSelecionadas.map(p =>
      this.atendimentoService.adicionarRepresentanteReclamada(idAtendimento, p.idPessoa).pipe(
        catchError(err => {
          this.mensagemErro.push(`O reclamante ${p.nome} já está vinculado.`);
          return of(null);
        })
      )
    );

    forkJoin(chamadas$).subscribe({
      next: () => {
        const atuais: PessoaSimplesRequest[] = this.form.get('grupoRepresentanteAtendimentoJuridicaSimples')?.value ?? [];
        const novos: PessoaSimplesRequest[] = this.representanteJuridicoSelecionadas.map(p => ({ id: p.idPessoa, nome: p.nome }));
        this.form.get('grupoRepresentanteAtendimentoJuridicaSimples')?.setValue([...atuais, ...novos]);
        this.representanteJuridicoSelecionadas = [];
        this.representanteJuridicoNomeControl.reset();
        this.mostrarSugestoesRepresentanteJuridico = false;
        this.cd.detectChanges();
        this.fecharModalEAtualizar();
      },
      error: err => { this.mensagemErro.push('Erro inesperado ao adicionar representante.'); console.error(err); }
    });
  }


  removerJuridicoAtendimento(index: number, idReclamada: string) {
    if (!idReclamada) return;
    const idAtendimento = this.form.get('idAtendimento')?.value;
    if (!idAtendimento) return;

    const nome = this.grupoRepresentanteAtendimentoJuridicaSimples[index]?.nome ?? 'empresa selecionada';
    if (!confirm(`Tem certeza que deseja desvincular a ${nome} desse atendimento?`)) return;

    this.atendimentoService.removerReclamadasRepresentanteAtendimentoJuridico(idReclamada, idAtendimento).subscribe({
      next: res => {
        const lista = [...this.grupoRepresentanteAtendimentoJuridicaSimples];
        lista.splice(index, 1);
        this.form.get('grupoRepresentanteAtendimentoJuridicaSimples')?.setValue(lista);
        this.mensagemSucesso = [res.mensagem ?? 'Representante removido com sucesso.'];
        this.cd.detectChanges();
      },
      error: err => { this.mensagemErro = [err.error?.Mensagem ?? 'Erro ao remover representante.']; console.error(err); }
    });
  }

  // ===== AUTOCOMPLETE =====
  selecionarPessoa(pessoa: ConsultarPessoaResponse) {
    if (this.pessoasSelecionadas.some(p => p.idPessoa === pessoa.idPessoa)) {
      this.mensagemErro = ['Essa pessoa já foi selecionada.'];
      return;
    }
    this.pessoasSelecionadas.push(pessoa);
    this.pessoaNomeControl.reset();
    this.mostrarSugestoesPessoaFisica = false;
  }
  selecionarRepresentanteFisico(pessoa: ConsultarPessoaResponse) {
    if (this.representanteFisicoSelecionadas.some(p => p.idPessoa === pessoa.idPessoa)) {
      this.mensagemErro = ['Essa representante já foi selecionada.'];
      return;
    }
    this.representanteFisicoSelecionadas.push(pessoa);
    this.representanteFisicoNomeControl.reset();
    this.mostrarSugestoesRepresentanteFisico = false;
  }
  selecionarPessoaJuridica(pessoa: ConsultarPessoaResponse) {
    const jaSelecionada = this.pessoasJuridicaSelecionadas.some(p => p.idPessoa === pessoa.idPessoa);
    if (jaSelecionada) {
      this.mensagemErro = ['Essa empresa já foi selecionada.'];
      return;
    }
    this.pessoaJuridicaNomeControl.setValue(pessoa.nome);
    this.pessoasJuridicaSelecionadas.push(pessoa);
    this.form.get('idEmpresa')?.setValue(pessoa.idPessoa);
    this.pessoaJuridicaNomeControl.reset();
    this.mostrarSugestoesPessoaJuridica = false;
  }

  selecionarRepresentanteJuridico(pessoa: ConsultarPessoaResponse) {
    if (this.representanteJuridicoSelecionadas.some(p => p.idPessoa === pessoa.idPessoa)) {
      this.mensagemErro = ['Essa empresa já foi selecionada.'];
      return;
    }

    this.representanteJuridicoSelecionadas.push(pessoa);
    this.representanteJuridicoNomeControl.reset();
    this.mostrarSugestoesRepresentanteJuridico = false;
  }

  selecionarArtigo(artigo: ConsultarArtigoResponse) {
    if (this.artigosSelecionados.some(p => p.idArtigo === artigo.idArtigo)) {
      this.mensagemErro = ['Esse Artigo já foi selecionada.'];
      return;
    }
    this.artigosSelecionados.push(artigo);
    this.artigosNomeControl.reset();
    this.mostrarSugestoesArtigos = false;
  }



  removerPessoaSelecionada(pessoa: ConsultarPessoaResponse) {
    this.pessoasSelecionadas = this.pessoasSelecionadas.filter(p => p.idPessoa !== pessoa.idPessoa);
  }
  removerRepresentanteFisicoSelecionada(pessoa: ConsultarPessoaResponse) {
    this.representanteFisicoSelecionadas = this.representanteFisicoSelecionadas.filter(p => p.idPessoa !== pessoa.idPessoa);
  }
  removerPessoaJuridicaSelecionada(pessoa: ConsultarPessoaResponse) {
    this.pessoasJuridicaSelecionadas = this.pessoasJuridicaSelecionadas.filter(p => p.idPessoa !== pessoa.idPessoa);
  }
  removerRepresentanteJuridicoSelecionada(pessoa: ConsultarPessoaResponse) {
    this.representanteJuridicoSelecionadas = this.representanteJuridicoSelecionadas.filter(p => p.idPessoa !== pessoa.idPessoa);
  }
  removerartigoSelecionada(artigo: ConsultarArtigoResponse) {
    this.artigosSelecionados = this.artigosSelecionados.filter(p => p.idArtigo !== artigo.idArtigo);
  }
  // ===== UTIL =====
  private converterHtmlParaTagsBasicas(html: string): string {
    if (!html) return '';
    return html
      .replace(/<strong>/g, '<b>').replace(/<\/strong>/g, '</b>')
      .replace(/<em>/g, '<i>').replace(/<\/em>/g, '</i>')
      .replace(/<span[^>]*>/g, '').replace(/<\/span>/g, '')
      .replace(/<h[1-6][^>]*>/gi, '<b>').replace(/<\/h[1-6]>/gi, '</b><br><br>')
      .replace(/<div[^>]*>/gi, '').replace(/<\/div>/gi, '<br>')
      .replace(/<p>/gi, '').replace(/<\/p>/gi, '<br><br>')
      .replace(/<br\s*\/?>/gi, '<br>')
      .replace(/&nbsp;/gi, ' ')
      .replace(/\n/g, '').replace(/\r/g, '')
      .replace(/(<br>\s*){3,}/g, '<br><br>')
      .trim();
  }

  ocultarSugestoesComDelay() {
    setTimeout(() => this.mostrarSugestoesPessoaFisica = false, 200);
  }
  ocultarSugestoesComDelayRepresentanteFisico() {
    setTimeout(() => this.mostrarSugestoesRepresentanteFisico = false, 200);
  }
  ocultarSugestoesComDelayPessoaJuridica() {
    setTimeout(() => this.mostrarSugestoesPessoaJuridica = false, 200);
  }
  ocultarSugestoesComDelaRepresentanteJuridico() {
    setTimeout(() => this.mostrarSugestoesRepresentanteJuridico = false, 200);
  }
  ocultarSugestoesComDelaArtigos() {
    setTimeout(() => this.mostrarSugestoesArtigos = false, 200);
  }

  private logAtendimento(atendimento: any) {
    console.group('Atendimento completo');

    console.log('ID:', atendimento.idAtendimento);
    console.log('Código:', atendimento.codigo);
    console.log('Ano Base:', atendimento.anoBase);
    console.log('Fato:', atendimento.fato);
    console.log('protocolo:', atendimento.protocolo);
    console.log('IdUsuario:', atendimento.idUsuario);

    // Reclamantes
    console.groupCollapsed('Reclamantes');
    (atendimento.grupoReclamantesAtendimentoSimples ?? []).forEach((r: any, i: number) => {
      console.log(`${i + 1}: ID=${r.id}, Nome=${r.nome}`);
    });
    console.groupEnd();

    // Reclamadas
    console.groupCollapsed('Reclamadas');
    (atendimento.grupoReclamadasAtendimentoSimples ?? []).forEach((r: any, i: number) => {
      console.log(`${i + 1}: ID=${r.id}, Nome=${r.nome}`);
    });
    console.groupEnd();

    // Representantes Físicos
    console.groupCollapsed('Representantes Físicos');
    (atendimento.grupoRepresentanteAtendimentoFisicoSimples ?? []).forEach((r: any, i: number) => {
      console.log(`${i + 1}: ID=${r.id}, Nome=${r.nome}`);
    });
    console.groupEnd();

    // Representantes Jurídicos
    console.groupCollapsed('Representantes Jurídicos');
    (atendimento.grupoRepresentanteAtendimentoJuridicaSimples ?? []).forEach((r: any, i: number) => {
      console.log(`${i + 1}: ID=${r.id}, Nome=${r.nome}`);
    });
    console.groupEnd();

    // ARtigos Jurídicos
    console.groupCollapsed('Artigos ');
    (atendimento.grupoArtigosSimples ?? []).forEach((r: any, i: number) => {
      console.log(`${i + 1}: ID=${r.idArtigo}, Titulo=${r.titulo}`);
    });
    console.groupEnd();


  }

  carregarStatusAtendimento(): void {
    this.atendimentoStatus.ConsultarStatusAtendimento().subscribe({
      next: (tipos) => {
        // Remove espaços extras nos nomes
        this.statusAtendimento = tipos.map(s => ({
          idAtendimentoStatus: s.idAtendimentoStatus,
          nomeStatus: (s.nomeStatus ?? '').trim()
        }));

        // Agora atualiza o FormControl para mostrar a opção selecionada
        const valorAtual = this.form.get('idAtendimentoStatus')?.value;
        if (valorAtual) {
          this.form.patchValue({ idAtendimentoStatus: valorAtual });
        }

        // Logs para depuração
        console.log('FormControl Value:', this.form.get('idAtendimentoStatus')?.value);
        console.log('Opções carregadas:', this.statusAtendimento);
      },
      error: () => {
        this.mensagemErro = ['Erro ao carregar os tipos de status.'];
      }
    });
  }

  atualizarCamposVisiveis(valorSelecionado: string): void {
    const statusSelecionadoObj = this.statusAtendimento.find(a => a.idAtendimentoStatus === valorSelecionado);

    const statusEhGUID = valorSelecionado === this.GUID_STATUS_ATENDIMENTO;
    const statusDilacaoPrazo = statusSelecionadoObj?.nomeStatus?.trim().toLowerCase() === 'dilação de prazo';

    this.mostrarCamposExtras = statusEhGUID;
    this.mostrarCamposNovaAudiencia = statusDilacaoPrazo;

    const prazoControl = this.form.get('prazo');

    // Zera os validadores e valores antes de reconfigurar
    prazoControl?.clearValidators();
    if (!this.mostrarCamposExtras && !this.mostrarCamposNovaAudiencia) {
      prazoControl?.setValue(null);
    }

    // Aqui você pode adicionar validadores condicionalmente, se quiser
    if (this.mostrarCamposExtras) {
      // prazoControl?.setValidators([Validators.required]);
    }

    prazoControl?.updateValueAndValidity();
  }
  formatarPrazo(prazo: string | null | undefined): string {
    if (!prazo || prazo === '0001-01-01T00:00:00') {
      return '—';
    }

    return new Date(prazo).toLocaleDateString('pt-BR');
  }
  calcularDiasAtePrazo(prazo: string | Date): string {
    // Força criar a data no UTC para evitar deslocamento de fuso horário
    const dataPrazo = new Date(prazo + 'Z'); // adiciona Z para UTC
    const hoje = new Date();

    hoje.setHours(0, 0, 0, 0);
    dataPrazo.setHours(0, 0, 0, 0);

    const diffMs = dataPrazo.getTime() - hoje.getTime();
    const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDias > 0) {
      return `Faltam ${diffDias} dia${diffDias > 1 ? 's' : ''}`;
    } else if (diffDias === 0) {
      return `O prazo é hoje`;
    } else {
      return `Prazo vencido há ${Math.abs(diffDias)} dia${Math.abs(diffDias) > 1 ? 's' : ''}`;
    }
  }
}
