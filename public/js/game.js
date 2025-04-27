/**
 * 发动机装配游戏JavaScript文件
 * 实现拖放装配游戏的功能
 */

document.addEventListener('DOMContentLoaded', function() {
    // 游戏配置
    const gameConfig = {
      timeLimit: 300, // 5分钟
      maxScore: 1000,
      penaltyPerError: 10
    };
    
    // 游戏状态
    let gameState = {
      isPlaying: false,
      timeLeft: gameConfig.timeLimit,
      score: 0,
      correctParts: 0,
      incorrectAttempts: 0,
      timer: null,
      completionTime: 0
    };
    
    // 发动机零部件数据
    const engineParts = [
      { id: 'part1', name: '曲轴', image: '/api/placeholder/100/100', order: 1 },
      { id: 'part2', name: '连杆', image: '/api/placeholder/100/100', order: 2 },
      { id: 'part3', name: '活塞', image: '/api/placeholder/100/100', order: 3 },
      { id: 'part4', name: '气缸套', image: '/api/placeholder/100/100', order: 4 },
      { id: 'part5', name: '气门', image: '/api/placeholder/100/100', order: 5 },
      { id: 'part6', name: '凸轮轴', image: '/api/placeholder/100/100', order: 6 },
      { id: 'part7', name: '气缸盖', image: '/api/placeholder/100/100', order: 7 },
      { id: 'part8', name: '油底壳', image: '/api/placeholder/100/100', order: 8 }
    ];
    
    // 装配点位置数据（在实际项目中，这些将是准确的坐标）
    const assemblyPoints = [
      { id: 'point1', part: 'part1', x: '10%', y: '50%', order: 1 },
      { id: 'point2', part: 'part2', x: '25%', y: '40%', order: 2 },
      { id: 'point3', part: 'part3', x: '35%', y: '30%', order: 3 },
      { id: 'point4', part: 'part4', x: '45%', y: '45%', order: 4 },
      { id: 'point5', part: 'part5', x: '60%', y: '30%', order: 5 },
      { id: 'point6', part: 'part6', x: '70%', y: '40%', order: 6 },
      { id: 'point7', part: 'part7', x: '80%', y: '20%', order: 7 },
      { id: 'point8', part: 'part8', x: '90%', y: '70%', order: 8 }
    ];
    
    // DOM元素
    const startGameBtn = document.getElementById('start-game');
    const resetGameBtn = document.getElementById('reset-game');
    const currentScoreEl = document.getElementById('current-score');
    const timeLeftEl = document.getElementById('time-left');
    const partsListEl = document.getElementById('parts-list');
    const assemblyPointsEl = document.getElementById('assembly-points');
    const gameMessageEl = document.getElementById('game-message');
    const gameResultModal = document.getElementById('game-result-modal');
    const finalScoreEl = document.getElementById('final-score');
    const correctPartsEl = document.getElementById('correct-parts');
    const incorrectAttemptsEl = document.getElementById('incorrect-attempts');
    const completionTimeEl = document.getElementById('completion-time');
    const playAgainBtn = document.getElementById('play-again');
    const backToDashboardBtn = document.getElementById('back-to-dashboard');
    
    // 初始化游戏
    function initGame() {
      // 重置游戏状态
      gameState = {
        isPlaying: false,
        timeLeft: gameConfig.timeLimit,
        score: 0,
        correctParts: 0,
        incorrectAttempts: 0,
        timer: null,
        completionTime: 0
      };
      
      // 更新UI
      updateGameUI();
      
      // 清空零部件列表和装配点
      partsListEl.innerHTML = '';
      assemblyPointsEl.innerHTML = '';
      
      // 初始化消息
      gameMessageEl.innerHTML = '<p>准备好开始装配发动机了吗？点击"开始游戏"按钮！</p>';
    }
    
    // 开始游戏
    function startGame() {
      if (gameState.isPlaying) return;
      
      gameState.isPlaying = true;
      
      // 打乱零部件顺序
      const shuffledParts = [...engineParts].sort(() => Math.random() - 0.5);
      
      // 创建零部件元素
      shuffledParts.forEach(part => {
        const partEl = document.createElement('div');
        partEl.className = 'part-item';
        partEl.id = part.id;
        partEl.setAttribute('draggable', 'true');
        partEl.setAttribute('data-order', part.order);
        
        partEl.innerHTML = `
          <img src="${part.image}" alt="${part.name}">
          <div class="part-name">${part.name}</div>
        `;
        
        // 添加拖拽事件
        partEl.addEventListener('dragstart', handleDragStart);
        
        partsListEl.appendChild(partEl);
      });
      
      // 创建装配点
      assemblyPoints.forEach(point => {
        const pointEl = document.createElement('div');
        pointEl.className = 'assembly-point';
        pointEl.id = point.id;
        pointEl.setAttribute('data-part', point.part);
        pointEl.setAttribute('data-order', point.order);
        
        // 设置位置
        pointEl.style.left = point.x;
        pointEl.style.top = point.y;
        
        // 添加拖拽事件
        pointEl.addEventListener('dragover', handleDragOver);
        pointEl.addEventListener('drop', handleDrop);
        
        assemblyPointsEl.appendChild(pointEl);
      });
      
      // 更新游戏消息
      gameMessageEl.innerHTML = '<p>开始装配！按照正确的顺序将零部件拖放到装配区域。</p>';
      
      // 开始计时器
      startTimer();
      
      // 高亮显示第一个装配点
      highlightNextAssemblyPoint();
    }
    
    // 开始计时器
    function startTimer() {
      gameState.timer = setInterval(() => {
        gameState.timeLeft--;
        updateGameUI();
        
        if (gameState.timeLeft <= 0) {
          endGame('timeout');
        }
      }, 1000);
    }
    
    // 结束游戏
    function endGame(reason) {
      clearInterval(gameState.timer);
      gameState.isPlaying = false;
      
      // 计算完成时间
      gameState.completionTime = gameConfig.timeLimit - gameState.timeLeft;
      
      // 显示结果模态框
      showGameResult(reason);
    }
    
    // 显示游戏结果
    function showGameResult(reason) {
      const resultTitleEl = document.getElementById('result-title');
      const resultMessageEl = document.getElementById('result-message');
      
      // 设置结果标题和消息
      if (reason === 'completed') {
        resultTitleEl.textContent = '恭喜！装配完成';
        resultMessageEl.innerHTML = `您的得分: <span id="final-score">${gameState.score}</span>`;
      } else if (reason === 'timeout') {
        resultTitleEl.textContent = '时间到！';
        resultMessageEl.innerHTML = `您的得分: <span id="final-score">${gameState.score}</span>`;
      }
      
      // 更新结果详情
      finalScoreEl.textContent = gameState.score;
      correctPartsEl.textContent = gameState.correctParts;
      incorrectAttemptsEl.textContent = gameState.incorrectAttempts;
      
      // 格式化完成时间（分:秒）
      const minutes = Math.floor(gameState.completionTime / 60);
      const seconds = gameState.completionTime % 60;
      completionTimeEl.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      
      // 显示模态框
      gameResultModal.classList.add('show');
    }
    
    // 重置游戏
    function resetGame() {
      clearInterval(gameState.timer);
      initGame();
    }
    
    // 更新游戏UI
    function updateGameUI() {
      currentScoreEl.textContent = gameState.score;
      
      // 格式化剩余时间（分:秒）
      const minutes = Math.floor(gameState.timeLeft / 60);
      const seconds = gameState.timeLeft % 60;
      timeLeftEl.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
    
    // 高亮显示下一个装配点
    function highlightNextAssemblyPoint() {
      const nextOrder = gameState.correctParts + 1;
      
      if (nextOrder <= engineParts.length) {
        const nextPoint = document.querySelector(`.assembly-point[data-order="${nextOrder}"]`);
        
        if (nextPoint) {
          // 移除所有高亮
          document.querySelectorAll('.assembly-point').forEach(point => {
            point.classList.remove('highlight');
          });
          
          // 添加高亮到下一个点
          nextPoint.classList.add('highlight');
        }
      }
    }
    
    // 处理拖拽开始
    function handleDragStart(e) {
      if (!gameState.isPlaying) return;
      e.dataTransfer.setData('text/plain', e.target.id);
    }
    
    // 处理拖拽经过
    function handleDragOver(e) {
      if (!gameState.isPlaying) return;
      e.preventDefault();
    }
    
    // 处理放置
    function handleDrop(e) {
      if (!gameState.isPlaying) return;
      e.preventDefault();
      
      const partId = e.dataTransfer.getData('text/plain');
      const partEl = document.getElementById(partId);
      const pointEl = e.target.closest('.assembly-point');
      
      if (!partEl || !pointEl) return;
      
      const partOrder = parseInt(partEl.getAttribute('data-order'));
      const pointOrder = parseInt(pointEl.getAttribute('data-order'));
      const correctPartId = pointEl.getAttribute('data-part');
      
      // 检查是否是正确的零部件和顺序
      if (partId === correctPartId && partOrder === gameState.correctParts + 1) {
        // 正确放置
        gameState.correctParts++;
        gameState.score += Math.ceil((gameConfig.maxScore / engineParts.length) * (1 + gameState.timeLeft / gameConfig.timeLimit));
        
        // 更新UI
        updateGameUI();
        
        // 标记装配点为完成
        pointEl.classList.add('completed');
        pointEl.classList.remove('highlight');
        
        // 移除零部件
        partEl.remove();
        
        // 检查游戏是否完成
        if (gameState.correctParts >= engineParts.length) {
          endGame('completed');
        } else {
          // 高亮下一个点
          highlightNextAssemblyPoint();
          
          // 更新消息
          gameMessageEl.innerHTML = `<p>完美！已安装 ${gameState.correctParts}/${engineParts.length} 个零部件。</p>`;
        }
      } else if (partId !== correctPartId) {
        // 错误的零部件
        gameState.incorrectAttempts++;
        gameState.score = Math.max(0, gameState.score - gameConfig.penaltyPerError);
        
        // 更新UI
        updateGameUI();
        
        // 更新消息
        gameMessageEl.innerHTML = '<p>这个零部件不属于此位置，请尝试其他位置。</p>';
      } else if (partOrder !== gameState.correctParts + 1) {
        // 错误的顺序
        gameState.incorrectAttempts++;
        gameState.score = Math.max(0, gameState.score - gameConfig.penaltyPerError);
        
        // 更新UI
        updateGameUI();
        
        // 更新消息
        gameMessageEl.innerHTML = '<p>请按照正确的顺序安装零部件。</p>';
      }
    }
    
    // 事件监听
    startGameBtn.addEventListener('click', startGame);
    resetGameBtn.addEventListener('click', resetGame);
    playAgainBtn.addEventListener('click', () => {
      gameResultModal.classList.remove('show');
      resetGame();
    });
    backToDashboardBtn.addEventListener('click', () => {
      window.location.href = '/dashboard';
    });
    
    // 初始化游戏
    initGame();
  });