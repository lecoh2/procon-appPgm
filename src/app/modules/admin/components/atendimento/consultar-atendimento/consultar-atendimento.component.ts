declare var $: any;
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { environment } from '../../../../../../environments/environment.development';
import { AtendimentoService } from '../../../../../core/services/atendimento.service';
import { ConsultarAtendimentoResponse } from '../../../../../core/models/atendimento/consultar-atendimento-response';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-consultar-atendimento',
  standalone: false,
  templateUrl: './consultar-atendimento.component.html',
  styleUrls: ['./consultar-atendimento.component.css']
})
export class ConsultarAtendimentoComponent implements OnInit {
  displayedColumns: string[] = ['numeroProtocolo', 'reclamantes', 'reclamadas', 'dataRegistro', 'usuario', 'acoes'];
  dataSource = new MatTableDataSource<ConsultarAtendimentoResponse>([]);
  totalRegistros = 0;
  paginaAtual = 1;
  tamanhoPagina = 10;
  totalPaginas = 1;
  paginasVisiveis: number[] = [];
  carregando = false;
  filtro = '';

  consulta: ConsultarAtendimentoResponse[] = [];
  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];

  urlBase = environment.apiProcon;

  private service = inject(AtendimentoService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.carregarAtendimentos();
  }
 aplicarFiltro() {
    this.paginaAtual = 1;
    this.carregarAtendimentos();
  }
  carregarAtendimentos() {
  this.carregando = true;
    this.mensagemErro = [];

       this.service.consultarAtendimentoPaginado(this.paginaAtual, this.tamanhoPagina, this.filtro).subscribe({
      next: (response: any) => {
        this.dataSource.data = response.items || [];
        this.totalRegistros = response.totalCount || 0;
        this.totalPaginas = Math.ceil(this.totalRegistros / this.tamanhoPagina);
        this.atualizarPaginasVisiveis();
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.mensagemErro = ['Erro ao consultar atendimentop.'];
        this.carregando = false;
      }
    });
  }
  

  irParaPagina(p: number) {
    if (p < 1 || p > this.totalPaginas) return;
    this.paginaAtual = p;
    this.carregarAtendimentos();
  }

  atualizarPaginasVisiveis() {
    const maxVisiveis = 5;
    let start = Math.max(1, this.paginaAtual - Math.floor(maxVisiveis / 2));
    let end = Math.min(this.totalPaginas, start + maxVisiveis - 1);
    start = Math.max(1, end - maxVisiveis + 1); // ajuste final
    this.paginasVisiveis = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  formatarData(data?: string | Date): string {
    if (!data) return '';
    const d = typeof data === 'string' ? new Date(data) : data;
    if (isNaN(d.getTime())) return '';
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  }
  formatarCpf(cpf?: string): string {
    if (!cpf) return '';
    const cleaned = cpf.replace(/\D/g, '');
    return cleaned.length === 11 ? cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : cpf;
  }

  formatarCnpj(cnpj?: string): string {
    if (!cnpj) return '';
    const cleaned = cnpj.replace(/\D/g, '');
    return cleaned.length === 14 ? cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5') : cnpj;
  }

  getPrimeiroNome(usuario?: string): string {
    return usuario ? usuario.split(' ')[0] : '';
  }

}
