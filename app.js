(() => {
  "use strict";

  const STORAGE_KEY = "talk-detective-game-state-v2";
  const dom = { app: null, toast: null };
  const EPISODES = typeof STORIES !== "undefined" ? STORIES : (typeof STORY !== "undefined" ? [STORY] : []);

  let activeStory = EPISODES[0] || null;
  let chapterOrder = [];
  let evidenceIndex = new Map();
  let gameState = null;
  let toastTimer = null;
  let audioContext = null;

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    dom.app = document.getElementById("app");
    dom.toast = document.getElementById("toast");

    if (!EPISODES.length) {
      dom.app.innerHTML = `<section class="screen"><div class="card">스토리 데이터를 불러오지 못했습니다.</div></section>`;
      return;
    }

    gameState = loadState();
    setActiveStory(gameState.episodeId || EPISODES[0].id);
    bindEvents();
    applySettings();
    render();
  }

  function bindEvents() {
    dom.app.addEventListener("click", handleClick);
    dom.app.addEventListener("submit", handleSubmit);
    dom.app.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      const evidenceButton = event.target.closest("[data-action='toggle-evidence']");
      if (evidenceButton) evidenceButton.click();
    });
  }

  function createState(previous = {}) {
    const settings = previous.settings || {};
    const stats = previous.stats || {};
    const episodeId = previous.episodeId || EPISODES[0].id;
    const state = {
      episodeId,
      episodeSaves: previous.episodeSaves || {},
      stats: {
        playCount: stats.playCount || 0,
        bestScore: stats.bestScore || 0,
        bestGrade: stats.bestGrade || "기록 없음",
        lastResult: stats.lastResult || null,
        episodeBest: stats.episodeBest || {}
      },
      settings: {
        reduceMotion: Boolean(settings.reduceMotion),
        sound: settings.sound !== false,
        autoExplain: settings.autoExplain !== false,
        dimRead: Boolean(settings.dimRead),
        compactMode: Boolean(settings.compactMode)
      }
    };
    return applyEpisodeProgress(state, episodeId);
  }

  function createEpisodeProgress(episodeId) {
    const story = getStory(episodeId);
    return {
      hasStarted: false,
      completed: false,
      screen: "home",
      currentChapterId: story.chapters[0].id,
      activeRoomId: null,
      selectedClues: [],
      readMessageIds: [],
      unlockedChapters: [story.chapters[0].id],
      unlockedRooms: getRoomUnlocks(story, [story.chapters[0].id]),
      checkpointAnswers: {},
      finalResult: null
    };
  }

  function extractEpisodeProgress(state) {
    return {
      hasStarted: Boolean(state.hasStarted),
      completed: Boolean(state.completed),
      screen: state.screen || "home",
      currentChapterId: state.currentChapterId || activeStory.chapters[0].id,
      activeRoomId: state.activeRoomId || null,
      selectedClues: Array.isArray(state.selectedClues) ? state.selectedClues : [],
      readMessageIds: Array.isArray(state.readMessageIds) ? state.readMessageIds : [],
      unlockedChapters: Array.isArray(state.unlockedChapters) ? state.unlockedChapters : [activeStory.chapters[0].id],
      unlockedRooms: Array.isArray(state.unlockedRooms) ? state.unlockedRooms : getRoomUnlocks(activeStory, [activeStory.chapters[0].id]),
      checkpointAnswers: state.checkpointAnswers || {},
      finalResult: state.finalResult || null
    };
  }

  function applyEpisodeProgress(state, episodeId, screenOverride) {
    const story = getStory(episodeId);
    const saved = state.episodeSaves && state.episodeSaves[episodeId]
      ? state.episodeSaves[episodeId]
      : createEpisodeProgress(episodeId);

    state.episodeId = episodeId;
    Object.assign(state, {
      hasStarted: Boolean(saved.hasStarted),
      completed: Boolean(saved.completed),
      screen: screenOverride || saved.screen || "home",
      currentChapterId: saved.currentChapterId || story.chapters[0].id,
      activeRoomId: saved.activeRoomId || null,
      selectedClues: Array.isArray(saved.selectedClues) ? saved.selectedClues : [],
      readMessageIds: Array.isArray(saved.readMessageIds) ? saved.readMessageIds : [],
      unlockedChapters: Array.isArray(saved.unlockedChapters) ? saved.unlockedChapters : [story.chapters[0].id],
      unlockedRooms: Array.isArray(saved.unlockedRooms) ? saved.unlockedRooms : getRoomUnlocks(story, [story.chapters[0].id]),
      checkpointAnswers: saved.checkpointAnswers || {},
      finalResult: saved.finalResult || null
    });

    return state;
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return createState();
      return createState(JSON.parse(raw));
    } catch (error) {
      return createState();
    }
  }

  function saveState() {
    try {
      gameState.episodeSaves[gameState.episodeId] = extractEpisodeProgress(gameState);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    } catch (error) {
      showToast("진행 상태를 저장하지 못했습니다.");
    }
  }

  function resetAllRecords() {
    if (!window.confirm("모든 에피소드 진행 기록과 최고 점수를 초기화할까요?")) return;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      // 저장소 접근 실패는 플레이를 막지 않는다.
    }
    gameState = createState();
    setActiveStory(gameState.episodeId);
    showToast("기록을 초기화했습니다.");
    render();
  }

  function setActiveStory(episodeId) {
    activeStory = getStory(episodeId);
    chapterOrder = activeStory.chapters.map((chapter) => chapter.id);
    buildEvidenceIndex();
  }

  function getStory(episodeId) {
    return EPISODES.find((story) => story.id === episodeId) || EPISODES[0];
  }

  function switchEpisode(episodeId, screenOverride) {
    if (gameState) {
      gameState.episodeSaves[gameState.episodeId] = extractEpisodeProgress(gameState);
    }
    setActiveStory(episodeId);
    gameState = applyEpisodeProgress(gameState, episodeId, screenOverride);
    saveState();
  }

  function buildEvidenceIndex() {
    evidenceIndex = new Map();
    if (!activeStory) return;

    activeStory.rooms.forEach((room) => {
      room.messages.forEach((message) => {
        evidenceIndex.set(message.id, {
          id: message.id,
          sourceType: getMessageTypeLabel(message.type),
          sourceTitle: room.title,
          chapter: message.chapter,
          text: message.description ? `${message.text} ${message.description}` : message.text,
          displayTitle: message.clueTitle || message.text,
          clue: Boolean(message.clue),
          clueTitle: message.clueTitle || message.text,
          clueExplanation: message.clueExplanation || "",
          clueWeight: message.clueWeight || 0,
          relatedCharacterIds: message.relatedCharacterIds || [],
          raw: message
        });
      });
    });

    activeStory.timeline.forEach((item) => {
      evidenceIndex.set(item.id, {
        id: item.id,
        sourceType: "타임라인",
        sourceTitle: "사건 타임라인",
        chapter: item.chapter,
        text: `${item.time} ${item.text}`,
        displayTitle: item.clueTitle || item.text,
        clue: Boolean(item.clue),
        clueTitle: item.clueTitle || item.text,
        clueExplanation: item.clueExplanation || "",
        clueWeight: item.clueWeight || 0,
        relatedCharacterIds: item.relatedCharacterIds || [],
        raw: item
      });
    });

    activeStory.notes.forEach((note) => {
      note.items.forEach((item) => {
        evidenceIndex.set(item.id, {
          id: item.id,
          sourceType: "정산 메모",
          sourceTitle: note.title,
          chapter: item.chapter || note.chapter,
          text: item.text,
          displayTitle: item.clueTitle || `${item.label}: ${item.value}`,
          clue: Boolean(item.clue),
          clueTitle: item.clueTitle || `${item.label}: ${item.value}`,
          clueExplanation: item.clueExplanation || "",
          clueWeight: item.clueWeight || 0,
          relatedCharacterIds: item.relatedCharacterIds || [],
          raw: item
        });
      });
    });
  }

  function handleClick(event) {
    const target = event.target.closest("[data-action]");
    if (!target) return;
    const action = target.dataset.action;
    const id = target.dataset.id;

    switch (action) {
      case "start":
        startEpisode(id || activeStory.id);
        break;
      case "continue":
        continueEpisode(id || activeStory.id);
        break;
      case "select-episode":
        switchEpisode(id, "home");
        render();
        break;
      case "reset":
        resetAllRecords();
        break;
      case "home":
        navigate("home");
        break;
      case "intro":
        navigate("intro");
        break;
      case "dashboard":
        navigate("dashboard");
        break;
      case "settings":
        navigate("settings");
        break;
      case "select-chapter":
        selectChapter(id);
        break;
      case "open-room":
        openRoom(id);
        break;
      case "notebook":
        navigate("notebook");
        break;
      case "timeline":
        navigate("timeline");
        break;
      case "notes":
        navigate("notes");
        break;
      case "checkpoint":
        navigate("checkpoint");
        break;
      case "final":
        navigate("final");
        break;
      case "result":
        navigate("result");
        break;
      case "toggle-evidence":
        toggleEvidence(id);
        break;
      case "remove-evidence":
        removeEvidence(id);
        break;
      case "copy-result":
        copyResult();
        break;
      case "report-issue":
        showToast("자료 오류 신고 기능은 추후 업데이트 예정입니다.");
        playSound("click");
        break;
      default:
        break;
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    if (form.dataset.form === "checkpoint") submitCheckpoint(form);
    if (form.dataset.form === "final") submitFinal(form);
    if (form.dataset.form === "settings") submitSettings(form);
  }

  function render() {
    applySettings();
    const screen = gameState.screen || "home";
    if (screen === "home") renderHome();
    else if (screen === "intro") renderIntro();
    else if (screen === "dashboard") renderDashboard();
    else if (screen === "room") renderRoom(gameState.activeRoomId);
    else if (screen === "notebook") renderNotebook();
    else if (screen === "timeline") renderTimeline();
    else if (screen === "notes") renderNotes();
    else if (screen === "checkpoint") renderCheckpoint();
    else if (screen === "final") renderFinal();
    else if (screen === "result") renderResult();
    else if (screen === "settings") renderSettings();
    else renderHome();
  }

  function renderHome() {
    const activeSave = gameState.episodeSaves[activeStory.id] || extractEpisodeProgress(gameState);
    dom.app.innerHTML = `
      <section class="screen">
        <div class="hero home-hero">
          <div class="hero-copy">
            <div class="badge-line">
              <span class="case-badge">Messenger Mystery</span>
              <span class="soft-badge">대화 속 진실을 찾아라</span>
            </div>
            <h1>톡탐정</h1>
            <p class="hero-kicker">단톡방 속 거짓말, 끝까지 읽어야 보인다.</p>
            <p>채팅 기록, 사진 설명, 타임라인, 메모를 뒤져 진실을 재구성하세요.</p>
          </div>
          <img class="hero-illustration" src="assets/illustrations/hero-phone.svg" alt="말풍선과 단서 핀이 표시된 스마트폰 추리 일러스트">
        </div>
        <div class="stat-strip home-stats">
          <div class="stat"><img src="assets/icons/magnifier.svg" alt="" aria-hidden="true"><span>에피소드 수</span><strong>${EPISODES.length}개</strong></div>
          <div class="stat"><img src="assets/icons/timeline.svg" alt="" aria-hidden="true"><span>누적 플레이</span><strong>${gameState.stats.playCount}회</strong></div>
          <div class="stat"><img src="assets/icons/notebook.svg" alt="" aria-hidden="true"><span>최고 등급</span><strong>${escapeHTML(gameState.stats.bestGrade)}</strong></div>
        </div>
        <div class="case-section">
          <h2 class="section-title">사건 선택</h2>
          <div class="case-list">
            ${EPISODES.map(episodeCard).join("")}
          </div>
        </div>
        <div class="button-row">
          ${activeSave.hasStarted ? `<button class="btn accent full" type="button" data-action="continue" data-id="${activeStory.id}">${activeSave.completed ? "선택 사건 결과 보기" : "선택 사건 이어하기"}</button>` : ""}
          <button class="btn ghost full" type="button" data-action="settings">설정</button>
          <button class="btn danger full" type="button" data-action="reset">전체 기록 초기화</button>
        </div>
        <div class="ad-slot">홈 화면 하단 광고 영역 준비중</div>
      </section>
    `;
  }

  function episodeCard(story) {
    const save = story.id === gameState.episodeId
      ? extractEpisodeProgress(gameState)
      : (gameState.episodeSaves[story.id] || createEpisodeProgress(story.id));
    const best = gameState.stats.episodeBest[story.id];
    const active = story.id === activeStory.id;
    const progress = calculateEpisodeProgress(save, story);
    const bestLabel = best ? `최고 ${best.score}점 · ${escapeHTML(best.grade)}` : "아직 기록 없음";
    const cover = storyCoverImage(story);

    return `
      <article class="case-card ${active ? "selected" : ""}" style="--case-color: ${escapeAttr(story.themeColor || "#ffd166")}">
        <div class="case-cover-wrap">
          <img class="case-cover" src="${escapeAttr(cover)}" alt="${escapeAttr(story.title)} 사건 커버">
          ${active ? "<span class='select-badge case-selected-badge'>선택됨</span>" : ""}
        </div>
        <div class="case-content">
          <div class="case-head">
            <strong>${escapeHTML(story.title)}</strong>
            <span>${escapeHTML(story.tagline || story.summary)}</span>
          </div>
          <p>${escapeHTML(story.summary)}</p>
          <div class="case-meta">
            <span>예상 ${escapeHTML(story.estimatedTime)}</span>
            <span>${bestLabel}</span>
          </div>
          <div class="progress-wrap mini" aria-label="진행률 ${progress}%"><div class="progress-bar" style="width: ${progress}%"></div></div>
          <div class="case-progress-text">진행률 ${progress}%</div>
        </div>
        <div class="button-row case-actions">
          <button class="btn ghost" type="button" data-action="select-episode" data-id="${story.id}">선택</button>
          ${save.hasStarted ? `<button class="btn accent" type="button" data-action="continue" data-id="${story.id}">이어하기</button>` : ""}
          <button class="btn primary" type="button" data-action="start" data-id="${story.id}">${save.hasStarted ? "새로 시작" : "시작"}</button>
        </div>
      </article>
    `;
  }

  function renderIntro() {
    dom.app.innerHTML = `
      <section class="screen">
        ${topbar("사건 시작", activeStory.title, "home")}
        <div class="card copy">
          <h1 class="page-title">${escapeHTML(activeStory.title)}</h1>
          <p class="page-subtitle">${escapeHTML(activeStory.summary)}</p>
          <p>${escapeHTML(activeStory.introCopy || "대화방, 자료, 타임라인을 오가며 단서를 수집하고 진실을 재구성하세요.")}</p>
        </div>
        <div class="card">
          <h2 class="section-title">등장인물</h2>
          <div class="character-list">${activeStory.characters.map(characterCard).join("")}</div>
        </div>
        <div class="button-row">
          <button class="btn primary full" type="button" data-action="dashboard">수사 시작</button>
          <button class="btn ghost full" type="button" data-action="settings">설정</button>
        </div>
      </section>
    `;
  }

  function renderDashboard() {
    syncUnlocks();
    const currentChapter = getChapter(gameState.currentChapterId);
    const progress = calculateEpisodeProgress(extractEpisodeProgress(gameState), activeStory);
    const checkpoint = currentChapter && currentChapter.checkpointQuestionId ? getCheckpoint(currentChapter.checkpointQuestionId) : null;
    const checkpointDone = checkpoint ? Boolean(gameState.checkpointAnswers[checkpoint.id]) : false;
    const finalUnlocked = isChapterUnlocked(activeStory.chapters[activeStory.chapters.length - 1].id);
    const unlockedRooms = getUnlockedRooms();
    const timelineCount = activeStory.timeline.filter((item) => isChapterUnlocked(item.chapter)).length;
    const noteCount = activeStory.notes.filter((note) => isChapterUnlocked(note.chapter)).length;

    dom.app.innerHTML = `
      <section class="screen">
        ${topbar("사건 대시보드", currentChapter ? currentChapter.title : activeStory.title, "home")}
        <div class="card investigation-card unlock-anim">
          <div class="chapter-strip" aria-label="챕터 선택">
            ${activeStory.chapters.map((chapter) => {
              const unlocked = isChapterUnlocked(chapter.id);
              const active = chapter.id === gameState.currentChapterId;
              return `<button class="chapter-chip ${active ? "active" : ""} ${unlocked ? "" : "locked"}" type="button" ${unlocked ? `data-action="select-chapter" data-id="${chapter.id}"` : "disabled"}>${escapeHTML(chapter.title.replace("Chapter ", "Ch."))}</button>`;
            }).join("")}
          </div>
          <span class="case-badge">현재 수사 단계</span>
          <h1 class="page-title">${escapeHTML(currentChapter.title)}</h1>
          <p class="page-subtitle">${escapeHTML(currentChapter.intro)}</p>
          <div class="progress-label"><span>수사 진행률</span><strong>${progress}%</strong></div>
          <div class="progress-wrap sleek" aria-label="진행률 ${progress}%"><div class="progress-bar" style="width: ${progress}%"></div></div>
        </div>
        <div class="action-grid" aria-label="주요 수사 메뉴">
          <button class="action-card" type="button" data-action="notebook">
            <img src="${iconImage("notebook")}" alt="" aria-hidden="true">
            <span><strong>단서 수첩</strong><small>저장된 단서 ${gameState.selectedClues.length}개</small></span>
            <em>검토</em>
          </button>
          <button class="action-card" type="button" data-action="timeline">
            <img src="${iconImage("timeline")}" alt="" aria-hidden="true">
            <span><strong>타임라인</strong><small>해금된 시간 기록 ${timelineCount}개</small></span>
            <em>시간</em>
          </button>
          <button class="action-card" type="button" data-action="notes">
            <img src="${iconImage("memo")}" alt="" aria-hidden="true">
            <span><strong>자료 메모</strong><small>정산/로그 자료 ${noteCount}개</small></span>
            <em>자료</em>
          </button>
          ${checkpoint ? `<button class="action-card ${!checkpointDone ? "urgent" : ""}" type="button" data-action="checkpoint">
            <img src="${iconImage("magnifier")}" alt="" aria-hidden="true">
            <span><strong>${checkpointDone ? "중간 추리 결과" : "중간 추리"}</strong><small>${checkpointDone ? "현재 챕터 추론 제출 완료" : "현재 챕터 추론 제출 필요"}</small></span>
            <em>${checkpointDone ? "완료" : "필요"}</em>
          </button>` : ""}
          ${finalUnlocked ? `<button class="action-card final" type="button" data-action="final">
            <img src="${iconImage("lock")}" alt="" aria-hidden="true">
            <span><strong>최종 추리</strong><small>사건 보고서 작성 가능</small></span>
            <em>최종</em>
          </button>` : ""}
          ${gameState.finalResult ? `<button class="action-card" type="button" data-action="result">
            <img src="${iconImage("magnifier")}" alt="" aria-hidden="true">
            <span><strong>결과 리포트</strong><small>최종 판정 다시 보기</small></span>
            <em>리포트</em>
          </button>` : ""}
        </div>
        <div class="card">
          <h2 class="section-title">열린 자료방</h2>
          <p class="muted small">현재 열람 가능한 자료방 ${unlockedRooms.length}개</p>
          <div class="room-list">${unlockedRooms.map(roomListItem).join("")}</div>
        </div>
        <div class="card">
          <h2 class="section-title">등장인물</h2>
          <div class="character-list">${activeStory.characters.map(characterCard).join("")}</div>
        </div>
        ${renderPremiumPacks()}
        <div class="ad-slot">챕터 해금 후 광고 영역 준비중</div>
      </section>
    `;
  }

  function renderRoom(roomId) {
    const room = activeStory.rooms.find((item) => item.id === roomId) || getUnlockedRooms()[0];
    if (!room) {
      navigate("dashboard");
      return;
    }

    const visibleMessages = room.messages.filter((message) => isChapterUnlocked(message.chapter));
    const visibleMessageIds = new Set(visibleMessages.map((message) => message.id));
    const selectedInRoom = gameState.selectedClues.filter((id) => visibleMessageIds.has(id)).length;
    let previousChapter = "";
    const messagesHtml = visibleMessages.map((message) => {
      const chapter = getChapter(message.chapter);
      const divider = message.chapter !== previousChapter ? `<div class="chapter-divider"><strong>${escapeHTML(chapter.title)}</strong><span>새 메시지 해금</span></div>` : "";
      previousChapter = message.chapter;
      return divider + renderMessage(message);
    }).join("");

    dom.app.innerHTML = `
      <section class="screen">
        ${topbar(room.title, room.description, "dashboard")}
        <div class="room-inspector">
          <div>
            <span class="case-badge">자료방</span>
            <strong>${escapeHTML(room.title)}</strong>
            <p>${escapeHTML(room.description)}</p>
          </div>
          <div class="room-clue-count"><span>이 방에서 찾은 단서</span><strong>${selectedInRoom}개</strong></div>
        </div>
        <div class="button-row room-tools">
          <button class="btn ghost" type="button" data-action="notebook">단서 수첩 ${gameState.selectedClues.length}</button>
          <button class="btn ghost subtle" type="button" data-action="report-issue">자료 오류 신고</button>
        </div>
        <div class="chat-list">${messagesHtml || `<div class="card muted">아직 열린 메시지가 없습니다.</div>`}</div>
      </section>
    `;
    markMessagesRead(visibleMessages);
  }

  function renderNotebook() {
    const selected = gameState.selectedClues.map((id) => evidenceIndex.get(id)).filter(Boolean);
    const relatedCount = new Set(selected.flatMap((item) => item.relatedCharacterIds || [])).size;
    const chapter = getChapter(gameState.currentChapterId);
    dom.app.innerHTML = `
      <section class="screen">
        ${topbar("단서 수첩", `${selected.length}개 저장됨`, "dashboard")}
        <div class="notebook-summary">
          <div><span>저장된 단서</span><strong>${selected.length}개</strong></div>
          <div><span>관련 인물</span><strong>${relatedCount}명</strong></div>
          <div><span>현재 챕터</span><strong>${escapeHTML(chapter.title.replace("Chapter ", "Ch."))}</strong></div>
        </div>
        <div class="card copy detective-note"><p>진짜 단서와 가짜 단서를 모두 저장할 수 있습니다. 결과 전까지 정답 여부는 공개되지 않습니다.</p></div>
        <div class="list">${selected.length ? selected.map((item) => evidenceCard(item, { removable: true })).join("") : `<div class="card muted">아직 저장한 단서가 없습니다.</div>`}</div>
        <button class="btn primary full" type="button" data-action="dashboard">대시보드로</button>
      </section>
    `;
  }

  function renderTimeline() {
    const items = activeStory.timeline.filter((item) => isChapterUnlocked(item.chapter));
    dom.app.innerHTML = `
      <section class="screen">
        ${topbar("타임라인", "시간순 사건 흐름", "dashboard")}
        <div class="card timeline-intro">
          <span class="case-badge">시간 기록</span>
          <h1 class="page-title">해금된 타임라인 ${items.length}개</h1>
          <p class="page-subtitle">클릭 가능한 항목은 단서 수첩에 핀으로 저장할 수 있습니다.</p>
        </div>
        <div class="timeline">
          ${items.map((item) => {
            const selected = gameState.selectedClues.includes(item.id);
            return `<button class="timeline-item clickable-evidence ${selected ? "selected" : ""}" type="button" data-action="toggle-evidence" data-id="${item.id}" aria-label="타임라인 단서 후보 저장: ${escapeAttr(item.text)}">
              <span class="timeline-time">${escapeHTML(item.time)}</span>
              <span>${escapeHTML(item.text)}${selected ? `<span class="select-badge pin-badge">핀 저장됨</span>` : ""}</span>
            </button>`;
          }).join("")}
        </div>
      </section>
    `;
  }

  function renderNotes() {
    const notes = activeStory.notes.filter((note) => isChapterUnlocked(note.chapter));
    dom.app.innerHTML = `
      <section class="screen">
        ${topbar("자료 메모", "숫자와 기록을 따로 확인", "dashboard")}
        ${notes.length ? notes.map((note) => `
          <div class="card memo-card">
            <span class="case-badge">${memoKind(note.title)}</span>
            <h2 class="section-title">${escapeHTML(note.title)}</h2>
            <p class="muted small">${escapeHTML(note.description)}</p>
            <div class="memo-table">
              ${note.items.map((item) => {
                const selected = gameState.selectedClues.includes(item.id);
                return `<button class="note-item clickable-evidence ${selected ? "selected" : ""}" type="button" data-action="toggle-evidence" data-id="${item.id}" aria-label="메모 단서 후보 저장: ${escapeAttr(item.label)}">
                  <span class="note-line"><span>${escapeHTML(item.label)}</span><strong>${escapeHTML(item.value)}</strong></span>
                  <span class="muted small">${escapeHTML(item.text)}</span>
                  ${selected ? `<span class="select-badge pin-badge">핀 저장됨</span>` : ""}
                </button>`;
              }).join("")}
            </div>
          </div>
        `).join("") : `<div class="card muted">아직 열린 메모가 없습니다.</div>`}
      </section>
    `;
  }

  function renderCheckpoint() {
    const chapter = getChapter(gameState.currentChapterId);
    const checkpointId = chapter && chapter.checkpointQuestionId;
    const question = checkpointId ? getCheckpoint(checkpointId) : null;
    if (!question) {
      dom.app.innerHTML = `<section class="screen">${topbar("중간 추리", "현재 챕터에는 질문이 없습니다.", "dashboard")}<button class="btn primary full" type="button" data-action="dashboard">대시보드로</button></section>`;
      return;
    }

    const answered = gameState.checkpointAnswers[question.id];
    const explainOpen = gameState.settings.autoExplain ? "open" : "";
    dom.app.innerHTML = `
      <section class="screen">
        ${topbar("중간 추리", chapter.title, "dashboard")}
        <div class="card copy checkpoint-brief">
          <span class="case-badge">수사 판단</span>
          <h1 class="page-title">${escapeHTML(question.question)}</h1>
          <p class="page-subtitle">${escapeHTML(chapter.intro)}</p>
          <p class="page-subtitle">틀려도 다음 챕터로 진행됩니다. 대신 결과 점수에 반영됩니다.</p>
        </div>
        ${answered ? `
          <div class="card checkpoint-result unlock-anim">
            <h2 class="section-title">${answered.correct ? "판단 성공" : "판단 실패"}</h2>
            <p>선택: ${escapeHTML(question.choices[answered.choiceIndex] || "선택 없음")}</p>
            <p>정답: ${escapeHTML(question.choices[question.answerIndex])}</p>
            <details ${explainOpen}><summary>해설 보기</summary><p class="copy">${escapeHTML(question.explanation)}</p></details>
          </div>
          ${getNextChapter(question.chapter) ? `<button class="btn primary full" type="button" data-action="select-chapter" data-id="${getNextChapter(question.chapter).id}">해금된 챕터로 이동</button>` : `<button class="btn primary full" type="button" data-action="dashboard">대시보드로</button>`}
        ` : `
          <form class="card" data-form="checkpoint">
            <input type="hidden" name="questionId" value="${question.id}">
            <div class="choice-list">
              ${question.choices.map((choice, index) => `<label class="choice investigation-choice"><input type="radio" name="choice" value="${index}"><span>${escapeHTML(choice)}</span></label>`).join("")}
            </div>
            <button class="btn primary full" type="submit">추리 제출</button>
          </form>
        `}
      </section>
    `;
  }

  function renderFinal() {
    const finalChapterId = activeStory.chapters[activeStory.chapters.length - 1].id;
    if (!isChapterUnlocked(finalChapterId)) {
      dom.app.innerHTML = `<section class="screen">${topbar("최종 추리", "아직 열리지 않았습니다.", "dashboard")}<div class="card">이전 챕터의 중간 추리를 완료하면 최종 추리가 열립니다.</div></section>`;
      return;
    }

    const selected = gameState.selectedClues.map((id) => evidenceIndex.get(id)).filter(Boolean);
    const suspects = activeStory.characters.filter((character) => character.suspect !== false && character.id !== "haneul");
    dom.app.innerHTML = `
      <section class="screen">
        ${topbar("최종 추리", "4개 항목을 모두 제출", "dashboard")}
        <form class="card final-report-form" data-form="final">
          <span class="case-badge">최종 추리 보고서 작성</span>
          <fieldset class="suspect-field">
            <legend>${escapeHTML(activeStory.finalQuestions.culpritQuestion.question)}</legend>
            <div class="suspect-grid">
              ${suspects.map((character) => `<label class="suspect-card" style="--suspect-color: ${escapeAttr(character.color)}">
                <input type="radio" name="culprit" value="${character.id}">
                <span class="character-color" style="background:${escapeAttr(character.color)}"></span>
                <strong>${escapeHTML(character.name)}</strong>
                <small>${escapeHTML(character.role)}</small>
              </label>`).join("")}
            </div>
          </fieldset>
          <div class="field">
            <label for="amount">${escapeHTML(activeStory.finalQuestions.amountQuestion.question)}</label>
            <input id="amount" name="amount" type="text" placeholder="${escapeAttr(activeStory.finalQuestions.amountQuestion.placeholder || "예: 70,000원")}" aria-label="금액 또는 수량 입력">
          </div>
          <div class="field">
            <label for="time">${escapeHTML(activeStory.finalQuestions.timeQuestion.question)}</label>
            <input id="time" name="time" type="text" placeholder="${escapeAttr(activeStory.finalQuestions.timeQuestion.placeholder || "예: 20:10~20:20")}" aria-label="핵심 시간대 입력">
          </div>
          <h2 class="section-title">${escapeHTML(activeStory.finalQuestions.evidenceQuestion.question)}</h2>
          <p class="muted small">단서 수첩에 저장한 항목 중 최종 제출에 사용할 3개를 고르세요.</p>
          ${selected.length < 3 ? `<p class="warning-text">현재 저장된 단서가 ${selected.length}개입니다. 최종 제출에는 정확히 3개가 필요합니다.</p>` : ""}
          <div class="choice-list">
            ${selected.length ? selected.map((item) => `<label class="choice final-evidence-choice"><input type="checkbox" name="finalEvidence" value="${item.id}"><span>${escapeHTML(item.displayTitle)} <span class="muted small">(${escapeHTML(item.sourceTitle)})</span></span></label>`).join("") : `<div class="muted">먼저 단서 수첩에 단서를 저장해야 합니다.</div>`}
          </div>
          <button class="btn primary full" type="submit">최종 제출</button>
        </form>
      </section>
    `;
  }

  function renderResult() {
    const result = gameState.finalResult;
    if (!result) {
      navigate("dashboard");
      return;
    }

    const foundTrue = result.foundTrueClueIds.map((id) => evidenceIndex.get(id)).filter(Boolean);
    const missed = result.missedTrueClueIds.map((id) => evidenceIndex.get(id)).filter(Boolean);
    const wrong = result.wrongClueIds.map((id) => evidenceIndex.get(id)).filter(Boolean);
    const amountLabel = activeStory.ending.amountLabel || "실제 부족 금액";
    const timeLabel = activeStory.ending.keyTimeLabel || "핵심 시간대";

    dom.app.innerHTML = `
      <section class="screen">
        ${topbar("결과 리포트", activeStory.title, "dashboard")}
        <div class="result-report">
        <div class="result-grade stamp"><span>탐정 등급</span><strong>${escapeHTML(result.grade)}</strong><p>${result.percent}% 해결</p></div>
        <div class="report-grid">
          ${reportRow("점수", `${result.score}점`)}
          ${reportRow("범인 추리", result.culpritCorrect ? "성공" : "실패")}
          ${reportRow(amountLabel, result.amountCorrect ? "정답" : "오답")}
          ${reportRow(timeLabel, result.timeCorrect ? "정답" : "오답")}
          ${reportRow("결정 단서", `${result.requiredHits}/${result.requiredTotal}`)}
          ${reportRow("중간 추리", `${result.checkpointCorrect}/${activeStory.checkpointQuestions.length}`)}
        </div>
        <div class="card ending">
          <h2 class="section-title">진실</h2>
          <p><strong>범인:</strong> ${escapeHTML(activeStory.ending.culpritName)}</p>
          <p><strong>${escapeHTML(amountLabel)}:</strong> ${escapeHTML(activeStory.ending.amount)}</p>
          <p><strong>${escapeHTML(timeLabel)}:</strong> ${escapeHTML(activeStory.ending.keyTime)}</p>
          <p>${escapeHTML(activeStory.ending.truth)}</p>
          <p>${escapeHTML(activeStory.ending.explanation).replace(/\n/g, "<br>")}</p>
        </div>
        ${resultList("찾은 진짜 단서", foundTrue, true)}
        ${resultList("놓친 진짜 단서", missed, true)}
        ${resultList("잘못 선택한 단서", wrong, false)}
        </div>
        <div class="button-row">
          <button class="btn primary full" type="button" data-action="copy-result">결과 복사하기</button>
          <button class="btn accent full" type="button" data-action="start" data-id="${activeStory.id}">이 사건 다시하기</button>
          <button class="btn ghost full" type="button" data-action="home">사건 선택으로</button>
        </div>
        <div class="ad-slot">결과 리포트 하단 광고 영역 준비중</div>
      </section>
    `;
  }

  function renderSettings() {
    dom.app.innerHTML = `
      <section class="screen">
        ${topbar("설정", "읽기 편한 방식으로 조정", gameState.hasStarted ? "dashboard" : "home")}
        <form class="settings-list" data-form="settings">
          ${toggleRow("sound", "효과음 켜기", "단서 선택과 챕터 해금 때 짧은 효과음을 재생합니다.", gameState.settings.sound)}
          ${toggleRow("reduceMotion", "애니메이션 줄이기", "챕터 해금과 단서 선택 애니메이션을 줄입니다.", gameState.settings.reduceMotion)}
          ${toggleRow("autoExplain", "해설 자동 펼치기", "중간 추리 결과 해설을 자동으로 펼칩니다.", gameState.settings.autoExplain)}
          ${toggleRow("dimRead", "읽은 메시지 흐리게 표시", "이미 읽은 메시지를 다시 볼 때 조금 흐리게 표시합니다.", gameState.settings.dimRead)}
          ${toggleRow("compactMode", "촘촘한 읽기 모드", "긴 에피소드에서 카드 여백을 조금 줄입니다.", gameState.settings.compactMode)}
          <button class="btn primary full" type="submit">설정 저장</button>
        </form>
      </section>
    `;
  }

  function startEpisode(episodeId) {
    switchEpisode(episodeId, "intro");
    gameState.episodeSaves[episodeId] = createEpisodeProgress(episodeId);
    applyEpisodeProgress(gameState, episodeId, "intro");
    gameState.hasStarted = true;
    gameState.stats.playCount += 1;
    saveState();
    playSound("unlock");
    render();
  }

  function continueEpisode(episodeId) {
    switchEpisode(episodeId);
    gameState.screen = gameState.completed && gameState.finalResult ? "result" : "dashboard";
    saveState();
    render();
  }

  function navigate(screen) {
    gameState.screen = screen;
    saveState();
    render();
    window.scrollTo({ top: 0, behavior: gameState.settings.reduceMotion ? "auto" : "smooth" });
  }

  function selectChapter(chapterId) {
    if (!isChapterUnlocked(chapterId)) return;
    gameState.currentChapterId = chapterId;
    navigate("dashboard");
  }

  function openRoom(roomId) {
    if (!gameState.unlockedRooms.includes(roomId)) {
      showToast("아직 열리지 않은 자료방입니다.");
      return;
    }
    gameState.activeRoomId = roomId;
    navigate("room");
  }

  function toggleEvidence(id) {
    if (!evidenceIndex.has(id)) {
      showToast("이 항목은 단서로 저장할 수 없습니다.");
      return;
    }

    if (gameState.selectedClues.includes(id)) {
      gameState.selectedClues = gameState.selectedClues.filter((clueId) => clueId !== id);
      showToast("단서 수첩에서 제거했습니다.");
    } else {
      gameState.selectedClues.push(id);
      showToast("단서 수첩에 저장했습니다.");
      playSound("clue");
    }
    saveState();
    render();
  }

  function removeEvidence(id) {
    gameState.selectedClues = gameState.selectedClues.filter((clueId) => clueId !== id);
    saveState();
    showToast("단서를 제거했습니다.");
    render();
  }

  function submitCheckpoint(form) {
    const questionId = form.elements.questionId.value;
    const question = getCheckpoint(questionId);
    const checked = form.querySelector("input[name='choice']:checked");

    if (!question || !checked) {
      showToast("답을 선택해 주세요.");
      return;
    }

    const choiceIndex = Number(checked.value);
    const correct = choiceIndex === question.answerIndex;
    gameState.checkpointAnswers[question.id] = { choiceIndex, correct, answeredAt: new Date().toISOString() };
    const unlocked = unlockNextChapter(question.chapter, false);
    gameState.currentChapterId = question.chapter;
    saveState();
    showToast(`${correct ? "중간 추리 정답입니다." : "오답이어도 수사는 계속됩니다."}${unlocked ? ` ${unlocked.title} 해금` : ""}`);
    playSound(correct ? "unlock" : "click");
    renderCheckpoint();
  }

  function submitFinal(form) {
    const culpritId = form.elements.culprit.value;
    const amount = form.elements.amount.value.trim();
    const time = form.elements.time.value.trim();
    const finalEvidenceIds = Array.from(form.querySelectorAll("input[name='finalEvidence']:checked")).map((input) => input.value);

    if (!culpritId) return showToast("범인을 선택해 주세요.");
    if (!amount) return showToast("금액 또는 수량을 입력해 주세요.");
    if (!time) return showToast("핵심 시간대를 입력해 주세요.");
    if (finalEvidenceIds.length !== 3) return showToast("결정적 단서는 정확히 3개를 선택해야 합니다.");
    if (!window.confirm("최종 추리를 제출할까요? 제출 후 결과 리포트가 공개됩니다.")) return;

    const result = calculateResult({ culpritId, amount, time, finalEvidenceIds });
    gameState.finalResult = result;
    gameState.completed = true;
    gameState.screen = "result";
    gameState.stats.lastResult = { episodeId: activeStory.id, score: result.score, grade: result.grade, percent: result.percent };
    gameState.stats.episodeBest[activeStory.id] = pickBetterRecord(gameState.stats.episodeBest[activeStory.id], result);
    if (result.score > gameState.stats.bestScore) {
      gameState.stats.bestScore = result.score;
      gameState.stats.bestGrade = result.grade;
    }
    saveState();
    playSound("unlock");
    render();
  }

  function submitSettings(form) {
    gameState.settings.sound = Boolean(form.elements.sound.checked);
    gameState.settings.reduceMotion = Boolean(form.elements.reduceMotion.checked);
    gameState.settings.autoExplain = Boolean(form.elements.autoExplain.checked);
    gameState.settings.dimRead = Boolean(form.elements.dimRead.checked);
    gameState.settings.compactMode = Boolean(form.elements.compactMode.checked);
    saveState();
    applySettings();
    showToast("설정을 저장했습니다.");
    render();
  }

  function calculateResult(finalAnswer) {
    const requiredClueIds = activeStory.finalQuestions.evidenceQuestion.requiredClueIds;
    const allTrueClueIds = Array.from(evidenceIndex.values()).filter((item) => item.clue).map((item) => item.id);
    const selectedUnique = Array.from(new Set(gameState.selectedClues));
    const foundTrueClueIds = selectedUnique.filter((id) => evidenceIndex.get(id) && evidenceIndex.get(id).clue);
    const wrongClueIds = selectedUnique.filter((id) => evidenceIndex.get(id) && !evidenceIndex.get(id).clue);
    const missedTrueClueIds = allTrueClueIds.filter((id) => !selectedUnique.includes(id));
    const evidenceHits = finalAnswer.finalEvidenceIds.filter((id) => requiredClueIds.includes(id));
    const checkpointCorrect = Object.values(gameState.checkpointAnswers).filter((answer) => answer.correct).length;
    const culpritCorrect = finalAnswer.culpritId === activeStory.finalQuestions.culpritQuestion.answerCharacterId;
    const amountCorrect = isAccepted(finalAnswer.amount, activeStory.finalQuestions.amountQuestion.acceptedAnswers);
    const timeCorrect = isAccepted(finalAnswer.time, activeStory.finalQuestions.timeQuestion.acceptedAnswers);

    let score = 0;
    if (culpritCorrect) score += 500;
    if (amountCorrect) score += 300;
    if (timeCorrect) score += 300;
    score += evidenceHits.length * 150;
    score += foundTrueClueIds.length * 50;
    score -= wrongClueIds.length * 20;
    score += checkpointCorrect * 100;
    if (requiredClueIds.every((id) => selectedUnique.includes(id))) score += 300;
    score = Math.max(0, score);

    const gradeTargetTrueClues = Math.min(allTrueClueIds.length, activeStory.gradeTargetTrueClues || 25);
    const maxScore = 500 + 300 + 300 + (requiredClueIds.length * 150) + (gradeTargetTrueClues * 50) + (activeStory.checkpointQuestions.length * 100) + 300;
    const percent = Math.min(100, Math.round((score / maxScore) * 100));

    return {
      episodeId: activeStory.id,
      score,
      maxScore,
      percent,
      grade: getGrade(percent),
      culpritId: finalAnswer.culpritId,
      culpritCorrect,
      amount: finalAnswer.amount,
      amountCorrect,
      time: finalAnswer.time,
      timeCorrect,
      finalEvidenceIds: finalAnswer.finalEvidenceIds,
      requiredHits: evidenceHits.length,
      requiredTotal: requiredClueIds.length,
      checkpointCorrect,
      foundTrueClueIds,
      missedTrueClueIds,
      wrongClueIds,
      completedAt: new Date().toISOString()
    };
  }

  function pickBetterRecord(previous, result) {
    if (!previous || result.score > previous.score) {
      return { score: result.score, grade: result.grade, percent: result.percent, completedAt: result.completedAt };
    }
    return previous;
  }

  function unlockNextChapter(chapterId, moveToNext = true) {
    const index = chapterOrder.indexOf(chapterId);
    const next = activeStory.chapters[index + 1];
    if (!next || gameState.unlockedChapters.includes(next.id)) return null;
    gameState.unlockedChapters.push(next.id);
    if (moveToNext) gameState.currentChapterId = next.id;
    syncUnlocks();
    return next;
  }

  function syncUnlocks() {
    gameState.unlockedRooms = getRoomUnlocks(activeStory, gameState.unlockedChapters);
  }

  function getRoomUnlocks(story, chapterIds) {
    const rooms = new Set();
    story.chapters
      .filter((chapter) => chapterIds.includes(chapter.id))
      .forEach((chapter) => {
        chapter.unlocks.filter((item) => item.startsWith("room-")).forEach((roomId) => rooms.add(roomId));
      });
    return Array.from(rooms);
  }

  function getUnlockedRooms() {
    syncUnlocks();
    return activeStory.rooms.filter((room) => gameState.unlockedRooms.includes(room.id));
  }

  function isChapterUnlocked(chapterId) {
    return gameState.unlockedChapters.includes(chapterId);
  }

  function getChapter(chapterId) {
    return activeStory.chapters.find((chapter) => chapter.id === chapterId) || activeStory.chapters[0];
  }

  function getCheckpoint(questionId) {
    return activeStory.checkpointQuestions.find((question) => question.id === questionId);
  }

  function getNextChapter(chapterId) {
    const index = chapterOrder.indexOf(chapterId);
    return activeStory.chapters[index + 1] || null;
  }

  function characterById(id) {
    return activeStory.characters.find((character) => character.id === id);
  }

  function getMessageTypeLabel(type) {
    if (type === "system") return "시스템 메시지";
    if (type === "photo") return "사진 설명 카드";
    if (type === "file") return "파일 공유";
    return "채팅 메시지";
  }

  function storyCoverImage(story) {
    if (story && story.coverImage) return story.coverImage;
    return "assets/case-covers/festival-money.svg";
  }

  function calculateEpisodeProgress(save, story) {
    if (!save || !story || !save.hasStarted) return 0;
    if (save.completed || save.finalResult) return 100;

    const checkpoints = story.checkpointQuestions || [];
    const totalSteps = checkpoints.length + 1;
    if (!totalSteps) return 0;

    const answers = save.checkpointAnswers || {};
    const completedCheckpoints = checkpoints.filter((question) => answers[question.id]).length;
    const progress = Math.round((completedCheckpoints / totalSteps) * 100);
    return Math.max(0, Math.min(99, progress));
  }

  function iconImage(name) {
    return `assets/icons/${name}.svg`;
  }

  function memoKind(title) {
    if (title.includes("정산") || title.includes("금액") || title.includes("매출")) return "금액 테이블";
    if (title.includes("로그") || title.includes("기록") || title.includes("접속")) return "로그 자료";
    if (title.includes("파일") || title.includes("원본") || title.includes("대조")) return "파일 기록";
    return "수사 메모";
  }

  function topbar(title, subtitle, backAction) {
    return `
      <header class="topbar">
        <button class="btn icon-btn" type="button" data-action="${backAction}" aria-label="뒤로가기">‹</button>
        <div class="topbar-title"><strong>${escapeHTML(title)}</strong><span>${escapeHTML(subtitle || "")}</span></div>
        <button class="btn icon-btn" type="button" data-action="settings" aria-label="설정">설정</button>
      </header>
    `;
  }

  function characterCard(character) {
    return `
      <div class="character-item">
        <span class="character-color" style="background:${escapeAttr(character.color)}"></span>
        <div><strong>${escapeHTML(character.name)} <span class="muted small">${escapeHTML(character.role)}</span></strong><p class="muted small">${escapeHTML(character.description)}</p></div>
      </div>
    `;
  }

  function roomListItem(room) {
    const visibleMessages = room.messages.filter((message) => isChapterUnlocked(message.chapter)).length;
    return `
      <button class="room-item" type="button" data-action="open-room" data-id="${room.id}">
        <span><strong>${escapeHTML(room.title)}</strong><span>${escapeHTML(room.description)} · 열린 메시지 ${visibleMessages}개</span></span>
        <span aria-hidden="true">›</span>
      </button>
    `;
  }

  function renderMessage(message) {
    const selected = gameState.selectedClues.includes(message.id);
    const read = gameState.settings.dimRead && gameState.readMessageIds.includes(message.id);
    const sender = characterById(message.senderId);
    const senderName = sender ? sender.name : "시스템";
    const badge = selected ? `<span class="select-badge pin-badge"><img src="${iconImage("evidence-pin")}" alt="" aria-hidden="true">수첩에 저장됨</span>` : "";
    const selectedClass = selected ? "selected" : "";
    const readClass = read ? "read" : "";
    const label = `단서 후보 저장: ${message.description || message.text}`;

    if (message.type === "system") {
      return `<div class="message-wrap ${readClass}"><button class="system-card clickable-evidence ${selectedClass}" type="button" data-action="toggle-evidence" data-id="${message.id}" aria-label="${escapeAttr(label)}">${escapeHTML(message.text)}${badge}</button></div>`;
    }

    if (message.type === "photo" || message.type === "file") {
      const className = message.type === "photo" ? "photo-card" : "file-card";
      return `
        <div class="message-wrap ${readClass}">
          <div class="message-meta"><span>${escapeHTML(senderName)}</span><span>${escapeHTML(message.time)}</span></div>
          <button class="${className} clickable-evidence ${selectedClass}" type="button" data-action="toggle-evidence" data-id="${message.id}" aria-label="${escapeAttr(label)}">
            <strong>${escapeHTML(message.text)}</strong><span>${escapeHTML(message.description || "")}</span>${badge}
          </button>
        </div>
      `;
    }

    return `
      <div class="message-wrap ${readClass}">
        <div class="message-meta"><span>${escapeHTML(senderName)}</span><span>${escapeHTML(message.time)}</span></div>
        <button class="bubble clickable-evidence ${selectedClass}" type="button" data-action="toggle-evidence" data-id="${message.id}" aria-label="${escapeAttr(label)}">${escapeHTML(message.text)}${badge}</button>
      </div>
    `;
  }

  function evidenceCard(item, options = {}) {
    const related = item.relatedCharacterIds.map((id) => characterById(id)).filter(Boolean).map((character) => character.name).join(", ");
    return `
      <div class="evidence-item">
        <div class="evidence-head">
          <span class="case-badge">검토 필요</span>
          <span class="soft-badge">${escapeHTML(item.sourceType)}</span>
        </div>
        <strong>${escapeHTML(item.displayTitle)}</strong>
        <p class="muted small">출처: ${escapeHTML(item.sourceTitle)} · ${escapeHTML(getChapter(item.chapter).title)}</p>
        <p>${escapeHTML(item.text)}</p>
        ${related ? `<p class="evidence-related">관련 인물: ${escapeHTML(related)}</p>` : ""}
        ${options.reveal ? `<p class="small"><strong>${item.clue ? "진짜 단서" : "가짜 단서"}:</strong> ${escapeHTML(item.clue ? item.clueExplanation : "사건 해결에는 직접 연결되지 않는 항목입니다.")}</p>` : ""}
        ${options.removable ? `<button class="btn ghost" type="button" data-action="remove-evidence" data-id="${item.id}">수첩에서 제거</button>` : ""}
      </div>
    `;
  }

  function resultList(title, items, reveal) {
    return `
      <details class="card" ${items.length <= 4 ? "open" : ""}>
        <summary>${escapeHTML(title)} ${items.length}개</summary>
        <div class="list" style="margin-top: 12px;">${items.length ? items.map((item) => evidenceCard(item, { reveal })).join("") : `<p class="muted small">없음</p>`}</div>
      </details>
    `;
  }

  function reportRow(label, value) {
    return `<div class="report-row"><span>${escapeHTML(label)}</span><strong>${escapeHTML(value)}</strong></div>`;
  }

  function toggleRow(name, title, description, checked) {
    return `
      <label class="toggle-row">
        <span><strong>${escapeHTML(title)}</strong><span class="muted small">${escapeHTML(description)}</span></span>
        <input type="checkbox" name="${name}" ${checked ? "checked" : ""}>
      </label>
    `;
  }

  function renderPremiumPacks() {
    const packs = activeStory.premiumPacks || ["학교생활 사건팩", "알바 사건팩", "회사생활 사건팩", "장편 시즌팩"];
    return `<div class="card"><h2 class="section-title">프리미엄 사건팩 준비중</h2><div class="grid two">${packs.map((pack) => `<div class="locked-pack">${escapeHTML(pack)} · 잠금 예정</div>`).join("")}</div></div>`;
  }

  function markMessagesRead(messages) {
    const before = gameState.readMessageIds.length;
    const readSet = new Set(gameState.readMessageIds);
    messages.forEach((message) => readSet.add(message.id));
    gameState.readMessageIds = Array.from(readSet);
    if (gameState.readMessageIds.length !== before) saveState();
  }

  function isAccepted(value, acceptedAnswers) {
    const normalized = normalizeAnswer(value);
    return acceptedAnswers.some((answer) => normalizeAnswer(answer) === normalized);
  }

  function normalizeAnswer(value) {
    return String(value).trim().toLowerCase().replace(/\s+/g, "").replace(/,/g, "").replace(/-/g, "~");
  }

  function getGrade(percent) {
    if (percent >= 90) return "S급 명탐정";
    if (percent >= 75) return "A급 추리 고수";
    if (percent >= 60) return "B급 현장 감각 있음";
    if (percent >= 45) return "C급 수습 탐정";
    return "D급 헛다리 탐정";
  }

  function copyResult() {
    const result = gameState.finalResult;
    if (!result) return;
    const text = [
      "톡탐정 사건 해결 결과",
      `사건: ${activeStory.title}`,
      `플레이 결과: ${result.grade}`,
      `점수: ${result.score}점`,
      `범인 추리: ${result.culpritCorrect ? "성공" : "실패"}`,
      `핵심 단서 발견: ${result.requiredHits}/${result.requiredTotal}`,
      "단톡방 속 거짓말, 너도 찾아봐."
    ].join("\n");

    copyText(text).then(() => {
      showToast("결과를 복사했습니다.");
      playSound("clue");
    });
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise((resolve) => {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      resolve();
    });
  }

  function applySettings() {
    if (!document.body || !gameState) return;
    document.body.classList.toggle("reduce-motion", Boolean(gameState.settings.reduceMotion));
    document.body.classList.toggle("compact-mode", Boolean(gameState.settings.compactMode));
  }

  function playSound(kind) {
    if (!gameState.settings.sound) return;
    try {
      audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const now = audioContext.currentTime;
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(kind === "unlock" ? 720 : kind === "clue" ? 520 : 360, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.08, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.15);
    } catch (error) {
      // 효과음 실패는 무시한다.
    }
  }

  function showToast(message) {
    if (!dom.toast) return;
    dom.toast.textContent = message;
    dom.toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => dom.toast.classList.remove("show"), 2300);
  }

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeAttr(value) {
    return escapeHTML(value);
  }
})();
