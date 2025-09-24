(function($) {
  'use strict';
  $(function() {
    // Assuming Firebase is already initialized elsewhere in your code
// Assuming Firebase is already initialized elsewhere in your code

if ($("#performanceLine").length) {
  const ctx = document.getElementById('performanceLine');
  var graphGradient = ctx.getContext('2d');
  var graphGradient2 = ctx.getContext('2d');
  var saleGradientBg = graphGradient.createLinearGradient(5, 0, 5, 100);
  saleGradientBg.addColorStop(0, 'rgba(26, 115, 232, 0.18)');
  saleGradientBg.addColorStop(1, 'rgba(26, 115, 232, 0.02)');
  var saleGradientBg2 = graphGradient2.createLinearGradient(100, 0, 50, 150);
  saleGradientBg2.addColorStop(0, 'rgba(0, 208, 255, 0.19)');
  saleGradientBg2.addColorStop(1, 'rgba(0, 208, 255, 0.03)');

  // Helper function to get the start of the week
  function getStartOfWeek(date) {
    const diff = date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  }

  // Helper function to format date as YYYY-MM-DD
  function formatDate(date) {
    return date.toISOString().split('T')[0];
  }

  // Helper function to get day name
  function getDayName(date) {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
  }

  // Function to fetch data from Firestore
  async function fetchPerformanceData() {
    const db = firebase.firestore();
    const performanceRef = db.collection('performance');
    
    const today = new Date();
    const thisWeekStart = getStartOfWeek(new Date(today));
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    const thisWeekData = [];
    const lastWeekData = [];
    const labels = [];

    for (let i = 0; i < 7; i++) {
      const thisWeekDate = new Date(thisWeekStart);
      thisWeekDate.setDate(thisWeekDate.getDate() + i);
      const lastWeekDate = new Date(lastWeekStart);
      lastWeekDate.setDate(lastWeekDate.getDate() + i);

      labels.push(getDayName(thisWeekDate));

      // Count documents for this week's date
      const thisWeekSnapshot = await performanceRef
        .where('date', '==', formatDate(thisWeekDate))
        .get();
      thisWeekData.push(thisWeekSnapshot.size);

      // Count documents for last week's date
      const lastWeekSnapshot = await performanceRef
        .where('date', '==', formatDate(lastWeekDate))
        .get();
      lastWeekData.push(lastWeekSnapshot.size);
    }

    return { labels, thisWeekData, lastWeekData };
  }

  // Fetch data and create chart
  fetchPerformanceData().then(({ labels, thisWeekData, lastWeekData }) => {
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'This week',
          data: thisWeekData,
          backgroundColor: saleGradientBg,
          borderColor: ['#1F3BB3'],
          borderWidth: 1.5,
          fill: true,
          pointBorderWidth: 1,
          pointRadius: 4,
          pointHoverRadius: 2,
          pointBackgroundColor: '#1F3BB3',
          pointBorderColor: '#fff',
        },{
          label: 'Last week',
          data: lastWeekData,
          backgroundColor: saleGradientBg2,
          borderColor: ['#52CDFF'],
          borderWidth: 1.5,
          fill: true,
          pointBorderWidth: 1,
          pointRadius: 4,
          pointHoverRadius: 2,
          pointBackgroundColor: '#52CDFF',
          pointBorderColor: '#fff',
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        elements: {
          line: {
            tension: 0.4,
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            border: {
              display: false
            },
            grid: {
              display: true,
              color: "#F0F0F0",
              drawBorder: false,
            },
            ticks: {
              stepSize: 1,
              color: "#6B778C",
              font: {
                size: 10,
              }
            }
          },
          x: {
            border: {
              display: false
            },
            grid: {
              display: false,
              drawBorder: false,
            },
            ticks: {
              color: "#6B778C",
              font: {
                size: 10,
              }
            }
          }
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: ${context.parsed.y} records`;
              }
            }
          }
        }
      },
      plugins: [{
        afterDatasetUpdate: function (chart, args, options) {
          const chartId = chart.canvas.id;
          const legendId = `${chartId}-legend`;
          const ul = document.createElement('ul');
          for(let i = 0; i < chart.data.datasets.length; i++) {
            ul.innerHTML += `
              <li>
                <span style="background-color: ${chart.data.datasets[i].borderColor}"></span>
                ${chart.data.datasets[i].label}
              </li>
            `;
          }
          return document.getElementById(legendId).appendChild(ul);
        }
      }]
    });
  }).catch(error => {
    console.error("Error fetching performance data:", error);
  });
}

    if ($("#status-summary").length) { 
      const statusSummaryChartCanvas = document.getElementById('status-summary');
      new Chart(statusSummaryChartCanvas, {
        type: 'line',
        data: {
          labels: ["SUN", "MON", "TUE", "WED", "THU", "FRI"],
          datasets: [{
              label: '# of Votes',
              data: [50, 68, 70, 10, 12, 80],
              backgroundColor: "#ffcc00",
              borderColor: [
                  '#01B6A0',
              ],
              borderWidth: 2,
              fill: false, // 3: no fill
              pointBorderWidth: 0,
              pointRadius: [0, 0, 0, 0, 0, 0],
              pointHoverRadius: [0, 0, 0, 0, 0, 0],
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          elements: {
            line: {
                tension: 0.4,
            }
        },
          scales: {
            y: {
              border: {
                display: false
              },
              display: false,
              grid: {
                display: false,
              },
            },
            x: {
              border: {
                display: false
              },
              display: false,
              grid: {
                display: false,
              }
            }
          },
          plugins: {
            legend: {
                display: false,
            }
          }
        }
      });
    }

    if ($("#marketingOverview").length) { 
      const marketingOverviewCanvas = document.getElementById('marketingOverview');
      new Chart(marketingOverviewCanvas, {
        type: 'bar',
        data: {
          labels: ["JAN","FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"],
          datasets: [{
            label: 'Last week',
            data: [110, 220, 200, 190, 220, 110, 210, 110, 205, 202, 201, 150],
            backgroundColor: "#52CDFF",
            borderColor: [
                '#52CDFF',
            ],
              borderWidth: 0,
              barPercentage: 0.35,
              fill: true, // 3: no fill
              
          },{
            label: 'This week',
            data: [215, 290, 210, 250, 290, 230, 290, 210, 280, 220, 190, 300],
            backgroundColor: "#1F3BB3",
            borderColor: [
                '#1F3BB3',
            ],
            borderWidth: 0,
              barPercentage: 0.35,
              fill: true, // 3: no fill
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          elements: {
            line: {
                tension: 0.4,
            }
        },
        
          scales: {
            y: {
              border: {
                display: false
              },
              grid: {
                display: true,
                drawTicks: false,
                color:"#F0F0F0",
                zeroLineColor: '#F0F0F0',
              },
              ticks: {
                beginAtZero: false,
                autoSkip: true,
                maxTicksLimit: 4,
                color:"#6B778C",
                font: {
                  size: 10,
                }
              }
            },
            x: {
              border: {
                display: false
              },
              stacked: true,
              grid: {
                display: false,
                drawTicks: false,
              },
              ticks: {
                beginAtZero: false,
                autoSkip: true,
                maxTicksLimit: 7,
                color:"#6B778C",
                font: {
                  size: 10,
                }
              }
            }
          },
          plugins: {
            legend: {
                display: false,
            }
          }
        },
        plugins: [{
          afterDatasetUpdate: function (chart, args, options) {
              const chartId = chart.canvas.id;
              var i;
              const legendId = `${chartId}-legend`;
              const ul = document.createElement('ul');
              for(i=0;i<chart.data.datasets.length; i++) {
                  ul.innerHTML += `
                  <li>
                    <span style="background-color: ${chart.data.datasets[i].borderColor}"></span>
                    ${chart.data.datasets[i].label}
                  </li>
                `;
              }
              return document.getElementById(legendId).appendChild(ul);
            }
        }]
      });
    }

    if ($('#totalVisitors').length) {
      var bar = new ProgressBar.Circle(totalVisitors, {
        color: '#fff',
        // This has to be the same size as the maximum width to
        // prevent clipping
        strokeWidth: 15,
        trailWidth: 15, 
        easing: 'easeInOut',
        duration: 1400,
        text: {
          autoStyleContainer: false
        },
        from: {
          color: '#52CDFF',
          width: 15
        },
        to: {
          color: '#677ae4',
          width: 15
        },
        // Set default step function for all animate calls
        step: function(state, circle) {
          circle.path.setAttribute('stroke', state.color);
          circle.path.setAttribute('stroke-width', state.width);
  
          var value = Math.round(circle.value() * 100);
          if (value === 0) {
            circle.setText('');
          } else {
            circle.setText(value);
          }
  
        }
      });
  
      bar.text.style.fontSize = '0rem';
      bar.animate(.64); // Number from 0.0 to 1.0
    }

    if ($('#visitperday').length) {
      var bar = new ProgressBar.Circle(visitperday, {
        color: '#fff',
        // This has to be the same size as the maximum width to
        // prevent clipping
        strokeWidth: 15,
        trailWidth: 15,
        easing: 'easeInOut',
        duration: 1400,
        text: {
          autoStyleContainer: false
        },
        from: {
          color: '#34B1AA',
          width: 15
        },
        to: {
          color: '#677ae4',
          width: 15
        },
        // Set default step function for all animate calls
        step: function(state, circle) {
          circle.path.setAttribute('stroke', state.color);
          circle.path.setAttribute('stroke-width', state.width);
  
          var value = Math.round(circle.value() * 100);
          if (value === 0) {
            circle.setText('');
          } else {
            circle.setText(value);
          }
  
        }
      });
  
      bar.text.style.fontSize = '0rem';
      bar.animate(.34); // Number from 0.0 to 1.0
    }

    if ($("#doughnutChart").length) { 
      const doughnutChartCanvas = document.getElementById('doughnutChart');
      new Chart(doughnutChartCanvas, {
        type: 'doughnut',
        data: {
          labels: ['Total','Net','Gross','AVG'],
          datasets: [{
            data: [40, 20, 30, 10],
            backgroundColor: [
              "#1F3BB3",
              "#FDD0C7",
              "#52CDFF",
              "#81DADA"
            ],
            borderColor: [
              "#1F3BB3",
              "#FDD0C7",
              "#52CDFF",
              "#81DADA"
            ],
          }]
        },
        options: {
          cutout: 90,
          animationEasing: "easeOutBounce",
          animateRotate: true,
          animateScale: false,
          responsive: true,
          maintainAspectRatio: true,
          showScale: true,
          legend: false,
          plugins: {
            legend: {
                display: false,
            }
          }
        },
        plugins: [{
          afterDatasetUpdate: function (chart, args, options) {
              const chartId = chart.canvas.id;
              var i;
              const legendId = `${chartId}-legend`;
              const ul = document.createElement('ul');
              for(i=0;i<chart.data.datasets[0].data.length; i++) {
                  ul.innerHTML += `
                  <li>
                    <span style="background-color: ${chart.data.datasets[0].backgroundColor[i]}"></span>
                    ${chart.data.labels[i]}
                  </li>
                `;
              }
              return document.getElementById(legendId).appendChild(ul);
            }
        }]
      });
    }

    if ($("#leaveReport").length) { 
      const leaveReportCanvas = document.getElementById('leaveReport');
      new Chart(leaveReportCanvas, {
        type: 'bar',
        data: {
          labels: ["Jan","Feb", "Mar", "Apr", "May"],
          datasets: [{
              label: 'Last week',
              data: [18, 25, 39, 11, 24],
              backgroundColor: "#52CDFF",
              borderColor: [
                  '#52CDFF',
              ],
              borderWidth: 0,
              fill: true, // 3: no fill
              barPercentage: 0.5,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          elements: {
            line: {
                tension: 0.4,
            }
        },
          scales: {
            y: {
              border: {
                display: false
              },
              display: true,
              grid: {
                display: false,
                drawBorder: false,
                color:"rgba(255,255,255,.05)",
                zeroLineColor: "rgba(255,255,255,.05)",
              },
              ticks: {
                beginAtZero: true,
                autoSkip: true,
                maxTicksLimit: 5,
                fontSize: 10,
                color:"#6B778C",
                font: {
                  size: 10,
                }
              }
            },
            x: {
              border: {
                display: false
              },
              display: true,
              grid: {
                display: false,
              },
              ticks: {
                beginAtZero: false,
                autoSkip: true,
                maxTicksLimit: 7,
                fontSize: 10,
                color:"#6B778C",
                font: {
                  size: 10,
                }
              }
            }
          },
          plugins: {
            legend: {
                display: false,
            }
          }
        }
      });
    }


    if ($.cookie('staradmin2-pro-banner')!="true") {
      document.querySelector('#proBanner').classList.add('d-flex');
      document.querySelector('.navbar').classList.remove('fixed-top');
    }
    else {
      document.querySelector('#proBanner').classList.add('d-none');
      document.querySelector('.navbar').classList.add('fixed-top');
    }
    
    if ($( ".navbar" ).hasClass( "fixed-top" )) {
      document.querySelector('.page-body-wrapper').classList.remove('pt-0');
      document.querySelector('.navbar').classList.remove('pt-5');
    }
    else {
      document.querySelector('.page-body-wrapper').classList.add('pt-0');
      document.querySelector('.navbar').classList.add('pt-5');
      document.querySelector('.navbar').classList.add('mt-3');
      
    }
    document.querySelector('#bannerClose').addEventListener('click',function() {
      document.querySelector('#proBanner').classList.add('d-none');
      document.querySelector('#proBanner').classList.remove('d-flex');
      document.querySelector('.navbar').classList.remove('pt-5');
      document.querySelector('.navbar').classList.add('fixed-top');
      document.querySelector('.page-body-wrapper').classList.add('proBanner-padding-top');
      document.querySelector('.navbar').classList.remove('mt-3');
      var date = new Date();
      date.setTime(date.getTime() + 24 * 60 * 60 * 1000); 
      $.cookie('staradmin2-pro-banner', "true", { expires: date });
    });
    
  });
  // iconify.load('icons.svg').then(function() {
  //   iconify(document.querySelector('.my-cool.icon'));
  // });

  
})(jQuery);