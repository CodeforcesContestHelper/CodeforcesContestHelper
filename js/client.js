
try{
	var a = JSON.parse('{"status":"OK","result":{"contest":{"id":1474,"name":"Codeforces Round #696 (Div. 2)","type":"CF","phase":"FINISHED","frozen":false,"durationSeconds":7200,"startTimeSeconds":1611066900,"relativeTimeSeconds":1010322},"problems":[{"contestId":1474,"index":"A","name":"Puzzle From the Future","type":"PROGRAMMING","points":500.0,"rating":800,"tags":["greedy"]},{"contestId":1474,"index":"B","name":"Different Divisors","type":"PROGRAMMING","points":1000.0,"rating":1000,"tags":["binary search","constructive algorithms","greedy","math","number theory"]},{"contestId":1474,"index":"C","name":"Array Destruction","type":"PROGRAMMING","points":1500.0,"rating":1700,"tags":["brute force","constructive algorithms","data structures","greedy","implementation","sortings"]},{"contestId":1474,"index":"D","name":"Cleaning","type":"PROGRAMMING","points":2000.0,"rating":2200,"tags":["data structures","dp","greedy","math"]},{"contestId":1474,"index":"E","name":"What Is It?","type":"PROGRAMMING","points":2250.0,"rating":2500,"tags":["constructive algorithms","greedy"]},{"contestId":1474,"index":"F","name":"1 2 3 4 ...","type":"PROGRAMMING","points":3000.0,"rating":3000,"tags":["dp","math","matrices"]}],"rows":[{"party":{"contestId":1474,"members":[{"handle":"tiger2005"}],"participantType":"CONTESTANT","ghost":false,"room":16,"startTimeSeconds":1611066900},"rank":36,"points":4126.0,"penalty":0,"successfulHackCount":0,"unsuccessfulHackCount":0,"problemResults":[{"points":492.0,"rejectedAttemptCount":0,"type":"FINAL","bestSubmissionTimeSeconds":284},{"points":860.0,"rejectedAttemptCount":2,"type":"FINAL","bestSubmissionTimeSeconds":642},{"points":1338.0,"rejectedAttemptCount":0,"type":"FINAL","bestSubmissionTimeSeconds":1622},{"points":1436.0,"rejectedAttemptCount":2,"type":"FINAL","bestSubmissionTimeSeconds":3502},{"points":0.0,"rejectedAttemptCount":1,"type":"FINAL"},{"points":0.0,"rejectedAttemptCount":0,"type":"FINAL"}]}]}}');
}
catch{
	alert("no");
}
var chart = Highcharts.chart('container', {
		title: {
		    text: null
		},
		yAxis: {
			title: {
				text: null
			},
			reversed: true
		},
		legend: {
			layout: 'none',
			align: 'right',
			verticalAlign: 'middle'
		},
		plotOptions: {
			series: {
				label: {
					connectorAllowed: false
				},
				pointStart: 0
			}
		},
		series: [{
				name: 'Rank',
				data: [43934, 52503, 57177, 69658, 97031, 119931, 137133, 154175]
		}],
		responsive: {
			rules: [{
				condition: {
					maxWidth: 500
				},
				chartOptions: {
					legend: {
						layout: 'horizontal',
						align: 'center',
						verticalAlign: 'bottom'
					}
				}
			}]
		},
		credits:{
		    enabled: false // 禁用版权信息
		}
});