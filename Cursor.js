/**
 * 解决安卓电视webview内嵌的html5页面中焦点框移动的问题
 * 采用的是html中table的布局思路，但不局限于table的布局
 * @author rangzf
 * @site   http://wqd.me
 * @time 2014/06/06
 */


;(function(window, $){

	Function.prototype.before = function(fn){
		// 保存一份当前函数实例
		var _this = this;
		
		return function(){
			if(fn.apply(this, arguments) === false){
				return false;
			};
			return _this.apply(this, arguments);
		};
	};

	Function.prototype.after = function(fn){
		var _this = this;
		return function(){
			if(_this.apply(this, arguments) === false){
				return false;
			}
			return fn.apply(this, arguments);
		};
	};

	Cursor.defaults = {
		wrap: 'body',
		table: 'j-table',
		tr: 'j-tr',
		td: 'j-td',
		// 初始化光标坐标
		init: [0,0,0],
		//光标
		$cursor: null,
		// 每次移动都执行的函数
		keydownFn: function(){}
	};

	
	function Cursor(conf){
		if(!(this instanceof Cursor)){
			return new Cursor(conf);
		}
		$.extend(this, Cursor.defaults, conf);
		
		this.$table = $('.' + this.table);
		// 多维数组，存放位置信息
		this.matrix = [];
		this.n0 = this.init[0];// table
		this.n1 = this.init[1];// tr
		this.n2 = this.init[2];// td
		// 当前table中保存的上下左右信息，沟通table之间
		this.data = [];
		this.$now = null;
		this.$focusing = null;
		this._init();
	}

	Cursor.prototype = {
		_init: function(){
			this.push(this.$table);
			this._renderCursor();	
			this._bind();
		},
		_renderCursor: function(){
			var _this = this;
			var focusHTML = '<div class="g-focus">'
							+'<table width="100%" height="100%" border="0" cellpadding="0" cellspacing="0">'
								+'<tbody>'
								+'<tr><td class="bgLt" width="40" height="40"></td><td class="bgT"></td><td class="bgRt" width="40" height="40"></td></tr>'
								+'<tr><td class="bgL"></td><td></td><td class="bgR"></td></tr>'
								+'<tr><td class="bgLb" width="40" height="40"></td><td class="bgB"></td><td class="bgRb" width="40" height="40"></td></tr>'
								+'</tbody>'
							+'</table>'
						+'</div>';

			this.$cursor = $(focusHTML).appendTo($(this.wrap)).hide();
			// 为了解决电视机上初始化时定位错误的问题，加延时
			setTimeout(function(){
				_this.focus();
				var $f = _this.getFocusing()
				_this.keydownFn($f);
				if($f.data('type') !== 'focus'){
					_this.$cursor.show();	
				}
			}, 100);
		},

		/**
		 * @param  {{Array}} arguments[0] 欲获得焦点的j-td数组
		 */
		focus: function(){
			// 指定
			if(arguments[0]){
				// 去掉之前的class
				this.$focusing = this.matrix[this.n0][this.n1][this.n2];
				this.getFocusing().removeClass('s-cursoring');
				// 重置n0,n1,n2
				this.n0 = arguments[0][0];
				this.n1 = arguments[0][1];
				this.n2 = arguments[0][2];
			}
			this.$focusing = this.matrix[this.n0][this.n1][this.n2];

			var $f = this.getFocusing();

			$f.addClass('s-cursoring');
			// 如果当前focusing的元素属性中data-type值为focus则表示没有跟随光标，
			// 采用该元素在css中设置的focus样式，并隐藏跟随光标
			// 否则将跟随光标移动到当前元素上来,并显示粗来
			
			if($f.data('type') === 'focus'){
				$f.focus();
				this.$cursor.hide();
			}else{
				if(this.wrap === 'body'){
					$f.focus();
					this.$cursor.css({
						width: parseInt($f.css('width')) + 70 + 'px',
						height: parseInt($f.css('height')) + 70 + 'px',
						left: parseInt($f.offset().left) - 35 + 'px',
						top: parseInt($f.offset().top) - 35 + 'px'
					}).show();
				}else{
					document.activeElement.blur();
					this.$cursor.css({
						left: parseInt($f.position().left) - 35 + 'px',
						top: parseInt($f.position().top) - 35 + 'px',
						width: parseInt($f.css('width')) + 70 + 'px',
						height: parseInt($f.css('height')) + 70 + 'px'
					}).show();
				}
			}
		},

		/**
		 * 扫描页面，填充matrix多维数组
		 * @param  {Object} $table 需要被push到数组中的table
		 */
		push: function($table){
			var _this = this;
			var tr = _this.tr, td = _this.td, matrix = _this.matrix, i;
			// 遍历table
			$table.each(function(){
				i = $(this).data('nth');
				matrix[i] = [];
				// 遍历tr
				$(this).find('.' + tr).each(function(j){
					matrix[i][j] = [];
					// 遍历td
					$(this).find('.' + td).each(function(index){
						// colspan
						var colspan = parseInt($(this).attr('colspan'));

						$(this).attr({
							'data-matrix': i + '-' + j + '-' + index
						});
						
						// 保存位置信息
						$(this).attr({
							'data-matrix': i + '-' + j + '-' + index
						});

						// NaN !== NaN
						if('' + colspan !== 'NaN'){
							var _colspan = colspan,
								left = 2, right = _colspan - 1;
							// 如果是colspan=n这种形式，则第一个元素存储形式为数组[$obj, colspan],colspan表明跳列个数
							matrix[i][j].push([$(this), {start: _colspan}]);
							--colspan;
							while(colspan){
								if(colspan === 1){
									matrix[i][j].push([$(this), {end: _colspan}]);
								}else{
									matrix[i][j].push([$(this), {left: left++, right: right--}]);
								}
								--colspan;
							}
						}else{
							matrix[i][j].push($(this));
						};
					});	
				});
			});
			this.$table = $('.' + this.table);
		},
		
		
		/**
		 * 重新设置下一个获得焦点的元素，用于跨table时的通讯，具有记忆从tableA中的哪个元素进入tableB，方便记住你来时的路
		 * @param {Array} arr 新焦点元素在matrix中的坐标
		 * @param {String} dir 方向，用于重置原本的值
		 */
		_setMatrix: function(arr, dir){
			var $f = this.getFocusing(),
					remember = this.$table.filter('[data-nth="' + this.n0 + '"]').data('remember');
			var m = $f.data('matrix');//当前坐标
			this.n0 = parseInt(arr[0], 10);
			this.n1 = parseInt(arr[1], 10);
			this.n2 = parseInt(arr[2], 10);
			//新焦点元素
			$f = this.matrix[this.n0][this.n1][this.n2];

			if(remember !== 'no'){
				$f = $f.length === 2 ? $f[0] : $f;
				//如果是从“右边”进入，则n就是“左边”
				var n = dir === 'right' ? 3 : dir === 'left' ? 1 : dir === 'up' ? 2 : dir === 'down' ? 0 : "";
				//找到新焦点的j-table父元素，替换它的focus属性中，返回路径的值
				var p = this.$table.filter('[data-nth="' + this.n0 + '"]');
				try{
					var arr = p.data('focus').split(',');
				}catch(e){
					throw new Error('需要先将所有的j-table都加上data-focus属性');
				}
				
				arr[n] = m;
				p.data('focus', arr.toString());	
			}
		},

		// 保存当前focusing的元素的父级元素（j-table）的data-focus属性值
		getData: function(){
			var data = this.$table.filter('[data-nth="' + this.n0 + '"]').data('focus');
			
			return this.data = data === undefined ? ["","","",""] : data.split(',');
		},
		// 获取当前获得焦点的元素
		getFocusing: function(){
			var $f = this.$focusing;
			$f = $f.length === 2 ? $f[0] : $f;

			return $f
		},
		_removePrevClass: function(){
			this.getFocusing().removeClass('s-cursoring');
		},
		getright: function(){
			var trArr = this.matrix[this.n0],//table
				//行 
				tdArr = this.matrix[this.n0][this.n1],
				trLen = trArr.length,
				tdLen = tdArr.length,
				td = tdArr[this.n2];
			// 没到尾
			if(this.n2 < tdLen - 1){
				// 有colspan属性
				if(td.length === 2){
					var _n2 = this.n2;
					// 开头
					if(td[1].start){
						this.n2 += td[1].start;
					// 中间
					}else if(td[1].right){
						this.n2 += td[1].right;
					// 尾部
					}else if(td[1].end){
						++this.n2;
					}

					// 如果溢出
					if(this.n2 >= tdLen -1){
						this.getData();
						var data_right = this.data[1];
						if(data_right !== ""){
							data_right = data_right.split('-');
							this._setMatrix(data_right, 'right');
						}else{
							this.n2 = _n2;
							return;
						}
					}
				// 没有colspan
				}else{
					++this.n2;
				}
			// 到尾
			}else{
				this.getData();
				var data_right = this.data[1];
				// 向右跨table
				if(data_right){
					data_right = data_right.split('-');
					this._setMatrix(data_right, 'right');
				}
			};
		},

		getleft: function(){
			var trArr = this.matrix[this.n0],
				tdArr = trArr[this.n1],
				trLen = trArr.length,
				td = tdArr[this.n2];
									
			// 没到行头
			if(this.n2 > 0){
				// 有colspan属性
				if(td.length === 2){
					var _n2 = this.n2;
					// colspan的末端
					if(td[1].end){
						this.n2 -= td[1].end;
					// 中间
					}else if(td[1].left){
						this.n2 -= td[1].left;
					// 开头
					}else if(td[1].start){
						--this.n2;
					}
					// 如果溢出
					if(this.n2 < 0){
						this.getData();
						var data_left = this.data[3];
						if(data_left !== ""){
							data_left = data_left.split('-');
							this._setMatrix(data_left, 'left');	
						}else{
							this.n2 = _n2;
							return;
						}
					}
				}else{
					--this.n2;
				}
			// 到行头
			}else{
				this.getData();
				var data_left = this.data[3];
				if(data_left){
					data_left = data_left.split('-');
					this._setMatrix(data_left, 'left');
				}
			};
		},
		getup: function(){
			var trArr = this.matrix[this.n0],
				trLen = trArr.length;
			// 还没到第一行
			if(this.n1 > 0){
				--this.n1;
			// 到第一行，需要换table
			}else{
				this.getData();
				var data_up = this.data[0];	
				if(data_up){
					data_up = data_up.split('-');
					this._setMatrix(data_up, 'up');
				}	
			}
		},
		getdown: function(){
			var trArr = this.matrix[this.n0],
					trLen = trArr.length;
			// 没到最后一行
			if(this.n1 < trLen - 1){
				++this.n1;
			// 换table
			}else{
				this.getData();
				var data_down = this.data[2];
				if(data_down){
					data_down = data_down.split('-');
					this._setMatrix(data_down, 'down');
				}
			};
		},
		goright: function(){
			this._removePrevClass();
			this.getright();	
			this.focus();
		},
		goleft: function(){
			this._removePrevClass();
			this.getleft();
			this.focus();
		},
		goup: function(){
			this._removePrevClass();
			this.getup();
			this.focus();
		},
		godown: function(){
			this._removePrevClass();
			this.getdown();
			this.focus();
		},
		ok: function($f){
			
		},
		// 绑定
		_bind: function(){
			var _this = this;
			

			$(document).keydown(function(e){
				var code = e.keyCode;

				switch(code){
					case 37:
						_this.goleft(_this.getFocusing());
						e.preventDefault();	
						break;
					case 38:
						_this.goup(_this.getFocusing());
						e.preventDefault();
						break;
					case 39:
						_this.goright(_this.getFocusing());
						e.preventDefault();
						break;
					case 40:
						_this.godown(_this.getFocusing());
						e.preventDefault();
						break;
					case 13:
						_this.ok(_this.getFocusing());
						break;
				}

				_this.keydownFn(_this.getFocusing());

			});
		}
	};

	window.TV = {
		Cursor: Cursor
	};
})(window, window.jQuery || window.Zepto);
