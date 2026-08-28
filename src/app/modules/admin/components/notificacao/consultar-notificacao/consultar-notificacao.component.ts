declare var $: any;
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../../../../environments/environment.development';
import { ConsultarNotificacaoResponse } from '../../../../../core/models/notificacao/consultar-notificacao-response';
import { NotificacaoService } from '../../../../../core/services/notificacao.service';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-consultar-notificacao',
  standalone:false,
  templateUrl: './consultar-notificacao.component.html',
  styleUrl: './consultar-notificacao.component.css'
})
export class ConsultarNotificacaoComponent {
   displayedColumns: string[] = ['notificaco', 'processo', 'tipo', 'dataRegistro', 'acoes'];
  dataSource = new MatTableDataSource<ConsultarNotificacaoResponse>([]);
  totalRegistros = 0;
  paginaAtual = 1;
  tamanhoPagina = 10;
  totalPaginas = 1;
  paginasVisiveis: number[] = [];
  carregando = false;
  filtro = '';
consulta: ConsultarNotificacaoResponse[] = [];
  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];

  urlBase = environment.apiProcon;

  private notificacaoService = inject(NotificacaoService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
 aplicarFiltro() {
    this.paginaAtual = 1;
    this.carregarNotificacao();
  }

   carregarNotificacao() {
    this.carregando = true;
    this.mensagemErro = [];
     this.notificacaoService.consultarNotificacaoIntimacaoPaginado(this.paginaAtual, this.tamanhoPagina, this.filtro).subscribe({
      next: (response: any) => {
        this.dataSource.data = response.items || [];
        this.totalRegistros = response.totalCount || 0;
        this.totalPaginas = Math.ceil(this.totalRegistros / this.tamanhoPagina);
        this.atualizarPaginasVisiveis();
        this.carregando = false;
        this.cdr.detectChanges();
        console.log(response);
      },
      error: () => {
        this.mensagemErro = ['Erro ao consultar Reclamação.'];
        this.carregando = false;
      }
    });
  }
  ngOnInit(): void {
    this.carregarNotificacao();
  }
formatarPaNumero(paNumero?: string | number | null): string {
  if (!paNumero) return '';

  const numeros = paNumero.toString().replace(/\D/g, '');

  if (numeros.length < 9) return numeros;

  return `${numeros.slice(0, 3)}/${numeros.slice(3, 9)}`;
}
 /* buscarNotificacao() {
    this.carregando = true;
    this.mensagemErro = [];
    this.mensagemSucesso = [];

    this.notificacaoService.consultarNotificacao().subscribe({
      next: (response) => {
        this.consulta = response;
        this.carregando = false;
        this.cdr.detectChanges();

        setTimeout(() => {
          this.initDataTable('#datatables-notificacao');
        }, 0);
      },
      error: () => {
        this.mensagemErro = ['Erro ao consultar notificacao.'];
        this.carregando = false;
      }
    });
  }*/
 irParaPagina(p: number) {
    if (p < 1 || p > this.totalPaginas) return;
    this.paginaAtual = p;
    this.carregarNotificacao();
  }
    atualizarPaginasVisiveis() {
    const maxVisiveis = 5;
    let start = Math.max(1, this.paginaAtual - Math.floor(maxVisiveis / 2));
    let end = Math.min(this.totalPaginas, start + maxVisiveis - 1);
    start = Math.max(1, end - maxVisiveis + 1); // ajuste final
    this.paginasVisiveis = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }
  /*initDataTable(selector: string) {
    const table = $(selector);
    if ($.fn.DataTable.isDataTable(table)) {
      table.DataTable().destroy();
    }
    table.DataTable({
      responsive: true,
      language: { url: 'assets/appprocon/datatable/datatable-ptbr.json' },
    });
  }

 /*?? destroyDataTables() {
    ['#datatables-notificacao'].forEach(selector => {
      const table = $(selector);
      if ($.fn.DataTable.isDataTable(table)) {
        table.DataTable().destroy();
      }
    });
  }*/

}
