declare var $: any;
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { ConsultarPaResponse } from '../../../../../core/models/pa/consultar-pa-response';
import { environment } from '../../../../../../environments/environment.development';
import { PaService } from '../../../../../core/services/pa.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-consular-pa',
standalone:false,
  templateUrl: './consultar-pa.component.html',
  styleUrl: './consultar-pa.component.css'
})
export class ConsultarPaComponent {
  consulta: ConsultarPaResponse[] = [];
  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];
  carregando = false;
  urlBase = environment.apiProcon;

  private servicePa = inject(PaService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.buscarProcessoAdministrativo();
  }

  buscarProcessoAdministrativo() {
    this.carregando = true;
    this.mensagemErro = [];
    this.mensagemSucesso = [];

    this.servicePa.consultarPaAdmin().subscribe({
      next: (response) => {
        this.consulta = response;
        this.carregando = false;
        this.cdr.detectChanges();

        setTimeout(() => {
          this.initDataTable('#datatables-pa');
        }, 0);
      },
      error: () => {
        this.mensagemErro = ['Erro ao consultar Pa.'];
        this.carregando = false;
      }
    });
  }
formatarPaNumero(paNumero?: string | number | null): string {
  if (!paNumero) return '';

  const numeros = paNumero.toString().replace(/\D/g, '');

  if (numeros.length < 9) return numeros;

  return `${numeros.slice(0, 3)}/${numeros.slice(3, 9)}`;
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
    ['#datatables-pa'].forEach(selector => {
      const table = $(selector);
      if ($.fn.DataTable.isDataTable(table)) {
        table.DataTable().destroy();
      }
    });
  }


}
