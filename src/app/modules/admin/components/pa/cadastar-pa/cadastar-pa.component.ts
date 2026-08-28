import { Component, inject } from '@angular/core';
import { PaService } from '../../../../../core/services/pa.service';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthHelper } from '../../../../../core/helpers/auth.helper';
import { ConsultarLocaisResponse } from '../../../../../core/models/locais/consultar-locais-response';
import { Locaiservice } from '../../../../../core/services/locais.service';
import { CadastrarAtendimentoRequest } from '../../../../../core/models/atendimento/cadastrar-atendimento-request';
import { AutenticarUsuarioResponse } from '../../../../../core/models/usuario/autenticar-usuario.response';
import { CadastrarPaRequest } from '../../../../../core/models/pa/cadastar-pa-request';

@Component({
  selector: 'app-cadastar-pa',
  standalone: false,
  templateUrl: './cadastar-pa.component.html',
  styleUrls: ['./cadastar-pa.component.css'] // corrigido de styleUrl para styleUrls
})
export class CadastarPaComponent {
  private paService = inject(PaService);
  private builder = inject(FormBuilder);
  private router = inject(Router);
  private authHelper = inject(AuthHelper);
  private locaisService = inject(Locaiservice);

  usuarioLogado?: AutenticarUsuarioResponse | null;
  locais: ConsultarLocaisResponse[] = [];
  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];
  carregando = false;
  searchInput: string = '';

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
  form = this.builder.group({
    paCompleto: ['', Validators.required], // único campo para entrada do número + ano
    paNumero: [''],                        // preenchido automaticamente
    ano: [''],                             // preenchido automaticamente
    idUsuario: [''],
    idLocais: ['', Validators.required],
    idReclamacao: ['', Validators.required],
  });
  carregarLocais(): void {
    this.locaisService.consultar().subscribe({
      next: (locais) => {
         console.log('Locais carregados:', locais); // 👈 Aqui
        this.locais = locais;
        this.carregando = false;
      },
      error: () => {
        this.mensagemErro = ['Erro ao carregar os tipos de acordo.'];
        this.carregando = false;
      }
    });
  }
  ngOnInit(): void {
    this.usuarioLogado = this.authHelper.get();

    if (this.usuarioLogado) {
      this.form.get('idUsuario')?.setValue(this.usuarioLogado.idUsuario ?? null);
    }

     this.carregarLocais();
  }

  get podeEnviar(): boolean {
    return !!this.form.get('paCompleto')?.valid &&
      !!this.form.get('idLocais')?.valid &&
      !!this.form.get('idUsuario')?.valid &&
      !!this.form.get('idReclamacao')?.valid;
  }

onSubmit() {
  this.carregando = true;
  this.mensagemErro = [];
  this.mensagemSucesso = [];

  const paCompleto = this.form.value.paCompleto;

  if (!paCompleto) {
    this.mensagemErro = ['Informe o número do Processo Administrativo.'];
    this.carregando = false;
    return;
  }

  try {
    const { paNumero, ano } = this.formatarNumeroEAno(paCompleto);

    // Atualiza valores no form
    this.form.patchValue({ paNumero, ano });
  } catch (error: any) {
    this.mensagemErro = [error.message || 'Erro ao formatar o número/ano.'];
    this.carregando = false;
    return;
  }

  if (!this.podeEnviar) {
    this.mensagemErro = ['Preencha todos os campos obrigatórios corretamente.'];
    this.carregando = false;
    return;
  }

  const request: CadastrarPaRequest = {
    paNumero: this.form.value.paNumero!,
    ano: this.form.value.ano!,
    idUsuario: this.form.value.idUsuario!,
    idLocais: this.form.value.idLocais!,
    idReclamacao: this.form.value.idReclamacao!,
  };

  this.paService.cadastrar(request).subscribe({
    next: (response) => {
      this.form.patchValue({
        paCompleto: '',
        paNumero: '',
        ano: '',
        idLocais: '',
        idReclamacao: '',
        idUsuario: this.usuarioLogado?.idUsuario ?? ''
      });

      setTimeout(() => {
        this.carregando = false;
        this.mensagemSucesso = [response?.mensagem || 'PA cadastrado com sucesso!'];
        this.router.navigate(['/admin/cadastrar-pa']);
      }, 2000);
    },
    error: (e) => {
      this.tratarErro(e);
      this.carregando = false;
    }
  });
}



 private tratarErro(e: any) {
  this.mensagemErro = [];

  if (e?.error?.mensagem) {
    this.mensagemErro.push(e.error.mensagem);
  } 
  else if (e?.error?.detalhes) {
    this.mensagemErro.push(e.error.detalhes);
  } 
  else if (e?.error?.errors) {
    Object.keys(e.error.errors).forEach(key => {
      this.mensagemErro.push(...e.error.errors[key]);
    });
  } 
  else {
    this.mensagemErro.push('Ocorreu um erro inesperado.');
  }
}


  // Função que separa número e ano
