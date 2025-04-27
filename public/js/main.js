/**
 * 主JavaScript文件
 * 处理网站的通用功能和交互
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('发动机虚拟装配系统已加载');
    
    // 导航栏滚动效果
    const nav = document.querySelector('.main-nav');
    
    if (nav) {
      window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
          nav.classList.add('scrolled');
        } else {
          nav.classList.remove('scrolled');
        }
      });
    }
    
    // 处理视频缩略图点击
    const videoThumbnails = document.querySelectorAll('.video-thumbnail');
    
    videoThumbnails.forEach(thumbnail => {
      thumbnail.addEventListener('click', function() {
        // 在实际项目中，这里会打开视频播放器或模态框
        const videoTitle = this.parentElement.querySelector('h3').textContent;
        alert(`播放视频: ${videoTitle}\n\n在实际项目中，这里将打开视频播放器`);
      });
    });
    
    // 处理资源下载链接
    const resourceDownloadLinks = document.querySelectorAll('.resource-download');
    
    resourceDownloadLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        
        // 在实际项目中，这里会下载文件
        const resourceTitle = this.parentElement.querySelector('h3').textContent;
        alert(`下载资源: ${resourceTitle}\n\n在实际项目中，这里将下载文件`);
      });
    });
  });