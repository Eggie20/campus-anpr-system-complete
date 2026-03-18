document.addEventListener('DOMContentLoaded', function() {
  // Theme Colors
  const colors = {
    primary: '#F59E0B', // Gold
    secondary: '#10B981', // Emerald
    tertiary: '#3B82F6', // Blue
    background: '#0F172A', // Navy
    text: '#94A3B8', // Slate-400
    grid: '#334155' // Slate-700
  };

  // 1. Daily Traffic Chart (Area Spline)
  const trafficOptions = {
    series: [{
      name: 'Entries',
      data: [31, 40, 28, 51, 42, 109, 100]
    }, {
      name: 'Exits',
      data: [11, 32, 45, 32, 34, 52, 41]
    }],
    chart: {
      height: 300,
      type: 'area',
      fontFamily: 'Inter, sans-serif',
      toolbar: { show: false },
      background: 'transparent'
    },
    colors: [colors.secondary, colors.tertiary],
    dataLabels: { enabled: false },
    stroke: {
      curve: 'smooth',
      width: 2
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 90, 100]
      }
    },
    xaxis: {
      categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      labels: { style: { colors: colors.text } },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: { style: { colors: colors.text } }
    },
    grid: {
      borderColor: colors.grid,
      strokeDashArray: 4,
      xaxis: { lines: { show: true } }   
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      labels: { colors: colors.text }
    },
    tooltip: {
      theme: 'dark'
    }
  };

  const trafficChart = new ApexCharts(document.querySelector("#dailyTrafficChart"), trafficOptions);
  trafficChart.render();


  // 2. Vehicle Types Chart (Donut)
  const vehicleOptions = {
    series: [62, 28, 10],
    labels: ['Cars', 'Motorcycles', 'Vans/SUVs'],
    chart: {
      type: 'donut',
      height: 280,
      fontFamily: 'Inter, sans-serif',
      background: 'transparent'
    },
    colors: [colors.tertiary, colors.primary, colors.secondary],
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            name: { color: colors.text },
            value: {
              color: '#F8FAFC',
              fontSize: '24px',
              fontWeight: 600
            },
            total: {
              show: true,
              showAlways: true,
              label: 'Total',
              color: colors.text,
              formatter: function (w) {
                return w.globals.seriesTotals.reduce((a, b) => a + b, 0) + "%"
              }
            }
          }
        }
      }
    },
    dataLabels: { enabled: false },
    stroke: { show: false },
    legend: {
      position: 'bottom',
      labels: { colors: colors.text },
      itemMargin: { horizontal: 10, vertical: 5 }
    },
    tooltip: { theme: 'dark' }
  };


  const vehicleChart = new ApexCharts(document.querySelector("#vehicleTypeChart"), vehicleOptions);
  vehicleChart.render();


  // 3. Interactive Vehicle Analytics (Multi-Series Area Chart)
  // Mock Data for Area Chart
  const seriesData = [
    { name: 'Cars', data: [31, 40, 28, 51, 42, 109, 100], color: colors.primary },
    { name: 'Motorcycles', data: [11, 32, 45, 32, 34, 52, 41], color: colors.secondary },
    { name: 'Vans/SUVs', data: [15, 20, 18, 25, 20, 35, 30], color: colors.tertiary }
  ];

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const interactiveOptions = {
    series: seriesData,
    chart: {
      id: 'interactive-area',
      type: 'area', // Changed to Area
      height: 350,
      fontFamily: 'Inter, sans-serif',
      toolbar: { show: false },
      background: 'transparent',
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800
      }
    },
    colors: [colors.primary, colors.secondary, colors.tertiary],
    stroke: {
      curve: 'smooth', // Smooth curves like Daily Traffic
      width: 2
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 90, 100]
      }
    },
    dataLabels: { enabled: false },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      labels: { colors: colors.text }
    },
    xaxis: {
      categories: days,
      labels: {
        style: {
          colors: colors.text,
          fontSize: '12px'
        }
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
      grid: { show: false }
    },
    yaxis: {
      labels: {
        style: { colors: colors.text }
      }
    },
    grid: {
      borderColor: colors.grid,
      strokeDashArray: 4,
      xaxis: { lines: { show: true } } // Show grid lines for time series
    },
    tooltip: {
      theme: 'dark'
    }
  };

  const interactiveChart = new ApexCharts(document.querySelector("#interactiveVehicleChart"), interactiveOptions);
  interactiveChart.render();

  // Filter Buttons Logic (Mock)
  const filterButtons = document.querySelectorAll('[data-range]');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Remove active class from all
      filterButtons.forEach(b => {
          b.classList.remove('btn-primary', 'filter-btn-active');
          b.classList.add('btn-outline');
      });
      // Add active class to clicked
      e.target.classList.remove('btn-outline');
      e.target.classList.add('btn-primary', 'filter-btn-active');
      
      // Simulate Data Update
      const range = e.target.dataset.range;
      
      // Animate new random data
      const newSeries = seriesData.map(s => ({
          name: s.name,
          data: s.data.map(() => Math.floor(Math.random() * 100 + 10))
      }));
      

      interactiveChart.updateSeries(newSeries);
    });
  });
});