/*formatarNumeroEAno(valor: string): { formatado: string, paNumero: string, ano: string } {
  const valorLimpo = valor.replace(/\D/g, ''); // remove tudo que não for número

  if (valorLimpo.length <= 4) {
    throw new Error('Valor precisa ter mais de 4 dígitos para conter número e ano.');
  }

  const ano = valorLimpo.slice(-4);
  const paNumero = valorLimpo.slice(0, -4);
  const formatado = `${paNumero}/${ano}`;

  return {
    formatado,
    paNumero,
    ano
  };
}*/
formatarNumeroEAno(valor: string): {
  formatado: string;
  paNumero: string;
  ano: string;
} {
  // Remove tudo que não for número
  const valorLimpo = valor.replace(/\D/g, '');

  if (valorLimpo.length < 13) {
    throw new Error('O valor precisa conter 13 dígitos (000/000000/0000).');
  }

  const paNumero = valorLimpo.slice(0, 9); // 000000000
  const ano = valorLimpo.slice(9, 13);     // 0000

  // Formata como 000/000000/0000
  const formatado = `${paNumero.slice(0, 3)}/${paNumero.slice(3, 9)}/${ano}`;

  return {
    formatado,
    paNumero,
    ano
  };
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

onPaCompletoInput(event: Event) {
  const input = event.target as HTMLInputElement;

  // Remove tudo que não for número
  let valor = input.value.replace(/\D/g, '');

  // Limita a 13 dígitos (0000000000000)
  if (valor.length > 13) {
    valor = valor.slice(0, 13);
  }

  let formatado = valor;
  let paNumero = '';
  let ano = '';

  if (valor.length > 9) {
    paNumero = valor.slice(0, 9);
    ano = valor.slice(9, 13);

    formatado =
      `${paNumero.slice(0, 3)}/${paNumero.slice(3, 9)}/${ano}`;
  } 
  else if (valor.length > 3) {
    formatado =
      `${valor.slice(0, 3)}/${valor.slice(3)}`;
  }

  // Atualiza input visual
  input.value = formatado;

  // Atualiza formulário sem disparar loop
  this.form.patchValue(
    {
      paCompleto: formatado,
      paNumero: paNumero,
      ano: ano
    },
    { emitEvent: false }
  );
}

onPasteOnlyNumbers(event: ClipboardEvent) {
  const pasted = event.clipboardData?.getData('text') || '';

  if (!/^\d+$/.test(pasted)) {
    event.preventDefault();
  }
}


  // Opcional: retorna o valor formatado para exibir no HTML
  get paFormatado(): string {
    const paCompleto = this.form.value.paCompleto;
    if (!paCompleto || paCompleto.length <= 4) return '';
    try {
      return this.formatarNumeroEAno(paCompleto).formatado;
    } catch {
      return '';
    }
  }
pesquisar(): void {
  const rawValor = this.searchInput.trim();

  if (!rawValor) {
    this.mensagemErro = ['Informe o número e ano da audiência no formato "número/ano"'];
    return;
  }

  let valorFormatado = rawValor;

  if (!rawValor.includes('/')) {
    if (rawValor.length <= 4) {
      this.mensagemErro = ['Formato inválido. Informe número + ano (ex: 26/2025)'];
      return;
    }
    const codigo = rawValor.slice(0, rawValor.length - 4);
    const anoBase = rawValor.slice(rawValor.length - 4);
    valorFormatado = `${codigo}/${anoBase}`;
  }

  const partes = valorFormatado.split('/');
  if (partes.length !== 2) {
    this.mensagemErro = ['Formato inválido. Use "número/ano", por exemplo: 26/2025'];
    return;
  }

  const codigo = Number(partes[0]);
  const anoBase = partes[1];

  if (isNaN(codigo) || !anoBase || anoBase.length !== 4) {
    this.mensagemErro = ['Número ou ano inválido'];
    return;
  }

  this.mensagemErro = [];

  this.consultarPa(codigo, anoBase);

  // Limpar o input após a pesquisa
  this.searchInput = '';
}




    consultarPa(codigo: number, anoBase: string): void {
    this.paService.consultarCadastrarAudiencia(codigo, anoBase).subscribe({
      next: (reclamacao) => {
        console.log('Dados', reclamacao);
        this.usuarioCadastro = reclamacao.usuario || '';
       //this.titulo = reclamacao.titulo || '';
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
       // this.representantes = reclamacao.representantes || [];
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
}
