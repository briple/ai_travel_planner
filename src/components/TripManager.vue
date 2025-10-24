<template>
  <div class="management-container">
    <div class="page-header">
      <h2 class="page-title">旅游计划管理</h2>
      <p class="page-desc">管理您的所有旅行计划，包括历史行程和收藏计划</p>
    </div>
    
    <!-- 操作栏 -->
    <div class="actions-bar">
      <div class="left-actions">
        <el-button 
          type="success" 
          icon="el-icon-plus"
          @click="showAddDialog"
          class="new-plan-btn"
        >
          新建计划
        </el-button>
        <el-button 
          type="danger" 
          icon="el-icon-delete"
          @click="batchDelete"
          :disabled="selectedPlans.length === 0"
          class="batch-delete-btn"
        >
          批量删除
        </el-button>
      </div>
      <div class="right-actions">
        <el-input
          v-model="searchQuery"
          placeholder="搜索您的旅行计划..."
          class="search-input"
          clearable
          prefix-icon="el-icon-search"
        />
      </div>
    </div>
    
    <!-- 计划列表 -->
    <div class="plan-list">
      <div v-if="filteredPlans.length > 0" class="plans-container">
        <div class="plans-grid">
          <div 
            v-for="plan in filteredPlans" 
            :key="plan.id"
            :class="['plan-card', { selected: selectedPlans.includes(plan.id) }]"
          >
            <div class="plan-card-header">
              <div class="plan-title-section">
                <h3 class="plan-title">{{ plan.title }}</h3>
                <el-tag 
                  :type="getStatusType(plan.status)" 
                  size="small"
                  class="status-tag"
                >
                  {{ getStatusText(plan.status) }}
                </el-tag>
              </div>
              <div class="plan-actions">
                <el-button 
                  icon="el-icon-view" 
                  circle 
                  size="small"
                  @click="viewPlanDetails(plan)"
                  class="view-btn"
                  title="查看详情"
                />
                <el-button 
                  icon="el-icon-edit" 
                  circle 
                  size="small"
                  @click="editPlan(plan)"
                  class="edit-btn"
                  title="编辑"
                />
                <el-button 
                  icon="el-icon-delete" 
                  circle 
                  size="small"
                  type="danger"
                  @click="deletePlan(plan.id)"
                  class="delete-btn"
                  title="删除"
                />
                <el-checkbox 
                  v-model="selectedPlans" 
                  :label="plan.id"
                  class="select-checkbox"
                />
              </div>
            </div>
            
            <div class="plan-content">
              <div class="plan-destination">
                <i class="el-icon-location-outline"></i>
                <span>{{ plan.destination }}</span>
              </div>
              
              <div class="plan-details">
                <div class="detail-item">
                  <i class="el-icon-date"></i>
                  <span>{{ plan.duration }}天</span>
                </div>
                <div class="detail-item">
                  <i class="el-icon-coin"></i>
                  <span>¥{{ plan.budget.toLocaleString() }}</span>
                </div>
                <div class="detail-item">
                  <i class="el-icon-user"></i>
                  <span>{{ plan.people }}人</span>
                </div>
              </div>
              
              <div class="plan-preferences">
                <el-tag 
                  v-for="pref in plan.preferences" 
                  :key="pref"
                  size="small"
                  class="pref-tag"
                >
                  {{ pref }}
                </el-tag>
              </div>
              
              <div class="plan-meta">
                <span class="create-time">
                  <i class="el-icon-time"></i>
                  创建于: {{ formatDate(plan.createdAt) }}
                </span>
                <span v-if="plan.updatedAt" class="update-time">
                  <i class="el-icon-refresh"></i>
                  更新于: {{ formatDate(plan.updatedAt) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="empty-state">
        <el-empty 
          description="您还没有任何旅行计划，快去生成一个吧！"
          :image-size="200"
        >
          <template #image>
            <img src="https://cdn-icons-png.flaticon.com/512/2553/2553975.png" alt="旅行" style="width: 200px; opacity: 0.6;" />
          </template>
          <el-button 
            type="success"
            @click="showAddDialog"
            class="generate-btn"
          >
            创建新计划
          </el-button>
        </el-empty>
      </div>
    </div>

    <!-- 添加/编辑计划对话框 -->
    <el-dialog 
      :title="isEditing ? '编辑旅行计划' : '新建旅行计划'" 
      v-model="dialogVisible"
      width="600px"
      class="plan-dialog"
    >
      <el-form :model="currentPlan" label-width="100px" class="plan-form">
        <el-form-item label="计划标题">
          <el-input v-model="currentPlan.title" placeholder="请输入计划标题" />
        </el-form-item>
        
        <el-form-item label="目的地">
          <el-input v-model="currentPlan.destination" placeholder="请输入目的地" />
        </el-form-item>
        
        <el-form-item label="出行天数">
          <el-input-number 
            v-model="currentPlan.duration" 
            :min="1" 
            :max="30" 
            controls-position="right"
          />
        </el-form-item>
        
        <el-form-item label="预算(元)">
          <el-input-number 
            v-model="currentPlan.budget" 
            :min="1000" 
            :max="100000" 
            :step="1000"
            controls-position="right"
          />
        </el-form-item>
        
        <el-form-item label="出行人数">
          <el-input-number 
            v-model="currentPlan.people" 
            :min="1" 
            :max="10" 
            controls-position="right"
          />
        </el-form-item>
        
        <el-form-item label="旅行偏好">
          <el-select
            v-model="currentPlan.preferences"
            multiple
            placeholder="选择偏好"
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
        </el-form-item>
        
        <el-form-item label="计划状态">
          <el-select v-model="currentPlan.status" placeholder="选择状态" style="width: 100%">
            <el-option label="规划中" value="planning" />
            <el-option label="进行中" value="ongoing" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="savePlan" :loading="saving">
          {{ isEditing ? '更新' : '创建' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 查看计划详情对话框 -->
    <el-dialog 
      title="旅行计划详情" 
      v-model="detailDialogVisible"
      width="800px"
      class="plan-detail-dialog"
    >
      <div v-if="currentPlanDetail" class="plan-detail-container">
        <div class="plan-detail-header">
          <h2 class="detail-title">{{ currentPlanDetail.destination }} 旅行计划</h2>
          <div class="detail-meta">
            <span>📅 {{ currentPlanDetail.duration }}天</span>
            <span>💰 预算: {{ formatPrice(currentPlanDetail.budget) }}</span>
            <span>👥 {{ currentPlanDetail.people }}人同行</span>
            <span>🎯 {{ currentPlanDetail.preferences }}</span>
          </div>
          <div class="detail-actions">
            <el-button 
              type="success" 
              icon="el-icon-download" 
              @click="downloadPlan(currentPlanDetail)"
              class="download-btn"
              size="small"
            >
              下载行程
            </el-button>
            <el-button 
              type="primary" 
              icon="el-icon-folder-opened" 
              @click="savePlanToCollection(currentPlanDetail)"
              class="save-btn"
              size="small"
            >
              收藏计划
            </el-button>
          </div>
        </div>

        <!-- 详细行程 -->
        <div class="day-cards">
          <div 
            v-for="day in currentPlanDetail.days" 
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
      
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

// 搜索查询
const searchQuery = ref('');

// 模拟数据 - 包含完整的旅行计划详情
const mockPlans = [
  {
    id: '1',
    title: '日本东京美食之旅',
    destination: '日本东京',
    duration: 5,
    budget: 10000,
    people: 2,
    preferences: ['美食', '购物', '文化'],
    status: 'completed',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
    // 完整的旅行计划详情
    planDetails: {
      destination: "日本东京",
      duration: 5,
      budget: 10000,
      people: "2人",
      preferences: "美食、文化",
      days: [
        {
          day: 1,
          theme: "美食探索 - 第1天",
          activities: [
            { time: "09:00", title: "早餐体验", desc: "当地特色早餐店", type: "餐饮", price: 80 },
            { time: "11:00", title: "寿司制作课", desc: "亲手制作正宗寿司", type: "体验", price: 350 },
            { time: "14:00", title: "拉面街巡礼", desc: "品尝三家名店拉面", type: "餐饮", price: 180 },
            { time: "18:00", title: "居酒屋晚餐", desc: "本地人推荐居酒屋", type: "餐饮", price: 280 },
            { time: "20:00", title: "夜市漫步", desc: "体验当地夜生活", type: "休闲", price: 0 }
          ]
        },
        {
          day: 2,
          theme: "文化体验 - 第2天",
          activities: [
            { time: "09:00", title: "浅草寺参观", desc: "东京最古老寺庙", type: "景点", price: 0 },
            { time: "11:00", title: "和服体验", desc: "传统和服穿着拍照", type: "体验", price: 300 },
            { time: "13:00", title: "传统料理午餐", desc: "怀石料理体验", type: "餐饮", price: 400 },
            { time: "15:00", title: "皇居外苑", desc: "参观天皇居所", type: "景点", price: 0 },
            { time: "18:00", title: "银座购物", desc: "高端购物区", type: "购物", price: 200 }
          ]
        },
        {
          day: 3,
          theme: "动漫圣地巡礼 - 第3天",
          activities: [
            { time: "10:00", title: "秋叶原探索", desc: "动漫电器天堂", type: "购物", price: 150 },
            { time: "12:00", title: "动漫主题餐厅", desc: "角色主题午餐", type: "餐饮", price: 120 },
            { time: "14:00", title: "动漫博物馆", desc: "动漫历史展览", type: "景点", price: 200 },
            { time: "16:00", title: "手办商店", desc: "购买限定手办", type: "购物", price: 300 },
            { time: "19:00", title: "动漫主题晚餐", desc: "女仆咖啡厅体验", type: "餐饮", price: 220 }
          ]
        },
        {
          day: 4,
          theme: "自然与购物 - 第4天",
          activities: [
            { time: "09:00", title: "上野公园", desc: "东京著名公园", type: "景点", price: 0 },
            { time: "11:00", title: "上野动物园", desc: "参观熊猫", type: "景点", price: 150 },
            { time: "13:00", title: "阿美横町午餐", desc: "市场美食", type: "餐饮", price: 100 },
            { time: "15:00", title: "涩谷购物", desc: "潮流时尚街区", type: "购物", price: 250 },
            { time: "18:00", title: "新宿晚餐", desc: "歌舞伎町美食", type: "餐饮", price: 180 }
          ]
        },
        {
          day: 5,
          theme: "休闲购物 - 第5天",
          activities: [
            { time: "10:00", title: "台场海滨公园", desc: "海滨休闲", type: "景点", price: 0 },
            { time: "12:00", title: "台场购物中心", desc: "大型购物中心", type: "购物", price: 200 },
            { time: "14:00", title: "彩虹大桥", desc: "东京地标", type: "景点", price: 0 },
            { time: "16:00", title: "自由活动", desc: "个人兴趣探索", type: "休闲", price: 0 },
            { time: "19:00", title: "告别晚餐", desc: "特色餐厅", type: "餐饮", price: 350 }
          ]
        }
      ]
    }
  },
  {
    id: '2',
    title: '京都传统文化体验',
    destination: '日本京都',
    duration: 3,
    budget: 6000,
    people: 1,
    preferences: ['文化', '自然'],
    status: 'planning',
    createdAt: '2024-02-01',
    updatedAt: '2024-02-05',
    planDetails: {
      destination: "日本京都",
      duration: 3,
      budget: 6000,
      people: "1人",
      preferences: "文化、自然",
      days: [
        {
          day: 1,
          theme: "寺庙巡礼 - 第1天",
          activities: [
            { time: "09:00", title: "金阁寺参观", desc: "金色寺庙", type: "景点", price: 100 },
            { time: "11:00", title: "龙安寺", desc: "枯山水庭院", type: "景点", price: 80 },
            { time: "13:00", title: "传统素食午餐", desc: "精进料理", type: "餐饮", price: 120 },
            { time: "15:00", title: "清水寺", desc: "世界文化遗产", type: "景点", price: 150 },
            { time: "18:00", title: "祇园晚餐", desc: "传统京都料理", type: "餐饮", price: 200 }
          ]
        },
        {
          day: 2,
          theme: "和服体验 - 第2天",
          activities: [
            { time: "09:00", title: "和服租赁", desc: "选择和服", type: "体验", price: 250 },
            { time: "11:00", title: "伏见稻荷大社", desc: "千本鸟居", type: "景点", price: 0 },
            { time: "13:00", title: "茶道体验", desc: "传统日本茶道", type: "体验", price: 180 },
            { time: "15:00", title: "花见小路", desc: "传统街道漫步", type: "景点", price: 0 },
            { time: "18:00", title: "怀石料理", desc: "高级京都料理", type: "餐饮", price: 400 }
          ]
        },
        {
          day: 3,
          theme: "岚山自然 - 第3天",
          activities: [
            { time: "09:00", title: "岚山竹林", desc: "竹林小径", type: "景点", price: 0 },
            { time: "11:00", title: "渡月桥", desc: "岚山标志性桥梁", type: "景点", price: 0 },
            { time: "13:00", title: "岚山午餐", desc: "当地特色", type: "餐饮", price: 100 },
            { time: "15:00", title: "天龙寺", desc: "世界文化遗产", type: "景点", price: 120 },
            { time: "17:00", title: "返回市区", desc: "结束行程", type: "交通", price: 50 }
          ]
        }
      ]
    }
  },
  {
    id: '3',
    title: '大阪亲子游',
    destination: '日本大阪',
    duration: 4,
    budget: 8000,
    people: 3,
    preferences: ['亲子', '美食', '休闲'],
    status: 'ongoing',
    createdAt: '2024-02-10',
    updatedAt: '2024-02-15',
    planDetails: {
      destination: "日本大阪",
      duration: 4,
      budget: 8000,
      people: "3人",
      preferences: "亲子、美食、休闲",
      days: [
        {
          day: 1,
          theme: "大阪城与美食 - 第1天",
          activities: [
            { time: "09:00", title: "大阪城公园", desc: "历史城堡", type: "景点", price: 150 },
            { time: "12:00", title: "大阪烧午餐", desc: "当地特色", type: "餐饮", price: 90 },
            { time: "14:00", title: "大阪历史博物馆", desc: "了解大阪历史", type: "景点", price: 120 },
            { time: "17:00", title: "道顿堀", desc: "美食街探索", type: "餐饮", price: 150 },
            { time: "19:00", title: "心斋桥购物", desc: "购物街区", type: "购物", price: 200 }
          ]
        },
        {
          day: 2,
          theme: "环球影城 - 第2天",
          activities: [
            { time: "09:00", title: "大阪环球影城", desc: "全天游玩", type: "景点", price: 450 },
            { time: "13:00", title: "园区午餐", desc: "主题餐厅", type: "餐饮", price: 120 },
            { time: "18:00", title: "园区晚餐", desc: "特色美食", type: "餐饮", price: 150 },
            { time: "20:00", title: "夜间游行", desc: "精彩表演", type: "娱乐", price: 0 }
          ]
        },
        {
          day: 3,
          theme: "海游馆与购物 - 第3天",
          activities: [
            { time: "10:00", title: "大阪海游馆", desc: "世界级水族馆", type: "景点", price: 180 },
            { time: "13:00", title: "天保山午餐", desc: "海港美食", type: "餐饮", price: 100 },
            { time: "15:00", title: "天保山摩天轮", desc: "俯瞰大阪港", type: "景点", price: 80 },
            { time: "17:00", title: "梅田购物", desc: "大型购物中心", type: "购物", price: 250 }
          ]
        },
        {
          day: 4,
          theme: "奈良一日游 - 第4天",
          activities: [
            { time: "08:00", title: "前往奈良", desc: "电车行程", type: "交通", price: 120 },
            { time: "09:30", title: "奈良公园", desc: "与鹿互动", type: "景点", price: 0 },
            { time: "12:00", title: "奈良午餐", desc: "当地特色", type: "餐饮", price: 90 },
            { time: "14:00", title: "东大寺", desc: "世界最大木建筑", type: "景点", price: 150 },
            { time: "16:00", title: "返回大阪", desc: "结束行程", type: "交通", price: 120 }
          ]
        }
      ]
    }
  }
];

// 响应式数据
const plans = ref([]);
const selectedPlans = ref([]);
const dialogVisible = ref(false);
const detailDialogVisible = ref(false);
const isEditing = ref(false);
const saving = ref(false);
const currentPlan = ref({
  id: '',
  title: '',
  destination: '',
  duration: 5,
  budget: 5000,
  people: 2,
  preferences: [],
  status: 'planning',
  createdAt: '',
  updatedAt: ''
});
const currentPlanDetail = ref(null);

// 计算属性 - 过滤计划
const filteredPlans = computed(() => {
  if (!searchQuery.value) {
    return plans.value;
  }
  
  const query = searchQuery.value.toLowerCase();
  return plans.value.filter(plan => 
    plan.title.toLowerCase().includes(query) ||
    plan.destination.toLowerCase().includes(query) ||
    plan.preferences.some(pref => pref.toLowerCase().includes(query))
  );
});

// 生命周期
onMounted(() => {
  loadPlans();
});

// 加载计划
const loadPlans = () => {
  const savedPlans = localStorage.getItem('travelPlans');
  if (savedPlans) {
    plans.value = JSON.parse(savedPlans);
  } else {
    plans.value = [...mockPlans];
    saveToLocalStorage();
  }
};

// 保存到本地存储
const saveToLocalStorage = () => {
  localStorage.setItem('travelPlans', JSON.stringify(plans.value));
};

// 显示添加对话框
const showAddDialog = () => {
  isEditing.value = false;
  currentPlan.value = {
    id: '',
    title: '',
    destination: '',
    duration: 5,
    budget: 5000,
    people: 2,
    preferences: [],
    status: 'planning',
    createdAt: new Date().toISOString().split('T')[0],
    updatedAt: ''
  };
  dialogVisible.value = true;
};

// 编辑计划
const editPlan = (plan) => {
  isEditing.value = true;
  currentPlan.value = { ...plan };
  dialogVisible.value = true;
};

// 查看计划详情
const viewPlanDetails = (plan) => {
  currentPlanDetail.value = plan.planDetails;
  detailDialogVisible.value = true;
};

// 保存计划
const savePlan = async () => {
  if (!currentPlan.value.title || !currentPlan.value.destination) {
    ElMessage.warning('请填写计划标题和目的地');
    return;
  }

  saving.value = true;
  
  // 模拟保存延迟
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (isEditing.value) {
    // 更新计划
    const index = plans.value.findIndex(p => p.id === currentPlan.value.id);
    if (index !== -1) {
      currentPlan.value.updatedAt = new Date().toISOString().split('T')[0];
      plans.value[index] = { ...currentPlan.value };
    }
    ElMessage.success('计划更新成功');
  } else {
    // 添加新计划
    const newPlan = {
      ...currentPlan.value,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: '',
      planDetails: generatePlanDetails(currentPlan.value)
    };
    plans.value.unshift(newPlan);
    ElMessage.success('计划创建成功');
  }
  
  saveToLocalStorage();
  dialogVisible.value = false;
  saving.value = false;
};

// 根据计划生成详情
const generatePlanDetails = (plan) => {
  // 这里可以根据计划信息生成相应的旅行计划详情
  // 简化实现，返回一个基本结构
  return {
    destination: plan.destination,
    duration: plan.duration,
    budget: plan.budget,
    people: plan.people + '人',
    preferences: plan.preferences.join('、'),
    days: Array.from({ length: plan.duration }, (_, i) => ({
      day: i + 1,
      theme: `${plan.preferences[0] || '综合'}体验 - 第${i + 1}天`,
      activities: [
        { time: "09:00", title: "早餐", desc: "酒店早餐", type: "餐饮", price: 80 },
        { time: "11:00", title: "景点参观", desc: "主要景点游览", type: "景点", price: 150 },
        { time: "13:00", title: "午餐", desc: "当地特色餐厅", type: "餐饮", price: 100 },
        { time: "15:00", title: "自由活动", desc: "根据兴趣选择", type: "休闲", price: 0 },
        { time: "18:00", title: "晚餐", desc: "推荐餐厅用餐", type: "餐饮", price: 150 }
      ]
    }))
  };
};

// 删除计划
const deletePlan = (id) => {
  ElMessageBox.confirm('确定要删除这个旅行计划吗？', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    plans.value = plans.value.filter(plan => plan.id !== id);
    selectedPlans.value = selectedPlans.value.filter(selectedId => selectedId !== id);
    saveToLocalStorage();
    ElMessage.success('计划删除成功');
  }).catch(() => {
    // 取消删除
  });
};

// 批量删除
const batchDelete = () => {
  if (selectedPlans.value.length === 0) {
    ElMessage.warning('请选择要删除的计划');
    return;
  }
  
  ElMessageBox.confirm(`确定要删除选中的 ${selectedPlans.value.length} 个计划吗？`, '批量删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    plans.value = plans.value.filter(plan => !selectedPlans.value.includes(plan.id));
    selectedPlans.value = [];
    saveToLocalStorage();
    ElMessage.success(`成功删除 ${selectedPlans.value.length} 个计划`);
  }).catch(() => {
    // 取消删除
  });
};

// 下载计划
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

// 收藏计划
const savePlanToCollection = (plan) => {
  try {
    // 获取已收藏的行程列表
    const savedCollections = JSON.parse(localStorage.getItem('planCollections') || '[]');
    
    // 添加新收藏
    const newCollection = {
      id: Date.now().toString(),
      ...plan,
      collectedAt: new Date().toISOString()
    };
    
    savedCollections.push(newCollection);
    
    // 保存回本地存储
    localStorage.setItem('planCollections', JSON.stringify(savedCollections));
    
    ElMessage.success('计划已收藏');
  } catch (error) {
    ElMessage.error('收藏失败，请重试');
    console.error('收藏失败:', error);
  }
};

// 获取状态类型
const getStatusType = (status) => {
  const types = {
    planning: 'info',
    ongoing: 'success',
    completed: 'primary',
    cancelled: 'danger'
  };
  return types[status] || 'info';
};

// 获取状态文本
const getStatusText = (status) => {
  const texts = {
    planning: '规划中',
    ongoing: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  };
  return texts[status] || '未知';
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN');
};

// 格式化价格
const formatPrice = (price) => {
  return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(price);
};
</script>

<style scoped>
.management-container {
  padding: 2rem 0;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-title {
  font-size: 2.2rem;
  color: #0d9488;
  margin-bottom: 1rem;
  font-weight: 800;
}

.page-desc {
  color: #64748b;
  font-size: 1.1rem;
}

.actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
}

.left-actions {
  display: flex;
  gap: 1rem;
}

.right-actions {
  display: flex;
  gap: 1rem;
}

.search-input {
  width: 300px;
}

.new-plan-btn {
  background: linear-gradient(135deg, #10b981 0%, #0d9488 100%);
  border-color: transparent;
  color: white;
}

.batch-delete-btn:not(:disabled) {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border-color: transparent;
  color: white;
}

.plan-list {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 40px rgba(13, 148, 136, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  min-height: 400px;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.plan-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
  background: white;
  position: relative;
}

.plan-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: #10b981;
}

.plan-card.selected {
  border-color: #10b981;
  background: #f0fdf4;
}

.plan-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.plan-title-section {
  flex: 1;
  margin-right: 1rem;
}

.plan-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #0d9488;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
}

.status-tag {
  font-size: 0.7rem;
}

.plan-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.view-btn {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.edit-btn {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

.delete-btn {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.select-checkbox {
  margin-left: 0.5rem;
}

.plan-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.plan-destination {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: #0d9488;
}

.plan-destination i {
  font-size: 1.1rem;
}

.plan-details {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.9rem;
  color: #64748b;
}

.detail-item i {
  color: #10b981;
}

.plan-preferences {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.pref-tag {
  background: #e0f7e0;
  color: #0d9488;
  border: none;
  font-size: 0.75rem;
}

.plan-meta {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.8rem;
  color: #94a3b8;
}

.create-time, .update-time {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.empty-state {
  padding: 3rem 0;
}

.generate-btn {
  background: linear-gradient(135deg, #10b981 0%, #0d9488 100%);
  border-color: transparent;
  color: white;
}

/* 对话框样式 */
.plan-dialog {
  border-radius: 12px;
}

.plan-form {
  padding: 1rem 0;
}

.plan-form .el-form-item {
  margin-bottom: 1.5rem;
}

/* 计划详情对话框样式 */
.plan-detail-dialog {
  border-radius: 12px;
}

.plan-detail-container {
  max-height: 70vh;
  overflow-y: auto;
}

.plan-detail-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px dashed #e2e8f0;
}

.detail-title {
  font-size: 1.8rem;
  color: #0d9488;
  margin: 0 0 1rem 0;
  font-weight: 700;
}

.detail-meta {
  display: flex;
  gap: 1.5rem;
  color: #64748b;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.detail-meta span {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.detail-actions {
  display: flex;
  gap: 0.8rem;
}

.download-btn {
  background: linear-gradient(135deg, #10b981 0%, #0d9488 100%);
  border-color: transparent;
  color: white;
}

.save-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-color: transparent;
  color: white;
}

/* 每日行程样式 */
.day-cards {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.day-card {
  background: #f8fafc;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(13, 148, 136, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.day-header {
  background: linear-gradient(135deg, #10b981 0%, #0d9488 100%);
  color: white;
  padding: 1rem 1.2rem;
}

.day-header h3 {
  font-size: 1.3rem;
  margin: 0;
  font-weight: 600;
}

.day-header p {
  margin: 0.3rem 0 0;
  opacity: 0.9;
  font-size: 0.9rem;
}

.activities {
  padding: 1.2rem;
}

.activity-item {
  display: flex;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.activity-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.time {
  min-width: 60px;
  color: #0d9488;
  font-weight: 600;
  font-size: 0.9rem;
  padding-top: 0.2rem;
}

.content {
  flex: 1;
}

.content h4 {
  margin: 0 0 0.3rem 0;
  color: #0d9488;
  font-size: 1rem;
  font-weight: 600;
}

.desc {
  color: #64748b;
  font-size: 0.85rem;
  line-height: 1.4;
  margin: 0 0 0.5rem 0;
}

.details {
  display: flex;
  gap: 0.8rem;
  font-size: 0.8rem;
}

.type {
  background: #e0f7e0;
  color: #0d9488;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-weight: 500;
}

.price {
  color: #dc2626;
  font-weight: 600;
}

/* 响应式 */
@media (max-width: 768px) {
  .actions-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .left-actions, .right-actions {
    justify-content: center;
  }
  
  .search-input {
    width: 100%;
  }
  
  .plans-grid {
    grid-template-columns: 1fr;
  }
  
  .plan-card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .plan-actions {
    align-self: flex-end;
  }
  
  .detail-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .detail-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .management-container {
    padding: 1rem 0;
  }
  
  .page-title {
    font-size: 1.8rem;
  }
  
  .plan-list {
    padding: 1rem;
    border-radius: 12px;
  }
  
  .plan-card {
    padding: 1rem;
  }
  
  .plan-detail-dialog {
    width: 95% !important;
  }
  
  .detail-title {
    font-size: 1.5rem;
  }
  
  .activity-item {
    flex-direction: column;
  }
  
  .time {
    margin-bottom: 0.5rem;
  }
}
</style>