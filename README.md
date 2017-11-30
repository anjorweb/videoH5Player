###视频播放H5小组件



**初始化**

```javascript
    var config = {
        el:"#vvd",
        src:"movie.mp4",
        poster:"poster.jpg"
    };

    var h5video = new h5VideoPlayer(config);
```

**添加需要重复播放的时间段**

```javascript
//数组里传入重复播放的分段最大值和最小值
h5video.addScript([4, 7.5], function(){
    console.log("到达时间段最小值");
}, function(){
    console.log("到达时间段最大值");
});
```

**添加事件**

```javascript
h5video.addEvent("playing", function(ev){
    $('.open').hide();
});
 h5video.addEvent("ended", function(ev){
   	h5video.destory();
 });
...
```

**一些方法**

```javascript
h5video.play();  //开始播放
h5video.nextSection();  //去往下一个时间段
h5video.destory(true); //销毁 参数可选：true，删除页面video元素
```

**更新**
1、添加了同层播放器进入和退出的事件，退出后点击document，继续播放

说明：

video播放只在ios和安卓的新版微信、手机Q测试通过，其余浏览器均出现各种奇怪问题，其余浏览器可以考虑使用序列帧播放。