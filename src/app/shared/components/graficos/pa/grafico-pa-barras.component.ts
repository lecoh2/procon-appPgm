import { AfterViewInit, Component, inject, OnDestroy } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { GraficosService } from '../../../../core/services/graficos.service';

interface PaAgrupado {
  mes: number;
  quantidade: number;
}

@Component({
  selector: 'app-grafico-pa-barras',
  standalone: false,
  template: `
    <div class="row">
      <div class="col-12">
        <canvas id="chartjs-dashboard-graficoPaBarras"></canvas>
      </div>
      <div class="col-12 mt-3">
        <table class="table table-striped mb-0">
          <thead>
            <tr>
              <th>Mês</th>
              <th class="text-end">Quantidade</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of tabelaDados">
              <td>
                <i class="fas fa-square-full" [ngStyle]="{'color': item.cor}"></i> {{ item.label }}
              </td>
              <td class="text-end">{{ item.quantidade }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styleUrls: ['./grafico-pa-barras.component.css']
})
export class GraficoPaBarrasComponent implements AfterViewInit, OnDestroy {
  private chart!: Chart;
  private graficosService = inject(GraficosService);

  tabelaDados: { label: string; quantidade: number; cor: string }[] = [];

  private coresBase = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
    '#9966FF', '#FF9F40', '#8A2BE2', '#00FA9A',
    '#FF4500', '#DAA520', '#20B2AA', '#FF1493'
  ];

  ngAfterViewInit(): void {
    this.graficosService.getGraficoPaBarra().subscribe((data: PaAgrupado[]) => {
      if (!data || data.length === 0) return;

      const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

      // --- FILTRA DADOS VÁLIDOS ---
      const dadosValidos = data.filter(d => d.quantidade > 0 && d.mes >= 1 && d.mes <= 12);

      // --- AGRUPA POR MÊS ---
      const agrupadoPorMes = new Map<number, number>();
      dadosValidos.forEach(d => {
        agrupadoPorMes.set(d.mes, (agrupadoPorMes.get(d.mes) ?? 0) + d.quantidade);
      });

      // --- PREPARA DADOS PARA O GRÁFICO E TABELA ---
      const labels: string[] = [];
      const valores: number[] = [];
      const cores: string[] = [];

      this.tabelaDados = Array.from(agrupadoPorMes.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([mes, quantidade], index) => {
          const cor = this.coresBase[index % this.coresBase.length];
          const label = meses[mes - 1];
          labels.push(label);
          valores.push(quantidade);
          cores.push(cor);
          return { label, quantidade, cor };
        });

      this.createChart(labels, valores, cores);
    });
  }

  private createChart(labels: string[], valores: number[], cores: string[]): void {
    const ctx = document.getElementById('chartjs-dashboard-graficoPaBarras') as HTMLCanvasElement;
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Quantidade de PAs',
          data: valores,
          backgroundColor: cores,
          borderColor: cores,
          borderWidth: 1
        }]
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 }
          },
          x: {}
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }
}
