// Mock 数据工厂 —— 生成模拟数据
// 使用延迟模拟真实接口请求

// ============ 用户数据 ============
const mockUsers = {
  admin: {
    token: 'mock-admin-token-' + Date.now(),
    roles: ['admin'],
    userInfo: {
      id: 1,
      username: 'admin',
      name: '张工',
      department: '信息中心',
      avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
      email: 'admin@industrial.com',
      phone: '138****8888'
    }
  },
  operator: {
    token: 'mock-operator-token-' + Date.now(),
    roles: ['operator'],
    userInfo: {
      id: 2,
      username: 'operator',
      name: '李操作',
      department: '生产一车间',
      avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
      email: 'operator@industrial.com',
      phone: '139****6666'
    }
  },
  viewer: {
    token: 'mock-viewer-token-' + Date.now(),
    roles: ['viewer'],
    userInfo: {
      id: 3,
      username: 'viewer',
      name: '王观察',
      department: '质检部',
      avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
      email: 'viewer@industrial.com',
      phone: '137****3333'
    }
  }
}

// ============ 设备数据 ============
const equipmentStatus = ['运行中', '待机', '维修中', '故障', '停机']
const equipmentTypes = ['数控车床', '注塑机', '冲压机', '焊接机器人', 'AGV小车', '检测仪']

function generateEquipment(count = 50) {
  const list = []
  for (let i = 1; i <= count; i++) {
    list.push({
      id: i,
      code: `EQ-${String(i).padStart(4, '0')}`, 
      name: `${equipmentTypes[i % equipmentTypes.length]}-${i}`,
      type: equipmentTypes[i % equipmentTypes.length],  
      status: equipmentStatus[i % equipmentStatus.length],
      workshop: `车间${Math.ceil(i / 15) % 4 + 1}`,
      location: `A区-${i % 20 + 1}号位`,
      purchaseDate: `202${i % 3}-${String((i % 12) + 1).padStart(2, '0')}-15`,
      lastMaintenance: `2024-0${(i % 9) + 1}-${String(i % 28 + 1).padStart(2, '0')}`,
      nextMaintenance: `2024-${(i % 3) + 9}-${String(i % 28 + 1).padStart(2, '0')}`,
      utilization: Math.floor(Math.random() * 40) + 60
    })
  }
  return list
}

// ============ 工单数据 ============
const workorderStatus = ['待分配', '进行中', '已完成', '已取消', '质检中']
const workorderPriority = ['高', '中', '低']
const productNames = ['电机外壳 A型', '轴承座 B型', '法兰盘 C型', '齿轮组件 D型', '支架 E型']

function generateWorkorders(count = 60) {
  const list = []
  for (let i = 1; i <= count; i++) {
    list.push({
      id: i,
      code: `WO-${new Date().getFullYear()}${String(i).padStart(5, '0')}`,
      productName: productNames[i % productNames.length],
      quantity: Math.floor(Math.random() * 500) + 50,
      completedQty: Math.floor(Math.random() * 400),
      status: workorderStatus[i % workorderStatus.length],
      priority: workorderPriority[i % workorderPriority.length],
      workshop: `车间${(i % 4) + 1}`,
      assignee: ['李操作', '张师傅', '王工', '刘主管'][i % 4],
      createdAt: `2024-0${(i % 9) + 1}-${String(i % 28 + 1).padStart(2, '0')} ${String(i % 24).padStart(2, '0')}:${String((i * 7) % 60).padStart(2, '0')}`,
      deadline: `2024-${(i % 3) + 9}-${String(i % 28 + 1).padStart(2, '0')}`
    })
  }
  return list
}

// ============ 质量检测数据 ============
const inspectionItems = ['尺寸精度', '表面粗糙度', '硬度测试', '密封性', '同轴度']
const inspectionResult = ['合格', '不合格', '待复检']

function generateInspections(count = 40) {
  const list = []
  for (let i = 1; i <= count; i++) {
    list.push({
      id: i,
      code: `QC-${String(i).padStart(5, '0')}`,
      productName: productNames[i % productNames.length],
      batchNo: `BATCH-2024-${String(i).padStart(3, '0')}`,
      inspectItem: inspectionItems[i % inspectionItems.length],
      result: inspectionResult[i % inspectionResult.length],
      value: (Math.random() * 10 + 20).toFixed(2),
      standard: '±0.05mm',
      inspector: ['赵质检', '钱检测', '孙检验'][i % 3],
      inspectDate: `2024-0${(i % 9) + 1}-${String(i % 28 + 1).padStart(2, '0')}`,
      remark: i % 7 === 0 ? '需重点关注，建议复查' : '正常'
    })
  }
  return list
}

// ============ 人员数据 ============
const departments = ['生产一车间', '生产二车间', '质检部', '设备部', '信息中心', '综合办']
const positions = ['车间主任', '操作工', '质检员', '维修工', '工程师', '管理员']

