<script setup>
/**
 * DHTI 三层人格对照调试页 — 仅本地开发使用，不上线
 * 路由：/preview（router.js 中用 import.meta.env.DEV 守卫）
 */
import { ref, computed, reactive } from 'vue'
import typesData from '@/data/types.json'
import questionsData from '@/data/questions.json'
import dimensionsData from '@/data/dimensions.json'
import sbtiRaw from '@/data/sbti.json'
import { parsePattern, matchType } from '@/engine/scoring.js'
import RadarChart from '@/components/RadarChart.vue'
import Top5List from '@/components/Top5List.vue'
import DimDetail from '@/components/DimDetail.vue'

// ─────────────────────────────────────────────
// SBTI 响应式数据（来自 sbti.json，可编辑）
// ─────────────────────────────────────────────
const sbtiTypes = ref(JSON.parse(JSON.stringify(sbtiRaw.types)))
const sbtiQuestions = ref(JSON.parse(JSON.stringify(sbtiRaw.questions)))
const sbtiDimNames = sbtiRaw.dimNames

// session 快照（进入页面时保存，用于"还原全部"）
const sessionSnapshot = JSON.parse(JSON.stringify(sbtiRaw))

// SBTI types → 字典
const sbtiTypesMap = computed(() => {
  const m = {}
  sbtiTypes.value.forEach(t => { m[t.code] = t })
  return m
})

// SBTI维度 → DHTI维度 映射
const SBTI_TO_DHTI_DIM = {
  S1: 'N1', S2: 'N2', S3: 'N3',
  E1: 'C1', E2: 'C2', E3: 'C3',
  A1: 'R1', A2: 'R2', A3: 'R3',
  Ac1: 'A1', Ac2: 'A2', Ac3: 'A3',
  So1: 'S1', So2: 'S2', So3: 'S3',
}

// MBTI 16 种类型数据
const MBTI_TYPES = {
  'INTJ': { cn: '建筑师',   color: '#7B5EA7', group: '分析家', traits: ['战略型思维', '独立自主', '远见卓识'] },
  'ENTJ': { cn: '指挥官',   color: '#7B5EA7', group: '分析家', traits: ['天生领导力', '效率导向', '果断决策'] },
  'INTP': { cn: '逻辑学家', color: '#7B5EA7', group: '分析家', traits: ['理性分析', '独立思考', '概念探索'] },
  'ENTP': { cn: '辩论家',   color: '#7B5EA7', group: '分析家', traits: ['创新思维', '善于辩论', '拒绝束缚'] },
  'INFJ': { cn: '提倡者',   color: '#4CAF7D', group: '外交家', traits: ['理想主义', '强共情力', '使命感强'] },
  'ENFJ': { cn: '主人公',   color: '#4CAF7D', group: '外交家', traits: ['感染力强', '关怀他人', '社交领袖'] },
  'INFP': { cn: '调停者',   color: '#4CAF7D', group: '外交家', traits: ['理想主义', '价值观驱动', '内心丰富'] },
  'ENFP': { cn: '竞选者',   color: '#4CAF7D', group: '外交家', traits: ['热情洋溢', '创意无限', '善于激励'] },
  'ISTJ': { cn: '物流师',   color: '#4E8FBF', group: '守卫者', traits: ['责任感强', '注重细节', '可靠稳定'] },
  'ESTJ': { cn: '总经理',   color: '#4E8FBF', group: '守卫者', traits: ['实干主义', '组织能力', '原则性强'] },
  'ISFJ': { cn: '守卫者',   color: '#4E8FBF', group: '守卫者', traits: ['照顾他人', '忠诚可靠', '注重传统'] },
  'ESFJ': { cn: '执政官',   color: '#4E8FBF', group: '守卫者', traits: ['社交积极', '关注他人', '和谐维护'] },
  'ISTP': { cn: '鉴赏家',   color: '#E5A020', group: '探险家', traits: ['务实灵活', '独立自主', '技术导向'] },
  'ESTP': { cn: '企业家',   color: '#E5A020', group: '探险家', traits: ['行动导向', '冒险精神', '适应力强'] },
  'ISFP': { cn: '探险家',   color: '#E5A020', group: '探险家', traits: ['活在当下', '感性直觉', '自由随性'] },
  'ESFP': { cn: '表演者',   color: '#E5A020', group: '探险家', traits: ['热情活泼', '享受当下', '社交能量'] },
}

