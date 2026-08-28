declare var bootstrap: any;
import { ChangeDetectorRef, ElementRef, Component, inject, ViewChild } from '@angular/core';
import { NotificacaoService } from '../../../../../core/services/notificacao.service';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthHelper } from '../../../../../core/helpers/auth.helper';
import { AutenticarUsuarioResponse } from '../../../../../core/models/usuario/autenticar-usuario.response';
import { EditarNotificacaoRequest } from '../../../../../core/models/notificacao/editar-notificacao-request';
import { ConsultarNotificacaoHistoricoResponse } from '../../../../../core/models/notificacao/consultar-notificacao-historico-response';
import Quill from 'quill';
@Component({
  selector: 'app-editar-notificacao',
  standalone: false,
  templateUrl: './editar-notificacao.component.html',
  styleUrl: './editar-notificacao.component.css'
})
export class EditarNotificacaoComponent {
  // Injeção de dependências
  

  private notificacaoService = inject(NotificacaoService);
  private builder = inject(FormBuilder);
  private router = inject(Router);
  private authHelper = inject(AuthHelper);
  private route = inject(ActivatedRoute);
  private cd = inject(ChangeDetectorRef);


  
  usuarioLogado?: AutenticarUsuarioResponse | null;

  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];
  carregando = false;
  searchInput: string = '';
  historiconotificacao: ConsultarNotificacaoHistoricoResponse[] = [];
  grupoReclamantesAtendimento: string[] = [];
  grupoReclamadasAtendimento: string[] = [];
  grupoRepresentanteAtendimentoFisico: string[] = [];
  grupoRepresentanteAtendimentoJuridica: string[] = [];
  grupoArtigos: string[] = [];
  codigoAtendimento: string = '';
  anoBaseAtendimento: string = '';
  codigoReclamacao: string = '';
  codigo: string='';
  anoBase: string='';
  idAtendimento: string = '';
  anoBaseReclamacao: string = '';
  dataReclamacao: string = '';
  dataAtendimento: string = '';
  usuarioCadastro: string = '';
  usuarioNomeAtendimento: string = '';
  dataCadastro: string = '';
  form = this.builder.group({
    idControleNotificacao: new FormControl('', Validators.required),
    idNotificacao: new FormControl('', Validators.required),
    idUsuario: new FormControl('', Validators.required),
    idReclamacao: new FormControl('', Validators.required),
    numeroProcessoCompleto: ['', Validators.required],
    numeroProcesso: [''],
    anoProcesso: [''],
    tipoNotificacao: [null, Validators.required], // certo
    texto: ['', Validators.required],
    observacoes: new FormControl('', Validators.required),

  });

  ngOnInit(): void {
    this.usuarioLogado = this.authHelper.get();

    if (this.usuarioLogado) {
      this.form.get('idUsuario')?.setValue(this.usuarioLogado.idUsuario ?? null);
    }


    // Captura o ID da rota
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.carregando = false;
      return;
    }
    this.notificacaoService.consultarNotificacaoPorId(id).subscribe({
      next: response => {
        console.log("Dados recebidos:", response);
        const notificacao = Array.isArray(response) ? response[0] : response;
// 🔹 Monta valor bruto (somente números)
const numeroProcessoBruto =
  `${notificacao.numeroProcesso}${notificacao.anoProcesso}`;

// 🔹 Usa a MESMA lógica oficial
const numeroFormatado =
  this.formatarNumeroEAno(numeroProcessoBruto);
        // ✅ Preenche campos do formulário
      this.form.patchValue({
  idNotificacao: notificacao.idNotificacao,
  idControleNotificacao: notificacao.idControleNotificacao,
  idReclamacao: notificacao.idReclamacao,
  tipoNotificacao: notificacao.tipoNotificacao,
  idUsuario: notificacao.idUsuario,

  numeroProcesso: numeroFormatado.numeroProcesso,
  anoProcesso: numeroFormatado.anoProcesso,
  numeroProcessoCompleto: numeroFormatado.formatado,

  texto: notificacao.texto
         // numeroProcessoCompleto: `${notificacao.numeroProcesso}/${notificacao.anoProcesso}`,

        });
        // Exibir o texto da notificação no Quill
        

        // ✅ Preenche variáveis de cabeçalho (para liberar o form)
       this.codigo = notificacao.codigo|| '';
       this.anoBase=notificacao.anoBase || '';
        this.dataReclamacao = notificacao.dataReclamacao || '';
       this.codigoReclamacao = notificacao.codigoReclamacao || '';
        this.anoBaseReclamacao = notificacao.anoBaseReclamacao || '';
        this.usuarioCadastro = notificacao.usuarioCadastro || '';

        this.codigoAtendimento = notificacao.codigoAtendimento || '';
        this.anoBaseAtendimento = notificacao.anoBaseAtendimento || '';
        this.dataAtendimento = notificacao.dataAtendimento || '';
        this.usuarioNomeAtendimento = notificacao.usuarioNomeAtendimento || '';

        this.dataCadastro = notificacao.dataCadastro || '';

        // ✅ Preenche grupos
        this.grupoReclamantesAtendimento = notificacao.grupoReclamantesAtendimento || [];
        this.grupoRepresentanteAtendimentoFisico = notificacao.grupoRepresentanteAtendimentoFisico || [];
        this.grupoReclamadasAtendimento = notificacao.grupoReclamadasAtendimento || [];
        this.grupoRepresentanteAtendimentoJuridica = notificacao.grupoRepresentanteAtendimentoJuridica || [];

        // Opcional: se tiver artigos ou observações
        this.grupoArtigos = (notificacao.artigos || []).map((a: any) => a.descricao);

        console.log("Form preenchido:", this.form.value);
        console.log("Grupos:", {
          grupoReclamantesAtendimento: this.grupoReclamantesAtendimento,
          grupoReclamadasAtendimento: this.grupoReclamadasAtendimento,
          grupoRepresentanteAtendimentoFisico: this.grupoRepresentanteAtendimentoFisico,
          grupoRepresentanteAtendimentoJuridica: this.grupoRepresentanteAtendimentoJuridica
        });

        this.carregando = false;
      },
      error: err => {
        this.tratarErro(err);
        this.carregando = false;
      }
    });


  }
  get podeEnviar(): boolean {
    return !!this.form.get('numeroProcessoCompleto')?.valid &&
      !!this.form.get('numeroProcesso')?.valid &&
      !!this.form.get('idUsuario')?.valid &&
      !!this.form.get('tipoNotificacao')?.valid &&
      !!this.form.get('idReclamacao')?.valid &&
      !!this.form.get('observacoes')?.valid &&
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

    // ✅ Chama o método separado que faz o envio
    this.enviarEdicaoNotificacao();
  }

  private enviarEdicaoNotificacao() {
    const request: EditarNotificacaoRequest = {
      idNotificacao: this.form.value.idNotificacao!,
      idControleNotificacao: this.form.value.idControleNotificacao!,
      numeroProcesso: this.form.value.numeroProcesso!,
      anoProcesso: this.form.value.anoProcesso!,
      idUsuario: this.form.value.idUsuario!,
      tipoNotificacao: this.form.value.tipoNotificacao!,
      idReclamacao: this.form.value.idReclamacao!,
      texto: this.form.value.texto!,
      observacoes: this.form.value.observacoes!
    };
    console.log('📤 Request enviado para o backend:', request);
    this.notificacaoService.editarPorId(request).subscribe({
      next: (response) => {
        this.mensagemSucesso = [response?.mensagem || 'Notificação/Intimação atualizada com sucesso!'];
        this.carregando = false;
        this.cd.detectChanges();
        setTimeout(() => this.router.navigate(['/admin/consultar-notificacao']), 3000);
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
  formatarNumeroEAno2(valor: string): { formatado: string, numeroProcesso: string, anoProcesso: string } {
    const valorLimpo = valor.replace(/\D/g, ''); // remove tudo que não for número

    if (valorLimpo.length <= 4) {
      throw new Error('Valor precisa ter mais de 4 dígitos para conter número e ano.');
    }

    const anoProcesso = valorLimpo.slice(-4);
    const numeroProcesso = valorLimpo.slice(0, -4);
    const formatado = `${numeroProcesso}/${anoProcesso}`;

    return {
      formatado,
      numeroProcesso,
      anoProcesso
    };
  }


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

onPaCompletoInput(event: Event): void {
  const input = event.target as HTMLInputElement;

  // Remove tudo que não for número
  let valor = input.value.replace(/\D/g, '');

  // Limita a 13 dígitos (0000000000000)
  if (valor.length > 13) {
    valor = valor.slice(0, 13);
  }

  let formatado = '';
  let numeroProcesso = '';
  let anoProcesso = '';

  if (valor.length <= 3) {
    // 000
    formatado = valor;
  }
  else if (valor.length <= 9) {
    // 000/000000
    formatado = `${valor.slice(0, 3)}/${valor.slice(3)}`;
  }
  else {
    // 000/000000/0000
    numeroProcesso = valor.slice(0, 9);
    anoProcesso = valor.slice(9, 13);

    formatado =
      `${numeroProcesso.slice(0, 3)}/${numeroProcesso.slice(3, 9)}/${anoProcesso}`;
  }

  // Atualiza visual
    // Atualiza visual
  input.value = formatado;

  // Atualiza form sem loop
  this.form.patchValue(
    {
      numeroProcessoCompleto: formatado,
      numeroProcesso: numeroProcesso,
      anoProcesso: anoProcesso
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
  get NotificacaoFormatado(): string {
    const numeroProcessoCompleto = this.form.value.numeroProcessoCompleto;
    if (!numeroProcessoCompleto || numeroProcessoCompleto.length <= 4) return '';
    try {
      return this.formatarNumeroEAno(numeroProcessoCompleto).formatado;
    } catch {
      return '';
    }
  }
  abrirModalHistorico(): void {
    const idNotificacao = this.form.get('idNotificacao')?.value;
    console.log('🟢 abrirModalHistorico() chamado, idNotificacao =', idNotificacao); // 👈 Log inicial

    if (!idNotificacao) {
      console.warn('⚠️ Nenhum idPa encontrado — o modal não será aberto.');
      return;
    }

    this.carregando = true;

    this.notificacaoService.consultarHistoricoNotificacao(idNotificacao).subscribe({
      next: (response) => {
        console.log('✅ Resposta bruta do histórico:', response); // 👈 Ver tudo que veio da API

        const listaHistoricos = (response as any).historicos || response || [];

        this.historiconotificacao = listaHistoricos.map((item: any) => {
          const dadosAntes = item.dadosAntes ? JSON.parse(item.dadosAntes) : {};
          const dadosDepois = item.dadosDepois ? JSON.parse(item.dadosDepois) : {};
          return {
            idHistoricoNotificacao: item.idHistoricoNotificacao,
            ididNotificaco: item.idPa,
            idReclamacao: item.ididNotificaco,
            idUsuario: item.idUsuario,
            dataAlteracao: item.dataAlteracao,
            tipoAlteracao: item.tipoAlteracao,
            observacoes: item.observacoes,
            dadosAntes: item.dadosAntes,
            dadosDepois: item.dadosDepois,
            dadosAntesObj: dadosAntes,
            dadosDepoisObj: dadosDepois,
            nomeUsuario: item.usuario?.nome ?? '',
            emailUsuario: item.usuario?.email ?? '',
          };
        });

        console.log('📜 Histórico formatado:', this.historiconotificacao); // 👈 Ver como os dados foram tratados

        this.carregando = false;
      },
      error: (err) => {
        console.error('❌ Erro ao carregar histórico da reclamação:', err); // 👈 Log de erro
        this.mensagemErro.push('Erro ao carregar histórico da reclamação.');
        this.carregando = false;
      }
    });
  }

  fecharModal() {
    const modalEl = document.getElementById('taskModal');
    if (modalEl) {
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();
    }
  }

  fecharModalEAtualizar() {
    const modais = document.querySelectorAll('.modal.show');
    modais.forEach(modalEl => {
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();
    });
    setTimeout(() => location.reload(), 300);
  }
}



