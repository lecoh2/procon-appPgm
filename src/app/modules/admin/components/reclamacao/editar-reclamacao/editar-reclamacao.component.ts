declare var bootstrap: any;
import { Component, inject, ViewChild, OnInit, AfterViewInit, ChangeDetectorRef, ElementRef } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Quill from 'quill';
import { debounceTime, filter } from 'rxjs';

import { ReclamacaoService } from '../../../../../core/services/reclamacao.service';
import { AtendimentoService } from '../../../../../core/services/atendimento.service';
import { PessoaService } from '../../../../../core/services/pessoa.service';
import { AuthHelper } from '../../../../../core/helpers/auth.helper';

import { AutenticarUsuarioResponse } from '../../../../../core/models/usuario/autenticar-usuario.response';
import { PessoaSimplesRequest } from '../../../../../core/models/pessoa/Pessoa-simples-request';
import { ConsultarPessoaResponse } from '../../../../../core/models/pessoa/consultar-pessoa-response';
import { EditarReclamacaoRequest } from '../../../../../core/models/reclamacao/editar-reclamacao-request';
import { HorariosDisponiveisResponse } from '../../../../../core/models/reclamacao/horarios-disponiveis-response';
import { ConsultarReclamacaoHistoricoResponse } from '../../../../../core/models/reclamacao/consultar-reclamacao-historico-response';
import { ConsultarAtendimentoResponse } from '../../../../../core/models/atendimento/consultar-atendimento-response';

@Component({
  selector: 'app-editar-reclamacao',
  standalone: false,
  templateUrl: './editar-reclamacao.component.html',
  styleUrls: ['./editar-reclamacao.component.css']
})
export class EditarReclamacaoComponent implements OnInit/*, AfterViewInit*/ {

  private reclamacaoService = inject(ReclamacaoService);
  private pessoaService = inject(PessoaService);
  private atendimentoService = inject(AtendimentoService);
  private builder = inject(FormBuilder);
  private router = inject(Router);
  private authHelper = inject(AuthHelper);
  private route = inject(ActivatedRoute);
  private cd = inject(ChangeDetectorRef);

  @ViewChild('editorContainer', { static: false }) editorContainer!: ElementRef;
  private quillEditor!: Quill;

  usuarioLogado?: AutenticarUsuarioResponse | null;
horaOriginalEdicao: string | null = null;

  carregando = false;
  historicoReclamacao: ConsultarReclamacaoHistoricoResponse[] = [];
  horariosDisponiveis: HorariosDisponiveisResponse[] = [];

  // Grupos
  grupoReclamantes: string[] = [];
  grupoReclamadas: string[] = [];
  grupoRepresentanteAtendimentoFisico: string[] = [];
  grupoRepresentanteAtendimentoJuridica: string[] = [];
  grupoArtigos: string[] = [];