function generatePersonnel(count = 50) {
  const list = []
  const surnames = ['张', '李', '王', '刘', '陈', '杨', '赵', '黄', '周', '吴']
  const givenNames = ['伟', '芳', '娜', '敏', '静', '强', '磊', '军', '洋', '勇', '杰', '丽']
  for (let i = 1; i <= count; i++) {
    list.push({
      id: i,
      name: `${surnames[i % surnames.length]}${givenNames[i % givenNames.length]}`,
      gender: i % 2 === 0 ? '男' : '女',
      age: Math.floor(Math.random() * 30) + 25,
      phone: `1${['38', '39', '37', '36'][i % 4]}****${String(i).padStart(4, '0')}`,
      department: departments[i % departments.length],
      position: positions[i % positions.length],
      entryDate: `202${i % 3}-${String((i % 12) + 1).padStart(2, '0')}-01`,
      status: i % 10 === 0 ? '离职' : '在职'
    })
  }
  return list
}

// ============ 角色数据 ============
const mockRoles = [
  { id: 1, name: '系统管理员', code: 'admin', desc: '拥有全部权限，可管理用户、角色、系统配置', userCount: 3 },
  { id: 2, name: '操作员', code: 'operator', desc: '可操作设备、处理工单、查看质量数据', userCount: 12 },
  { id: 3, name: '观察员', code: 'viewer', desc: '只读权限，可查看数据看板和工单', userCount: 6 }
]

// ============ 操作日志 ============
function generateLogs(count = 30) {
  const actions = ['登录系统', '修改设备状态', '创建工单', '完成工单', '提交质检', '删除记录', '修改配置', '导出数据']
  const list = []
  for (let i = 1; i <= count; i++) {
    list.push({
      id: i,
      user: ['admin', 'operator', 'viewer'][i % 3],
      action: actions[i % actions.length],
      module: ['设备管理', '工单管理', '质量检测', '系统设置'][i % 4],
      ip: `192.168.1.${i}`,
      time: `2024-09-${String(i % 28 + 1).padStart(2, '0')} ${String(i % 24).padStart(2, '0')}:${String((i * 3) % 60).padStart(2, '0')}:${String((i * 7) % 60).padStart(2, '0')}`,
      result: i % 7 === 0 ? '失败' : '成功'
    })
  }
  return list
}

// ============ 看板统计数据 ============
function generateDashboardData() {
  // 7天产量趋势
  const days = []
  const now = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    days.push({
      date: `${d.getMonth() + 1}-${d.getDate()}`,
      output: Math.floor(Math.random() * 500) + 800,
      target: 1200,
      defect: Math.floor(Math.random() * 50) + 10
    })
  }

  return {
    // 概览卡片
    overview: {
      output: { value: 8654, unit: '件', trend: 12.5 },
      equipmentOnline: { value: 42, total: 50, trend: 2.1 },
      workorderActive: { value: 18, total: 60, trend: -3.2 },
      passRate: { value: 98.6, unit: '%', trend: 0.5 }
    },
    // 产量趋势
    productionTrend: days,
    // 设备状态分布
    equipmentStatus: [
      { name: '运行中', value: 32 },
      { name: '待机', value: 8 },
      { name: '维修中', value: 5 },
      { name: '故障', value: 3 },
      { name: '停机', value: 2 }
    ],
    // 车间产能对比
    workshopComparison: [
      { name: '一车间', output: 2400, target: 2500 },
      { name: '二车间', output: 2200, target: 2000 },
      { name: '三车间', output: 1800, target: 2000 },
      { name: '四车间', output: 2254, target: 2000 }
    ],
    // 实时告警
    alerts: [
      { level: 'danger', title: '设备 EQ-0003 故障停机', time: '3分钟前', workshop: '一车间' },
      { level: 'warning', title: '工单 WO-20240012 即将逾期', time: '15分钟前', workshop: '二车间' },
      { level: 'warning', title: '设备 EQ-0017 维护到期', time: '1小时前', workshop: '三车间' },
      { level: 'info', title: '质检批次 QC-00028 复检完成', time: '2小时前', workshop: '质检部' },
      { level: 'danger', title: '设备 EQ-0021 温度异常', time: '3小时前', workshop: '一车间' }
    ]
  }
}

// ============ 导出 Mock API ============
// 模拟网络延迟
function delay(data, ms = 300) {
  return new Promise(resolve => {
    setTimeout(() => resolve({ code: 200, data }), ms)
  })
}

