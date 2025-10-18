<!-- TripGenerator.vue -->
<template>
  <div class="generator-container">
    <div class="search-container">
      <el-input
        v-model="tripInput"
        type="textarea"
        :rows="2"
        placeholder="告诉我您的旅行计划，例如：'我想去日本，5天，预算1万元，喜欢美食和动漫，带孩子'"
        class="search-input"
        @keyup.enter="generatePlan"
        ref="inputRef"
      />
      <div class="input-actions">
        <el-button 
          type="success" 
          @click="generatePlan"
          :loading="isGenerating"
          class="generate-btn"
        >
          生成行程
        </el-button>
        <el-button 
          icon="el-icon-microphone" 
          @click="toggleVoiceInput"
          :class="['voice-btn', { active: isListening }]"
          :style="{ 
            'background': isListening ? 'linear-gradient(135deg, #10b981 0%, #0d9488 100%)' : '#f0fdf4',
            'color': isListening ? 'white' : '#0d9488',
            'border-color': isListening ? 'transparent' : '#a7f3d0'
          }"
        >
          {{ isListening ? '停止' : '语音' }}
        </el-button>
      </div>
    </div>

    <!-- 旅行偏好卡片 -->
    <div v-if="!tripPlan" class="pref-cards">
      <h2 class="section-title">快速开始</h2>
      <div class="card-grid">
        <div 
          v-for="(preset, index) in presetTrips" 
          :key="index" 
          class="pref-card"
          @click="usePreset(preset)"
        >
          <div class="card-icon">
            <i :class="preset.icon"></i>
          </div>
          <h3>{{ preset.title }}</h3>
          <p>{{ preset.desc }}</p>
        </div>
      </div>
    </div>

    <!-- 行程计划展示 -->
    <div v-if="tripPlan" class="trip-plan">
      <div class="plan-header">
        <h2 class="plan-title">{{ tripPlan.destination }} 旅行计划</h2>
        <div class="plan-meta">
          <span>📅 {{ tripPlan.duration }}天</span>
          <span>💰 预算: {{ formatPrice(tripPlan.budget) }}</span>
          <span>👥 {{ tripPlan.people }}人同行</span>
        </div>
        <el-button 
          type="success" 
          icon="el-icon-download" 
          @click="downloadPlan"
          class="download-btn"
          :style="{ 
            'background': 'linear-gradient(135deg, #10b981 0%, #0d9488 100%)',
            'border-color': 'transparent',
            'color': 'white'
          }"
        >
          下载行程
        </el-button>
      </div>

      <!-- 详细行程 -->
      <div class="day-cards">
        <div 
          v-for="day in tripPlan.days" 
          :key="day.day" 
          class="day-card"
          :class="['animated', 'delay-' + day.day]"
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

    <!-- 占位图 -->
    <div v-if="!tripPlan && !isGenerating" class="placeholder">
      <el-empty 
        description="输入您的旅行需求，让我为您规划完美行程"
        :image-size="200"
      >
        <template #image>
          <img src="https://cdn-icons-png.flaticon.com/512/2553/2553975.png" alt="旅行" style="width: 200px; opacity: 0.6;" />
        </template>
      </el-empty>
    </div>
    
    <!-- 加载动画 -->
    <div v-if="isGenerating" class="loading-overlay">
      <div class="loading-content">
        <el-icon class="is-loading" style="font-size: 48px; color: #10b981;">
          <i class="el-icon-loading"></i>
        </el-icon>
        <h3>正在为您智能规划行程...</h3>
        <p>AI正在分析最佳路线、美食和住宿</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { ElMessage } from 'element-plus';

// 输入相关
const tripInput = ref('');
const isGenerating = ref(false);
const inputRef = ref(null);
const isListening = ref(false);

// 行程计划
const tripPlan = ref(null);

