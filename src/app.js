const STORAGE_KEY = "studio-critic-ai:v1";
export const MODEL_NAME = "gemini-2.5-flash";
const MAX_INPUT_CHARS = 4000;
const CATEGORIES = [
  "컨셉", "도시 맥락", "프로그램", "동선", "구조", "설비", "환경", "법규", "매스",
  "평면", "단면", "입면", "재료", "시공", "표현 / 패널", "발표 논리", "모형", "기타",
];
const TASK_STATUSES = ["todo", "doing", "done", "hold"];
const STATUS_LABELS = { todo: "해야 함", doing: "진행 중", done: "완료", hold: "보류" };
const PRIORITY_LABELS = { high: "높음", normal: "보통", low: "낮음" };

let state = loadState();
let selectedFeedbackId = null;
let aiClientPromise = createAiClient();

const $ = (id) => document.getElementById(id);

const els = {
  projectList: $("projectList"), projectForm: $("projectForm"), activeProjectName: $("activeProjectName"),
  aiModePill: $("aiModePill"), feedbackForm: $("feedbackForm"), feedbackText: $("feedbackText"), inputLength: $("inputLength"),
  feedbackTimeline: $("feedbackTimeline"), analysisCard: $("analysisCard"), taskList: $("taskList"), outputPanel: $("outputPanel"),
  toast: $("toast"), importFile: $("importFile"),
};