export const mockApi = {
  // ===== 认证 =====
  login: (form) => {
    const user = mockUsers[form.username]
    if (!user || form.password !== '123456') {
      return Promise.resolve({ code: 400, message: '用户名或密码错误（密码统一为 123456）' })
    }
    // 存储当前登录用户名，用于后续 getUserInfo 查找
    localStorage.setItem('loginUser', form.username)
    return delay({
      token: user.token,
      roles: user.roles,
      username: form.username
    })
  },

  getUserInfo: () => {
    const username = localStorage.getItem('loginUser')
    const user = mockUsers[username]
    if (!user) {
      return Promise.resolve({ code: 401, message: '未登录' })
    }
    // 返回 userInfo + roles，确保路由守卫能拿到角色信息
    return delay({
      ...user.userInfo,
      roles: user.roles
    })
  },

  // ===== 看板 =====
  getDashboard: () => delay(generateDashboardData()),

  // ===== 设备 =====
  getEquipment: (params = {}) => {
    let list = generateEquipment(50)
    // 筛选
    if (params.status) list = list.filter(e => e.status === params.status)
    if (params.type) list = list.filter(e => e.type === params.type)
    if (params.keyword) list = list.filter(e => e.name.includes(params.keyword) || e.code.includes(params.keyword))
    const total = list.length
    const page = params.page || 1
    const pageSize = params.pageSize || 10
    list = list.slice((page - 1) * pageSize, page * pageSize)
    return delay({ list, total })
  },

  addEquipment: (data) => delay({ id: Date.now(), ...data }),
  updateEquipment: (data) => delay(data),
  deleteEquipment: (id) => delay({ id }),

  getMaintenance: (params = {}) => {
    const list = generateEquipment(20).map(e => ({
      id: e.id,
      equipmentName: e.name,
      equipmentCode: e.code,
      type: ['日常保养', '定期检修', '故障维修', '大修'][e.id % 4],
      maintainer: ['赵维修', '钱工', '孙师傅'][e.id % 3],
      startDate: e.lastMaintenance,
      endDate: `2024-0${(e.id % 9) + 1}-${(e.id % 20) + 20}`,
      cost: Math.floor(Math.random() * 5000) + 500,
      status: ['已完成', '进行中', '待开始'][e.id % 3],
      remark: e.id % 3 === 0 ? '需更换零部件' : '正常维护'
    }))
    const total = list.length
    const page = params.page || 1
    const pageSize = params.pageSize || 10
    const data = list.slice((page - 1) * pageSize, page * pageSize)
    return delay({ list: data, total })
  },

  // ===== 工单 =====
  getWorkorders: (params = {}) => {
    let list = generateWorkorders(60)
    if (params.status) list = list.filter(w => w.status === params.status)
    if (params.priority) list = list.filter(w => w.priority === params.priority)
    if (params.keyword) list = list.filter(w => w.productName.includes(params.keyword) || w.code.includes(params.keyword))
    const total = list.length
    const page = params.page || 1
    const pageSize = params.pageSize || 10
    list = list.slice((page - 1) * pageSize, page * pageSize)
    return delay({ list, total })
  },

  addWorkorder: (data) => delay({ id: Date.now(), code: `WO-${Date.now()}`, ...data }),
  updateWorkorder: (data) => delay(data),
  deleteWorkorder: (id) => delay({ id }),

  // ===== 质量检测 =====
  getInspections: (params = {}) => {
    let list = generateInspections(40)
    if (params.result) list = list.filter(q => q.result === params.result)
    if (params.keyword) list = list.filter(q => q.productName.includes(params.keyword) || q.code.includes(params.keyword))
    const total = list.length
    const page = params.page || 1
    const pageSize = params.pageSize || 10
    list = list.slice((page - 1) * pageSize, page * pageSize)
    return delay({ list, total })
  },

  // 质量统计
  getQualityStats: () => delay({
    passRate: 98.6,
    failRate: 1.4,
    totalInspections: 1240,
    totalDefects: 17,
    trend: [
      { date: '9-16', pass: 98.2, fail: 1.8 },
      { date: '9-17', pass: 98.8, fail: 1.2 },
      { date: '9-18', pass: 97.5, fail: 2.5 },
      { date: '9-19', pass: 99.1, fail: 0.9 },
      { date: '9-20', pass: 98.6, fail: 1.4 },
      { date: '9-21', pass: 98.9, fail: 1.1 },
      { date: '9-22', pass: 99.0, fail: 1.0 }
    ],
    defectTypes: [
      { name: '尺寸超差', value: 8 },
      { name: '表面划痕', value: 4 },
      { name: '硬度不足', value: 3 },
      { name: '密封不良', value: 2 }
    ]
  }),

  // ===== 人员 =====
  getPersonnel: (params = {}) => {
    let list = generatePersonnel(50)
    if (params.department) list = list.filter(p => p.department === params.department)
    if (params.keyword) list = list.filter(p => p.name.includes(params.keyword))
    const total = list.length
    const page = params.page || 1
    const pageSize = params.pageSize || 10
    list = list.slice((page - 1) * pageSize, page * pageSize)
    return delay({ list, total })
  },

  addPersonnel: (data) => delay({ id: Date.now(), ...data }),
  updatePersonnel: (data) => delay(data),
  deletePersonnel: (id) => delay({ id }),

  // ===== 角色 =====
  getRoles: () => delay(mockRoles),
  addRole: (data) => delay({ id: Date.now(), ...data, userCount: 0 }),
  updateRole: (data) => delay(data),
  deleteRole: (id) => delay({ id }),

  // ===== 操作日志 =====
  getLogs: (params = {}) => {
    let list = generateLogs(30)
    if (params.keyword) list = list.filter(l => l.user.includes(params.keyword) || l.action.includes(params.keyword))
    const total = list.length
    const page = params.page || 1
    const pageSize = params.pageSize || 10
    list = list.slice((page - 1) * pageSize, page * pageSize)
    return delay({ list, total })
  }
}
