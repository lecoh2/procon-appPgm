declare var bootstrap: any;
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { EditarTipoTriagemResponse } from '../../../../../core/models/tipo-triagem/edittar-tipo-triagem.response';
import { TriagemService } from '../../../../../core/services/triagem.service';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConsultarPessoaResponse } from '../../../../../core/models/pessoa/consultar-pessoa-response';
import { AuthHelper } from '../../../../../core/helpers/auth.helper';
import { AutenticarUsuarioResponse } from '../../../../../core/models/usuario/autenticar-usuario.response';
import { ConsultarTriagemResponse } from '../../../../../core/models/triagem/consulta-triagem-response';
import { catchError, debounceTime, filter, of, switchMap } from 'rxjs';
import { TipoTriagemService } from '../../../../../core/services/tipo-triagem.service';
import { PessoaService } from '../../../../../core/services/pessoa.service';
import { ConsultarTipoTriagemResponse } from '../../../../../core/models/tipo-triagem/consultar-tipo-triagem-response';
import { EditarTipoTriagemRequest } from '../../../../../core/models/tipo-triagem/editar-tipo-triagem.request';
import { EditarTriagemRequest } from '../../../../../core/models/triagem/editar-triagem-request';
import { ConsultarHistoricoTriagemResponse } from '../../../../../core/models/triagem/consulta-historico-triagem.response';
import { LogIn } from 'lucide';

@Component({
  selector: 'app-editar-triagem',
  standalone: false,
  templateUrl: './editar-triagem.component.html',
  styleUrl: './editar-triagem.component.css'
})
export class EditarTriagemComponent {

