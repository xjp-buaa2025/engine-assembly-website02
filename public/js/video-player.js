// 添加到 public/js/video-player.js
document.addEventListener('DOMContentLoaded', function() {
    console.log('视频播放器脚本已加载');
    
    // 查找视频缩略图
    const videoThumbnails = document.querySelectorAll('.video-thumbnail');
    
    if (videoThumbnails.length > 0) {
      console.log('找到', videoThumbnails.length, '个视频缩略图');
      
      videoThumbnails.forEach(function(thumbnail) {
        thumbnail.addEventListener('click', function(e) {
          e.preventDefault();
          console.log('视频缩略图被点击');
          
          // 获取视频路径
          const videoSrc = this.getAttribute('data-video');
          console.log('视频路径:', videoSrc);
          
          // 创建非常简单的视频弹窗
          const videoWindow = window.open('', '_blank', 'width=800,height=600');
          videoWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>视频播放</title>
              <style>
                body { margin: 0; padding: 0; background: #000; overflow: hidden; }
                video { width: 100%; height: 100%; }
              </style>
            </head>
            <body>
              <video controls autoplay>
                <source src="${videoSrc}" type="video/mp4">
                您的浏览器不支持HTML5视频。
              </video>
            </body>
            </html>
          `);
          videoWindow.document.close();
        });
      });
    } else {
      console.log('未找到视频缩略图');
    }
  });