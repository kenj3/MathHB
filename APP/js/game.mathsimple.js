
$(document).on("pagecreate",function(event){
	var game = new Game_MathSimple();
	game.gameid = GAMEID;
	
	// 游戏开始页面
	$('.jpanelresult').hide();
	$('.jpaneltest').hide();
	$('.jpanelstart').show();
	loadBeilaResult();

	// 开始按钮
	$(".jstart").fastClick(function(e) {
		$('.jpanelresult').hide();
		$('.jpanelstart').hide();
		$('.jpaneltest').show();
        // 开始游戏
		game.start();
		refreshTestPanel();
	});
	$(".jredo").fastClick(function(e) {
		// 游戏开始页面
		$('.jpanelresult').hide();
		$('.jpaneltest').hide();
		$('.jpanelstart').show();
	});
	// 数字按钮
  	$(".jnumber").fastClick(function(e) {
  		e.stopPropagation();				// 阻止JavaScript事件冒泡传递, 消除一次点击多次触发的现象
  		game.typeInText($(this).data('value'));
		$('.jquestionresult').text(game.inputtext);
	}); 
	// 清除按钮
	$(".jclear").fastClick(function(e) {
		e.stopPropagation();				// 阻止JavaScript事件冒泡传递, 消除一次点击多次触发的现象
		game.clearCurrentText();
		$('.jquestionresult').text(game.inputtext);
	});
	// 继续按钮
	$(".jnext").fastClick(function(e) {
		e.stopPropagation();
		game.next();
		if(game.timecomplete == null)
		{
			// 继续显示下面的题目
			refreshTestPanel();
		}
		else
		{
			// 游戏完成,显示成绩
			refreshGameCompletePanel();
			// 保存练习成绩
			game.saveGameResult(function(res){
				if (res[0].result == '1') {
					console.log('saved data.');
				}
				else {
					console.log(res[0].result);
	           }
			});
		}
	});
	// 返回按钮
	$(".jprevious").fastClick(function(e) {
		//e.stopPropagation();
		game.previous();
		refreshTestPanel();
	});
	// 刷新游戏页面
	function refreshTestPanel()
	{
		if(game.index > 0)
		{
			$('.jquestionnumber1').text(game.num1);
			$('.jquestionnumber2').text(game.num2);
			$('.jsymbol').html(game.symbol);
			$('.jquestionresult').text(game.inputtext);
			$('.jindexofquestion').text(game.index);
		}
		else{
			$('.jpanelresult').hide();
			$('.jpaneltest').hide();
			$('.jpanelstart').show();
		}
	}
	// 刷新完成页面
	function refreshGameCompletePanel()
	{
		$('.jpaneltest').hide();
		$('.jpanelstart').hide();
		$('.jpanelresult').show();
		$('.jscore').text(game.score + '分');
		$('.jscoretime').text(game.timeSpanText());
		$('.jredo').show();
		/*
	    if (game.score == 100)
	    {
	        $('.jredo').hide();
	        $('.jnextlevel').show();
	    }
	    else
	    {
	        $('.jredo').show();
	        $('.jnextlevel').hide();
	    }
	    */
	}
	
	// 加载学习成绩
	function loadBeilaResult(){
		//$('.jstitlebeila')
		game.loadBeilaResult(function(res){
			if(res != null){
			    if (res[0].result == '1') {
				    if (res[1].length > 0) {
					//console.log(res[1][0].PlayTimes);
					var playTimes = res[1][0].PlayTimes;
					var gameScoreBest = res[1][0].GameScoreBest;
					var gameSpeedBest = res[1][0].GameSpeedBest;
					var datePlayed = res[1][0].DatePlayed;
					var txt = '贝拉今天玩了' + playTimes + '次<br/>最好成绩是' + gameScoreBest + '分<br/>最快是' + game.getStringByMS(gameSpeedBest);
					$('.jstitlebeila').html(txt);
					
				    }
			    }
			    else {
				    console.log(res[0].result);
                }
			}
			else
			{
				//$('.jstitlebeila').html('贝拉正在努力玩数学,你也要加油哦!');
			}
		});
	}

	
	//显示新的题目
	//function 
	
	// *************
	// 测试重复数字
	// *************
	/*
	var max = 100;
	game.Start();
	game.totalquestions = max;
	var memo = '';
	for(var i = 0; i<max; i++)
	{
		game.Next();
	}
	var memo = '';
	for(var i = 0; i<max; i++)
	{
		var currenttxt = '[' + game.data[i].num1 + game.data[i].symbol + game.data[i].num2 + ']';
		if(memo.indexOf(currenttxt) > -1)
		{
			console.log('Found dupliate data: ' + currenttxt);
		}
		memo += currenttxt;
	}
	*/
});

