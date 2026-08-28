declare var bootstrap: any;
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { PaService } from '../../../../../core/services/pa.service';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthHelper } from '../../../../../core/helpers/auth.helper';
import { Locaiservice } from '../../../../../core/services/locais.service';
import { AutenticarUsuarioResponse } from '../../../../../core/models/usuario/autenticar-usuario.response';
import { ConsultarLocaisResponse } from '../../../../../core/models/locais/consultar-locais-response';
import { CadastrarPaRequest } from '../../../../../core/models/pa/cadastar-pa-request';
import { EditarPaRequest } from '../../../../../core/models/pa/editar-pa-request';
import { ConsultarPaHistoricoResponse } from '../../../../../core/models/pa/consultar-pa-historico-response';

@Component({
  selector: 'app-editar-pa',
  standalone: false,
  templateUrl: './editar-pa.component.html',
  styleUrl: './editar-pa.component.css'
})
export class EditarPaComponent {

  private paService = inject(PaService);
  private builder = inject(FormBuilder);
  private router = inject(Router);
  private authHelper = inject(AuthHelper);
  private locaisService = inject(Locaiservice);
  private route = inject(ActivatedRoute);
  private cd = inject(ChangeDetectorRef);
  usuarioLogado?: AutenticarUsuarioResponse | null;
  locais: ConsultarLocaisResponse[] = [];
  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];
  carregando = false;
  searchInput: string = '';
  historicoPa: ConsultarPaHistoricoResponse[] = [];
  grupoReclamantesAtendimento: string[] = [];
  grupoReclamadasAtendimento: string[] = [];
  grupoRepresentanteAtendimentoFisico: string[] = [];
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
  usuarioNomeAtendimento: string = '';
  dataCadastro: string = '';
  form = this.builder.group({

    idPa: new FormControl('', Validators.required),
    codigo: new FormControl(''),
    paNumero: new FormControl('', Validators.required),
    ano: new FormControl('', Validators.required),
    idLocais: new FormControl('', Validators.required),
    idUsuario: new FormControl('', Validators.required),
    idReclamacao: new FormControl('', Validators.required),
    paCompleto: new FormControl(''),
    observacoes: new FormControl('', Validators.required),

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
    // Captura o ID da rota
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.carregando = false;
      return;
    }
    this.paService.consultarParId(id).subscribe({
      next: response => {
        console.log("Dados recebidos:", response);
        const pa = Array.isArray(response) ? response[0] : response;

        // ✅ Preenche campos do formulário
    const paNumeroStr = pa.paNumero?.toString().padStart(9, '0') ?? '';
const anoStr = pa.ano?.toString() ?? '';

let paCompletoFormatado = '';
if (paNumeroStr && anoStr) {
  paCompletoFormatado =
    `${paNumeroStr.slice(0, 3)}/${paNumeroStr.slice(3, 9)}/${anoStr}`;
}

this.form.patchValue({
  idPa: pa.idPa,
  idReclamacao: pa.idReclamacao,
  idLocais: pa.idLocais,
  idUsuario: pa.idUsuario,
  paNumero: paNumeroStr,
  ano: anoStr,
  paCompleto: paCompletoFormatado
});


        // ✅ Preenche variáveis de cabeçalho (para liberar o form)
        this.codigoReclamacao = pa.codigo || '';
        this.anoBaseReclamacao = pa.anoBase || '';
        this.dataReclamacao = pa.dataReclamacao || '';
        this.usuarioCadastro = pa.usuarioCadastro || '';

        this.codigoAtendimento = pa.codigoAtendimento || '';
        this.anoBaseAtendimento = pa.anoBaseAtendimento || '';
        this.dataAtendimento = pa.dataAtendimento || '';
        this.usuarioNomeAtendimento = pa.usuarioNomeAtendimento || '';

        this.dataCadastro = pa.dataCadastro || '';

        // ✅ Preenche grupos
        this.grupoReclamantesAtendimento = pa.grupoReclamantesAtendimento || [];
        this.grupoRepresentanteAtendimentoFisico = pa.grupoRepresentanteAtendimentoFisico || [];
        this.grupoReclamadasAtendimento = pa.grupoReclamadasAtendimento || [];
        this.grupoRepresentanteAtendimentoJuridica = pa.grupoRepresentanteAtendimentoJuridica || [];

        // Opcional: se tiver artigos ou observações
        this.grupoArtigos = (pa.artigos || []).map((a: any) => a.descricao);

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
    return !!this.form.get('paCompleto')?.valid &&
      !!this.form.get('idLocais')?.valid &&
      !!this.form.get('idUsuario')?.valid &&
      !!this.form.get('idReclamacao')?.valid &&
      !!this.form.get('observacoes')?.valid;
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

    // ✅ Chama o método separado que faz o envio
    this.enviarEdicaoPa();
  }

  private enviarEdicaoPa() {
    const request: EditarPaRequest = {
      idPa: this.form.value.idPa!,
      paNumero: this.form.value.paNumero!,
      ano: this.form.value.ano!,
      idUsuario: this.form.value.idUsuario!,
      idLocais: this.form.value.idLocais!,
      idReclamacao: this.form.value.idReclamacao!,
      observacoes: this.form.value.observacoes!
    };

    this.paService.editarPorId(request).subscribe({
      next: (response) => {
        this.mensagemSucesso = [response?.mensagem || 'Processo Administrativo atualizado com sucesso!'];
        this.carregando = false;
        this.cd.detectChanges();
        setTimeout(() => this.router.navigate(['/admin/consultar-pa']), 3000);
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
  abrirModalHistorico(): void {
    const idPa = this.form.get('idPa')?.value;
    console.log('🟢 abrirModalHistorico() chamado, idPa =', idPa); // 👈 Log inicial

    if (!idPa) {
      console.warn('⚠️ Nenhum idPa encontrado — o modal não será aberto.');
      return;
    }

    this.carregando = true;

    this.paService.consultarHistoricoPa(idPa).subscribe({
      next: (response) => {
        console.log('✅ Resposta bruta do histórico:', response); // 👈 Ver tudo que veio da API

        const listaHistoricos = (response as any).historicos || response || [];

        this.historicoPa = listaHistoricos.map((item: any) => {
          const dadosAntes = item.dadosAntes ? JSON.parse(item.dadosAntes) : {};
          const dadosDepois = item.dadosDepois ? JSON.parse(item.dadosDepois) : {};
          return {
            idHistoricoPa: item.idHistoricoPa,
            idPa: item.idPa,
            idReclamacao: item.idReclamacao,
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

        console.log('📜 Histórico formatado:', this.historicoPa); // 👈 Ver como os dados foram tratados

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
