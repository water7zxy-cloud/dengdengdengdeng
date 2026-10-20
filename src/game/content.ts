import type { RoleId, SceneId } from './rules'

export interface RoleDefinition {
  id: RoleId
  title: string
  scene: SceneId
  sceneLabel: string
  ability: string
  image: string
}

export const roles: RoleDefinition[] = [
  { id: '静静', title: '纪律委员', scene: 'classroom', sceneLabel: '教室', ability: '到达教室后，可以再掷一次骰子。', image: '/assets/characters/静静.png' },
  { id: '跳跳姐姐', title: '体育老师', scene: 'playground', sceneLabel: '操场', ability: '到达操场后，额外完成一张互动卡。', image: '/assets/characters/跳跳姐姐.png' },
  { id: '稻草人', title: '田间守望者', scene: 'field', sceneLabel: '田野', ability: '到达田野后，保护下一位抽到黑卡的玩家。', image: '/assets/characters/稻草人.png' },
  { id: '好好老师', title: '班主任', scene: 'office', sceneLabel: '办公室', ability: '到达办公室后，额外回答一张问题卡。', image: '/assets/characters/好好老师.png' },
  { id: '糖果叔叔', title: '小卖铺老板', scene: 'shop', sceneLabel: '小卖铺', ability: '到达小卖铺后，返程每回合可额外前进 1 或 2 格。', image: '/assets/characters/糖果叔叔.png' },
  { id: '留灯人', title: '家人', scene: 'home', sceneLabel: 'Home 家', ability: '仅去程开始时，可从夜灯区任选合法格出发。', image: '/assets/characters/留灯人.png' },
]

export const assetPath = {
  questionBack: '/assets/question-cards/问题卡背面（5.7cmX8.8cm）.jpg',
  interactionBack: '/assets/interaction-cards/互动背面（5.7cmX8.8cm）.jpg',
  dengdengBack: '/assets/dengdeng-cards/dengdeng卡背面（4cmX6cm）.jpg',
  question: (id: number) => `/assets/question-cards/问题内容另一面/${id}.jpg`,
  interaction: (id: number) => `/assets/interaction-cards/互动卡内容/${id}.jpg`,
  black: (id: number) => `/assets/dengdeng-cards/黑卡内容/${id}.jpg`,
  red: (id: number) => `/assets/dengdeng-cards/红卡内容/${id}.jpg`,
}

export const blackLumens = [1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5]
export const redLumens = [1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5]

export interface QuestionDefinition {
  id: number
  prompt: string
  choices: Record<string, string>
  answers: string[]
}

const choice = (a: string, b: string, c: string, d: string) => ({ A: a, B: b, C: c, D: d })

export const questionCards: QuestionDefinition[] = [
  { id: 1, prompt: '同学反复叫小雨不喜欢的外号，这是？', choices: choice('只是玩笑', '语言伤害，需要停止', '让她习惯', '她太敏感'), answers: ['B'] },
  { id: 2, prompt: '“是朋友就每天带零食”更像是？', choices: choice('普通分享', '友好邀请', '财物胁迫', '小事'), answers: ['C'] },
  { id: 3, prompt: '有人拽头发还说闹着玩，首先可以？', choices: choice('拽回去', '围着笑', '忍着', '说不要、离开并告诉大人'), answers: ['D'] },
  { id: 4, prompt: '“谁和小明玩，我们就不和谁玩”属于？', choices: choice('社交孤立', '自由选择', '班级游戏', '没关系'), answers: ['A'] },
  { id: 5, prompt: '故意拉开同学凳子是？', choices: choice('好玩恶作剧', '可能造成伤害的不安全行为', '体育游戏', '道歉就没事'), answers: ['B'] },
  { id: 6, prompt: '听到老师让大家排斥同学，更合适做法是？', choices: choice('跟着排斥', '认为正常', '传给更多人', '找另一位可信大人'), answers: ['D'] },
  { id: 7, prompt: '有人说身体玩笑或想碰不愿碰的地方，应？', choices: choice('怕尴尬答应', '熟人没关系', '说停、离开并告诉可信大人', '永远保密'), answers: ['C'] },
  { id: 8, prompt: '两位同学为规则争论后重新定规则，更像？', choices: choice('一定霸凌', '普通冲突，可沟通', '必须报复', '声音大就对'), answers: ['B'] },
  { id: 9, prompt: '同一种不舒服的事反复发生，最重要的是？', choices: choice('告诉可信大人并说清经过', '一个人忍着', '严重报复', '假装没事'), answers: ['A'] },
  { id: 10, prompt: '孩子向大人讲被欺负的事，意味着？', choices: choice('故意告状', '很软弱', '保护自己并给大人帮助机会', '应自己解决'), answers: ['C'] },
  { id: 11, prompt: '哪些行为可能伤害同学？', choices: choice('反复起侮辱外号', '推搡、拽头发、绊倒', '强迫送零食文具', '要求排斥某人'), answers: ['A', 'B', 'C', 'D'] },
  { id: 12, prompt: '哪些话是在清楚表达边界？', choices: choice('请不要碰我的东西', '我不喜欢你这样叫我', '我现在不想说话', '我也要欺负你'), answers: ['A', 'B', 'C'] },
  { id: 13, prompt: '看到别人被欺负时，可以怎么做？', choices: choice('冲上去打架', '保证安全下陪同学离开', '告诉可信大人', '不围观不起哄'), answers: ['B', 'C', 'D'] },
  { id: 14, prompt: '哪些情况不能被要求保密？', choices: choice('害怕的秘密', '受伤后被威胁', '准备礼物', '让身体不舒服的事'), answers: ['A', 'B', 'D'] },
  { id: 15, prompt: '怎样尊重别人的边界？', choices: choice('借东西先问', '关系好可替对方决定', '不随便摸拿拍人和物', '对方说不后停止'), answers: ['A', 'C', 'D'] },
  { id: 16, prompt: '大人听到孩子说学校不舒服，哪些回应更有帮助？', choices: choice('谢谢你告诉我', '一起想办法', '了解时间地点安全', '立刻去报复'), answers: ['A', 'B', 'C'] },
  { id: 17, prompt: '哪些情况需要尽快找成人帮助？', choices: choice('对方人多感到害怕', '有人受伤或危险物品', '不舒服接触或强迫保密', '伤害反复发生'), answers: ['A', 'B', 'C', 'D'] },
  { id: 18, prompt: '小峰害怕去操场，可以选择哪两项？', choices: choice('找人打架', '不嘲笑也不逼他面对', '陪他找可信大人', '讲给全班'), answers: ['B', 'C'] },
  { id: 19, prompt: '有人传同学丑画，哪两项做法合适？', choices: choice('不传纸条不取笑', '再画一张', '贴黑板', '陪同学交给大人'), answers: ['A', 'D'] },
  { id: 20, prompt: '可信大人暂时没理解你，还可以怎么做？', choices: choice('再找一位可信大人', '请朋友陪同说明', '记下时间地点经过', '永远不求助'), answers: ['A', 'B', 'C'] },
]
