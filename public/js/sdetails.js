let allshuttles = [];

const date = new Date();
month = date.getMonth() + 1;
year = date.getFullYear();

const yearSelect = document.getElementById("year");
const startYear = 2022;
for (let y = startYear; y <= year; y++) {
  const option = document.createElement("option");
  option.value = y;
  option.text = y;
  yearSelect.appendChild(option);
}

document.getElementById("month").value = month;
document.getElementById("year").value = year;

setData(year,month)

function monthSelected(e){
  month = e.value
  setData(year,month)
}

function yearSelected(e){
  year = e.value
  setData(year,month)
}

function syncData(){
  getNewData(year,month)
}

function setSummaryMonthly(year,month){
  // $("#topSpeedShuttle").html("Shuttle#"+localStorage.getItem(`${year}${month}topSpeedBusNumber`));
  $("#avgSpeed").html(localStorage.getItem(`${year}${month}avgSpeedMonthly-${deviceId}`)+"kph");
  $("#topSpeed").html(localStorage.getItem(`${year}${month}topSpeedMonthly-${deviceId}`)+"kph");

  allShuttlesSum = JSON.parse(localStorage.getItem(`${year}${month}allShuttlesSumMonthly-${deviceId}`))

  let dataSeriesAvgTop = [
    {
      name: "Avg",
      data: [],
    },
    {
      name: "Top",
      data: [],
    },
  ];

  allShuttlesSum.sort((a, b)=>{return a._id.day - b._id.day})
  allshuttles = [];
  allShuttlesSum.forEach((s) => {
      allshuttles.push(s._id.day+"-"+month);
    // allshuttles.push("Shuttle#" + s._id.shuttleNumber);
    dataSeriesAvgTop[0].data.push(s.avg_speed);
    dataSeriesAvgTop[1].data.push(s.top_speed);
  });
debugger
  Highcharts.chart("avg-top-speed", {
    chart: {
      type: "column",
    },
    title: {
      text: "",
    },
    // subtitle: {
    //     text: 'All Shuttles'
    // },
    xAxis: {
      categories: allshuttles,
      crosshair: true,
    },
    yAxis: {
      min: 0,
      title: {
        text: "Speed (kph)",
      },
    },
    tooltip: {
      headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
      pointFormat:
        '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
        '<td style="padding:0"><b>{point.y:.1f} kph</b></td></tr>',
      footerFormat: "</table>",
      shared: true,
      useHTML: true,
    },
    plotOptions: {
      column: {
        pointPadding: 0.2,
        borderWidth: 0,
      },
    },
    credits: {
      enabled: false,
    },
    series: dataSeriesAvgTop,
  });
}

