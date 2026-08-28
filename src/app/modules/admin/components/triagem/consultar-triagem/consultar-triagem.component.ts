declare var $: any;
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ConsultarTriagemResponse } from '../../../../../core/models/triagem/consulta-triagem-response';
import { TriagemService } from '../../../../../core/services/triagem.service';
import { Router } from '@angular/router';
import { environment } from '../../../../../../environments/environment.development';

@Component({
  selector: 'app-consultar-triagem',
  standalone: false,
  templateUrl: './consultar-triagem.component.html',
  styleUrl: './consultar-triagem.component.css'
})
export class ConsultarTriagemComponent implements OnInit {
  consulta: ConsultarTriagemResponse[] = [];
  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];
  carregando = false;
  urlBase = environment.apiProcon;
  private service = inject(TriagemService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.carregando = true;

    this.service.consultar().subscribe({
      next: (response) => {
        this.consulta = response;

        this.carregando = false;
        this.cdr.detectChanges();

        const table = $('#datatables-responsive');
        if ($.fn.DataTable.isDataTable(table)) {
          table.DataTable().clear().destroy();
        }

        table.DataTable({
          responsive: true,
          language: {
            url: 'assets/appprocon/datatable/datatable-ptbr.json'
          }
        });
      },
      error: () => {
        this.mensagemErro = ['Erro ao consultar triagem.'];
        this.carregando = false;
      }
    });
  }
}
