declare var $: any;
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { ConsultarArtigoResponse } from '../../../../../core/models/artigo/consultar-artigo-response';
import { environment } from '../../../../../../environments/environment.development';
import { ArtigoService } from '../../../../../core/services/artigo.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-consultar-artigo',
  standalone:false,
  templateUrl: './consultar-artigo.component.html',
  styleUrl: './consultar-artigo.component.css'
})
export class ConsultarArtigoComponent {
 consulta: ConsultarArtigoResponse[] = [];
  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];
  carregando = false;
  urlBase = environment.apiProcon;

  private artigoService = inject(ArtigoService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.buscarArtigo();
  }

  buscarArtigo() {
    this.carregando = true;
    this.mensagemErro = [];
    this.mensagemSucesso = [];

    this.artigoService.consultarArtigo().subscribe({
      next: (response) => {
        this.consulta = response;
        this.carregando = false;
        this.cdr.detectChanges();

        setTimeout(() => {
          this.initDataTable('#datatables-artigo');
        }, 0);
      },
      error: () => {
        this.mensagemErro = ['Erro ao consultar Pa.'];
        this.carregando = false;
      }
    });
  }

  initDataTable(selector: string) {
    const table = $(selector);
    if ($.fn.DataTable.isDataTable(table)) {
      table.DataTable().destroy();
    }
    table.DataTable({
      responsive: true,
      language: { url: 'assets/appprocon/datatable/datatable-ptbr.json' },
    });
  }

  destroyDataTables() {
    ['#datatables-artigo'].forEach(selector => {
      const table = $(selector);
      if ($.fn.DataTable.isDataTable(table)) {
        table.DataTable().destroy();
      }
    });
  }


}
