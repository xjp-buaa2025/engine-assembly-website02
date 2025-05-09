/**
 * 发动机3D模型交互脚本 - 优化版
 * 解决爆炸图功能和加载进度显示问题
 */

// 全局变量
let scene, camera, renderer, controls;
let engineModel, engineGroup, engineParts = [];
let isExploded = false;
let originalPositions = [];
let raycaster, mouse;
let clock;
let loadingManager;
let modelLoaded = false;

// 初始化 Three.js 场景
function init() {
  console.log('初始化3D场景');
  
  // 创建场景
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050a14);
  
  // 创建加载管理器
  loadingManager = new THREE.LoadingManager();
  loadingManager.onProgress = (url, loaded, total) => {
    const progress = Math.round((loaded / total) * 100);
    console.log(`加载进度: ${progress}%`);
    // 使用全局进度更新函数
    if (window.updateModelLoadingProgress) {
      window.updateModelLoadingProgress(progress);
    }
  };
  
  loadingManager.onLoad = () => {
    console.log('模型加载完成');
    modelLoaded = true;
    // 使用全局进度更新函数，确保加载完成时显示100%
    if (window.updateModelLoadingProgress) {
      window.updateModelLoadingProgress(100);
    }
  };
  
  loadingManager.onError = (url) => {
    console.error('加载出错:', url);
    alert('模型加载失败，请检查控制台');
  };
  
  // 创建摄像机
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 5);
  
  // 计算模型容器尺寸
  const modelContainer = document.getElementById('engine-model-container');
  const containerWidth = modelContainer.clientWidth;
  const containerHeight = modelContainer.clientHeight;
  
  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(containerWidth, containerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.physicallyCorrectLights = true;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  modelContainer.appendChild(renderer.domElement);
  
  // 创建环境光
  const ambientLight = new THREE.AmbientLight(0x404040, 2);
  scene.add(ambientLight);
  
  // 创建主要方向光
  const mainLight = new THREE.DirectionalLight(0x4facfe, 3);
  mainLight.position.set(2, 2, 5);
  mainLight.castShadow = true;
  scene.add(mainLight);
  
  // 添加顶部光源
  const topLight = new THREE.DirectionalLight(0x00a2ff, 2);
  topLight.position.set(0, 5, 0);
  scene.add(topLight);
  
  // 添加补充光源，突出发动机细节
  const fillLight = new THREE.PointLight(0x00d2ff, 1);
  fillLight.position.set(-2, 0, -5);
  scene.add(fillLight);
  
  // 创建控制器
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.rotateSpeed = 0.7;
  controls.enableZoom = true;
  controls.minDistance = 3.5;
  controls.maxDistance = 8;
  controls.enablePan = false;
  
  // 添加射线检测
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();
  
  // 添加时钟
  clock = new THREE.Clock();
  
  // 添加事件监听器
  window.addEventListener('resize', onWindowResize);
  
  // 重要修复：分开处理鼠标事件
  renderer.domElement.addEventListener('mousedown', onMouseDown);
  // 阻止默认右键菜单
  renderer.domElement.addEventListener('contextmenu', function(event) {
    event.preventDefault();
    event.stopPropagation();
    // 直接触发爆炸图视图切换
    toggleExplodeView();
    return false;
  });
  
  // 直接尝试多种可能的模型路径
  tryLoadModels();
  
  // 开始动画循环
  animate();
}

// 尝试加载多个可能的模型路径
function tryLoadModels() {
  const possiblePaths = [
    'https://8.130.137.202/models/engine.gltf',
    // 保留本地开发路径
    '/models/engine.gltf'

  ];
  
  console.log('尝试加载这些路径中的模型:', possiblePaths);
  
  // 创建加载器
  const loader = new THREE.GLTFLoader(loadingManager);
  
  // 尝试加载模型，直到成功或全部失败
  function tryNextModel(index) {
    if (index >= possiblePaths.length) {
      console.error('所有路径都加载失败');
      alert('无法加载模型。请确保GLTF文件位于正确位置。');
      return;
    }
    
    const path = possiblePaths[index];
    console.log(`尝试加载: ${path}`);
    
    loader.load(
      path,
      (gltf) => {
        console.log(`模型成功加载: ${path}`, gltf);
        handleLoadedModel(gltf);
      },
      (xhr) => {
        // 加载进度已通过 loadingManager 处理
      },
      (error) => {
        console.warn(`路径 ${path} 加载失败:`, error);
        // 尝试下一个路径
        tryNextModel(index + 1);
      }
    );
  }
  
  // 开始尝试第一个路径
  tryNextModel(0);
}

