function handleShowChartpH() {
    var dps = []; // dataPoints
        var chart = new CanvasJS.Chart("chartContainer-pH", {
            title :{
                text: "PH chart Value"
            },
            axisX:{
                title: "Time (s)",
                valueFormatString: "E0",
            },
            axisY:{
                title: "PH value",
                stripLines: [{
                    value: 7.5,
                    label: "Average"
                }]
            },
            data: [{
                type: "line",
                dataPoints: dps
            }]
        });

    socket.on("server-send-data-ph-to-chart", function(data1, data2){
        dps.push({
            x: parseFloat(data2),
            y: parseFloat(data1)
        });
        //console.log(dps.length)
        if (dps.length > 15) {
            dps.shift();
        }
        chart.render();
    })
};

	

function handleShowChartTurbidity() {

    var dps = []; // dataPoints
    var chart = new CanvasJS.Chart("chartContainer-doduc", {
        title :{
            text: "Turbidity chart value"
        },
        axisX:{
            title: "Time (s)",
            valueFormatString: "E0",
        },
        axisY:{
            title: "Turbidity value",
            stripLines: [{
                value: 500,
                label: "Average"
            }]
        },
        data: [{
            type: "line",
            dataPoints: dps
        }]
    });

    socket.on("server-send-data-turbid-to-chart", function(data1, data2){
        dps.push({
            x: parseFloat(data2),
            y: parseFloat(data1)
        });
        //console.log(dps.length)
        if (dps.length > 15) {
            dps.shift();
        }
        chart.render();
    })
    
}

function handleShowChartGather() {
    const data=[];
    var chart = new CanvasJS.Chart("chartContainer", {
        animationEnabled: true,
        title: {
            text: "Water Quality Summary"
        },
        data: [{
            type: "pie",
            startAngle: 240,
            yValueFormatString: "",
            indexLabel: "{label} {y}",
            dataPoints: data
        }]
    });
    socket.on("server-send-data-pH-and-Turbid-to-chart", function(data1, data2){           
        var newdps = [
          { label: "pH",  y: parseFloat(data1)},
          { label: "Turbidity", y: parseFloat(data2)}
        ];
        chart.options.data[0].dataPoints = newdps;
        chart.render();
    });
}

window.addEventListener('load', function () {
    handleShowChartpH(),
    handleShowChartTurbidity(),
    handleShowChartGather()
})