// 大班数学-小于20的加减法
var Game_MathSimple = function(){
	//this.svcurl = 'http://localhost:11032/wsvc/beila.svc/';
	this.svcurl = config[0].serviceurl + '/wsvc/beila.svc/';
	this.gameid = 1;				// 游戏ID
	this.data = [];
	this.index = 0; 				// 当前索引
	this.totalquestions = 10; 		// 题目总数
	this.num1 = 0; 					// 第一个数
	this.num2 = 0; 					// 第二个数
	this.symbol = 0;				// 第一个计算符号
	this.level = 1; 				// 当前难度
	this.inputtext = '';			// 用户输入的答案
	this.score = 0;					// 分数
	this.timestart = null;			// 游戏开始时间戳
	this.timecomplete = null;		// 游戏完成时间戳
	this.SYMBOLPLUS = '+';			// 加号
	this.SYMBOLMINUS = '&minus;';	// 减号
	this.SYMBOLTIMES = '&times;';	// 乘号
	this.SYMBOLDIVIDE = '&divide;';	// 除号
};
// 游戏开始
Game_MathSimple.prototype.start = function(){
	this.index = 0; // 从第一题开始
	this.data = []; // 清空数据
	this.inputtext = '';
	this.timestart = (new Date()).valueOf();
	this.timecomplete = null;
	this.generateRandomNumbers();
	this.index++;
	//console.log("81:" + this.index);
};
// 游戏进入下一个计算题
Game_MathSimple.prototype.next = function(){
	if(this.inputtext.length > 0)
	{
		// 保存当前结果
		var equation = '' + this.num1 + this.convertSymbolToChar(this.symbol) + this.num2; // 前2个数字的计算式
		var computerResult = eval(equation);					// 运行计算式并保存结果
		var userResult = 0;
		if (computerResult == this.inputtext) userResult = 1; 	// 计算的结果和用户的输入一致, 题目答对
		var row = { level: this.level, 
					  index: this.index, 
					  num1: this.num1, 
					  num2: this.num2, 
					  symbol: this.symbol, 
					  inputtext: this.inputtext, 
					  userresult: userResult, 
					  timestamp: (new Date()).valueOf() };
		this.data.push(row);									// 保存到数组
		
		// 清除用户输入
		this.clearCurrentText();
		if(this.index < this.totalquestions)
		{
			// 重新生成数字
			this.generateRandomNumbers();
			// 检查随机生成的数字和符号是否已经在游戏数据中出现过
			while(this.checkIfNumsExistInData()){
				this.generateRandomNumbers();
				console.log('Found duplicate numbers. And already rerun the random number function.');
			}
			this.index++;
		}
		else
		{
			this.complete();
		}
	}
	else{
		// 用户没有输入结果
		// 忽略，可以考虑是否输出提示！
	}
};
// 游戏回到上一个题目
Game_MathSimple.prototype.previous = function(){
	if(this.index > 1)
	{
		// 往前一页
		this.index--;
		var prev = this.index - 1;
		this.num1 = this.data[prev].num1;
		this.num2 = this.data[prev].num2;
		this.symbol = this.data[prev].symbol;
		this.inputtext = this.data[prev].inputtext;
	}
	else
	{
		// 回到首页
		this.index = 0;		
	}
};
// 游戏结束
Game_MathSimple.prototype.complete = function(){
	// 计算最后成绩
	this.timecomplete = (new Date()).valueOf();
	this.score = 0;
	for(var i = 0; i<this.data.length; i++)
	{
		this.score += this.data[i].userresult;
	}
	this.score = this.score * 100 / this.totalquestions;
	//console.log('score:' + this.score);
};
// 用户输入数字
Game_MathSimple.prototype.typeInText = function(txt){
	if(this.inputtext.length < 3) // 最多只能输入3位数
	{
		if(txt == '.')
		{
			if(this.inputtext.indexOf('.') == -1)
			{
				this.inputtext += '.';
			}
		}
		else{
			this.inputtext += txt;
		}
	}
};
// 清除当前输入数据
Game_MathSimple.prototype.clearCurrentText = function(txt){
	this.inputtext = '';
};
// 检查检查随机生成的数字和符号是否已经在游戏数据中出现过
Game_MathSimple.prototype.checkIfNumsExistInData = function(txt){
	for(var i = 0; i<this.data.length; i++)
	{
		if(this.data[i].num1 == this.num1 && this.data[i].num2 == this.num2 && this.data[i].symbol == this.symbol)
		{
			return true;
		}
	}
	return false;
};
// 计算实际使用时间
Game_MathSimple.prototype.timeSpanText = function(){
	var txt = '';
	var ms = this.timecomplete - this.timestart;
	var s = Math.floor(ms/1000);
	var m = Math.floor(s/60);
	var hs = (ms % 1000);
	if(m > 0)
	{
	   txt += m + '分';
	}
	if(s > 0)
	{
	   txt += (s % 60) + '.' + hs + '秒';
	}
	return txt;
}
// 计算总共毫秒数
Game_MathSimple.prototype.getTotalMilliseconds = function(){
	var ms = this.timecomplete - this.timestart;
	return ms;
}
// 格式化时间间隔,返回分和秒,如4分2.23秒
Game_MathSimple.prototype.getStringByMS = function(ms){
	var txt = '';
	var s = Math.floor(ms/1000);
	var m = Math.floor(s/60);
	var hs = (ms % 1000);
	if(m > 0)
	{
	   txt += m + '分';
	}
	if(s > 0)
	{
	   txt += (s % 60) + '.' + hs + '秒';
	}
	return txt;
}

