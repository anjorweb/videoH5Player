/*!
 * VERSION: 0.1.1
 * DATE: 2017-8-20
 * GIT: https://github.com/anjorweb/videoH5Player
 * @author: anjorfu
 **/


(function (factory) {

    if (typeof define === 'function' && define.amd) {
        define(['exports'], function(exports) {
            window.h5VideoPlayer = factory(exports);
        });
    } else if (typeof exports !== 'undefined') {
        factory(exports);
    } else {
        window.h5VideoPlayer = factory({});
    }

}(function(h5VideoPlayer){
    h5VideoPlayer = function(){
        this.initialize.apply(this, arguments);
    };

    h5VideoPlayer.prototype = {
        _video:null,
        _w:0,
        _h:0,
        _timeArr:[],
        _sectionTimeId:0,
        _curSectionTimeId:0,
        _curVideoTime:0,
        _isEnd:false,
        _isAndroid:false,
        _animateRender:null,
        checkVideoAutoPlay: false,
        initialize:function( config ){
            var _config = config || {};
            var _this = this;
            if(/android/i.test(navigator.userAgent)){
                this._isAndroid = true;
            }
            this.checkVideoAutoPlay = true;
            _this._video = document.createElement("video");
            _this._video.poster = _config.poster;
            _this._video.setAttribute("x-webkit-airplay", "true");
            _this._video.setAttribute("webkit-playsinline", "true");
            _this._video.setAttribute("airplay", "allow");
            _this._video.setAttribute("playsinline", "true");
            _this._video.setAttribute("x5-video-player-fullscreen", "true");
            _this._video.setAttribute("x5-video-player-type", "h5");
            _this._video.preload = "auto";
            _this._video.style.display = "block";
            _this._video.src = _config.src;

            _this._w = window.innerWidth;
            _this._h = window.innerHeight;

            if (_config.el){
                document.querySelector(_config.el).appendChild(_this._video);
            }else{
                document.body.appendChild(_this._video);
            }
            //如果没有给宽高
            if (!_config.width){
                _this._video.width = _this._w;
                _this._video.height = _this._h;
            }else{
                _this._video.width = _config.width;
                _this._video.height = _config.height;
            }


            _this._handle();

        },
        _resize:function(){
            var _this = this;
            _this._w = window.innerWidth;
            _this._h = window.innerHeight;

            _this._video.width = _this._w;
            _this._video.height = _this._h;
        },
        _onFull: function(){
        },
        _onExitFull: function(){
            var _this = this;
            document.ontouchstart = function(){
                if (!_this._isEnd){
                    _this._video.play();
                    document.ontouchstart = null;
                }
            }
        },
        _handle: function(){
            var _this = this;
            window.addEventListener("resize", function(){
                //_this._resize();
            });
            _this.addEvent("ended", function(){
                _this._isEnd = true;
                _this._timeArr = [];
                _this._sectionTimeId = 0;
            });


            _this.addEvent("play", function(){
                if (_this.checkVideoAutoPlay){
                    _this._video.pause();
                }
            });
            setTimeout(function()
            {
                _this.checkVideoAutoPlay = false;
            }, 500);

            _this._video.addEventListener("x5videoenterfullscreen", _this._onFull.bind(this));
            _this._video.addEventListener("x5videoexitfullscreen", _this._onExitFull.bind(this));
        },
        /** 视频跳帧 **/
        playMovieTime: function(time){
            var _this = this;
            _this._video.pause();
            _this._video.currentTime = time;
            setTimeout(function(){
                _this._video.currentTime = time;
                _this._video.play();
            }, 100);
        },
        play:function(){
            var _this = this;
            if (_this._isEnd){
                _this._curSectionTimeId = 0;
                _this._isEnd = false;
            }
            _this.animate();
            _this._video.play();
        },
        //销毁方法
        destory:function(isDel){
            var _this = this;
            console.dir(_this._video.parentNode);
            isDel && _this._video.parentNode.removeChild(_this._video);
            _this.addScript = null;
            _this.addEvent = null;
            _this.nextSection = null;
            _this._update = null;
            _this.play = null;
            _this._handle = null;
            _this._resize = null;
            _this.initialize = null;
            _this._curVideoTime = null;
            _this._timeArr = null;
        },
        //加时间段控制
        addScript:function(times, beforeTimeBack, afterTimeBack){
            var _this = this;
            if (times.constructor === Array && beforeTimeBack.constructor === Function && afterTimeBack.constructor === Function){
                if (times.length == 0 || times.length > 2) {
                    return console.log("至少传入一个时间");
                }
                _this._timeArr[_this._sectionTimeId] = {
                    id:_this._sectionTimeId,
                    times:times,
                    _beforeIsRun:false,
                    _afterIsRun:false,
                    before:beforeTimeBack,
                    after: afterTimeBack
                };
            }
            _this._sectionTimeId++;
        },
        //加事件
        addEvent:function(evName, fn){
            var _this = this;
            _this._video.addEventListener(evName, fn);
        },
        //去往下一个分段
        nextSection:function(){
            var _this = this;
            _this._timeArr[_this._curSectionTimeId] = null;
            _this._curSectionTimeId++;
            if (_this._video.paused){
                _this._video.play();
            }
        },
        _update:function(){
            var _this = this;
            _this._curVideoTime = _this._video.currentTime.toFixed(2);
            var obj = _this._timeArr[_this._curSectionTimeId];
            //大于添加的最大时间
            if (obj){
                (_this._curVideoTime >= obj.times[0] && !obj._beforeIsRun) && function(){
                    obj._beforeIsRun = true;
                    obj.before();
                    if (obj.times.length === 1){
                        _this._video.pause();
                    }
                }();
                //判断有第二个时间点
                if(obj.times.length === 2 && _this._curVideoTime > obj.times[1]){
                    if (_this._isAndroid){
                        _this.playMovieTime(obj.times[0]+1);
                    }else{
                        _this.playMovieTime(obj.times[0]);
                    }
                    if (!obj._afterIsRun){
                        obj._afterIsRun = true;
                        obj.after();
                    }
                }
            }
            if (_this._isEnd){
                cancelAnimationFrame(_this._animateRender);
            }
        },
        animate:function(time){
            var _this = this;
            _this._animateRender = requestAnimationFrame(_this.animate.bind(this));
            _this._update();
        }
    };

    return h5VideoPlayer;
}));