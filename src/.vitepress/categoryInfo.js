/**
 * 所有分类的集合，其中的键表示标签的名称，值是对应标签的详细信息。
 * [key]: 分类 URL 路径
 * name: 分类名称
 * cover: 指定标签的封面
 * des: 指定分类的详细描述
 */
export default {
  frontend: {
    name: '前端', // 包括桌面端和移动端
  },
  backend: {
    name: '后端', // 包括数据库、服务器运维等
  },
  pcnet: {
    name: '计算机基础与网络',
  },
  patalgo: {
    name: '设计模式与算法', // 包括数据结构
  },
  // graphics: {
  //   name: '图形学',
  // },
  av: {
    name: '音视频',
  },
  // ai: {
  //   name: '人工智能',
  // },
  freebie: {
    name: '开发工具',
  },
  other: {
    name: '其它',
  },
};