  // Mensagens
  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];
  mensagemAviso: string[] = [];

  // Autocomplete
  pessoaNomeControl = new FormControl('');
  pessoaJuridicaNomeControl = new FormControl('');
  mostrarSugestoesPessoaFisica = false;
  mostrarSugestoesPessoaJuridica = false;
  pessoasFiltradas: ConsultarPessoaResponse[] = [];
  pessoasJuridicasFiltradas: ConsultarPessoaResponse[] = [];
  pessoasSelecionadas: ConsultarPessoaResponse[] = [];
  pessoasJuridicaSelecionadas: ConsultarPessoaResponse[] = [];

  codigoAtendimento: string = '';
  anoBaseAtendimento: string = '';
  codigo: string = '';
  anoBase: string = '';
  usuarioCadastro: string = '';
  dataReclamacao: string = '';

  // Formulário
  form = this.builder.group({
    idReclamacao: new FormControl('', Validators.required),
    idAtendimento: new FormControl('', Validators.required),
    codigo: new FormControl(''),
    anoBase: new FormControl(''),
    idControleReclamacao: new FormControl(''),
    descricao: new FormControl('', Validators.required),
    dataAudiencia: new FormControl('', Validators.required),
    hora: new FormControl('', Validators.required),
    idUsuario: new FormControl('', Validators.required),
    usuario: new FormControl(''),
    nomeUsuario: new FormControl(''),
    observacoes: new FormControl('', Validators.required)
  });

  get podeEnviar(): boolean {
    return !!this.form.get('idReclamacao')?.valid &&
      !!this.form.get('descricao')?.valid &&
      !!this.form.get('dataAudiencia')?.valid &&
      !!this.form.get('hora')?.valid &&
      !!this.form.get('idUsuario')?.valid &&
      !!this.form.get('observacoes')?.valid;
  }

  //ngAfterViewInit(): void {
    //this.inicializarQuill();
  //}

  ngOnInit(): void {
    this.carregando = true;

    // Carregar usuário logado
    this.usuarioLogado = this.authHelper.get();
    if (this.usuarioLogado) {
      this.form.get('idUsuario')?.setValue(this.usuarioLogado.idUsuario ?? null);
    }

    // Observador de alteração da data da audiência
    this.form.get('dataAudiencia')?.valueChanges.pipe(
      debounceTime(300),
      filter((valor: string | null): valor is string => !!valor && valor.length === 10)
    ).subscribe(() => this.carregarHorarios());

    // Captura o ID da rota
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.carregando = false;
      return;
    }

    // Consulta a reclamação pelo ID
    this.reclamacaoService.consultarReclamacaoPorId(id).subscribe({
      next: response => {
        console.log("Dados", response);
        const reclamacao = Array.isArray(response) ? response[0] : response;
this.horaOriginalEdicao = reclamacao.hora?.substring(0, 5) ?? null;
        // Atualiza formulário
        this.form.patchValue({
          idReclamacao: reclamacao.idReclamacao,
          idAtendimento: reclamacao.idAtendimento,
          codigo: reclamacao.codigo?.toString() ?? '',
          anoBase: reclamacao.anoBase,
          idControleReclamacao: reclamacao.idControleReclamacao,
          //descricao: reclamacao.descricao,
           descricao: (reclamacao.descricao || '').replace(/<br\s*\/?>/gi, '\n'),
          dataAudiencia: reclamacao.dataAudiencia?.split('T')[0] ?? '',
         // hora: reclamacao.hora?.substring(0, 5) ?? '',
         // hora: this.horaOriginalEdicao,
          usuario: reclamacao.usuario,
          nomeUsuario: reclamacao.nomeUsuario,
          
        });

        // Atualiza variáveis do componente para o template
        this.codigo = reclamacao.codigo?.toString() ?? '';
        this.anoBase = reclamacao.anoBase ?? '';
        this.usuarioCadastro = reclamacao.usuario ?? '';
        this.dataReclamacao = reclamacao.dataReclamacao ?? '';

        // Setar Quill
        setTimeout(() => {
          if (this.quillEditor && reclamacao.descricao) {
            this.quillEditor.root.innerHTML = reclamacao.descricao;
          }
        });

        // Carregar grupos de atendimento
        const idAtendimento = reclamacao.idAtendimento;
        if (idAtendimento) {
          console.log('Chamando consultarGrupoAtendimento com idAtendimento:', idAtendimento);
          this.consultarGrupoAtendimento(idAtendimento);
        } else {
          console.warn('idAtendimento não definido');
        }

        this.form.markAllAsTouched();
        this.form.updateValueAndValidity();
        this.cd.detectChanges();
        this.carregando = false;
      },
      error: err => {
        this.tratarErro(err);
        this.carregando = false;
      }
    });
  }


  /*inicializarQuill() {
    this.quillEditor = new Quill(this.editorContainer.nativeElement, {
      theme: 'snow',
      placeholder: 'Digite aqui a descrição...',
      modules: { toolbar: ['bold', 'italic', 'underline'] }
    });

    this.quillEditor.on('text-change', () => {
      const html = this.quillEditor.root.innerHTML;
      this.form.get('descricao')?.setValue(html);
    });
  }*/

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

  onSubmit() {
    this.carregando = true;
    this.mensagemErro = [];
    this.mensagemSucesso = [];

    if (!this.podeEnviar) {
      this.mensagemErro = ['Preencha todos os campos obrigatórios corretamente.'];
      this.carregando = false;
      return;
    }
 
    this.enviarEdicaoReclamacao();
  }

  private enviarEdicaoReclamacao() {
    const fatoFormatado = (this.form.value.descricao || '')
      .replace(/\r\n/g, '<br>')
      .replace(/\n/g, '<br>')
      .replace(/\r/g, '<br>');
    //const fatoFormatado = this.converterHtmlParaTagsBasicas(this.form.value.descricao!);
    const request: EditarReclamacaoRequest = {
      idReclamacao: this.form.value.idReclamacao!,
      descricao: fatoFormatado,
      idUsuario: this.form.value.idUsuario!,
      dataAudiencia: this.form.value.dataAudiencia!,
      hora: this.form.value.hora!,
      observacoes: this.form.value.observacoes!
    };

    this.reclamacaoService.editar(request).subscribe({
      next: response => {
        this.mensagemSucesso = [response?.mensagem || 'Reclamação editada com sucesso!'];
        this.carregando = false;
        this.cd.detectChanges();

        setTimeout(() => this.router.navigate(['/admin/consultar-reclamacao']), 3000);
      },
      error: e => {
        this.tratarErro(e);
        this.carregando = false;
      }
    });
  }

  consultarGrupoAtendimento(idAtendimento: string): void {
    this.atendimentoService.ConsultarGrupoAtendimentoReclamacao(idAtendimento)
      .subscribe({
        next: (atendimento: ConsultarAtendimentoResponse) => {
          console.log('Chamando consultarGrupoAtendimento com idAtendimento:', atendimento);
          this.codigoAtendimento = atendimento.codigo || '';
          this.anoBaseAtendimento = atendimento.anoBase || '';
          this.grupoReclamantes = atendimento.grupoReclamantesAtendimento || [];
          this.grupoRepresentanteAtendimentoFisico = atendimento.grupoRepresentanteAtendimentoFisico || [];
          this.grupoReclamadas = atendimento.grupoReclamadasAtendimento || [];
          this.grupoRepresentanteAtendimentoJuridica = atendimento.grupoRepresentanteAtendimentoJuridica || [];
          this.grupoArtigos = atendimento.grupoArtigos || [];
          this.cd.detectChanges();
        },
        error: () => {
          this.mensagemErro = ['Erro inesperado ao carregar grupo de atendimento.'];
          this.carregando = false;
        }
      });
  }

  // Outros métodos (formatarHorario, abrirModalHistorico, fecharModal, etc.) podem ser mantidos iguais
  private tratarErro(erro: any) {
    this.mensagemErro = ['Ocorreu um erro ao carregar a reclamação.'];
    console.error(erro);
  }

  get reclamantesSimples(): PessoaSimplesRequest[] {
    return this.form.get('reclamantesSimples')?.value ?? [];
  }

  get reclamadasSimples(): PessoaSimplesRequest[] {
    return this.form.get('reclamadasSimples')?.value ?? [];
  }
  carregarHorarios() {
  const dataStr = this.form.get('dataAudiencia')?.value;
  if (!dataStr) return;

  const dataIso = dataStr.split('T')[0];

  this.reclamacaoService
    .consultarHorariosDisponiveis(dataIso, dataIso)
    .subscribe({
      next: horarios => {

        // Normaliza horas
        let lista = horarios.map(h => ({
          ...h,
          hora: h.hora.substring(0, 5)
        }));

        // 🔥 SE A HORA ORIGINAL NÃO EXISTIR, ADICIONA
        if (
          this.horaOriginalEdicao &&
          !lista.some(h => h.hora === this.horaOriginalEdicao)
        ) {
          lista.unshift({
            hora: this.horaOriginalEdicao,
            dataAudiencia: dataIso
          } as HorariosDisponiveisResponse);
        }

        this.horariosDisponiveis = lista;

        // Seleciona
        this.form.get('hora')?.setValue(this.horaOriginalEdicao);

        this.cd.detectChanges();
      }
    });
}







  trackByHora(index: number, item: HorariosDisponiveisResponse): string {
    return item.hora;
  }

  formatarHorario(hora: string, data?: string): string {
    const horaFormatada = hora?.slice(0, 5) ?? hora;
    const dataStr = data ?? this.form.get('dataAudiencia')?.value;
    if (!dataStr) return horaFormatada;

    const dataObj = new Date(`${dataStr}T${hora}`);
    if (isNaN(dataObj.getTime())) return horaFormatada;

    const dia = dataObj.getDate().toString().padStart(2, '0');
    const mes = (dataObj.getMonth() + 1).toString().padStart(2, '0');
    const ano = dataObj.getFullYear();

    return `${horaFormatada} - ${dia}/${mes}/${ano}`;
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

  abrirModalHistorico(): void {
    const idReclamacao = this.form.get('idReclamacao')?.value;
    if (!idReclamacao) return;

    this.carregando = true;
    this.reclamacaoService.consultarHistoricoReclamacao(idReclamacao).subscribe({
      next: (response) => {
        const listaHistoricos = (response as any).historicos || response || [];

        this.historicoReclamacao = listaHistoricos.map((item: any) => {
          const dadosAntes = item.dadosAntes ? JSON.parse(item.dadosAntes) : {};
          const dadosDepois = item.dadosDepois ? JSON.parse(item.dadosDepois) : {};
          return {
            idHistoricoReclamacao: item.idHistoricoReclamacao,
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

        this.carregando = false;
      },
      error: (err) => {
        this.mensagemErro.push('Erro ao carregar histórico da reclamação.');
        this.carregando = false;
      }
    });
  }

}