// 预设旅行模板
const presetTrips = ref([
  {
    title: '日本美食之旅',
    desc: '东京-大阪 5天 美食探索',
    icon: 'el-icon-food',
    input: '我想去日本，5天，预算1万元，喜欢美食，两个人'
  },
  {
    title: '亲子动漫游',
    desc: '东京迪士尼 带孩子游玩',
    icon: 'el-icon-star-on',
    input: '我想去日本，4天，预算8000元，喜欢动漫，带孩子'
  },
  {
    title: '京都文化行',
    desc: '古都寺庙与和服体验',
    icon: 'el-icon-place',
    input: '我想去京都，3天，预算6000元，喜欢传统文化'
  }
]);

// 检查输入框焦点
onMounted(() => {
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.focus();
    }
  });
});

// 生成行程计划
const generatePlan = async () => {
  if (!tripInput.value.trim()) {
    ElMessage.warning('请输入您的旅行需求');
    return;
  }

  isGenerating.value = true;
  tripPlan.value = null;

  // 模拟AI生成过程
  await new Promise(resolve => setTimeout(resolve, 2500));

  try {
    // 解析用户输入（简化版）
    const plan = parseTripInput(tripInput.value);
    tripPlan.value = plan;
    ElMessage.success('行程规划完成！');
  } catch (error) {
    ElMessage.error('行程生成失败，请检查输入格式');
  } finally {
    isGenerating.value = false;
  }
};

// 简化的行程解析逻辑
const parseTripInput = (input) => {
  // 提取关键信息（简化正则）
  const destinationMatch = input.match(/(日本|京都|东京|大阪|北海道)/);
  const durationMatch = input.match(/(\d+)天/);
  const budgetMatch = input.match(/预算(\d+)元/);
  const peopleMatch = input.match(/(带孩子|一家人|情侣|独自一人|朋友)/);
  const preferenceMatch = input.match(/(美食|动漫|文化|购物|自然|寺庙)/);

  const destination = destinationMatch ? destinationMatch[1] : '日本';
  const duration = durationMatch ? parseInt(durationMatch[1]) : 5;
  const budget = budgetMatch ? parseInt(budgetMatch[1]) : 10000;
  const people = peopleMatch ? peopleMatch[1] : '两人';
  const preference = preferenceMatch ? preferenceMatch[1] : '综合';

  // 根据偏好生成不同行程
  let days = [];
  for (let i = 1; i <= duration; i++) {
    days.push(generateDayPlan(i, preference, destination));
  }

  return {
    destination,
    duration,
    budget,
    people: people === '带孩子' ? '家庭' : people,
    preferences: preference,
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
    '寺庙': '寺庙巡礼'
  };

  const baseTheme = themes[preference] || '综合体验';
  const theme = `${baseTheme} - 第${day}天`;

  // 根据目的地和偏好生成活动
  let activities = [];
  
  if (destination === '日本') {
    if (preference === '美食') {
      activities = [
        { time: '09:00', title: '早餐体验', desc: '当地特色早餐店', type: '餐饮', price: 80 },
        { time: '11:00', title: '寿司制作课', desc: '亲手制作正宗寿司', type: '体验', price: 350 },
        { time: '14:00', title: '拉面街巡礼', desc: '品尝三家名店拉面', type: '餐饮', price: 180 },
        { time: '18:00', title: '居酒屋晚餐', desc: '本地人推荐居酒屋', type: '餐饮', price: 280 },
        { time: '20:00', title: '夜市漫步', desc: '体验当地夜生活', type: '休闲', price: 0 }
      ];
    } else if (preference === '动漫') {
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

// 使用预设模板
const usePreset = (preset) => {
  tripInput.value = preset.input;
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.focus();
    }
  });
};

// 语音输入功能（模拟）
const toggleVoiceInput = () => {
  isListening.value = !isListening.value;
  if (isListening.value) {
    ElMessage.info('语音输入已开启（模拟）');
    // 模拟语音识别结果
    setTimeout(() => {
      tripInput.value = '我想去日本，5天，预算1万元，喜欢美食和动漫，带孩子';
      isListening.value = false;
    }, 3000);
  }
};