function setIdleGraph(idleTime){
  
  idleTime.sort((a, b) =>
    a._id.shuttleNumber.localeCompare(b._id.shuttleNumber)
  );

  dataIdleTime = [
      {
        name: "Idle Time",
        data: [],
      },
  ];
  idleTime.forEach((it) => {
    idleshuttles.push("Shuttle#" +it._id.shuttleNumber);
    dataIdleTime[0].data.push(Math.round(it.idle_time/3600));
  });

  Highcharts.chart("idle-time", {
    chart: {
      type: "column",
    },
    title: {
      text: "",
    },
    // subtitle: {
    //     text: 'All Shuttles'
    // },
    xAxis: {
      categories: idleshuttles,
      crosshair: true,
    },
    yAxis: {
      min: 0,
      title: {
        text: "Time (Hours)",
      },
    },
    tooltip: {
      headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
      pointFormat:
        '<tr><td style="color:{series.color};padding:0">{series.name} :  </td>' +
        '<td style="padding:0"><b> {point.y:.1f} Hours</b></td></tr>',
      footerFormat: "</table>",
      shared: true,
      useHTML: true,
    },
    plotOptions: {
      column: {
        dataLabels: {
            enabled: true
        },
        pointPadding: 0.2,
        borderWidth: 0,
      },
    },
    credits: {
      enabled: false,
    },
    series: dataIdleTime,
  });
}
function setDeviceDistanceGraph(dailyDistance,totalDistance){
  $("#totalDistance").html(totalDistance+" km");
  distances = ''
  allShuttlesSum.forEach((s) => {
    // allshuttles.push("Shuttle#" + s._id.shuttleNumber);
    // dataSeriesAvgTop[0].data.push(s.avg_speed);
    // dataSeriesAvgTop[1].data.push(s.top_speed);
    i = Math.floor((Math.random() * 5) + 1)
    let dd = dailyDistance[s._id.day]
    dd=dd??0;
    let color = 'bg-success';
    if(dd>50){
      color = 'bg-warning'
    }
    if(dd>80){
      color = 'bg-danger'
    }
    distances += `
      <div class="mb-3">
        <div class="small text-gray-500">${s._id.day}-${month}
          <div class="small float-right"><b>${dd} km</b></div>
        </div>
        <div class="progress" style="height: 12px;">
          <div class="progress-bar ${color}" role="progressbar" style="width: ${dd}%"
            aria-valuenow="60" aria-valuemin="0" aria-valuemax="100"></div>
        </div>
      </div>`
  });
  $("#mileage").html(distances);
}
function setData(year,month){
  if(localStorage.getItem(`${year}${month}avgSpeedMonthly-${deviceId}`)){
    setSummaryMonthly(year,month)
  }
  else{
    getNewData(year,month)
  }
  idleshuttles = [];
  idleTime = localStorage.getItem(`${year}${month}idleTimeMonthly-${deviceId}`);
  deviceDistanceMonthly = localStorage.getItem(`${year}${month}deviceDistanceMonthly-${deviceId}`);
  deviceTDistanceMonthly = localStorage.getItem(`${year}${month}deviceTDistanceMonthly-${deviceId}`);

  if(idleTime){
    idleTime = JSON.parse(idleTime)
    setIdleGraph(idleTime);
  }
  if(deviceDistanceMonthly){
    deviceDistanceMonthly = JSON.parse(deviceDistanceMonthly)
    deviceTDistanceMonthly = JSON.parse(deviceTDistanceMonthly)
    setDeviceDistanceGraph(deviceDistanceMonthly,deviceTDistanceMonthly);
  }
}

function getNewData(year,month){
  document.getElementById("syncDataBtn").innerHTML = `<div class="loader"></div>`
  $.ajax({
    url: `/analytics/getDeviceSummaryMonthly/${deviceId}/${year}/${month}`,
    cache: false,
    processData: false,
    type: "GET",
    success: function (data) {
      localStorage.setItem(`${year}${month}avgSpeedMonthly-${deviceId}`,JSON.stringify(data.avg_speed))
      localStorage.setItem(`${year}${month}topSpeedMonthly-${deviceId}`,JSON.stringify(data.top_speed))
      localStorage.setItem(`${year}${month}allShuttlesSumMonthly-${deviceId}`,JSON.stringify(data.allShuttlesSum))
      setSummaryMonthly(year,month);
    },
  });

  // $.ajax({
  //   url: `/getIdleTimeMonthly/${year}/${month}`,
  //   cache: false,
  //   processData: false,
  //   type: "GET",
  //   success: function (data) {
  //     setIdleGraph(data.idleTime);
  //     localStorage.setItem(`${year}${month}idleTimeMonthly`,JSON.stringify(data.idleTime))
  //     document.getElementById("syncDataBtn").innerHTML = `&#x27f3; Sync`
  //   },
  // });

  $.ajax({
    url: `/analytics/shuttlelatlngByMonth/${deviceId}/${year}/${month}`,
    cache: false,
    processData: false,
    type: "GET",
    success: function (data) {
      setDeviceDistanceGraph(data.dailyDistance,data.totalDistance);
      localStorage.setItem(`${year}${month}deviceTDistanceMonthly-${deviceId}`,JSON.stringify(data.totalDistance))
      localStorage.setItem(`${year}${month}deviceDistanceMonthly-${deviceId}`,JSON.stringify(data.dailyDistance))
      document.getElementById("syncDataBtn").innerHTML = `&#x27f3; Sync`
    },
  });
}