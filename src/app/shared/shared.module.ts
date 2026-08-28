// src/app/shared/shared.module.ts

import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';

import { RouterModule } from '@angular/router';

import { NgxPaginationModule } from 'ngx-pagination';

import { MatPaginatorModule } from '@angular/material/paginator';

import { MatTableModule } from '@angular/material/table';


import { AlertsComponent } from './components/alerts/alerts.component';

import { SpinnerComponent } from './components/spinner/spinner.component';

import { SpinnerConsultaComponent } from './components/spinnerconsulta/spinnercontulta.component';

import { LogoAnimadaComponent } from './components/logo-animada/logo-animada.component';

import { TextoCnpiAnimadoComponent } from './components/texto-cnpi-animado/texto-cnpi-animado.component';

import { ModalGeralComponent } from './components/modal-geral/modal-geral.component';

import { BarrasComponent } from './components/graficos/reclamacao/barras.component';

import { GraficoAtendimentoComponent } from './components/graficos/atendimento/grafico-atendimento.component';

import { GraficoAudienciaComponent } from './components/graficos/audiencia/grafico-audiencia.component';

import { GraficoReclamacaoPizzaComponent } from './components/graficos/reclamacao-pizza/grafico-reclamacao-pizza.component';

import { GraficoPaBarrasComponent } from './components/graficos/pa/grafico-pa-barras.component';

import { GraficoNotificacaoComponent } from './components/graficos/notificacao/grafico-notificacao.component';

import { GraficoUsuarioAtendimentoComponent } from './components/graficos/usuarios/grafico-usuario-atendimento.component';

import { GraficoUsuarioAtendimentoAnualComponent } from './components/graficos/usuarios/grafico-anual/grafico-usuario-atendimento-anual.component';


@NgModule({

  // =========================
  // COMPONENTES COMPARTILHADOS
  // =========================

  declarations: [

    SpinnerComponent,

    SpinnerConsultaComponent,

    AlertsComponent,

    LogoAnimadaComponent,

    TextoCnpiAnimadoComponent,

    ModalGeralComponent,

    BarrasComponent,

    GraficoAtendimentoComponent,

    GraficoAudienciaComponent,

    GraficoReclamacaoPizzaComponent,

    GraficoPaBarrasComponent,

    GraficoNotificacaoComponent,

    GraficoUsuarioAtendimentoComponent,

    GraficoUsuarioAtendimentoAnualComponent

  ],


  // =========================
  // MÓDULOS USADOS PELO SHARED
  // =========================

  imports: [

    CommonModule,

    FormsModule,

    ReactiveFormsModule,

    RouterModule,

    NgxPaginationModule,

    MatPaginatorModule,

    MatTableModule

  ],


  // =========================
  // EXPORTAÇÕES
  // =========================

  exports: [

    // COMPONENTES

    SpinnerComponent,

    SpinnerConsultaComponent,

    AlertsComponent,

    LogoAnimadaComponent,

    TextoCnpiAnimadoComponent,

    ModalGeralComponent,

    BarrasComponent,

    GraficoAtendimentoComponent,

    GraficoAudienciaComponent,

    GraficoReclamacaoPizzaComponent,

    GraficoPaBarrasComponent,

    GraficoNotificacaoComponent,

    GraficoUsuarioAtendimentoComponent,

    GraficoUsuarioAtendimentoAnualComponent,


    // MÓDULOS ANGULAR

    CommonModule,

    FormsModule,

    ReactiveFormsModule,

    RouterModule,


    // BIBLIOTECAS

    NgxPaginationModule,

    MatPaginatorModule,

    MatTableModule

  ]

})
export class SharedModule { }