<template>
  <div class="chat-container">
    <!-- 对话记录区域 -->
    <div class="chat-history" ref="chatHistoryRef">
      
      <div 
        v-for="(message, index) in chatMessages" 
        :key="index" 
        :class="['message', message.role]"
      >
        <div class="avatar">
          <img 
            v-if="message.role === 'user'" 
            :src="userAvatar" 
            alt="用户头像"
          >
          <div v-else class="ai-avatar">
            <i class="el-icon-s-promotion"></i>
          </div>
        </div>
        <div class="message-content">
          <div class="message-bubble">
            <!-- 用户消息 -->
            <div v-if="message.role === 'user'">
              <p>{{ message.content }}</p>
            </div>
            
            <!-- AI消息 -->
            <div v-else>
              <!-- 显示行程计划 -->
              <div v-if="message.type === 'trip_plan'" class="trip-plan">
                <div class="plan-map">
                  <TripMap 
                    :destination="message.plan.destination" 
                    :days="message.plan.days"
                    style="width: 100%; height: 300px; border-radius: 8px; overflow: hidden;"
                  />
                </div>
                <div class="plan-header">
                  <div class="plan-info">
                    <h2 class="plan-title">{{ message.plan.destination }} 旅行计划</h2>
                    <div class="plan-meta">
                      <span>📅 {{ message.plan.duration }}天</span>
                      <span>💰 预算: {{ formatPrice(message.plan.budget) }}</span>
                      <span>👥 {{ message.plan.people }}人同行</span>
                      <span>🎯 {{ message.plan.preferences }}</span>
                    </div>
                  </div>
                  <div class="plan-actions">
                    <el-button 
                      type="success" 
                      icon="el-icon-download" 
                      @click="downloadPlan(message.plan)"
                      class="download-btn"
                      size="small"
                    >
                      下载行程
                    </el-button>
                    <el-button 
                      type="primary" 
                      icon="el-icon-folder-opened" 
                      @click="savePlan(message.plan)"
                      class="save-btn"
                      size="small"
                    >
                      保存行程
                    </el-button>
                  </div>
                </div>

                <!-- 详细行程 -->
                <div class="day-cards">
                  <div 
                    v-for="day in message.plan.days" 
                    :key="day.day" 
                    class="day-card"
                  >
                    <div class="day-header">
                      <h3>第 {{ day.day }} 天</h3>
                      <p>{{ day.theme }}</p>
                    </div>
                    
                    <div class="activities">
                      <div 
                        v-for="(activity, idx) in day.activities" 
                        :key="idx" 
                        class="activity-item"
                      >
                        <div class="time">{{ activity.time }}</div>
                        <div class="content">
                          <h4>{{ activity.title }}</h4>
                          <p class="desc">{{ activity.desc }}</p>
                          <div class="details">
                            <span class="type">{{ activity.type }}</span>
                            <span class="price" v-if="activity.price">¥{{ activity.price }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 普通文本消息 -->
              <div v-else>
                <p>{{ message.content }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 加载指示器 -->
      <div v-if="isGenerating" class="message assistant">
        <div class="avatar">
          <div class="ai-avatar">
            <i class="el-icon-s-promotion"></i>
          </div>
        </div>
        <div class="message-content">
          <div class="message-bubble">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 参数设置和输入区域 -->
    <div class="input-area">
      <div class="input-container">
        <!-- 参数设置区域 - 与InitialInput保持一致 -->
        <div class="params-section">
          <div class="params-grid">
            <div class="param-group">
              <label>目的地</label>
              <el-input
                v-model="tripParams.destination"
                placeholder="例如：日本"
                size="small"
              />
            </div>
            
            <div class="param-group">
              <label>天数</label>
              <el-input-number
                v-model="tripParams.duration"
                :min="1"
                :max="30"
                size="small"
                controls-position="right"
              />
            </div>
            
            <div class="param-group">
              <label>预算(元)</label>
              <el-input-number
                v-model="tripParams.budget"
                :min="1000"
                :max="100000"
                :step="1000"
                size="small"
                controls-position="right"
              />
            </div>
            
            <div class="param-group">
              <label>人数</label>
              <el-input-number
                v-model="tripParams.people"
                :min="1"
                :max="10"
                size="small"
                controls-position="right"
              />
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
              <el-select
                v-model="tripParams.transport"
                placeholder="请选择"
                size="small"
                style="width: 100%"
              >
                <el-option label="飞机" value="飞机" />
                <el-option label="高铁/火车" value="高铁/火车" />
                <el-option label="自驾" value="自驾" />
                <el-option label="无偏好" value="无偏好" />
              </el-select>
            </div>
            
            <div class="param-group">
              <label>住宿偏好</label>
              <el-select
                v-model="tripParams.accommodation"
                placeholder="请选择"
                size="small"
                style="width: 100%"
              >
                <el-option label="经济型酒店" value="经济型酒店" />
                <el-option label="精品民宿" value="精品民宿" />
                <el-option label="高端酒店" value="高端酒店" />
                <el-option label="青旅/客栈" value="青旅/客栈" />
                <el-option label="无偏好" value="无偏好" />
              </el-select>
            </div>
            
            <div class="param-group">
              <label>偏好</label>
              <el-select
                v-model="tripParams.preferences"
                multiple
                placeholder="选择偏好"
                size="small"
                style="width: 100%"
              >
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
          <!-- 录音状态指示器移动到输入框上方 -->
          <div v-if="isRecording" class="recording-status">
            <div class="recording-indicator">
              <div class="recording-dot"></div>
              <span>正在录音中...请说出您的旅行需求</span>
            </div>
          </div>
          
          <el-input
            v-model="currentInput"
            type="textarea"
            :rows="2"
            placeholder="告诉我您的旅行计划，或者使用上方参数设置..."
            class="chat-input"
            @keyup.enter="sendMessage"
            ref="inputRef"
            :disabled="isRecording"
          />
          <div class="input-actions">
            <el-button 
              @click="applyParams"
              class="action-btn apply-btn"
              size="small"
            >
              应用参数
            </el-button>
            <el-button 
              @click="resetParams"
              class="action-btn"
              size="small"
            >
              重置
            </el-button>
            <el-button 
              icon="el-icon-microphone" 
              @click="toggleVoiceInput"
              :class="['action-btn', 'voice-btn', { active: isRecording }]"
              size="small"
            >
              {{ isRecording ? '停止' : '语音' }}
            </el-button>
            <el-button 
              type="success" 
              @click="sendMessage"
              :loading="isGenerating"
              class="action-btn send-btn"
              size="small"
            >
              发送
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch, defineProps } from 'vue';
import { ElMessage } from 'element-plus';
import {useXfAsr} from "../utils/xunfeiUtil";
import TripMap from './TripMap.vue';

// 接收父组件传递的参数
const props = defineProps({
  currentChatId: {
    type: [String, Number],
    default: null
  },
  chatHistory: {
    type: Array,
    default: () => []
  },
  initialUserInput: {
    type: String,
    default: ''
  },
  initialTripParams: {
    type: Object,
    default: () => ({
      destination: '',
      duration: null,
      budget: null,
      people: null,
      departureDate: null,
      transport: null,
      accommodation: null,
      preferences: []
    })
  }
});

const { startRecognition, stopRecognition, resultText } = useXfAsr();

// 对话相关
const currentInput = ref('');
const chatMessages = ref([]);
const isGenerating = ref(false);
const chatHistoryRef = ref(null);

// 语音识别相关
const isRecording = ref(false);

// 用户头像
const userAvatar = ref('https://cdn-icons-png.flaticon.com/512/149/149071.png');

// 旅行参数 - 与InitialInput保持一致
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

// 初始化组件
onMounted(() => {
  console.log('=== TripGenerator 接收到的参数 ===');
  console.log('currentChatId:', props.currentChatId);
  console.log('initialUserInput:', props.initialUserInput);
  console.log('initialTripParams:', props.initialTripParams);
  console.log('chatHistory:', props.chatHistory);
  console.log('==============================');

  // 如果有初始参数，应用到组件中
  if (props.initialTripParams) {
    tripParams.value = {
      ...tripParams.value,
      ...props.initialTripParams
    };
  }

  // 如果有初始用户输入，填充到输入框
  if (props.initialUserInput) {
    currentInput.value = props.initialUserInput;
  }

  // 如果有聊天历史，恢复对话
  if (props.chatHistory && props.chatHistory.length > 0) {
    chatMessages.value = [...props.chatHistory];
  } else {
    // 否则显示欢迎消息
    addAIMessage('您好！我是AI旅行助手，请告诉我您的旅行需求，或者使用上方的参数设置来规划您的行程。');
  }
});

// 监听消息变化，自动滚动到底部
watch(chatMessages, () => {
  nextTick(() => {
    if (chatHistoryRef.value) {
      chatHistoryRef.value.scrollTop = chatHistoryRef.value.scrollHeight;
    }
  });
}, { deep: true });

// 添加用户消息
const addUserMessage = (content) => {
  chatMessages.value.push({
    role: 'user',
    content: content,
    timestamp: new Date()
  });
};

// 添加AI消息
const addAIMessage = (content, type = 'text', plan = null) => {
  chatMessages.value.push({
    role: 'assistant',
    content: content,
    type: type,
    plan: plan,
    timestamp: new Date()
  });
};

// 应用参数到输入框 - 更新为与InitialInput一致
const applyParams = () => {
  const p = tripParams.value;
  if (!p.destination) {
    ElMessage.warning('请先填写目的地');
    return;
  }
  
  const prefs = p.preferences.length ? p.preferences.join('、') : '无特别偏好';
  const dateStr = p.departureDate ? `，${p.departureDate}出发` : '';
  const transStr = p.transport ? `，交通方式：${p.transport}` : '';
  const accoStr = p.accommodation ? `，住宿偏好：${p.accommodation}` : '';

  currentInput.value = `我想去${p.destination}，${p.duration ? p.duration + '天' : '几天'}，预算${p.budget ? p.budget + '元' : '不限'}，${p.people ? p.people + '人' : '独自'}出行${dateStr}${transStr}${accoStr}，偏好${prefs}。`;
  
  ElMessage.success('参数已应用到输入框');
};

// 重置参数 - 全部清空
const resetParams = () => {
  tripParams.value = {
    destination: '',
    duration: null,
    budget: null,
    people: null,
    departureDate: null,
    transport: null,
    accommodation: null,
    preferences: []
  };
  currentInput.value = '';
  ElMessage.info('参数已重置');
};

// 发送消息
const sendMessage = async () => {
  if (!currentInput.value.trim()) {
    ElMessage.warning('请输入您的旅行需求');
    return;
  }

  // 添加用户消息
  addUserMessage(currentInput.value);
  
  const userInput = currentInput.value;
  currentInput.value = '';
  
  // 开始生成响应
  isGenerating.value = true;
  
  // 模拟AI响应时间
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  try {
    // 解析用户输入并生成行程
    const plan = parseTripInput(userInput);
    
    // 添加AI响应
    addAIMessage('我已经为您生成了详细的旅行计划，请查看：', 'trip_plan', plan);
    
  } catch (error) {
    addAIMessage('抱歉，我无法理解您的旅行需求。请提供更详细的信息，例如目的地、天数、预算和偏好。');
  } finally {
    isGenerating.value = false;
  }
};

// 简化的行程解析逻辑 - 更新以支持新参数
const parseTripInput = (input) => {
  // 提取关键信息（简化正则）
  const destinationMatch = input.match(/(日本|京都|东京|大阪|北海道|泰国|曼谷|普吉岛|欧洲|法国|巴黎|意大利|罗马|北京|上海|杭州|成都|云南|三亚)/);
  const durationMatch = input.match(/(\d+)天/);
  const budgetMatch = input.match(/预算(\d+)元/);
  const peopleMatch = input.match(/(\d+)人/);
  const preferenceMatch = input.match(/(美食|动漫|文化|购物|自然|寺庙|冒险|休闲|亲子|摄影)/g);

  const destination = destinationMatch ? destinationMatch[1] : (tripParams.value.destination || '日本');
  const duration = durationMatch ? parseInt(durationMatch[1]) : (tripParams.value.duration || 5);
  const budget = budgetMatch ? parseInt(budgetMatch[1]) : (tripParams.value.budget || 10000);
  const people = peopleMatch ? parseInt(peopleMatch[1]) : (tripParams.value.people || 2);
  const preferences = preferenceMatch ? preferenceMatch.join('、') : (tripParams.value.preferences.join('、') || '综合体验');

  // 根据偏好生成不同行程
  let days = [];
  for (let i = 1; i <= duration; i++) {
    days.push(generateDayPlan(i, preferences, destination));
  }

  return {
    destination,
    duration,
    budget,
    people: people + '人',
    preferences,
    days
  };
};

// 生成每日计划
const generateDayPlan = (day, preference, destination) => {
  const themes = {
    '美食': '美食探索',
    '动漫': '动漫圣地巡礼',
    '文化': '传统文化体验',
    '购物': '购物狂欢',
    '自然': '自然风光',
    '寺庙': '寺庙巡礼',
    '冒险': '冒险体验',
    '休闲': '休闲度假',
    '亲子': '亲子活动',
    '摄影': '摄影之旅'
  };

  // 获取主要偏好
  const mainPreference = preference.split('、')[0];
  const baseTheme = themes[mainPreference] || '综合体验';
  const theme = `${baseTheme} - 第${day}天`;

  // 根据目的地和偏好生成活动
  let activities = [];
  
  if (destination === '日本' || destination === '东京' || destination === '大阪' || destination === '京都') {
    if (preference.includes('美食')) {
      activities = [
        { time: '09:00', title: '早餐体验', desc: '当地特色早餐店', type: '餐饮', price: 80 },
        { time: '11:00', title: '寿司制作课', desc: '亲手制作正宗寿司', type: '体验', price: 350 },
        { time: '14:00', title: '拉面街巡礼', desc: '品尝三家名店拉面', type: '餐饮', price: 180 },
        { time: '18:00', title: '居酒屋晚餐', desc: '本地人推荐居酒屋', type: '餐饮', price: 280 },
        { time: '20:00', title: '夜市漫步', desc: '体验当地夜生活', type: '休闲', price: 0 }
      ];
    } else if (preference.includes('动漫')) {
      activities = [
        { time: '10:00', title: '动漫博物馆', desc: '参观官方博物馆', type: '景点', price: 200 },
        { time: '13:00', title: '主题咖啡厅', desc: '限定角色主题餐厅', type: '餐饮', price: 150 },
        { time: '15:00', title: '手办商店巡礼', desc: '秋叶原知名店铺', type: '购物', price: 300 },
        { time: '18:00', title: '动漫主题晚餐', desc: '女仆咖啡厅体验', type: '餐饮', price: 220 },
        { time: '20:00', title: 'LIVE HOUSE', desc: '观看动漫歌曲LIVE', type: '娱乐', price: 180 }
      ];
    } else {
      // 综合行程
      const options = [
        [
          { time: '09:00', title: '城市观光', desc: '经典景点游览', type: '景点', price: 150 },
          { time: '12:00', title: '午餐', desc: '当地特色餐厅', type: '餐饮', price: 100 },
          { time: '14:00', title: '购物街', desc: '商业区自由活动', type: '购物', price: 200 },
          { time: '18:00', title: '晚餐', desc: '酒店附近餐厅', type: '餐饮', price: 120 }
        ],
        [
          { time: '10:00', title: '文化体验', desc: '茶道/和服体验', type: '体验', price: 300 },
          { time: '13:00', title: '传统料理', desc: '怀石料理午餐', type: '餐饮', price: 400 },
          { time: '15:00', title: '寺庙参观', desc: '著名佛教寺庙', type: '景点', price: 80 },
          { time: '18:00', title: '晚餐', desc: '日式烧肉', type: '餐饮', price: 180 }
        ]
      ];
      activities = options[(day + 1) % 2];
    }
  } else {
    // 其他目的地
    activities = [
      { time: '09:00', title: '酒店早餐', desc: '自助早餐', type: '餐饮', price: 120 },
      { time: '10:30', title: '主要景点', desc: '城市地标参观', type: '景点', price: 180 },
      { time: '13:00', title: '午餐', desc: '当地特色美食', type: '餐饮', price: 100 },
      { time: '15:00', title: '自由活动', desc: '根据兴趣选择', type: '休闲', price: 0 },
      { time: '18:00', title: '晚餐', desc: '推荐餐厅用餐', type: '餐饮', price: 150 }
    ];
  }

  return {
    day,
    theme,
    activities
  };
};

// 语音输入功能
const toggleVoiceInput = async() => {
  
  if (isRecording.value) {
    // 停止识别
    await stopRecognition();
    isRecording.value = false;
    await new Promise(resolve => setTimeout(resolve, 300));
    currentInput.value += resultText.value;
  } else {
    // 开始识别
    try {
      startRecognition();
      isRecording.value = true;
    } catch (error) {
      ElMessage.error('语音识别启动失败，请重试');
      console.error('语音识别启动失败:', error);
    }
  }
};

// 格式化价格
const formatPrice = (price) => {
  return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(price);
};

// 下载行程 - 将行程导出为JSON文件
const downloadPlan = (plan) => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(plan, null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", `${plan.destination}-旅行计划-${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
  ElMessage.success('行程已下载为JSON文件');
};

// 保存行程到旅行计划管理
const savePlan = (plan) => {
  try {
    // 获取已保存的行程列表
    const savedTrips = JSON.parse(localStorage.getItem('savedTrips') || '[]');
    
    // 添加新行程
    const newTrip = {
      id: Date.now().toString(),
      ...plan,
      createdAt: new Date().toISOString()
    };
    
    savedTrips.push(newTrip);
    
    // 保存回本地存储
    localStorage.setItem('savedTrips', JSON.stringify(savedTrips));
    
    ElMessage.success('行程已保存到旅行计划管理');
  } catch (error) {
    ElMessage.error('保存行程失败，请重试');
    console.error('保存行程失败:', error);
  }
};
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 95vh;
  background-color: #f8fafc;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}

.chat-history {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  background-color: #f8fafc;
}

.message {
  display: flex;
  margin-bottom: 12px;
  animation: fadeIn 0.3s ease-in;
}

.message.user {
  flex-direction: row-reverse;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 8px;
  flex-shrink: 0;
  align-self: flex-start;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ai-avatar {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #10b981 0%, #0d9488 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
}

.message-content {
  max-width: 75%;
}

.message-bubble {
  padding: 8px 12px;
  border-radius: 14px;
  position: relative;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  line-height: 1.3;
  min-height: auto;
}

.message.user .message-bubble {
  background: linear-gradient(135deg, #10b981 0%, #0d9488 100%);
  color: white;
  border-top-right-radius: 4px;
}

.message.assistant .message-bubble {
  background: white;
  color: #333;
  border-top-left-radius: 4px;
  border: 1px solid #e2e8f0;
}

.message.user .message-bubble p,
.message.assistant .message-bubble p {
  margin: 0;
  font-size: 0.9rem;
}

/* 输入区域 */
.input-area {
  padding: 12px;
  background: white;
  border-top: 1px solid #e2e8f0;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
}

.input-container {
  max-width: 1000px;
  margin: 0 auto;
}

/* 参数设置区域 - 与InitialInput保持一致 */
.params-section {
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px dashed #e2e8f0;
}

.params-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
  gap: 20px;
}

.param-group {
  display: flex;
  flex-direction: column;
}

.param-group label {
  display: block;
  font-size: 0.75rem;
  color: #64748b;
  margin-bottom: 4px;
  text-align: left;
}

/* 输入区域 */
.input-section {
  display: flex;
  flex-direction: column;
}

/* 录音状态指示器 - 移动到输入框上方 */
.recording-status {
  margin-bottom: 8px;
  padding: 8px 12px;
  background-color: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 6px;
  text-align: center;
}

.recording-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #e53e3e;
  font-size: 0.85rem;
  font-weight: 500;
}

.recording-dot {
  width: 8px;
  height: 8px;
  background-color: #e53e3e;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

/* 输入按钮区域 */
.input-actions {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: 10px;
}

/* 统一按钮样式 */
.action-btn {
  flex: 1;
  min-width: 0; /* 允许按钮缩小 */
  height: 32px;
  font-size: 0.8rem;
  padding: 6px 8px;
  white-space: nowrap;
}

.apply-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-color: transparent;
  color: white;
}

.voice-btn {
  font-size: 0.8rem;
}

.voice-btn.active {
  background: linear-gradient(135deg, #10b981 0%, #0d9488 100%) !important;
  border-color: transparent !important;
  color: white !important;
}

.send-btn {
  background: linear-gradient(135deg, #10b981 0%, #0d9488 100%);
  border-color: transparent;
  color: white;
}

/* 打字指示器 */
.typing-indicator {
  display: flex;
  align-items: center;
  height: 16px;
}

.typing-indicator span {
  height: 5px;
  width: 5px;
  background: #c1c1c1;
  border-radius: 50%;
  display: inline-block;
  margin-right: 3px;
  animation: typing 1.3s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) {
  animation-delay: 0s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.1s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.2s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-3px);
  }
}

/* 行程计划样式 */
.trip-plan {
  max-width: 100%;
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  padding-bottom: 0.6rem;
  border-bottom: 1px dashed #e2e8f0;
  flex-wrap: wrap;
  gap: 12px;
}

.plan-info {
  flex: 1;
  min-width: 200px;
}

.plan-title {
  font-size: 1.2rem;
  color: #0d9488;
  margin: 0 0 8px 0;
  font-weight: 700;
}

.plan-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  color: #64748b;
  font-size: 0.75rem;
}

