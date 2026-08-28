import { Component, inject, OnInit } from '@angular/core';
import { PessoaService } from '../../../../../core/services/pessoa.service';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthHelper } from '../../../../../core/helpers/auth.helper';
import { CadastrarPessoaFisicaRequest } from '../../../../../core/models/pessoa/cadastrar-pessoa-fisica-request';
import { SexoService } from '../../../../../core/services/sexo.service';
import { ConsultarSexoResponse } from '../../../../../core/models/sexo/consutar-sexo-response';
import { CepService } from '../../../../../core/services/cep.service';

@Component({
  selector: 'app-cadastrar-pessoa',
  standalone: false,
  templateUrl: './cadastrar-pessoas.component.html',
  styleUrl: './cadastrar-pessoas.component.css'
})
export class CadastrarPessoaComponent implements OnInit {
  private pessoaService = inject(PessoaService);
  private builder = inject(FormBuilder);
  private router = inject(Router);
  private authHelper = inject(AuthHelper);
  private sexoService = inject(SexoService);
  private cepService = inject(CepService);

  tiposSexo: ConsultarSexoResponse[] = [];
  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];
  carregando = false;
  tipoPessoaSelecionado: 'fisica' | 'juridica' = 'fisica';
  temMascaraDupla = true;

  form = this.builder.group({
    nome: ['', Validators.required],
    telefone: ['', Validators.required],
    email: [''],
    idSexo: [''],
    tipo: [''],
    profissao: [''],
    rg: [''],
    expeditor: [''],
    cpf: [''],
    cnpj: [''],
    inscricaoEstadual: [''],
    inscricaoMunicipal: [''],
    logradouro: ['', Validators.required],
    numero: ['', Validators.required],
    complemento: [''],
    bairro: ['', Validators.required],
    localidade: ['', Validators.required],
    uf: ['', Validators.required],
    cep: ['', Validators.required]
  });
