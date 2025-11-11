<!-- src/components/InitialInput.vue -->
<template>
  <div class="initial-container">
    <div class="input-card">
      <!-- 带动画的标题 -->
      <h2 class="animated-title">
        <span v-for="(char, index) in titleText" :key="index" :style="{ animationDelay: index * 0.1 + 's' }">{{ char }}</span>
      </h2>
      <p class="subtitle">告诉我您的旅行需求，或使用下方参数快速生成计划</p>

      <!-- 参数设置区域 -->
      <div class="params-section">
        <div class="params-grid">
          <div class="param-group">
            <label>目的地</label>
            <el-input v-model="tripParams.destination" placeholder="例如：日本" size="small" />
          </div>
          <div class="param-group">
            <label>天数</label>
            <el-input-number v-model="tripParams.duration" :min="1" :max="30" size="small" controls-position="right" />
          </div>
          <div class="param-group">
            <label>预算(元)</label>
            <el-input-number v-model="tripParams.budget" :min="1000" :max="100000" :step="1000" size="small" controls-position="right" />
          </div>
          <div class="param-group">
            <label>人数</label>
            <el-input-number v-model="tripParams.people" :min="1" :max="10" size="small" controls-position="right" />
          </div>
          <div class="param-group">
            <label>出发时间</label>
            <el-date-picker
              v-model="tripParams.departureDate"
              type="date"
              placeholder="选择日期"
              size="small"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </div>
          <div class="param-group">
            <label>交通方式</label>
            <el-select v-model="tripParams.transport" placeholder="请选择" size="small" style="width: 100%">
              <el-option label="飞机" value="飞机" />
              <el-option label="高铁/火车" value="高铁/火车" />
              <el-option label="自驾" value="自驾" />
              <el-option label="无偏好" value="无偏好" />
            </el-select>
          </div>
          <div class="param-group">
            <label>住宿偏好</label>
            <el-select v-model="tripParams.accommodation" placeholder="请选择" size="small" style="width: 100%">
              <el-option label="经济型酒店" value="经济型酒店" />
              <el-option label="精品民宿" value="精品民宿" />
              <el-option label="高端酒店" value="高端酒店" />
              <el-option label="青旅/客栈" value="青旅/客栈" />
              <el-option label="无偏好" value="无偏好" />
            </el-select>
          </div>
          <div class="param-group">
            <label>偏好</label>
            <el-select v-model="tripParams.preferences" multiple placeholder="选择偏好" size="small" style="width: 100%">
              <el-option label="美食" value="美食" />
              <el-option label="购物" value="购物" />
              <el-option label="文化" value="文化" />
              <el-option label="自然" value="自然" />
              <el-option label="冒险" value="冒险" />
              <el-option label="休闲" value="休闲" />
              <el-option label="亲子" value="亲子" />
              <el-option label="摄影" value="摄影" />
            </el-select>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="input-section">
        <!-- 语音识别状态指示器 -->

        <!-- 输入框 -->
        <el-input
          v-model="currentInput"
          type="textarea"
          :rows="4"
          placeholder="例如：我想去日本东京玩5天，预算1万元，喜欢美食和文化..."
          @keyup.enter="onSend"
          class="chat-input"
          :disabled="isRecording"
          resize="none"
        />

        <!-- 操作按钮区域 -->
        <div class="actions-container">
          <div class="left-actions">
            <el-button 
              @click="applyParams" 
              size="large"
              class="action-btn apply-params-btn"
            >
              <i class="el-icon-s-tools"></i>
              应用参数
            </el-button>
          </div>
          
          <div class="center-actions">
            <!-- 语音识别按钮 -->
            <el-button 
              @click="toggleVoiceInput" 
              :class="['voice-btn', { active: isRecording, recording: isRecording }]"
              :type="isRecording ? 'danger' : 'primary'"
              size="large"
            >
              <i :class="isRecording ? 'el-icon-video-pause' : 'el-icon-microphone'" />
              {{ isRecording ? '停止录音' : '语音输入' }}
            </el-button>
          </div>
          
          <div class="right-actions">
            <el-button 
              type="success" 
              @click="onSend" 
              :loading="isSending" 
              size="large"
              class="action-btn send-btn"
            >
              <i class="el-icon-s-promotion"></i>
              开始规划
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { useXfAsr } from "../utils/xunfeiUtil";

const emit = defineEmits(['start-chat']);

// 使用相同的语音识别接口
const { startRecognition, stopRecognition, resultText } = useXfAsr();

const currentInput = ref('');
const isSending = ref(false);
const isRecording = ref(false);
const titleText = 'AI 旅行助手';

const tripParams = ref({
  destination: '',
  duration: null,
  budget: null,
  people: null,
  departureDate: null,
  transport: null,
  accommodation: null,
  preferences: []
});

// 监听语音识别结果，直接应用到输入框
watch(resultText, (newText) => {
  if (newText && newText.trim()) {
    currentInput.value = newText;
  }
});

const applyParams = () => {
  const p = tripParams.value;
  const prefs = p.preferences.length ? p.preferences.join('、') : '无特别偏好';
  const dateStr = p.departureDate ? `，${p.departureDate}出发` : '';
  const transStr = p.transport ? `，交通方式：${p.transport}` : '';
  const accoStr = p.accommodation ? `，住宿偏好：${p.accommodation}` : '';

  currentInput.value = `我想去${p.destination || '某地'}，${p.duration ? p.duration + '天' : '几天'}，预算${p.budget ? p.budget + '元' : '不限'}，${p.people ? p.people + '人' : '独自'}出行${dateStr}${transStr}${accoStr}，偏好${prefs}。`;
};

