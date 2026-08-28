import { AfterViewInit, Component, OnDestroy, inject } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { GraficosService } from '../../../../core/services/graficos.service';
import { NotificaoAgrupadaResponse } from '../../../../core/models/notificacao/notificacao-agrupada-response';

@Component({
  selector: 'app-notificacao',
  standalone: false,
  template: `
    <div class="row">
      <div class="col-12">
        <div style="height: 400px;">
          <canvas id="chartjs-dashboard-graficoNotificacao"></canvas>
        </div>
      </div>

      <div class="col-12 mt-3">
        <table class="table table-striped mb-0">
          <thead class="table mb-0">
            <tr>
              <th>Mês / Tipo</th>
              <th class="text-end">Quantidade</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of tabelaDados">
              <td>
                <i class="fas fa-square-full me-2" [ngStyle]="{'color': item.cor}"></i>
                {{ item.label }}
              </td>
              <td class="text-end fw-bold">{{ item.quantidade }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styleUrls: ['./grafico-notificacao.component.css']
})
export class GraficoNotificacaoComponent implements AfterViewInit, OnDestroy {
  private chart!: Chart;
  private graficosService = inject(GraficosService);

  tabelaDados: { label: string; quantidade: number; cor: string }[] = [];

  private coresBase = [
    '#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0',
    '#9966FF', '#FF9F40', '#8A2BE2', '#00FA9A',
    '#FF4500', '#DAA520', '#20B2AA', '#FF1493',
  ];

  ngAfterViewInit(): void {
    this.graficosService.getGraficoNotificacao().subscribe((data: NotificaoAgrupadaResponse[]) => {
      if (!data || data.length === 0) return;

      const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

      // Tipos únicos (ex: Notificação, Intimação)
      const tipos = Array.from(new Set(data.map(d => d.tipo).filter(t => t && t.trim() !== '')));

      // Define cor para cada tipo
      const corPorTipo = new Map<string, string>();
      tipos.forEach((tipo, index) => corPorTipo.set(tipo, this.coresBase[index % this.coresBase.length]));

      // Gera datasets por tipo
      const datasets = tipos.map(tipo => {
        const valoresPorMes = meses.map((_, i) => {
          const registro = data.find(d => d.tipo === tipo && d.mes === i + 1);
          return registro ? registro.quantidade : 0;
        });

        return {
          label: tipo,
          data: valoresPorMes,
          borderColor: corPorTipo.get(tipo),
          backgroundColor: corPorTipo.get(tipo),
          borderWidth: 3,
          fill: true,
          tension: 0.4, // suavização da curva
          pointRadius: 5,
          pointBackgroundColor: corPorTipo.get(tipo),
          pointHoverRadius: 7,
        };
      });

      // Monta tabela com meses que possuem valores > 0
      const agrupadoPorTipoMes: { label: string; quantidade: number; cor: string }[] = [];
      data
        .filter(d => d.quantidade > 0)
        .forEach(d => {
          const label = `${meses[d.mes - 1]} / ${d.tipo}`;
          agrupadoPorTipoMes.push({
            label,
            quantidade: d.quantidade,
            cor: corPorTipo.get(d.tipo)!,
          });
        });

      this.tabelaDados = agrupadoPorTipoMes;

      this.createChart(meses, datasets);
    });
  }

  private createChart(labels: string[], datasets: any[]): void {
    const ctx = document.getElementById('chartjs-dashboard-graficoNotificacao') as HTMLCanvasElement;

    this.chart = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          title: {
            display: true,
            text: '',
            font: { size: 16 }
          },
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              usePointStyle: true,
              font: { size: 12 }
            }
          },
          tooltip: {
            enabled: true,
            callbacks: {
              label: (context) => `${context.dataset.label}: ${context.formattedValue}`
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Mês'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Quantidade'
            },
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }
}
