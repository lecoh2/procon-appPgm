import { AfterViewInit, Component, inject, OnDestroy } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { GraficosService } from '../../../../core/services/graficos.service';
import { ReclamacaoAgrupadaResponse } from '../../../../core/models/reclamacao/reclamacao-agrupada.response';

@Component({
  selector: 'app-reclamacao-pizza',
  standalone: false,
  template: `
<div class="row card-grafico">
  <div class="col-12 chart-container">
    <canvas id="chartjs-dashboard-reclamacao-pizza"></canvas>
  </div>

  <div class="col-12 mt-3 table-area">
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
  styleUrls: ['./grafico-reclamacao-pizza.component.css']
})
export class GraficoReclamacaoPizzaComponent implements AfterViewInit, OnDestroy {
  private chart!: Chart;
  private graficosService = inject(GraficosService);

  tabelaDados: { label: string; quantidade: number; cor: string }[] = [];

  private coresBase = [
    '#8E24AA', '#7CB342', '#00ACC1',  '#FDD835', '#F4511E','#1E88E5',
    '#FB8C00', '#43A047', 
     '#3949AB', 
  ];

  ngAfterViewInit(): void {
    this.graficosService.getGraficoReclamacaoPizza().subscribe((data: ReclamacaoAgrupadaResponse[]) => {
      if (!data || data.length === 0) return;

      const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

      // Filtra apenas itens com quantidade > 0 e mês válido
      const dadosValidos = data.filter(d => d.quantidade > 0 && d.mes >= 1 && d.mes <= 12);

      // --- Monta tabela por mês ---
      const agrupadoPorMes = new Map<number, number>();
      dadosValidos.forEach(d => {
        agrupadoPorMes.set(d.mes, (agrupadoPorMes.get(d.mes) ?? 0) + d.quantidade);
      });

      this.tabelaDados = [];
      Array.from(agrupadoPorMes.entries())
        .sort((a, b) => a[0] - b[0])
        .forEach(([mes, quantidade], index) => {
          this.tabelaDados.push({
            label: meses[mes - 1],
            quantidade,
            cor: this.coresBase[index % this.coresBase.length]
          });
        });

      // --- Monta gráfico com tipo ao lado do mês ---
      const labels: string[] = [];
      const valores: number[] = [];
      const cores: string[] = [];

      dadosValidos.forEach((d, index) => {
        labels.push(`${meses[d.mes - 1]} - ${d.tipo}`);
        valores.push(d.quantidade);
        cores.push(this.coresBase[index % this.coresBase.length]);
      });

      this.createChart(labels, valores, cores);
    });
  }

  private createChart(labels: string[], valores: number[], cores: string[]): void {
    const ctx = document.getElementById('chartjs-dashboard-reclamacao-pizza') as HTMLCanvasElement;
    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: valores,
          backgroundColor: cores,
          borderColor: cores
        }]
      },
      options: {
        maintainAspectRatio: false,
        plugins: { legend: { display: false } }
      }
    });
  }
  ngOnDestroy(): void {
    this.chart?.destroy();
  }
}
