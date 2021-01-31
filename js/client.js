function getChart(data){
	console.log(data);
	var chart = Highcharts.chart('highchatrsContainer', {
		chart: {
			zoomType: 'x'
		},
		title: {
		    text: null
		},
		xAxis: {
			type: 'datetime',
			dateTimeLabelFormats: {
				millisecond: '%H:%M:%S.%L',
				second: '%H:%M:%S',
				minute: '%H:%M',
				hour: '%H:%M',
				day: '%m-%d',
				week: '%m-%d',
				month: '%Y-%m',
				year: '%Y'
			}
		},
		tooltip: {
			dateTimeLabelFormats: {
				millisecond: '%H:%M:%S.%L',
				second: '%H:%M:%S',
				minute: '%H:%M',
				hour: '%H:%M',
				day: '%Y-%m-%d',
				week: '%m-%d',
				month: '%Y-%m',
				year: '%Y'
			}
		},
		yAxis: {
			title: {
				text: null
			},
			reversed: true
		},
		legend: {
			enabled: false
		},
		plotOptions: {
			area: {
				fillColor: {
					linearGradient: {
						x1: 0,
						y1: 0,
						x2: 0,
						y2: 1
					},
					stops: [
						[0, new Highcharts.getOptions().colors[0]],
						[1, new Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
					]
				},
				marker: {
					radius: 2
				},
				lineWidth: 1,
				states: {
					hover: {
						lineWidth: 1
					}
				},
				threshold: null
			}
		},
		series: [{
			type: 'area',
			name: 'Rank',
			data: data
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
}
var openStatus = true;
var lockStatus = false;
$('.GraphFolder').click(function(){
	if(openStatus)
		$('#highchatrsContainer').css('display','none'),
		$('.GraphFolder').html('<i class="fa fa-angle-down"></i> Unfold');
	else
		$('#highchatrsContainer').css('display','block'),
		$('.GraphFolder').html('<i class="fa fa-angle-up"></i> Fold');
	openStatus=!openStatus;
});
function lockIf(){
	if(!lockStatus)
		$('input').attr('readonly',true),
		$('.LockButton').html('<i class="fa fa-unlock"></i>');
	else
		$('input').attr('readonly',false),
		$('.LockButton').html('<i class="fa fa-lock"></i>');
	lockStatus=!lockStatus;
}
function getTimeLength(x){
	x = Math.floor(x / 1000 / 60);
	var ret = "";
	var p = x % 60;
	ret = ''+Math.floor(p/10)+p%10;
	x = Math.floor(x/60);
	var p = x % 24;
	ret = ''+Math.floor(p/10)+p%10+':'+ret;
	x = Math.floor(x/24);
	if(x!=0)	ret=''+x+':'+ret;
	return ret;
}
function getTimeLength2(x){
	x = Math.floor(x / 1000);
	var ret = "";
	var p = x % 60;
	ret = ''+Math.floor(p/10)+p%10;
	x = Math.floor(x/60);
	var p = x % 60;
	ret = ''+Math.floor(p/10)+p%10+':'+ret;
	x = Math.floor(x/60);
	var p = x % 24;
	ret = ''+Math.floor(p/10)+p%10+':'+ret;
	x = Math.floor(x/24);
	if(x!=0)	ret=''+x+':'+ret;
	return ret;
}
var Username = "", ContestID = 0;
var changeDate = new Date();
var StartTime, EndTime;
var RankData = [];
var CurrentStatus;
Date.prototype.pattern = function(format) {
    var date = {
       "M+": this.getMonth() + 1,
       "d+": this.getDate(),
       "h+": this.getHours(),
       "m+": this.getMinutes(),
       "s+": this.getSeconds(),
       "q+": Math.floor((this.getMonth() + 3) / 3),
       "S+": this.getMilliseconds()
    };
    if (/(y+)/i.test(format)) {
       format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (var k in date) {
       if (new RegExp("(" + k + ")").test(format)) {
           format = format.replace(RegExp.$1, RegExp.$1.length == 1
              ? date[k] : ("00" + date[k]).substr(("" + date[k]).length));
       }
    }
    return format;
}
function flushTimeIndex(cD){
	if(cD<changeDate)	return;
	var currT = new Date();
	if(currT<=StartTime){
		var diff = Number(StartTime) - Number(currT);
		$('.ContestStatus').html('Contest Starts In '+getTimeLength2(diff));
	}
	else if(currT<=EndTime){
		var diff = Number(EndTime) - Number(currT);
		$('.ContestStatus').html('Contest Ends In '+getTimeLength2(diff));
	}
	else	return;
	setTimeout(function(){flushTimeIndex(cD);},1000);
}
function getProblemList(a,b){
	console.log(a);
	console.log(b);
	$('.ProblemList').html('');
	for(var i=0;i<a.length;i++)
		$('.ProblemList').append(`<div class="SingleProblem"><div class="BackgroundPic">${a[i]}</div><span class="ProblemResult ${b[i][3]}">${b[i][0]}</span></br><span class="TimeUsed">${b[i][1]}</span></br><hr><span class="ProblemScore">${b[i][2]}</span></div>`);
}
function ProblemListAppend(a,b,c,d){
	$('.ProblemList').append(`<div class="SingleProblem"><div class="BackgroundPic">#</div><span class="ProblemResult ProblemCoding">${a}</span></br><span class="TimeUsed">${'+'+c+':-'+d}</span></br><hr><span class="ProblemScore">${b}</span></div>`);
}
function getApiInfo(cD){
	if(cD<changeDate)	return;
	$.getJSON("https://codeforces.com/api/contest.standings",{
		contestId: ContestID,
		handles: Username,
		showUnofficial: false
	},function(json){
		$(".ContestIdNumber").html("#"+ContestID);
		json = json.result;
		console.log(json);
		StartTime = json.contest.startTimeSeconds;
		if(json.rows.length!=0)
			StartTime = json.rows[0].party.startTimeSeconds;
		EndTime = StartTime + json.contest.durationSeconds;
		StartTime = new Date(StartTime * 1000);
		EndTime = new Date(EndTime * 1000);
		var currT = new Date();
		$('.ConnectionStatus').html('<i class="fa fa-check style_accept"></i> Updated! ['+currT.pattern("hh:mm:ss")+']');
		CurrentStatus = json.contest.phase;
		if(CurrentStatus=="BEFORE"){
			$('.ProblemList').html('<div style="text-align:center"></br>Nan</div>');
			setTimeout(flushTimeIndex(cD), 0);
			setTimeout(function(){getApiInfo(cD);}, min(30000, Number(StartTime) - Number(currT)));
		}
		else{
			var probList = [];
			for(var i=0;i<json.problems.length;i++)
				probList.push(json.problems[i].index);
			var reslList = [];
			if(json.rows.length==0){
				$('.ConnectionStatus').html('<i class="fa fa-times style_error"></i> Not In The Contest!');
				for(var i=0;i<probList.length;i++)
					realList.push(['?','--:--','0','ProblemUnknown']);
				getProblemList(probList, reslList);
				return;
			}
			json = json.rows[0];
			$('.CurrentRating').html('#'+json.rank);
			RankData.push([Number(new Date()),json.rank]);
			getChart(RankData);
			for(var i=0;i<probList.length;i++){
				var ProblemType = json.problemResults[i].bestSubmissionTimeSeconds!=undefined?"ProblemAccepted":"ProblemWrong";
				if(ProblemType == "ProblemAccepted" && json.problemResults[i].participantType=="PRELIMINARY" && CurrentStatus=="SYSTEM_TEST")
					ProblemType = "ProblemUnknown";
				if(ProblemType == "ProblemWrong" && CurrentStatus == "CODING")
					ProblemType = "ProblemCoding";
				var fr = "";
				if(ProblemType == "ProblemUnknown")	fr="?";
				else if(ProblemType == "ProblemAccepted")	fr='+'+(json.problemResults[i].rejectedAttemptCount==0?'':json.problemResults[i].rejectedAttemptCount);
				else if(json.problemResults[i].rejectedAttemptCount==0)	fr='';
				else fr='-'+json.problemResults[i].rejectedAttemptCount;
				var se = json.problemResults[i].bestSubmissionTimeSeconds;
				if(se==undefined)	se='--:--';
				else se=getTimeLength(se*1000);
				reslList.push([fr,se,json.problemResults[i].points,ProblemType]);
			}
			getProblemList(probList, reslList);
			ProblemListAppend(json.penalty, json.points, json.successfulHackCount, json.unsuccessfulHackCount);
			setTimeout(function(){getApiInfo(cD);}, 30000);
		}
	}).fail(function(jqXHR, status, error){
		console.log(jqXHR);
		var ec = jqXHR.responseJSON.comment, ref = false;
		$('.ConnectionStatus').html('<i class="fa fa-times style_error"></i> '+(ec.substr(0,8)==='handles:'?'Username Not Found!':(ec.substr(0,10)==='contestId:'?'Contest Not Found!':(ref=true,ec))));
		if(ref){
			setTimeout(function(){getApiInfo(cD);}, 30000);
		}
	});
}
function changeUserInfo(){
	var un = $('.UsernameInput:first').val();
	var ci = $('.ContestIDInput:first').val();
	$('.ConnectionStatus').html('<i class="fa fa-spin fa-refresh"></i> Checking Information...');
	if(un.length<3 || un.length>24){
		$('.ConnectionStatus').html('<i class="fa fa-times style_error"></i> Username Not Correct!');
		return;
	}
	for(var i=0;i<un.length;i++)
		if(!((un[i]>='a' && un[i]<='z') || (un[i]>='A' && un[i]<='Z') || (un[i]>='0' && un[i]<='9') || un[i]=='_')){
			$('.ConnectionStatus').html('<i class="fa fa-times style_error"></i> Username Not Correct!');
			return;
		}
	if(ci.length==0){
		$('.ConnectionStatus').html('<i class="fa fa-times style_error"></i> Contest ID Not Correct!');
		return;
	}
	for(var i=0;i<ci.length;i++)
		if(ci[i]<'0' || ci[i]>'9'){
			$('.ConnectionStatus').html('<i class="fa fa-times style_error"></i> Contest ID Not Correct!');
			return;
		}
	if(Username == un && ContestID == Number(ci))
		return;
	changeDate = new Date();
	Username = un;
	ContestID = ci;
	RankData = [];
	getApiInfo(new Date());
}
$('.LockButton').attr('onclick','lockIf()');
$('.SendButton').attr('onclick','changeUserInfo()');