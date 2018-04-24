$(document).on("pagecreate",function(event){
	// 游戏开始页面
	$('.jpanelresult').hide();
	$('.jpaneltest').hide();
	$('.jpanelstart').show();
	var game = new Game_Typing();
	
	/*
	var myaudio = document.createElement('audio');
	myaudio.setAttribute('src', '../audio/character/f-a.mp3');
	myaudio.setAttribute('preload', 'preload'); //打开自动播放
	*/
	
	$(".jstart").fastClick(function(e) {
		$('.jpanelresult').hide();
		$('.jpanelstart').hide();
		$('.jpaneltest').show();
		game.start();
		refreshTestPanel();
		
		//myaudio.currentTime = 0;
		//myaudio.play();
	});
	
	


	$("body").keyup(function(event){
		var kcode = event.keyCode;
		if(kcode >= 65 && kcode <= 91)
		{
			if(this.isCompleted)
			{
				refreshGameCompletePanel();
			}
			var selectedKeyClassname = 'js-' + String.fromCharCode(kcode);
			$('.' + selectedKeyClassname).attr('class', 'softkeys__btn__touched ' + selectedKeyClassname);
			game.compareText(String.fromCharCode(kcode));
			if(!game.isCompleted){
				refreshTestPanel();
			}
			else{
				refreshGameCompletePanel();
			}
			setTimeout((function(){$('.' + selectedKeyClassname).attr('class', 'softkeys__btn ' + selectedKeyClassname);}),300);
			
			
			/*
			console.log(String.fromCharCode(kcode));
			console.log(kcode);
			myaudio.currentTime = 0;
			myaudio.play();
			*/
		}
	});
	
	
	$('.softkeys').softkeys({
        target : $('.softkeys').data('target'),
        layout : [
            [
                'Q','W','E','R','T','Y','U','I','O','P'
            ],
            [
                'A','S','D','F','G','H','J','K','L'
            ],
            [
                'Z','X','C','V','B','N','M',''
            ]
        ]
    });

	
	// 刷新游戏页面
	function refreshTestPanel()
	{
		$('.jquestionnumber1').html(game.getTestString());
		$('.jindexofquestion').text(game.title[game.index]);
	}
	
	// 刷新完成页面
	function refreshGameCompletePanel()
	{
		$('.jpaneltest').hide();
		$('.jpanelstart').hide();
		$('.jpanelresult').show();
		//$('.jscore').text(game.score + '分');
		//$('.jscoretime').text(game.timeSpanText());
		//$('.jredo').show();
	}
	
	
});

var Game_Typing = function(){
	this.svcurl = config[0].serviceurl + '/wsvc/beila.svc/';
	
	this.isCompleted = false;
	this.index = 0; // 从第一行开始
	this.jindex = 0; // 从第一列开始比较
	this.inputtext = '';
	this.timestart = (new Date()).valueOf();
	this.timecomplete = null;
	this.data = [
		['Q','A','Z'],
		['W','S','X'],
		['E','D','C'],
		['R','F','V'],
		['T','G','B'],
		['Y','H','N'],
		['U','J','M'],
		['I','K'],
		['O','L'],
		['P']
	];
	this.title = [
		'1. 用左手小拇指输入这三个英文字母',
		'2. 用左手无名指输入这三个字母',
		'3. 用左手中指输入这三个字母',
		'4. 用左手食指指输入这三个字母',
		'5. 用左手食指指输入这三个字母',
		'6. 用右手食指指输入这三个字母',
		'7. 用右手食指指输入这三个字母',
		'8. 用右手中指指输入这两个字母',
		'9. 用右手无名指输入这两个字母',
		'10. 用右手小指输入这一个字母'
	];
};

// 游戏开始
Game_Typing.prototype.start = function(){
	this.isCompleted = false;
	this.index = 0; // 从第一行开始
	this.jindex = 0; // 从第一列开始比较
	this.inputtext = '';
	this.timestart = (new Date()).valueOf();
	this.timecomplete = null;
	//console.log("81:" + this.index);
};

// 生成字母串
Game_Typing.prototype.next = function(){
	
};

// 显示Title
Game_Typing.prototype.getTestString = function(){
	var txt = '';
	for(var i = 0; i<this.data[this.index].length; i++){
		var classSuccess = "";
		if(i < this.jindex)
		{
			classSuccess = " class=\"success\"";
		}
		txt += "<span" + classSuccess + ">" + this.data[this.index][i] + "</span>";
	}
	return txt;
};

// 对输入的字符进行比较
Game_Typing.prototype.compareText = function(char){
	if(char == this.data[this.index][this.jindex])
	{
		this.jindex++;
		if(this.jindex >= this.data[this.index].length)
		{
			this.index++;
			this.jindex = 0;
			if(this.index >= this.data.length)
			{
				// Finished
				this.index = 0;
				this.jindex = 0;
				this.isCompleted = true;;
			}
		}
	}
	return this.getTestString();
};
