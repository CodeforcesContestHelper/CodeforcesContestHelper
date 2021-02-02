var isFold = false;
var lockStatus = false;
var blankTip = true;
var showUnofficialIf = false;
var Username = "", ContestID = 0;
var SelectContestTime = false;
var SelectContestIndex = 0;
var changeDate = new Date();
var StartTime, EndTime;
var RankData = [];
var CurrentStatus;
var OpenRankMonitor=false;
// var nw = require('nw.gui');
var win = nw.Window.get();
win.setAlwaysOnTop(true);
function getChart(data){
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
					maxWidth: 500,
					maxHeight: 200,
					minHeight: 200
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

//
var LastRankInfo = 0;
var SuatusList = [];
var UserScore = {};
var SubmitSeq = [];
var ScorePool = [];
var LengthOfSeq = 0;
function initRankMonitor(){
	$.getJSON("https://codeforces.com/api/contest.status",{
		ContestId: ContestID
	},function(json)){
		json = json. result;
		for(var i=0;i<json.length;i++){
			if(json[i].author.participantType!="CONTESTANT"
			&& json[i].author.participantType!="VIRTUAL")	continue;
			StatusList.push(json[i]);
			if(LengthOfSeq <= json[i].relativeTimeSeconds)
				while(LengthOfSeq <= json[i].relativeTimeSeconds)
					++LengthOfSeq,SubmitSeq.push([]);
			SubmitSeq[json[i].relativeTimeSeconds].push([json[i].author.members[0].handle,json[i].problem.index,json[i]]);
		}
	}
}
//

$('.GraphFolder').click(function(){
	win.setResizable(true);
	if(!isFold)
		$('#highchatrsContainer').css('display','none'),
		$('.GraphFolder').html('<i class="fa fa-angle-down"></i> Unfold'),
		win.resizeTo(350,385),win.moveBy(0,605-385);
	else
		win.resizeTo(350,605),
		win.moveBy(0,385-605),
		$('#highchatrsContainer').css('display','block'),
		$('.GraphFolder').html('<i class="fa fa-angle-up"></i> Fold');
	isFold = !isFold;
	win.setResizable(false);
});
function closeIf(){
	if(lockStatus)	return;
	win.close(true);
}
function lockIfClick(){
	if(!lockStatus)
		$('input').attr('readonly',true),
		$('select').attr('disabled',true),
		$('.CloseButton').html('<i class="fa fa-ban style_error"></i>'),
		$('.LockButton').html('<i class="fa fa-lock"></i>');
	else
		$('input').attr('readonly',false),
		$('select').attr('disabled',false),
		$('.CloseButton').html('<i class="fa fa-times style_error"></i>'),
		$('.LockButton').html('<i class="fa fa-unlock"></i>');
	lockStatus=!lockStatus;
}
function showUnofficialIfClick(){
	if(!showUnofficialIf)
		$('.UnofficialButton').html('<i class="fa fa-users"></i>');
	else
		$('.UnofficialButton').html('<i class="fa fa-user"></i>');
	showUnofficialIf=!showUnofficialIf;
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
	$('.ProblemList').html('');
	if(a.length==0){
		$('.ProblemList').html('<div style="height:100%;display: flex;align-items: center;justify-content: center;vertical-align:center">Blank</div>');
		blankTip = true;return;
	}
	blankTip = false;
	for(var i=0;i<a.length;i++)
		$('.ProblemList').append(`<div class="SingleProblem"><div class="BackgroundPic">${a[i]}</div><span class="ProblemResult ${b[i][3]}">${b[i][0]}</span></br><span class="TimeUsed">${b[i][1]}</span></br><hr><span class="ProblemScore">${b[i][2]}</span></div>`);
}
function ProblemListAppend(a,b,c,d){
	if(blankTip == true){
		blankTip = false;
		$('.ProblemList').html('');
	}
	$('.ProblemList').append(`<div class="SingleProblem"><div class="BackgroundPic">#</div><span class="ProblemResult ProblemCoding">${a}</span></br><span class="TimeUsed"><span class="style_accept">+${c}</span>:<span class="style_error">-${d}</span></span></br><hr><span class="ProblemScore">${b}</span></div>`);
}
function getApiInfo(cD){
	if(cD<changeDate)	return;
	var sTo=setTimeout(function(){getApiInfo(cD);}, 30000);
	$('.ConnectionStatus').html('<i class="fa fa-spin fa-refresh"></i> Getting Standings...');
	$('.SendButton').html('<i class="fa fa-spin fa-refresh"></i>');
	$.getJSON("https://codeforces.com/api/contest.standings",{
		contestId: ContestID,
		handles: Username,
		showUnofficial: showUnofficialIf
	},function(json){
		if(cD<changeDate)	return;
		$(".ContestIdNumber").html("#"+ContestID);
		json = json.result;
		console.log(json);
		$('.ContestTypeChosen').html('');
		for(var i=0;i<json.rows.length;i++)
			$('.ContestTypeChosen').append(`<option value="${i}">${(new Date(json.rows[i].party.startTimeSeconds*1000)).pattern("YY-MM-dd hh:mm")} ${json.rows[i].party.participantType}</option>`);
		if(SelectContestIndex<0 || SelectContestIndex>=json.rows.length)
			SelectContestTime=false;
		if(!SelectContestTime)
			SelectContestIndex=json.rows.length-1,
			SelectContestTime=true;
		$('.ContestTypeChosen:first').val(SelectContestIndex);
		StartTime = json.contest.startTimeSeconds;
		if(json.rows.length!=0)
			StartTime = json.rows[SelectContestIndex].party.startTimeSeconds;
		EndTime = StartTime + json.contest.durationSeconds;
		StartTime = new Date(StartTime * 1000);
		EndTime = new Date(EndTime * 1000);
		var currT = new Date();
		$('.ConnectionStatus').html('<i class="fa fa-check style_accept"></i> Updated! ['+currT.pattern("hh:mm:ss")+']');
		$('.SendButton').html('<i class="fa fa-send"></i>');
		$('.ContestName').html(json.contest.name);
		CurrentStatus = json.contest.phase;
		if(currT<StartTime)	CurrentStatus="BEFORE";
		else if(currT<EndTime)	CurrentStatus="CODING";
		if(CurrentStatus=="BEFORE"){
			$('.ProblemList').html('<div style="height:100%;display: flex;align-items: center;justify-content: center;vertical-align:center">Blank</div>');
			blankTip = true;
			setTimeout(flushTimeIndex(cD), 0);
			clearTimeout(sTo);
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
					reslList.push(['?','--:--','0','ProblemUnknown']);
				getProblemList(probList, reslList);
				$('.CurrentRating').html("#?");
				$('#highchatrsContainer').html('<div style="height:100%;display: flex;align-items: center;justify-content: center;vertical-align:center">Blank</div>');
				return;
			}
			json = json.rows[SelectContestIndex];
			$('.UserType').html(json.party.participantType);
			if(json.party.participantType=="PRACTICE"){
				$('.CurrentRating').html("#?");
				$('#highchatrsContainer').html('<div style="height:100%;display: flex;align-items: center;justify-content: center;vertical-align:center">Blank</div>');
			}
			else{
				$('.CurrentRating').html('#'+json.rank);
				RankData.push([Number(new Date())-currT.getTimezoneOffset()*60000,json.rank]);
				getChart(RankData);
			}
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
				if(se==undefined || json.party.participantType=="PRACTICE")	se='--:--';
				else se=getTimeLength(se*1000);
				reslList.push([fr,se,json.problemResults[i].points,ProblemType]);
			}
			getProblemList(probList, reslList);
			ProblemListAppend(json.penalty, json.points, json.successfulHackCount, json.unsuccessfulHackCount);
			if(CurrentStatus == "CODING")
				setTimeout(flushTimeIndex(cD), 0);
			else if(CurrentStatus == "PENDING_SYSTEM_TEST")
				$('.ContestStatus').html('Pending System Test...');
			else if(CurrentStatus == "SYSTEM_TEST")
				$('.ContestStatus').html('System Testing...');
			else if(json.party.participantType=="PRACTICE")
				$('.ContestStatus').html('Finished');
			else if(CurrentStatus == "FINISHED")
				$('.ContestStatus').html('Finished'),
				clearTimeout(sTo);
		}
	}).fail(function(jqXHR, status, error){
		console.log(jqXHR);
		var ec = jqXHR.responseJSON.comment, ref = false;
		$('.ConnectionStatus').html('<i class="fa fa-times style_error"></i> '+(ec.substr(0,8)==='handles:'?'Username Not Found!':(ec.substr(0,10)==='contestId:'?'Contest Not Found!':(ref=true,"Cannot Get Standings!"))));
		$('.SendButton').html('<i class="fa fa-send"></i>');
		if(!ref)
			clearTimeout(sTo);
	});
}
function changeUserInfo(){
	var un = $('.UsernameInput:first').val();
	var ci = $('.ContestIDInput:first').val();
	$('.ConnectionStatus').html('<i class="fa fa-spin fa-refresh"></i> Checking Information...');
	if(un.length<3 || un.length>24){
		$('.ConnectionStatus').html('<i class="fa fa-times style_error"></i> Username Incorrect!');
		return;
	}
	for(var i=0;i<un.length;i++)
		if(!((un[i]>='a' && un[i]<='z') || (un[i]>='A' && un[i]<='Z') || (un[i]>='0' && un[i]<='9') || un[i]=='_' || un[i]=='.')){
			$('.ConnectionStatus').html('<i class="fa fa-times style_error"></i> Username Inorrect!');
			return;
		}
	if(ci.length==0){
		$('.ConnectionStatus').html('<i class="fa fa-times style_error"></i> Contest ID Incorrect!');
		return;
	}
	for(var i=0;i<ci.length;i++)
		if(ci[i]<'0' || ci[i]>'9'){
			$('.ConnectionStatus').html('<i class="fa fa-times style_error"></i> Contest ID Incorrect!');
			return;
		}
	if(Username == un && ContestID == Number(ci)){
		changeDate = new Date();
		if($('.ContestTypeChosen').html()!=''){
			SelectContestTime=true;
			SelectContestIndex=Number($('.ContestTypeChosen:first').val());
		}
		RankData = [];
		getApiInfo(new Date());
		return;
	}
	changeDate = new Date();
	Username = un;
	ContestID = ci;
	RankData = [];
	SelectContestTime = false;
	getApiInfo(new Date());
}
$('.LockButton').attr('onclick','lockIfClick()');
$('.SendButton').attr('onclick','changeUserInfo()');
$('.UnofficialButton').attr('onclick','showUnofficialIfClick()');
$('.CloseButton').attr('onclick','closeIf()');