// 处理成功加载的模型
function handleLoadedModel(gltf) {
  console.log('处理加载的模型');
  
  // 创建模型组，方便整体操作
  engineGroup = new THREE.Group();
  engineModel = gltf.scene;
  
  // 调整模型位置和比例
  engineModel.scale.set(3.4, 3, 3.7); // 增大模型比例，使其更明显
  engineModel.position.set(0, 0, 0);
  
  // 居中模型
  const box = new THREE.Box3().setFromObject(engineModel);
  const center = box.getCenter(new THREE.Vector3());
  engineModel.position.sub(center);
  
  // 添加到场景中
  engineGroup.add(engineModel);
  scene.add(engineGroup);
  
  // 清空现有部件数组
  engineParts = [];
  originalPositions = [];
  
  // 处理模型的每个部分
  engineModel.traverse(child => {
    if (child.isMesh) {
      // 添加阴影
      child.castShadow = true;
      child.receiveShadow = true;
      
      // 改进材质
      if (child.material) {
        // 保存原始材质颜色
        child.originalColor = child.material.color.clone();
        
        // 增强材质
        child.material.roughness = 0.7;
        child.material.metalness = 0.8;
      }
      
      // 添加到部件数组，便于后续操作
      engineParts.push(child);
      
      // 记录原始位置
      originalPositions.push({
        mesh: child,
        position: child.position.clone(), // 确保使用克隆的位置
        parent: child.parent
      });
    }
  });
  
  console.log(`模型处理完成，找到 ${engineParts.length} 个部件`);
  
  // 更新多边形计数
  updatePolygonCount();
  
  // 自动慢速旋转
  autoRotate();
}

// 自动旋转动画
function autoRotate() {
  if (!engineGroup) return;
  
  const duration = 10; // 旋转一周的时间（秒）
  const startTime = Date.now();
  const startRotation = new THREE.Euler().copy(engineGroup.rotation);
  
  function rotateModel() {
    const elapsed = (Date.now() - startTime) / 1000;
    const progress = (elapsed % duration) / duration;
    const angle = progress * Math.PI * 2;
    
    engineGroup.rotation.y = startRotation.y + angle;
    
    if (modelLoaded && controls.autoRotate) {
      requestAnimationFrame(rotateModel);
    }
  }
  
  // 开始自动旋转
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1;
  rotateModel();
  
  // 5秒后停止自动旋转
  setTimeout(() => {
    controls.autoRotate = false;
  }, 5000);
}

