import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';

import { RouterModule } from '@angular/router';

import { FullCalendarModule } from '@fullcalendar/angular';

import { NgxMaskDirective } from 'ngx-mask';

import { AdminRoutingModule } from './admin-routing.module';

import { SharedModule } from '../../shared/shared.module';

import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';

import { PainelPrincipalComponent } from './components/painel-principal/painel-principal.component';

import { CadastrarTipoTriagemComponent } from './components/tipo-triagem/cadastrar-tipo-triagem/cadastrar-tipo-triagem.component';

import { ConsultarTipoTriagemComponent } from './components/tipo-triagem/consultar-tipo-triagem/consultar-tipo-triagem.component';

import { EditarTipoTriagemComponent } from './components/tipo-triagem/editar-tipo-triagem/editar-tipo-triagem.component';

import { CadastrarTriagemComponent } from './components/triagem/cadastrar-triagem/cadastrar-triagem.component';

import { ConsultarTriagemComponent } from './components/triagem/consultar-triagem/consultar-triagem.component';

import { EditarTriagemComponent } from './components/triagem/editar-triagem/editar-triagem.component';

import { CadastrarPessoaComponent } from './components/pessoa/cadastrar-pessoa/cadastrar-pessoas.component';

import { ConsultarPessoasComponent } from './components/pessoa/consultar-pessoas/consultar-pessoas.component';

import { EditarPessoaFisicaComponent } from './components/pessoa/editar-pessoa-fisica/editar-pessoa-fisica.component';

import { EditarPessoaJuridicaComponent } from './components/pessoa/editar-pessoa-juridica/editar-pessoa-juridica.component';

import { AbrirReclamacaoComponent } from './components/reclamacao/abrir-reclamacao/abrir-reclamacao.component';

import { ConsultarReclamacaoComponent } from './components/reclamacao/consultar-reclamacao/consultar-reclamacao.component';

import { EditarReclamacaoComponent } from './components/reclamacao/editar-reclamacao/editar-reclamacao.component';

import { CadastrarAudienciaComponent } from './components/audiencia/cadastrar-audiencia/cadastrar-audiencia.component';

import { VisualizarCalendarioAudienciaComponent } from './components/audiencia/visualizar-calendario-audiencia/visualizar-calendario-audiencia.component';

import { EditarAudienciaComponent } from './components/audiencia/editar-audiencia/editar-audiencia.component';

import { ConsultarAudienciaComponent } from './components/audiencia/consultar-audiencia/consultar-audiencia.component';

import { AbrirAtendimentoComponent } from './components/atendimento/abrir-atendimento/abrir-atendimento.component';

import { ConsultarAtendimentoComponent } from './components/atendimento/consultar-atendimento/consultar-atendimento.component';

import { ConsultarAtendimentoPJComponent } from './components/atendimento/consultar-atendimento-pj/consultar-atendimento-pj.component';

import { EditarAtendimentoComponent } from './components/atendimento/editar-atendimento/editar-atendimento.component';

import { EditarAtendimentoPJComponent } from './components/atendimento/editar-atendimento-pj/editar-atendimento-pj.component';

import { CadastarPaComponent } from './components/pa/cadastar-pa/cadastar-pa.component';

import { ConsultarPaComponent } from './components/pa/consular-pa/consultar-pa.component';

import { EditarPaComponent } from './components/pa/editar-pa/editar-pa.component';

import { CadastrarNotificacaoComponent } from './components/notificacao/criar-notificacao/cadastrar-notificacao.component';

import { ConsultarNotificacaoComponent } from './components/notificacao/consultar-notificacao/consultar-notificacao.component';

import { EditarNotificacaoComponent } from './components/notificacao/editar-notificacao/editar-notificacao.component';

import { CadastrarArtigoComponent } from './components/artigo/cadastrar-artigo/cadastrar-artigo.component';

import { ConsultarArtigoComponent } from './components/artigo/consultar-artigo/consultar-artigo.component';

import { EditarArtigoComponent } from './components/artigo/editar-artigo/editar-artigo.component';

import { CriarUsuarioComponent } from './components/usuario/criar-usuario/criar-usuario.component';

import { ConsultarUsuariosComponent } from './components/usuario/consultar-usuarios/consultar-usuarios.component';

import { EditarUsuarioComponent } from './components/usuario/editar-usuario/editar-usuario.component';

import { PerfilComponent } from './components/usuario/perfil/perfil.component';

import { CadastrarDenunciaComponent } from './components/denuncia/cadastrar-denuncia/cadastrar-denuncia.component';

import { ConsultarDenunciaComponent } from './components/denuncia/consultar-denuncia/consultar-denuncia.component';

import { EditarDenunciaComponent } from './components/denuncia/editar-denuncia/editar-denuncia.component';

import { ConsultasEstagiariosComponent } from './components/estagiarios/consultas-estagiarios/consultas-estagiarios.component';

import { CadastrarTarefaComponent } from './components/tarefa/cadastrar-tarefa/cadastar-tarefa/cadastar-tarefa.component';

import { ConsultarTarefaComponent } from './components/tarefa/consultar-tarefa/consultar-tarefa.component';

import { EditarTarefaComponent } from './components/tarefa/editar-tarefa/editar-tarefa.component';