// 生成2个随机100以内的数字和加减符号
Game_MathSimple.prototype.generateRandomNumbers = function(){
	if(this.gameid==1)
	{
		// Game 1: 20以内加减法
		this.symbol = this.randomSymbol(1,3);
		if(this.symbol == this.SYMBOLMINUS)
		{
			// 减法：第一个数是5到20，第二个数是1到第一个数减一
			this.num1 = this.randomNumber(5, 21);
			this.num2 = this.randomNumber(1, this.num1);
		}
		else
		{
			// 加法：第一个数是1到19
			this.num1 = this.randomNumber(1, 20);
			this.num2 = this.randomNumber(1, 21 - this.num1);
		}
	}
	else if(this.gameid==2)
	{
		// Game 2: 100以内加减法
		this.symbol = this.randomSymbol(1,3);
		if(this.symbol == this.SYMBOLMINUS)
		{
			// 减法：第一个数是20到99，第二个数是1到第一个数
			this.num1 = this.randomNumber(20, 100);
			this.num2 = this.randomNumber(1, this.num1);
		}
		else
		{
			// 加法：第一个数是20到98
			this.num1 = this.randomNumber(20, 99);
			this.num2 = this.randomNumber(1, 100 - this.num1);
		}
	}
	else if(this.gameid==3)
	{
		// Game 3: 超过100的加减法
		this.symbol = this.randomSymbol(1,3);
		if(this.symbol == this.SYMBOLMINUS)
		{
			// 减法：第一个数是100到200，第二个数是1到第一个数
			this.num1 = this.randomNumber(100, 201);
			this.num2 = this.randomNumber(1, this.num1);
		}
		else
		{
			// 加法：第一个数是20到190
			this.num1 = this.randomNumber(20, 191);
			if(this.num1 > 100)
			{
				this.num2 = this.randomNumber(1, 200 - this.num1);
			}
			else
			{
				this.num2 = this.randomNumber(100 - this.num1, 200 - this.num1);			
			}
		}
	}
	else if(this.gameid==4)
	{
		// Game 4: 5以内的乘法
		this.symbol = this.SYMBOLTIMES;
		// 第一个数是0到5
		this.num1 = this.randomNumber(0, 6);
		this.num2 = this.randomNumber(0, 6);
	}
	else if(this.gameid==5)
	{
		// Game 5: 10以内的乘法
		this.symbol = this.SYMBOLTIMES;
		// 第一个数是0到9, 第二个数是0到9
		this.num1 = this.randomNumber(0, 10);
		this.num2 = this.randomNumber(0, 10);
	}
	else if(this.gameid==6)
	{
		// Game 6: 20以内的乘法
		this.symbol = this.SYMBOLTIMES;
		// 第一个数是1到20, 第二个数是1到20
		this.num1 = this.randomNumber(1, 21);
		this.num2 = this.randomNumber(1, 21);
	}
	else if(this.gameid==7)
	{
		// Game 7: 25以内的除法
		this.symbol = this.SYMBOLDIVIDE;
		// 第二个数是1到5, 答案是0到5，然后算出第一个数
		this.num2 = this.randomNumber(1, 6);
		this.num1 = this.randomNumber(0, 6) * this.num2;
	}
	else if(this.gameid==8)
	{
		// Game 8: 100以内除法
		this.symbol = this.SYMBOLDIVIDE;
		// 第二个数是1到10, 答案是0到10，然后算出第一个数
		this.num2 = this.randomNumber(1, 11);
		this.num1 = this.randomNumber(0, 11) * this.num2;
	}
	else if(this.gameid==9)
	{
		// Game 9: 400以内除法
		this.symbol = this.SYMBOLDIVIDE;
		// 第二个数是1到20, 答案是0到20，然后算出第一个数
		this.num2 = this.randomNumber(1, 21);
		this.num1 = this.randomNumber(0, 21) * this.num2;
	}
	
	
};
// 随机生成运算符号
Game_MathSimple.prototype.randomSymbol = function(minvalue, maxvalue){
	var i = this.randomNumber(minvalue, maxvalue);
	if (i == 1) {
		return this.SYMBOLPLUS;
	}
	else if (i == 2) {
		return this.SYMBOLMINUS;
	}
	else if (i == 3) {
		return this.SYMBOLTIMES;
	}
	else if (i == 4) {
		return this.SYMBOLDIVIDE;
	}
};
// 转换符号到实际运算符
Game_MathSimple.prototype.convertSymbolToChar = function (symbol) {
	if (symbol == this.SYMBOLPLUS) {
		return '+';
	}
	else if (symbol == this.SYMBOLMINUS) {
		return '-';
	}
	else if (symbol == this.SYMBOLTIMES) {
		return '*';
	}
	else if (symbol == this.SYMBOLDIVIDE) {
		return '/';
	}
};
// 返回数值包含min, 不包含max
Game_MathSimple.prototype.randomNumber = function (min, max) {
	var num = Math.random() * (max - min) + min;
	return parseInt(num, 10);
};
// 返回贝拉数据
Game_MathSimple.prototype.loadBeilaResult = function (callback) {
	try{
		$.ajaxSetup({
			statusCode: {
		        404: function() {
		          alert('page not found');
		        }
		    }    
		});
		   
	    var datajson = {"BGameID":this.gameid};
	    var url = this.svcurl + 'GetBeilaGameInfo';
	    $.ajax({
			type: 'get',
			async: true,
            url: url,
            dataType: 'jsonp',
            data: datajson,
            jsonp: "callback",
            jsonpCallback:'myHandler',
            success: function (data) {
            	callback(data);
        	},
            error: function (XMLHttpRequest, textStatus, errorThrown) {
            	callback(null);
        	}
        });
    }
	catch(e)
	{
        callback(null);
	}
};
// 保存成绩
Game_MathSimple.prototype.saveGameResult = function (callback) {
	var datajson = {"BGameID":this.gameid,"BUserGUID":"","GameScore":this.score,"GameSpeed":this.getTotalMilliseconds()};
	var url = this.svcurl + 'AddGamePlayLog';
	$.ajax({
			type: 'get',
			async: true,
            url: url,
            dataType: 'jsonp',
            data: datajson,
            jsonp: "callback",
            jsonpCallback:'myHandler',
            success: function (data) {
            	callback(data);
        	},
            error: function (xhr) {
            	console.log(xhr.responseText);
        	}
    });
};



