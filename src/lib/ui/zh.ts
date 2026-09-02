import type { UiStrings } from "./en";

export const zh = {
  meta: {
    tagline: "一家雪人写下的温暖人生课。",
    motto:
      "我们是雪人，但我们的方式是温的。❄️❤️ 心大，毛厚，气顺。",
    description:
      "The Yeti Ways 是雪人爸爸、雪人妈妈和雪人小巴布一起写的家庭博客——关于家庭、伴侣、育儿和成长的温暖而坦白的故事，每一篇都从我们频道上的一支视频长出来。",
  },

  nav: {
    home: "首页",
    stories: "故事",
    family: "这一家人",
    about: "关于",
    contact: "联系我们",
    search: "搜索",
  },

  common: {
    readStories: "读故事",
    meetTheFamily: "认识这一家人",
    allStories: "全部故事",
    backHome: "回首页",
    skipToContent: "跳到正文",
    primaryNav: "主导航",
    mobileNav: "移动端导航",
    categoriesNav: "故事分类",
    paginationNav: "故事分页",
    toggleTheme: "切换深色模式",
    openMenu: "打开菜单",
    closeMenu: "关闭菜单",
    searchStories: "搜索故事",
    searchHint: "搜索故事（按 /）",
    language: "语言",
    chooseLanguage: "选择语言",
    featured: "精选",
    featuredStory: "精选故事",
    all: "全部",
    newer: "更新",
    older: "更早",
    page: "第",
    noStoriesYet: "这里还没有故事，过阵子再来看看。❄️",
    story: "篇故事",
    storiesFew: "篇故事",
    stories: "篇故事",
  },

  home: {
    latestStories: "最新故事",
    meetTheFamilyIntro:
      "这里的每个故事都不止一个讲述者——大人和孩子，从不同的高度过了同一天。同一个火塘，雪地上不同的脚印。",
    findYourTrail: "找到你的那条路",
    findYourTrailIntro: "按你此刻正在走的那段路来看。",
  },

  stories: {
    title: "故事",
    intro:
      "关于家庭、伴侣、育儿和成长的温暖而坦白的记录——每一篇都从我们频道上的一支视频长出来。",
    description:
      "The Yeti Ways 的全部故事——关于家庭、伴侣、育儿和成长的温暖而坦白的记录，每一篇都从一支视频长出来。",
    /** e.g. "（第 2 页，共 3 页）" */
    pageSuffix: "（第 {current} 页，共 {total} 页）",
  },

  post: {
    updated: "更新于",
    watchOn: "在此观看：",
    related: "更多温暖的走法",
    playVideo: "播放视频：{title}",
    breadcrumbHome: "首页",
    breadcrumbStories: "故事",
  },

  category: {
    eyebrow: "分类",
    labels: {
      Family: "家庭",
      Relationships: "伴侣",
      Parenting: "育儿",
      "Growing Up": "成长",
      "Life Lessons": "人生课",
    },
    slugs: {
      Family: "family",
      Relationships: "relationships",
      Parenting: "parenting",
      "Growing Up": "growing-up",
      "Life Lessons": "life-lessons",
    },
    blurbs: {
      Family:
        "住在一起的日常——家务、作息，还有那些把一个山洞撑住的小仪式。",
      Relationships:
        "风刮起来的时候，也要和你爱的人待在暖处。",
      Parenting:
        "养小巴布的路上我们学到的东西，通常是硬碰硬、诚实地学到的。",
      "Growing Up":
        "小巴布讲新学校、新朋友，以及慢慢弄明白自己是谁。",
      "Life Lessons":
        "更大的那些事——改变、勇气、耐心——它们真正出现时的样子。",
    },
  },

  authors: {
    title: "雪人一家",
    description:
      "雪人爸爸、雪人妈妈和小巴布——The Yeti Ways 背后的三个声音。",
    intro:
      "我们三个，一个山洞。同样的日子，我们从不同的高度写下来——因为一家人一起学会的道理，才是真正留得住的那种。",
    profileDescription: "The Yeti Ways 的{name}——{tagline}",
    storiesFrom: "{name}写的故事",
    noStoriesFrom: "{name}还没写故事，很快就有了。❄️",
  },

  search: {
    title: "搜索",
    description:
      "按标题、标签、分类，或按是哪只雪人写的，搜索 The Yeti Ways 的每一个故事。",
    intro: "按标题、标签、分类，或按是哪只雪人写的来找故事。",
    placeholder: "试试「止鼾」「雪人妈妈」或「伴侣」",
    submit: "搜索",
    loading: "正在载入故事…",
    latest: "最新故事",
    noJs: "搜索需要浏览器里的 JavaScript。你仍然可以",
    noJsLink: "浏览全部故事",
    noJsTail: "或者从下面挑一个分类。",
    orBrowse: "或者按分类浏览",
    noMatch: "没有故事匹配「{query}」。",
    noMatchBody:
      "试试单个词、下面的某个分类，或者一只雪人的名字。你也可以",
    browseAll: "读全部故事",
    matchOne: "1 篇故事匹配「{query}」。",
    matchMany: "{count} 篇故事匹配「{query}」。",
    matchTrimmed:
      "{count} 篇故事匹配「{query}」——显示最接近的 {shown} 篇。",
    indexError: "搜索现在载入不了。",
    indexErrorBody: "抓取故事索引时出了点问题。",
    indexErrorLink: "浏览全部故事",
  },

  cta: {
    heading: "关注这群雪人",
    text: "新故事先落在我们的频道上。来打个招呼吧——火边给你留了个暖位子。",
    aboutHeading: "一起走吧",
    aboutText: "新故事我们先发在频道上。关注我们，记得带条毯子。",
  },

  notFound: {
    title: "页面找不到",
    description: "这条路凉了。",
    heading: "这条路凉了",
    body: "我们找不到你要的页面。脚印到这里就断了——不过窝里还烧着一堆暖火。",
  },

  footer: {
    explore: "逛逛",
    family: "这一家人",
    follow: "关注",
    more: "更多",
    privacy: "隐私政策",
    terms: "使用条款",
    rss: "RSS 订阅",
    rights: "心大，毛厚，气顺。",
  },

  about: {
    title: "关于",
    heading: "关于 The Yeti Ways",
    paragraphs: [
      "我们是一家雪人——爸爸、妈妈和小巴布——这里是我们把事情写下来的地方。它是我们已经在 Facebook、YouTube 和 TikTok 上分享的东西的延长线：一支支关于「做一家人」这件普通活儿的短视频。",
      "这里的每个故事都从其中一支视频开始。然后我们坐下来，写当时真正发生的事——那些六十秒装不下的部分。有时是爸爸写。有时小巴布把同一个下午写成他自己的版本，两篇你都能读到。",
      "我们搬过很多次家。新的山洞，新的山，新的学校。作为一队人一起适应，教会了我们知道的大部分东西，那也是贯穿一切的那根线：家庭、伴侣、育儿、成长，以及那些不管你准备好没有都会找上门的人生课。",
      "我们是雪人。我们的方式照样是温的。",
    ],
  },

  contact: {
    title: "联系我们",
    description: "联系雪人一家——写邮件给我们，或者到我们的频道上找我们。",
    heading: "打个招呼",
    intro:
      "这里没有表单，也没有工单号——只有我们自己在读自己的收件箱。想写就写。我们一家人一起回信，通常几天之内，山上忙的时候会慢一点。",
    emailLabel: "邮箱",
    writeToUs: "写信给我们",
    reasonsHeading: "值得写信的几个理由",
    reasons: [
      {
        heading: "打个招呼",
        text: "某个故事落到了你心里，或者让你想起自己的某个下午。这是我们最喜欢收到的一类信。",
      },
      {
        heading: "问问能不能用",
        text: "你想引用、翻译或转载某个故事。告诉我们是哪一篇，要发到哪里。",
      },
      {
        heading: "告诉我们错了",
        text: "链接坏了、名字拼错了、事实有出入。我们宁可听到，也不愿意就这么放着。",
      },
      {
        heading: "隐私与条款",
        text: "任何关于我们存了什么、我们的文字可以怎么使用的问题。",
      },
    ],
    channelsHeading: "到我们的频道上找我们",
    channelsIntro:
      "新故事先落在这里。如果比起收件箱你更想公开回一句，这里就是那个地方。",
    channelNotes: {
      Facebook: "大部分对话发生的地方。评论、回复，全在这儿。",
      YouTube: "这里每个故事所围绕的那些视频。",
      TikTok: "短的那个版本，通常最先发。",
    },
    disclaimer:
      '{site} 是一个私人的家庭博客，所以请不要在信里写敏感内容。邮件到我们这里之后会怎么样，写在<a href="{privacy}">隐私政策</a>里；你可以拿我们的故事做什么，写在<a href="{terms}">使用条款</a>里。',
  },

  legal: {
    lastUpdated: "最后更新",
    privacy: {
      title: "隐私政策",
      description:
        "{site} 如何处理你的信息——我们存什么、不存什么，以及怎么就这件事联系我们。",
      lead: "{site} 是一个家庭博客。我们不做数据生意，这一页是「你来访问时这句话意味着什么」的简短诚实版。",
      sections: [
        {
          heading: "简短版",
          html: [
            "<ul><li>我们不要你注册账号，这里也没有可登录的地方。</li><li>我们不跑广告追踪器，也不把关于你的任何东西卖掉。</li><li>本站在你浏览器里存的唯一一样东西，是你选的浅色／深色主题。</li><li>如果你写邮件给我们，我们会保留那封邮件，好回复你。</li></ul>",
          ],
        },
        {
          heading: "我们在你浏览器里存了什么",
          html: [
            "<p>当你用页头的主题开关时，你的选择会存进浏览器的 <code>localStorage</code>，键名是 <code>yeti-theme</code>。它留在你的设备上，从不发给我们或任何其他人，存在的唯一理由是下次你来的时候，页面不会先闪一下错的颜色。清掉浏览器的站点数据就会删掉它，站点会回到跟随你操作系统的偏好。</p>",
            "<p>我们不设置广告或追踪 cookie。</p>",
          ],
        },
        {
          heading: "视频和其他嵌入内容",
          html: [
            "<p>这里的每个故事都围绕我们的一支视频。那些视频托管在 YouTube 上，而我们用一种刻意小心的方式载入它们：在你按下播放之前，页面上只有一张静态图和一个按钮，你的浏览器完全不会向 YouTube 的播放器发请求。你按下播放之后，我们通过 <code>youtube-nocookie.com</code>（YouTube 的隐私增强模式）载入视频。</p>",
            '<p>播放器一旦载入，YouTube 就会拿到你的 IP 地址，并且可以在你的设备上写它自己的存储，适用的是 <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google 的隐私政策</a>，而不是这一份。任何把你带去我们在 {channels} 上的频道的链接也一样：你一离开，就是那个平台的规则了。</p>',
          ],
        },
        {
          heading: "服务器日志",
          html: [
            "<p>这是一个由主机服务商提供的静态站点。和基本上所有的网站主机一样，我们的主机会记录标准的技术请求信息——IP 地址、请求的页面、时间戳、浏览器 user agent——用来把站点送到你面前，并保持它安全可用。我们不会拿这些日志给你建档案。</p>",
          ],
        },
        {
          heading: "当你写邮件给我们",
          html: [
            '<p>如果你写到 <a href="{mailto}">{email}</a>，我们会收到你的邮箱地址、你愿意留下的名字，以及你选择告诉我们的内容。我们用它来回信，别的都不用。我们不会把你加进邮件列表，也不会把它转给别人。往来邮件只保留到这段对话还用得上为止。</p>',
            "<p>请不要发送敏感内容——健康细节、财务信息、证件号码。家庭博客不是放这些东西的地方。</p>",
          ],
        },
        {
          heading: "儿童",
          html: [
            "<p>我们的故事写的是一个孩子，但这个站点并不是为了从孩子那里收集任何东西而做的。我们不会在知情的情况下收集 13 岁以下儿童的个人信息。如果你认为有孩子给我们发了个人信息，写信告诉我们，我们会删掉。</p>",
          ],
        },
        {
          heading: "你的选择",
          html: [
            '<p>你可以在什么都不给我们的情况下浏览这个站点。如果你写过信给我们，想让那段往来被删掉，或者想知道我们手上有什么，写到 <a href="{mailto}">{email}</a>，我们会处理好。取决于你住在哪里，你可能拥有访问、更正或删除我们持有的你的个人信息的正式权利；不管你从哪里写信来，我们都会照办。</p>',
          ],
        },
        {
          heading: "本政策的变更",
          html: [
            "<p>如果我们往站点上加了什么会改变上面这幅图景的东西——评论系统、邮件通讯、分析统计——我们会在它上线之前更新这一页，并改掉顶部的日期。</p>",
          ],
        },
        {
          heading: "联系",
          html: [
            '<p>关于这些的问题请发到 <a href="{mailto}">{email}</a>，或通过<a href="{contact}">联系页面</a>。</p>',
          ],
        },
      ],
    },
    terms: {
      title: "使用条款",
      description:
        "阅读和分享 {site} 的条款——你可以拿我们的故事做什么，以及我们相应地承诺什么。",
      lead: "阅读 {site} 即表示你同意下面的条款。它们是刻意写得直白的：这是一个家庭博客，不是你花钱买的服务。",
      sections: [
        {
          heading: "这个站点是什么",
          html: [
            "<p>{site} 发布由我们一家人写的个人故事，每一篇都围绕我们频道上的一支视频。阅读免费，我们做它是因为写它本身让人高兴。</p>",
          ],
        },
        {
          heading: "我们的文字、照片和视频",
          html: [
            "<p>除非某一页另有说明，这里的一切——故事、插画、照片、视频、站点设计——都属于我们。欢迎你：</p>",
            "<ul><li>阅读它、为自己打印，以及发给别人；</li><li>引用一小段，只要注明 {site} 并链接回你引用的那篇故事。</li></ul>",
            "<p>请不要：</p>",
            "<ul><li>未经询问就把整篇故事转载出去，原文或译文都算；</li><li>拿我们的文字、图片或视频去训练模型或构建数据集；</li><li>拿我们的名字、我们的形象或我们的故事去做广告或背书。</li></ul>",
            '<p>如果你想更完整地使用某样东西，问一声就好——<a href="{mailto}">{email}</a>。我们通常很乐意说好。</p>',
          ],
        },
        {
          heading: "链接到我们",
          html: [
            "<p>随意链接这里的任何页面，不需要许可。只是别把本站嵌进你自己的框架里，也别把我们的故事呈现得像是我们为你写的。</p>",
          ],
        },
        {
          heading: "指向外部的链接",
          html: [
            "<p>我们会链接到 YouTube、Facebook、TikTok，偶尔也链到别人的站点。我们控制不了那些地方，也不对它们做什么、给你看什么负责。你一到那边，适用的就是它们的条款和隐私政策。</p>",
          ],
        },
        {
          heading: "这些是我们的故事，不是建议",
          html: [
            "<p>我们写育儿、伴侣、搬家和成长，是因为这些事发生在我们身上。这些都不构成专业建议——医疗、心理、法律或财务方面的都不是。在我们家管用的，在你家未必管用。真正要紧的事，请找有资质的人谈。</p>",
          ],
        },
        {
          heading: "可用性",
          html: [
            "<p>我们能写的时候就发，也可能随时编辑、移动或撤下任何一篇故事。我们不承诺站点永远能访问或没有错误；在法律允许的范围内，我们不对因使用本站或无法使用本站而产生的任何损失负责。</p>",
          ],
        },
        {
          heading: "你发给我们的东西",
          html: [
            "<p>如果你写信给我们，寄来一句评论、一个建议或你自己的故事，我们可能会在站点上或频道上引用它——除非你告诉我们可以，否则绝不会带上你的全名或联系方式。如果你宁可完全不被引用，在信里说一声，我们就不会。</p>",
          ],
        },
        {
          heading: "变更",
          html: [
            "<p>我们可能会更新这些条款。页面顶部的日期始终显示最后一次修订，条款变更后你继续使用本站，即表示你接受新版本。</p>",
          ],
        },
        {
          heading: "联系",
          html: [
            '<p>关于这些条款的问题请发到 <a href="{mailto}">{email}</a>，或通过<a href="{contact}">联系页面</a>。</p>',
          ],
        },
      ],
    },
  },
} satisfies UiStrings;
