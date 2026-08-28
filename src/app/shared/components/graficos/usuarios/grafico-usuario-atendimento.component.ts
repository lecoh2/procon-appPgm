import { AfterViewInit, Component, inject, OnDestroy } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { GraficosService } from '../../../../core/services/graficos.service';
import { UsuariosAgrupadosResponse } from '../../../../core/models/usuario/usuarios-agrupados-response';

@Component({
  selector: 'app-grafico-usuario-atendimento',
  standalone: false,
  template: `
    <div class="row">
      <div class="col-12">
        <canvas id="chartjs-dashboard-grafico-usuario-atendimento"></canvas>
      </div>
      <div class="col-12 mt-3">
        <table class="table table-striped mb-0">
          <thead>
            <tr>
              <th>Usuário / Mês</th>
              <th class="text-end">Quantidade</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of tabelaDados">
              <td>
                <i class="fas fa-square-full" [ngStyle]="{'color': item.cor}"></i>
                {{ item.label }}
              </td>
              <td class="text-end">{{ item.quantidade }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styleUrls: ['./grafico-usuario-atendimento.component.css']
})
export class GraficoUsuarioAtendimentoComponent implements AfterViewInit, OnDestroy {
  private chart!: Chart;
  private graficosService = inject(GraficosService);

  tabelaDados: { label: string; quantidade: number; cor: string }[] = [];

  private coresBase = [
    '#8E24AA', '#7CB342', '#00ACC1', '#FDD835', '#F4511E', '#1E88E5',
    '#FB8C00', '#43A047', '#3949AB'
  ];

  ngAfterViewInit(): void {
    this.graficosService.getGraficoUsurioAtendimento()
      .subscribe((data: UsuariosAgrupadosResponse[]) => {
        if (!data || data.length === 0) return;

        const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

        // Filtra apenas itens com atendimentos (>0) e mês válido
        const dadosValidos = data.filter(d => d.quantidadeAtendimentos > 0 && d.mes >= 1 && d.mes <= 12);

        this.tabelaDados = [];
        const labels: string[] = [];
        const valores: number[] = [];
        const cores: string[] = [];

        dadosValidos.forEach((d, index) => {
          const cor = this.coresBase[index % this.coresBase.length];
          const label = `${d.nomeUsuario} (${meses[d.mes - 1]})`;

          this.tabelaDados.push({
            label,
            quantidade: d.quantidadeAtendimentos,
            cor
          });

          labels.push(label);
          valores.push(d.quantidadeAtendimentos);
          cores.push(cor);
        });

        this.createChart(labels, valores, cores);
      });
  }

  private createChart(labels: string[], valores: number[], cores: string[]): void {
    const ctx = document.getElementById('chartjs-dashboard-grafico-usuario-atendimento') as HTMLCanvasElement;
    this.chart = new Chart(ctx, {
      type: 'bar',
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
