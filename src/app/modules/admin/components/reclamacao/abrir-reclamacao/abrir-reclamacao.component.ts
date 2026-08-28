import { Component, inject, ViewChild, OnInit, ElementRef, AfterViewInit } from '@angular/core';
import { ReclamacaoService } from '../../../../../core/services/reclamacao.service';
import { PessoaService } from '../../../../../core/services/pessoa.service';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ConsultarPessoaResponse } from '../../../../../core/models/pessoa/consultar-pessoa-response';
import { AutenticarUsuarioResponse } from '../../../../../core/models/usuario/autenticar-usuario.response';
import { catchError, debounceTime, filter, of, switchMap } from 'rxjs';
import { AuthHelper } from '../../../../../core/helpers/auth.helper';
import { CadastrarReclamacaoRequest } from '../../../../../core/models/reclamacao/cadastar-reclamacao-request';
import { HorariosDisponiveisResponse } from '../../../../../core/models/reclamacao/horarios-disponiveis-response';
import Quill from 'quill';
import { environment } from '../../../../../../environments/environment.development';
import { AtendimentoService } from '../../../../../core/services/atendimento.service';
@Component({
  selector: 'app-abrir-reclamacao',
  standalone: false,
  templateUrl: './abrir-reclamacao.component.html',
  styleUrl: './abrir-reclamacao.component.css'
})
export class AbrirReclamacaoComponent implements OnInit/* AfterViewInit*/ {
  // Injeção de dependências
  /*ngAfterViewInit(): void {
     if (this._editorEl) this.inicializarQuill();
  }*/
  private _editorEl?: ElementRef;

  private reclamacaoService = inject(ReclamacaoService);
  private atendimentoService = inject(AtendimentoService);
  private pessoaService = inject(PessoaService);
  private builder = inject(FormBuilder);
  private router = inject(Router);
  private authHelper = inject(AuthHelper); // <-- injete aqui
  /*@ViewChild('editorContainer', { static: false })
  set editorContainer(el: ElementRef | undefined) {
    this._editorEl = el;
    if (el && !this.quillEditor) {
      this.inicializarQuill();
    }
  }*/
  //private quillEditor!: Quill;
  // Autocomplete
  pessoaNomeControl = new FormControl('');
  pessoaJuridicaNomeControl = new FormControl('');
  representantesControl = new FormControl('');
  mostrarSugestoesPessoaFisica = false;
  mostrarSugestoesPessoaJuridica = false;
  mostrarSugestoesRepresentantes = false;
  pessoasFiltradas: ConsultarPessoaResponse[] = [];
  pessoasJuridicasFiltradas: ConsultarPessoaResponse[] = [];
  representanteFiltradas: ConsultarPessoaResponse[] = [];
  pessoasSelecionadas: ConsultarPessoaResponse[] = [];
  representantesSelecionadas: ConsultarPessoaResponse[] = [];
  pessoasJuridicaSelecionadas: ConsultarPessoaResponse[] = [];
  horariosDisponiveis: HorariosDisponiveisResponse[] = [];
  horariosFormatados: string[] = [];


  grupoReclamantes: string[] = [];
  grupoReclamadas: string[] = [];
  grupoRepresentanteAtendimentoFisico: string[] = [];
  grupoRepresentanteAtendimentoJuridica: string[] = [];
  grupoArtigos: string[] = [];

  codigoAtendimento: string = '';
  anoBaseAtendimento: string = '';
  usuarioCadastro: string = '';
  dataCadastro: string = '';
  //controle de autocomleto


  // Dados selecionados

