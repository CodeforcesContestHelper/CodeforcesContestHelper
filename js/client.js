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
var StandingsList = [];
var StandingsID = 0;
var CurrentStatus;
var ContestType;
var OpenRankMonitor=false;
var DarkMode = false;
var VirtualRank = false;
function getPredictedRank(points,penalty,time,openHack){
	if(penalty==undefined)	penalty = 0;
	var returnValue = 1;
	for(var i=0;i<StandingsList.length;i++){
		var _points = 0, _penalty = 0;
		for(var j=0;j<StandingsList[i].problemResults.length;j++){
			if(StandingsList[i].problemResults[j].bestSubmissionTimeSeconds!=undefined
			&& Math.floor(StandingsList[i].problemResults[j].bestSubmissionTimeSeconds/60)<=Math.floor(time/60)){
				_points += StandingsList[i].problemResults[j].points;
				var _dalta = StandingsList[i].problemResults[j].penalty;
				_penalty += (_dalta == undefined ? 0 : _dalta);
			}
		}
		if(ContestType == "CF" && openHack)
			_points = _points + StandingsList[i].successfulHackCount * 100 - StandingsList[i].unsuccessfulHackCount * 50;
		if(points < _points || (points == _points && penalty > _penalty))
			++ returnValue;
	}
	return returnValue;
}
function getOverallPredictedRank(json){
	var currT = StartTime;
	var Step = 60 * 1000;
	var returnValue = [];
	var p = new Date();
	var NoteNumber = Number(EndTime) - Number(StartTime);
	NoteNumber = Math.floor(NoteNumber / Step) + 1;
	var T = 0;
	while(currT <= EndTime){
		$('#highchatrsContainer').children('div').html(`Calculate Rank... [${++T} of ${NoteNumber}]`);
		var currS = 0, currP = 0;
		if(p < changeDate)	return [];
		var openHack = ((Number(EndTime) - Number(currT))/1000<=30*60);
		var time = (Number(currT)-Number(StartTime))/1000;
		for(var j=0;j<json.problemResults.length;j++){
			if(json.problemResults[j].bestSubmissionTimeSeconds!=undefined
			&& json.problemResults[j].bestSubmissionTimeSeconds<=time){
				currS += json.problemResults[j].points;
				var _dalta = json.problemResults[j].penalty;
				currP += (_dalta == undefined ? 0 : _dalta);
			}
		}
		if(ContestType == "CF" && openHack)
			currS = currS + json.successfulHackCount * 100 - json.unsuccessfulHackCount * 50;
		returnValue.push([Number(currT)-currT.getTimezoneOffset()*60*1000,getPredictedRank(currS,currP,time,openHack)]);
		currT = new Date(Number(currT) + Step);
	}
	return returnValue;
}
var win = nw.Window.get();
win.setAlwaysOnTop(true);
var DefaultStyle = JSON.parse(JSON.stringify(Highcharts.getOptions()));
DefaultStyle.yAxis = {gridLineColor: "#E6E6E6"}
var DarkUnica = {
    colors: ['#2b908f', '#90ee7e', '#f45b5b', '#7798BF', '#aaeeee', '#ff0066',
        '#eeaaee', '#55BF3B', '#DF5353', '#7798BF', '#aaeeee'],
    chart: {
        backgroundColor: {
            linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
            stops: [
                [0, '#2a2a2b'],
                [1, '#3e3e40']
            ]
        },
        plotBorderColor: '#606063'
    },
    title: {
        style: {
            color: '#E0E0E3',
            textTransform: 'uppercase',
            fontSize: '20px'
        }
    },
    subtitle: {
        style: {
            color: '#E0E0E3',
            textTransform: 'uppercase'
        }
    },
    tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        style: {
            color: '#F0F0F0'
        }
    },
    plotOptions: {
        series: {
            dataLabels: {
                color: '#F0F0F3',
                style: {
                    fontSize: '13px'
                }
            },
            marker: {
                lineColor: '#333'
            }
        },
        boxplot: {
            fillColor: '#505053'
        },
        candlestick: {
            lineColor: 'white'
        },
        errorbar: {
            color: 'white'
        }
    },
    yAxis: {
    	gridLineColor: "#707073"
    },
    legend: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        itemStyle: {
            color: '#E0E0E3'
        },
        itemHoverStyle: {
            color: '#FFF'
        },
        itemHiddenStyle: {
            color: '#606063'
        },
        title: {
            style: {
                color: '#C0C0C0'
            }
        }
    },
    labels: {
        style: {
            color: '#707073'
        }
    },
};
var chart = undefined;
function getChart(data){
	if(data.length!=0){
		Highcharts.setOptions(DarkMode?DarkUnica:DefaultStyle);
		if(chart!=undefined)
			chart.destroy();
		chart = Highcharts.chart('highchatrsContainer', {
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
			    enabled: false
			}
		});
	}
}
var WinHeight = win.height;
function setSize(y){
	win.resizeTo(win.width,y);
	win.moveBy(0,WinHeight-win.height);
	WinHeight = win.height;
}
$('.GraphFolder').click(function(){
	win.setResizable(true);
	if(!isFold)
		$('#highchatrsContainer').css('display','none'),
		$('.GraphFolder').html('<i class="fa fa-angle-down"></i> Unfold'),
		setSize(375);
	else
		setSize(590),
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
function getVirtualRankIf(){
	if(!VirtualRank)
		$('.VirtualRankButton').html('<i class="fa fa-calculator"></i>');
	else
		$('.VirtualRankButton').html('<i class="fa fa-database"></i>');
	VirtualRank = !VirtualRank;
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
var globalJson;
var LoadingStatus = false;
function killGetStandings(){
	if(LoadingStatus)
		LoadingStatus = false, getStandingsJSONStatus.abort();
}
function refreshStandings(){
	var currP = new Date();
	var currT = new Date();
	if(CurrentStatus == "FINISHED"){
		$('.CurrentRating').html('#'+globalJson.rank);
		var killLoader = setTimeout(function(){
			$('#highchatrsContainer > div').append('<button class="fa fa-refresh" onclick="killGetStandings();refreshStandings();"></button>');
		}, 15 * 1000);
		$('#highchatrsContainer').html('<div style="height:100%;display: flex;align-items: center;justify-content: center;vertical-align:center">Loading Virtual Rank...</div>')
		LoadingStatus = true;
		getStandingsJSONStatus = $.getJSON("https://codeforces.com/api/contest.standings",{
			contestId: ContestID,
			showUnofficial: showUnofficialIf
		},function(json1){
			LoadingStatus = false;
			StandingsID = ContestID;
			clearTimeout(killLoader);
			StandingsList = [];
			for(var i=0;i<json1.result.rows.length;i++)
				if(json1.result.rows[i].party.participantType=="CONTESTANT"
				|| json1.result.rows[i].party.participantType=="VIRTUAL")
					StandingsList.push(json1.result.rows[i]);
			var p = getOverallPredictedRank(globalJson);
			if(currP > changeDate)
				RankData=p,getChart(RankData);
		}).fail(function(jqXHR, status, error){
			LoadingStatus = false;
			clearTimeout(killLoader);
			if(currP > changeDate)
				$('#highchatrsContainer').html('<div style="height:100%;display: flex;align-items: center;justify-content: center;vertical-align:center">Cannot Get Virtual Rank!</div>')
		});
	}
	else if(StandingsID == ContestID){
		var p = getPredictedRank(globalJson.points,globalJson.penalty,(Number(currT)-Number(StartTime))/1000,(Number(EndTime)-Number(currT))/1000<=30*60);
		if(currP > changeDate)
			$('.CurrentRating').html('#'+p),
			RankData.push([Number(new Date())-currT.getTimezoneOffset()*60*1000,p]),
			getChart(RankData);
	}
	else{
		$('#highchatrsContainer').html('<div style="height:100%;display: flex;align-items: center;justify-content: center;vertical-align:center">Loading Virtual Rank...</div>')
		var killLoader = setTimeout(function(){
			$('#highchatrsContainer > div').append(' <button class="fa fa-refresh" onclick="killGetStandings();refreshStandings();"></button>');
		}, 15 * 1000);
		LoadingStatus = true;
		getStandingsJSONStatus = $.getJSON("https://codeforces.com/api/contest.standings",{
			contestId: ContestID,
			showUnofficial: showUnofficialIf
		},function(json1){
			LoadingStatus = false;
			clearTimeout(killLoader);
			StandingsID = ContestID;
			StandingsList = [];
			for(var i=0;i<json1.result.rows.length;i++)
				if(json1.result.rows[i].party.participantType=="CONTESTANT"
				|| json1.result.rows[i].party.participantType=="VIRTUAL")
					StandingsList.push(json1.result.rows[i]);
			json1 = [];
			var p = getPredictedRank(globalJson.points,globalJson.penalty,(Number(currT)-Number(StartTime))/1000,(Number(EndTime)-Number(currT))/1000<=30*60);
			if(currP > changeDate)
				$('.CurrentRating').html('#'+p),
				RankData.push([Number(new Date())-currT.getTimezoneOffset()*60*1000,p]),
				getChart(RankData);
		}).fail(function(jqXHR, status, error){
			LoadingStatus = false;
			clearTimeout(killLoader);
			if(currP > changeDate)
				$('#highchatrsContainer').html(' <div style="height:100%;display: flex;align-items: center;justify-content: center;vertical-align:center">Cannot Get Virtual Rank!</div>')
		});
	}
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
		if(json.status != "OK")	return;
		$(".ContestIdNumber").html("#"+ContestID);
		json = json.result;
		$('.ContestTypeChosen').html('');
		for(var i=0;i<json.rows.length;i++)
			$('.ContestTypeChosen').append(`<option value="${i}">${(new Date(json.rows[i].party.startTimeSeconds*1000)).pattern("YY-MM-dd hh:mm")} ${json.rows[i].party.participantType}</option>`);
		if(SelectContestIndex<0 || SelectContestIndex>=json.rows.length)
			SelectContestTime=false;
		if(!SelectContestTime)
			SelectContestIndex=json.rows.length-1,
			SelectContestTime=true;
		$('.ContestTypeChosen:first').val(SelectContestIndex);
		ContestType = json.contest.type;
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
		if(json.rows.length==0)
			$('.VirtualRankButton').css('display','none');
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
			if((CurrentStatus == "FINISHED" && (
				json.party.participantType=="CONTESTANT"
			||  json.party.participantType=="VIRTUAL"))
			|| (json.party.participantType=="VIRTUAL" && CurrentStatus == "CODING")){
				$('.VirtualRankButton').css('display','inline-block');
				if(VirtualRank)
					globalJson = json,
					refreshStandings(json);
			}
			else
				$('.VirtualRankButton').css('display','none');
			if(json.party.participantType=="PRACTICE"){
				$('.CurrentRating').html("#?");
				$('#highchatrsContainer').html('<div style="height:100%;display: flex;align-items: center;justify-content: center;vertical-align:center">Blank</div>');
			}
			else{
				if(!VirtualRank)
					$('.CurrentRating').html('#'+json.rank),
					RankData.push([Number(new Date())-currT.getTimezoneOffset()*60*1000,json.rank]),
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
		killGetStandings();
		getApiInfo(new Date());
		return;
	}
	changeDate = new Date();
	Username = un;
	ContestID = ci;
	RankData = [];
	SelectContestTime = false;
	killGetStandings();
	getApiInfo(new Date());
}
$('.LockButton').attr('onclick','lockIfClick()');
$('.SendButton').attr('onclick','changeUserInfo()');
$('.UnofficialButton').attr('onclick','showUnofficialIfClick()');
$('.CloseButton').attr('onclick','closeIf()');
$('.VirtualRankButton').attr('onclick','getVirtualRankIf()');