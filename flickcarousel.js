const LEFT_DIRECTION = "left";
const RIGHT_DIRECTION = "right";
(function(){
	function DeNACarousel(element, pageNumElement, callback){
		var self =  this;
		self.element = element;
		self.scrollCallback = callback;
		self.containerWidth = self.element.offsetWidth;
		self.containerHeight = self.element.offsetHeight;
		self.scrollCounts = 1;
		self.autoScrollCounts = 1;
		self.mainScrollCounts = 1;
		self.isUseAuto = false;
		self.isScrolled = false;
		self.imageCounts = self.element.querySelectorAll('ul > li').length;
		self.paging = pageNumElement;
		self._pageTranslation(self);
		self.onTouch = false;
		if('ontouchstart' in window){
			self.flickScroll();
		}
	}
	
	DeNACarousel.prototype = {
		automaticScrolling : function(directions,seconds){
			var self = this;
			self.isUseAuto = true;
			directions = (directions == undefined) ? LEFT_DIRECTION : directions;
			if(directions == LEFT_DIRECTION){
				this.autoScrollTimer = setInterval(function(){
					self._checkAndReset(self, LEFT_DIRECTION);
					self.scrollLeft(true);
				}, (seconds*1000), this);
			} else {
				this.autoScrollTimer = setInterval(function(){
					self.scrollRight(true);
					self._checkAndReset(self, RIGHT_DIRECTION);
				}, (seconds*1000), this);
			}
		},
		refresh : function(){
			var self = this;
			self.scrollCounts = 1;
			self.autoScrollCounts = 1;
			self.mainScrollCounts = 1;
			self.scrollCallback = null;
			self._translation(self, 1);
			self.paging.querySelectorAll('div')[0].id = 'selectedPage';
			if(this.autoScrollTimer)
				clearInterval(this.autoScrollTimer);
		},
		flickScroll : function(){
			var self =  this;
			self.images = self.element.querySelectorAll('ul > li');
			for(var i=0;i<self.images.length;i++){
				self.images[i].addEventListener('touchstart', self, false);
				self.images[i].addEventListener('touchmove', self, false);
				self.images[i].addEventListener('touchend', self, false);
			}
		},
		handleEvent: function (e) {
			var self =  this;
			if (e.type == "touchstart") {
			    self._ontouchstart(e);
			} else if (e.type == "touchmove") {
			   self._ontouchmove(e);
			} else if (e.type == "touchend" || e.type == "touchcancel") {
				self._ontouchend(e);
			}
		},
		_ontouchstart : function(e){
			var self =  this;
			e.preventDefault();
			e.stopPropagation();
			self.touchStart = e.targetTouches[0];
		},
		_ontouchmove : function(e){
			var self =  this;
			//e.preventDefault();
			e.stopPropagation();
			self.touchMove = e.targetTouches[0];
			self.touchDiff = self.touchMove.pageX-self.touchStart.pageX;
			var elementUl = self.element.getElementsByTagName('ul')[0];
			elementUl.style['left'] = (self.touchDiff*0.85)+'px';
		},
		_ontouchend : function(e){
			var self =  this;
			var elementUl = self.element.getElementsByTagName('ul')[0];
			elementUl.style['left'] = '0px';
			if(Math.abs(self.touchDiff) > (self.containerWidth * 40/100)){
				if(self.touchDiff < 0)
					self.scrollRight();
				else
					self.scrollLeft();
			}
		},
		isHasLeft : function(){
			var self = this;
			if(self.mainScrollCounts == 1)
				return false;
			else if(self.isUseAuto && self.autoScrollCounts  == 1)
				return false;
			else 
				return true;
		},
		isHasRight : function(){
			var self = this;
			if(self.mainScrollCounts == self.imageCounts)
				return false;
			else if(self.isUseAuto && self.autoScrollCounts == self.imageCounts)
				return false;
			else 
				return true;
		},
		scrollLeft : function(auto){
			var self =  this;
			self.isScrolled = true;
			if(self.isHasLeft() && auto==undefined){
				self.scrollCounts = self.mainScrollCounts;
				self.scrollCounts--;
				self._translation(self, self.scrollCounts);
			} else if(auto == true){
				self.autoScrollCounts--;
				self._translation(self, self.autoScrollCounts);
			}
		},
		scrollRight : function(auto){
			var self =  this;
			self.isScrolled = true;
			if(self.isHasRight() && auto==undefined){
				self.scrollCounts = self.mainScrollCounts;
				self.scrollCounts++;
				self._translation(self, self.scrollCounts);
			} else if(auto == true){
				self.autoScrollCounts++;
				self._translation(self, self.autoScrollCounts);
			}
		},
		_pageTranslation : function(self){
			var pageNumbers = self.paging.querySelectorAll('div');
			for(var i=0;i<pageNumbers.length;i++){
				var page = pageNumbers[i];
				page.setAttribute('data-id',(i+1));
				page.addEventListener('click', function(event){
					event.preventDefault();
					event.cancelBubble = true;
					event.stopPropagation();
					self.isScrolled = true;
					self.scrollCounts = parseInt(this.getAttribute('data-id'));
					self._translation(self, self.scrollCounts);
				},false);
			}
		},
		_translation : function(self, scrollTo){
			var elementUl = self.element.getElementsByTagName('ul')[0];
			elementUl.style['-webkit-transition'] = 'all 0.5s';
 			elementUl.style['-webkit-transition-timing-function'] = 'ease';
			elementUl.style['-webkit-transform'] = 'translateX(-'+(self.containerWidth*(scrollTo-1))+'px)';
			elementUl.style['left'] = '0px';
			self._displayPaging(self, scrollTo);
			self.touchDiff = 0;
			self.mainScrollCounts = scrollTo;
			if(self.scrollCallback && self.isScrolled){
				self.isScrolled = false;
				self.scrollCallback();
			}
		},
		_checkAndReset : function(self, direction){
			if(self.autoScrollCounts == self.imageCounts && direction == RIGHT_DIRECTION ){
				self.autoScrollCounts = 0;
			} else if(self.autoScrollCounts == 1 && direction == LEFT_DIRECTION ){
				self.autoScrollCounts = self.imageCounts+1;
			}
		},
		_displayPaging : function(self, pageNum){
			var pageNumbers = self.paging.querySelectorAll('div');
			for(var i=0;i<pageNumbers.length;i++){
				if(i==pageNum-1){
					pageNumbers[i].id = "selectedPage";
				} else {
					pageNumbers[i].id = "";
				}
			}
		}
	}
	window.DeNACarousel = DeNACarousel;
})();