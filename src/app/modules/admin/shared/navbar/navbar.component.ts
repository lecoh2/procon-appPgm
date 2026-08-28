import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  Renderer2
} from '@angular/core';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  Router
} from '@angular/router';

import Swal from 'sweetalert2';

import { AuthHelper } from '../../../../core/helpers/auth.helper';

import { UsuarioService } from '../../../../core/services/usuario.service';

import { environment } from '../../../../../environments/environment.development';

import { Notificacao } from '../../../../core/models/notficacao/notificacao';

import { NotificacaoSignalRService } from '../../../../core/services/notificacao-signalr.service';

import { NotificationService } from '../../../../core/services/notification.service';


@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent
  implements OnInit, AfterViewInit, OnDestroy {

  // =========================
  // INJEÇÕES
  // =========================

  private el =
    inject(ElementRef);

  private renderer =
    inject(Renderer2);

  private usuarioService =
    inject(UsuarioService);

  private notificacaoService =
    inject(NotificationService);

  private notificacaoSignalR =
    inject(NotificacaoSignalRService);

  private cdr =
    inject(ChangeDetectorRef);

  private router =
    inject(Router);

  authHelper =
    inject(AuthHelper);


  // =========================
  // USUÁRIO
  // =========================

  nomeUsuario: string =
    '';

  usuarioLogado: any;

  fotoUsuario: string =
    'assets/appprocon/img/default-avatar.jpg';


  // =========================
  // NOTIFICAÇÕES
  // =========================

  notificacoes:
    Notificacao[] =
    [];


  // =========================
  // INIT
  // =========================

  ngOnInit(): void {

    this.usuarioLogado =
      this.authHelper.get();


    this.nomeUsuario =
      this.usuarioLogado
        ?.nomeUsuario ??
      'Usuário';


    // =========================
    // FOTO USUÁRIO
    // =========================

    if (
      this.usuarioLogado?.idUsuario
    ) {

      this.usuarioService
        .consultarPerfilUsuarioPorId(
          this.usuarioLogado.idUsuario
        )
        .subscribe({

          next: response => {

            const usuario =
              Array.isArray(response)
                ? response[0]
                : response;


            this.fotoUsuario =
              usuario?.fotos?.fileUrl

                ? `${environment.apiProcon}${usuario.fotos.fileUrl}`

                : 'assets/appprocon/img/default-avatar.jpg';


            this.cdr
              .markForCheck();

          },

          error: (
            err: HttpErrorResponse
          ) => {

            console.error(
              'Erro ao carregar foto do usuário:',
              err
            );


            this.fotoUsuario =
              'assets/appprocon/img/default-avatar.jpg';


            this.cdr
              .markForCheck();

          }

        });

    }


    // =========================
    // CARREGA NOTIFICAÇÕES
    // =========================

    this.carregarNotificacoes();


    // =========================
    // SIGNALR
    // =========================

    const usuario =
      this.authHelper.get();


    if (
      usuario?.idUsuario
    ) {

      this.notificacaoSignalR
        .iniciar(

          usuario.idUsuario,

          (
            data: {
              titulo: string;
              mensagem: string;
            }
          ) => {

            console.log(
              '🔔 SignalR recebido:',
              data
            );


            this.notificacoes.unshift({

              id:
                '',

              usuarioId:
                usuario.idUsuario,

              titulo:
                data.titulo,

              mensagem:
                data.mensagem,

              lida:
                false,

              dataCriacao:
                new Date()
                  .toISOString()

            });


            Swal.fire({

              toast:
                true,

              position:
                'top-end',

              iconHtml:
                '<i class="fas fa-bell"></i>',

              title:
                data.titulo,

              text:
                data.mensagem,

              showConfirmButton:
                false,

              timer:
                6000,

              timerProgressBar:
                true,

              background:
                '#1f2937',

              color:
                '#ffffff',

              customClass: {

                popup:
                  'notificacao-toast',

                icon:
                  'notificacao-toast-icone',

                title:
                  'notificacao-toast-titulo',

                htmlContainer:
                  'notificacao-toast-mensagem',

                timerProgressBar:
                  'notificacao-toast-progress'

              }

            });


            this.cdr
              .markForCheck();

          }

        );

    }


    // =========================
    // NOTIFICAÇÃO LIDA VIA SIGNALR
    // =========================

    this.notificacaoSignalR
  .onNotificacaoLida(
    (id: string) => {

      console.log(
        '🔔 Notificação marcada como lida via SignalR:',
        id
      );

      this.notificacoes =
        this.notificacoes.filter(
          x => x.id !== id
        );

      this.cdr.detectChanges();
    }
  );
  }


  // =========================
  // CARREGAR NOTIFICAÇÕES
  // =========================

  carregarNotificacoes(): void {

    const usuario =
      this.authHelper.get();


    console.log(
      '👤 USUÁRIO LOGADO:',
      usuario
    );


    if (
      !usuario?.idUsuario
    ) {

      return;

    }


    this.notificacaoService
  .getNotificacoes(
    usuario.idUsuario
  )
  .subscribe({
    next: (res: Notificacao[]) => {
      console.log(
        '🔔 NOTIFICAÇÕES API:',
        res
      );

      this.notificacoes =
        res ?? [];

      this.cdr.detectChanges();
    },

    error: (err) => {
      console.error(
        '❌ ERRO NOTIFICAÇÕES:',
        err
      );

      this.notificacoes = [];
    }
  });

  }


  // =========================
  // MARCAR COMO LIDA
  // =========================

  marcarComoLida(
    item: Notificacao
  ): void {

    if (
      !item?.id
    ) {

      return;

    }


    this.notificacaoService
      .marcarComoLida(
        item.id
      )
      .subscribe({

        next: () => {

          this.notificacoes =
            this.notificacoes.filter(
              x =>
                x.id !== item.id
            );


          this.cdr
            .markForCheck();


          Swal.fire({

            toast:
              true,

            position:
              'top-end',

            icon:
              'success',

            title:
              'Marcada como lida',

            showConfirmButton:
              false,

            timer:
              1800,

            timerProgressBar:
              true,

            background:
              '#1f2937',

            color:
              '#ffffff',

            iconColor:
              '#22c55e'

          });

        },

        error: (
          err: HttpErrorResponse
        ) => {

          console.error(
            'Erro ao marcar como lida:',
            err
          );

        }

      });

  }


  // =========================
  // TOTAL NÃO LIDAS
  // =========================

  get naoLidas(): number {

    return (
      this.notificacoes ??
      []
    )
      .filter(
        x =>
          !x.lida
      )
      .length;

  }


  // =========================
  // SIDEBAR
  // =========================

  ngAfterViewInit(): void {

    const sidebar =
      document.querySelector(
        '.sidebar'
      );


    const toggleBtn =
      this.el
        .nativeElement
        .querySelector(
          '.sidebar-toggle'
        );


    if (
      sidebar &&
      toggleBtn
    ) {

      this.renderer.listen(
        toggleBtn,
        'click',
        () => {

          sidebar.classList
            .toggle(
              'collapsed'
            );


          window.dispatchEvent(
            new Event(
              'resize'
            )
          );

        }
      );

    }

  }


  // =========================
  // TEMA
  // =========================

  toggleTheme(): void {

    const themeKey =
      'appstack-config-theme';


    const currentTheme =
      localStorage.getItem(
        themeKey
      );


    const newTheme =
      currentTheme === 'dark'
        ? 'default'
        : 'dark';


    document.documentElement
      .setAttribute(
        'data-bs-theme',
        newTheme
      );


    document.documentElement
      .setAttribute(
        'data-sidebar-theme',
        newTheme
      );


    localStorage.setItem(
      themeKey,
      newTheme
    );


    document.dispatchEvent(

      new Event(
        'DOMContentLoaded',
        {

          bubbles:
            true,

          cancelable:
            true

        }
      )

    );

  }


  // =========================
  // LOGOUT
  // =========================

  logout(): void {

    if (
      confirm(
        `Deseja realmente sair do sistema, ${this.nomeUsuario}?`
      )
    ) {

      this.authHelper
        .remove();


      location.reload();

    }

  }


  // =========================
  // DESTROY
  // =========================

  ngOnDestroy(): void {

    console.log(
      'NAVBAR DESTRUÍDA'
    );

  }

}