declare var $: any;

export function configurarDataTablesPadrao(): void {
  $.extend(true, $.fn.dataTable.defaults, {
    responsive: true,
    language: {
      url: 'assets/appprocon/datatable/datatable-ptbr.json'
    }
  });
}