import { CadastrarEventoComponent } from './components/evento/cadastrar-evento/cadastrar-evento.component';

import { EditarEventoComponent } from './components/evento/editar-evento/editar-evento.component';

import { ConsultarEventoComponent } from './components/evento/consultar-evento/consultar-evento.component';

import { CadastrarResponsaveisComponent } from './components/responsaveis/cadastrar-responsaveis.component';

import { VinculoComponent } from './components/auto-complete-vinculos-proc-caso-atend/vinculo.component';

import { AutocompleteListaTarefasComponent } from './components/auto-complete-lista-tarefas/autocomplete-lista-tarefas.component';

import { CadastrarEtiquetasComponent } from './components/etiquetas/cadastrar-etiquetas/cadastrar-etiquetas.component';

import { AgendaComponent } from './components/gestao-atividades/agenda/agenda.component';

import { GestaoAtividadesComponent } from './components/gestao-atividades/gestao/gestao-atividades.component';

import { CalendarioComponent } from './components/calendario/calendario.component';

import { SiderbarComponent } from './shared/siderbar/siderbar.component';

import { NavbarComponent } from './shared/navbar/navbar.component';

import { FooterComponent } from './shared/footer/footer.component';
import { DragDropModule } from '@angular/cdk/drag-drop';


@NgModule({

  declarations: [

    // =========================
    // LAYOUT
    // =========================

    AdminLayoutComponent,

    SiderbarComponent,

    NavbarComponent,

    FooterComponent,


    // =========================
    // PAINEL PRINCIPAL
    // =========================

    PainelPrincipalComponent,


    // =========================
    // TIPO TRIAGEM
    // =========================

    CadastrarTipoTriagemComponent,

    ConsultarTipoTriagemComponent,

    EditarTipoTriagemComponent,


    // =========================
    // TRIAGEM
    // =========================

    CadastrarTriagemComponent,

    ConsultarTriagemComponent,

    EditarTriagemComponent,


    // =========================
    // PESSOAS
    // =========================

    CadastrarPessoaComponent,

    ConsultarPessoasComponent,

    EditarPessoaFisicaComponent,

    EditarPessoaJuridicaComponent,


    // =========================
    // RECLAMAÇÃO
    // =========================

    AbrirReclamacaoComponent,

    ConsultarReclamacaoComponent,

    EditarReclamacaoComponent,


    // =========================
    // AUDIÊNCIA
    // =========================

    CadastrarAudienciaComponent,

    VisualizarCalendarioAudienciaComponent,

    EditarAudienciaComponent,

    ConsultarAudienciaComponent,


    // =========================
    // ATENDIMENTO
    // =========================

    AbrirAtendimentoComponent,

    ConsultarAtendimentoComponent,

    ConsultarAtendimentoPJComponent,

    EditarAtendimentoComponent,

    EditarAtendimentoPJComponent,


    // =========================
    // PROCESSO ADMINISTRATIVO
    // =========================

    CadastarPaComponent,

    ConsultarPaComponent,

    EditarPaComponent,


    // =========================
    // NOTIFICAÇÃO / INTIMAÇÃO
    // =========================

    CadastrarNotificacaoComponent,

    ConsultarNotificacaoComponent,

    EditarNotificacaoComponent,


    // =========================
    // ARTIGOS
    // =========================

    CadastrarArtigoComponent,

    ConsultarArtigoComponent,

    EditarArtigoComponent,


    // =========================
    // USUÁRIOS
    // =========================

    CriarUsuarioComponent,

    ConsultarUsuariosComponent,

    EditarUsuarioComponent,

    PerfilComponent,


    // =========================
    // DENÚNCIA
    // =========================

    CadastrarDenunciaComponent,

    ConsultarDenunciaComponent,

    EditarDenunciaComponent,


    // =========================
    // ESTAGIÁRIOS
    // =========================

    ConsultasEstagiariosComponent,


    // =========================
    // TAREFAS
    // =========================

    CadastrarTarefaComponent,

    ConsultarTarefaComponent,

    EditarTarefaComponent,


    // =========================
    // EVENTOS
    // =========================

    CadastrarEventoComponent,

    EditarEventoComponent,

    ConsultarEventoComponent,


    // =========================
    // RESPONSÁVEIS
    // =========================

    CadastrarResponsaveisComponent,


    // =========================
    // VÍNCULO
    // =========================

    VinculoComponent,


    // =========================
    // LISTA DE TAREFAS
    // =========================

    AutocompleteListaTarefasComponent,


    // =========================
    // ETIQUETAS
    // =========================

    CadastrarEtiquetasComponent,


    // =========================
    // GESTÃO DE ATIVIDADES
    // =========================

    AgendaComponent,

    GestaoAtividadesComponent,

    CalendarioComponent

  ],


  imports: [

    // =========================
    // ROTAS
    // =========================

    AdminRoutingModule,

    RouterModule,


    // =========================
    // ANGULAR
    // =========================

    CommonModule,

    FormsModule,

    ReactiveFormsModule,


    // =========================
    // SHARED
    // =========================

    SharedModule,


    // =========================
    // BIBLIOTECAS
    // =========================

    NgxMaskDirective,

    FullCalendarModule,
    DragDropModule

  ]

})
export class AdminModule { }