// DHTI → SBTI → MBTI 映射表
const MAPPING = {
  'NAVI':   { sbti: 'CTRL',   mbti: 'INTJ'  },
  'FAST':   { sbti: 'GOGO',   mbti: 'ESTP'  },
  'CTRL':   { sbti: 'CTRL',   mbti: 'ENTJ'  },
  'VIBE':   { sbti: 'MONK',   mbti: 'INFP'  },
  'SOLO':   { sbti: 'SOLO',   mbti: 'ISTP'  },
  'MOM':    { sbti: 'MUM',    mbti: 'ISFJ'  },
  'BOSS':   { sbti: 'BOSS',   mbti: 'ENTJ'  },
  'DRIFTR': { sbti: 'MALO',   mbti: 'ENFP'  },
  'MONK':   { sbti: 'MONK',   mbti: 'ISFP'  },
  'RADAR':  { sbti: 'THAN-K', mbti: 'ENFJ'  },
  'OG8K':   { sbti: 'OG8K',   mbti: 'ISFP'  },
  'PLAN':   { sbti: 'OH-NO',  mbti: 'ISTJ'  },
  'GHOST':  { sbti: 'SOLO',   mbti: 'INTJ'  },
  'CHILL':  { sbti: 'ZZZZ',   mbti: 'ISFP'  },
  'GPS':    { sbti: 'THIN-K', mbti: 'ISTJ'  },
  'CHEAP':  { sbti: 'POOR',   mbti: 'ISTJ'  },
  'WILD':   { sbti: 'FUCK',   mbti: 'ISTP'  },
  'RELAY':  { sbti: 'ATM-er', mbti: 'ENFJ'  },
  'LOST':   { sbti: 'OH-NO',  mbti: 'ISFJ'  },
  'FLEX':   { sbti: 'FAKE',   mbti: 'ENTP'  },
  'SHOW':   { sbti: 'SEXY',   mbti: 'ESTP'  },
  'MATE':   { sbti: 'LOVE-R', mbti: 'ESFJ'  },
  'JOKE':   { sbti: 'JOKE-R', mbti: 'ENTP'  },
  'NOOB':   { sbti: 'OH-NO',  mbti: 'ISFJ'  },
  'NUMB':   { sbti: 'DEAD',   mbti: 'INTP'  },
  'RAGE':   { sbti: 'FUCK',   mbti: null    },
  'HHHH':   { sbti: 'HHHH',   mbti: null    },
}

// ─────────────────────────────────────────────
// 工具函数
// ─────────────────────────────────────────────
const LEVEL_COLOR = { H: '#34C759', M: '#FF9500', L: '#FF3B30' }

function patternToLevels(pattern, dimOrder) {
  if (!pattern) return {}
  const chars = parsePattern(pattern)
  const levels = {}
  dimOrder.forEach((dim, i) => { levels[dim] = chars[i] || 'M' })
  return levels
}

function formatPattern(pattern) {
  if (!pattern) return '—'
  return pattern.replace(/-/g, ' · ')
}

// ─────────────────────────────────────────────
// UI 状态
// ─────────────────────────────────────────────
const allTypes = [...typesData.standard, ...typesData.special]
const dimOrder = dimensionsData.order
const dimDefs = dimensionsData.definitions

const selectedCode = ref('NAVI')
const leftTab = ref('info')
const showDimDetail = ref(false)

// ─────────────────────────────────────────────
// 内联编辑状态
// key 格式: "types:CTRL:cn"  /  "questions:q1:text"
// ─────────────────────────────────────────────
// 当前正在编辑的 key
const editingKey = ref(null)
// 草稿值
const editDraft = ref('')
// 每个 key 的额外状态：{ saving, saved, error, prevValue }
const editMeta = reactive({})

function editKey(section, id, field) {
  return `${section}:${id}:${field}`
}

function startEdit(section, id, field, currentValue) {
  const k = editKey(section, id, field)
  editingKey.value = k
  editDraft.value = currentValue
  if (!editMeta[k]) editMeta[k] = { saving: false, saved: false, error: null, prevValue: undefined }
}

function cancelEdit() {
  editingKey.value = null
  editDraft.value = ''
}

async function commitEdit(section, id, field) {
  const k = editKey(section, id, field)
  const newVal = editDraft.value
  // 找原始值
  let origVal
  if (section === 'types') {
    origVal = sbtiTypes.value.find(t => t.code === id)?.[field]
  } else {
    origVal = sbtiQuestions.value.find(q => q.id === id)?.[field]
  }
  if (newVal === origVal) { cancelEdit(); return }

  if (!editMeta[k]) editMeta[k] = {}
  editMeta[k].saving = true
  editMeta[k].error = null
  editingKey.value = null

  try {
    const res = await fetch('http://localhost:3001/api/dev/patch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section, id, field, value: newVal }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'patch failed')
    // 记录 prevValue（可撤回）
    editMeta[k].prevValue = origVal
    // 更新本地数据
    if (section === 'types') {
      const t = sbtiTypes.value.find(t => t.code === id)
      if (t) t[field] = newVal
    } else {
      const q = sbtiQuestions.value.find(q => q.id === id)
      if (q) q[field] = newVal
    }
    editMeta[k].saving = false
    editMeta[k].saved = true
    setTimeout(() => { if (editMeta[k]) editMeta[k].saved = false }, 2000)
  } catch (e) {
    editMeta[k].saving = false
    editMeta[k].error = e.message
    // 编辑失败：不修改本地数据
  }
}

function handleKeydown(e, section, id, field) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitEdit(section, id, field) }
  if (e.key === 'Escape') cancelEdit()
}