  consulta: EditarTipoTriagemResponse[] = [];
  //injeção de dependencia
  private service = inject(TriagemService);//classe de serviços do tipo triagem
  private builder = inject(FormBuilder)//construtor de formulario
  private router = inject(Router);//navegação de rotas
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private authHelper = inject(AuthHelper); // <-- injete aqui
  private pessoaService = inject(PessoaService);
  // Controles de autocomplete
  pessoaNomeControl = new FormControl('');
  pessoaJuridicaNomeControl = new FormControl('');
  mostrarSugestoesPessoaFisica = false;
  mostrarSugestoesPessoaJuridica = false;
  pessoasFiltradas: ConsultarPessoaResponse[] = [];
  pessoasJuridicasFiltradas: ConsultarPessoaResponse[] = [];
  private tipoTriagemService = inject(TipoTriagemService);
  // Dados selecionados
  pessoaSelecionada?: ConsultarPessoaResponse;
  pessoaJuridicaSelecionada?: ConsultarPessoaResponse;
  usuarioLogado?: AutenticarUsuarioResponse | null;
  tiposTriagem: ConsultarTipoTriagemResponse[] = [];
  historicoTriagem: ConsultarHistoricoTriagemResponse[] = [];
  //atributo
  idTriagem: string = '';
  codigoTriagem: string = '';
  anoBaseTriagem: string = '';
  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];
  carregando = false;
  reclamante: string = '';
  //strutura do formulario
  form = this.builder.group({
    // nomeTipoTriagem: new FormControl('', [Validators.required, Validators.minLength(4)]),
    idTriagem: new FormControl('', [Validators.required]),
    orientacao: new FormControl('', [Validators.required]),
    idPessoa: new FormControl('', [Validators.required]),
    idEmpresa: new FormControl('', [Validators.required]),
    idUsuario: new FormControl('', [Validators.required]),
    idTipoTriagem: new FormControl('', [Validators.required]),
    //idControleTriagem:new FormControle('')
    observacoes: new FormControl('', [Validators.required]),
    reclamante: this.pessoaNomeControl, // ← já define no form
    pessoaJuridicaNome: this.pessoaJuridicaNomeControl // ← idem
  });
  get podeEnviar(): boolean {
    return this.form.valid && !!this.pessoaSelecionada && !!this.pessoaJuridicaSelecionada;
  }
  onSubmit() {
    this.carregando = true;
    this.mensagemErro = [];
    this.mensagemSucesso = [];

    const request: EditarTriagemRequest = {
      idTriagem: this.idTriagem,
      orientacao: this.form.value.orientacao as string,
      idPessoa: this.form.value.idPessoa as string,
      idEmpresa: this.form.value.idEmpresa as string,
      idTipoTriagem: this.form.value.idTipoTriagem as string, // CORRETO
      idUsuario: this.form.value.idUsuario as string,
     // IdConTroleTriagem:this.form.value.idControleTriagem as string,
      observacoes: this.form.value.observacoes as string // <-- NOVO
    };

    this.service.editar(request).subscribe({
      next: (response) => {
        this.form.reset();
        this.mensagemErro = [];

        this.mensagemSucesso = [response?.mensagem ?? 'Triagem atualizado com sucesso.'];

        this.carregando = false; // <-- Mostra a mensagem imediatamente

        // Agora espera 3 segundos COM A MENSAGEM VISÍVEL e só depois redireciona
        setTimeout(() => {
          this.router.navigate(['/admin/consultar-triagem']);
        }, 3000);
      },
      error: (e) => {
        this.mensagemErro = [];
        const errorResponse = e.error;

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

        this.carregando = false;
      }
    });
  }

  ngOnInit(): void {
    this.carregando = true;
    // Recupera usuário logado via AuthHelper
    this.usuarioLogado = this.authHelper.get();

    if (this.usuarioLogado) {
      this.form.get('idUsuario')?.setValue(this.usuarioLogado.idUsuario ?? null);
    }

    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.idTriagem = id;

      this.service.consultarPorId(id).subscribe({
        next: (response) => {
          console.log('Dados recebidos da API:', response);
          this.form.patchValue({
            idTriagem: response.idTriagem,
            orientacao: response.orientacao,
            idPessoa: response.reclamante?.idPessoa,
            idEmpresa: response.empresa?.idPessoa,
            idTipoTriagem: response.tipoTriagem?.idTipoTriagem,

          });

          this.pessoaNomeControl.setValue(response.reclamante?.nome ?? '');
          this.pessoaJuridicaNomeControl.setValue(response.empresa?.nome ?? '');

          this.pessoaSelecionada = {
            idPessoa: response.reclamante?.idPessoa ?? '',
            nome: response.reclamante?.nome ?? '',
            cpf: response.reclamante?.cpf ?? ''
          };

          this.pessoaJuridicaSelecionada = {
            idPessoa: response.empresa?.idPessoa ?? '',
            nome: response.empresa?.nome ?? '',
            cnpj: response.empresa?.cnpj ?? ''
          };

          console.log('Formulário preenchido com:', this.form.value);
          this.carregando = false;
        },
        error: () => {
          this.mensagemErro = ['Erro ao carregar os dados para edição.'];
          this.carregando = false;
        }
      });


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
  }
  carregandoHistorico = false;

  abrirModalHistorico(): void {
    if (!this.idTriagem) return;

    this.carregandoHistorico = true;
    console.log('Carregando histórico para triagem:', this.idTriagem);

    this.service.consultarHistoricoPorId(this.idTriagem).subscribe({
      next: (historico) => {
        console.log('Histórico recebido:', historico);

   this.historicoTriagem = historico.map(item => {
  const dadosAntes = item.dadosAntes ? JSON.parse(item.dadosAntes) : {};
  const dadosDepois = item.dadosDepois ? JSON.parse(item.dadosDepois) : {};

  return {
    IdHistoricoTriagem: item.idHistoricoTriagem,
    IdTriagem: item.idTriagem,
    IdPessoa: item.idPessoa,
    IdEmpresa: item.idEmpresa,
    IdUsuario: item.idUsuario,
    DataAtualizacao: item.dataAtualizacao,
    Orientacao: item.orientacao,
    Observacoes: item.observacoes,
    DadosAntes: item.dadosAntes,
    DadosDepois: item.dadosDepois,
    NomeTipoTriagem: item.nomeTipoTriagem,
    DadosAntesObj: dadosAntes,
    DadosDepoisObj: dadosDepois,

    // Adiciona os dados reais trazidos do backend
    usuarioNome: item.usuario?.login || '',  // <- Aqui está o login correto
    nomeUsuario:item.usuario?.nomeUsuario || '',
    reclamanteNome: item.reclamante?.nome || '',
    reclamanteCpf: item.reclamante?.cpf || '',

    reclamadaNome: item.empresa?.nome || '', 
    reclamadaCnpj: item.empresa?.cnpj || '',
    nomeTipoTriagem: item.tipoTriagem?.nomeTipoTriagem || 'Não informado'
  };
});




        // Extrair dados para o cabeçalho do modal
      if (this.historicoTriagem.length > 0) {
  const controle = this.historicoTriagem[0].DadosDepoisObj?.ControleTriagem;

  this.codigoTriagem = controle?.Codigo ?? '';
  this.anoBaseTriagem = controle?.AnoBase ?? '';
}

        this.carregandoHistorico = false;
      },
      error: (err) => {
        console.error('Erro ao carregar histórico:', err);
        this.mensagemErro.push('Erro ao carregar histórico da triagem.');
        this.carregandoHistorico = false;
      }
    });
  }
  



  formatarObjetoParaTabela(obj: any): { label: string; valor: string }[] {
    if (!obj) return [];

    const camposLegiveis: Record<string, string> = {
      IdTriagem: 'ID da Triagem',
      DataChegada: 'Data de Chegada',
      DataSaida: 'Data de Saída',
      DataAtualizacao: 'Data de Atualização',
      Orientacao: 'Orientação',
      IdControleTriagem: 'ID do Controle de Triagem',
      Codigo: 'Código',
      AnoBase: 'Ano Base',
      IdPessoa: 'ID da Pessoa',
      IdEmpresa: 'ID da Empresa',
      IdUsuario: 'ID do Usuário',
      IdTipoTriagem: 'ID do Tipo de Triagem',
      Reclamante: 'Reclamante',
      Empresa: 'Empresa',
      Usuario: 'Usuário',
      nomeTipoTriagem: 'Tipo de Triagem',
      Observacoes: 'Observações',
      DataCadastro: 'Data de Cadastro',
      cpf: 'CPF',
      cnpj: 'CNPJ',
      nome: 'Nome',
      login: 'Login do Usuário',
    };


    return Object.entries(obj).map(([key, valor]) => {
      let valorFormatado: string;

      if (typeof valor === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(valor)) {
        valorFormatado = new Date(valor).toLocaleString('pt-BR');
      } else if (typeof valor === 'object' && valor !== null) {
        valorFormatado = JSON.stringify(valor, null, 2);
      } else {
        valorFormatado = String(valor); // converte qualquer outro valor para string
      }

      return {
        label: camposLegiveis[key] || key,
        valor: valorFormatado
      };
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
    this.pessoaNomeControl.setValue(pessoa.nome);
    this.form.get('idPessoa')?.setValue(pessoa.idPessoa);
    this.mostrarSugestoesPessoaFisica = false;
  }

  selecionarPessoaJuridica(pessoa: ConsultarPessoaResponse) {
    this.pessoaJuridicaSelecionada = pessoa;
    this.pessoaJuridicaNomeControl.setValue(pessoa.nome);
    this.form.get('idEmpresa')?.setValue(pessoa.idPessoa);
    this.mostrarSugestoesPessoaJuridica = false;
  }
}