const onSend = async () => {
  if (!currentInput.value.trim()) {
    ElMessage.warning('请输入您的旅行需求');
    return;
  }

  isSending.value = true;
  
  // 触发 start-chat 事件，传递输入内容和参数
  emit('start-chat', {
    input: currentInput.value,
    params: { ...tripParams.value }
  });
  
  isSending.value = false;
};

// 语音输入功能
const toggleVoiceInput = async () => {
  if (isRecording.value) {
    await stopVoiceInput();
  } else {
    await startVoiceInput();
  }
};

// 开始语音识别
const startVoiceInput = async () => {
  try {
    await startRecognition();
    isRecording.value = true;
    ElMessage.info('开始语音识别，请说出您的旅行需求');
  } catch (error) {
    ElMessage.error('语音识别启动失败，请重试');
    console.error('语音识别启动失败:', error);
  }
};

// 停止语音识别
const stopVoiceInput = async () => {
  await stopRecognition();
  isRecording.value = false;
  ElMessage.success('语音识别完成，结果已应用到输入框');
};
</script>

<style scoped>
.initial-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 95vh;
  background: #f8fafc;
}

.input-card {
  width: 100%;
  max-width: 700px;
  padding: 2rem;
  background: transparent;
  text-align: center;
}

/* 标题放大 + 逐字动画 */
.animated-title {
  font-size: 2.2rem;
  color: #0d9488;
  margin-bottom: 0.6rem;
  font-weight: 700;
  letter-spacing: 1px;
}

.animated-title span {
  opacity: 0;
  animation: fadeInUp 0.5s forwards;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.subtitle {
  color: #64748b;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
}

.params-section {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px dashed #e2e8f0;
}

.params-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 12px;
  margin-bottom: 1rem;
}

.param-group label {
  display: block;
  font-size: 0.75rem;
  color: #64748b;
  margin-bottom: 4px;
  text-align: left;
}

/* 输入区域样式 */
.input-section {
  margin-top: 1.5rem;
}

/* 输入框变大 */
.chat-input {
  margin: 1rem 0;
  font-size: 1rem;
}

.chat-input :deep(.el-textarea__inner) {
  min-height: 120px;
  font-size: 1rem;
  line-height: 1.5;
  padding: 12px;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
}

.chat-input :deep(.el-textarea__inner:focus) {
  border-color: #0d9488;
  box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.1);
}

/* 录音状态指示器 */
.recording-status {
  margin: 0 0 1rem 0;
  padding: 16px 20px;
  background: linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%);
  border: 2px solid #feb2b2;
  border-radius: 12px;
  text-align: center;
}

.recording-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: #e53e3e;
  font-size: 1rem;
  font-weight: 600;
}

.recording-dot {
  width: 12px;
  height: 12px;
  background-color: #e53e3e;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

.stop-btn {
  margin-left: auto;
  font-weight: 600;
  padding: 12px 20px;
  font-size: 1rem;
}

/* 操作按钮区域 */
.actions-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  gap: 16px;
}

.left-actions, .center-actions, .right-actions {
  flex: 1;
}

.center-actions {
  display: flex;
  justify-content: center;
}

.right-actions {
  display: flex;
  justify-content: flex-end;
}

/* 按钮统一样式 */
.action-btn {
  padding: 14px 24px;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 12px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.apply-params-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-color: transparent;
  color: white;
}

.apply-params-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.send-btn {
  background: linear-gradient(135deg, #10b981 0%, #0d9488 100%);
  border-color: transparent;
  color: white;
  padding: 14px 28px;
}

.send-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

/* 语音按钮样式 */
.voice-btn {
  font-weight: 700;
  padding: 16px 32px;
  font-size: 1.2rem;
  border-radius: 16px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 160px;
  justify-content: center;
}

.voice-btn:not(.active) {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  border-color: transparent;
  color: white;
}

.voice-btn:not(.active):hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);
}

.voice-btn.active {
  background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
  border-color: transparent;
  color: white;
  transform: scale(1.05);
}

.voice-btn.recording {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(229, 62, 62, 0.7);
  }
  
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 12px rgba(229, 62, 62, 0);
  }
  
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(229, 62, 62, 0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .input-card {
    padding: 1rem;
    max-width: 95%;
  }
  
  .actions-container {
    flex-direction: column;
    gap: 12px;
  }
  
  .left-actions, .center-actions, .right-actions {
    width: 100%;
    justify-content: center;
  }
  
  .params-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .recording-indicator {
    flex-direction: column;
    gap: 12px;
  }
  
  .stop-btn {
    margin-left: 0;
    width: 100%;
  }
  
  .action-btn, .voice-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .params-grid {
    grid-template-columns: 1fr;
  }
  
  .animated-title {
    font-size: 1.8rem;
  }
  
  .voice-btn {
    font-size: 1.1rem;
    padding: 14px 24px;
  }
  
  .action-btn {
    font-size: 1rem;
    padding: 12px 20px;
  }
}
</style>