async function revertField(section, id, field) {
  const k = editKey(section, id, field)
  const prev = editMeta[k]?.prevValue
  if (prev === undefined) return
  // 直接用 prev 值 patch
  editDraft.value = prev
  await commitEdit(section, id, field)
  // 清除 prevValue（只能 revert 一次）
  editMeta[k].prevValue = undefined
}

// 全局还原
const restoring = ref(false)
const restoreMsg = ref('')
async function restoreAll() {
  restoring.value = true
  restoreMsg.value = ''
  try {
    const res = await fetch('http://localhost:3001/api/dev/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sessionSnapshot),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error)
    sbtiTypes.value = JSON.parse(JSON.stringify(sessionSnapshot.types))
    sbtiQuestions.value = JSON.parse(JSON.stringify(sessionSnapshot.questions))
    Object.keys(editMeta).forEach(k => delete editMeta[k])
    editingKey.value = null
    restoreMsg.value = '✓ 已还原至初始状态'
  } catch (e) {
    restoreMsg.value = '✗ 还原失败：' + e.message
  } finally {
    restoring.value = false
    setTimeout(() => { restoreMsg.value = '' }, 3000)
  }
}

// ─────────────────────────────────────────────
// 结果计算
// ─────────────────────────────────────────────
const selectedType = computed(() => allTypes.find(t => t.code === selectedCode.value))
const mapping = computed(() => MAPPING[selectedCode.value] || {})
const sbtiType = computed(() => {
  const code = mapping.value.sbti
  return code ? sbtiTypesMap.value[code] : null
})
const mbtiType = computed(() => {
  const code = mapping.value.mbti
  return code ? { code, ...MBTI_TYPES[code] } : null
})

const mockLevels = computed(() => {
  const t = selectedType.value
  if (!t?.pattern) return {}
  return patternToLevels(t.pattern, dimOrder)
})

const sbtiMockLevels = computed(() => {
  const s = sbtiType.value
  if (!s?.pattern) return {}
  return patternToLevels(s.pattern, dimOrder)
})

const mockRankings = computed(() => {
  const levels = mockLevels.value
  if (!Object.keys(levels).length) return []
  return [...typesData.standard]
    .map(type => ({ ...type, ...matchType(levels, dimOrder, type.pattern) }))
    .sort((a, b) => a.distance - b.distance || b.exact - a.exact || b.similarity - a.similarity)
})

const mockResult = computed(() => {
  const t = selectedType.value
  if (!t) return null
  const isRage = t.code === 'RAGE'
  const isFallback = t.code === 'HHHH'
  const rankings = mockRankings.value

  let primary, secondary, mode
  if (isRage) {
    primary = { ...t, similarity: rankings[0]?.similarity ?? 100, exact: rankings[0]?.exact ?? 15, distance: 0 }
    secondary = rankings[0] || null; mode = 'rage'
  } else if (isFallback) {
    primary = { ...t, similarity: rankings[0]?.similarity ?? 50, exact: 0, distance: rankings[0]?.distance ?? 15 }
    secondary = rankings[0] || null; mode = 'fallback'
  } else {
    const pr = rankings.find(r => r.code === t.code) || rankings[0]
    primary = pr ? { ...t, similarity: pr.similarity, exact: pr.exact, distance: pr.distance } : { ...t, similarity: 100, exact: 15, distance: 0 }
    secondary = rankings.filter(r => r.code !== t.code)[0] || null; mode = 'normal'
  }
  return { primary, secondary, rankings, levels: mockLevels.value, dimOrder, dimDefs, mode }
})

const sbtiQuestionsByModel = computed(() => {
  const groups = [
    { sbtiModel: 'S 自我模型', dhtiModel: 'N 导航心理', dims: ['S1', 'S2', 'S3'] },
    { sbtiModel: 'E 情感模型', dhtiModel: 'C 车内情感', dims: ['E1', 'E2', 'E3'] },
    { sbtiModel: 'A 态度模型', dhtiModel: 'R 路途态度', dims: ['A1', 'A2', 'A3'] },
    { sbtiModel: 'Ac 行动模型', dhtiModel: 'A 行动模式', dims: ['Ac1', 'Ac2', 'Ac3'] },
    { sbtiModel: 'So 社交模型', dhtiModel: 'S 社交出行', dims: ['So1', 'So2', 'So3'] },
  ]
  return groups.map(g => ({
    ...g,
    rows: g.dims.map(sbtiDim => {
      const dhtiDim = SBTI_TO_DHTI_DIM[sbtiDim]
      return {
        sbtiDim, dhtiDim,
        sbtiName: sbtiDimNames[sbtiDim],
        dhtiName: dimDefs[dhtiDim]?.shortName,
        sbtiQs: sbtiQuestions.value.filter(q => q.dim === sbtiDim),
        dhtiQs: questionsData.main.filter(q => q.dim === dhtiDim),
      }
    })
  }))
})

const patternComparison = computed(() => {
  const dhtiT = selectedType.value
  const sbtiT = sbtiType.value
  if (!dhtiT?.pattern) return []
  const dhtiChars = parsePattern(dhtiT.pattern)
  const sbtiChars = sbtiT?.pattern ? parsePattern(sbtiT.pattern) : []
  return dimOrder.map((dim, i) => ({
    dim,
    shortName: dimDefs[dim]?.shortName || dim,
    dhti: dhtiChars[i] || '?',
    sbti: sbtiChars[i] || '?',
    match: sbtiChars[i] ? dhtiChars[i] === sbtiChars[i] : null,
  }))
})
</script>

<template>
  <div class="pv">
    <!-- ── 顶部标题栏 ── -->
    <div class="pv__header">
      <span class="pv__title">🛠 DHTI 三层对照调试页 · 仅本地</span>
      <div class="pv__header-actions">
        <span v-if="restoreMsg" class="pv__restore-msg" :class="{ 'is-error': restoreMsg.startsWith('✗') }">{{ restoreMsg }}</span>
        <button class="pv__restore-btn" :disabled="restoring" @click="restoreAll">
          {{ restoring ? '还原中…' : '↺ 还原全部' }}
        </button>
      </div>
    </div>

    <!-- ── Chip 选择栏 ── -->
    <div class="pv__chips">
      <span class="pv__chips-label">标准</span>
      <button
        v-for="t in typesData.standard" :key="t.code"
        class="pv__chip" :class="{ 'is-active': selectedCode === t.code }"
        @click="selectedCode = t.code; showDimDetail = false"
      >{{ t.code }}</button>
      <span class="pv__chips-sep">|</span>
      <span class="pv__chips-label">特殊</span>
      <button
        v-for="t in typesData.special" :key="t.code"
        class="pv__chip pv__chip--special"
        :class="{ 'is-active': selectedCode === t.code, 'is-rage': t.code === 'RAGE', 'is-fallback': t.code === 'HHHH' }"
        @click="selectedCode = t.code; showDimDetail = false"
      >{{ t.code }}</button>
    </div>

    <!-- ── 三列主体 ── -->
    <div class="pv__body">

      <!-- ── 左列 ── -->
      <div class="pv__col pv__col--left">
        <div class="pv__col-tabs">
          <button :class="['pv__col-tab', { 'is-active': leftTab === 'info' }]" @click="leftTab = 'info'">对照信息</button>
          <button :class="['pv__col-tab', { 'is-active': leftTab === 'questions' }]" @click="leftTab = 'questions'">题目对比</button>
        </div>

        <!-- 对照信息 Tab -->
        <div v-if="leftTab === 'info'" class="pv__info">

          <!-- MBTI 卡片 -->
          <div class="pv__card">
            <div class="pv__card-title">MBTI 底层</div>
            <template v-if="mbtiType">
              <div class="pv__mbti-badge" :style="{ background: mbtiType.color }">{{ mapping.mbti }} · {{ mbtiType.cn }}</div>
              <div class="pv__mbti-group">{{ mbtiType.group }}</div>
              <ul class="pv__traits"><li v-for="tr in mbtiType.traits" :key="tr">{{ tr }}</li></ul>
            </template>
            <div v-else class="pv__no-data">无 MBTI 对应（特殊类型）</div>
          </div>

          <!-- SBTI 卡片 -->
          <div class="pv__card">
            <div class="pv__card-title">SBTI 原版对照</div>
            <template v-if="sbtiType">
              <div class="pv__editable-row">
                <span class="pv__sbti-code">{{ sbtiType.code }} ·&nbsp;</span>
                <!-- 可编辑：SBTI 类型中文名 -->
                <template v-if="editingKey === editKey('types', sbtiType.code, 'cn')">
                  <input
                    v-model="editDraft" class="ef-input" autofocus
                    @keydown="e => handleKeydown(e, 'types', sbtiType.code, 'cn')"
                    @blur="commitEdit('types', sbtiType.code, 'cn')"
                  />
                </template>
                <template v-else>
                  <span class="pv__sbti-cn">{{ sbtiType.cn }}</span>
                  <button class="ef-btn ef-edit" title="编辑名称" @click="startEdit('types', sbtiType.code, 'cn', sbtiType.cn)">✏</button>
                  <button v-if="editMeta[editKey('types', sbtiType.code, 'cn')]?.prevValue !== undefined"
                    class="ef-btn ef-revert" title="撤回上次保存"
                    @click="revertField('types', sbtiType.code, 'cn')">↩</button>
                  <span v-if="editMeta[editKey('types', sbtiType.code, 'cn')]?.saving" class="ef-hint">保存中…</span>
                  <span v-else-if="editMeta[editKey('types', sbtiType.code, 'cn')]?.saved" class="ef-ok">✓</span>
                  <span v-else-if="editMeta[editKey('types', sbtiType.code, 'cn')]?.error" class="ef-err" :title="editMeta[editKey('types', sbtiType.code, 'cn')].error">✗</span>
                </template>
              </div>
              <div class="pv__pattern-label">SBTI Pattern（S/E/A/Ac/So）：</div>
              <div class="pv__pattern-str">{{ formatPattern(sbtiType.pattern) }}</div>
            </template>
            <div v-else class="pv__no-data">无 SBTI pattern</div>
          </div>

          <!-- DHTI 卡片 -->
          <div class="pv__card">
            <div class="pv__card-title">DHTI 本项目</div>
            <div class="pv__sbti-code">{{ selectedType?.code }} · {{ selectedType?.cn }}</div>
            <div class="pv__pattern-label">DHTI Pattern（N/C/R/A/S）：</div>
            <div class="pv__pattern-str">{{ formatPattern(selectedType?.pattern) }}</div>
          </div>

          <!-- Pattern 逐位对比 -->
          <div class="pv__card">
            <div class="pv__card-title">Pattern 逐维对比</div>
            <div class="pv__pattern-grid">
              <div class="pv__pg-row pv__pg-header">
                <span>维度</span><span>SBTI</span><span>DHTI</span><span>一致</span>
              </div>
              <div v-for="row in patternComparison" :key="row.dim"
                class="pv__pg-row" :class="{ 'is-mismatch': row.match === false }">
                <span class="pv__pg-dim">{{ row.dim }}<small>{{ row.shortName }}</small></span>
                <span class="pv__pg-level" :style="{ color: LEVEL_COLOR[row.sbti] }">{{ row.sbti }}</span>
                <span class="pv__pg-level" :style="{ color: LEVEL_COLOR[row.dhti] }">{{ row.dhti }}</span>
                <span>{{ row.match === null ? '—' : row.match ? '✓' : '✗' }}</span>
              </div>
            </div>
          </div>

          <!-- SBTI 等级分布 -->
          <div v-if="sbtiType?.pattern" class="pv__card">
            <div class="pv__card-title">SBTI 等级分布</div>
            <div class="pv__level-grid">
              <div v-for="dim in dimOrder" :key="dim" class="pv__lg-item">
                <span class="pv__lg-dim">{{ dim }}</span>
                <span class="pv__lg-badge" :style="{ background: LEVEL_COLOR[sbtiMockLevels[dim]] }">{{ sbtiMockLevels[dim] }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 题目对比 Tab -->
        <div v-else class="pv__questions">
          <div v-for="group in sbtiQuestionsByModel" :key="group.sbtiModel" class="pv__qgroup">
            <div class="pv__qgroup-title">
              <span class="pv__qg-sbti">{{ group.sbtiModel }}</span>
              <span class="pv__qg-arrow">→</span>
              <span class="pv__qg-dhti">{{ group.dhtiModel }}</span>
            </div>
            <div v-for="row in group.rows" :key="row.sbtiDim" class="pv__qdim">
              <div class="pv__qdim-header">
                <span>{{ row.sbtiDim }} {{ row.sbtiName }}</span>
                <span class="pv__qdim-arrow">↔</span>
                <span>{{ row.dhtiDim }} {{ row.dhtiName }}</span>
              </div>
              <div v-for="(sq, idx) in row.sbtiQs" :key="sq.id" class="pv__qpair">
                <!-- SBTI 题目（可编辑） -->
                <div class="pv__q pv__q--sbti">
                  <span class="pv__q-tag">SBTI</span>
                  <span class="pv__q-body">
                    <template v-if="editingKey === editKey('questions', sq.id, 'text')">
                      <textarea
                        v-model="editDraft" class="ef-input ef-textarea" rows="2" autofocus
                        @keydown="e => handleKeydown(e, 'questions', sq.id, 'text')"
                        @blur="commitEdit('questions', sq.id, 'text')"
                      />
                    </template>
                    <template v-else>
                      <span>{{ sq.text }}</span>
                      <button class="ef-btn ef-edit" title="编辑题目" @click="startEdit('questions', sq.id, 'text', sq.text)">✏</button>
                      <button v-if="editMeta[editKey('questions', sq.id, 'text')]?.prevValue !== undefined"
                        class="ef-btn ef-revert" title="撤回上次保存"
                        @click="revertField('questions', sq.id, 'text')">↩</button>
                      <span v-if="editMeta[editKey('questions', sq.id, 'text')]?.saving" class="ef-hint">保存中…</span>
                      <span v-else-if="editMeta[editKey('questions', sq.id, 'text')]?.saved" class="ef-ok">✓</span>
                      <span v-else-if="editMeta[editKey('questions', sq.id, 'text')]?.error" class="ef-err" :title="editMeta[editKey('questions', sq.id, 'text')].error">✗</span>
                    </template>
                  </span>
                </div>
                <!-- DHTI 题目（只读） -->
                <div v-if="row.dhtiQs[idx]" class="pv__q pv__q--dhti">
                  <span class="pv__q-tag">DHTI</span>
                  <span>{{ row.dhtiQs[idx].text }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── 右列：DHTI 结果预览 ── -->
      <div class="pv__col pv__col--right">
        <div class="pv__col-title">DHTI 结果预览</div>
        <template v-if="mockResult">
          <div v-if="mockResult.mode === 'rage'" class="pv__rage-banner">🚨 隐藏人格已激活 — RAGE 路怒者</div>
          <div v-if="mockResult.mode === 'fallback'" class="pv__fallback-banner">⚠️ 兜底类型 — 相似度过低</div>
          <div class="pv__result-hero">
            <img :src="`/types/${mockResult.primary.code}.png`" :alt="mockResult.primary.cn"
              class="pv__avatar" @error="e => { e.target.src = '/types/placeholder.png' }" />
            <div class="pv__result-sim">{{ mockResult.primary.similarity }}% 匹配</div>
            <div class="pv__result-code">{{ mockResult.primary.code }}</div>
            <div class="pv__result-cn">{{ mockResult.primary.cn }}</div>
            <div class="pv__result-intro">{{ mockResult.primary.intro }}</div>
            <div class="pv__tags">
              <span v-for="tag in mockResult.primary.tags" :key="tag" class="pv__tag">{{ tag }}</span>
            </div>
          </div>
          <div v-if="mockResult.secondary" class="pv__secondary">
            你也有 <strong>{{ mockResult.secondary.similarity }}%</strong> 的
            <strong>{{ mockResult.secondary.code }} · {{ mockResult.secondary.cn }}</strong> 特质
          </div>
          <div class="pv__section">
            <div class="pv__section-label">人格描述</div>
            <p class="pv__desc">{{ mockResult.primary.desc }}</p>
          </div>
          <div class="pv__section">
            <div class="pv__section-label">出行人格维度</div>
            <RadarChart :levels="mockResult.levels" :dim-order="mockResult.dimOrder" :dim-defs="mockResult.dimDefs" />
          </div>
          <div class="pv__section">
            <div class="pv__section-label">最接近的人格</div>
            <Top5List :rankings="mockResult.rankings" :top-n="5" />
          </div>
          <div class="pv__section">
            <button class="pv__toggle" @click="showDimDetail = !showDimDetail">
              <span class="pv__section-label" style="margin-bottom:0">15 维度详情</span>
              <span>{{ showDimDetail ? '▲' : '▼' }}</span>
            </button>
            <div v-if="showDimDetail">
              <DimDetail :levels="mockResult.levels" :dim-order="mockResult.dimOrder" :dim-defs="mockResult.dimDefs" />
            </div>
          </div>
          <p class="pv__footnote">仅供娱乐，请勿用于严肃场景</p>
        </template>
      </div>

    </div>
  </div>
</template>

<style scoped>
.pv {
  font-family: -apple-system, 'PingFang SC', sans-serif;
  font-size: 13px;
  background: #f2f2f7;
  min-height: 100vh;
  color: #1c1c1e;
}

/* ── 顶部标题 ── */
.pv__header {
  background: #1c1c1e;
  color: #ffe066;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.pv__header-actions { display: flex; align-items: center; gap: 10px; }
.pv__restore-btn {
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,224,102,0.4);
  color: #ffe066;
  padding: 3px 10px; border-radius: 6px;
  font-size: 11px; font-weight: 600;
  cursor: pointer; transition: background 0.15s;
}
.pv__restore-btn:hover { background: rgba(255,255,255,0.25); }
.pv__restore-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.pv__restore-msg { font-size: 11px; color: #34C759; font-weight: 600; }
.pv__restore-msg.is-error { color: #FF3B30; }

/* ── Chip 栏 ── */
.pv__chips {
  background: #fff;
  border-bottom: 1px solid #e5e5ea;
  padding: 10px 16px;
  display: flex; flex-wrap: wrap; gap: 6px; align-items: center;
  position: sticky; top: 0; z-index: 10;
}
.pv__chips-label { font-size: 11px; color: #8e8e93; font-weight: 600; }
.pv__chips-sep { color: #c7c7cc; margin: 0 2px; }
.pv__chip {
  padding: 3px 10px; border-radius: 12px;
  border: 1px solid #d1d1d6; background: #fff;
  font-size: 12px; font-weight: 600;
  cursor: pointer; transition: all 0.15s; color: #1c1c1e;
}
.pv__chip:hover { background: #f2f2f7; }
.pv__chip.is-active { background: #1c1c1e; color: #fff; border-color: #1c1c1e; }
.pv__chip--special.is-rage { border-color: #FF3B30; color: #FF3B30; }
.pv__chip--special.is-fallback { border-color: #8e8e93; color: #8e8e93; }
.pv__chip--special.is-rage.is-active { background: #FF3B30; border-color: #FF3B30; color: #fff; }
.pv__chip--special.is-fallback.is-active { background: #8e8e93; border-color: #8e8e93; color: #fff; }

/* ── 三列主体 ── */
.pv__body {
  display: grid;
  grid-template-columns: 500px 1fr;
  height: calc(100vh - 80px);
}
.pv__col { overflow-y: auto; border-right: 1px solid #e5e5ea; }
.pv__col--right { border-right: none; padding: 16px; }

/* ── 左列 Tabs ── */
.pv__col-tabs {
  display: flex; border-bottom: 1px solid #e5e5ea;
  background: #fff; position: sticky; top: 0; z-index: 5;
}
.pv__col-tab {
  flex: 1; padding: 8px; border: none; background: none;
  font-size: 12px; font-weight: 500; cursor: pointer;
  color: #8e8e93; border-bottom: 2px solid transparent;
}
.pv__col-tab.is-active { color: #007AFF; border-bottom-color: #007AFF; }

/* ── 对照信息面板 ── */
.pv__info { padding: 12px; display: flex; flex-direction: column; gap: 10px; }
.pv__card {
  background: #fff; border-radius: 10px;
  padding: 12px; border: 1px solid #e5e5ea;
}
.pv__card-title {
  font-size: 10px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.08em;
  color: #8e8e93; margin-bottom: 8px;
}
.pv__mbti-badge {
  display: inline-block; padding: 3px 10px; border-radius: 12px;
  color: #fff; font-size: 13px; font-weight: 700; margin-bottom: 4px;
}
.pv__mbti-group { font-size: 11px; color: #8e8e93; margin-bottom: 6px; }
.pv__traits { margin: 0; padding-left: 16px; }
.pv__traits li { font-size: 12px; line-height: 1.8; color: #3c3c43; }
.pv__no-data { font-size: 12px; color: #8e8e93; font-style: italic; }

.pv__editable-row { display: flex; align-items: center; flex-wrap: wrap; gap: 4px; margin-bottom: 6px; }
.pv__sbti-code { font-size: 14px; font-weight: 700; }
.pv__sbti-cn { font-size: 14px; font-weight: 700; }
.pv__pattern-label { font-size: 11px; color: #8e8e93; margin-bottom: 3px; }
.pv__pattern-str {
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 12px; color: #007AFF;
  background: #f2f2f7; padding: 4px 8px;
  border-radius: 6px; word-break: break-all;
}

/* Pattern 逐位对比 */
.pv__pattern-grid { font-size: 12px; }
.pv__pg-row {
  display: grid; grid-template-columns: 90px 36px 36px 36px;
  padding: 3px 0; border-bottom: 1px solid #f2f2f7;
  gap: 4px; align-items: center;
}
.pv__pg-header { font-weight: 700; color: #8e8e93; font-size: 11px; }
.pv__pg-row.is-mismatch { background: #fff5f5; border-radius: 4px; }
.pv__pg-dim { display: flex; flex-direction: column; }
.pv__pg-dim small { font-size: 10px; color: #8e8e93; }
.pv__pg-level { font-weight: 700; font-size: 13px; }

/* 等级分布 */
.pv__level-grid { display: flex; flex-wrap: wrap; gap: 4px; }
.pv__lg-item { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.pv__lg-dim { font-size: 10px; color: #8e8e93; }
.pv__lg-badge {
  width: 24px; height: 20px; border-radius: 4px;
  color: #fff; font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}

/* ── 题目对比 Tab ── */
.pv__questions { padding: 12px; display: flex; flex-direction: column; gap: 12px; }
.pv__qgroup-title {
  display: flex; align-items: center; gap: 4px;
  font-size: 11px; font-weight: 700;
  padding: 6px 0 4px; border-bottom: 1px solid #e5e5ea; margin-bottom: 6px;
}
.pv__qg-sbti { color: #007AFF; }
.pv__qg-arrow { color: #8e8e93; }
.pv__qg-dhti { color: #34C759; }
.pv__qdim { margin-bottom: 8px; }
.pv__qdim-header {
  font-size: 11px; color: #8e8e93;
  display: flex; gap: 4px; align-items: center;
  margin-bottom: 4px; font-weight: 600;
}
.pv__qdim-arrow { color: #c7c7cc; }
.pv__qpair { display: flex; flex-direction: column; gap: 3px; margin-bottom: 6px; }
.pv__q {
  font-size: 11px; line-height: 1.5;
  padding: 5px 8px; border-radius: 6px;
  display: flex; gap: 4px; align-items: flex-start;
}
.pv__q--sbti { background: #EFF6FF; }
.pv__q--dhti { background: #F0FDF4; }
.pv__q-tag {
  font-size: 9px; font-weight: 700;
  padding: 1px 4px; border-radius: 3px;
  flex-shrink: 0; height: fit-content; margin-top: 1px;
}
.pv__q--sbti .pv__q-tag { background: #007AFF; color: #fff; }
.pv__q--dhti .pv__q-tag { background: #34C759; color: #fff; }
.pv__q-body { display: flex; flex-wrap: wrap; align-items: flex-start; gap: 4px; flex: 1; }

/* ── 内联编辑元素 ── */
.ef-input {
  border: 1px solid #007AFF; border-radius: 5px;
  padding: 2px 6px; font-size: 12px; outline: none;
  background: #fff; color: #1c1c1e;
  font-family: -apple-system, 'PingFang SC', sans-serif;
  min-width: 120px; flex: 1;
}
.ef-textarea { width: 100%; resize: vertical; min-height: 44px; line-height: 1.6; }
.ef-btn {
  font-size: 10px; padding: 1px 4px;
  border-radius: 4px; border: 1px solid #d1d1d6;
  background: #fff; cursor: pointer; flex-shrink: 0;
}
.ef-edit { color: #007AFF; border-color: rgba(0,122,255,0.4); }
.ef-edit:hover { background: #EFF6FF; }
.ef-revert { color: #FF9500; border-color: rgba(255,149,0,0.4); }
.ef-revert:hover { background: #FFF9EB; }
.ef-ok { font-size: 10px; color: #34C759; font-weight: 700; }
.ef-err { font-size: 10px; color: #FF3B30; font-weight: 700; cursor: help; }
.ef-hint { font-size: 10px; color: #8e8e93; }

/* ── 右列：结果预览 ── */
.pv__col-title {
  font-size: 10px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.08em;
  color: #8e8e93; margin-bottom: 12px;
}
.pv__rage-banner {
  background: #FF3B30; color: #fff; padding: 8px 12px;
  border-radius: 8px; font-weight: 600; font-size: 13px; margin-bottom: 12px;
}
.pv__fallback-banner {
  background: #8e8e93; color: #fff; padding: 8px 12px;
  border-radius: 8px; font-weight: 600; font-size: 13px; margin-bottom: 12px;
}
.pv__result-hero {
  background: #1c1c1e; border-radius: 12px;
  padding: 24px; text-align: center; margin-bottom: 12px;
}
.pv__avatar {
  width: 100px; height: 100px; border-radius: 50%;
  object-fit: cover; background: #2c2c2e; margin-bottom: 12px;
}
.pv__result-sim { color: #007AFF; font-weight: 700; font-size: 14px; margin-bottom: 4px; }
.pv__result-code { color: #fff; font-size: 36px; font-weight: 700; letter-spacing: 2px; margin-bottom: 4px; }
.pv__result-cn { color: #fff; font-size: 18px; margin-bottom: 6px; }
.pv__result-intro { color: rgba(255,255,255,0.6); font-size: 13px; margin-bottom: 10px; }
.pv__tags { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; }
.pv__tag {
  border: 1px solid rgba(255,255,255,0.3);
  color: rgba(255,255,255,0.7);
  padding: 2px 8px; border-radius: 12px; font-size: 11px;
}
.pv__secondary {
  background: #fff; border: 1px solid #e5e5ea;
  border-radius: 10px; padding: 10px 14px;
  font-size: 13px; color: #3c3c43; margin-bottom: 12px;
}
.pv__section {
  background: #fff; border-radius: 10px;
  padding: 14px; margin-bottom: 8px; border: 1px solid #e5e5ea;
}
.pv__section-label {
  font-size: 10px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.08em;
  color: #8e8e93; margin-bottom: 10px;
}
.pv__desc { font-size: 13px; line-height: 1.8; color: #1c1c1e; }
.pv__toggle {
  width: 100%; background: none; border: none;
  cursor: pointer; display: flex; justify-content: space-between; align-items: center; padding: 0;
}
.pv__footnote { font-size: 11px; color: #8e8e93; text-align: center; margin-top: 12px; }
</style>