function uid(prefix) {
  return `${prefix}_${crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}_${Math.random().toString(16).slice(2)}`}`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function nowIso() {
  return new Date().toISOString();
}

function sampleAnalysis() {
  return {
    summary: "폐기물 처리 동선과 관람 동선을 분리하고 CO₂ 순환 시스템을 단면적으로 드러내야 한다.",
    categories: ["동선", "단면", "환경", "프로그램"],
    designIssue: "산업 기능과 관람 기능이 인접해 안전·위생·교육 경험의 경계가 불명확하고, 핵심 환경 시스템이 공간 경험으로 충분히 번역되지 않았다.",
    actionItems: [
      { title: "폐기물 반입 동선과 관람 동선을 분리한 평면 대안 작성", priority: "high", reason: "서로 다른 이용자와 물류 흐름의 충돌을 줄여 프로그램의 설득력을 높이기 위해서다.", outputType: "평면도" },
      { title: "하역장-열분해 모듈-CO₂ 순환 설비 연결을 단면 다이어그램으로 표현", priority: "high", reason: "기술 시스템이 건축 공간에서 어떻게 작동하는지 리뷰어가 한눈에 이해해야 한다.", outputType: "단면도 / 다이어그램" },
      { title: "관람자가 시스템을 안전하게 관찰하는 발표 논리 정리", priority: "normal", reason: "산업 시설과 교육 프로그램의 결합 의도를 명확히 말할 필요가 있다.", outputType: "발표문" },
    ],
    nextCriticChecklist: ["분리된 동선 평면", "하역장과 열분해 모듈을 잇는 핵심 단면", "CO₂ 순환 시스템 공간 다이어그램"],
    presentationLines: ["이 프로젝트는 폐기물 처리 과정을 숨기는 대신, 안전하게 관찰 가능한 환경 교육의 장으로 전환합니다."],
    portfolioNarrative: "초기 계획은 폐기물 처리와 관람 프로그램을 병치하는 데 머물렀지만, 크리틱 이후 물류 동선과 관람 동선을 분리하고 CO₂ 순환 시스템을 단면의 주된 서사로 드러내는 방향으로 발전했다.",
    riskQuestions: ["관람 동선이 산업 동선과 만나는 지점의 안전 기준은 무엇인가?", "CO₂ 순환 시스템이 실제 공간에서 보이는 장면은 어디인가?"],
  };
}

function createSampleState() {
  const projectId = uid("project");
  const feedbackId = uid("feedback");
  const analysis = sampleAnalysis();
  const tasks = analysis.actionItems.map((item) => ({
    id: uid("task"), title: item.title, priority: item.priority, category: analysis.categories[0] || "기타",
    reason: item.reason, outputType: item.outputType, status: "todo", sourceFeedbackId: feedbackId, createdAt: nowIso(),
  }));
  return {
    projects: [{
      id: projectId,
      title: "시흥 IC 모듈러 폐기물 처리 시설",
      topic: "도시 인프라를 환경 교육 공간으로 전환하는 모듈러 처리 시설",
      site: "시흥 IC 인근 산업·교통 인프라 경계부",
      concept: "폐기물 처리, CO₂ 순환, 관람 교육 동선을 분리하면서도 단면적으로 연결하는 공개형 인프라",
      stage: "중간 크리틱 이후 발전안",
      deadline: today(),
      notes: "샘플 모드에서는 Firebase 설정 없이도 전체 UI와 Mock 분석 흐름을 체험할 수 있습니다.",
      createdAt: nowIso(), updatedAt: nowIso(),
      feedbacks: [{
        id: feedbackId, date: today(), source: "교수",
        rawText: "폐기물 반입 동선과 관람 동선이 너무 가까워 보인다. CO₂ 순환 시스템은 흥미롭지만, 공간적으로 어떻게 드러나는지 약하다. 하역장과 열분해 모듈의 연결 관계를 단면에서 더 명확히 보여줘야 한다.",
        importance: "high", keywords: ["동선", "CO₂", "단면", "열분해"], analysis, createdAt: nowIso(),
      }],
      tasks,
    }],
    activeProjectId: projectId,
  };
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return createSampleState();
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed.projects)) throw new Error("Invalid data");
    return parsed.projects.length ? parsed : createSampleState();
  } catch {
    return createSampleState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function activeProject() {
  return state.projects.find((project) => project.id === state.activeProjectId) || state.projects[0];
}

async function createAiClient() {
  try {
    const configModule = await import("./firebaseConfig.js");
    const config = configModule.firebaseConfig;
    if (!config?.apiKey || config.apiKey.includes("YOUR_")) throw new Error("Firebase 설정이 누락되었습니다.");
    const [{ initializeApp }, { getAI, getGenerativeModel, GoogleAIBackend }] = await Promise.all([
      import("https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/11.10.0/firebase-ai.js"),
    ]);
    const app = initializeApp(config);
    const ai = getAI(app, { backend: new GoogleAIBackend() });
    const model = getGenerativeModel(ai, { model: MODEL_NAME });
    return { available: true, model };
  } catch (error) {
    return { available: false, error };
  }
}

function buildAnalysisPrompt(project, feedback) {
  return `너는 건축학과 설계 스튜디오 크리틱을 정리하는 AI 어시스턴트다. 교수 피드백, 팀원 피드백, 클라이언트 코멘트를 읽고, 이를 건축 설계자가 바로 실행할 수 있는 작업 리스트와 발표 논리로 변환한다.

원칙:
1. 피드백을 단순 요약하지 말고 설계상 의미를 해석한다.
2. 다음 작업을 구체적인 산출물 단위로 제안한다.
3. 건축 전용 카테고리로 분류한다. 허용 카테고리: ${CATEGORIES.join(", ")}
4. 발표 문장은 과장하지 말고 실제 발표에서 쓸 수 있게 만든다.
5. 포트폴리오 문장은 설계 발전 과정처럼 작성한다.
6. JSON만 반환한다. 마크다운 코드블록을 쓰지 않는다.

프로젝트:
- 프로젝트명: ${project.title}
- 주제: ${project.topic}
- 대지: ${project.site}
- 핵심 컨셉: ${project.concept}
- 단계: ${project.stage}

피드백:
- 날짜: ${feedback.date}
- 출처: ${feedback.source}
- 중요도: ${feedback.importance}
- 키워드: ${feedback.keywords.join(", ")}
- 원문: ${feedback.rawText}