.plan-meta span {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  white-space: nowrap;
}

.plan-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.save-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-color: transparent;
  color: white;
}

/* 每日行程 */
.day-cards {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.day-card {
  background: #f8fafc;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(13, 148, 136, 0.1);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.day-header {
  background: linear-gradient(135deg, #10b981 0%, #0d9488 100%);
  color: white;
  padding: 0.6rem 0.8rem;
}

.day-header h3 {
  font-size: 1rem;
  margin: 0;
  font-weight: 600;
}

.day-header p {
  margin: 0.1rem 0 0;
  opacity: 0.9;
  font-size: 0.75rem;
}

.activities {
  padding: 0.6rem;
}

.activity-item {
  display: flex;
  margin-bottom: 0.5rem;
}

.activity-item:last-child {
  margin-bottom: 0;
}

.time {
  min-width: 45px;
  color: #0d9488;
  font-weight: 600;
  font-size: 0.75rem;
  padding-top: 0.1rem;
}

.content {
  flex: 1;
}

.content h4 {
  margin: 0 0 0.1rem 0;
  color: #0d9488;
  font-size: 0.85rem;
  font-weight: 600;
}

.desc {
  color: #64748b;
  font-size: 0.75rem;
  line-height: 1.2;
  margin: 0;
}

.details {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.2rem;
  font-size: 0.7rem;
}

.type {
  background: #e0f7e0;
  color: #0d9488;
  padding: 0.1rem 0.3rem;
  border-radius: 8px;
  font-weight: 500;
}

.price {
  color: #dc2626;
  font-weight: 600;
}

/* 动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(245, 108, 108, 0.7);
  }
  
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 6px rgba(245, 108, 108, 0);
  }
  
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(245, 108, 108, 0);
  }
}

/* 响应式 */
@media (max-width: 768px) {
  .message-content {
    max-width: 85%;
  }
  
  .plan-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.8rem;
  }
  
  .plan-meta {
    gap: 8px;
  }
  
  .plan-actions {
    width: 100%;
    justify-content: flex-start;
  }
  
  .params-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;
  }
  
  .input-actions {
    flex-wrap: wrap;
    justify-content: flex-start;
  }
  
  .action-btn {
    min-width: 80px;
  }
}

@media (max-width: 480px) {
  .params-grid {
    grid-template-columns: 1fr;
  }
  
  .input-actions {
    justify-content: space-between;
  }
  
  .avatar {
    width: 28px;
    height: 28px;
  }
  
  .message-content {
    max-width: 80%;
  }
  
  .plan-meta {
    flex-direction: column;
    gap: 4px;
  }
  
  .plan-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .plan-actions .el-button {
    width: 100%;
    justify-content: center;
  }
  
  .action-btn {
    min-width: 70px;
    font-size: 0.75rem;
    padding: 4px 6px;
  }
  
  .recording-indicator {
    font-size: 0.8rem;
  }
}
</style>