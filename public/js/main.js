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
  

  /*
    // ===== 视频播放功能 =====
  // 查找所有视频缩略图
  const videoThumbnails = document.querySelectorAll('.video-thumbnail');
  
  if (videoThumbnails.length > 0) {
    console.log('找到', videoThumbnails.length, '个视频缩略图');
    
    videoThumbnails.forEach(thumbnail => {
      // 移除任何现有的点击事件监听器
      const newThumbnail = thumbnail.cloneNode(true);
      thumbnail.parentNode.replaceChild(newThumbnail, thumbnail);
      
      // 为新元素添加事件监听器
      newThumbnail.addEventListener('click', function(e) {
        e.preventDefault();
        const videoSrc = this.getAttribute('data-video');
        const videoTitle = this.closest('.video-item').querySelector('h3').textContent;
        
        console.log('视频点击:', videoSrc, videoTitle);
        
        if (videoSrc) {
          // 创建视频模态框
          const modal = document.createElement('div');
          modal.className = 'video-modal';
          modal.innerHTML = `
            <div class="video-modal-content">
              <div class="video-modal-header">
                <h4>${videoTitle}</h4>
                <span class="close-video">&times;</span>
              </div>
              <div class="video-container">
                <video controls autoplay>
                  <source src="${videoSrc}" type="video/mp4">
                  <source src="${videoSrc.replace('.mp4', '.webm')}" type="video/webm">
                  您的浏览器不支持HTML5视频。
                </video>
              </div>
            </div>
          `;
          document.body.appendChild(modal);
          document.body.style.overflow = 'hidden'; // 防止背景滚动
          
          console.log('已创建视频模态框');
          
          // 关闭视频处理
          const closeBtn = modal.querySelector('.close-video');
          const closeModal = function() {
            document.body.removeChild(modal);
            document.body.style.overflow = ''; // 恢复滚动
          };
          
          closeBtn.addEventListener('click', closeModal);
          
          // 点击模态框背景也关闭视频
          modal.addEventListener('click', function(e) {
            if (e.target === modal) {
              closeModal();
            }
          });
          
          // ESC键关闭视频
          document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
              closeModal();
              document.removeEventListener('keydown', escHandler); // 清理事件监听器
            }
          });
        } else {
          console.error('没有找到视频源');
          alert('抱歉，视频暂时无法播放。');
        }
      });
    });
  } else {
    console.log('未找到视频缩略图');
  }
  
  // ===== 资源下载链接 =====
  const resourceDownloadLinks = document.querySelectorAll('.resource-download');
  
  if (resourceDownloadLinks.length > 0) {
    console.log('找到', resourceDownloadLinks.length, '个资源下载链接');
    
    resourceDownloadLinks.forEach(link => {
      // 移除任何现有的点击事件监听器
      const newLink = link.cloneNode(true);
      link.parentNode.replaceChild(newLink, link);
      
      // 如果链接已经是正确的格式，我们不需要特殊处理
      // 但要确保不会显示原来的alert提示
      newLink.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        console.log('资源下载点击:', href);
        
        // 如果链接以/download开头，说明是我们的下载路由，不需要特殊处理
        if (href && href.startsWith('/download')) {
          // 允许正常下载
          return true;
        } else {
          // 对于尚未更新的链接，给出提示
          e.preventDefault();
          alert('资源下载功能已更新，请使用新格式的链接。');
        }
      });
    });
  } else {
    console.log('未找到资源下载链接');
  } */
 
});