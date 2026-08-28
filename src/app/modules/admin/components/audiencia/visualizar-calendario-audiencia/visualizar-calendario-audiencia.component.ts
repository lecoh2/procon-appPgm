import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';  
import { CalendarOptions, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import { AudienciaService } from '../../../../../core/services/audiencia.service';

@Component({
  selector: 'app-visualizar-calendario-audiencia',
  standalone: false,
  templateUrl: './visualizar-calendario-audiencia.component.html'
})
export class VisualizarCalendarioAudienciaComponent implements OnInit {

  calendarOptions: CalendarOptions;

  constructor(
    private audienciaService: AudienciaService,
    private router: Router
  ) {
    this.calendarOptions = {
      initialView: 'dayGridMonth',
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      locales: [ptBrLocale],
      locale: 'pt-br',
      events: [],
      eventContent: this.renderEventContent,
      eventClick: this.handleEventClick.bind(this),
    };
  }

  ngOnInit(): void {
    this.audienciaService.consultarCalendario().subscribe(reclamacoes => {
      const eventos = reclamacoes.map(r => {
        const data = r.dataAudiencia?.split('T')[0] ?? '';
        const hora = r.hora ?? '';
        const horaFormatada = hora ? hora.toString().substring(0, 5) : '';

        return {
          title: `Reclamação ${r.codigo ?? ''}/${r.anoBase ?? ''} às ${horaFormatada}h`,
          start: `${data}T${horaFormatada}`,
          allDay: false,
          extendedProps: {
            codigo: r.codigo,
            anoBase: r.anoBase,
            idReclamacao: r.idReclamacao,
            jaVirouAudiencia: r.jaVirouAudiencia  // Flag para audiência já criada
          }
        };
      });
      this.calendarOptions = {
        ...this.calendarOptions,
        events: eventos
      };
    });
  }
renderEventContent(arg: any) {
  const jaVirou = arg.event.extendedProps['jaVirouAudiencia'];

  const color = jaVirou ? '#52c41a' : '#cf1322'; // verde ou vermelho forte para borda
  const icon = jaVirou ? '✅' : '📌';
  const backgroundColor = jaVirou ? '#d9f7be' : '#fed3d3ff'; // verde clarinho ou vermelho clarinho

  return {
    html: `
      <div style="
        background-color: ${backgroundColor};
        border-left: 4px solid ${color};
        padding: 6px 4px;
        border-radius: 8px;
        font-size: 0.8em;
        font-weight: 500;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        display: flex;
        align-items: center;
        gap: 4px;
        cursor: pointer;
        color: #1a1a1a;
      ">
        <span style="color: ${color};">${icon}</span>
        <span>${arg.event.title}</span>
      </div>
    `
  };
}



  handleEventClick(clickInfo: EventClickArg) {
    const jaVirou = clickInfo.event.extendedProps['jaVirouAudiencia'];

    if (jaVirou) {
      alert('Esta reclamação já virou uma audiência!');
      return; // bloqueia navegação para criação duplicada
    }

    const codigo = clickInfo.event.extendedProps['codigo'];
    const anoBase = clickInfo.event.extendedProps['anoBase'];

    if (codigo && anoBase) {
      this.router.navigate(['/admin/cadastrar-audiencia'], {
        queryParams: {
          codigo: codigo,
          anoBase: anoBase
        }
      });
    }
  }
}
