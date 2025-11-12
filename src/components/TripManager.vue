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
          type="danger" 
          @click="batchDelete"
          :disabled="selectedPlans.length === 0"
          class="batch-delete-btn"
        >
          <ElIcon><Delete /></ElIcon>
          批量删除
        </el-button>
      </div>
      <div class="right-actions">
        <el-input
          v-model="searchQuery"
          placeholder="搜索您的旅行计划..."
          class="search-input"
          clearable
        >
          <template #prefix>
            <ElIcon><Search /></ElIcon>
          </template>
        </el-input>
      </div>
    </div>

    <!-- 计划列表 -->
    <div class="plan-list">
      <div v-if="filteredPlans.length > 0" class="plans-container">
        <div class="plans-grid">
          <div 
            v-for="plan in filteredPlans" 
            :key="plan.planId"
            :class="['plan-card', { selected: selectedPlans.includes(plan.planId) }]"
          >
            <div class="plan-card-header">
              <div class="plan-title-section">
                <h3 class="plan-title">{{ plan.destination }}</h3>
                <!-- 状态选择器 -->
                <el-select
                  v-model="plan.status"
                  :teleported="false"
                  size="small"
                  @change="updatePlanStatus(plan.planId, plan.status)"
                  class="status-select"
                >
                  <el-option
                    v-for="status in statusOptions"
                    :key="status.value"
                    :label="status.label"
                    :value="status.value"
                    :type="getStatusType(status.value)"
                  >
                    <el-tag 
                      :type="getStatusType(status.value)" 
                      size="small"
                    >
                      {{ status.label }}
                    </el-tag>
                  </el-option>
                </el-select>
              </div>
              <div class="plan-actions">
                <el-button 
                  circle 
                  size="small"
                  @click="viewPlanDetails(plan)"
                  class="view-btn"
                  title="查看详情"
                >
                  <ElIcon><View /></ElIcon>
                </el-button>
                <el-button 
                  circle 
                  size="small"
                  type="danger"
                  @click="deletePlan(plan.planId)"
                  class="delete-btn"
                  title="删除"
                >
                  <ElIcon><Delete /></ElIcon>
                </el-button>
                <el-checkbox 
                  v-model="selectedPlans" 
                  :label="plan.planId"
                  class="select-checkbox"
                />
              </div>
            </div>

            <div class="plan-content">
              <div class="plan-destination">
                <ElIcon><Location /></ElIcon>
                <span>{{ plan.destination }}</span>
              </div>

              <div class="plan-details">
                <div class="detail-item">
                  <ElIcon><Calendar /></ElIcon>
                  <span>{{ plan.duration }}天</span>
                </div>
                <div class="detail-item">
                  <ElIcon><Coin /></ElIcon>
                  <span>¥{{ plan.budget.toLocaleString() }}</span>
                </div>
                <div class="detail-item">
                  <ElIcon><User /></ElIcon>
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
                  <ElIcon><Timer /></ElIcon>
                  创建于: {{ formatDate(plan.timestamp) }}
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
        </el-empty>
      </div>
    </div>

    <!-- 查看计划详情对话框 -->
    <el-dialog 
      title="旅行计划详情" 
      v-model="detailDialogVisible"
      width="800px"
      class="plan-detail-dialog"
    >
      <TripPlanCard 
        v-if="currentPlanDetail" 
        :plan="currentPlanDetail"/>

      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
// 引入图标组件
import {
  Plus,
  Delete,
  Search,
  View,
  Edit,
  Location,
  Calendar,
  Coin,
  User,
  Timer,
  Refresh,
  Download,
  FolderOpened
} from '@element-plus/icons-vue';
import TravelPlanApi, { travelPlanApi } from '../api/travelPlanApi' // 假设你的 API 文件路径如此
import type { TravelPlanVo } from '../types/travelPlan'

// 搜索查询
const searchQuery = ref('');

// 响应式数据
const plans = ref<TravelPlanVo[]>([]);
const selectedPlans = ref([]);
const dialogVisible = ref(false);
const detailDialogVisible = ref(false);
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

// 状态选项
const statusOptions = ref([
  { value: 'planning', label: '规划中' },
  { value: 'ongoing', label: '进行中' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' }
]);

// 计算属性 - 过滤计划
const filteredPlans = computed(() => {
  if (!searchQuery.value) {
    return plans.value;
  }
  
  const query = searchQuery.value.toLowerCase();
  return plans.value.filter(plan => 
    plan.destination.toLowerCase().includes(query) ||
    plan.destination.toLowerCase().includes(query) ||
    plan.preferences.some(pref => pref.toLowerCase().includes(query))
  );
});

// 生命周期
onMounted(() => {
  loadPlans();
});

// 加载计划
const loadPlans = async() => {
  let res = await travelPlanApi.getSavedTravelPlans(Number(localStorage.getItem('userId')));
  console.log('获取保存的行程:', res);
  plans.value = res || [];
};

// 更新计划状态
const updatePlanStatus = async (planId: number, status: string) => {
  try {
    const response = await travelPlanApi.updateTravelPlanStatus(planId, status);
    ElMessage.success('状态更新成功');
    loadPlans();
  } catch (error) {
    console.error('更新状态失败:', error);
    ElMessage.error('状态更新失败，请重试');
  }
};

// 查看计划详情
const viewPlanDetails = (plan: TravelPlanVo) => {
  currentPlanDetail.value = plan;
  detailDialogVisible.value = true;
};

// 删除计划
const deletePlan = async(planId: number) => {
  ElMessageBox.confirm('确定要删除这个旅行计划吗？', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    travelPlanApi.deleteTravelPlan(planId)
    .then(res => {
       ElMessage.success('计划删除成功');
       loadPlans();
    })
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
    selectedPlans.value.forEach(async(planId) => {
      await travelPlanApi.deleteTravelPlan(planId);
      await loadPlans();
      selectedPlans.value = [];
    });
  }).catch(() => {
    // 取消删除
  });
};

// 获取状态类型
const getStatusType = (status: string) => {
  const types = {
    planning: 'info',
    ongoing: 'success',
    completed: 'primary',
    cancelled: 'danger'
  };
  return types[status] || 'info';
};

// 获取状态文本
const getStatusText = (status: string) => {
  const texts = {
    'planning': '规划中',
    'ongoing': '进行中',
    'completed': '已完成',
    'cancelled': '已取消'
  };
  return texts[status] || '未知';
};

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN');
};

// 格式化价格
const formatPrice = (price: number) => {
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
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.plan-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #0d9488;
  margin: 0;
  line-height: 1.3;
}

/* 状态选择器样式 */
.status-select {
  width: 120px;
  border:none
}

.status-select :deep(.el-select__tags) {
  display: none;
}

.status-select :deep(.el-tag) {
  border: none;
  background: transparent;
  padding: 0;
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
  margin-top: -200px;
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