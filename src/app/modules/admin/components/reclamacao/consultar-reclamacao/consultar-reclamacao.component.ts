declare var $: any;
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ConsultarReclamacaoResponse } from '../../../../../core/models/reclamacao/consultar-reclamacao-response';
import { environment } from '../../../../../../environments/environment.development';
import { ReclamacaoService } from '../../../../../core/services/reclamacao.service';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-consultar-reclamacao',
  standalone: false,
  templateUrl: './consultar-reclamacao.component.html',
  styleUrls: ['./consultar-reclamacao.component.css'] // <-- Correção aqui
})
export class ConsultarReclamacaoComponent implements OnInit {
 displayedColumns: string[] = ['numeroProtocolo', 'reclamantes', 'reclamadas', 'dataRegistro', 'acoes'];
  dataSource = new MatTableDataSource<ConsultarReclamacaoResponse>([]);
  totalRegistros = 0;
  paginaAtual = 1;
  tamanhoPagina = 10;
  totalPaginas = 1;
  paginasVisiveis: number[] = [];
  carregando = false;
  filtro = '';
  consulta: ConsultarReclamacaoResponse[] = [];
  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];

  urlBase = environment.apiProcon;

  private service = inject(ReclamacaoService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.carregarReclamacao();
  }
 aplicarFiltro() {
    this.paginaAtual = 1;
    this.carregarReclamacao();
  }
  carregarReclamacao() {
    this.carregando = true;
    this.mensagemErro = [];
     this.service.consultarReclamacaoPaginado(this.paginaAtual, this.tamanhoPagina, this.filtro).subscribe({
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
  
  irParaPagina(p: number) {
    if (p < 1 || p > this.totalPaginas) return;
    this.paginaAtual = p;
    this.carregarReclamacao();
  }
    atualizarPaginasVisiveis() {
    const maxVisiveis = 5;
    let start = Math.max(1, this.paginaAtual - Math.floor(maxVisiveis / 2));
    let end = Math.min(this.totalPaginas, start + maxVisiveis - 1);
    start = Math.max(1, end - maxVisiveis + 1); // ajuste final
    this.paginasVisiveis = Array.from({ length: end - start + 1 }, (_, i) => start + i);
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