반드시 아래 JSON 스키마와 동일한 키로 답해라:
{
  "summary": "핵심 피드백 한 문장 요약",
  "categories": ["동선", "컨셉", "단면"],
  "designIssue": "설계상 문제가 무엇인지 설명",
  "actionItems": [{ "title": "해야 할 작업", "priority": "high", "reason": "왜 해야 하는지", "outputType": "평면도 / 단면도 / 다이어그램 / 발표문 / 패널" }],
  "nextCriticChecklist": ["다음 크리틱 때 보여줘야 할 항목"],
  "presentationLines": ["발표 때 사용할 수 있는 문장"],
  "portfolioNarrative": "포트폴리오에 넣을 수 있는 설계 발전 서사",
  "riskQuestions": ["교수나 리뷰어가 다시 물어볼 가능성이 높은 질문"]
}`;
}

async function analyzeWithAi(project, feedback) {
  const client = await aiClientPromise;
  if (!client.available) throw new Error("Firebase 설정이 누락되었습니다. 샘플 Mock 분석으로 대체합니다.");
  const result = await client.model.generateContent(buildAnalysisPrompt(project, feedback));
  const text = result.response.text();
  return normalizeAnalysis(parseJsonLoose(text));
}

function parseJsonLoose(text) {
  const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
  try { return JSON.parse(cleaned); } catch {}
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) return JSON.parse(cleaned.slice(start, end + 1));
  throw new Error("AI 응답 JSON 파싱에 실패했습니다.");
}

function normalizeAnalysis(value) {
  const fallback = sampleAnalysis();
  const categories = Array.isArray(value.categories) ? value.categories.filter((cat) => CATEGORIES.includes(cat)) : [];
  return {
    summary: value.summary || fallback.summary,
    categories: categories.length ? categories : ["기타"],
    designIssue: value.designIssue || fallback.designIssue,
    actionItems: Array.isArray(value.actionItems) && value.actionItems.length ? value.actionItems.map((item) => ({
      title: item.title || "설계 수정 작업", priority: ["high", "normal", "low"].includes(item.priority) ? item.priority : "normal",
      reason: item.reason || "크리틱 피드백을 설계 산출물로 반영하기 위해서입니다.", outputType: item.outputType || "다이어그램",
    })) : fallback.actionItems,
    nextCriticChecklist: Array.isArray(value.nextCriticChecklist) ? value.nextCriticChecklist : fallback.nextCriticChecklist,
    presentationLines: Array.isArray(value.presentationLines) ? value.presentationLines : fallback.presentationLines,
    portfolioNarrative: value.portfolioNarrative || fallback.portfolioNarrative,
    riskQuestions: Array.isArray(value.riskQuestions) ? value.riskQuestions : fallback.riskQuestions,
  };
}

function mockAnalysisFromFeedback(feedback) {
  const analysis = sampleAnalysis();
  const matched = CATEGORIES.filter((cat) => `${feedback.rawText} ${feedback.keywords.join(" ")}`.includes(cat));
  return { ...analysis, categories: matched.length ? matched : analysis.categories, summary: feedback.rawText.slice(0, 70) + (feedback.rawText.length > 70 ? "…" : "") };
}

function addTasksFromAnalysis(project, feedbackId, analysis) {
  const category = analysis.categories[0] || "기타";
  const existingTitles = new Set(project.tasks.map((task) => task.title));
  analysis.actionItems.forEach((item) => {
    if (existingTitles.has(item.title)) return;
    project.tasks.push({
      id: uid("task"), title: item.title, priority: item.priority, category, reason: item.reason,
      outputType: item.outputType, status: "todo", sourceFeedbackId: feedbackId, createdAt: nowIso(),
    });
  });
}

function render() {
  const project = activeProject();
  if (!project) return;
  els.activeProjectName.textContent = project.title;
  renderProjects(project);
  fillProjectForm(project);
  renderFeedbacks(project);
  renderAnalysis(project);
  renderTasks(project);
  updateAiPill();
}

async function updateAiPill() {
  const client = await aiClientPromise;
  els.aiModePill.textContent = client.available ? `Firebase AI Logic · ${MODEL_NAME}` : "샘플 / Mock 모드";
  els.aiModePill.className = `status-pill ${client.available ? "ok" : "warn"}`;
}

function renderProjects(active) {
  els.projectList.innerHTML = state.projects.map((project) => `
    <button class="project-item ${project.id === active.id ? "active" : ""}" data-project-id="${project.id}" type="button">
      <strong>${escapeHtml(project.title)}</strong><span>${escapeHtml(project.stage || "단계 미정")}</span>
    </button>`).join("");
}

function fillProjectForm(project) {
  $("projectTitle").value = project.title || ""; $("projectTopic").value = project.topic || "";
  $("projectSite").value = project.site || ""; $("projectStage").value = project.stage || "";
  $("projectDeadline").value = project.deadline || ""; $("projectConcept").value = project.concept || "";
  $("projectNotes").value = project.notes || "";
}

function renderFeedbacks(project) {
  els.feedbackTimeline.innerHTML = project.feedbacks.length ? project.feedbacks.map((fb) => `
    <button class="timeline-item ${fb.id === selectedFeedbackId ? "active" : ""}" data-feedback-id="${fb.id}" type="button">
      <div><span class="date">${fb.date}</span><span class="source">${fb.source}</span><span class="importance ${fb.importance}">${PRIORITY_LABELS[fb.importance] || fb.importance}</span></div>
      <p>${escapeHtml(fb.rawText)}</p>
      <div class="tags">${fb.keywords.map(tag).join("")}${(fb.analysis?.categories || []).map(tag).join("")}</div>
    </button>`).join("") : `<div class="empty">아직 피드백이 없습니다.</div>`;
}

function renderAnalysis(project) {
  const feedback = project.feedbacks.find((fb) => fb.id === selectedFeedbackId) || project.feedbacks.at(-1);
  if (!feedback?.analysis) {
    els.analysisCard.innerHTML = `<div class="empty">분석된 피드백이 없습니다.</div>`;
    return;
  }
  const a = feedback.analysis;
  els.analysisCard.innerHTML = `
    <h3>${escapeHtml(a.summary)}</h3>
    <div class="tags">${a.categories.map(tag).join("")}</div>
    <h4>설계 이슈</h4><p>${escapeHtml(a.designIssue)}</p>
    <h4>다음 크리틱 체크리스트</h4><ul>${a.nextCriticChecklist.map(li).join("")}</ul>
    <h4>발표 문장</h4><ul>${a.presentationLines.map(li).join("")}</ul>
    <h4>포트폴리오 서사</h4><p>${escapeHtml(a.portfolioNarrative)}</p>
    <h4>예상 질문</h4><ul>${a.riskQuestions.map(li).join("")}</ul>`;
}

function renderTasks(project) {
  els.taskList.innerHTML = project.tasks.length ? project.tasks.map((task) => `
    <article class="task-card">
      <div class="task-top"><strong>${escapeHtml(task.title)}</strong><button data-task-id="${task.id}" class="status-cycle ${task.status}" type="button">${STATUS_LABELS[task.status]}</button></div>
      <div class="tags">${tag(task.category)}${tag(PRIORITY_LABELS[task.priority] || task.priority)}${tag(task.outputType)}</div>
      <p>${escapeHtml(task.reason)}</p>
    </article>`).join("") : `<div class="empty">AI 분석 후 작업 카드가 생성됩니다.</div>`;
}

function generateCriticPrep(project) {
  const activeTasks = project.tasks.filter((task) => task.status !== "done");
  const allChecklist = project.feedbacks.flatMap((fb) => fb.analysis?.nextCriticChecklist || []);
  const questions = project.feedbacks.flatMap((fb) => fb.analysis?.riskQuestions || []);
  const lines = project.feedbacks.flatMap((fb) => fb.analysis?.presentationLines || []);
  els.outputPanel.className = "output-panel";
  els.outputPanel.innerHTML = `
    <h3>다음 크리틱 준비</h3>
    <h4>이번 주 반드시 수정할 것</h4><ul>${activeTasks.slice(0, 6).map((task) => li(`${task.title} · ${task.outputType}`)).join("") || li("완료되지 않은 작업이 없습니다.")}</ul>
    <h4>보여줘야 할 도면 / 다이어그램 / 이미지</h4><ul>${unique(allChecklist).slice(0, 8).map(li).join("") || li("분석 결과를 먼저 생성하세요.")}</ul>
    <h4>리뷰어 예상 질문</h4><ul>${unique(questions).slice(0, 6).map(li).join("") || li("예상 질문이 없습니다.")}</ul>
    <h4>답변 준비 문장</h4><ul>${unique(lines).slice(0, 6).map(li).join("") || li("발표 문장을 먼저 생성하세요.")}</ul>
    <h4>발표 순서 제안</h4><ol><li>초기 문제의식과 대지 조건</li><li>가장 중요한 크리틱 피드백</li><li>변경된 평면·단면·동선 전략</li><li>이번 주 산출물과 남은 리스크</li></ol>`;
}

function generatePortfolioNarrative(project) {
  const narratives = project.feedbacks.map((fb) => fb.analysis?.portfolioNarrative).filter(Boolean);
  const doneTasks = project.tasks.filter((task) => task.status === "done");
  els.outputPanel.className = "output-panel";
  els.outputPanel.innerHTML = `
    <h3>포트폴리오 서사</h3>
    <h4>초기 문제의식</h4><p>${escapeHtml(project.concept || project.topic || "초기 설계 의도를 입력하면 더 구체적인 서사가 만들어집니다.")}</p>
    <h4>주요 피드백</h4><ul>${project.feedbacks.map((fb) => li(fb.analysis?.summary || fb.rawText)).join("")}</ul>
    <h4>설계 변경 방향</h4><p>${escapeHtml(narratives.join(" ") || "누적 피드백을 바탕으로 설계 변경 과정을 정리하세요.")}</p>
    <h4>최종 설계 논리</h4><p>${escapeHtml(doneTasks.length ? `완료된 작업(${doneTasks.map((task) => task.title).join(", ")})을 통해 크리틱에서 제기된 문제를 도면과 발표 논리로 전환했다.` : "완료된 작업을 체크하면 최종 설계 논리가 더 명확해집니다.")}</p>
    <h4>포트폴리오용 설명문</h4><p>${escapeHtml(`${project.title}는 ${project.site || "대지"}에서 ${project.topic || "건축적 문제"}를 다룬다. 크리틱 과정에서 제기된 ${unique(project.feedbacks.flatMap((fb) => fb.analysis?.categories || [])).join(", ") || "핵심 이슈"}를 중심으로 평면, 단면, 발표 논리를 재구성하며 설계가 발전했다.`)}</p>`;
}

function tag(text) { return `<span class="tag">${escapeHtml(text)}</span>`; }
function li(text) { return `<li>${escapeHtml(text)}</li>`; }
function unique(items) { return [...new Set(items.filter(Boolean))]; }
function escapeHtml(value = "") {
  return String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
}

function toast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  setTimeout(() => els.toast.classList.remove("show"), 3600);
}

async function saveFeedbackAndAnalyze(event) {
  event.preventDefault();
  const project = activeProject();
  const rawText = $("feedbackText").value.trim();
  if (rawText.length > MAX_INPUT_CHARS && !confirm("입력이 4,000자를 넘었습니다. 무료 한도 관리를 위해 줄이는 것을 권장합니다. 그래도 진행할까요?")) return;
  const feedback = {
    id: uid("feedback"), date: $("feedbackDate").value || today(), source: $("feedbackSource").value,
    rawText, importance: $("feedbackImportance").value, keywords: $("feedbackKeywords").value.split(",").map((v) => v.trim()).filter(Boolean),
    analysis: null, createdAt: nowIso(),
  };
  project.feedbacks.push(feedback);
  selectedFeedbackId = feedback.id;
  try {
    toast("AI 분석 중입니다…");
    feedback.analysis = await analyzeWithAi(project, feedback);
    toast("AI 분석이 완료되었습니다.");
  } catch (error) {
    feedback.analysis = mockAnalysisFromFeedback(feedback);
    toast(`${error.message || "Gemini 모델 호출에 실패했습니다."} 무료 한도, 모델명, 네트워크를 확인하세요.`);
  }
  addTasksFromAnalysis(project, feedback.id, feedback.analysis);
  project.updatedAt = nowIso();
  saveState();
  event.target.reset();
  $("feedbackDate").value = today();
  updateInputLength();
  render();
}

function bindEvents() {
  $("newProjectBtn").addEventListener("click", () => {
    const id = uid("project");
    state.projects.unshift({ id, title: "새 건축 프로젝트", topic: "", site: "", concept: "", stage: "", deadline: "", notes: "", createdAt: nowIso(), updatedAt: nowIso(), feedbacks: [], tasks: [] });
    state.activeProjectId = id; selectedFeedbackId = null; saveState(); render();
  });
  els.projectList.addEventListener("click", (event) => {
    const item = event.target.closest("[data-project-id]");
    if (!item) return; state.activeProjectId = item.dataset.projectId; selectedFeedbackId = null; saveState(); render();
  });
  els.projectForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const project = activeProject();
    Object.assign(project, { title: $("projectTitle").value, topic: $("projectTopic").value, site: $("projectSite").value, stage: $("projectStage").value, deadline: $("projectDeadline").value, concept: $("projectConcept").value, notes: $("projectNotes").value, updatedAt: nowIso() });
    saveState(); render(); toast("프로젝트가 저장되었습니다.");
  });
  els.feedbackForm.addEventListener("submit", saveFeedbackAndAnalyze);
  els.feedbackText.addEventListener("input", updateInputLength);
  els.feedbackTimeline.addEventListener("click", (event) => {
    const item = event.target.closest("[data-feedback-id]");
    if (!item) return; selectedFeedbackId = item.dataset.feedbackId; render();
  });
  els.taskList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-task-id]");
    if (!button) return;
    const task = activeProject().tasks.find((item) => item.id === button.dataset.taskId);
    task.status = TASK_STATUSES[(TASK_STATUSES.indexOf(task.status) + 1) % TASK_STATUSES.length];
    activeProject().updatedAt = nowIso(); saveState(); render();
  });
  $("analyzeBtn").addEventListener("click", async () => {
    const project = activeProject();
    const feedback = project.feedbacks.find((fb) => fb.id === selectedFeedbackId) || project.feedbacks.at(-1);
    if (!feedback) return toast("분석할 피드백을 먼저 입력하세요.");
    try { feedback.analysis = await analyzeWithAi(project, feedback); toast("AI 재분석이 완료되었습니다."); }
    catch (error) { feedback.analysis = mockAnalysisFromFeedback(feedback); toast(`${error.message || "Gemini 모델 호출에 실패했습니다."} Mock 결과로 대체했습니다.`); }
    addTasksFromAnalysis(project, feedback.id, feedback.analysis); saveState(); render();
  });
  $("criticPrepBtn").addEventListener("click", () => generateCriticPrep(activeProject()));
  $("portfolioBtn").addEventListener("click", () => generatePortfolioNarrative(activeProject()));
  $("exportBtn").addEventListener("click", exportData);
  els.importFile.addEventListener("change", importData);
  $("resetSampleBtn").addEventListener("click", () => { state = createSampleState(); selectedFeedbackId = null; saveState(); render(); toast("샘플 데이터를 다시 불러왔습니다."); });
  $("clearStorageBtn").addEventListener("click", () => { if (confirm("localStorage 데이터를 모두 삭제할까요?")) { localStorage.removeItem(STORAGE_KEY); state = createSampleState(); selectedFeedbackId = null; render(); } });
}

function updateInputLength() {
  const count = els.feedbackText.value.length;
  els.inputLength.textContent = `${count.toLocaleString()}자 입력 · 예상 ${Math.ceil(count / 4).toLocaleString()} 토큰`;
  els.inputLength.classList.toggle("warning", count > MAX_INPUT_CHARS);
}

function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = `studio-critic-ai-backup-${today()}.json`; link.click();
  URL.revokeObjectURL(url);
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!Array.isArray(parsed.projects)) throw new Error("projects 배열이 없습니다.");
      state = parsed; state.activeProjectId ||= state.projects[0]?.id; saveState(); render(); toast("JSON 데이터를 불러왔습니다.");
    } catch (error) { toast(`불러오기 실패: ${error.message}`); }
  };
  reader.readAsText(file);
  event.target.value = "";
}

$("feedbackDate").value = today();
bindEvents();
updateInputLength();
render();
