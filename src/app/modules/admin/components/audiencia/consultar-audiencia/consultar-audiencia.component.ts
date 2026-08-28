declare var $: any;
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';

import { environment } from '../../../../../../environments/environment.development';

import { Router } from '@angular/router';
import { consultarAudienciaResponse } from '../../../../../core/models/audiencia/consultar-audiencia-response';
import { AudienciaService } from '../../../../../core/services/audiencia.service';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-consultar-audiencia',
  standalone: false,
  templateUrl: './consultar-audiencia.component.html',
  styleUrls: ['./consultar-audiencia.component.css'] // <-- Correção aqui
})
export class ConsultarAudienciaComponent implements OnInit {
 displayedColumns: string[] = ['numeroProtocolo', 'reclamantes', 'reclamadas', 'dataRegistro',',nomeAcordo', 'acoes'];
  dataSource = new MatTableDataSource<consultarAudienciaResponse>([]);
  totalRegistros = 0;
  paginaAtual = 1;
  tamanhoPagina = 10;
  totalPaginas = 1;
  paginasVisiveis: number[] = [];
  carregando = false;
  filtro = '';

  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];
  consulta: consultarAudienciaResponse[] = [];

  urlBase = environment.apiProcon;


  private service = inject(AudienciaService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.carregarAudiencia();
  }
 aplicarFiltro() {
    this.paginaAtual = 1;
    this.carregarAudiencia();
  }
  carregarAudiencia() {
        this.carregando = true;
    this.mensagemErro = [];
     this.service.consultarAudienciaPaginado(this.paginaAtual, this.tamanhoPagina, this.filtro).subscribe({
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
        this.mensagemErro = ['Erro ao consultar Audiencia.'];
        this.carregando = false;
      }
    });
  }
   irParaPagina(p: number) {
    if (p < 1 || p > this.totalPaginas) return;
    this.paginaAtual = p;
    this.carregarAudiencia();
  }
   atualizarPaginasVisiveis() {
    const maxVisiveis = 5;
    let start = Math.max(1, this.paginaAtual - Math.floor(maxVisiveis / 2));
    let end = Math.min(this.totalPaginas, start + maxVisiveis - 1);
    start = Math.max(1, end - maxVisiveis + 1); // ajuste final
    this.paginasVisiveis = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }
getBadgeClass(nomeAcordo: string | null | undefined): string {
  if (!nomeAcordo) return ''; // nenhum badge se não houver valor

  switch (nomeAcordo) {
    case 'Ausência da Reclamante':
      return 'badge-subtle-danger';
    case 'Ausência da Reclamada':
      return 'badge-subtle-warning';
    case 'Acordo Realizado':
      return 'badge-subtle-success';
    case 'Problema Solucionado':
      return 'badge-subtle-info';
    case 'Nova Audiência':
      return 'badge-subtle-warning';
    case 'Acordo não Realizado':
      return 'badge-subtle-danger';
    default:
      return ''; // fallback
  }
}

  formatarTelefoneArray(telefones?: string): string[] {
    if (!telefones) return [];

    return telefones.split(';').map(tel => {
      const cleaned = tel.replace(/\D/g, '');
      if (cleaned.length === 11) {
        return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      }
      if (cleaned.length === 10) {
        return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
      }
      return tel;
    });
  }
isCnpj(documento: string | undefined | null): boolean {
  if (!documento) return false;

  // remove tudo que não for número
  const digits = documento.replace(/\D/g, '');

  return digits.length === 14;
}

formatarDocumento(documento: string | undefined | null): string {
  if (!documento) return '';

  const digits = documento.replace(/\D/g, '');

  return digits.length === 14
    ? this.formatarCnpj(digits)
    : this.formatarCpf(digits);
}

labelDocumento(documento: string | undefined | null): string {
  if (!documento) return '';

  const digits = documento.replace(/\D/g, '');

  return digits.length === 14 ? 'CNPJ' : 'CPF';
}

  formatarCpf(cpf?: string): string {
    if (!cpf) return '';
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length !== 11) return cpf;
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  formatarCnpj(cnpj?: string): string {
    if (!cnpj) return '';
    const cleaned = cnpj.replace(/\D/g, '');
    if (cleaned.length !== 14) return cnpj;
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  formatarData(data?: string | Date): string {
    if (!data) return '';

    const d = typeof data === 'string' ? new Date(data) : data;

    if (isNaN(d.getTime())) return ''; // data inválida

    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0'); // meses de 0 a 11
    const ano = d.getFullYear();

    return `${dia}/${mes}/${ano}`;
  }

  
}
