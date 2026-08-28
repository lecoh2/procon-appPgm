import { RouterModule, Routes } from "@angular/router";
import { PainelPrincipalComponent } from "./components/painel-principal/painel-principal.component";
import { CadastrarTipoTriagemComponent } from "./components/tipo-triagem/cadastrar-tipo-triagem/cadastrar-tipo-triagem.component";
import { ConsultarTipoTriagemComponent } from "./components/tipo-triagem/consultar-tipo-triagem/consultar-tipo-triagem.component";
import { CadastrarTriagemComponent } from "./components/triagem/cadastrar-triagem/cadastrar-triagem.component";
import { NgModule } from "@angular/core";
import { AdminLayoutComponent } from "./layouts/admin-layout/admin-layout.component";
import { EditarTipoTriagemComponent } from "./components/tipo-triagem/editar-tipo-triagem/editar-tipo-triagem.component";
import { ConsultarTriagemComponent } from "./components/triagem/consultar-triagem/consultar-triagem.component";
import { EditarTriagemComponent } from "./components/triagem/editar-triagem/editar-triagem.component";
import { CadastrarPessoaComponent } from "./components/pessoa/cadastrar-pessoa/cadastrar-pessoas.component";
import { ConsultarPessoasComponent } from "./components/pessoa/consultar-pessoas/consultar-pessoas.component";
import { EditarPessoaFisicaComponent } from "./components/pessoa/editar-pessoa-fisica/editar-pessoa-fisica.component";
import { EditarPessoaJuridicaComponent } from "./components/pessoa/editar-pessoa-juridica/editar-pessoa-juridica.component";
import { AbrirReclamacaoComponent } from "./components/reclamacao/abrir-reclamacao/abrir-reclamacao.component";
import { ConsultarReclamacaoComponent } from "./components/reclamacao/consultar-reclamacao/consultar-reclamacao.component";
import { EditarReclamacaoComponent } from "./components/reclamacao/editar-reclamacao/editar-reclamacao.component";
import { CadastrarAudienciaComponent } from "./components/audiencia/cadastrar-audiencia/cadastrar-audiencia.component";
import { VisualizarCalendarioAudienciaComponent } from "./components/audiencia/visualizar-calendario-audiencia/visualizar-calendario-audiencia.component";
import { EditarAudienciaComponent } from "./components/audiencia/editar-audiencia/editar-audiencia.component";
import { ConsultarAudienciaComponent } from "./components/audiencia/consultar-audiencia/consultar-audiencia.component";
import { AbrirAtendimentoComponent } from "./components/atendimento/abrir-atendimento/abrir-atendimento.component";
import { ConsultarAtendimentoComponent } from "./components/atendimento/consultar-atendimento/consultar-atendimento.component";
import { EditarAtendimentoComponent } from "./components/atendimento/editar-atendimento/editar-atendimento.component";
import { CadastarPaComponent } from "./components/pa/cadastar-pa/cadastar-pa.component";
import { ConsultarPaComponent } from "./components/pa/consular-pa/consultar-pa.component";
import { EditarPaComponent } from "./components/pa/editar-pa/editar-pa.component";
import { CadastrarNotificacaoComponent } from "./components/notificacao/criar-notificacao/cadastrar-notificacao.component";
import { ConsultarNotificacaoComponent } from "./components/notificacao/consultar-notificacao/consultar-notificacao.component";
import { EditarNotificacaoComponent } from "./components/notificacao/editar-notificacao/editar-notificacao.component";
import { CadastrarArtigoComponent } from "./components/artigo/cadastrar-artigo/cadastrar-artigo.component";
import { ConsultarArtigoComponent } from "./components/artigo/consultar-artigo/consultar-artigo.component";
import { EditarArtigoComponent } from "./components/artigo/editar-artigo/editar-artigo.component";
import { AuthGuard } from "../../core/guards/auth.guard";
import { NivelGuard } from "../../core/guards/nivel.guard";
import { CriarUsuarioComponent } from "./components/usuario/criar-usuario/criar-usuario.component";
import { ConsultarUsuariosComponent } from "./components/usuario/consultar-usuarios/consultar-usuarios.component";
import { EditarUsuarioComponent } from "./components/usuario/editar-usuario/editar-usuario.component";
import { PerfilComponent } from "./components/usuario/perfil/perfil.component";
import { CadastrarDenunciaComponent } from "./components/denuncia/cadastrar-denuncia/cadastrar-denuncia.component";