// 切换爆炸图视图 - 重写此函数以修复爆炸图功能
function toggleExplodeView() {
  if (!engineModel || engineParts.length === 0) {
    console.log('没有可用模型，无法切换爆炸图视图');
    return;
  }
  
  isExploded = !isExploded;
  console.log(`切换爆炸图视图: ${isExploded ? '展开' : '收起'}`);
  
  const duration = 1.0; // 动画持续时间（秒）
  const startTime = Date.now();
  const explosionFactor = 2.0; // 增加爆炸距离因子
  
  // 验证originalPositions数组
  if (originalPositions.length === 0) {
    console.error('originalPositions数组为空，无法进行爆炸图动画');
    return;
  }
  
  // 创建和执行爆炸/收缩动画
  function animateExplode() {
    const elapsedTime = (Date.now() - startTime) / 1000;
    const progress = Math.min(elapsedTime / duration, 1);
    const easeProgress = easeInOutCubic(progress);
    
    engineParts.forEach((part, index) => {
      if (!originalPositions[index]) {
        console.warn(`部件 ${index} 没有对应的原始位置信息`);
        return;
      }
      
      // 从部件位置到模型中心的方向向量
      const direction = new THREE.Vector3();
      
      // 计算从物体到中心的方向
      direction.subVectors(part.position, new THREE.Vector3(0, 0, 0)).normalize();
      
      // 如果向量长度为0，则提供默认方向
      if (direction.length() === 0) {
        direction.set((Math.random() - 0.5), (Math.random() - 0.5), (Math.random() - 0.5)).normalize();
      }
      
      const originalPos = originalPositions[index].position.clone();
      
      if (isExploded) {
        // 展开 - 向外移动
        const offset = direction.clone().multiplyScalar(easeProgress * explosionFactor);
        // 应用偏移量到复制的原始位置，而不是直接修改原始位置
        const targetPos = originalPos.clone().add(offset);
        part.position.copy(targetPos);
      } else {
        // 收缩 - 回到原位
        // 计算当前爆炸位置
        const explodedPos = originalPos.clone().add(
          direction.clone().multiplyScalar(explosionFactor)
        );
        // 从爆炸位置向原始位置插值
        part.position.lerpVectors(explodedPos, originalPos, easeProgress);
      }
    });
    
    if (progress < 1) {
      requestAnimationFrame(animateExplode);
    }
  }
  
  animateExplode();
}

// 缓动函数
function easeInOutCubic(x) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

// 高亮部件
function highlightPart(part) {
  // 重置所有部件
  engineParts.forEach(p => {
    if (p.material) {
      p.material.emissive.set(0x000000);
      if (p.originalColor) {
        p.material.color.copy(p.originalColor);
      }
    }
  });
  
  // 高亮选中的部件
  if (part && part.material) {
    part.material.emissive.set(0x0088ff);
    
    // 3秒后恢复
    setTimeout(() => {
      if (part.material) { // 确保部件仍然存在
        part.material.emissive.set(0x000000);
      }
    }, 2000);
  }
}

// 鼠标按下事件处理 - 修改为只处理左键点击
function onMouseDown(event) {
  // 只处理左键点击
  if (event.button !== 0) return;
  
  // 阻止事件传播
  event.preventDefault();
  
  // 正确计算鼠标在容器内的相对位置
  const container = document.getElementById('engine-model-container');
  const rect = container.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  
  // 转换为标准化设备坐标 (-1 到 +1)
  mouse.x = (x / container.clientWidth) * 2 - 1;
  mouse.y = -(y / container.clientHeight) * 2 + 1;
  
  // 检测点击的部件
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(engineParts, true);
  
  if (intersects.length > 0) {
    const clickedPart = intersects[0].object;
    highlightPart(clickedPart);
  }
}

// 更新多边形计数
function updatePolygonCount() {
  let count = 0;
  
  if (engineModel) {
    engineModel.traverse(child => {
      if (child.isMesh && child.geometry) {
        if (child.geometry.index !== null) {
          count += child.geometry.index.count / 3;
        } else {
          count += child.geometry.attributes.position.count / 3;
        }
      }
    });
  }
  
  // 更新DOM显示
  const polygonsElement = document.getElementById('polygons');
  if (polygonsElement) {
    polygonsElement.textContent = `${Math.round(count).toLocaleString()} Polygons`;
  }
}

// 窗口大小调整处理
function onWindowResize() {
  const container = document.getElementById('engine-model-container');
  const width = container.clientWidth;
  const height = container.clientHeight;
  
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

// 帧率计算
let lastTime = 0;
let frameCount = 0;

// 动画循环
function animate() {
  requestAnimationFrame(animate);
  
  // 更新轨道控制器
  controls.update();
  
  // 渲染场景
  renderer.render(scene, camera);
  
  // 计算帧率
  const now = performance.now();
  frameCount++;
  
  if (now > lastTime + 1000) { // 每秒更新一次
    const fps = Math.round((frameCount * 1000) / (now - lastTime));
    const fpsCounter = document.getElementById('fps-counter');
    if (fpsCounter) {
      fpsCounter.textContent = `${fps} FPS`;
    }
    
    frameCount = 0;
    lastTime = now;
  }
}

// 在DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', init);