Validators: any;

  ngOnInit(): void {
    this.onTipoPessoaChange(this.tipoPessoaSelecionado);

    this.sexoService.consultar().subscribe({
      next: tipos => {
        this.tiposSexo = tipos;
        this.carregando = false;
      },
      error: () => {
        this.mensagemErro = ['Erro ao carregar os tipos de triagem.'];
        this.carregando = false;
      }
    });
  }
  limitarUf(valor: string): string {
    if (!valor) return '';
    valor = valor.replace(/[^a-zA-Z]/g, '').toUpperCase().substring(0, 2);
    return valor;
  }

  onBlurUf(): void {
    const valor = this.form.get('uf')?.value || '';
    const ufLimitada = this.limitarUf(valor);
    this.form.get('uf')?.setValue(ufLimitada);
  }
  buscarCep() {
    this.mensagemErro = [];
    const cep = this.form.get('cep')?.value?.replace(/\D/g, '');

    if (!cep || cep.length !== 8) {
      this.mensagemErro.push('O CEP deve conter 8 dígitos.');
      return;
    }

    this.cepService.buscarCep(cep).subscribe({
      next: (endereco) => {
        if ((endereco as any).erro) {
          this.mensagemErro.push('CEP não encontrado.');
          return;
        }

        this.form.patchValue({
          logradouro: endereco.logradouro,
          bairro: endereco.bairro,
          localidade: endereco.localidade,
          uf: endereco.uf
        });
      },
      error: () => {
        this.mensagemErro.push('Erro ao buscar o CEP. Verifique sua conexão e tente novamente.');
      }
    });
  }

  onTipoPessoaChange(tipo: 'fisica' | 'juridica') {
    this.tipoPessoaSelecionado = tipo;

    if (tipo === 'fisica') {
      this.setRequired('cpf', true);
      this.setRequired('rg', false);
      this.setRequired('expeditor', false);
      this.setRequired('idSexo', true);
      this.setRequired('profissao', true);

      this.setRequired('cnpj', false);
      this.setRequired('inscricaoEstadual', false);
      this.setRequired('inscricaoMunicipal', false);

      this.form.patchValue({
        cnpj: '',
        inscricaoEstadual: '',
        inscricaoMunicipal: ''
      });
    } else {
      this.setRequired('cnpj', true);
      this.setRequired('inscricaoEstadual', false);
      this.setRequired('inscricaoMunicipal', false);

      this.setRequired('cpf', false);
      this.setRequired('rg', false);
      this.setRequired('expeditor', false);
      this.setRequired('idSexo', false);
      this.setRequired('profissao', false);

      this.form.patchValue({
        cpf: '',
        rg: '',
        expeditor: '',
        idSexo: '',
        profissao: ''
      });
    }

    this.form.updateValueAndValidity();
  }

  private setRequired(campo: string, required: boolean) {
    const control = this.form.get(campo);
    if (!control) return;

    if (required) {
      control.setValidators(Validators.required);
    } else {
      control.clearValidators();
    }

    control.updateValueAndValidity();
  }

  onSubmit() {
    console.log('onSubmit chamado, tipoPessoaSelecionado:', this.tipoPessoaSelecionado);
    this.mensagemErro = [];
    this.mensagemSucesso = [];

    if (this.form.invalid) {
      this.form.markAllAsTouched(); // exibe erros se existir
      this.carregando = false;
      return;
    }
    // Função para preencher campos vazios opcionais com "NADA_CONSTA"
    const preencherNadaConsta = (campo: any) => {
      return campo === null || campo === undefined || campo === '' ? 'NADA CONSTA' : campo;
    };
    this.carregando = true;
    console.log('tipoPessoaSelecionado:', this.tipoPessoaSelecionado);
    if (this.tipoPessoaSelecionado === 'fisica') {
      const request: CadastrarPessoaFisicaRequest = {
        nome: this.form.value.nome!,
        profissao: preencherNadaConsta(this.form.value.profissao),
        rg: preencherNadaConsta(this.form.value.rg),
        expeditor: preencherNadaConsta(this.form.value.expeditor),
        cpf: this.form.value.cpf!,
        email: this.form.value.email!,
        idSexo: this.form.value.idSexo!,
        logradouro: this.form.value.logradouro!,
        numero: this.form.value.numero!,
        complemento: this.form.value.complemento!,
        bairro: this.form.value.bairro!,
        localidade: this.form.value.localidade!,
        uf: this.form.value.uf!,
        cep: this.form.value.cep!,
        telefone: this.form.value.telefone!,
      };

      this.pessoaService.cadastrarPessoaFisica(request).subscribe({
        next: (response) => {
          this.form.reset();
          this.mensagemErro = [];
          setTimeout(() => {
            this.carregando = false;
            this.mensagemSucesso = [response?.mensagem];
            this.router.navigate(['/admin/cadastrar-pessoas']);
          }, 2000);
        },
        error: (e) => this.tratarErro(e)
      });

    } else if (this.tipoPessoaSelecionado === 'juridica') {
      const request = {
        nome: this.form.value.nome!,
        telefone: this.form.value.telefone!,
        email: this.form.value.email!,
        cnpj: this.form.value.cnpj!,
        inscricaoEstadual: preencherNadaConsta(this.form.value.inscricaoEstadual),
        inscricaoMunicipal: preencherNadaConsta(this.form.value.inscricaoMunicipal),
        logradouro: this.form.value.logradouro!,
        numero: this.form.value.numero!,
        complemento: this.form.value.complemento!,
        bairro: this.form.value.bairro!,
        localidade: this.form.value.localidade!,
        uf: this.form.value.uf!,
        cep: this.form.value.cep!,
      };

      this.pessoaService.cadastrarPessoaJuridica(request).subscribe({
        next: (response) => {
          this.form.reset();
          this.mensagemErro = [];
          setTimeout(() => {
            this.carregando = false;
            this.mensagemSucesso = [response?.mensagem];
            this.router.navigate(['/admin/cadastrar-pessoas']);
          }, 2000);
        },
        error: (e) => this.tratarErro(e)
      });
    }
  }

  formatarTelefonesEmLinha(valor?: string): string {
    if (!valor) return '';
    return valor
      .split(';')
      .map(tel => {
        const cleaned = tel.replace(/\D/g, '');
        if (cleaned.length === 11) {
          return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (cleaned.length === 10) {
          return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        } else {
          return tel.trim(); // não formata se não tiver 10 ou 11 dígitos
        }
      })
      .join('; ');
  }

  formatarCampoTelefone() {
    const telCtrl = this.form.get('telefone');
    const valor = telCtrl?.value;

    if (!valor) return;

    const telefones = valor.split(';').map(t => t.trim()).filter(t => t);
    //aumenta o quantidade
    if (telefones.length > 3) {
      this.mensagemErro = ['Você só pode informar no máximo três telefones.'];
      // Remove o que foi digitado a mais (opcional)
      telCtrl?.setValue(telefones.slice(0, 2).join('; '));
    } else {
      telCtrl?.setValue(this.formatarTelefonesEmLinha(valor));
    }
  } formatarLimitarTelefones() {
    const controle = this.form.get('telefone');
    if (!controle) return;

    const valor = controle.value;
    if (!valor) return;

    const formatado = this.limitarTelefonesMaximo22Numeros(valor);
    controle.setValue(formatado);
  }

  validarQuantidadeTelefones(valor: string): boolean {
    const telefones = valor.split(';').map(t => t.trim()).filter(t => t);
    //retorno ate 3 numeros
    return telefones.length <= 3;
  }
  limitarSeparadores(event: KeyboardEvent) {
    const input = this.form.get('telefone')?.value || '';
    const quantidadePontoVirgula = (input.match(/;/g) || []).length;

    //aumenta a quantidade de ponto e virgula
    if (event.key === ';' && quantidadePontoVirgula >= 2) {
      event.preventDefault(); // bloqueia a digitação
    }
  } limitarTelefonesMaximo22Numeros(valor: string): string {
    // Extrai apenas os números (ignorando espaços, parênteses, hífens, etc.)
    //aumenta o numero de digitos
    const apenasNumeros = valor.replace(/\D/g, '').substring(0, 33);

    let resultado = '';
    let contador = 0;

    while (contador < apenasNumeros.length) {
      const restante = apenasNumeros.length - contador;

      if (restante >= 11) {
        // Formata como celular com 9 dígitos
        resultado += `(${apenasNumeros.substr(contador, 2)}) ${apenasNumeros.substr(contador + 2, 5)}-${apenasNumeros.substr(contador + 7, 4)}; `;
        contador += 11;
      } else if (restante >= 10) {
        // Formata como fixo com 8 dígitos
        resultado += `(${apenasNumeros.substr(contador, 2)}) ${apenasNumeros.substr(contador + 2, 4)}-${apenasNumeros.substr(contador + 6, 4)}; `;
        contador += 10;
      } else {
        break; // se restarem menos de 10, não tenta formatar
      }
    }

    return resultado.trim().replace(/;$/, ''); // remove o último ";" se necessário
  }

  private tratarErro(e: any) {
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

    this.carregando = false;
  }
}
