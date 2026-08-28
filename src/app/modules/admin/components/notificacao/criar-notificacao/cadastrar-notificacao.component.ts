import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { NotificacaoService } from '../../../../../core/services/notificacao.service';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthHelper } from '../../../../../core/helpers/auth.helper';
import { AutenticarUsuarioResponse } from '../../../../../core/models/usuario/autenticar-usuario.response';
import { CadastrarNotificacaoRequest } from '../../../../../core/models/notificacao/cadastrar-notificacao-request';
import Quill from 'quill';
import { ReclamacaoService } from '../../../../../core/services/reclamacao.service';
import { AudienciaService } from '../../../../../core/services/audiencia.service';
import { environment } from '../../../../../../environments/environment.development';

@Component({
  selector: 'app-criar-notificacao',
  standalone: false,
  templateUrl: './cadastrar-notificacao.component.html',
  styleUrl: './cadastrar-notificacao.component.css'
})
export class CadastrarNotificacaoComponent {
  // Injeção de dependências
  //ngAfterViewInit(): void {
   // if (this._editorEl) this.inicializarQuill();
  //}
  private _editorEl?: ElementRef;
  private notificacaoService = inject(NotificacaoService);
  private reclamacaoService=inject(AudienciaService);
  private builder = inject(FormBuilder);
  private router = inject(Router);
  private authHelper = inject(AuthHelper);
  pdfGerado = false;
    urlBase = environment.apiProcon;


 
 
