import { AfterViewInit, Component, inject, OnDestroy } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { GraficosService } from '../../../../core/services/graficos.service';

interface ReclamacaoAgrupada {
  mes: number;
  quantidade: number;
}

@Component({
  selector: 'app-barras',
  standalone: false,
  template: `<canvas id="chartjs-dashboard-bar"></canvas>`,
  styleUrls: ['./barras.component.css']
})
export class BarrasComponent implements AfterViewInit, OnDestroy {
  private chart!: Chart;
  private graficosService = inject(GraficosService);

  private coresBase = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
    '#9966FF', '#FF9F40', '#8A2BE2', '#00FA9A',
    '#FF4500', '#DAA520', '#20B2AA', '#FF1493'
  ];

  ngAfterViewInit(): void {
    this.graficosService.getGraficoBarra().subscribe((data: ReclamacaoAgrupada[]) => {
      if (!data || data.length === 0) return;

      const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

      // --- FILTRA SÓ OS REGISTROS COM QUANTIDADE > 0 ---
      const dadosComQuantidade = data.filter(d => d.quantidade > 0 && d.mes >= 1 && d.mes <= 12);

      // --- AGRUPA POR MÊS ---
      const agrupadoPorMes = new Map<number, number>();
      dadosComQuantidade.forEach(d => {
        agrupadoPorMes.set(d.mes, (agrupadoPorMes.get(d.mes) ?? 0) + d.quantidade);
      });

      // --- CRIA ARRAYS PARA O GRÁFICO ---
      const labels: string[] = [];
      const valores: number[] = [];
      const cores: string[] = [];

      Array.from(agrupadoPorMes.entries())
        .sort((a, b) => a[0] - b[0])
        .forEach(([mes, quantidade], index) => {
          labels.push(meses[mes - 1]);
          valores.push(quantidade);
          cores.push(this.coresBase[index % this.coresBase.length]);
        });

      this.createChart(labels, valores, cores);
    });
  }

  private createChart(labels: string[], valores: number[], cores: string[]): void {
    const ctx = document.getElementById('chartjs-dashboard-bar') as HTMLCanvasElement;
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Quantidade',
          data: valores,
          backgroundColor: cores,
          borderColor: cores
        }]
      },
      options: {
        maintainAspectRatio: false,
        scales: {
          y: { ticks: { stepSize: 20 } },
          x: {}
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }
}