import { EditarDenunciaComponent } from "./components/denuncia/editar-denuncia/editar-denuncia.component";
import { ConsultarDenunciaComponent } from "./components/denuncia/consultar-denuncia/consultar-denuncia.component";
import { ConsultasEstagiariosComponent } from "./components/estagiarios/consultas-estagiarios/consultas-estagiarios.component";
import { ConsultarAtendimentoPJComponent } from "./components/atendimento/consultar-atendimento-pj/consultar-atendimento-pj.component";
import { EditarAtendimentoPJComponent } from "./components/atendimento/editar-atendimento-pj/editar-atendimento-pj.component";
import { CadastrarTarefaComponent } from "./components/tarefa/cadastrar-tarefa/cadastar-tarefa/cadastar-tarefa.component";

import { ConsultarTarefaComponent } from "./components/tarefa/consultar-tarefa/consultar-tarefa.component";

import { EditarTarefaComponent } from "./components/tarefa/editar-tarefa/editar-tarefa.component";

import { ConsultarEventoComponent } from "./components/evento/consultar-evento/consultar-evento.component";
import { EditarEventoComponent } from "./components/evento/editar-evento/editar-evento.component";
import { AgendaComponent } from "./components/gestao-atividades/agenda/agenda.component";
import { GestaoAtividadesComponent } from "./components/gestao-atividades/gestao/gestao-atividades.component";
import { CadastrarEventoComponent } from "./components/evento/cadastrar-evento/cadastrar-evento.component";


