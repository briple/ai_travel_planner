<!-- src/components/TripMap.vue -->
<template>
  <div class="trip-map-wrapper">
    <!-- 天数切换栏 -->
    <div class="day-switcher" v-if="days.length > 1">
      <button
        :class="{ active: currentDay === null }"
        @click="currentDay = null"
      >
        全部
      </button>
      <button
        v-for="(day, index) in days"
        :key="index"
        :class="{ active: currentDay === index }"
        @click="currentDay = index"
      >
        第 {{ index + 1 }} 天
      </button>
    </div>

    <!-- 地图容器 -->
    <div ref="mapContainer" class="trip-map"></div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch, computed } from 'vue';

const props = defineProps({
  // locations 结构：[ { day: 0, title: '...', lnglat: [lng, lat], desc: '', price: ... }, ... ]
  locations: {
    type: Array,
    required: true,
    default: () => []
  }
});

// 按 day 分组
const days = computed(() => {
  const grouped = {};
  props.locations.forEach(loc => {
    const d = loc.day ?? 0; // 默认第0天
    if (!grouped[d]) grouped[d] = [];
    grouped[d].push(loc);
  });
  // 按 day 排序返回数组
  return Object.keys(grouped)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .map(key => grouped[key]);
});

const currentDay = ref(null); // null 表示显示全部，否则为索引（0,1,2...）

const mapContainer = ref(null);
let mapInstance = null;
let allMarkers = []; // 所有标记
let allPolylines = []; // 所有折线

// 预定义颜色（可扩展）
const COLORS = [
  '#10b981', // emerald-500
  '#3b82f6', // blue-500
  '#ef4444', // red-500
  '#f59e0b', // amber-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#06b6d4'  // cyan-500
];

// 初始化或更新地图
const renderMap = () => {
  if (typeof AMap === 'undefined' || !mapContainer.value) return;

  destroyMap(); // 清理旧内容

  const targetDays = currentDay.value !== null
    ? [days.value[currentDay.value]]
    : days.value;

  allMarkers = [];
  allPolylines = [];

  targetDays.forEach((dayLocations, idx) => {
    const validLocs = dayLocations.filter(loc => loc.lnglat?.length === 2);
    if (validLocs.length === 0) return;

    const color = COLORS[idx % COLORS.length];
    const lnglats = [];

    // 添加标记
    validLocs.forEach(loc => {
      const marker = new AMap.Marker({
        position: loc.lnglat,
        title: loc.title || '地点',
        map: mapInstance,
        cursor: 'pointer'
      });

      const infoWindow = new AMap.InfoWindow({
        content: `
          <div style="padding:8px; min-width:160px;">
            <h4 style="margin:0 0 6px; color:${color};">${loc.title || ''}</h4>
            <p style="margin:0; font-size:12px; color:#555;">${loc.desc || ''}</p>
            ${loc.price ? `<p style="margin:4px 0 0; font-weight:bold; color:#d32f2f;">¥${loc.price}</p>` : ''}
          </div>
        `,
        offset: new AMap.Pixel(0, -10)
      });

      marker.on('click', () => {
        infoWindow.open(mapInstance, marker.getPosition());
      });

      allMarkers.push(marker);
      lnglats.push(loc.lnglat);
    });

    // 绘制当天路线
    if (lnglats.length > 1) {
      const polyline = new AMap.Polyline({
        path: lnglats,
        strokeColor: color,
        strokeWeight: 5,
        strokeOpacity: 0.8,
        map: mapInstance
      });
      allPolylines.push(polyline);
    }
  });

  // 设置视野
  if (allMarkers.length > 0) {
    mapInstance.setFitView(
      allMarkers.map(m => m.getPosition()),
      false,
      [50, 50, 50, 50]
    );
  }
};

const initMap = () => {
  if (!mapContainer.value) return;
  mapInstance = new AMap.Map(mapContainer.value, {
    zoom: 13,
    zoomEnable: true,
    dragEnable: true,
    scrollWheel: true,
    resizeEnable: true,
    doubleClickZoom: true
  });

  renderMap();
};

const destroyMap = () => {
  allPolylines.forEach(pl => pl.setMap(null));
  allMarkers.forEach(m => m.setMap(null));
  allPolylines = [];
  allMarkers = [];
  if (mapInstance) {
    // 不 destroy 整个 map，仅清空内容，避免频繁重建
  }
};

// 监听数据或切换变化
watch([() => props.locations, currentDay], () => {
  if (mapInstance) {
    renderMap();
  }
}, { deep: true });

onMounted(() => {
  setTimeout(initMap, 100);
});

onBeforeUnmount(() => {
  if (mapInstance) {
    mapInstance.destroy();
    mapInstance = null;
  }
});
</script>

<style scoped>
.trip-map-wrapper {
  width: 100%;
}

.day-switcher {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.day-switcher button {
  padding: 4px 10px;
  font-size: 12px;
  border: 1px solid #ddd;
  background: #f9fafb;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.day-switcher button.active {
  background: #10b981;
  color: white;
  border-color: #10b981;
}

.trip-map {
  width: 100%;
  height: 220px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.1);
}
</style>