declare var $: any;
import { ChangeDetectorRef } from '@angular/core';
import { Component, inject, OnInit } from '@angular/core';
import { TipoTriagemService } from '../../../../../core/services/tipo-triagem.service';
import { Router } from '@angular/router';
import { ConsultarTipoTriagemResponse } from '../../../../../core/models/tipo-triagem/consultar-tipo-triagem-response';

@Component({
  selector: 'app-consultar-triagem',
  standalone: false,
  templateUrl: './consultar-tipo-triagem.component.html',
  styleUrl: './consultar-tipo-triagem.component.css'
})
export class ConsultarTipoTriagemComponent implements OnInit {
  consulta: ConsultarTipoTriagemResponse[] = [];
  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];
  carregando = false;

  private service = inject(TipoTriagemService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  ngOnInit(): void {
    this.carregando = true;

    this.service.consultar().subscribe({
      next: (response) => {
        this.consulta = response;
        this.carregando = false;

        // Aguarda o Angular renderizar o DOM com os dados
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
        this.mensagemErro = ['Erro ao consultar tipos de triagem.'];
        this.carregando = false;
      }
    });
  }

  excluirTipoTriagem(id: string) {
    if (!confirm(`Deseja realmente excluir este tipo de triagem?`)) {
      return;
    }

    this.carregando = true;
    this.mensagemErro = [];
    this.mensagemSucesso = [];

    this.service.atualizarStatus(id).subscribe({
      next: () => {
        this.mensagemSucesso = ['Tipo de triagem excluído com sucesso.'];
        this.carregando = false;
        setTimeout(() => {
          window.location.reload();
        }, 2000); // espera 2 segundos (2000 ms)
      },
      error: () => {
        this.mensagemErro = ['Erro ao excluir tipo de triagem.'];
        this.carregando = false;
      }
    });
  }


}