export const routes: Routes = [
    {
        path: '',
        component: AdminLayoutComponent,
        children: [

            {
                path: 'painel-principal',
                component: PainelPrincipalComponent,
                canActivate: [AuthGuard] // apenas logado
            },
            //tipo triagem
            {
                path: 'cadastrar-tipo-triagem',
                component: CadastrarTipoTriagemComponent
            },
            {
                path: 'consultar-tipo-triagem',
                component: ConsultarTipoTriagemComponent
            },
            {
                path: 'editar-tipo-triagem/:id',
                component: EditarTipoTriagemComponent
            },
            //triagem
            {
                path: 'cadastrar-triagem',
                component: CadastrarTriagemComponent
            },
            {
                path: 'consultar-triagem',
                component: ConsultarTriagemComponent
            },
            {
                path: 'editar-triagem/:id',
                component: EditarTriagemComponent
            },  {
                path: 'agenda',
                component: AgendaComponent,
                canActivate: [AuthGuard, NivelGuard],
              data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', 'Estagiários'] }

            },
              //atividades
            {
                path: 'gestao-atividades',
                component: GestaoAtividadesComponent,
                canActivate: [AuthGuard, NivelGuard],
               data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', 'Estagiários'] }

            }
            ,
            //pessoas
            {
                path: 'cadastrar-pessoas',
                component: CadastrarPessoaComponent,
                canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', 'Estagiários'] }

            },
            {
                path: 'consultar-pessoas',
                component: ConsultarPessoasComponent,
                canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', 'Estagiários'] }

            },
            {
                path: 'editar-pessoa-fisica/:id',
                component: EditarPessoaFisicaComponent,
                canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', 'Estagiários'] }

            },
            {
                path: 'editar-pessoa-juridica/:id',
                component: EditarPessoaJuridicaComponent,
                canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', 'Estagiários'] }

            },
            {
                path: 'abrir-reclamacao',
                component: AbrirReclamacaoComponent,
                canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', 'Estagiários'] }
            },
            {
                path: 'consultar-reclamacao',
                component: ConsultarReclamacaoComponent,
                canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', 'Estagiários'] }
            },
            {
                path: 'editar-reclamacao/:id',
                component: EditarReclamacaoComponent,
                canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', 'Estagiários'] }

            },
            {
                path: 'cadastrar-audiencia',
                component: CadastrarAudienciaComponent,
                canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador'] }

            },
            {
                path: 'visualizar-calendario-audiencia',
                component: VisualizarCalendarioAudienciaComponent,
                canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador'] }

            },
            {
                path: 'consultar-audiencia',
                component: ConsultarAudienciaComponent,
                canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador'] }

            },
            {
                path: 'editar-audiencia/:id',
                component: EditarAudienciaComponent,
                canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador'] }

            },
            {
                path: 'abrir-atendimento',
                component: AbrirAtendimentoComponent,
                canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', 'Estagiários'] }

            },
            {
                path: 'consultar-atendimento',
                component: ConsultarAtendimentoComponent,
                canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', 'Estagiários'] }

            },
                 {
                path: 'consultar-atendimento-pj',
                component: ConsultarAtendimentoPJComponent,
                canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', 'Estagiários'] }

            },
            {
                path: 'editar-atendimento/:id',
                component: EditarAtendimentoComponent,
                canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', 'Estagiários'] }

            },   {
                path: 'editar-atendimento-pj/:id',
                component: EditarAtendimentoPJComponent,
                canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', 'Estagiários'] }

            },
            {
                path: 'cadastrar-pa',
                component: CadastarPaComponent,
                canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', 'Fiscal'] }
            },
            {
                path: 'consultar-pa',
                component: ConsultarPaComponent,
                canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', 'Fiscal'] }
            },
            {
                path: 'editar-pa/:id',
                component: EditarPaComponent,
                canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', 'Fiscal'] }
            },
            {
                path: 'cadastrar-notificacao',
                component: CadastrarNotificacaoComponent,
                canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', 'Fiscal'] } // quem pode acessar

            }, {
                path: 'consultar-notificacao',
                component: ConsultarNotificacaoComponent,
                canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', 'Fiscal'] } // quem pode acessar

            }, {
                path: 'editar-notificacao/:id',
                component: EditarNotificacaoComponent,
                canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', 'Fiscal'] } // quem pode acessar

            },
            {
                path: 'cadastrar-artigo',
                component: CadastrarArtigoComponent,
                canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador'] } // quem pode acessar
            }, {
                path: 'consultar-artigo',
                component: ConsultarArtigoComponent,
                canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador'] } // quem pode acessar
            }, {
                path: 'editar-artigo/:id',
                component: EditarArtigoComponent,
                canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador'] } // quem pode acessar
            },
            {
                path: 'criar-usuario',
                component: CriarUsuarioComponent,
                canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador'] } // quem pode acessar
            },
            {
                path: 'consultar-usuarios',
                component: ConsultarUsuariosComponent,
                canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador'] } // quem pode acessar
            }, {
                path: 'editar-usuario/:id',
                component: EditarUsuarioComponent,
                canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador'] } // quem pode acessar
            },
            {
                path: 'perfil',
                component: PerfilComponent,
                canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', 'Estagiários'] }
                // quem pode acessar
            }
            ,
            {
                path: 'cadastrar-denuncia',
                component: CadastrarDenunciaComponent,
                canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador'] } // quem pode acessar
            },
              {
                path: 'consultar-denuncia',
                component: ConsultarDenunciaComponent,
                canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador'] }

            },{
                path: 'editar-denuncia/:id',
                component: EditarDenunciaComponent,
                canActivate: [AuthGuard, NivelGuard],
               data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador'] }
          },

          {
               path: 'consultas-estagiarios',
                component: ConsultasEstagiariosComponent,
                canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', ] }

            },
             {
                path: 'cadastrar-tarefa',
                component: CadastrarTarefaComponent,
                canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador'] } // quem pode acessar

            },{
               path: 'consultar-tarefa',
                component: ConsultarTarefaComponent,
                canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', ] }

            },{
                path: 'editar-tarefa/:id',
                component: EditarTarefaComponent,
                canActivate: [AuthGuard, NivelGuard],
               data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador'] }
          },{
                path: 'cadastrar-evento',
                component: CadastrarEventoComponent,
                canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', 'Fiscal'] } // quem pode acessar

            },{
               path: 'consultar-evento',
                component: ConsultarEventoComponent,
                canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', ] }

            },{
                path: 'editar-evento/:id',
                component: EditarEventoComponent,
                canActivate: [AuthGuard, NivelGuard],
               data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador'] }
          },

            { path: '', redirectTo: 'painel-principal', pathMatch: 'full' }
        ]
    }
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AdminRoutingModule { }