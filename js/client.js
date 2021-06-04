var isFold = false;
var onTopStatus = true;
var lockStatus = false;
var blankTip = true;
var showUnofficialIf = false;
var Username = "", ContestID = 0;
var SelectContestTime = false;
var SelectContestIndex = 0;
var changeDate = new Date();
var StartTime, EndTime;
var RealContestStartTime, RealContestEndTime;
var RankData = [], ScoreData = [];
var FriendRankData = {};
var FriendJson = {};
var FriendSuccessList = [];
var StandingsList = [], hackList = {};
var StandingsID = 0;
var CurrentStatus;
var ContestType;
var OpenRankMonitor=false;
var VirtualRank = false;
var globalJson;
var getStandingsJSONStatus;
var getHacksJSONStatus;
var CurrDiffCalc = "";
var CurrDiffDetail = [];
var probList, reslList;
var LoadingStatus = false;
var LoadingStatus2 = false;
var ApiLoadingStatus3 = false;
var ApiLoadingStatus4 = false;
var getSubmissions = false;
var getRatingChanges = undefined;
var refreshApiInfo = undefined;
var ApiLoadingStatus = false;
var getContestList = undefined
var ApiLoadingStatus2 = false;
var ToolListLength = 188;
var SubmissionsStorage = [];
var WinHeight = 615;
var lastSet = 615;
var chart = undefined;
var ProblemInfoStorage = [];
var PartyStorage = {};
var ContestStorage = [];
var openAdvancedOption = false;
var showLessSubmissionInfo = false;
var ParticipantTypeStorage = "";
var failedToLoadRatingChange = false;
var DefaultStyle = JSON.parse(JSON.stringify(Highcharts.getOptions()));
var commitInfo = [];
function openURL(x){
	if(RunInNwjs)
		nw.Shell.openExternal(x);
	else
		window.open(x);
}
DefaultStyle.legend.backgroundColor = '#fff';
DefaultStyle.yAxis = {gridLineColor: "#E6E6E6"}
Highcharts.setOptions(DefaultStyle);
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
        backgroundColor: '#383839',
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
function getPredictedRank(points,penalty,time){
	if(penalty==undefined)	penalty = 0;
	var returnValue = 1;
	for(var i=0;i<StandingsList.length;i++){
		var _points = 0, _penalty = 0;
		for(var j=0;j<StandingsList[i].problemResults.length;j++){
			if(StandingsList[i].problemResults[j].bestSubmissionTimeSeconds!=undefined
			&& Math.floor(StandingsList[i].problemResults[j].bestSubmissionTimeSeconds/60)<=Math.floor(time/60)){
				_points += StandingsList[i].problemResults[j].points;
				var _dalta = StandingsList[i].problemResults[j].penalty;
				if(ContestType == "ICPC")
					_dalta = Math.floor(StandingsList[i].problemResults[j].bestSubmissionTimeSeconds/60)
						+StandingsList[i].problemResults[j].rejectedAttemptCount*10;
				_penalty += (_dalta == undefined ? 0 : _dalta);
			}
		}
		if(ContestType == "CF" && hackList[StandingsList[i].party.members[0].handle]!=undefined){
			for(var j=0;j<hackList[StandingsList[i].party.members[0].handle].length;j++){
				if(hackList[StandingsList[i].party.members[0].handle][j][0]>time)	break;
				_points += hackList[StandingsList[i].party.members[0].handle][j][1];
			}
		}
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
		$('#highchartsContainer > div').html(`Calculating Rank... (${++T} of ${NoteNumber})`);
		var currS = 0, currP = 0;
		if(p < changeDate)	return [];
		var time = (Number(currT)-Number(StartTime))/1000;
		for(var j=0;j<json.problemResults.length;j++){
			if(json.problemResults[j].bestSubmissionTimeSeconds!=undefined
			&& json.problemResults[j].bestSubmissionTimeSeconds<=time){
				currS += json.problemResults[j].points;
				var _dalta = json.problemResults[j].penalty;
				if(ContestType == "ICPC")
					_dalta = Math.floor(json.problemResults[j].bestSubmissionTimeSeconds/60)+json.problemResults[j].rejectedAttemptCount*10;
				currP += (_dalta == undefined ? 0 : _dalta);
			}
		}
		if(ContestType == "CF" && hackList[json.party.members[0].handle]!=undefined){
			for(var j=0;j<hackList[json.party.members[0].handle].length;j++){
				if(hackList[json.party.members[0].handle][j][0]>time)	break;
				currS += hackList[json.party.members[0].handle][j][1];
			}
		}
		returnValue.push([Number(currT)-currT.getTimezoneOffset()*60*1000,getPredictedRank(currS,currP,time)]);
		currT = new Date(Number(currT) + Step);
	}
	return returnValue;
}
function getRealScore(json,time){
	var currS = 0, currP = 0;
	for(var j=0;j<json.problemResults.length;j++){
		if(json.problemResults[j].bestSubmissionTimeSeconds!=undefined
		&& json.problemResults[j].bestSubmissionTimeSeconds<=time){
			currS += json.problemResults[j].points;
			var _dalta = json.problemResults[j].penalty;
			if(ContestType == "ICPC")
				_dalta = Math.floor(json.problemResults[j].bestSubmissionTimeSeconds/60)+json.problemResults[j].rejectedAttemptCount*10;
			currP += (_dalta == undefined ? 0 : _dalta);
		}
	}
	if(ContestType == "CF" && hackList[json.party.members[0].handle]!=undefined){
		for(var j=0;j<hackList[json.party.members[0].handle].length;j++){
			if(hackList[json.party.members[0].handle][j][0]>time)	break;
			currS += hackList[json.party.members[0].handle][j][1];
		}
	}
	return currS;
}
function getRealPenalty(json,time){
	var currS = 0, currP = 0;
	for(var j=0;j<json.problemResults.length;j++){
		if(json.problemResults[j].bestSubmissionTimeSeconds!=undefined
		&& json.problemResults[j].bestSubmissionTimeSeconds<=time){
			currS += json.problemResults[j].points;
			var _dalta = json.problemResults[j].penalty;
			if(ContestType == "ICPC")
				_dalta = Math.floor(json.problemResults[j].bestSubmissionTimeSeconds/60)+json.problemResults[j].rejectedAttemptCount*10;
			currP += (_dalta == undefined ? 0 : _dalta);
		}
	}
	if(ContestType == "CF" && hackList[json.party.members[0].handle]!=undefined){
		for(var j=0;j<hackList[json.party.members[0].handle].length;j++){
			if(hackList[json.party.members[0].handle][j][0]>time)	break;
			currS += hackList[json.party.members[0].handle][j][1];
		}
	}
	return currP;
}
function getOverallScore(json){
	var currT = StartTime;
	var Step = 60 * 1000;
	var returnValue = [];
	var p = new Date();
	var NoteNumber = Number(EndTime) - Number(StartTime);
	NoteNumber = Math.floor(NoteNumber / Step) + 1;
	var T = 0;
	while(currT <= EndTime){
		$('#highchartsContainer > div').html(`Calculating Score... (${++T} of ${NoteNumber})`);
		var currS = 0;
		if(p < changeDate)	return [];
		var openHack = ((Number(EndTime) - Number(currT))/1000<=30*60);
		var time = (Number(currT)-Number(StartTime))/1000;
		for(var j=0;j<json.problemResults.length;j++){
			if(json.problemResults[j].bestSubmissionTimeSeconds!=undefined
			&& json.problemResults[j].bestSubmissionTimeSeconds<=time){
				currS += json.problemResults[j].points;
			}
		}
		if(ContestType == "CF" && hackList[json.party.members[0].handle]!=undefined){
			for(var j=0;j<hackList[json.party.members[0].handle].length;j++){
				if(hackList[json.party.members[0].handle][j][0]>time)	break;
				currS += hackList[json.party.members[0].handle][j][1];
			}
		}
		returnValue.push([Number(currT)-currT.getTimezoneOffset()*60*1000,currS]);
		currT = new Date(Number(currT) + Step);
	}
	return returnValue;
}
function getChart(){
	if(RankData.length!=0){
		var SeriesInfo = [];
		if(FriendSuccessList.length == 0){
			SeriesInfo = [{
				type: 'area',
				name: 'Rank',
				data: RankData
			},{
				yAxis: 1,
				name: 'Score',
				data: ScoreData
			}];
		}
		else{
			SeriesInfo.push({name: "Rank", data: RankData});
			for(var j=0;j<FriendSuccessList.length;j++)
				SeriesInfo.push({name: FriendSuccessList[j], data: FriendRankData[FriendSuccessList[j]]});
		}
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
				},
				shared: true
			},
			yAxis:[ {
				title: {
					text: null
				},
				reversed: true
			},{
				title: {
					text: null
				},
				opposite: true
			}],
			legend: {
				enabled: true
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
			series: SeriesInfo,
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
function flushToolList(){
	if(openAdvancedOption)
		$(".AdvancedToolList").css("width",ToolListLength);
}
var opacityIf = false;
function setSize(y){
	if(!RunInNwjs){
		WinHeight = y;
		return;
	}
	win.setResizable(true);
	win.resizeTo(win.width,y);
	win.moveBy(0,WinHeight-y);
	WinHeight = y;
	if(y!=190)	lastSet = y;
	win.setResizable(false);
}
function setSmall(){
	$('.BigInterface').css('display','none');
	setSize(190);
	$('.SmallInterface').css('display','block');
	if(DarkMode)
		$('.HtmlContainer').css('background-color','rgba(0,0,0,0.5)');
	else
		$('.HtmlContainer').css('background-color','rgba(255,255,255,0.5)');
	opacityIf = true;
}
function setBig(){
	$('.SmallInterface').css('display','none');
	setSize(lastSet);
	$('.BigInterface').css('display','block');
	if(DarkMode)
		$('.HtmlContainer').css('background-color','#222');
	else
		$('.HtmlContainer').css('background-color','#fff');
	opacityIf = false;
}
$('.GraphFolder').click(function(){
	if(!isFold){
		$('#highchatrsContainer').css('display','none');
		$('.GraphFolder').html('<span class="fa fa-angle-down"></span>  Unfold');
		setSize(390);
	}
	else{
		setSize(615);
		$('#highchatrsContainer').css('display','block');
		$('.GraphFolder').html('<span class="fa fa-angle-up"></span>  Fold');
	}
	isFold = !isFold;
});
function closeIf(){
	if(lockStatus || !RunInNwjs)	return;
	win.close(true);
}
function lockIfClick(){
	if(!lockStatus){
		$('input').attr('readonly',true);
		$('select').attr('disabled',true);
		$('.CloseButton').html('<span class="fa fa-ban style_error"></span> ').attr('title','Unlock to close');
		$('.LockButton').html('<span class="fa fa-lock"></span> ').attr('title','Unlock');
	}
	else{
		$('input').attr('readonly',false);
		$('select').attr('disabled',false);
		$('.CloseButton').html('<span class="fa fa-times style_error"></span> ').attr('title','Close');
		$('.LockButton').html('<span class="fa fa-unlock"></span> ').attr('title','Lock');
	}
	lockStatus=!lockStatus;
}
function showUnofficialIfClick(){
	if(!showUnofficialIf)
		$('.UnofficialButton').html('<span class="fa fa-users"></span> Yes').attr('title','Hide Unofficial');
	else
		$('.UnofficialButton').html('<span class="fa fa-user"></span> No').attr('title','Show Unofficial');
	showUnofficialIf=!showUnofficialIf;
}
function getVirtualRankIf(){
	if(!VirtualRank)
		$('.VirtualRankButton').html('<span class="fa fa-calculator"></span> Predictor');
	else
		$('.VirtualRankButton').html('<span class="fa fa-database"></span> Database');
	VirtualRank = !VirtualRank;
	$(".RefreshVirtualButton").css("max-width", "80px");
}
function setOnTopIf(){
	if(!RunInNwjs)	return;
	if(onTopStatus){
		win.setAlwaysOnTop(false);
		$('.SetOnTopButton').html("<span class='fa fa-window-restore'></span> Unsticky");
	}
	else{
		win.setAlwaysOnTop(true);
		$('.SetOnTopButton').html("<span class='fa fa-window-maximize'></span> Sticky");
	}
	onTopStatus = !onTopStatus;
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

// code from: https://www.zhihu.com/question/38869928/answer/78527903
// convert #hex notation to rgb array
var parseColor = function (hexStr) {
  return hexStr.length === 4 ? hexStr.substr(1).split('').map(function (s) { return 0x11 * parseInt(s, 16); }) : [hexStr.substr(1, 2), hexStr.substr(3, 2), hexStr.substr(5, 2)].map(function (s) { return parseInt(s, 16); })
};

// zero-pad 1 digit to 2
var pad = function (s) {
  return (s.length === 1) ? '0' + s : s;
};

var gradientColors = function (start, end, steps, gamma) {
  var i, j, ms, me, output = [], so = [];
  gamma = gamma || 1;
  var normalize = function (channel) {
    return Math.pow(channel / 255, gamma);
  };
  start = parseColor(start).map(normalize);
  end = parseColor(end).map(normalize);
  for (i = 0; i < steps; i++) {
    ms = i / (steps - 1);
    me = 1 - ms;
    for (j = 0; j < 3; j++) {
      so[j] = pad(Math.round(Math.pow(start[j] * me + end[j] * ms, 1 / gamma) * 255).toString(16));
    }
    output.push('#' + so.join(''));
  }
  return output;
};
var colorSet = gradientColors('#e7483f', '#1cff1c', 101, 2.2);
function setIdleProgress(){
	$('.ContestProgress .circle').removeClass('clip-auto');
    $('.ContestProgress .right').addClass('nothing');
    $('.ContestProgress .marker').css("display", "none");
}
console.log(colorSet);
function setProgressPercent(percent){
	if(percent <= 50) {
        $('.ContestProgress .circle').removeClass('clip-auto');
        $('.ContestProgress .right').addClass('nothing');
    } else {
        $('.ContestProgress .circle').addClass('clip-auto');
        $('.ContestProgress .right').removeClass('nothing');
    }
    $('.ContestProgress .marker').css("display", "block");
    $('.ContestProgress .left').css("transform", "rotate(" + (18 / 5) * percent + "deg)");
    $('.ContestProgress .marker.end').css("transform", "rotateZ(" + (18 / 5) * percent + "deg)");
    $(".ContestProgress .left").css("border-color", colorSet[Math.floor(percent)]);
    $(".ContestProgress .right").css("border-color", colorSet[Math.floor(percent)]);
    $(".ContestProgress .marker").css("background-color", colorSet[Math.floor(percent)]);
    console.log(colorSet[Math.floor(percent)]);
}
var flushTimeRunned = false;
function flushTimeIndex(cD){
	if(cD<changeDate){
		flushTimeRunned=false;
		return;
	}
	var currT = new Date();
	if(currT<=StartTime){
		setIdleProgress();
		var diff = Number(StartTime) - Number(currT);
		$('.ContestStatus div').html('<i class="fa fa-clock"></i><br/>'+getTimeLength2(diff));
	}
	else if(currT<=EndTime){
		var diff = Number(EndTime) - Number(currT);
		setProgressPercent(100.0 * ((Number(currT) - Number(StartTime))/(Number(EndTime) - Number(StartTime))));
		$('.ContestStatus div').html('<i class="fa fa-keyboard"></i><br/>'+getTimeLength2(diff));
	}
	else	return;
	setTimeout(function(){flushTimeIndex(cD);},1000);
}
function CodeforcesRatingColor(x){
	if(x >= 2400)	return "rgb(255, 26, 26)";
	if(x >= 2100)	return "rgb(236, 134, 9)";
	if(x >= 1900)	return "rgb(255, 85, 255)";
	if(x >= 1600)	return "rgb(51, 125, 255)";
	if(x >= 1400)	return "rgb(29, 195, 190)";
	if(x >= 1200)	return "rgb(18, 197, 18)";
	return "rgb(152, 143, 129)";
}
function CodeforcesRatingGrade(x){
	if(x >= 3000)	return "Legendary Grandmaster";
	if(x >= 2600)	return "International Grandmaster";
	if(x >= 2600)	return "Grandmaster";
	if(x >= 2300)	return "International Master";
	if(x >= 2100)	return "Master";
	if(x >= 1900)	return "Candidate Master";
	if(x >= 1600)	return "Expert";
	if(x >= 1400)	return "Specialist";
	if(x >= 1200)	return "Pupil";
	return "Newbie";
}
function toMemoryInfo(limit){  
    var size = "";
    if( limit < 0.1 * 1024 ) 
        size = limit.toFixed(2) + "B";    
    else if(limit < 0.1 * 1024 * 1024 )
        size = (limit / 1024).toFixed(2) + "KB";              
    else if(limit < 0.1 * 1024 * 1024 * 1024)
        size = (limit / (1024 * 1024)).toFixed(2) + "MB";  
    else
        size = (limit / (1024 * 1024 * 1024)).toFixed(2) + "GB";  
    var sizestr = size + "";
    var len = sizestr.indexOf("\.");
    var dec = sizestr.substr(len + 1, 2);
    if(dec == "00") 
        return sizestr.substring(0,len) + sizestr.substr(len + 3,2);
    return sizestr;  
}
function closeMessageBox(){
	if(WinHeight == 190)	return;
	$('.AlertWindow').css('display','none');
	$(".BlackBackground").css('background','rgba(0,0,0,0)');
	setTimeout(function(){$('.AllWindow').css('display','none')},300);
}
function toSmallInfo(x){
	if(x==undefined)	return ""
	if(x == "FAILED")	return "FAIL";
	if(x == "PARTIAL")	return "PRT";
	if(x == "COMPILATION_ERROR")	return "CE";
	if(x == "RUNTIME_ERROR")	return "RE";
	if(x == "WRONG_ANSWER")	return "WA";
	if(x == "PRESENTATION_ERROR")	return "PE";
	if(x == "TIME_LIMIT_EXCEEDED")	return "TLE";
	if(x == "MEMORY_LIMIT_EXCEEDED")	return "MLE";
	if(x == "IDLENESS_LIMIT_EXCEEDED")	return "ILE";
	if(x == "SECURITY_VIOLATED")	return "SV";
	if(x == "CRASHED")	return "CRS";
	if(x == "INPUT_PREPARATION_CRASHED")	return "IPC";
	if(x == "CHALLENGED")	return "CHL";
	if(x == "SKIPPED")	return "SKP";
	if(x == "TESTING")	return "TST";
	if(x == "REJECTED")	return "REJ";
	return "";
}
function getSubmissionIcon(x,y,ttl){
	if(x == "OK")	return `<span class="fa fa-check style_accept" title='${ttl}'></span> `;
	var las = "";
	if(y=="TESTS" &&  ParticipantTypeStorage != "PRACTICE")
		las = ` <span class="fa fa-times-circle style_error" title='Failed at System Test'></span> `;
	if(x == "FAILED")	return `<span class="fa fa-server" style="color:rgb(175, 168, 158)" title='${ttl}'></span> `+las;
	if(x == "PARTIAL")	return `<span class="fa fa-percent" style="color:rgb(74, 254, 246)" title='${ttl}'></span> `+las;
	if(x == "COMPILATION_ERROR")	return `<span class="fa fa-code" style="color:rgb(74, 254, 246)" title='${ttl}'></span> `+las;
	if(x == "RUNTIME_ERROR")	return `<span class="fa fa-bomb" style="color:rgb(191, 63, 255);" title='${ttl}'></span> `+las;
	if(x == "WRONG_ANSWER")	return `<span class="fa fa-times style_error" title='${ttl}'></span> `+las;
	if(x == "PRESENTATION_ERROR")	return `<span class="fa fa-print" style="color:rgb(255, 155, 70);" title='${ttl}'></span> `+las;
	if(x == "TIME_LIMIT_EXCEEDED")	return `<span class="fa fa-clock" style="color:rgb(255, 155, 70);" title='${ttl}'></span> `+las;
	if(x == "MEMORY_LIMIT_EXCEEDED")	return `<span class="fa fa-microchip" style="color:rgb(255, 155, 70);" title='${ttl}'></span> `+las;
	if(x == "IDLENESS_LIMIT_EXCEEDED")	return `<span class="fa fa-align-left" style="color:rgb(255, 155, 70);" title='${ttl}'></span> `+las;
	if(x == "SECURITY_VIOLATED")	return `<span class="fa fa-ban style_error" title='${ttl}'></span> `+las;
	if(x == "CRASHED")	return `<span class="fa fa-chain-broken" style="color:rgb(255, 155, 70);" title='${ttl}'></span> `+las;
	if(x == "INPUT_PREPARATION_CRASHED")	return `<span class="fa fa-sign-in" style="color:rgb(255, 155, 70);" title='${ttl}'></span> `+las;
	if(x == "CHALLENGED")	return `<span class="fa fa-user-secret" style="color:rgb(175, 168, 158)" title='${ttl}'></span> `+las;
	if(x == "SKIPPED")	return `<span class="fa fa-forward" style="color:rgb(110, 149, 210);" title='${ttl}'></span> `+las;
	if(x == "TESTING")	return `<span class="fa fa-hourglass-2" style="color:rgb(110, 149, 210)" title='${ttl}'></span> `+las;
	if(x == "REJECTED")	return `<span class="fa fa-exclamation-triangle" style="color:#decb29" title='${ttl}'></span> `+las;
}
function toSmallCase(x){
	if(x=="TESTS")	return "test";
	if(x=="PRETESTS")	return "pretest";
	if(x=="SAMPLES")	return "sample";
	return 'test'+x.substr(4,x.length-4);
}
var VariableX;
var jqSubmissionList = [];
function flushSubmissionInfo(x){
	var hav = false;
	for(var i=0;i<SubmissionsStorage.length;i++){
		if(SubmissionsStorage[i].problem.index != probList[x])
			continue;
		if(!showLessSubmissionInfo)
			$(".SubmlissionsList").append(`<tr><td>${new Date(1000*SubmissionsStorage[i].creationTimeSeconds).pattern("YY-MM-dd hh:mm:ss")}</td><td>${SubmissionsStorage[i].programmingLanguage}</td><td><span style="cursor:pointer;" onclick='openURL("https://codeforces.com/problemset/submission/${ContestID}/${SubmissionsStorage[i].id}")'>${SubmissionsStorage[i].verdict=="OK"?("<span class='ProblemAccepted'>"+(SubmissionsStorage[i].testset=="TESTS"?"Accepted":toSmallCase(SubmissionsStorage[i].testset)+" passed")+"</span>"):(SubmissionsStorage[i].verdict=="CHALLENGED"?"<span class='ProblemWrong'>Hacked</span>":(SubmissionsStorage[i].verdict=="PARTIAL"?"<span title='PARTIAL'>PRT</span>":("<span title=\'"+SubmissionsStorage[i].verdict+"\'>"+toSmallInfo(SubmissionsStorage[i].verdict)+"</span> on "+toSmallCase(SubmissionsStorage[i].testset)+" "+(SubmissionsStorage[i].passedTestCount+1))))}${SubmissionsStorage[i].points!=undefined?('('+SubmissionsStorage[i].points+')'):""}</span></td><td>${SubmissionsStorage[i].timeConsumedMillis}ms</td><td>${toMemoryInfo(SubmissionsStorage[i].memoryConsumedBytes)}</td></tr>`);
		else
			$(".SubmlissionsList").append(`<tr><td>${new Date(1000*SubmissionsStorage[i].creationTimeSeconds).pattern("YY-MM-dd hh:mm:ss")}</td><td>${SubmissionsStorage[i].programmingLanguage}</td><td style='font-size:25px;'><span style="cursor:pointer;" onclick='openURL("https://codeforces.com/problemset/submission/${ContestID}/${SubmissionsStorage[i].id}")'>${getSubmissionIcon(SubmissionsStorage[i].verdict,SubmissionsStorage[i].testset,`${SubmissionsStorage[i].verdict=="OK"?((SubmissionsStorage[i].testset=="TESTS"?"Accepted":toSmallCase(SubmissionsStorage[i].testset)+" passed")):(SubmissionsStorage[i].verdict=="CHALLENGED"?"Hacked":(SubmissionsStorage[i].verdict=="PARTIAL"?"PARTIAL":((SubmissionsStorage[i].verdict)+" on "+toSmallCase(SubmissionsStorage[i].testset)+" "+(SubmissionsStorage[i].passedTestCount+1))))}${SubmissionsStorage[i].points!=undefined?('('+SubmissionsStorage[i].points+')'):""}`)}</span></td><td>${SubmissionsStorage[i].timeConsumedMillis}ms</td><td>${toMemoryInfo(SubmissionsStorage[i].memoryConsumedBytes)}</td></tr>`);
		hav = true;
	}
	if(!hav)	$(".SubmlissionsList").append("<tr><td colspan='5'>Blank</td></tr>");
}
function openForkInfo(){
	if(WinHeight == 190)	return;
	$(".MessageBoxProblem").css('display','none');
	$(".MessageBoxFork").css('display','block');
	$(".MessageBoxContest").css('display','none');
	$(".BlackBackground").width($(".HtmlContainer").width());
	$(".BlackBackground").height($(".HtmlContainer").height());
	if(!RunInNwjs){
		$(".BlackBackground").css('top',-$(".HtmlContainer").height());
		$(".BlackBackground").css('left',0);
	}
	$('.AllWindow').css('display','block');
	$('.AlertWindow').css('display','block');
	if(RunInNwjs){
		$('.AlertWindow').css('top',$(".HtmlContainer").height()/2);
		$('.AlertWindow').css('left',$(".HtmlContainer").width()/2);
	}
	else{
		$('.AlertWindow').css('top',-$(".HtmlContainer").height()/2);
		$('.AlertWindow').css('left',$(".HtmlContainer").width()/2);
	}
	$('.AlertWindow').css('max-height',$(".HtmlContainer").height() - 100);
	$(".BlackBackground").css('background','rgba(0,0,0,0.5)');
	var p = $(".DefaultLine2:first");
	$(".EventList").css("display","block");
	$(".EventList").html(p);
	var hav = false;
	for(var i=0;i<commitInfo.length;i++){
		var UpdateTime = commitInfo[i].commit.committer.date.replace('T',' ');
		UpdateTime=UpdateTime.substr(0,UpdateTime.length-1);
		UpdateTime=new Date(UpdateTime.replace(/-/g,'/'));
		UpdateTime=new Date(Number(UpdateTime)-UpdateTime.getTimezoneOffset()*60*1000);
		$(".EventList").append(`<tr><td>${UpdateTime.pattern("YY-MM-dd hh:mm:ss")}</td><td><div style='cursor:pointer;word-wrap:break-word;width:265px;overflow-x:none' onclick="openURL('${commitInfo[i].html_url}')">${allHtmlSpecialChars(commitInfo[i].commit.message)}</div></td></tr>`);
		hav = true;
	}
	if(!hav)	$(".EventList").append("<tr><td colspan='2'>Blank</td></tr>");
}
function checkUndefined(x){
	return x==undefined?'/':x;
}
function checkUndefined2(x,y){
	if(x==undefined && y==undefined)	return '/';
	if(x==undefined)	return y;
	if(y==undefined)	return x;
	return x+'/'+y;
}
function getProblemList(a,b){
	$('.ProblemInfoContainer').html('');
	$(".AllProblemList").html("");
	if(a.length==0){
		$('.ProblemInfoContainer').html('<div style="height:100%;display: flex;align-items: center;justify-content: center;vertical-align:center">Blank</div>');
		blankTip = true;return;
	}
	blankTip = false;
	jqSubmissionList = [];
	for(var i=0;i<a.length;i++){
		if(b[i][0]=='')	b[i][0]='*';
		jqSubmissionList.push($(`<div class="ProblemSubmissions" style="display:none"></div>`));
		var curr=$(`<div class="ProblemSubmissionIntro"></div>`);
		curr.append(`<div>${a[i].index}<br/><span style="font-size: 12px">${a[i].points}</span></div>`);
		curr.append(`<div><span onclick="openURL('https://codeforces.com/contest/${a[i].contestId}/problem/${a[i].index}')">${a[i].name}</span></div>`);
		var s = $(`<div><span class="ProblemResult ${b[i][3]}">${b[i][0]}</span></br><span style="font-size: 12px">${b[i][1]}</span></div>`);
		s.click(function(){
			var q = $(this).parent().next();
			if(q.css("display") == "none")
				q.css("display", "block");
			else q.css("display", "none");
		})
		curr.append(s);
		curr.append(`<div class="${b[i][3]}" style="padding-top: 6px">${b[i][2]}</div>`);
		var m=$(`<div class="ProblemSubmissionFolder"></div>`);
		m.append(curr);
		m.append(jqSubmissionList[jqSubmissionList.length-1]);
		$(".ProblemInfoContainer").append(m);
		var w = $(`<div class='SingleProblemInfo'></div>`);
		w.append(`<div style="font-family:Verdana;font-size:16px">${a[i].index}&thinsp;<span style="font-size: 8px !important">${a[i].points}</span></div>`);
		w.append(`<div class="ProblemResult ${b[i][3]}">${b[i][0]}</div>`);
		w.append(`<div style="font-size: 12px">${b[i][1]}</div>`);
		$(".AllProblemList").append(w);
	}
	jqSubmissionList.push($(`<div class="ProblemSubmissions" style="display:none"></div>`));
	//
	var t = {};
	for(var i=0;i<a.length;i++)
		t[a[i].index]=i;
	for(var i=0;i<SubmissionsStorage.length;i++){
		jqSubmissionList[t[SubmissionsStorage[i].problem.index]].append(`<div class="ProblemSubmission"><span>${getTimeLength2(1000*SubmissionsStorage[i].creationTimeSeconds-Number(StartTime))}</span><span onclick='openURL("https://codeforces.com/problemset/submission/${ContestID}/${SubmissionsStorage[i].id}")'>${SubmissionsStorage[i].verdict=="OK"?("<span class='ProblemAccepted'>"+(SubmissionsStorage[i].testset=="TESTS"?"Accepted":toSmallCase(SubmissionsStorage[i].testset)+" passed")+"</span>"):(SubmissionsStorage[i].verdict=="CHALLENGED"?"<span class='ProblemWrong'>Hacked</span>":(SubmissionsStorage[i].verdict=="PARTIAL"?"<span title='PARTIAL'>PRT</span>":("<span title=\'"+SubmissionsStorage[i].verdict+"\'>"+toSmallInfo(SubmissionsStorage[i].verdict)+"</span> on "+toSmallCase(SubmissionsStorage[i].testset)+" "+(SubmissionsStorage[i].passedTestCount+1))))}${SubmissionsStorage[i].points!=undefined?('('+SubmissionsStorage[i].points+')'):""}</span><span>${SubmissionsStorage[i].timeConsumedMillis}ms</span><span>${toMemoryInfo(SubmissionsStorage[i].memoryConsumedBytes)}</span></div>`);
		jqSubmissionList[a.length].append(`<div class="ProblemSubmission"><span>${getTimeLength2(1000*SubmissionsStorage[i].creationTimeSeconds-Number(StartTime))}</span><span onclick='openURL("https://codeforces.com/problemset/submission/${ContestID}/${SubmissionsStorage[i].id}")'>${SubmissionsStorage[i].problem.index} - ${SubmissionsStorage[i].verdict=="OK"?("<span class='ProblemAccepted'>"+(SubmissionsStorage[i].testset=="TESTS"?"Accepted":toSmallCase(SubmissionsStorage[i].testset)+" passed")+"</span>"):(SubmissionsStorage[i].verdict=="CHALLENGED"?"<span class='ProblemWrong'>Hacked</span>":(SubmissionsStorage[i].verdict=="PARTIAL"?"<span title='PARTIAL'>PRT</span>":("<span title=\'"+SubmissionsStorage[i].verdict+"\'>"+toSmallInfo(SubmissionsStorage[i].verdict)+"</span> on "+toSmallCase(SubmissionsStorage[i].testset)+" "+(SubmissionsStorage[i].passedTestCount+1))))}${SubmissionsStorage[i].points!=undefined?('('+SubmissionsStorage[i].points+')'):""}</span><span>${SubmissionsStorage[i].timeConsumedMillis}ms</span><span>${toMemoryInfo(SubmissionsStorage[i].memoryConsumedBytes)}</span></div>`);
	}
}
function ProblemListAppend(a,b,c,d){
	if(blankTip == true){
		blankTip = false;
		$('.ProblemInfoContainer').html('');
	}
	var curr=$(`<div class="ProblemSubmissionIntro"></div>`);
	curr.append(`<div>#</div>`);
	curr.append(`<div></div>`);
	var s = $(`<div><span class="ProblemResult">${a}</span></br><span style="font-size: 12px"><span class="style_accept">+${c}</span>:<span class="style_error">-${d}</span></span></div>`);
	$(".OtherInfoContainer").html(`Hacks: <span class="style_accept">+${c}</span> : <span class="style_error">-${d}</span> | Score: ${b} | Penalty: ${a}`);
	s.click(function(){
		var q = $(this).parent().next();
		if(q.css("display") == "none")
			q.css("display", "block");
		else q.css("display", "none");
	})
	curr.append(s);
	curr.append(`<div class="ProblemCoding" style="padding-top: 6px">${b}</div>`);
	var m=$(`<div class="ProblemSubmissionFolder"></div>`);
	m.append(curr);
	m.append(jqSubmissionList[jqSubmissionList.length-1]);
	$(".ProblemInfoContainer").append(m);
}
function killGetStandings(){
	if(LoadingStatus){
		LoadingStatus = false;
		getStandingsJSONStatus.abort();
	}
	if(LoadingStatus2){
		LoadingStatus2 = false;
		getHacksJSONStatus.abort();
	}
}
function refreshStandings(){
	var currP = new Date();
	var currT = new Date();
	$('.RankDisplayer').html('...');
	if(CurrentStatus == "FINISHED"){
		$('.RankDisplayer').text('#'+globalJson.rank);
		LoadingStatus = true;
		$('#highchatrsContainer').html('<div style="height:100%;display: flex;align-items: center;justify-content: center;vertical-align:center"><span>Pending for Standings...</span></div>');
		getStandingsJSONStatus = $.ajax({
			url: "https://codeforces.com/api/contest.standings",
			type: "GET",
			data: {contestId: ContestID,showUnofficial: showUnofficialIf},
			success: function(json1){
				LoadingStatus = false;
				if(json1.status != "OK"){
					if(currP > changeDate)
						$('#highchatrsContainer').html('<div style="height:100%;display: flex;align-items: center;justify-content: center;vertical-align:center"><span>Cannot Get Standings!</span></div>');
					else
						$('#highchatrsContainer').html('<div style="height:100%;display: flex;align-items: center;justify-content: center;vertical-align:center"><span>Blank</span></div>');
					return;
				}
				StandingsList = [];
				for(var i=0;i<json1.result.rows.length;i++)
					if(json1.result.rows[i].party.participantType!="PRACTICE")
						StandingsList.push(json1.result.rows[i]);
				json1 = [];
				if(ContestType == "CF"){
					LoadingStatus2 = true;
					$('#highchatrsContainer').html('<div style="height:100%;display: flex;align-items: center;justify-content: center;vertical-align:center"><span>Pending for Hacks...</span></div>');
					getHacksStandingsJSONStatus = $.ajax({
						url: "https://codeforces.com/api/contest.hacks",
						type: "GET",
						data: {contestId: ContestID},
						success: function(json2){
							LoadingStatus2 = false;
							if(json2.status != "OK"){
								if(currP > changeDate)
									$('#highchatrsContainer').html('<div style="height:100%;display: flex;align-items: center;justify-content: center;vertical-align:center"><span>Cannot Get Hack Info!</span></div>');
								else
									$('#highchatrsContainer').html('<div style="height:100%;display: flex;align-items: center;justify-content: center;vertical-align:center"><span>Blank</span></div>');
								return;
							}
							StandingsID = ContestID;
							hackList = {};
							for(var j=0;j<json2.result.length;j++)
								if(json2.result[j].creationTimeSeconds*1000<=RealContestEndTime){
									var from = json2.result[j].hacker.members[0].handle;
									if(hackList[from] == undefined)
										hackList[from] = [];
									if(json2.result[j].verdict=="HACK_SUCCESSFUL")
										hackList[from].push([(Number(json2.result[j].creationTimeSeconds*1000)-Number(RealContestStartTime))/1000,100]);
									if(json2.result[j].verdict=="HACK_UNSUCCESSFUL")
										hackList[from].push([(Number(json2.result[j].creationTimeSeconds*1000)-Number(RealContestStartTime))/1000,-50]);
								}
							json2 = [];
							var p = getOverallPredictedRank(globalJson);
							var q = getOverallScore(globalJson);
							var r = {};
							for(var j=0;j<FriendSuccessList.length;j++)
								r[FriendSuccessList[j]] = getOverallPredictedRank(FriendJson[FriendSuccessList[j]]);
							if(currP > changeDate){
								RankData=p;ScoreData=q;
								FriendRankData=r;getChart();
							}
						},
						error: function(jqXHR, status, error){
							LoadingStatus = false;
							clearTimeout(killLoader);
							if(currP > changeDate)
								$('#highchatrsContainer').html('<div style="height:100%;display: flex;align-items: center;justify-content: center;vertical-align:center"><span>Cannot Get Virtual Rank!</span></div>')
						},
						xhr: function() {
				            var xhr = new XMLHttpRequest();
				            xhr.addEventListener('progress', function (e) {
				                $('#highchatrsContainer > div > span').html("Loading Hacks... ("+toMemoryInfo(e.loaded)+" Loaded)");
				            })
				            return xhr;
				        }
					});
				}
				else{
					var p = getOverallPredictedRank(globalJson);
					var q = getOverallScore(globalJson);
					var r = {};
					for(var j=0;j<FriendSuccessList.length;j++)
						r[FriendSuccessList[j]] = getOverallPredictedRank(FriendJson[FriendSuccessList[j]]);
					if(currP > changeDate){
						RankData=p;ScoreData=q;
						FriendRankData=r;getChart();
					}
				}
			},
			error: function(jqXHR, status, error){
				LoadingStatus = false;
				if(currP > changeDate)
					$('#highchatrsContainer').html('<div style="height:100%;display: flex;align-items: center;justify-content: center;vertical-align:center"><span>Cannot Get Virtual Rank!</span></div>')
			},
			xhr: function() {
	            var xhr = new XMLHttpRequest();
	            xhr.addEventListener('progress', function (e) {
	                $('#highchatrsContainer > div > span').html("Loading Standings... ("+toMemoryInfo(e.loaded)+" Loaded)");
	            })
	            return xhr;
	        }
		});
	}
	else if(StandingsID == ContestID){
		var p = getPredictedRank(globalJson.points,globalJson.penalty,(Number(currT)-Number(StartTime))/1000);
		var q = [];
		for(var j=0;j<FriendSuccessList.length;j++)
			q.push(getPredictedRank(getRealScore(FriendJson[FriendSuccessList[j]],(Number(currT)-Number(StartTime))/1000),getRealPenalty(FriendJson[FriendSuccessList[j]],(Number(currT)-Number(StartTime))/1000),(Number(currT)-Number(StartTime))/1000));
		if(currP > changeDate){
			var fir = Number(new Date())-currT.getTimezoneOffset()*60*1000;
			$('.RankDisplayer').html('#'+p);
			RankData.push([fir,p]);ScoreData.push([fir,globalJson.points]);
			for(var j=0;j<FriendSuccessList.length;j++){
				if(FriendRankData[FriendSuccessList[j]]==undefined)
					FriendRankData[FriendSuccessList[j]]=[];
				FriendRankData[FriendSuccessList[j]].push([fir,q[j]]);
			}
			getChart();
		}
	}
	else{
		LoadingStatus = true;
		$('#highchatrsContainer').html('<div style="height:100%;display: flex;align-items: center;justify-content: center;vertical-align:center"><span>Pending for Standings...</span></div>')
		getStandingsJSONStatus = $.ajax({
			url: "https://codeforces.com/api/contest.standings",
			type: "GET",
			data: {contestId: ContestID,showUnofficial: showUnofficialIf},
			success: function(json1){
				LoadingStatus = false;
				if(json1.status != "OK"){
					if(currP > changeDate)
						$('#highchatrsContainer').html('<div style="height:100%;display: flex;align-items: center;justify-content: center;vertical-align:center"><span>Cannot Get Standings!</span></div>');
					else
						$('#highchatrsContainer').html('<div style="height:100%;display: flex;align-items: center;justify-content: center;vertical-align:center"><span>Blank</span></div>');
					return;
				}
				StandingsID = ContestID;
				StandingsList = [];
				for(var i=0;i<json1.result.rows.length;i++)
					if(json1.result.rows[i].party.participantType!="PRACTICE")
						StandingsList.push(json1.result.rows[i]);
				json1 = [];
				if(ContestType == "CF"){
					LoadingStatus2 = true;
					$('#highchatrsContainer').html('<div style="height:100%;display: flex;align-items: center;justify-content: center;vertical-align:center"><span>Pending for Hacks...</span></div>');
					getHacksStandingsJSONStatus = $.ajax({
						url: "https://codeforces.com/api/contest.hacks",
						type: "GET",
						data: {contestId: ContestID},
						success: function(json2){
							LoadingStatus2 = false;
							if(json2.status != "OK"){
								if(currP > changeDate)
									$('#highchatrsContainer').html('<div style="height:100%;display: flex;align-items: center;justify-content: center;vertical-align:center"><span>Cannot Get Hack Info!</span></div>');
								else
									$('#highchatrsContainer').html('<div style="height:100%;display: flex;align-items: center;justify-content: center;vertical-align:center"><span>Blank</span></div>');
								return;
							}
							StandingsID = ContestID;
							hackList = {};
							for(var j=0;j<json2.result.length;j++)
								if(json2.result[j].creationTimeSeconds*1000<=RealContestEndTime){
									var from = json2.result[j].hacker.members[0].handle;
									if(hackList[from] == undefined)
										hackList[from] = [];
									if(json2.result[j].verdict=="HACK_SUCCESSFUL")
										hackList[from].push([(Number(json2.result[j].creationTimeSeconds*1000)-Number(RealContestStartTime))/1000,100]);
									if(json2.result[j].verdict=="HACK_UNSUCCESSFUL")
										hackList[from].push([(Number(json2.result[j].creationTimeSeconds*1000)-Number(RealContestStartTime))/1000,-50]);
								}
							json2 = [];
							var p = getPredictedRank(globalJson.points,globalJson.penalty,(Number(currT)-Number(StartTime))/1000);
							var q = [];
							for(var j=0;j<FriendSuccessList.length;j++)
								q.push(getPredictedRank(getRealScore(FriendJson[FriendSuccessList[j]],(Number(currT)-Number(StartTime))/1000),getRealPenalty(FriendJson[FriendSuccessList[j]],(Number(currT)-Number(StartTime))/1000),(Number(currT)-Number(StartTime))/1000));
							if(currP > changeDate){
								var fir = Number(new Date())-currT.getTimezoneOffset()*60*1000;
								$('.RankDisplayer').html('#'+p);
								RankData.push([fir,p]);ScoreData.push([fir,globalJson.points]);
								for(var j=0;j<FriendSuccessList.length;j++){
									if(FriendRankData[FriendSuccessList[j]]==undefined)
										FriendRankData[FriendSuccessList[j]]=[];
									FriendRankData[FriendSuccessList[j]].push([fir,q[j]]);
								}
								getChart();
							}
						},
						error: function(jqXHR, status, error){
							LoadingStatus = false;
							clearTimeout(killLoader);
							if(currP > changeDate)
								$('#highchatrsContainer').html('<div style="height:100%;display: flex;align-items: center;justify-content: center;vertical-align:center"><span>Cannot Get Virtual Rank!</span></div>')
						},
						xhr: function() {
				            var xhr = new XMLHttpRequest();
				            xhr.addEventListener('progress', function (e) {
				                $('#highchatrsContainer > div > span').html("Loading Hacks... ("+toMemoryInfo(e.loaded)+" Loaded)");
				            })
				            return xhr;
				        }
					});
				}
				else{
					var p = getPredictedRank(globalJson.points,globalJson.penalty,(Number(currT)-Number(StartTime))/1000);
					var q = [];
					for(var j=0;j<FriendSuccessList.length;j++)
						q.push(getPredictedRank(getRealScore(FriendJson[FriendSuccessList[j]],(Number(currT)-Number(StartTime))/1000),getRealPenalty(FriendJson[FriendSuccessList[j]],(Number(currT)-Number(StartTime))/1000),(Number(currT)-Number(StartTime))/1000));
					if(currP > changeDate){
						var fir = Number(new Date())-currT.getTimezoneOffset()*60*1000;
						$('.RankDisplayer').html('#'+p);
						RankData.push([fir,p]);ScoreData.push([fir,globalJson.points]);
						for(var j=0;j<FriendSuccessList.length;j++){
							if(FriendRankData[FriendSuccessList[j]]==undefined)
								FriendRankData[FriendSuccessList[j]]=[];
							FriendRankData[FriendSuccessList[j]].push([fir,q[j]]);
						}
						getChart();
					}
				}
			},
			error: function(jqXHR, status, error){
				LoadingStatus = false;
				if(currP > changeDate)
					$('#highchatrsContainer').html('<div style="height:100%;display: flex;align-items: center;justify-content: center;vertical-align:center"><span>Cannot Get Virtual Rank!</span></div>')
			},
			xhr: function() {
	            var xhr = new XMLHttpRequest();
	            xhr.addEventListener('progress', function (e) {
	                $('#highchatrsContainer > div > span').html("Loading Standings... ("+toMemoryInfo(e.loaded)+" Loaded)");
	            })
	            return xhr;
	        }
		});
	}
}
function killApiLoad(){
	if(ApiLoadingStatus){
		ApiLoadingStatus = false;
		refreshApiInfo.abort();
	}
	if(ApiLoadingStatus2){
		ApiLoadingStatus2 = false;
		getContestList.abort();
	}
	if(ApiLoadingStatus3){
		ApiLoadingStatus3 = false;
		getRatingChanges.abort();
	}
	if(ApiLoadingStatus4){
		ApiLoadingStatus4 = false;
		getSubmissions.abort();
	}
}
function calcDelta(y){
	if(y>0)	return '<span class="ProblemAccepted" style="font-size:14px">+'+y+'</span>';
	return '<span class="ProblemCoding" style="font-size:14px;font-family:VerdanaBold">'+y+'</span>';
}
function loadRatingChanges(json,un){
	failedToLoadRatingChange = true;
	json = json.result;
	for(var i=0;i<json.length;i++){
		if(json[i].handle == un){
			failedToLoadRatingChange = false;
			var x = Number(json[i].oldRating);
			if(un == Username){
				$(".UserHandleDisplayer").css("color", CodeforcesRatingColor(x));
				if(x>=3000)
					$(".UserHandleDisplayer").addClass("LGM");
				else	$(".UserHandleDisplayer").removeClass("LGM");
			}
			var y = Number(json[i].newRating);
			$(".RatingChangesDisplayer").html(`<span ${x>=3000?`class="LGM"`:""} style="color:${CodeforcesRatingColor(x)};font-family: VerdanaBold;">${x}</span> |<span style="font-family:VerdanaBold">${calcDelta(y-x)}</span>| <span class="fa fa-angle-double-right"></span>  <span ${y>=3000?`class="LGM"`:""} style="color:${CodeforcesRatingColor(y)};font-family:VerdanaBold">${y}</span>`);
			return;
		}
	}
	$(".RatingChangesDisplayer").html("?");
}
function sortRows(x,y){
	return x.party.startTimeSeconds - y.party.startTimeSeconds;
}
function getApiInfo(cD){
	if(cD<changeDate)	return;
	var sTo=setTimeout(function(){getApiInfo(cD);}, 30000);
	var handleList = Username;
	for(var p=0;p<CurrDiffDetail.length;p++)
		handleList += (';' + CurrDiffDetail[p].handle);
	$('.ConnectionStatus').html('<span class="fa fa-spin fa-spinner"></span>  Pending for Standings...');
	$('.SendButton').html('<span class="fa fa-spin fa-spinner"></span> Loading...').removeClass("checkButton");
	ApiLoadingStatus = true;
	refreshApiInfo = $.ajax({
		url: "https://codeforces.com/api/contest.standings",
		type: "GET",
		data: {
			contestId: ContestID,
			handles: handleList,
			showUnofficial: showUnofficialIf
		},
		success: function(json){
			ApiLoadingStatus = false;
			if(json.status != "OK"){
				$('.ConnectionStatus').html('<span class="fa fa-times style_error"></span>  Cannot Get Standings!');
				$('.SendButton').html('<span class="fa fa-paper-plane"></span> Send').addClass("checkButton");
				return;
			}
			json.result.rows.sort(sortRows);
			if(cD<changeDate)	return;
			$(".ContestNameDisplayer").html("["+json.result.contest.type+`] [<span onclick="openURL('https://codeforces.com/contest/${ContestID}/')" style="cursor:pointer">#`+String(ContestID)+"</span>] "+json.result.contest.name);
			$('.UserHandleDisplayer').text(Username);
			$(".UserHandleDisplayer").css("color", "inherit");
			$('.RatingChangesDisplayer').html("");
			if(RunInNwjs)
				win.title = `${Username} At #${ContestID}`;
			else
				document.title = `${Username} At #${ContestID}`;
			json = json.result;
			ProblemInfoStorage = json.problems;
			PartyStorage = json.party;
			ContestStorage = json.contest;
			var realLength = 0;
			var realList = [];
			$('.ContestTypeChosen').html("");
			for(var i=0;i<json.rows.length;i++)
				if(json.rows[i].party.members[0].handle==Username){
					++realLength;realList.push(json.rows[i]);
					$('.ContestTypeChosen').append(`<option value="${realLength-1}">${(new Date(json.rows[i].party.startTimeSeconds*1000)).pattern("YY-MM-dd hh:mm")} ${json.rows[i].party.participantType}</option>`);
				}
			if(SelectContestIndex<0 || SelectContestIndex>=realLength)
				SelectContestTime=false;
			if(!SelectContestTime)
				SelectContestIndex=realLength-1,
				SelectContestTime=true;
			$('.ContestTypeChosen:first').val(SelectContestIndex);
			if(realLength!=0)
				$('.SmallTime').text($('.ContestTypeChosen option:selected').text().substr(0,14));
			else
				$('.SmallTime').text('-');
			ContestType = json.contest.type;
			RealContestStartTime = StartTime = json.contest.startTimeSeconds;
			if(realLength!=0)
				StartTime = realList[SelectContestIndex].party.startTimeSeconds;
			EndTime = StartTime + json.contest.durationSeconds;
			RealContestEndTime = RealContestStartTime + json.contest.durationSeconds;
			StartTime = new Date(StartTime * 1000);
			EndTime = new Date(EndTime * 1000);
			RealContestStartTime = new Date(RealContestStartTime * 1000);
			RealContestEndTime = new Date(RealContestEndTime * 1000);
			var currT = new Date();
			$('.ConnectionStatus').html('<span class="fa fa-check style_accept"></span>  Updated! ['+currT.pattern("hh:mm:ss")+']');
			$('.SendButton').html('<span class="fa fa-paper-plane"></span> Send').addClass("checkButton");
			$('.ContestName').html(`<span class="fa fa-link" onclick="openURL('https://codeforces.com/contest/${ContestID}/')" style="cursor:pointer"></span> <span class="fa fa-info-circle" onclick="openContestInfo();" style="cursor:pointer"></span> `+json.contest.name);
			CurrentStatus = json.contest.phase;
			if(currT<StartTime)	CurrentStatus="BEFORE";
			else if(currT<EndTime)	CurrentStatus="CODING";
			if(realLength==0){
				$('.VirtualRankButton').attr('disabled');
				ToolListLength=188;flushToolList();
			}
			var FriendResultInfo = {};
			for(var i=0;i<json.rows.length;i++){
				var nam = json.rows[i].party.members[0].handle;
				if(FriendResultInfo[nam] == undefined)
					FriendResultInfo[nam] = {};
				if(FriendResultInfo[nam][json.rows[i].party.participantType] == undefined)
					FriendResultInfo[nam][json.rows[i].party.participantType] = [];
				FriendResultInfo[nam][json.rows[i].party.participantType].push(json.rows[i]);
			}
			FriendJson = {};
			FriendSuccessList = [];
			for(var i=0;i<CurrDiffDetail.length;i++){
				var nam = CurrDiffDetail[i].handle;
				for(var j=0;j<CurrDiffDetail[i].contestInfo.length;j++){
					var Q = nam + '[' + CurrDiffDetail[i].contestInfo[j] + ']';
					if(CurrDiffDetail[i].contestInfo[j]=="C"){
						if(FriendResultInfo[nam]["CONTESTANT"]!=undefined){
							FriendJson[Q] = FriendResultInfo[nam]["CONTESTANT"][0];
							FriendSuccessList.push(Q);
						}
					}
					else if(CurrDiffDetail[i].contestInfo[j]=="O"){
						if(FriendResultInfo[nam]["OUT_OF_COMPETITION"]!=undefined){
							FriendJson[Q] = FriendResultInfo[nam]["OUT_OF_COMPETITION"][0];
							FriendSuccessList.push(Q);
						}
					}
					else{
						if(FriendResultInfo[nam]["VIRTUAL"]==undefined)
							continue;
						var p=CurrDiffDetail[i].contestInfo[j];
						p=Number(p.substr(1,p.length-1));
						if(p>=0)	p=p-1;
						else if(p<0)	p=FriendResultInfo[nam]["VIRTUAL"].length+p;
						if(p<0 || p>=FriendResultInfo[nam]["VIRTUAL"].length)	continue;
						FriendJson[Q] = FriendResultInfo[nam]["VIRTUAL"][p];
						FriendSuccessList.push(Q);
					}
				}
			}
			if(CurrentStatus=="BEFORE"){
				$('.ProblemInfoContainer').html('<div style="height:100%;display: flex;align-items: center;justify-content: center;vertical-align:center">Blank</div>');
				blankTip = true;
				if(!flushTimeRunned){
					flushTimeRunned=true;
					setTimeout(function(){flushTimeIndex(cD);}, 0);
				}
				clearTimeout(sTo);
				setTimeout(function(){getApiInfo(cD);}, Math.min(30000, Number(StartTime) - Number(currT)));
			}
			else{
				probList = json.problems;
				reslList = [];
				console.log(json);
				for(var i=0;i<json.problems.length;i++)
				if(realLength==0){
					$('.ConnectionStatus').html('<span class="fa fa-times style_error"></span>  Not In The Contest!');
					for(var i=0;i<probList.length;i++)
						reslList.push(['?','--:--','0','ProblemUnknown']);
					getProblemList(probList, reslList);
					$('.RankDisplayer').html("#?");
					$('#highchatrsContainer').html('<div style="height:100%;display: flex;align-items: center;justify-content: center;vertical-align:center">Blank</div>');
					return;
				}
				json = realList[SelectContestIndex];
				ParticipantTypeStorage = json.party.participantType;
				if(RunInNwjs)
					win.title = `${Username} At #${ContestID} As ${json.party.participantType}`;
				else
					document.title = `${Username} At #${ContestID} As ${json.party.participantType}`;
				$('.UserType').html(json.party.participantType);
				if((CurrentStatus == "FINISHED" && (
					json.party.participantType=="CONTESTANT"
				||  json.party.participantType=="VIRTUAL"))
				|| (json.party.participantType=="VIRTUAL" && CurrentStatus == "CODING")){
					$('.VirtualRankButton').removeAttr('disabled');
					ToolListLength=221;
					flushToolList();
					if(VirtualRank){
						globalJson = json;
						if(!LoadingStatus)
							refreshStandings();
					}
				}
				else{
					$('.VirtualRankButton').attr('disabled');
					ToolListLength=188;flushToolList();
				}
				if(json.party.participantType=="PRACTICE"){
					$('.RankDisplayer').html("#?");
					$('#highchatrsContainer').html('<div style="height:100%;display: flex;align-items: center;justify-content: center;vertical-align:center">Blank</div>');
				}
				else{
					if(!VirtualRank){
						$('.RankDisplayer').html('#'+json.rank);
						if(showUnofficialIf)
							$('.ContestAllInfoDisplayer .RankDisplayer').append(' (Unofficial)');
						var p = Number(new Date())-currT.getTimezoneOffset()*60*1000;
						RankData.push([p,json.rank]);
						ScoreData.push([p,json.points]);
						for(var i=0;i<FriendSuccessList.length;i++){
							if(FriendRankData[FriendSuccessList[i]]==undefined)
								FriendRankData[FriendSuccessList[i]]=[];
							FriendRankData[FriendSuccessList[i]].push([p,FriendJson[FriendSuccessList[i]].rank]);
						}
						getChart();
					}
				}
				ApiLoadingStatus4 = true;
				$('.ProblemInfoContainer').html(`<div style="height:100%;display: flex;align-items: center;justify-content: center;vertical-align:center">Pending for Status...</div>`);
				getSubmissions = $.ajax({
					url: "https://codeforces.com/api/contest.status",
					type: "GET",
					data:{contestId: ContestID, handle: Username},
					success: function(json4){
						ApiLoadingStatus4=false;
						if(json4.status!="OK"){
							$('.ProblemInfoContainer').html(`<div style="height:100%;display: flex;align-items: center;justify-content: center;vertical-align:center">Failed to load Status!</div>`);
							for(var i=0;i<probList.length;i++){
								var ProblemType = json.problemResults[i].bestSubmissionTimeSeconds!=undefined?"ProblemAccepted":"ProblemWrong";
								if(ProblemType == "ProblemAccepted" && json.problemResults[i].participantType=="PRELIMINARY" && CurrentStatus=="SYSTEM_TEST")
									ProblemType = "ProblemUnknown";
								if(ProblemType == "ProblemWrong")
									ProblemType = "ProblemCoding";
								var fr = "";
								if(ProblemType == "ProblemUnknown")	fr="?";
								else if(ProblemType == "ProblemAccepted")	fr='+'+(json.problemResults[i].rejectedAttemptCount==0?'':json.problemResults[i].rejectedAttemptCount);
								else if(json.problemResults[i].rejectedAttemptCount==0)	fr='';
								else fr='-'+json.problemResults[i].rejectedAttemptCount;
								var se = json.problemResults[i].bestSubmissionTimeSeconds;
								if(se==undefined || json.party.participantType=="PRACTICE")	se='--:--';
								else se=getTimeLength(se*1000);var th = json.problemResults[i].points;
								if(ContestType == "CF" && CurrentStatus == "CODING" && ProblemType != "ProblemAccepted"){
									var kpm = 0;
									kpm = (i+1) * 2;
									if(probList[i].length != 1)
										kpm = Math.ceil(kpm/4)*2;
									var predictScore = ProblemInfoStorage[i].points;
									predictScore -= Math.floor((Number(currT) - Number(StartTime))/1000/60)*kpm;
									predictScore = Maxh.max(predictScore, 0.3 * ProblemInfoStorage[i].points);
									th = predictScore;
								}
								reslList.push([fr,se,th,ProblemType]);
							}
							getProblemList(probList, reslList);
							ProblemListAppend(json.penalty, json.points, json.successfulHackCount, json.unsuccessfulHackCount);
							return;
						}
						json4=json4.result;
						SubmissionsStorage = [];
						var p = {};
						for(var i=json4.length-1;i>=0;i--){
							if(json4[i].author.participantType != json.party.participantType
							|| json4[i].author.startTimeSeconds != json.party.startTimeSeconds)
								continue;
							SubmissionsStorage.push(json4[i]);
							if(json4[i].vecdict=="COMPILATION_ERROR"
							|| (json4[i].testset=="PRETESTS" && json4[i].passedTestCount=="0"))
								continue;
							if(json4[i].verdict!="OK" && json4[i].testset!="PRETESTS")
								p[json4[i].problem.index]=true;
							else	p[json4[i].problem.index]=false;
						}
						for(var i=0;i<probList.length;i++){
							var ProblemType = json.problemResults[i].bestSubmissionTimeSeconds!=undefined?"ProblemAccepted":"ProblemWrong";
							if(ProblemType == "ProblemAccepted" && json.problemResults[i].participantType=="PRELIMINARY" && CurrentStatus=="SYSTEM_TEST")
								ProblemType = "ProblemUnknown";
							if(ProblemType == "ProblemWrong" && p[probList[i]]!=true)
								ProblemType = "ProblemCoding";
							var fr = "";
							if(ProblemType == "ProblemUnknown")	fr="?";
							else if(ProblemType == "ProblemAccepted")	fr='+'+(json.problemResults[i].rejectedAttemptCount==0?'':json.problemResults[i].rejectedAttemptCount);
							else if(json.problemResults[i].rejectedAttemptCount==0)	fr='';
							else fr='-'+json.problemResults[i].rejectedAttemptCount;
							var se = json.problemResults[i].bestSubmissionTimeSeconds;
							if(se==undefined || json.party.participantType=="PRACTICE")	se='--:--';
							else se=getTimeLength(se*1000);
							var th = json.problemResults[i].points;
							if(ContestType == "CF" && CurrentStatus == "CODING" && ProblemType != "ProblemAccepted"){
								var kpm = 0;
								kpm = (i+1) * 2;
								if(probList[i].length != 1)
									kpm = Math.ceil(kpm/4)*2;
								var predictScore = ProblemInfoStorage[i].points;
								predictScore -= Math.floor((Number(currT) - Number(StartTime))/1000/60)*kpm;
								predictScore = Math.max(predictScore, 0.3 * ProblemInfoStorage[i].points);
								th = predictScore;
							}
							reslList.push([fr,se,th,ProblemType]);
						}
						getProblemList(probList, reslList);
						ProblemListAppend(json.penalty, json.points, json.successfulHackCount, json.unsuccessfulHackCount);
					},
					error: function(){
						ApiLoadingStatus4=false;
						$('.ProblemInfoContainer').html(`<div style="height:100%;display: flex;align-items: center;justify-content: center;vertical-align:center">Failed to load Status!</div>`);
						for(var i=0;i<probList.length;i++){
							var ProblemType = json.problemResults[i].bestSubmissionTimeSeconds!=undefined?"ProblemAccepted":"ProblemWrong";
							if(ProblemType == "ProblemAccepted" && json.problemResults[i].participantType=="PRELIMINARY" && CurrentStatus=="SYSTEM_TEST")
								ProblemType = "ProblemUnknown";
							if(ProblemType == "ProblemWrong")
								ProblemType = "ProblemCoding";
							var fr = "";
							if(ProblemType == "ProblemUnknown")	fr="?";
							else if(ProblemType == "ProblemAccepted")	fr='+'+(json.problemResults[i].rejectedAttemptCount==0?'':json.problemResults[i].rejectedAttemptCount);
							else if(json.problemResults[i].rejectedAttemptCount==0)	fr='';
							else fr='-'+json.problemResults[i].rejectedAttemptCount;
							var se = json.problemResults[i].bestSubmissionTimeSeconds;
							if(se==undefined || json.party.participantType=="PRACTICE")	se='--:--';
							else se=getTimeLength(se*1000);
							var th = json.problemResults[i].points;
							if(ContestType == "CF" && CurrentStatus == "CODING" && ProblemType != "ProblemAccepted"){
								var kpm = ProblemInfoStorage[i].points / 250;
								predictScore -= Math.floor((Number(currT) - Number(StartTime))/1000/60)*kpm;
								predictScore = Math.max(predictScore, 0.3 * ProblemInfoStorage[i].points);
								th = predictScore;
							}
							reslList.push([fr,se,th,ProblemType]);
						}
						getProblemList(probList, reslList);
						ProblemListAppend(json.penalty, json.points, json.successfulHackCount, json.unsuccessfulHackCount);
					},
					xhr: function() {
			            var xhr = new XMLHttpRequest();
			            xhr.addEventListener('progress', function (e) {
			                $('.ProblemInfoContainer').html(`<div style="height:100%;display: flex;align-items: center;justify-content: center;vertical-align:center"><span class="fa fa-download"></span>  Downloading Status... ${toMemoryInfo(e.loaded)}</div>`);
			            });
			            return xhr;
			        }
				});
				if(CurrentStatus == "CODING"){
					if(!flushTimeRunned){
						flushTimeRunned=true;
						setTimeout(function(){flushTimeIndex(cD);}, 0);
					}
				}
				else if(CurrentStatus == "PENDING_SYSTEM_TEST"){
					setProgressPercent(100);
					$('.ContestStatus div').html('<i class="fas fa-spin fa-sync"></i>Pending');
				}
				else if(CurrentStatus == "SYSTEM_TEST"){
					setProgressPercent(100);
					$('.ContestStatus div').html('<i class="fas fa-server"></i><br/>Testing');
				}
				else if(json.party.participantType=="PRACTICE"){
					setIdleProgress();
					$('.ContestStatus div').html('<i class="fas fa-check style_accept"></i><br/>Finished');
				}
				else if(CurrentStatus == "FINISHED"){
					setProgressPercent(100);
					$('.ContestStatus div').html('<i class="fas fa-check style_accept"></i><br/>Finished');
					clearTimeout(sTo);
				}
				if(json.party.participantType == "CONTESTANT"){
					$('.RatingChangesDisplayer').html("<span class='fa fa-spin fa-spinner'></span> ");
					ApiLoadingStatus3 = true;
					failedToLoadRatingChange = true;
					if(CurrentStatus == "FINISHED"){
						getRatingChanges = $.ajax({
							url: "https://codeforces.com/api/contest.ratingChanges",
							type: "GET",
							data: {contestId: ContestID},
							success: function(json3){
								ApiLoadingStatus3 = false;
								if(json3.status != "OK"){
									$('.RatingChangesDisplayer').html("<span class='fa fa-unlink'></span> ");
									return;
								}
								loadRatingChanges(json3, Username);
								if(failedToLoadRatingChange){
									getRatingChanges = $.ajax({
										url: "https://cf-predictor-frontend.codeforces.ml/GetNextRatingServlet",
										type: "GET",
										data: {contestId: ContestID},
										success: function(json3){
											ApiLoadingStatus3 = false;
											json3 = JSON.parse(json3);
											if(json3.status != "OK"){
												$('.RatingChangesDisplayer').html("<span class='fa fa-unlink'></span> ");
												return;
											}
											loadRatingChanges(json3, Username);
										},
										error: function(){
											ApiLoadingStatus3 = false;
											$('.RatingChangesDisplayer').html("<span class='fa fa-unlink'></span> ");
										},
										xhr: function() {
								            var xhr = new XMLHttpRequest();
								            xhr.addEventListener('progress', function (e) {
								            	$('.RatingChangesDisplayer').html("<span class='fa fa-download'></span>  "+toMemoryInfo(e.loaded));
								            });
								            return xhr;
								        }
									});
								}
							},
							error: function(){
								ApiLoadingStatus3 = false;
								$('.RatingChangesDisplayer').html("<span class='fa fa-unlink'></span> ");
							},
							xhr: function() {
					            var xhr = new XMLHttpRequest();
					            xhr.addEventListener('progress', function (e) {
					            	$('.RatingChangesDisplayer').html("<span class='fa fa-download'></span>  "+toMemoryInfo(e.loaded));
					            });
					            return xhr;
					        }
						});
					}
					else{
						getRatingChanges = $.ajax({
							url: "https://cf-predictor-frontend.codeforces.ml/GetNextRatingServlet",
							type: "GET",
							data: {contestId: ContestID},
							success: function(json3){
								ApiLoadingStatus3 = false;
								json3 = JSON.parse(json3);
								if(json3.status != "OK"){
									$('.RatingChangesDisplayer').html("<span class='fa fa-unlink'></span> ");
									return;
								}
								loadRatingChanges(json3, Username);
							},
							error: function(){
								ApiLoadingStatus3 = false;
								$('.RatingChangesDisplayer').html("<span class='fa fa-unlink'></span> ");
							},
							xhr: function() {
					            var xhr = new XMLHttpRequest();
					            xhr.addEventListener('progress', function (e) {
					            	$('.RatingChangesDisplayer').html("<span class='fa fa-download'></span>  "+toMemoryInfo(e.loaded));
					            });
					            return xhr;
					        }
						});
					}
				}
			}
		},
		error: function(jqXHR, status, errorThrown){
			ApiLoadingStatus = false;
			if(jqXHR.responseJSON == undefined){
				$('.ConnectionStatus').html('<span class="fa fa-times style_error"></span>  Cannot Get Standings!');
				$('.SendButton').html('<span class="fa fa-paper-plane"></span> Send').addClass("checkButton");
				return;
			}
			var ec = jqXHR.responseJSON.comment, ref = false;
			if(ec===`contestId: Contest with id ${ContestID} has not started`){
				$('.ConnectionStatus').html('<span class="fa fa-spin fa-spinner"></span>  Contest Not Started...');
				ApiLoadingStatus2 = true;
				getContestList = $.ajax({
					url: "https://codeforces.com/api/contest.list",
					type: "GET",
					success: function(json2){
						ApiLoadingStatus2 = false;
						if(json2.status != "OK"){
							$('.ConnectionStatus').html('<span class="fa fa-times style_error"></span>  Contest Not Found!');
							$('.SendButton').html('<span class="fa fa-paper-plane"></span> Send').addClass("checkButton");
							return;
						}
						json2=json2.result;
						for(var i=0;i<json2.length;i++){
							if(json2[i].phase == "FINISHED")	break;
							if(json2[i].id == ContestID){
								$(".ContestIdNumber").text("#"+ContestID);
								$(".SmallContestName").text("#"+ContestID);
								$('.SmallUsername').text('@'+Username);
								$('.ContestTypeChosen').html('');
								ContestStorage = json2[i];
								SelectContestTime = false;
								RealContestStartTime = StartTime = json2[i].startTimeSeconds;
								EndTime = StartTime + json2[i].durationSeconds;
								RealContestEndTime = RealContestStartTime + json2[i].durationSeconds;
								StartTime = new Date(StartTime * 1000);
								EndTime = new Date(EndTime * 1000);
								RealContestStartTime = new Date(RealContestStartTime * 1000);
								RealContestEndTime = new Date(RealContestEndTime * 1000);
								var currT = new Date();
								$('.ConnectionStatus').html('<span class="fa fa-check style_accept"></span>  Updated! ['+currT.pattern("hh:mm:ss")+']');
								$('.SendButton').html('<span class="fa fa-paper-plane"></span> Send').addClass("checkButton");
								$('.ContestName').html(`<span class="fa fa-link" onclick="openURL('https://codeforces.com/contest/${ContestID}/')" style="cursor:pointer"></span> <span class="fa fa-info-circle" onclick="openContestInfo();" style="cursor:pointer"></span> `+json2[i].name);
								CurrentStatus = json2[i].phase;
								if(currT<StartTime)	CurrentStatus="BEFORE";
								else if(currT<EndTime)	CurrentStatus="CODING";
								$('.VirtualRankButton').attr('disabled');
								ToolListLength=188;flushToolList();
								$('.ProblemInfoContainer').html('<div style="height:100%;display: flex;align-items: center;justify-content: center;vertical-align:center">Blank</div>');
								blankTip = true;
								$('.UserType').html('UNKNOWN');
								$('.RankDisplayer').html("#?");
								ContestType = json2[i].type;
								$('.ContestType').html(json2[i].type);
								$('#highchatrsContainer').html('<div style="height:100%;display: flex;align-items: center;justify-content: center;vertical-align:center">Blank</div>');
								if(!flushTimeRunned){
									flushTimeRunned=true;
									setTimeout(function(){flushTimeIndex(cD);}, 0);
								}
								clearTimeout(sTo);
								setTimeout(function(){getApiInfo(cD);}, Math.min(30000, Number(StartTime) - Number(currT)));
							}
						}
					},
					error: function(jqXHR, status, error){
						$('.ConnectionStatus').html('<span class="fa fa-times style_error"></span>  Contest Not Found!');
						$('.SendButton').html('<span class="fa fa-paper-plane"></span> Send').addClass("checkButton");
					},
					xhr: function() {
			            var xhr = new XMLHttpRequest();
			            xhr.addEventListener('progress', function (e) {
			                $('.ConnectionStatus').html('<span class="fa fa-download"></span>  Downloading Contest Info... '+toMemoryInfo(e.loaded));
			            });
			            return xhr;
			        }
				})
			}
			else{
				$('.ConnectionStatus').html('<span class="fa fa-times style_error"></span>  '+(ec.substr(0,8)==='handles:'?'Username Not Found!':(ec.substr(0,10)==='contestId:'?'Contest Not Found!':(ref=true,"Cannot Get Standings!"))));
				$('.SendButton').html('<span class="fa fa-paper-plane"></span> Send').addClass("checkButton");
				if(!ref)
					clearTimeout(sTo);
			}
		},
		xhr: function() {
            var xhr = new XMLHttpRequest();
            xhr.addEventListener('progress', function (e) {
                $('.ConnectionStatus').html('<span class="fa fa-download"></span>  Downloading Standings... '+toMemoryInfo(e.loaded));
            });
            return xhr;
        }
	});
}
function checkName(un){
	if(un.length<3 || un.length>24)
		return false;
	for(var i=0;i<un.length;i++)
		if(!((un[i]>='a' && un[i]<='z') || (un[i]>='A' && un[i]<='Z') || (un[i]>='0' && un[i]<='9') || un[i]=='_' || un[i]=='.' || un[i]=='-'))
			return false;
	return true;
}
function checkContestType(x){
	if(x === "")	return false;
	if(x=== "C" || x === "O")	return true;
	if(x[0]!='V')	return false;
	var p=1;
	if(x[1]=='-')	++p;
	if(p==x.length)	return false;
	while(p!=x.length && x[p]>='0' && x[p]<='9')	++p;
	return p==x.length?true:false;
}
function AnalysisString(x){
	if(x === "")	return {status: "OK",result: []};
	x = x.split(';');
	var ret = [];
	for(var l=0;l<x.length;l++){
		if(x[l]=="")	continue;
		var nam = "";
		var p = 0;
		while(p != x[l].length && x[l][p]!='['){nam += x[l][p];++p;}
		if(!checkName(nam) || x[l][x[l].length-1]!=']')	return {status: "ER",result: []};
		var alList = [];
		var currStr = "";
		++p;
		while(p != x[l].length-1){
			if(x[l][p]==','){
				if(!checkContestType(currStr))
					return {status: "ER",result: []};
				alList.push(currStr);
				currStr = "";
			}
			else currStr += x[l][p];
			++p;
		}
		alList.push(currStr);
		ret.push({handle: nam, contestInfo: alList});
	}
	return {status: "OK",result: ret};
}
function changeUserInfo(){
	var un = $('.UsernameInput:first').val();
	var ci = $('.ContestIDInput:first').val();
	var di = $('.ContestDiffCalc:first').val();
	$('.ConnectionStatus').html('<span class="fa fa-spin fa-spinner"></span>  Checking Information...');
	if(un.length<3 || un.length>24){
		$('.ConnectionStatus').html('<span class="fa fa-times style_error"></span>  Username Incorrect!');
		return;
	}
	for(var i=0;i<un.length;i++)
		if(!((un[i]>='a' && un[i]<='z') || (un[i]>='A' && un[i]<='Z') || (un[i]>='0' && un[i]<='9') || un[i]=='_' || un[i]=='.' || un[i]=='-')){
			$('.ConnectionStatus').html('<span class="fa fa-times style_error"></span>  Username Inorrect!');
			return;
		}
	if(ci.length==0){
		$('.ConnectionStatus').html('<span class="fa fa-times style_error"></span>  Contest ID Incorrect!');
		return;
	}
	for(var i=0;i<ci.length;i++)
		if(ci[i]<'0' || ci[i]>'9'){
			$('.ConnectionStatus').html('<span class="fa fa-times style_error"></span>  Contest ID Incorrect!');
			return;
		}
	if(di != CurrDiffCalc){
		var getResult = AnalysisString(di);
		if(getResult.status != "OK"){
			$('.ConnectionStatus').html('<span class="fa fa-times style_error"></span>  Analysis Failed!');
			return;
		}
		CurrDiffDetail = getResult.result;
	}
	if(Username == un && ContestID == Number(ci) && di == CurrDiffCalc){
		changeDate = new Date();
		if($('.ContestTypeChosen').html()!=''){
			SelectContestTime=true;
			SelectContestIndex=Number($('.ContestTypeChosen:first').val());
		}
		RankData = [];
		ScoreData = [];
		FriendRankData = [];
		killGetStandings();
		killApiLoad();
		getApiInfo(new Date());
		return;
	}
	changeDate = new Date();
	Username = un;
	ContestID = ci;
	CurrDiffCalc = di;
	RankData = [];
	ScoreData = [];
	FriendRankData = [];
	SelectContestTime = false;
	killGetStandings();
	killApiLoad();
	getApiInfo(new Date());
}
var BranchLink;
var RepoLink = "https://github.com/CodeforcesContestHelper/CodeforcesContestHelper";
function getNewestRepo(){
	$('.ConnectionStatus').html('<span class="fa fa-spin fa-spinner"></span>  Loading Repo Info...');
	$.getJSON("https://api.github.com/repos/CodeforcesContestHelper/CodeforcesContestHelper/commits",function(json){
		commitInfo = json;
		json=json[0];
		var UpdateTime = json.commit.committer.date.replace('T',' ');
		UpdateTime=UpdateTime.substr(0,UpdateTime.length-1);
		UpdateTime=new Date(UpdateTime.replace(/-/g,'/'));
		UpdateTime=new Date(Number(UpdateTime)-UpdateTime.getTimezoneOffset()*60*1000);
		BranchLink=json.html_url;
		$('.ConnectionStatus').html(`<span class="fa fa-check style_accept"></span>  Last Update at ${UpdateTime.pattern("YY-MM-dd hh:mm:ss")}!`);
	}).fail(function(){
		$('.ConnectionStatus').html('<span class="fa fa-times style_error"></span>  Connection Error!');
	});
}
function openSelf(){
	if(!RunInNwjs)	return;
	nw.Window.open("index.html",{
	    "title": "Codeforces Contest Helper", 
	    "icon": "favicon.png",
	    "width": 400,
	    "height": 281, 
	    "position": "center",
	    "min_width": 400,
	    "min_height": 0,
	    "max_width": 9999,
	    "max_height": 9999,
	    "resizable": false,
	    "fullscreen":false,
	    "show_in_taskbar":true,
	    "show":true, 
	    "kiosk":false,
	    "frame":false,
	    "transparent":true
	});
}
function showAdvancedOptionIf(){
	if(!openAdvancedOption){
		$(".UserType").css("max-width","8px");
		$(".AdvancedToolList").css("width",ToolListLength);
		$('.OpenAdvancedButton').addClass("fa-rotate-180").attr("title","Less Options");
	}
	else{
		$(".UserType").css("max-width","200px");
		$(".AdvancedToolList").css("width","24px");
		$('.OpenAdvancedButton').removeClass("fa-rotate-180").attr("title","More Options");
	}
	openAdvancedOption = !openAdvancedOption;
}
function SetLessInfoIf(){
	if(showLessSubmissionInfo)
		$(".LessInfoSelect").html(`<span class="far fa-square"></span> `);
	else
		$(".LessInfoSelect").html(`<span class="fa fa-check-square"></span> `);
	showLessSubmissionInfo = !showLessSubmissionInfo;
	if($('.MessageBoxProblem').css('display')=='block'
	&& $('.AlertWindow').css('display')=='block')
		flushSubmissionInfo(VariableX);
}
$('.LockButton').attr('onclick','lockIfClick()');
$('.SendButton').attr('onclick','changeUserInfo()');
$('.UnofficialButton').attr('onclick','showUnofficialIfClick()');
$('.CloseButton').attr('onclick','closeIf()');
$('.VirtualRankButton').attr('onclick','getVirtualRankIf()');
$('.FoldButton').attr('onclick','setSmall()');
$('.UnfoldButton').attr('onclick','setBig()');
$('.UpdateButton').attr('onclick','getNewestRepo()');
$('.OpenWindowButton').attr('onclick','openSelf()');
$('.OpenAdvancedButton').attr('onclick','showAdvancedOptionIf()');
$('.BlackBackground').attr('onclick','closeMessageBox()');
$('.SetOnTopButton').attr('onclick','setOnTopIf()');
$(".RefreshVirtualButton").click(function(){
	changeUserInfo();
	$(".RefreshVirtualButton").css("max-width", "0px");
});
function allHtmlSpecialChars(text){
    var map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      '\'': '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}