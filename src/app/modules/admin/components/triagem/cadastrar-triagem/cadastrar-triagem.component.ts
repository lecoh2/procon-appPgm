import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, catchError, filter, of, switchMap } from 'rxjs';
import { TriagemService } from '../../../../../core/services/triagem.service';
import { PessoaService } from '../../../../../core/services/pessoa.service';
import { TipoTriagemService } from '../../../../../core/services/tipo-triagem.service';
import { CadastrarTriagemRequest } from '../../../../../core/models/triagem/cadastrar-triagem.request';
import { ConsultarPessoaResponse } from '../../../../../core/models/pessoa/consultar-pessoa-response';
import { ConsultarTipoTriagemResponse } from '../../../../../core/models/tipo-triagem/consultar-tipo-triagem-response';
import { AutenticarUsuarioResponse } from '../../../../../core/models/usuario/autenticar-usuario.response';
import { AuthHelper } from '../../../../../core/helpers/auth.helper';

@Component({
  selector: 'app-cadastrar-triagem',
  standalone: false,
  templateUrl: './cadastrar-triagem.component.html',
  styleUrls: ['./cadastrar-triagem.component.css']
})
export class CadastrarTriagemComponent implements OnInit {

  // Serviços
  private triagemService = inject(TriagemService);
  private pessoaService = inject(PessoaService);
  private tipoTriagemService = inject(TipoTriagemService);
  private builder = inject(FormBuilder);
  private router = inject(Router);
  private authHelper = inject(AuthHelper); // <-- injete aqui
  // Controles de autocomplete
  pessoaNomeControl = new FormControl('');
  pessoaJuridicaNomeControl = new FormControl('');
  mostrarSugestoesPessoaFisica = false;
  mostrarSugestoesPessoaJuridica = false;
  pessoasFiltradas: ConsultarPessoaResponse[] = [];
  pessoasJuridicasFiltradas: ConsultarPessoaResponse[] = [];

  // Dados selecionados
  pessoaSelecionada?: ConsultarPessoaResponse;
  pessoaJuridicaSelecionada?: ConsultarPessoaResponse;
  usuarioLogado?: AutenticarUsuarioResponse | null;
  tiposTriagem: ConsultarTipoTriagemResponse[] = [];

  // Mensagens e carregamento
  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];
  carregando = false;
  reclamante: string = '';
  // Formulário reativo
  form = this.builder.group({
    orientacao: ['', Validators.required],
    idPessoa: ['', Validators.required],
    idEmpresa: ['', Validators.required],
    idUsuario: ['', Validators.required],
    idTipoTriagem: ['', Validators.required],
    reclamante: this.pessoaNomeControl, // ← já define no form
    pessoaJuridicaNome: this.pessoaJuridicaNomeControl // ← idem
  });


  get podeEnviar(): boolean {
    return this.form.valid && !!this.pessoaSelecionada && !!this.pessoaJuridicaSelecionada;
  }


  ngOnInit(): void {
    this.carregando = true;

    // Recupera usuário logado via AuthHelper
    this.usuarioLogado = this.authHelper.get();

    if (this.usuarioLogado) {
      this.form.get('idUsuario')?.setValue(this.usuarioLogado.idUsuario ?? null);
    }


    // Autocomplete: Pessoa Física
    this.pessoaNomeControl.valueChanges.pipe(
      debounceTime(300),
      filter((nome): nome is string => !!nome && nome.length >= 1),
      switchMap(nome => this.pessoaService.buscarPorNome(nome)),
      catchError(() => of([]))
    ).subscribe(pessoas => this.pessoasFiltradas = pessoas);

    // Autocomplete: Pessoa Jurídica
    this.pessoaJuridicaNomeControl.valueChanges.pipe(
      debounceTime(300),
      filter((nome): nome is string => !!nome && nome.length >= 1),
      switchMap(nome => this.pessoaService.buscarPorNomePessoaJuridica(nome)),
      catchError(() => of([]))
    ).subscribe(pessoas => this.pessoasJuridicasFiltradas = pessoas);

    // Tipos de triagem
    this.tipoTriagemService.consultar().subscribe({
      next: tipos => {
        this.tiposTriagem = tipos;
        this.carregando = false;
      },
      error: () => {
        this.mensagemErro = ['Erro ao carregar os tipos de triagem.'];
        this.carregando = false;
      }
    });
  }

  ocultarSugestoesComDelay() {
    setTimeout(() => this.mostrarSugestoesPessoaFisica = false, 200);
  }

  ocultarSugestoesComDelayPessoaJuridica() {
    setTimeout(() => this.mostrarSugestoesPessoaJuridica = false, 200);
  }

 selecionarPessoa(pessoa: ConsultarPessoaResponse) {
  this.pessoaSelecionada = pessoa;
  this.form.get('idPessoa')?.setValue(pessoa.idPessoa);
  this.pessoaNomeControl.setValue(''); // <-- limpa o campo
  this.pessoasFiltradas = [];          // <-- limpa sugestões
  this.mostrarSugestoesPessoaFisica = false;
}

selecionarPessoaJuridica(pessoa: ConsultarPessoaResponse) {
  this.pessoaJuridicaSelecionada = pessoa;
  this.form.get('idEmpresa')?.setValue(pessoa.idPessoa);
  this.pessoaJuridicaNomeControl.setValue(''); // <-- limpa o campo
  this.pessoasJuridicasFiltradas = [];         // <-- limpa sugestões
  this.mostrarSugestoesPessoaJuridica = false;
}

  onSubmit() {
    this.carregando = true;
    this.mensagemErro = [];
    this.mensagemSucesso = [];
    console.log(this.form.value)
    if (!this.podeEnviar) {
      this.mensagemErro = ['Preencha todos os campos obrigatórios corretamente.'];
      this.carregando = false;
      return;
    }

    const request: CadastrarTriagemRequest = {
      Orientacao: this.form.value.orientacao!,
      IdPessoa: this.form.value.idPessoa!,
      IdEmpresa: this.form.value.idEmpresa!,
      IdUsuario: this.form.value.idUsuario!,
      IdTipoTriagem: this.form.value.idTipoTriagem!,

    };

    this.triagemService.cadastrar(request).subscribe({
      next: (response) => {
        this.form.patchValue({
          orientacao: '',
          idPessoa: '',
          idEmpresa: '',
          idTipoTriagem: '',
          idUsuario: this.usuarioLogado?.idUsuario ?? ''
        });
        this.pessoaNomeControl.setValue('');
        this.pessoaJuridicaNomeControl.setValue('');
        this.pessoaSelecionada = undefined;
        this.pessoaJuridicaSelecionada = undefined;
        this.form.markAsPristine();
        this.form.markAsUntouched();
        this.form.updateValueAndValidity();
        setTimeout(() => {
          this.carregando = false;
          this.mensagemSucesso = [response?.mensagem || 'Triagem cadastrada com sucesso!'];
          this.router.navigate(['/admin/cadastrar-triagem']);
        }, 2000);
      },
      error: (e) => {
        this.tratarErro(e);
        this.carregando = false;
      }
    });
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
}
