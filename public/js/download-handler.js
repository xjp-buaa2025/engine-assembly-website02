// public/js/download-handler.js
document.addEventListener('DOMContentLoaded', function() {
    console.log('下载处理器初始化');
    
    // 为所有下载链接添加事件处理
    const downloadLinks = document.querySelectorAll('.resource-download');
    
    downloadLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        // 阻止默认行为以便我们可以在必要时添加处理逻辑
        if (link.getAttribute('href') === '#') {
          e.preventDefault();
          console.log('需要下载的文件尚未准备好');
          alert('此资源文件尚未准备好，请稍后再试。');
        } else {
          console.log('正在下载:', link.getAttribute('href'));
          // 允许浏览器正常处理下载
        }
      });
    });
  });