  usuarioLogado?: AutenticarUsuarioResponse | null;
  // Mensagens e carregamento
  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];
  carregando = false;
  urlBase = environment.apiProcon;
  reclamante: string = '';
  pdfGerado = false;
  codigoReclamacao?: number;
  anoBaseReclamacao?: string;
  // Formulário reativo
  form = this.builder.group({
    idUsuario: [''],
    idPessoa: [''],
    idAtendimento: [''],
    idEmpresa: [''],
    descricao: ['', Validators.required],
    dataAudiencia: ['', Validators.required],
    hora: ['', Validators.required],

    reclamante: this.pessoaNomeControl, // ← já define no form
    pessoaJuridicaNome: this.pessoaJuridicaNomeControl, // ← idem
    representantes: this.representantesControl
  });
  searchInput: string = '';
  get podeEnviar(): boolean {
    return !!this.form.get('idAtendimento')?.valid &&
      !!this.form.get('descricao')?.valid &&
      !!this.form.get('hora')?.valid &&
      !!this.form.get('idUsuario')?.valid &&
      !!this.form.get('dataAudiencia')?.valid;
  }

  /*quillModules = {
    toolbar: [['bold', 'italic', 'underline']]
  };*/
  ngOnInit(): void {
    this.carregando = true;

    // Recupera usuário logado via AuthHelper
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
    ).subscribe(pessoas => {
      this.pessoasFiltradas = pessoas;
    });

    // Autocomplete pessoa jurídica
    this.pessoaJuridicaNomeControl.valueChanges.pipe(
      debounceTime(300),
      filter((nome): nome is string => !!nome && nome.length >= 1),
      switchMap(nome => this.pessoaService.buscarPorNomePessoaJuridica(nome)),
      catchError(() => of([]))
    ).subscribe(pessoas => {
      this.pessoasJuridicasFiltradas = pessoas;
    });
    // Autocomplete representante
    this.representantesControl.valueChanges.pipe(
      debounceTime(300),
      filter((nome): nome is string => !!nome && nome.length >= 1),
      switchMap(nome => this.pessoaService.buscarPorNome(nome)),
      catchError(() => of([]))
    ).subscribe(pessoas => {
      this.representanteFiltradas = pessoas;
    });
    // Carregar horários quando data mudar
    this.form.get('dataAudiencia')?.valueChanges.pipe(
      debounceTime(300),
      filter((valor: string | null): valor is string => !!valor && valor.length === 10)
    ).subscribe(() => this.carregarHorarios());



    this.carregando = false;
  }
  /*private inicializarQuill() {
    if (!this._editorEl || this.quillEditor) return;
  
    this.quillEditor = new Quill(this._editorEl.nativeElement, {
      theme: 'snow',
      placeholder: 'Digite aqui a descrição...',
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline'] // só o básico que você quer
        ]
      }
    });*/

  // Vincula ao form
  /*this.quillEditor.on('text-change', () => {
    const html = this.quillEditor!.root.innerHTML;
    this.form.get('descricao')?.setValue(html);
    this.form.get('descricao')?.markAsDirty();
  });
}*/
  carregarHorarios() {
    const dataStr = this.form.value.dataAudiencia;
    if (!dataStr) return;

    const data = new Date(dataStr);
    if (isNaN(data.getTime())) return;

    const dataIso = data.toISOString().split('T')[0];

    this.reclamacaoService.consultarHorariosDisponiveis(dataIso, dataIso).subscribe({
      next: horarios => {
        this.horariosDisponiveis = horarios;
      },
      error: () => {
        this.mensagemErro = ['Erro ao carregar horários disponíveis.'];
      }
    });
  }



  ocultarSugestoesComDelay() {
    setTimeout(() => this.mostrarSugestoesPessoaFisica = false, 200);
  }
  ocultarSugestoesComDelayPessoaJuridica() {
    setTimeout(() => this.mostrarSugestoesPessoaJuridica = false, 200);
  }
  ocultarSugestoesComDelayRepresentantes() {
    setTimeout(() => this.mostrarSugestoesRepresentantes = false, 200);
  }
  selecionarPessoa(pessoa: ConsultarPessoaResponse) {
    const jaSelecionada = this.pessoasSelecionadas.some(p => p.idPessoa === pessoa.idPessoa);
    if (jaSelecionada) {
      this.mensagemErro = ['Essa pessoa já foi selecionada.'];
      return;
    }
    this.pessoaNomeControl.setValue(pessoa.nome);
    this.pessoasSelecionadas.push(pessoa);
    this.form.get('idPessoa')?.setValue(pessoa.idPessoa);
    this.pessoaNomeControl.reset(); // limpa o input
    this.mostrarSugestoesPessoaFisica = false;
  }
  selecionarRepresentantes(pessoa: ConsultarPessoaResponse) {
    const jaSelecionadaRepresentante = this.pessoasSelecionadas.some(p => p.idPessoa === pessoa.idPessoa);
    if (jaSelecionadaRepresentante) {
      this.mensagemErro = ['Essa represntante já foi selecionado(a).'];
      return;
    }
    this.representantesControl.setValue(pessoa.nome);
    this.representantesSelecionadas.push(pessoa);
    this.form.get('idPessoa')?.setValue(pessoa.idPessoa);
    this.representantesControl.reset(); // limpa o input
    this.mostrarSugestoesRepresentantes = false;
  }
  selecionarPessoaJuridica(pessoa: ConsultarPessoaResponse) {
    const jaSelecionada = this.pessoasJuridicaSelecionadas.some(p => p.idPessoa === pessoa.idPessoa);
    if (jaSelecionada) {
      this.mensagemErro = ['Essa empresa já foi selecionada.'];
      return;
    }
    this.pessoaJuridicaNomeControl.setValue(pessoa.nome);
    this.pessoasJuridicaSelecionadas.push(pessoa);
    this.form.get('idPessoa')?.setValue(pessoa.idPessoa); // aqui está correto usar idEmpresa?
    this.pessoaJuridicaNomeControl.reset(); // limpa o input
    this.mostrarSugestoesPessoaJuridica = false;
  }
  removerPessoaSelecionada(pessoa: ConsultarPessoaResponse) {
    this.pessoasSelecionadas = this.pessoasSelecionadas.filter(p => p.idPessoa !== pessoa.idPessoa);
    if (this.form.get('idPessoa')?.value === pessoa.idPessoa) {
      this.form.get('idPessoa')?.setValue('');
    }
  }
  removerRepresentanteSelecionado(pessoa: ConsultarPessoaResponse) {
    this.representantesSelecionadas = this.representantesSelecionadas.filter(p => p.idPessoa !== pessoa.idPessoa);
    if (this.form.get('idPessoa')?.value === pessoa.idPessoa) {
      this.form.get('idPessoa')?.setValue('');
    }
  }
  removerPessoaJuridicaSelecionada(pessoa: ConsultarPessoaResponse) {
    this.pessoasJuridicaSelecionadas = this.pessoasJuridicaSelecionadas.filter(p => p.idPessoa !== pessoa.idPessoa);
    if (this.form.get('idEmpresa')?.value === pessoa.idPessoa) {
      this.form.get('idEmpresa')?.setValue('');
    }
  }


  formatarHorario(hora: string, data?: string): string {
    const horaFormatada = hora?.slice(0, 5) ?? hora; // Ex: "08:00:00" → "08:00"

    // Usa data fornecida ou pega do formulário
    const dataStr = data ?? this.form.get('dataAudiencia')?.value;
    if (!dataStr) return horaFormatada;

    const dataObj = new Date(`${dataStr}T${hora}`);
    if (isNaN(dataObj.getTime())) return horaFormatada;

    const dia = dataObj.getDate().toString().padStart(2, '0');
    const mes = (dataObj.getMonth() + 1).toString().padStart(2, '0');
    const ano = dataObj.getFullYear();

    return `${horaFormatada} - ${dia}/${mes}/${ano}`;
  }

  onSubmit() {
    this.carregando = true;
    this.mensagemErro = [];
    this.mensagemSucesso = [];
    if (!this.podeEnviar) {
      this.mensagemErro = ['Preencha todos os campos obrigatórios corretamente.'];
      this.carregando = false;
      return;
    }
    const descricaoFormatada = (this.form.value.descricao ?? '').replace(/\r\n|\r|\n/g, '<br>');
    // const descricaoFormatada = this.converterHtmlParaTagsBasicas(this.form.value.descricao!);
    const request: CadastrarReclamacaoRequest = {
      descricao: descricaoFormatada!,
      idUsuario: this.form.value.idUsuario!,
      idAtendimento: this.form.value.idAtendimento!,
      dataAudiencia: this.form.value.dataAudiencia!,
      hora: this.form.value.hora!,

      GrupoReclamantesRequestDto: this.pessoasSelecionadas.map(p => ({
        idReclamante: p.idPessoa
      })),
      GrupoReclamadasRequestDto: this.pessoasJuridicaSelecionadas.map(p => ({
        idReclamada: p.idPessoa
      })),
      representantesRequestDto: this.representantesSelecionadas.map(p => ({
        IdRepresentante: p.idPessoa
      }))
    };

    this.reclamacaoService.cadastrar(request).subscribe({
      next: (response) => {
        this.form.reset();
        this.codigoReclamacao = Number(response?.dados.codigo);
        this.anoBaseReclamacao = response?.dados.anoBase;
        this.pdfGerado = !!this.codigoReclamacao && !!this.anoBaseReclamacao;
        // Limpa os arrays de selecionados
        this.pessoasSelecionadas = [];
        this.pessoasJuridicaSelecionadas = [];
        this.representantesSelecionadas = [];
        this.form.patchValue({
          descricao: '',
          idPessoa: '',
          idAtendimento: '',
          idEmpresa: '',
          dataAudiencia: '',
          hora: '',
          idUsuario: this.usuarioLogado?.idUsuario ?? ''
        });
        this.pessoaNomeControl.setValue('');
        this.pessoaJuridicaNomeControl.setValue('');
        this.representantesControl.setValue('');

        this.form.markAsPristine();
        this.form.markAsUntouched();
        this.form.updateValueAndValidity();

        //this.quillEditor?.setContents([]); // limpa descrição

        setTimeout(() => {
          this.carregando = false;
          this.mensagemSucesso = [response?.mensagem || 'Reclamação cadastrada com sucesso!'];
          this.router.navigate(['/admin/abrir-reclamacao']);
        }, 2000);
      },
      error: (e) => {
        this.tratarErro(e);
        this.carregando = false;
      }
    });
  }

  private converterHtmlParaTagsBasicas(html: string): string {
    if (!html) return '';

    return html
      // <strong> → <b>, <em> → <i>
      .replace(/<strong>/g, '<b>')
      .replace(/<\/strong>/g, '</b>')
      .replace(/<em>/g, '<i>')
      .replace(/<\/em>/g, '</i>')

      // Remove <span ...> e </span>
      .replace(/<span[^>]*>/g, '')
      .replace(/<\/span>/g, '')

      // <h1>-<h6> → <b>...<br><br>
      .replace(/<h[1-6][^>]*>/gi, '<b>')
      .replace(/<\/h[1-6]>/gi, '</b><br><br>')

      // Remove <div>, transforma em <br>
      .replace(/<div[^>]*>/gi, '')
      .replace(/<\/div>/gi, '<br>')

      // Parágrafos → <br><br>
      .replace(/<p>/gi, '')
      .replace(/<\/p>/gi, '<br><br>')

      // Quebras de linha
      .replace(/<br\s*\/?>/gi, '<br>')

      // Espaços não quebráveis
      .replace(/&nbsp;/gi, ' ')

      // Remove quebras de linha invisíveis
      .replace(/\n/g, '')
      .replace(/\r/g, '')

      // Reduz <br> consecutivos
      .replace(/(<br>\s*){3,}/g, '<br><br>')
      .trim();
  }

  private tratarErro(e: any) {
    const errorResponse = e.error;
    this.mensagemErro = [];

    if (errorResponse?.errors) {
      for (const key in errorResponse.errors) {
        if (Array.isArray(errorResponse.errors[key])) {
          this.mensagemErro.push(...errorResponse.errors[key]);
        }
      }
    } else if (errorResponse?.mensagem) {
      this.mensagemErro.push(errorResponse.mensagem);
      if (errorResponse.Detalhes) {
        this.mensagemErro.push(errorResponse.Detalhes);
      }
    } else if (errorResponse?.Message) {
      this.mensagemErro.push(errorResponse.Message);
      if (errorResponse.inner) {
        this.mensagemErro.push(errorResponse.inner);
      }
    } else {
      this.mensagemErro.push('Ocorreu um erro inesperado ao processar sua solicitação.');
    }
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
  }
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

    this.consultarAtendimento(codigo, anoBase);
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
  onPasteOnlyNumbers(event: ClipboardEvent) {
    const pasted = event.clipboardData?.getData('text') || '';
    if (/\D/.test(pasted)) {
      event.preventDefault(); // impede colar se tiver letras
    }
  }
}