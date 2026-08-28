import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { environment } from '../../../../../../environments/environment.development';
import { ConsultarDenunciaResponse } from '../../../../../core/models/denuncia/consultar-denuncia-response';
import { DenunciaService } from '../../../../../core/services/denuncia.service';

@Component({
  selector: 'app-consultar-denuncia',
  standalone: false,
  templateUrl: './consultar-denuncia.component.html',
  styleUrls: ['./consultar-denuncia.component.css']
})
export class ConsultarDenunciaComponent implements OnInit {

  displayedColumns: string[] = ['numeroProtocolo', 'reclamantes', 'reclamadas', 'dataRegistro', 'usuario', 'acoes'];
  dataSource = new MatTableDataSource<ConsultarDenunciaResponse>([]);
  totalRegistros = 0;
  paginaAtual = 1;
  tamanhoPagina = 10;
  totalPaginas = 1;
  paginasVisiveis: number[] = [];
  carregando = false;
  filtro = '';

  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];

  urlBase = environment.apiProcon;
  private service = inject(DenunciaService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.carregarDenuncias();
  }

  aplicarFiltro() {
    this.paginaAtual = 1;
    this.carregarDenuncias();
  }

  carregarDenuncias() {
    this.carregando = true;
    this.mensagemErro = [];

    this.service.consultarDenunciaPaginado(this.paginaAtual, this.tamanhoPagina, this.filtro).subscribe({
      next: (response: any) => {
        this.dataSource.data = response.items || [];
        this.totalRegistros = response.totalCount || 0;
        this.totalPaginas = Math.ceil(this.totalRegistros / this.tamanhoPagina);
        this.atualizarPaginasVisiveis();
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.mensagemErro = ['Erro ao consultar denúncia.'];
        this.carregando = false;
      }
    });
  }

  irParaPagina(p: number) {
    if (p < 1 || p > this.totalPaginas) return;
    this.paginaAtual = p;
    this.carregarDenuncias();
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
