import { AfterViewInit, Component, inject, OnDestroy } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { GraficosService } from '../../../../core/services/graficos.service';
import { AudienciaAgrupadaResponse } from '../../../../core/models/audiencia/audiencia-agrupada-response';

@Component({
  selector: 'app-doughnut',
  standalone: false,
  template: `
   <div class="row card-grafico">
      
      <div class="col-12 chart-container">
        <canvas id="chartjs-dashboard-doughnut"></canvas>
      </div>

      <div class="col-12 mt-3 table-area">
        <table class="table table-striped mb-0">
          <thead>
            <tr>
              <th>Mês / Tipo</th>
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
  styleUrls: ['./grafico-audiencia.component.css']
})
export class GraficoAudienciaComponent implements AfterViewInit, OnDestroy {
  private chart!: Chart;
  private graficosService = inject(GraficosService);

  tabelaDados: { label: string; quantidade: number; cor: string }[] = [];

  private coresBase = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
    '#9966FF', '#FF9F40', '#8A2BE2', '#00FA9A',
    '#FF4500', '#DAA520', '#20B2AA', '#FF1493'
  ];

  ngAfterViewInit(): void {
    this.graficosService.getGraficoAudiencia().subscribe((data: AudienciaAgrupadaResponse[]) => {
      if (!data || data.length === 0) return;

      const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

      // --- Extrai tipos válidos ---
      const tipos = Array.from(new Set(data.map(d => d.tipo).filter(t => t && t.trim() !== '')));

      // --- Cores por tipo ---
      const corPorTipo = new Map<string, string>();
      tipos.forEach((tipo, index) => corPorTipo.set(tipo, this.coresBase[index % this.coresBase.length]));

      const labels: string[] = [];
      const valores: number[] = [];
      const cores: string[] = [];

      // --- Agrupamento para a tabela ---
      const agrupadoPorTipo = new Map<string, number>();

      data.forEach(d => {
        // Ignora registros com tipo vazio ou quantidade zero
        if (!d.tipo || d.tipo.trim() === '' || d.quantidade === 0) return;
        if (d.mes < 1 || d.mes > 12) return;

        const labelGrafico = `${meses[d.mes - 1]} / ${d.tipo}`;

        // GRÁFICO
        labels.push(labelGrafico);
        valores.push(d.quantidade);
        cores.push(corPorTipo.get(d.tipo)!);

        // TABELA
        agrupadoPorTipo.set(labelGrafico, (agrupadoPorTipo.get(labelGrafico) ?? 0) + d.quantidade);
      });

      // --- Monta tabela ---
      this.tabelaDados = Array.from(agrupadoPorTipo.entries()).map(([label, quantidade]) => ({
        label,
        quantidade,
        cor: corPorTipo.get(label.split(' / ')[1])! // extrai o tipo para pegar a cor
      }));

      this.createChart(labels, valores, cores);
    });
  }

  private createChart(labels: string[], valores: number[], cores: string[]): void {
    const ctx = document.getElementById('chartjs-dashboard-doughnut') as HTMLCanvasElement;
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