// 格式化价格
const formatPrice = (price) => {
  return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(price);
};

// 下载行程
const downloadPlan = () => {
  ElMessage.success('行程已下载到本地');
  // 实际应用中可导出为PDF或文本文件
};
</script>

<style scoped>
.generator-container {
  padding: 2rem 0;
}

.search-container {
  max-width: 700px;
  margin: 0 auto 3rem;
  padding: 0 1rem;
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 0.8rem;
}

/* 旅行偏好卡片 */
.pref-cards {
  margin-bottom: 3rem;
}

.section-title {
  font-size: 1.8rem;
  color: #0d9488;
  margin-bottom: 2rem;
  text-align: center;
  font-weight: 700;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.pref-card {
  background: white;
  border-radius: 16px;
  padding: 1.8rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(13, 148, 136, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.pref-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 30px rgba(13, 148, 136, 0.15);
  border-color: rgba(16, 185, 129, 0.3);
}

.card-icon {
  font-size: 2.5rem;
  color: #10b981;
  margin-bottom: 1rem;
}

.pref-card h3 {
  font-size: 1.3rem;
  color: #0d9488;
  margin-bottom: 0.8rem;
  font-weight: 600;
}

.pref-card p {
  color: #64748b;
  font-size: 0.95rem;
  line-height: 1.5;
}

/* 行程计划 */
.trip-plan {
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 10px 40px rgba(13, 148, 136, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  animation: fadeIn 0.6s ease forwards;
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px dashed #e2e8f0;
}

.plan-title {
  font-size: 2.2rem;
  color: #0d9488;
  margin: 0;
  font-weight: 800;
}

.plan-meta {
  display: flex;
  gap: 1.5rem;
  color: #64748b;
  font-size: 1rem;
}

.plan-meta span {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* 每日行程 */
.day-cards {
  display: flex;
  flex-direction: column;
  gap: 1.8rem;
}

.day-card {
  background: #f8fafc;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(13, 148, 136, 0.1);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  opacity: 0;
  transform: translateY(20px);
}

.day-header {
  background: linear-gradient(135deg, #10b981 0%, #0d9488 100%);
  color: white;
  padding: 1.2rem 1.8rem;
}

.day-header h3 {
  font-size: 1.5rem;
  margin: 0;
  font-weight: 700;
}

.day-header p {
  margin: 0.3rem 0 0;
  opacity: 0.9;
  font-size: 0.95rem;
}

.activities {
  padding: 1.5rem;
}

.activity-item {
  display: flex;
  margin-bottom: 1.2rem;
}

.activity-item:last-child {
  margin-bottom: 0;
}

.time {
  min-width: 70px;
  color: #0d9488;
  font-weight: 600;
  font-size: 1.1rem;
  padding-top: 0.3rem;
}

.content {
  flex: 1;
}

.content h4 {
  margin: 0 0 0.4rem 0;
  color: #0d9488;
  font-size: 1.1rem;
  font-weight: 600;
}

.desc {
  color: #64748b;
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0;
}

.details {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
  font-size: 0.9rem;
}

.type {
  background: #e0f7e0;
  color: #0d9488;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-weight: 500;
  font-size: 0.85rem;
}

.price {
  color: #dc2626;
  font-weight: 600;
}

/* 占位图 */
.placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
  margin: 3rem 0;
}

/* 加载层 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.loading-content {
  text-align: center;
  animation: pulse 2s infinite;
}

.loading-content h3 {
  color: #0d9488;
  margin: 1.5rem 0 0.8rem;
  font-size: 1.5rem;
}

.loading-content p {
  color: #64748b;
  font-size: 1rem;
}

/* 动画 */
@keyframes fadeIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0% {
    opacity: 0.8;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.8;
  }
}

.animated {
  animation: fadeIn 0.6s ease forwards;
}

/* 响应式 */
@media (max-width: 768px) {
  .plan-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }
  
  .plan-meta {
    flex-wrap: wrap;
    gap: 0.8rem;
  }
}
</style>