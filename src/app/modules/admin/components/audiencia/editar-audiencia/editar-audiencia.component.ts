import { Component, inject, ViewChild, OnInit, ElementRef, AfterViewInit, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
//import Quill from 'quill';

import { AudienciaService } from '../../../../../core/services/audiencia.service';
import { AcordoService } from '../../../../../core/services/acordo.service';
import { AuthHelper } from '../../../../../core/helpers/auth.helper';
import { AutenticarUsuarioResponse } from '../../../../../core/models/usuario/autenticar-usuario.response';
import { AcordoResponse } from '../../../../../core/models/acordo/acordo-response';
import { consultarAudienciaResponse } from '../../../../../core/models/audiencia/consultar-audiencia-response';
import { ConsultarHistoricoAudienciaResponse } from '../../../../../core/models/audiencia/consultar-historico-audiencia-response';
import { AtendimentoService } from '../../../../../core/services/atendimento.service';
import { ConsultarAtendimentoResponse } from '../../../../../core/models/atendimento/consultar-atendimento-response';

@Component({
  selector: 'app-editar-audiencia',
  standalone: false,
  templateUrl: './editar-audiencia.component.html',
  styleUrls: ['./editar-audiencia.component.css']
})
export class EditarAudienciaComponent implements OnInit/* AfterViewChecked, AfterViewInit*/ {
  /*ngAfterViewInit(): void {
    this.inicializarQuill();
  }*/
  private audienciaService = inject(AudienciaService);

  private acordoService = inject(AcordoService);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private authHelper = inject(AuthHelper);
  private route = inject(ActivatedRoute);
  private cd = inject(ChangeDetectorRef);
  @ViewChild('editorContainer', { static: false }) editorContainer!: ElementRef;
  //private quillEditor!: Quill;
  //private quillInitialized = false;

  private conteudoFatoTemp: string = '';

  usuarioLogado?: AutenticarUsuarioResponse | null;
  tiposAcordos: AcordoResponse[] = [];
  representantes: string[] = [];
  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];
  carregando = false;
  //atributo
  idAta: string = '';
  codigoAta: string = '';
  anoBaseAta: string = '';
  codigoAtendimento: string = '';
  anoBaseAtendimento: string = '';
  historicoAudiencia: ConsultarHistoricoAudienciaResponse[] = [];
  reclamantes: string[] = [];
  reclamadas: string[] = [];
  cpfsReclamantes: string[] = [];
  cnpjsReclamadas: string[] = [];
  codigo: string = '';
  anoBase: string = '';
  codigoReclamacao: string = '';
  anoBaseReclamacao: string = '';
  usuarioCadastro: string = '';
  dataCadastro: string = '';
  fato: string = '';
  mostrarCamposExtras = false;
  mostrarCamposNovaAudiencia = false;

  // Grupos
  grupoReclamantes: string[] = [];
  grupoReclamadas: string[] = [];
  grupoRepresentanteAtendimentoFisico: string[] = [];
  grupoRepresentanteAtendimentoJuridico: string[] = [];
  grupoArtigos: string[] = [];
  public prazoDescricao: string = '';
  readonly GUID_ACORDO_REALIZADO = 'f8bd5321-5cd2-4e61-9c26-7060d650c0b0';
  readonly GUID_IDSETOR = '298b07b4-057f-41be-8363-59ca913dd45d';

  form = this.formBuilder.group({
    idUsuario: ['', Validators.required],
    idAcordo: ['', Validators.required],
//idAtendimentoStatus:[''],
    idSetores: [this.GUID_IDSETOR, Validators.required],
    idReclamacao: ['', Validators.required],
    prazo: [''],       // opcional
    dias: [''],        // número de dias (string)

    fato: ['', Validators.required],
    dataFinal: [''],
    hora: [''],
    idAta: [''],
    observacoes: new FormControl('', Validators.required)
  });

  searchInput: string = '';

  get podeEnviar(): boolean {
    return this.form.valid;
  }

  ngOnInit(): void {
    this.carregando = true;
    const idAta = this.route.snapshot.paramMap.get('id');
    this.usuarioLogado = this.authHelper.get();

    if (idAta) {
      this.consultarAudienciaPorIdAta(idAta);
    }

    if (this.usuarioLogado) {
      this.form.get('idUsuario')?.setValue(this.usuarioLogado.idUsuario ?? null);
    }

    this.carregarTiposAcordo();

    // Ajustar campos exibidos ao mudar o tipo de acordo
    this.form.get('idAcordo')?.valueChanges.subscribe((valorSelecionado: string | null) => {
      if (valorSelecionado) {
        this.atualizarCamposVisiveis(valorSelecionado);
      }
    });

    // Atualiza a descrição do prazo conforme o número de dias digitado
    this.form.get('prazo')?.valueChanges.subscribe(valor => {
      const dias = Number(valor);
      if (!isNaN(dias)) {
        if (dias === 0) {
          this.prazoDescricao = 'Hoje';
        } else if (dias === 1) {
          this.prazoDescricao = 'Amanhã';
        } else if (dias > 1) {
          this.prazoDescricao = `Faltam ${dias} dias`;
        } else {
          this.prazoDescricao = `Venceu há ${Math.abs(dias)} dias`;
        }
      } else {
        this.prazoDescricao = '';
      }
    });

    // Verifica query params para carregar audiência automaticamente
    this.route.queryParams.subscribe(params => {
      const codigo = params['codigo'];
      const anoBase = params['anoBase'];
      const idAta = params['idAta'];

      if (codigo && anoBase) {
        this.pesquisarPorQueryParams(codigo, anoBase);
      } else if (idAta) {
        this.consultarAudienciaPorIdAta(idAta);
      }
    });
  }




  /*ngAfterViewChecked(): void {
    if (this.editorContainer && !this.quillInitialized) {
      this.inicializarQuill();
      this.quillInitialized = true;

      // Preenche fato atrasado (se já tiver carregado)
      if (this.conteudoFatoTemp) {
        this.quillEditor.root.innerHTML = this.conteudoFatoTemp;
        this.form.get('fato')?.setValue(this.conteudoFatoTemp);
        this.conteudoFatoTemp = '';
      }
    }
  }*/
  carregarTiposAcordo(): void {
    this.acordoService.consultar().subscribe({
      next: (tipos) => {
        this.tiposAcordos = tipos;
        this.carregando = false;
      },
      error: () => {
        this.mensagemErro = ['Erro ao carregar os tipos de acordo.'];
        this.carregando = false;
      }
    });
  }

  atualizarCamposVisiveis(valorSelecionado: string): void {
    const acordoRealizadoSelecionado = valorSelecionado === this.GUID_ACORDO_REALIZADO;
    const acordoSelecionadoObj = this.tiposAcordos.find(a => a.idAcordo === valorSelecionado);
    const novaAudienciaSelecionada = acordoSelecionadoObj?.nomeAcordo?.toLowerCase() === 'nova audiência';

    this.mostrarCamposExtras = acordoRealizadoSelecionado;
    this.mostrarCamposNovaAudiencia = novaAudienciaSelecionada;

    // Validadores dinâmicos
    if (this.mostrarCamposExtras) {
      this.form.get('prazo')?.clearValidators();
      this.form.get('dias')?.clearValidators();
    } else {
      this.form.get('prazo')?.clearValidators();
      this.form.get('dias')?.clearValidators();
      this.form.get('prazo')?.setValue(null);
      this.form.get('dias')?.setValue(null);
    }

    if (this.mostrarCamposNovaAudiencia) {
      this.form.get('dataFinal')?.clearValidators();
      this.form.get('hora')?.clearValidators();
    } else {
      this.form.get('dataFinal')?.clearValidators();
      this.form.get('hora')?.clearValidators();
      this.form.get('dataFinal')?.setValue(null);
      this.form.get('hora')?.setValue(null);
    }

    this.form.get('prazo')?.updateValueAndValidity();
    this.form.get('dias')?.updateValueAndValidity();
    this.form.get('dataFinal')?.updateValueAndValidity();
    this.form.get('hora')?.updateValueAndValidity();
  }

  /*inicializarQuill(): void {
    this.quillEditor = new Quill(this.editorContainer.nativeElement, {
      theme: 'snow',
      placeholder: 'Digite aqui a descrição...',
      modules: {
        toolbar: [['bold', 'italic', 'underline']]
      }
    });*/

    /*this.quillEditor.on('text-change', () => {
      const html = this.quillEditor.root.innerHTML;
      this.form.get('fato')?.setValue(html);
    });

    // Preenche o conteúdo pendente do fato se existir
    if (this.conteudoFatoTemp) {
      this.quillEditor.root.innerHTML = this.conteudoFatoTemp;
      this.form.get('fato')?.setValue(this.conteudoFatoTemp);
      this.conteudoFatoTemp = '';
    }
  }*/

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

    this.consultarAudiencia(codigo, anoBase);
  }

  pesquisarPorQueryParams(codigo: string, anoBase: string) {
    const codigoNum = Number(codigo);

    if (!isNaN(codigoNum) && anoBase) {
      this.consultarAudiencia(codigoNum, anoBase);
      this.searchInput = `${codigo}/${anoBase}`; // opcional, atualiza input
    } else {
      this.mensagemErro = ['Parâmetros inválidos na URL.'];
    }
  }
  consultarAudienciaPorIdAta(idAta: string): void {
    this.audienciaService.consultarAudienciaPorIdAta(idAta).subscribe({
      next: (audiencia: consultarAudienciaResponse) => {
        this.usuarioCadastro = audiencia.usuario || '';
        this.codigo = audiencia.codigo || '';
        this.anoBase = audiencia.anoBase || '';
        this.dataCadastro = audiencia.dataCadastro || '';
        this.fato = audiencia.fato || '';
        this.codigoReclamacao = audiencia.codigoReclamacao || '';
        this.anoBaseReclamacao = audiencia.anoBaseReclamacao || '';
        this.codigoAtendimento = audiencia.codigoAtendimento || '',
          this.anoBaseAtendimento = audiencia.anoBaseAtendimento || '',
          this.grupoReclamantes = audiencia.grupoReclamantesAtendimento || [];
        this.grupoRepresentanteAtendimentoFisico = audiencia.grupoRepresentanteAtendimentoFisico || [];
        this.grupoReclamadas = audiencia.grupoReclamadasAtendimento || [];
        this.grupoRepresentanteAtendimentoJuridico = audiencia.grupoRepresentanteAtendimentoJuridico || [];
        this.grupoArtigos = audiencia.grupoArtigos || [];
        this.idAta = idAta; // garante que o id está salvo
        let diffDias = 0;
        
        if (audiencia.prazo) {
          const dataPrazo = new Date(audiencia.prazo);
          const hoje = new Date();
          dataPrazo.setHours(0, 0, 0, 0);
          hoje.setHours(0, 0, 0, 0);
          const diffMs = dataPrazo.getTime() - hoje.getTime();
          diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        }

        this.form.patchValue({
          idAta: audiencia.idAta ?? null,
          idReclamacao: audiencia.idReclamacao ?? null,
          idAcordo: audiencia.idAcordo ?? null,
         // idAtendimentoStatus: audiencia.IdAtendimentoStatus ?? '',
          prazo: diffDias.toString(),
          dias: audiencia.dias !== undefined && audiencia.dias !== null ? audiencia.dias.toString() : '0',
          dataFinal: audiencia.dataFinal ? new Date(audiencia.dataFinal).toISOString().split('T')[0] : null,
          hora: audiencia.hora || '',
          fato: (audiencia.fato || '').replace(/<br\s*\/?>/gi, '\n'),
        });
      /*  if (this.quillEditor) {
          this.quillEditor.root.innerHTML = audiencia.fato || '';
          this.form.get('fato')?.setValue(audiencia.fato || '');
        } else {
          this.conteudoFatoTemp = audiencia.fato || '';
        }*/

        this.carregando = false;
      },
      error: (error) => {
        console.error('Erro consulta por ID:', error);
        this.mensagemErro = ['Erro ao consultar audiência por ID.'];
        this.carregando = false;
      }
    });
  }

  consultarAudiencia(codigo: number, anoBase: string): void {
    this.audienciaService.consultarEditarAudiencia(codigo, anoBase).subscribe({
      next: (audiencia: consultarAudienciaResponse) => {
        this.usuarioCadastro = audiencia.usuario || '';
        this.codigo = audiencia.codigo || '';
        this.anoBase = audiencia.anoBase || '';
        this.dataCadastro = audiencia.dataCadastro || '';
        this.fato = audiencia.fato || '';

        
        this.codigoReclamacao = audiencia.codigoReclamacao || '';
        this.anoBaseReclamacao = audiencia.anoBaseReclamacao || '';



        // Calcula dias faltantes para o prazo
        let diffDias = 0;
        if (audiencia.prazo) {
          const dataPrazo = new Date(audiencia.prazo);
          const hoje = new Date();
          dataPrazo.setHours(0, 0, 0, 0);
          hoje.setHours(0, 0, 0, 0);
          const diffMs = dataPrazo.getTime() - hoje.getTime();
          diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        }
        console.log('Dias até o prazo:', diffDias);

        this.form.patchValue({
          idAta: audiencia.idAta ?? null,
          idReclamacao: audiencia.idReclamacao ?? null,
          idAcordo: audiencia.idAcordo ?? null,
          prazo: diffDias.toString(),
          dias: audiencia.dias !== undefined && audiencia.dias !== null ? audiencia.dias.toString() : '0',
          dataFinal: audiencia.dataFinal ? new Date(audiencia.dataFinal).toISOString().split('T')[0] : null,
          hora: audiencia.hora || '',
          fato: (audiencia.fato || '').replace(/<br\s*\/?>/gi, '\n'),
        });

      /*  if (this.quillEditor) {
          this.quillEditor.root.innerHTML = audiencia.fato || '';
        }*/

        this.carregando = false;
      },
      error: (error) => {
        this.mensagemErro = [];

        if (error.error?.mensagem) {
          this.mensagemErro.push(error.error.mensagem);
        } else if (error.error?.message) {
          this.mensagemErro.push(error.error.message);
        } else {
          this.mensagemErro.push('Erro inesperado ao consultar audiência.');
        }

        this.carregando = false;
      }
    });
  }

  onSubmit() {
    this.carregando = true;
    this.mensagemErro = [];
    this.mensagemSucesso = [];

    //const conteudoFato = this.quillEditor.root.innerHTML;
   // const textoSemHtml = conteudoFato.replace(/<[^>]*>/g, '').trim();

    //if (!textoSemHtml) {
     // this.mensagemErro = ['A descrição do fato não pode estar vazia.'];
    //  this.carregando = false;
    //  return;
   // }

    if (!this.podeEnviar) {
      this.mensagemErro = ['Preencha todos os campos obrigatórios corretamente.'];
      this.carregando = false;
      return;
    }

      const descricaoFormatado = (this.form.value.fato || '')
      .replace(/\r\n/g, '<br>')
      .replace(/\n/g, '<br>')
      .replace(/\r/g, '<br>');
    const idAta = this.form.value.idAta;
    const request = {
      idAta: this.form.value.idAta!,
      idUsuario: this.form.value.idUsuario || undefined,
      idAcordo: this.form.value.idAcordo || undefined,
      idSetores: this.GUID_IDSETOR || undefined,
      idReclamacao: this.form.value.idReclamacao || undefined,
      prazo: this.form.value.prazo ? Number(this.form.value.prazo) : undefined,
      dataFinal: this.form.value.dataFinal ? new Date(this.form.value.dataFinal).toISOString() : undefined,
      hora: this.form.value.hora || undefined,
      dias: this.form.value.dias ? Number(this.form.value.dias) : undefined,
      fato: descricaoFormatado,
      observacoes: this.form.value.observacoes || undefined
    };

    this.audienciaService.editar(request).subscribe({
      next: (response) => {
        this.mensagemSucesso = [response?.mensagem || 'Reclamação Editada com sucesso!'];
        this.carregando = false;
        this.cd.detectChanges();

        setTimeout(() => {
          this.router.navigate(['/admin/consultar-audiencia']);
        }, 3000);
      },
      error: (error) => {
        if (error.error && error.error.mensagem) {
          this.mensagemErro = [error.error.mensagem];
        } else {
          this.mensagemErro = ['Erro inesperado.'];
        }
        this.carregando = false;
      }
    });
  }

  private converterHtmlParaTagsBasicas(html: string): string {
    if (!html) return '';

    return html
      .replace(/<strong>/g, '<b>')
      .replace(/<\/strong>/g, '</b>')
      .replace(/<em>/g, '<i>')
      .replace(/<\/em>/g, '</i>')
      .replace(/<span[^>]*>/g, '')
      .replace(/<\/span>/g, '')
      .replace(/<h[1-6][^>]*>/gi, '<b>')
      .replace(/<\/h[1-6]>/gi, '</b><br><br>')
      .replace(/<div[^>]*>/gi, '')
      .replace(/<\/div>/gi, '<br>')
      .replace(/<p>/gi, '')
      .replace(/<\/p>/gi, '<br><br>')
      .replace(/<br\s*\/?>/gi, '<br>')
      .replace(/&nbsp;/gi, ' ')
      .replace(/\n/g, '')
      .replace(/\r/g, '')
      .replace(/(<br>\s*){3,}/g, '<br><br>')
      .trim();
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
  carregandoHistorico = false;
  abrirModalHistorico(): void {
    if (!this.idAta) return;

    this.carregandoHistorico = true;
    console.log('Carregando histórico da ata:', this.idAta);

    this.audienciaService.consultarHistoricoPorId(this.idAta).subscribe({
      next: (response) => {
        console.log('Histórico da ata recebido:', response);

        const listaHistoricos = (response as any).historicos || response || [];

        this.historicoAudiencia = listaHistoricos.map((item: any) => {
          const dadosAntesObj = item.dadosAntesObj ?? (item.dadosAntes ? JSON.parse(item.dadosAntes) : {});
          const dadosDepoisObj = item.dadosDepoisObj ?? (item.dadosDepois ? JSON.parse(item.dadosDepois) : {});

          // Padronizar Acordos
          if (item.acordos?.nomeAcordo) {
            dadosAntesObj.Acordos ??= {};
            dadosDepoisObj.Acordos ??= {};
            dadosAntesObj.Acordos.NomeAcordo ??= item.acordos.nomeAcordo;
            dadosDepoisObj.Acordos.NomeAcordo ??= item.acordos.nomeAcordo;
          }

          // Padronizar Usuario
          if (item.usuario) {
            dadosAntesObj.Usuario ??= {};
            dadosDepoisObj.Usuario ??= {};
            dadosAntesObj.Usuario.IdUsuario ??= item.usuario.idUsuario;
            dadosDepoisObj.Usuario.IdUsuario ??= item.usuario.idUsuario;
            dadosAntesObj.Usuario.Login ??= item.usuario.login;
            dadosDepoisObj.Usuario.Login ??= item.usuario.login;
            dadosAntesObj.Usuario.NomePessoa ??= item.usuario.nomeUsuario;
            dadosDepoisObj.Usuario.NomePessoa ??= item.usuario.nomeUsuario;
          }

          // Padronizar ControleAta
          if (item.controleAta) {
            dadosAntesObj.ControleAta ??= {};
            dadosDepoisObj.ControleAta ??= {};
            dadosAntesObj.ControleAta.Codigo ??= item.controleAta.codigo;
            dadosDepoisObj.ControleAta.Codigo ??= item.controleAta.codigo;
            dadosAntesObj.ControleAta.AnoBase ??= item.controleAta.anoBase;
            dadosDepoisObj.ControleAta.AnoBase ??= item.controleAta.anoBase;
          }

          return {
            idHistoricoAta: item.idHistoricoAta,
            idAta: item.idAta,
            idUsuario: item.idUsuario,
            dadosAntes: item.dadosAntes,
            dadosDepois: item.dadosDepois,
            dadosAntesObj,
            dadosDepoisObj,
            usuarioNome: item.usuario?.nomeUsuario || '',
            loginUsuario: item.usuario?.login || '',
            codigoAta: item.controleAta?.codigo || '',
            anoBaseAta: item.controleAta?.anoBase || '',
            observacoes: item.observacoes,
            fato: item.fato,
            dataAlteracao: item.dataAlteracao,
            dataAudiencia: item.dataAudiencia,
            hora: item.hora,
            idAcordo: item.acordos?.idAcordo || '',
            nomeAcordo: item.acordos?.nomeAcordo || ''
          };
        });

        this.carregandoHistorico = false;
      },
      error: (err) => {
        console.error('Erro ao carregar histórico da ata:', err);
        this.mensagemErro.push('Erro ao carregar histórico da ata.');
        this.carregandoHistorico = false;
      }
    });
  }


  formatarObjetoParaTabela(obj: any): { label: string; valor: string }[] {
    if (!obj) return [];

    const camposLegiveis: Record<string, string> = {
      idHistoricoAta: 'ID do Histórico da Ata',
      idAta: 'ID da Ata',
      idUsuario: 'ID do Usuário',
      dataAlteracao: 'Data de Alteração',
      tipoAlteracao: 'Tipo de Alteração',
      observacoes: 'Observações',
      codigo: 'Código',
      anoBase: 'Ano Base',
      login: 'Login do Usuário',
      nomeUsuario: 'Nome do Usuário',
      descricao: 'Descrição da Audiência',
      fato: 'Fato da audiência',
      nomeAcordo: 'Acorodo'
    };

    return Object.entries(obj).map(([key, valor]) => {
      let valorFormatado: string;

      if (typeof valor === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(valor)) {
        valorFormatado = new Date(valor).toLocaleString('pt-BR');
      } else if (typeof valor === 'object' && valor !== null) {
        valorFormatado = JSON.stringify(valor, null, 2);
      } else {
        valorFormatado = String(valor);
      }

      return {
        label: camposLegiveis[key] || key,
        valor: valorFormatado
      };
    });
  }
  formatarPrazo(prazo: string | null | undefined): string {
    if (!prazo || prazo === '0001-01-01T00:00:00') {
      return '—';
    }

    return new Date(prazo).toLocaleDateString('pt-BR');
  }


}