  usuarioLogado?: AutenticarUsuarioResponse | null;
  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];
  carregando = false;
  searchInput: string = '';

  grupoReclamantesAtendimento: string[] = [];
  grupoRepresentanteAtendimentoFisico: string[] = [];
  grupoReclamadasAtendimento: string[] = [];
  grupoRepresentanteAtendimentoJuridica: string[] = [];
  grupoArtigos: string[] = [];
  codigoAtendimento: string = '';
  anoBaseAtendimento: string = '';
  codigoReclamacao: string = '';
  codigo?: number;
  anoBase?: string;
  idAtendimento: string = '';
  anoBaseReclamacao: string = '';
  dataReclamacao: string = '';
  dataAtendimento: string = '';
  usuarioCadastro: string = '';
  usuarioAtendimento: string = '';
  dataCadastro: string = '';
  form = this.builder.group({
    numeroProcessoCompleto: ['', Validators.required],
    numeroProcesso: [''],
    anoProcesso: [''],
    idUsuario: [''],
   tipoNotificacao: [null, Validators.required], // certo
    texto: ['', Validators.required],
    idReclamacao: ['']
  });


  ngOnInit(): void {
    this.usuarioLogado = this.authHelper.get();

    if (this.usuarioLogado) {
      this.form.get('idUsuario')?.setValue(this.usuarioLogado.idUsuario ?? null);
    }
  }

  get podeEnviar(): boolean {
    return !!this.form.get('numeroProcessoCompleto')?.valid &&
      !!this.form.get('numeroProcesso')?.valid &&
      !!this.form.get('idUsuario')?.valid &&
      !!this.form.get('tipoNotificacao')?.valid &&
      !!this.form.get('idReclamacao')?.valid &&
      !!this.form.get('texto')?.valid;
  }

  onSubmit() {
    this.carregando = true;
    this.mensagemErro = [];
    this.mensagemSucesso = [];

    const numeroProcessoCompleto = this.form.value.numeroProcessoCompleto;

    if (!numeroProcessoCompleto) {
      this.mensagemErro = ['Informe o número do Processo Administrativo.'];
      this.carregando = false;
      return;
    }

    try {
      const { numeroProcesso, anoProcesso } = this.formatarNumeroEAno(numeroProcessoCompleto);

      // Atualiza valores no form
      this.form.patchValue({ numeroProcesso, anoProcesso });
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

    const request: CadastrarNotificacaoRequest = {
      numeroProcesso: this.form.value.numeroProcesso!,
      anoProcesso: this.form.value.anoProcesso!,
      idUsuario: this.form.value.idUsuario!,
     tipoNotificacao: this.form.value.tipoNotificacao!,
      texto: this.form.value.texto!,
      idReclamacao: this.form.value.idReclamacao!
    };

    this.notificacaoService.cadastrar(request).subscribe({
      next: (response) => {
        this.form.patchValue({
          numeroProcessoCompleto: '',
          numeroProcesso: '',
          anoProcesso: '',
          tipoNotificacao: null,
          idReclamacao: '',
          idUsuario: this.usuarioLogado?.idUsuario ?? ''
        });

      
          this.codigo = response.dados?.codigo
  ? Number(response.dados.codigo)
  : undefined;

      this.anoBase = response.dados?.anoBase;
      this.pdfGerado = true;
          
        
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

  // Função que separa número e ano
  
formatarNumeroEAno(valor: string): {
  formatado: string;
  numeroProcesso: string;
  anoProcesso: string;
} {
  // Remove tudo que não for número
  const valorLimpo = valor.replace(/\D/g, '');

  if (valorLimpo.length < 13) {
    throw new Error('O valor precisa conter 13 dígitos (000/000000/0000).');
  }

  const numeroProcesso = valorLimpo.slice(0, 9); // 000000000
  const anoProcesso = valorLimpo.slice(9, 13);     // 0000

  // Formata como 000/000000/0000
  const formatado = `${numeroProcesso.slice(0, 3)}/${numeroProcesso.slice(3, 9)}/${anoProcesso}`;

  return {
    formatado,
    numeroProcesso,
    anoProcesso
  };
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
      numeroProcessoCompleto: formatado,
      numeroProcesso: paNumero,
      anoProcesso: ano
    },
    { emitEvent: false }
  );
}

 

  onPasteOnlyNumbers(event: ClipboardEvent) {
    const pasted = event.clipboardData?.getData('text') || '';
    if (/\D/.test(pasted)) {
      event.preventDefault(); // impede colar se tiver letras
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


 


  // Opcional: retorna o valor formatado para exibir no HTML
  get numeroProcessoFormatado(): string {
    const numeroProcessoCompleto = this.form.value.numeroProcessoCompleto;
    if (!numeroProcessoCompleto || numeroProcessoCompleto.length <= 4) return '';
    try {
      return this.formatarNumeroEAno(numeroProcessoCompleto).formatado;
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

    this.consultarNotificacao(codigo, anoBase);

    // Limpar o input após a pesquisa
    this.searchInput = '';
  }




  consultarNotificacao(codigo: number, anoBase: string): void {
    this.carregando = true;
    this.reclamacaoService.consultarCadastrarAudiencia(codigo, anoBase).subscribe({
      next: (reclamacao) => {
        console.log('Dados', reclamacao);

        // Dados da reclamação
        this.usuarioCadastro = reclamacao.usuario || '';
        this.form.get('idReclamacao')?.setValue(reclamacao.idReclamacao ?? null);

        // Grupos
        this.grupoReclamantesAtendimento = reclamacao.grupoReclamantesAtendimento || [];
        this.grupoReclamadasAtendimento = reclamacao.grupoReclamadasAtendimento || [];
        this.grupoRepresentanteAtendimentoFisico = reclamacao.grupoRepresentanteAtendimentoFisico || [];
        this.grupoRepresentanteAtendimentoJuridica = reclamacao.grupoRepresentanteAtendimentoJuridica || [];
        this.grupoArtigos = reclamacao.grupoArtigos || [];

        // Dados gerais
        this.codigoReclamacao = reclamacao.codigo || '';
        this.anoBaseReclamacao = reclamacao.anoBase || '';
        this.dataReclamacao = reclamacao.dataReclamacao || '';
        this.dataAtendimento = reclamacao.dataAtendimento || '';
        this.codigoAtendimento = reclamacao.codigoAtendimento || '';
        this.anoBaseAtendimento = reclamacao.anoBaseAtendimento || '';
        this.usuarioAtendimento = reclamacao.usuarioAtendimento || '';
        this.dataCadastro = reclamacao.dataReclamacao || '';
        this.idAtendimento = reclamacao.idAtendimento ?? '';

        this.carregando = false;
      },
      error: (error) => {
        this.mensagemErro = ['Erro ao consultar a notificação.'];
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
}

