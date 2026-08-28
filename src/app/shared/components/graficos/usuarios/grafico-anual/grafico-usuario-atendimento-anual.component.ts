import { AfterViewInit, Component, inject, OnDestroy } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { GraficosService } from '../../../../../core/services/graficos.service';
import { UsuariosAgrupadosResponse } from '../../../../../core/models/usuario/usuarios-agrupados-response';

@Component({
  selector: 'app-grafico-usuario-atendimento-anual',
  standalone: false,
  template: `
    <div class="row">
      <div class="col-12">
        <canvas id="chartjs-dashboard-grafico-usuario-atendimento-anual"></canvas>
      </div>

      <div class="col-12 mt-3">
        <table class="table table-striped mb-0">
          <thead>
            <tr>
              <th>Usuário</th>
              <th class="text-end">Total no Ano</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of tabelaDados">
              <td>
                <i class="fas fa-square-full me-1" [ngStyle]="{'color': item.cor}"></i>
                {{ item.label }}
              </td>
              <td class="text-end">{{ item.quantidade }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styleUrls: ['./grafico-usuario-atendimento-anual.component.css']
})
export class GraficoUsuarioAtendimentoAnualComponent implements AfterViewInit, OnDestroy {
  private chart!: Chart;
  private graficosService = inject(GraficosService);

  tabelaDados: { label: string; quantidade: number; cor: string }[] = [];

 private coresBase = [
  // Azulados
  '#1E88E5', '#90CAF9','#F4511E', '#E53935','#42A5F5', 
  // Esverdeados
  '#43A047','#FFD54F', '#FFCA28', '#66BB6A',  '#00796B',
  // Roxos e rosas
  '#8E24AA', '#AB47BC', '#BA68C8', '#CE93D8', '#6A1B9A',
  // Alaranjados e vermelhos
  '#FB8C00', '#3949AB', '#5C6BC0', '#FF7043',  '#0D47A1',
  // Amarelados
  '#FDD835',  '#FF8A65','#64B5F6','#FFF176',   '#A5D6A7',
  // Neutros e extras
  '#7CB342','#FBC02D','#81C784', '#00ACC1',  '#26C6DA'
];


  ngAfterViewInit(): void {
    this.graficosService.getGraficoUsurioAtendimentoAnual()
      .subscribe((data: UsuariosAgrupadosResponse[]) => {
        if (!data || data.length === 0) return;

        // ✅ Filtra apenas itens com atendimentos > 0
        const dadosValidos = data.filter(d => d.quantidadeAtendimentos > 0);

        this.tabelaDados = [];
        const labels: string[] = [];
        const valores: number[] = [];
        const cores: string[] = [];

        dadosValidos.forEach((d, index) => {
          const cor = this.coresBase[index % this.coresBase.length];
          const label = d.nomeUsuario; // ✅ agora sem mês

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
    const ctx = document.getElementById('chartjs-dashboard-grafico-usuario-atendimento-anual') as HTMLCanvasElement;
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          data: valores,
          backgroundColor: cores,
          borderColor: cores,
          borderWidth: 1
        }]
      },
      options: {
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Atendimentos'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Usuários'
            }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => `${context.formattedValue} atendimentos`
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
