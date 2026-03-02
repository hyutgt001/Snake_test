"use strict";

// 轻量级 i18n：仅覆盖本项目 UI 文案（中文/英文/日文）。
(() => {
  const STORAGE_KEY = "snake_language";
  const DEFAULT_LANGUAGE = "zh-CN";
  const SUPPORTED_LANGUAGES = ["zh-CN", "en-US", "ja-JP"];

  const MESSAGES = {
    "zh-CN": {
      "app.title": "贪吃蛇",
      "header.subtitle": "支持键盘与触控双操作。",
      "settings.difficulty": "难度",
      "settings.theme": "主题",
      "settings.language": "语言",
      "difficulty.easy": "简单",
      "difficulty.normal": "普通",
      "difficulty.hard": "困难",
      "theme.amber": "琥珀暖阳",
      "theme.ocean": "海风霓彩",
      "theme.forest": "森林薄荷",
      "tabs.game": "游戏面板",
      "tabs.help": "玩法说明",
      "help.title": "玩法说明",
      "help.move.label": "移动：",
      "help.move.value": "方向键 / WASD",
      "help.pause.label": "暂停：",
      "help.pause.value": "空格 或 P",
      "help.restart.label": "重开：",
      "help.restart.value": "R 或“重新开始”按钮",
      "help.items.label": "道具：",
      "help.items.value": "🍎 +10，🍌 +15，💣 扣分并减 1 生命",
      "help.rules.label": "规则：",
      "help.rules.value": "每波至少有一个可得分道具，可能同时出现炸弹，吃掉任意一个后刷新下一波。",
      "status.score": "当前分数",
      "status.bestScore": "最高分",
      "status.state": "状态",
      "status.lives": "生命值",
      "status.target": "当前道具",
      "actions.start": "开始游戏",
      "actions.pause": "暂停",
      "actions.restart": "重新开始",
      "intro.title": "欢迎来到贪吃蛇",
      "intro.p1": "键盘方向键或 WASD 都可以移动，空格可暂停/继续。",
      "intro.p2": "R 键可立即重新开始，P 键可暂停/继续。",
      "intro.p3": "触屏设备可使用下方方向按钮操作。",
      "intro.close": "我先看看",
      "state.idle": "等待开始",
      "state.running": "进行中",
      "state.paused": "已暂停",
      "state.over": "已结束",
      "overlay.ready": "按方向键 / WASD 或点击“开始游戏”开始挑战。",
      "overlay.paused": "已暂停，按空格、P 键或点击“暂停”继续。",
      "overlay.gameOver.collision": "游戏结束，得分 {score}。撞到障碍，回合结束。点击“重新开始”再来一局。",
      "overlay.gameOver.bomb": "游戏结束，得分 {score}。踩中炸弹，生命耗尽。点击“重新开始”再来一局。",
      "overlay.gameOver.win": "游戏结束，得分 {score}。你已经占满了棋盘，成功通关。点击“重新开始”再来一局。"
    },
    "en-US": {
      "app.title": "Snake",
      "header.subtitle": "Keyboard and touch controls supported.",
      "settings.difficulty": "Difficulty",
      "settings.theme": "Theme",
      "settings.language": "Language",
      "difficulty.easy": "Easy",
      "difficulty.normal": "Normal",
      "difficulty.hard": "Hard",
      "theme.amber": "Amber Glow",
      "theme.ocean": "Ocean Neon",
      "theme.forest": "Mint Forest",
      "tabs.game": "Game",
      "tabs.help": "How to play",
      "help.title": "How to play",
      "help.move.label": "Move:",
      "help.move.value": "Arrow keys / WASD",
      "help.pause.label": "Pause:",
      "help.pause.value": "Space or P",
      "help.restart.label": "Restart:",
      "help.restart.value": "R or the \"Restart\" button",
      "help.items.label": "Items:",
      "help.items.value": "🍎 +10, 🍌 +15, 💣 -score and -1 life",
      "help.rules.label": "Rules:",
      "help.rules.value": "Each wave has at least one scoring item. A bomb may also appear. Eating either refreshes the next wave.",
      "status.score": "Score",
      "status.bestScore": "Best",
      "status.state": "State",
      "status.lives": "Lives",
      "status.target": "Items",
      "actions.start": "Start",
      "actions.pause": "Pause",
      "actions.restart": "Restart",
      "intro.title": "Welcome to Snake",
      "intro.p1": "Move with arrow keys or WASD. Space to pause/resume.",
      "intro.p2": "Press R to restart. Press P to pause/resume.",
      "intro.p3": "On touch devices, use the buttons below.",
      "intro.close": "Not now",
      "state.idle": "Ready",
      "state.running": "Running",
      "state.paused": "Paused",
      "state.over": "Ended",
      "overlay.ready": "Press arrow keys / WASD, or click \"Start\" to begin.",
      "overlay.paused": "Paused. Press Space, P, or click \"Pause\" to resume.",
      "overlay.gameOver.collision": "Game over. Score {score}. You crashed. Click \"Restart\" to play again.",
      "overlay.gameOver.bomb": "Game over. Score {score}. Bomb hit. No lives left. Click \"Restart\" to play again.",
      "overlay.gameOver.win": "You win. Score {score}. You filled the board. Click \"Restart\" to play again."
    },
    "ja-JP": {
      "app.title": "スネーク",
      "header.subtitle": "キーボードとタッチ操作に対応。",
      "settings.difficulty": "難易度",
      "settings.theme": "テーマ",
      "settings.language": "言語",
      "difficulty.easy": "かんたん",
      "difficulty.normal": "ふつう",
      "difficulty.hard": "むずかしい",
      "theme.amber": "アンバー",
      "theme.ocean": "オーシャン",
      "theme.forest": "ミントフォレスト",
      "tabs.game": "ゲーム",
      "tabs.help": "遊び方",
      "help.title": "遊び方",
      "help.move.label": "移動:",
      "help.move.value": "矢印キー / WASD",
      "help.pause.label": "一時停止:",
      "help.pause.value": "スペース または P",
      "help.restart.label": "リスタート:",
      "help.restart.value": "R または「やり直し」ボタン",
      "help.items.label": "アイテム:",
      "help.items.value": "🍎 +10、🍌 +15、💣 得点減少 + ライフ-1",
      "help.rules.label": "ルール:",
      "help.rules.value": "各ウェーブに最低 1 つの得点アイテムが出現します。爆弾も同時に出ることがあります。どちらかを取ると次のウェーブが出現します。",
      "status.score": "スコア",
      "status.bestScore": "ベスト",
      "status.state": "状態",
      "status.lives": "ライフ",
      "status.target": "アイテム",
      "actions.start": "スタート",
      "actions.pause": "一時停止",
      "actions.restart": "やり直し",
      "intro.title": "スネークへようこそ",
      "intro.p1": "矢印キーまたは WASD で移動します。スペースで一時停止/再開。",
      "intro.p2": "R でやり直し。P で一時停止/再開。",
      "intro.p3": "タッチ端末では下の方向ボタンで操作できます。",
      "intro.close": "あとで",
      "state.idle": "待機中",
      "state.running": "プレイ中",
      "state.paused": "一時停止中",
      "state.over": "終了",
      "overlay.ready": "矢印キー / WASD、または「スタート」をクリックして開始。",
      "overlay.paused": "一時停止中。スペース、P、または「一時停止」をクリックして再開。",
      "overlay.gameOver.collision": "ゲーム終了。スコア {score}。ぶつかりました。「やり直し」で再挑戦。",
      "overlay.gameOver.bomb": "ゲーム終了。スコア {score}。爆弾に当たり、ライフがなくなりました。「やり直し」で再挑戦。",
      "overlay.gameOver.win": "クリア。スコア {score}。盤面を埋めました。「やり直し」で再挑戦。"
    }
  };

  let currentLanguage = DEFAULT_LANGUAGE;

  function ensureSupportedLanguage(language) {
    if (!SUPPORTED_LANGUAGES.includes(language)) {
      throw new Error(`不支持的语言：${language}`);
    }
  }

  function formatMessage(template, vars) {
    return template.replace(/\{(\w+)\}/g, (_, name) => {
      if (!Object.prototype.hasOwnProperty.call(vars, name)) {
        throw new Error(`i18n 缺少变量：${name}`);
      }
      return String(vars[name]);
    });
  }

  function translate(key, vars) {
    const table = MESSAGES[currentLanguage];
    if (!table) {
      throw new Error(`i18n 缺少语言包：${currentLanguage}`);
    }

    const template = table[key];
    if (typeof template !== "string") {
      throw new Error(`i18n 缺少文案：${currentLanguage}.${key}`);
    }

    if (template.includes("{")) {
      if (!vars) {
        throw new Error(`i18n 文案需要变量：${currentLanguage}.${key}`);
      }
      return formatMessage(template, vars);
    }

    return template;
  }

  function applyDomTranslations() {
    document.querySelectorAll("[data-i18n]").forEach((node) => {
      const key = node.dataset.i18n;
      node.textContent = translate(key);
    });
  }

  function getInitialLanguage() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED_LANGUAGES.includes(stored)) {
      return stored;
    }
    return DEFAULT_LANGUAGE;
  }

  function setLanguage(language) {
    ensureSupportedLanguage(language);
    currentLanguage = language;
    document.documentElement.lang = currentLanguage;
    localStorage.setItem(STORAGE_KEY, currentLanguage);
    applyDomTranslations();

    window.dispatchEvent(
      new CustomEvent("snake-language-change", { detail: { language: currentLanguage } })
    );
  }

  function init() {
    const selectEl = document.getElementById("language-select");
    if (!selectEl) {
      throw new Error("未找到语言选择器 #language-select");
    }

    currentLanguage = getInitialLanguage();
    document.documentElement.lang = currentLanguage;
    selectEl.value = currentLanguage;

    selectEl.addEventListener("change", () => {
      setLanguage(selectEl.value);
    });

    applyDomTranslations();
  }

  window.SnakeI18n = Object.freeze({
    t: translate,
    getLanguage: () => currentLanguage,
    setLanguage,
    supportedLanguages: Object.freeze([...SUPPORTED_LANGUAGES])
  });

  init();
})();
