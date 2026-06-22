const clue = (clueTitle, clueExplanation, clueWeight = 1, relatedCharacterIds = []) => ({
  clue: true,
  clueTitle,
  clueExplanation,
  clueWeight,
  relatedCharacterIds
});

const msg = (id, senderId, time, text, chapter, extra = {}) => ({
  id,
  senderId,
  time,
  text,
  type: "message",
  chapter,
  clue: false,
  clueWeight: 0,
  relatedCharacterIds: senderId && senderId !== "system" ? [senderId] : [],
  ...extra
});

const sys = (id, time, text, chapter, extra = {}) => msg(id, "system", time, text, chapter, {
  type: "system",
  relatedCharacterIds: [],
  ...extra
});

const photo = (id, senderId, time, title, description, chapter, extra = {}) => msg(id, senderId, time, title, chapter, {
  type: "photo",
  description,
  ...extra
});

const file = (id, senderId, time, title, description, chapter, extra = {}) => msg(id, senderId, time, title, chapter, {
  type: "file",
  description,
  ...extra
});

function createFestivalStory() {
  const chapters = [
    { id: "fm-ch1", title: "Chapter 1. 사건 발생", intro: "축제 다음 날, 정산금 일부가 비었다는 메시지가 올라온다.", unlocks: ["room-fm-main"], checkpointQuestionId: "fm-cq1" },
    { id: "fm-ch2", title: "Chapter 2. 어긋난 시간표", intro: "판매 시간, 교대 시간, 정산 시간이 서로 맞지 않기 시작한다.", unlocks: ["room-fm-settle", "timeline"], checkpointQuestionId: "fm-cq2" },
    { id: "fm-ch3", title: "Chapter 3. 삭제된 메시지", intro: "누군가 단톡방에서 마감 공백과 관련된 메시지를 지웠다.", unlocks: ["room-fm-seoyeon-taeho", "room-fm-yuna-friend"], checkpointQuestionId: "fm-cq3" },
    { id: "fm-ch4", title: "Chapter 4. 계산이 맞지 않는 영수증", intro: "현금, 계좌, 재료비를 분리해야 실제 부족액이 보인다.", unlocks: ["room-fm-doyoon-minji", "note-sales"], checkpointQuestionId: "fm-cq4" },
    { id: "fm-ch5", title: "Chapter 5. 두 개의 거짓말", intro: "한 사람은 실수를 숨겼고, 다른 사람은 그 틈을 이용했다.", unlocks: ["room-fm-minji-junho", "room-fm-archive", "note-receipts"], checkpointQuestionId: "fm-cq5" },
    { id: "fm-ch6", title: "Chapter 6. 최종 추리", intro: "모든 자료가 열렸다. 숫자와 시간을 다시 맞춰 최종 결론을 낸다.", unlocks: ["note-combined", "final"], checkpointQuestionId: null }
  ];

  const characters = [
    { id: "minji", name: "민지", role: "총무", description: "정산을 맡은 총무. 꼼꼼하지만 압박을 받으면 말을 흐린다.", color: "#ffd166" },
    { id: "junho", name: "준호", role: "회장", description: "동아리 평판을 중요하게 생각한다. 실수를 덮고 싶어 한다.", color: "#7dd3fc" },
    { id: "seoyeon", name: "서연", role: "계산 담당", description: "논리적이지만 선배 부탁을 쉽게 거절하지 못한다.", color: "#c4b5fd" },
    { id: "taeho", name: "태호", role: "마감 담당", description: "장난스럽고 즉흥적이다. 마감 전 자리를 비웠다.", color: "#fb7185" },
    { id: "yuna", name: "유나", role: "홍보 담당", description: "사진을 많이 남긴 직설적인 홍보 담당.", color: "#5eead4" },
    { id: "doyoon", name: "도윤", role: "재료 구매 담당", description: "조용하고 방어적이다. 개인 계좌 입금 때문에 예민해졌다.", color: "#fca5a5" },
    { id: "haneul", name: "하늘", role: "유나의 친구", description: "사진 원본 시간을 확인해 주는 외부 조력자.", color: "#a7f3d0", suspect: false }
  ];

  const rooms = [
    {
      id: "room-fm-main",
      title: "축제 부스 운영방",
      type: "group",
      description: "축제 운영 전체가 공유된 단체방",
      messages: [
        sys("fm-main-001", "10:02", "축제 부스 운영방에 새 메시지가 있습니다.", "fm-ch1"),
        msg("fm-main-002", "minji", "10:12", "얘들아 혹시 어제 현금 봉투 누가 따로 챙긴 사람 있어?", "fm-ch1", clue("처음 나온 현금 봉투 질문", "사건은 계좌가 아니라 현금 봉투에서 시작됐다.", 1, ["minji"])),
        msg("fm-main-003", "taeho", "10:13", "갑자기? 나 마감하고 바로 회의실 갔는데", "fm-ch1"),
        msg("fm-main-004", "yuna", "10:13", "현금 봉투면 노란 집게로 찝어둔 그거?", "fm-ch1"),
        msg("fm-main-005", "junho", "10:14", "다들 진정하고 민지 말부터 듣자.", "fm-ch1"),
        msg("fm-main-006", "minji", "10:15", "정산표랑 봉투 금액이 정확히 70,000원 안 맞아.", "fm-ch1", clue("첫 부족 금액 70,000원", "민지는 처음부터 현금 부족액을 70,000원으로 본다.", 3, ["minji"])),
        msg("fm-main-007", "seoyeon", "10:15", "정확히 7만원이면 계산 실수랑 구분해야 해.", "fm-ch1"),
        msg("fm-main-008", "doyoon", "10:16", "계좌는 내가 어제 받은 것도 있어서 바로 확인해볼게.", "fm-ch1"),
        msg("fm-main-009", "taeho", "10:17", "야 설마 우리 돈 없어진 거임?", "fm-ch1"),
        msg("fm-main-010", "junho", "10:17", "없어졌다고 단정하지 말자. 계산 실수일 수도 있어.", "fm-ch1"),
        msg("fm-main-011", "seoyeon", "10:18", "어제 20시쯤 내가 세었을 때 봉투에 286,000원 있었어.", "fm-ch1", clue("20시 현금 286,000원", "20시 기준 현금 봉투 금액이 확인된다.", 4, ["seoyeon"])),
        msg("fm-main-012", "minji", "10:18", "맞아. 그 숫자는 내 메모에도 있어.", "fm-ch1"),
        msg("fm-main-013", "yuna", "10:19", "그럼 20시 이후에 틀어진 거네.", "fm-ch1"),
        msg("fm-main-014", "doyoon", "10:20", "나 그때 재료 추가로 사러 나갔다 왔어.", "fm-ch1"),
        photo("fm-main-015", "yuna", "10:22", "[사진] 부스 전체샷 19:58", "테이블 위 메뉴판, 현금 봉투, 노란 집게가 보인다. 봉투는 계산기 오른쪽에 놓여 있다.", "fm-ch1", clue("19:58 봉투 위치", "20시 직전 봉투 위치와 닫힌 상태가 확인된다.", 2, ["yuna"])),
        msg("fm-main-016", "seoyeon", "10:23", "사진엔 봉투 멀쩡히 있네.", "fm-ch1"),
        msg("fm-main-017", "junho", "10:24", "누구 의심하는 식으로 가지 말고 사실만 적자.", "fm-ch1"),
        msg("fm-main-018", "doyoon", "10:24", "내 계좌 들어온 건 62,000원. 밤에 민지한테 보냈어.", "fm-ch1", clue("도윤 개인 계좌 62,000원", "개인 계좌 입금액은 현금 부족액 70,000원과 다르다.", 2, ["doyoon"])),
        msg("fm-main-019", "yuna", "10:26", "62,000원이면 7만원이랑 안 맞잖아.", "fm-ch1"),
        msg("fm-main-020", "seoyeon", "10:26", "응. 현금이랑 계좌를 따로 봐야 해.", "fm-ch1"),
        msg("fm-main-021", "minji", "10:29", "오늘 안에 맞춰야 해. 학생회에 보고해야 해서.", "fm-ch1"),
        msg("fm-main-022", "junho", "10:30", "각자 20시 이후 동선 정리해서 보내줘.", "fm-ch1"),

        sys("fm-main-023", "11:02", "Chapter 2 자료가 추가되었습니다.", "fm-ch2"),
        msg("fm-main-024", "seoyeon", "11:04", "20:10부터 20:20까지 계산 테이블 담당이 비어 있어.", "fm-ch2", clue("비어 있는 계산 테이블", "핵심 시간대에 봉투를 지켜보는 사람이 없었다.", 4, ["seoyeon", "taeho"])),
        msg("fm-main-025", "taeho", "11:04", "비었다기보다 잠깐 자리 바꾼 거지.", "fm-ch2"),
        msg("fm-main-026", "junho", "11:05", "그 시간대엔 내가 손님 응대하고 있었어.", "fm-ch2"),
        msg("fm-main-027", "yuna", "11:05", "나 사진 찍으러 입구 쪽 갔고.", "fm-ch2"),
        msg("fm-main-028", "doyoon", "11:06", "나는 편의점 들렀다 온 시간일걸.", "fm-ch2"),
        msg("fm-main-029", "minji", "11:06", "도윤아 영수증 시간 20:14로 찍혀 있어.", "fm-ch2", clue("20:14 편의점 영수증", "도윤이 20:16 전후 부스에 돌아올 수 있는 시간이다.", 2, ["doyoon"])),
        msg("fm-main-030", "seoyeon", "11:07", "20:16 사진에 재료 박스가 이미 부스 옆에 있어.", "fm-ch2", clue("20:16 재료 박스", "도윤의 복귀가 생각보다 빨랐음을 보여준다.", 3, ["doyoon", "yuna"])),
        msg("fm-main-031", "minji", "11:09", "20:10 이후 봉투를 직접 본 사람 있어?", "fm-ch2"),
        msg("fm-main-032", "seoyeon", "11:10", "20:20에 다시 봤을 때 봉투가 계산기 밑으로 들어가 있었어.", "fm-ch2", clue("바뀐 봉투 위치", "누군가 20:00 이후 봉투를 만졌다는 뜻이다.", 3, ["seoyeon"])),

        sys("fm-main-033", "12:01", "준호님이 메시지를 삭제했습니다.", "fm-ch3", clue("삭제된 단톡방 메시지", "삭제 시점은 태호의 빈자리 이야기가 나온 직후다.", 2, ["junho", "taeho"])),
        msg("fm-main-034", "yuna", "12:02", "방금 뭐 지웠어?", "fm-ch3"),
        msg("fm-main-035", "junho", "12:02", "오타. 별 내용 아님.", "fm-ch3"),
        msg("fm-main-036", "taeho", "12:03", "오타가 그렇게 길었나.", "fm-ch3"),
        msg("fm-main-037", "yuna", "12:04", "태호가 20:12에 안 보였다는 말 아니었어?", "fm-ch3", clue("삭제 내용의 방향", "삭제된 문장은 태호의 빈자리와 관련돼 보인다.", 2, ["yuna", "taeho"])),
        msg("fm-main-038", "taeho", "12:06", "나 그때 컵 얼음 가지러 간 건 맞는데 오래 안 걸렸어.", "fm-ch3", clue("태호 자리 비움 인정", "태호는 공백 자체는 인정한다.", 2, ["taeho"])),

        sys("fm-main-039", "14:20", "정산 메모가 공유되었습니다.", "fm-ch4"),
        msg("fm-main-040", "minji", "14:21", "현금 최종은 216,000원으로 확인됨.", "fm-ch4", clue("최종 현금 216,000원", "286,000원에서 216,000원을 빼면 70,000원이다.", 5, ["minji"])),
        msg("fm-main-041", "seoyeon", "14:21", "그럼 차이 70,000원.", "fm-ch4"),
        msg("fm-main-042", "doyoon", "14:22", "계좌랑 섞으면 더 복잡해져.", "fm-ch4"),
        msg("fm-main-043", "yuna", "14:22", "복잡해지는 게 아니라 누가 복잡하게 만든 거 아님?", "fm-ch4"),
        msg("fm-main-044", "seoyeon", "14:25", "재료비는 비용 처리야. 현금 부족액에 섞으면 안 돼.", "fm-ch4", clue("재료비와 부족액 분리", "183,000원 재료비는 현금 봉투 부족액과 별개다.", 3, ["seoyeon"])),

        msg("fm-main-045", "yuna", "16:13", "20:16 사진 확대했는데 테이블 밑에 파란 영수증 파우치 보여.", "fm-ch5", clue("파란 영수증 파우치", "도윤의 파우치가 핵심 시간대 사진에 찍혔다.", 4, ["yuna", "doyoon"])),
        msg("fm-main-046", "doyoon", "16:13", "그거 내 거 맞는데, 박스 두고 바로 창고 갔어.", "fm-ch5"),
        msg("fm-main-047", "seoyeon", "16:14", "창고 기록은 20:23에 열렸어.", "fm-ch5", clue("20:23 창고 기록", "도윤이 바로 창고로 갔다는 말과 맞지 않는다.", 4, ["doyoon"])),
        msg("fm-main-048", "taeho", "16:15", "나도 정확히 말할게. 20:10부터 20:19쯤까지 비웠어.", "fm-ch5", clue("태호의 실제 공백", "태호는 돈보다 마감 실수를 숨겼다.", 3, ["taeho"])),
        msg("fm-main-049", "junho", "16:16", "그걸 왜 이제 말해.", "fm-ch5"),
        msg("fm-main-050", "yuna", "16:17", "돈 가져간 거랑 자리 비운 건 다른 얘기야.", "fm-ch5"),

        msg("fm-main-051", "seoyeon", "18:03", "숫자는 이미 답이 나왔어. 남은 건 누가 그 시간에 봉투를 만졌냐야.", "fm-ch6"),
        msg("fm-main-052", "doyoon", "18:03", "잠깐만. 나도 설명할 수 있어.", "fm-ch6"),
        msg("fm-main-053", "doyoon", "18:04", "나중에 돌려놓으려고 했어.", "fm-ch6", clue("도윤의 결정적 시인", "현금 일부를 임시로 빼두었다는 사실상 인정이다.", 5, ["doyoon"])),
        msg("fm-main-054", "minji", "18:05", "돌려놓으려고 했어도 가져간 건 가져간 거야.", "fm-ch6")
      ]
    },
    {
      id: "room-fm-settle",
      title: "정산 논의방",
      type: "group",
      description: "숫자와 정산표만 따로 모은 방",
      messages: [
        sys("fm-settle-001", "11:18", "민지님이 정산 논의방을 만들었습니다.", "fm-ch2"),
        msg("fm-settle-002", "minji", "11:19", "여긴 숫자만 정리하자. 감정 금지.", "fm-ch2"),
        msg("fm-settle-003", "seoyeon", "11:20", "판매 메뉴: 와플 113개, 음료 74잔, 세트 38개.", "fm-ch2"),
        msg("fm-settle-004", "junho", "11:20", "서비스 준 건 몇 개지?", "fm-ch2"),
        msg("fm-settle-005", "taeho", "11:21", "와플 3개, 음료 4잔 정도.", "fm-ch2"),
        msg("fm-settle-006", "seoyeon", "11:22", "서비스 기록은 매출 계산에서 이미 뺐어.", "fm-ch2"),
        msg("fm-settle-007", "seoyeon", "11:23", "20:00 1차 현금 계수: 286,000원.", "fm-ch2", clue("정산방 1차 계수", "정산방에서도 20:00 현금이 확인된다.", 4, ["seoyeon"])),
        msg("fm-settle-008", "minji", "11:23", "기록한 사람 서연, 옆에서 본 사람 나.", "fm-ch2"),
        msg("fm-settle-009", "seoyeon", "11:25", "20:30 2차 계수라고 적었는데 실제 확인은 20:20쯤이야.", "fm-ch2", clue("늦게 적힌 2차 계수", "정산 시간 표기가 실제보다 늦다.", 3, ["seoyeon"])),
        msg("fm-settle-010", "doyoon", "11:27", "개인 계좌 입금 62,000원. 입금자 5명.", "fm-ch2", clue("개인 계좌 재확인", "계좌 문제는 미끼지만 금액이 다르다.", 2, ["doyoon"])),
        msg("fm-settle-011", "minji", "11:30", "최종 봉투 현금: 216,000원.", "fm-ch4", clue("최종 봉투 현금", "최종 현금 차이를 확정한다.", 4, ["minji"])),
        msg("fm-settle-012", "seoyeon", "11:31", "계좌 총액은 412,000원. 도윤 계좌 포함.", "fm-ch4"),
        msg("fm-settle-013", "doyoon", "11:34", "재료비를 현금에서 뺐다고 오해하면 183,000원이 비는 것처럼 보일 수 있음.", "fm-ch4"),
        msg("fm-settle-014", "yuna", "11:35", "아무도 그렇게 말 안 했는데 왜 먼저 설명해?", "fm-ch4", clue("도윤의 과한 방어", "도윤은 묻지 않은 숫자 혼동을 먼저 방어한다.", 2, ["doyoon"])),
        msg("fm-settle-015", "minji", "11:37", "결론: 현금 70,000원 차이, 계좌는 별도.", "fm-ch4", clue("현금 70,000원 차이", "최종 금액 답이다.", 5, ["minji", "seoyeon"]))
      ]
    },
    {
      id: "room-fm-minji-junho",
      title: "총무 민지와 회장 준호",
      type: "private",
      description: "민지와 준호의 1:1 채팅",
      messages: [
        msg("fm-mj-001", "junho", "09:42", "정산표 오늘 오전 안에 가능해?", "fm-ch5"),
        msg("fm-mj-002", "minji", "09:43", "가능은 한데 어제 바로 못 써서 기억 맞춰야 해.", "fm-ch5", clue("늦게 작성된 정산표", "민지의 기록은 늦었지만 현금 차이 자체를 만들지는 않는다.", 1, ["minji"])),
        msg("fm-mj-003", "junho", "09:46", "태호가 마감 때 자리 비운 건 크게 만들지 말자.", "fm-ch5", clue("준호의 축소", "준호는 태호의 실수를 덮으려 한다.", 3, ["junho", "taeho"])),
        msg("fm-mj-004", "minji", "09:47", "중요한 시간대면 크게 만들어야지.", "fm-ch5"),
        msg("fm-mj-005", "junho", "09:52", "삭제한 메시지는 내가 책임질게.", "fm-ch5"),
        msg("fm-mj-006", "minji", "09:53", "뭘 삭제했는데.", "fm-ch5"),
        msg("fm-mj-007", "junho", "09:54", "태호 자리 비웠다는 얘기. 확정 아닌 말이라서.", "fm-ch5", clue("삭제 이유", "준호의 거짓말은 돈보다 실수 은폐와 연결된다.", 3, ["junho"])),
        msg("fm-mj-008", "minji", "10:03", "태호 빈자리랑 도윤 복귀가 겹치는 거네.", "fm-ch5", clue("겹치는 빈자리와 복귀", "범행 가능 시간대와 도윤의 동선이 겹친다.", 5, ["taeho", "doyoon"]))
      ]
    },
    {
      id: "room-fm-seoyeon-taeho",
      title: "계산 서연과 마감 태호",
      type: "private",
      description: "서연과 태호의 1:1 채팅",
      messages: [
        msg("fm-st-001", "seoyeon", "20:41", "태호야 마감 체크리스트 너가 20:30에 서명했지?", "fm-ch3"),
        msg("fm-st-002", "taeho", "20:42", "응 아마? 정신없었음.", "fm-ch3"),
        msg("fm-st-003", "seoyeon", "20:43", "20:10쯤 자리 비운 거 맞아?", "fm-ch3"),
        msg("fm-st-004", "taeho", "20:45", "한 8분? 길어도 10분.", "fm-ch3", clue("태호의 실제 공백", "비공식 대화에서 10분 공백을 인정한다.", 4, ["taeho"])),
        msg("fm-st-005", "taeho", "20:48", "파란 파우치 들고 도윤이 지나간 건 본 듯.", "fm-ch3", clue("파란 파우치를 본 태호", "도윤의 물건이 현장에 있었다는 별도 증언이다.", 3, ["taeho", "doyoon"])),
        msg("fm-st-006", "seoyeon", "20:52", "준호 선배가 손님 빠진 뒤 기준으로 적자고 했어.", "fm-ch3", clue("정산 시간 조정", "20:30 표기는 실제 확인 시각이 아니다.", 2, ["seoyeon", "junho"])),
        msg("fm-st-007", "taeho", "20:57", "20:10에 나가서 20:19쯤 돌아옴.", "fm-ch3"),
        msg("fm-st-008", "taeho", "20:58", "돌아왔을 땐 계산기 밑에 있었어.", "fm-ch3", clue("돌아온 뒤 바뀐 봉투", "태호 복귀 전 봉투 위치가 이미 바뀌었다.", 4, ["taeho"]))
      ]
    },
    {
      id: "room-fm-yuna-friend",
      title: "홍보 유나와 친구 하늘",
      type: "private",
      description: "유나가 사진 시간을 확인한 대화",
      messages: [
        msg("fm-yh-001", "yuna", "13:02", "사진 원본 시간 확인 좀 해줄래?", "fm-ch3"),
        msg("fm-yh-002", "haneul", "13:04", "보내봐.", "fm-ch3"),
        photo("fm-yh-003", "yuna", "13:05", "[사진] 20:16 부스 테이블", "계산기 아래 열린 현금 봉투와 별 스티커가 붙은 파란 파우치가 보인다.", "fm-ch3", clue("20:16 사진 원본", "핵심 시간대에 열린 봉투와 도윤의 파우치가 함께 찍혔다.", 5, ["yuna", "doyoon"])),
        msg("fm-yh-004", "haneul", "13:06", "원본 기준 20:16:42 맞아.", "fm-ch3", clue("사진 메타데이터 20:16:42", "사진 시간이 핵심 공백 안에 들어간다.", 4, ["haneul", "yuna"])),
        photo("fm-yh-005", "yuna", "13:09", "[사진] 19:31 파란 파우치", "도윤이 별 스티커 파우치를 들고 재료 박스 옆에 서 있다.", "fm-ch3", clue("도윤 파우치 식별", "파란 파우치가 도윤의 물건임을 식별한다.", 3, ["doyoon"])),
        msg("fm-yh-006", "haneul", "13:16", "20:16 사진은 집게가 봉투 옆에 빠져 있어.", "fm-ch3", clue("열린 현금 봉투", "19:58 사진과 비교해 봉투 상태가 바뀌었다.", 3, ["yuna"]))
      ]
    },
    {
      id: "room-fm-doyoon-minji",
      title: "재료 도윤과 총무 민지",
      type: "private",
      description: "도윤의 계좌와 봉투 관련 설명",
      messages: [
        msg("fm-dm-001", "doyoon", "22:58", "나 개인 계좌 입금액 지금 보내도 돼?", "fm-ch4"),
        msg("fm-dm-002", "minji", "22:59", "응. 입금자별로 적어서 보내줘.", "fm-ch4"),
        msg("fm-dm-003", "doyoon", "23:00", "5명 합쳐서 62,000원.", "fm-ch4"),
        msg("fm-dm-004", "doyoon", "23:04", "근데 현금 봉투는 20:10에도 테이블에 있었지?", "fm-ch4", clue("도윤의 봉투 시간 확인", "도윤은 먼저 봉투가 있던 시간을 확인한다.", 3, ["doyoon"])),
        msg("fm-dm-005", "doyoon", "23:08", "편의점 영수증 20:14, 부스 도착은 20:16쯤.", "fm-ch4", clue("바뀐 도윤 복귀 진술", "도윤은 처음보다 빠른 복귀를 인정한다.", 3, ["doyoon"])),
        msg("fm-dm-006", "doyoon", "23:12", "위험해 보여서 봉투를 계산기 밑으로 밀어 넣은 건 있어.", "fm-ch4", clue("봉투를 만진 도윤", "도윤이 봉투 위치를 옮겼다고 인정한다.", 5, ["doyoon"])),
        msg("fm-dm-007", "doyoon", "23:16", "내가 7만원 먼저 채워 넣으면 복잡해지나?", "fm-ch4", clue("7만원을 채우려는 말", "부족액과 같은 금액을 먼저 채우겠다는 반응은 결정적이다.", 5, ["doyoon"])),
        msg("fm-dm-008", "minji", "23:17", "왜 네가 채워. 그 말은 더 이상해.", "fm-ch4")
      ]
    },
    {
      id: "room-fm-archive",
      title: "자료 보관함",
      type: "archive",
      description: "사진 설명 카드와 파일 공유 기록",
      messages: [
        photo("fm-archive-001", "yuna", "16:21", "[사진] 20:16 부스 테이블 위 현금 봉투", "현금 봉투는 열려 있고, 노란 집게는 옆에 빠져 있으며, 테이블 아래에는 도윤의 파란 파우치가 보인다.", "fm-ch5", clue("결정적 사진: 20:16 봉투와 파우치", "핵심 시간대 한가운데에 열린 봉투와 도윤의 파우치가 함께 찍혔다.", 5, ["yuna", "doyoon"])),
        file("fm-archive-002", "seoyeon", "16:23", "[파일] 마감 체크리스트.txt", "마감 담당 서명 시간은 20:30으로 적혔지만 실제 확인은 더 이르다.", "fm-ch5", clue("체크리스트 시간 불일치", "20:30 표기는 실제 확인 시각이 아니다.", 3, ["seoyeon"])),
        file("fm-archive-003", "minji", "17:04", "[파일] 최종 정산 초안.txt", "20:00 현금 286,000원, 최종 현금 216,000원, 계좌 412,000원, 재료비 183,000원.", "fm-ch6", clue("최종 정산 초안", "정리된 숫자에서도 현금 차이 70,000원이 유지된다.", 4, ["minji"])),
        msg("fm-archive-004", "taeho", "17:10", "내 빈자리 때문에 가능해진 건 맞다. 그건 인정.", "fm-ch6", clue("태호의 실수 인정", "태호는 범인이 아니라 범행 가능 조건을 만든 사람이다.", 3, ["taeho"])),
        msg("fm-archive-005", "junho", "17:11", "내가 그걸 덮으려 해서 더 꼬였다.", "fm-ch6", clue("준호의 은폐 인정", "준호는 평판 때문에 실수를 숨겼다.", 3, ["junho"]))
      ]
    }
  ];

  const timeline = [
    { id: "fm-tl-1958", time: "19:58", text: "유나가 부스 전체샷을 촬영. 봉투는 닫힌 상태.", chapter: "fm-ch1", ...clue("19:58 닫힌 봉투", "20시 직전 봉투는 정상이다.", 2, ["yuna"]) },
    { id: "fm-tl-2000", time: "20:00", text: "서연과 민지가 현금 286,000원을 1차 확인.", chapter: "fm-ch2", ...clue("20:00 현금 정상 확인", "부족은 20시 이후에 발생했다.", 4, ["seoyeon", "minji"]) },
    { id: "fm-tl-2010", time: "20:10~20:20", text: "태호가 얼음과 테이프를 가지러 나가 계산 테이블이 비는 구간.", chapter: "fm-ch2", ...clue("핵심 시간대: 비어 있는 10분", "돈을 가져갈 수 있었던 핵심 시간대다.", 5, ["taeho", "doyoon"]) },
    { id: "fm-tl-2016", time: "20:16", text: "유나 사진에 열린 봉투와 파란 파우치가 함께 찍힘.", chapter: "fm-ch3", ...clue("20:16 사진 속 파우치", "도윤의 물건이 열린 봉투 근처에 있었다.", 5, ["yuna", "doyoon"]) },
    { id: "fm-tl-2023", time: "20:23", text: "창고 문이 열린 기록. 도윤의 '바로 창고로 갔다'는 말과 어긋남.", chapter: "fm-ch5", ...clue("20:23 창고 기록", "도윤의 진술과 시스템 기록이 충돌한다.", 4, ["doyoon"]) },
    { id: "fm-tl-delete", time: "다음날 12:01", text: "준호가 태호의 빈자리와 관련된 메시지를 삭제.", chapter: "fm-ch3", ...clue("삭제된 빈자리 언급", "준호의 거짓말은 실수 은폐와 연결된다.", 3, ["junho"]) }
  ];

  const notes = [
    {
      id: "note-sales",
      title: "정산 메모",
      chapter: "fm-ch4",
      description: "현금, 계좌, 재료비를 분리한 메모",
      items: [
        { id: "fm-note-cash-first", label: "20:00 현금", value: "286,000원", text: "20:00 1차 현금 계수.", chapter: "fm-ch4", ...clue("20:00 현금 286,000원", "첫 현금 기준이다.", 4, ["seoyeon"]) },
        { id: "fm-note-cash-final", label: "최종 현금", value: "216,000원", text: "최종 봉투 현금.", chapter: "fm-ch4", ...clue("최종 현금 216,000원", "실제 부족액 계산의 두 번째 숫자다.", 5, ["minji"]) },
        { id: "fm-note-transfer", label: "도윤 개인 계좌", value: "62,000원", text: "도윤이 늦게 전달한 개인 계좌 입금액.", chapter: "fm-ch4", ...clue("계좌 62,000원", "부족액 70,000원과 다르다.", 2, ["doyoon"]) },
        { id: "fm-note-material", label: "재료비", value: "183,000원", text: "도윤 카드 선결제. 비용 처리 대상.", chapter: "fm-ch4", clue: false },
        { id: "fm-note-shortage", label: "현금 차이", value: "70,000원", text: "286,000원에서 216,000원을 뺀 금액.", chapter: "fm-ch4", ...clue("실제 부족액 70,000원", "사건의 금액 답이다.", 5, ["minji", "seoyeon"]) }
      ]
    },
    {
      id: "note-receipts",
      title: "영수증과 기록",
      chapter: "fm-ch5",
      description: "구매 영수증과 창고 출입 기록",
      items: [
        { id: "fm-note-receipt", label: "편의점 결제", value: "20:14", text: "도윤의 얼음, 테이프 결제 영수증 시각.", chapter: "fm-ch5", ...clue("편의점 결제 20:14", "20:16 전후 부스 복귀가 가능하다.", 3, ["doyoon"]) },
        { id: "fm-note-storage", label: "창고 출입", value: "20:23", text: "동아리 창고 문 열림 기록.", chapter: "fm-ch5", ...clue("20:23 창고 출입", "도윤의 진술과 맞지 않는다.", 4, ["doyoon"]) },
        { id: "fm-note-gap", label: "마감 공백", value: "20:10~20:20", text: "태호가 자리를 비운 시간대.", chapter: "fm-ch5", ...clue("마감 공백 10분", "범행 가능 조건이다.", 4, ["taeho"]) }
      ]
    },
    {
      id: "note-combined",
      title: "최종 연결 메모",
      chapter: "fm-ch6",
      description: "마지막 제출 전 핵심 단서를 연결한 메모",
      items: [
        { id: "fm-note-final-amount", label: "부족 금액", value: "70,000원", text: "현금 봉투 기준 실제 부족액.", chapter: "fm-ch6", ...clue("최종 부족 금액", "최종 금액 답이다.", 5, ["minji"]) },
        { id: "fm-note-final-time", label: "핵심 시간대", value: "20:10~20:20", text: "태호 공백, 도윤 복귀, 사진 촬영이 겹친 시간대.", chapter: "fm-ch6", ...clue("최종 핵심 시간대", "사건이 가능했던 시간대다.", 5, ["taeho", "doyoon"]) },
        { id: "fm-note-final-doyoon", label: "도윤의 거짓말", value: "복귀 시간과 봉투 접촉", text: "도윤은 봉투를 만졌고 복귀 시간을 흐렸다.", chapter: "fm-ch6", ...clue("도윤의 거짓말 정리", "돈을 가져간 사람의 핵심 거짓말이다.", 5, ["doyoon"]) }
      ]
    }
  ];

  return {
    id: "festival-money",
    title: "사라진 축제 정산금",
    summary: "축제 부스 정산금 중 현금 70,000원이 사라졌다.",
    coverImage: "assets/case-covers/festival-money.svg",
    themeColor: "#ffd166",
    tagline: "현금 봉투는 언제 사라졌나?",
    estimatedTime: "30~60분",
    introCopy: "축제 다음 날 단톡방에 올라온 한 줄에서 수사가 시작됩니다. 사진, 계좌, 영수증, 삭제된 메시지를 연결해 진실을 찾으세요.",
    chapters,
    characters,
    rooms,
    notes,
    timeline,
    checkpointQuestions: [
      { id: "fm-cq1", chapter: "fm-ch1", question: "정산 오류가 발생했을 가능성이 가장 큰 구간은?", choices: ["20시 이후 현금 봉투가 다시 확인되기 전", "축제 시작 전 메뉴판을 붙이던 시간", "서비스 메뉴를 홍보하던 18시 무렵", "다음 날 단톡방이 만들어진 뒤"], answerIndex: 0, explanation: "20시에 현금 286,000원이 확인됐기 때문에 이후 구간을 봐야 한다." },
      { id: "fm-cq2", chapter: "fm-ch2", question: "현재까지 알리바이가 가장 약한 사람은 누구인가?", choices: ["태호", "민지", "하늘", "유나"], answerIndex: 0, explanation: "태호는 계산 테이블 담당이면서 핵심 시간대에 자리를 비웠다. 다만 약한 알리바이가 곧 범인은 아니다." },
      { id: "fm-cq3", chapter: "fm-ch3", question: "삭제된 메시지는 어떤 내용이었을 가능성이 높은가?", choices: ["태호가 핵심 시간대에 자리를 비웠다는 내용", "축제 메뉴 가격을 다시 정하자는 내용", "유나 사진이 마음에 든다는 내용", "동아리 회식 장소를 정하는 내용"], answerIndex: 0, explanation: "삭제 전후 대화는 태호의 빈자리와 이어진다." },
      { id: "fm-cq4", chapter: "fm-ch4", question: "현금 봉투 기준 실제 부족 금액은 얼마인가?", choices: ["70,000원", "62,000원", "183,000원", "412,000원"], answerIndex: 0, explanation: "286,000원에서 216,000원을 빼면 70,000원이다." },
      { id: "fm-cq5", chapter: "fm-ch5", question: "돈을 가져간 사람과 실수를 감춘 사람을 각각 고르면?", choices: ["도윤 / 태호", "태호 / 도윤", "준호 / 민지", "서연 / 유나"], answerIndex: 0, explanation: "도윤은 봉투를 만졌고 7만원 반응이 과했다. 태호는 마감 공백을 숨겼다." }
    ],
    finalQuestions: {
      culpritQuestion: { question: "정산금을 가져간 사람은 누구인가?", answerCharacterId: "doyoon" },
      amountQuestion: { question: "실제로 부족했던 금액은 얼마인가?", answer: "70000", acceptedAnswers: ["70000", "70,000", "70,000원", "7만원", "칠만원"], placeholder: "예: 70,000원" },
      timeQuestion: { question: "사건이 가능했던 핵심 시간대는?", answer: "20:10~20:20", acceptedAnswers: ["20:10~20:20", "20:10-20:20", "20시10분~20시20분", "8시10분~8시20분"], placeholder: "예: 20:10~20:20" },
      evidenceQuestion: { question: "결정적 단서 3개를 선택하시오.", requiredClueIds: ["fm-archive-001", "fm-tl-2010", "fm-note-cash-final"] }
    },
    ending: {
      culpritId: "doyoon",
      culpritName: "도윤",
      amountLabel: "실제 부족 금액",
      amount: "70,000원",
      keyTimeLabel: "핵심 시간대",
      keyTime: "20:10~20:20",
      truth: "도윤은 개인 계좌 입금 문제를 방어하는 척했지만, 실제로는 현금 봉투에서 70,000원을 임시로 빼두었다.",
      explanation: "20:00 현금 286,000원과 최종 현금 216,000원의 차이는 정확히 70,000원이다. 계좌 62,000원과 재료비 183,000원은 계산에서 분리해야 한다.\n\n핵심 시간대는 태호가 자리를 비운 20:10~20:20이다. 준호는 이 실수를 덮으려 메시지를 삭제했고, 서연의 기록도 실제 확인 시각을 흐렸다.\n\n하지만 20:16 사진에는 열린 봉투와 도윤의 파란 파우치가 함께 찍혔다. 도윤은 봉투를 계산기 밑으로 옮겼다고 인정했고, 창고 기록 20:23은 '바로 창고로 갔다'는 말과 맞지 않는다. 태호와 준호의 거짓말은 실수 은폐였고, 현금을 가져간 사람은 도윤이다."
    },
    gradeTargetTrueClues: 25,
    premiumPacks: ["2000년대 동아리 사건팩", "최신 캠퍼스 사건팩", "알바 마감 사건팩", "장편 시즌팩"]
  };
}

function createBroadcastStory() {
  const chapters = [
    { id: "br-ch1", title: "Chapter 1. 잠긴 방송실", intro: "방송제 최종 상영본에서 원본 컷 세 개가 사라졌다.", unlocks: ["room-br-main"], checkpointQuestionId: "br-cq1" },
    { id: "br-ch2", title: "Chapter 2. 들어간 사람은 없다", intro: "방송실 출입 기록은 깨끗한데 파일 접근 기록만 남아 있다.", unlocks: ["room-br-log", "timeline"], checkpointQuestionId: "br-cq2" },
    { id: "br-ch3", title: "Chapter 3. 원격 접속 흔적", intro: "잠긴 방 안 PC가 외부 실습실에서 조작됐다는 가능성이 생긴다.", unlocks: ["room-br-eunjae-jihoo", "room-br-narin-friend"], checkpointQuestionId: "br-cq3" },
    { id: "br-ch4", title: "Chapter 4. 사라진 세 컷", intro: "삭제된 파일명과 백업 로그를 비교해야 한다.", unlocks: ["note-br-files", "room-br-dohyun-subin"], checkpointQuestionId: "br-cq4" },
    { id: "br-ch5", title: "Chapter 5. 숨긴 실수와 이용한 접속", intro: "한 명은 문단속 실수를 숨겼고, 다른 한 명은 원격 접속을 이용했다.", unlocks: ["room-br-archive", "note-br-records"], checkpointQuestionId: "br-cq5" },
    { id: "br-ch6", title: "Chapter 6. 최종 추리", intro: "잠긴 방송실의 진짜 구조를 제출한다.", unlocks: ["note-br-final", "final"], checkpointQuestionId: null }
  ];
  const characters = [
    { id: "eunjae", name: "은재", role: "편집장", description: "방송제 최종본을 관리한다. 원본 파일 규칙에 엄격하다.", color: "#fbbf24" },
    { id: "jihoo", name: "지후", role: "방송실 키 담당", description: "방송실 문단속 담당. 자동 로그인 실수를 숨겼다.", color: "#60a5fa" },
    { id: "dohyun", name: "도현", role: "음향 담당", description: "싱크 실수를 감추려는 압박을 받았다.", color: "#fb7185" },
    { id: "narin", name: "나린", role: "촬영 담당", description: "촬영 원본과 메타데이터를 꼼꼼히 본다.", color: "#5eead4" },
    { id: "subin", name: "수빈", role: "자막 담당", description: "파일명과 타임코드를 잘 기억한다.", color: "#a78bfa" },
    { id: "minseo", name: "민서", role: "조명 담당", description: "실습실에 남아 있었고, 누가 PC를 썼는지 봤다.", color: "#86efac" },
    { id: "taerin", name: "태린", role: "나린의 친구", description: "사진 속 모니터와 시계를 확인해 주는 외부 조력자.", color: "#f0abfc", suspect: false }
  ];
  const rooms = [
    { id: "room-br-main", title: "방송제 편집방", type: "group", description: "방송제 최종본을 확인하는 단체방", messages: [
      sys("br-main-001", "09:00", "방송제 편집방에 새 메시지가 있습니다.", "br-ch1"),
      msg("br-main-002", "eunjae", "09:02", "최종 상영본에서 원본 컷 세 개가 빠졌어.", "br-ch1", clue("사라진 원본 세 컷", "최종 답의 수량은 세 개다.", 5, ["eunjae"])),
      msg("br-main-003", "subin", "09:03", "엔딩 인터뷰, 조명 리허설, 복도 리액션 컷 맞지?", "br-ch1", clue("삭제된 파일명 세 개", "빠진 원본의 종류가 특정된다.", 4, ["subin"])),
      msg("br-main-004", "jihoo", "09:04", "방송실은 어제 22:10에 내가 잠갔어.", "br-ch1"),
      msg("br-main-005", "narin", "09:05", "잠긴 방에서 파일만 사라진 거면 원격 접속 아냐?", "br-ch1"),
      msg("br-main-006", "dohyun", "09:05", "원격 접속은 편집장 계정만 되는 거 아니었나.", "br-ch1"),
      msg("br-main-007", "eunjae", "09:06", "내 계정은 22:00에 로그아웃했어.", "br-ch1"),
      photo("br-main-008", "narin", "09:08", "[사진] 방송실 문 22:13", "방송실 문은 잠겨 있고, 안쪽 편집 PC 모니터만 희미하게 켜져 있다.", "br-ch1", clue("22:13 잠긴 방송실", "방송실에 사람이 들어간 흔적은 없다.", 3, ["narin"])),
      msg("br-main-009", "minseo", "09:09", "나는 3층 실습실에 있었는데 도현이 A-3 PC 쓴 건 봤어.", "br-ch1", clue("실습실 A-3의 도현", "도현이 원격 접속 가능한 PC를 썼다는 목격담이다.", 4, ["minseo", "dohyun"])),
      msg("br-main-010", "dohyun", "09:10", "A-3는 음향 파일 확인하려고 잠깐 켠 거야.", "br-ch1"),
      msg("br-main-011", "subin", "09:11", "근데 빠진 컷들이 전부 음향 싱크 문제 있던 구간이야.", "br-ch1", clue("음향 싱크 구간", "삭제된 컷들은 도현의 담당 실수와 연결된다.", 4, ["subin", "dohyun"])),
      msg("br-main-012", "eunjae", "09:12", "일단 출입 기록, NAS 로그, 백업 시간을 따로 보자.", "br-ch1"),

      msg("br-main-013", "jihoo", "10:01", "방송실 출입 기록은 22:10 잠금 이후 추가 출입 없음.", "br-ch2"),
      msg("br-main-014", "eunjae", "10:02", "그럼 물리적으로 들어간 사람은 없는 거네.", "br-ch2"),
      msg("br-main-015", "narin", "10:03", "NAS 로그엔 22:17에 final 폴더 수정 기록 있어.", "br-ch2", clue("22:17 final 폴더 수정", "잠긴 방송실 안 PC가 조작된 시각이다.", 5, ["narin"])),
      msg("br-main-016", "subin", "10:04", "수정 계정은 edit-guest로 찍혔어.", "br-ch2", clue("edit-guest 계정", "편집장 계정이 아니라 자동 로그인 계정이 쓰였다.", 4, ["subin"])),
      msg("br-main-017", "jihoo", "10:05", "그 계정 자동 로그인 꺼야 했는데 못 껐어.", "br-ch2", clue("자동 로그인 실수", "지후는 범인이 아니라 접근 조건을 만든 사람이다.", 3, ["jihoo"])),
      msg("br-main-018", "dohyun", "10:06", "자동 로그인 있다고 다 접속 가능한 건 아니잖아.", "br-ch2"),
      msg("br-main-019", "minseo", "10:07", "A-3에 원격 바로가기 있었어. 내가 봄.", "br-ch2", clue("A-3 원격 바로가기", "실습실 PC에서 방송실 PC에 접근할 수 있었다.", 5, ["minseo"])),
      msg("br-main-020", "eunjae", "10:08", "핵심은 22:14부터 22:22 사이네.", "br-ch2", clue("핵심 시간대 22:14~22:22", "원격 접속과 파일 수정이 겹친 시간대다.", 5, ["eunjae"])),

      sys("br-main-021", "11:20", "도현님이 메시지를 삭제했습니다.", "br-ch3", clue("삭제된 음향 메시지", "삭제 시점은 음향 싱크 문제가 언급된 직후다.", 2, ["dohyun"])),
      msg("br-main-022", "subin", "11:21", "방금 '싱크 틀어진 부분만 빼면 된다'고 쓰지 않았어?", "br-ch3", clue("삭제 전 싱크 발언", "삭제된 발언은 파일 누락 의도와 직접 연결된다.", 5, ["subin", "dohyun"])),
      msg("br-main-023", "dohyun", "11:22", "말이 이상해서 지운 거야.", "br-ch3"),
      msg("br-main-024", "narin", "11:23", "이상한 말이 아니라 너무 정확한 말이었지.", "br-ch3"),
      msg("br-main-025", "jihoo", "11:24", "내 자동 로그인 실수 때문에 일이 커진 건 맞아.", "br-ch3"),

      msg("br-main-026", "narin", "14:02", "백업 폴더에는 원본 세 개가 남아 있어.", "br-ch4", clue("백업에 남은 원본 세 개", "사라진 수량이 세 개임을 재확인한다.", 5, ["narin"])),
      msg("br-main-027", "eunjae", "14:03", "삭제가 아니라 final 폴더에서 빠진 거네.", "br-ch4"),
      msg("br-main-028", "subin", "14:04", "세 컷 모두 도현 음향 레이어랑 묶여 있었어.", "br-ch4", clue("도현 음향 레이어", "빠진 컷이 도현 담당 레이어와 연결된다.", 5, ["subin", "dohyun"])),
      msg("br-main-029", "dohyun", "14:05", "그건 우연일 수도 있잖아.", "br-ch4"),
      msg("br-main-030", "minseo", "14:06", "우연치고는 A-3 사용 시간도 딱 겹쳐.", "br-ch4"),

      msg("br-main-031", "jihoo", "16:10", "나 자동 로그인 꺼야 하는 거 잊은 건 숨겼어. 미안.", "br-ch5", clue("지후의 실수 인정", "지후는 밀실 조건을 만든 사람이다.", 3, ["jihoo"])),
      msg("br-main-032", "dohyun", "16:11", "다들 실수 하나씩 있던 거잖아.", "br-ch5"),
      msg("br-main-033", "eunjae", "16:12", "실수랑 남의 파일을 빼는 건 달라.", "br-ch5"),
      msg("br-main-034", "dohyun", "17:30", "상영 전에 다시 넣으려고 했어.", "br-ch6", clue("도현의 시인", "도현이 컷을 뺐다는 사실상 인정이다.", 5, ["dohyun"])),
      msg("br-main-035", "narin", "17:31", "그럼 네가 뺐다는 말이네.", "br-ch6")
    ] },
    { id: "room-br-log", title: "접속 로그방", type: "group", description: "출입 기록과 NAS 로그를 보는 방", messages: [
      msg("br-log-001", "jihoo", "10:20", "22:10 방송실 잠금, 22:40 내가 다시 열기 전까지 출입 없음.", "br-ch2", clue("방송실 출입 없음", "밀실처럼 보이는 핵심 조건이다.", 4, ["jihoo"])),
      msg("br-log-002", "subin", "10:21", "NAS final 폴더 수정 시각은 22:17:38.", "br-ch2", clue("NAS 수정 22:17:38", "파일이 바뀐 정확한 시각이다.", 5, ["subin"])),
      msg("br-log-003", "eunjae", "10:22", "IP는 3층 실습실 A-3로 찍혀.", "br-ch2", clue("A-3 IP", "원격 접속 위치가 특정된다.", 5, ["eunjae"])),
      msg("br-log-004", "minseo", "10:23", "그 시간 A-3 앞에 있던 건 도현이야.", "br-ch2", clue("A-3 앞 도현 목격", "도현의 알리바이가 무너진다.", 5, ["minseo", "dohyun"])),
      msg("br-log-005", "dohyun", "10:24", "난 음향 파일 확인만 했어.", "br-ch2"),
      msg("br-log-006", "narin", "10:25", "확인만 했는데 final 폴더가 왜 바뀌어.", "br-ch2")
    ] },
    { id: "room-br-eunjae-jihoo", title: "은재와 지후", type: "private", description: "방송실 문단속 실수를 확인하는 대화", messages: [
      msg("br-ej-001", "eunjae", "22:04", "방송실 PC 로그아웃 확인했어?", "br-ch3"),
      msg("br-ej-002", "jihoo", "22:05", "문 잠그는 데 집중해서 계정은 못 봤어.", "br-ch3"),
      msg("br-ej-003", "eunjae", "22:06", "edit-guest 자동 로그인 켜져 있으면 위험해.", "br-ch3"),
      msg("br-ej-004", "jihoo", "22:07", "내가 끈 줄 알았는데 아닐 수도.", "br-ch3", clue("자동 로그인 방치", "원격 접속을 가능하게 만든 조건이다.", 4, ["jihoo"])),
      msg("br-ej-005", "eunjae", "22:08", "그럼 누가 들어가지 않아도 PC를 만질 수 있어.", "br-ch3", clue("밀실의 해법", "잠긴 방의 해법은 물리적 침입이 아니라 원격 접속이다.", 5, ["eunjae"]))
    ] },
    { id: "room-br-narin-friend", title: "나린과 태린", type: "private", description: "사진 속 모니터와 시각을 확인한 대화", messages: [
      photo("br-nt-001", "narin", "11:40", "[사진] 22:18 실습실 A-3", "A-3 모니터에 방송실 PC 원격 화면이 떠 있고, 책상 옆에는 도현의 검은 헤드폰이 놓여 있다.", "br-ch3", clue("22:18 원격 화면", "A-3에서 방송실 PC가 원격 조작되고 있었다.", 5, ["narin", "dohyun"])),
      msg("br-nt-002", "taerin", "11:41", "벽시계도 22:18 맞아.", "br-ch3", clue("사진 시간 22:18", "NAS 수정 시간과 겹친다.", 4, ["taerin"])),
      msg("br-nt-003", "narin", "11:42", "헤드폰 도현 거 맞지?", "br-ch3"),
      msg("br-nt-004", "taerin", "11:43", "지난 리허설 사진에도 같은 스티커 붙어 있어.", "br-ch3", clue("도현 헤드폰 식별", "A-3 사용자를 도현 쪽으로 좁힌다.", 4, ["dohyun"])),
      msg("br-nt-005", "narin", "11:44", "이건 방에 들어간 문제가 아니라 원격 접속이네.", "br-ch3")
    ] },
    { id: "room-br-dohyun-subin", title: "도현과 수빈", type: "private", description: "싱크 문제를 두고 주고받은 대화", messages: [
      msg("br-ds-001", "subin", "21:50", "엔딩 인터뷰 싱크 세 프레임 밀렸어.", "br-ch4"),
      msg("br-ds-002", "dohyun", "21:51", "그 구간만 빼면 티 안 나.", "br-ch4", clue("빼면 된다는 말", "삭제 동기가 직접 드러난다.", 5, ["dohyun"])),
      msg("br-ds-003", "subin", "21:52", "빼면 이야기가 끊겨.", "br-ch4"),
      msg("br-ds-004", "dohyun", "21:53", "내일 상영 전까지 고칠 수 있으면 돼.", "br-ch4"),
      msg("br-ds-005", "subin", "21:54", "원본을 건드리면 안 돼.", "br-ch4")
    ] },
    { id: "room-br-archive", title: "방송 자료 보관함", type: "archive", description: "로그와 파일 설명 카드", messages: [
      file("br-archive-001", "eunjae", "16:20", "[파일] NAS 접근 로그.txt", "22:17:38, edit-guest, 실습실 A-3 IP, final 폴더 수정.", "br-ch5", clue("결정적 로그: A-3 final 수정", "원격 접속 위치와 수정 대상이 동시에 나온다.", 5, ["dohyun"])),
      photo("br-archive-002", "narin", "16:22", "[사진] 22:18 A-3 원격 화면", "A-3 모니터에 방송실 PC 화면이 떠 있고 도현의 헤드폰이 보인다.", "br-ch5", clue("결정적 사진: A-3 원격 화면", "도현이 원격 접속했음을 강하게 뒷받침한다.", 5, ["dohyun", "narin"])),
      file("br-archive-003", "subin", "16:24", "[파일] 삭제 컷 목록.txt", "ending_interview.mov, light_rehearsal.mov, hallway_reaction.mov 세 파일이 final 폴더에서 빠짐.", "br-ch5", clue("삭제 컷 목록 세 개", "최종 수량 답이다.", 5, ["subin"])),
      file("br-archive-004", "jihoo", "17:00", "[파일] 방송실 출입 기록.txt", "22:10 잠금 이후 22:40까지 출입 없음.", "br-ch6", clue("잠긴 방송실 기록", "물리적 침입이 아닌 원격 조작임을 확정한다.", 5, ["jihoo"]))
    ] }
  ];
  const timeline = [
    { id: "br-tl-2210", time: "22:10", text: "지후가 방송실을 잠갔다. 이후 물리 출입 기록은 없다.", chapter: "br-ch1", ...clue("22:10 방송실 잠금", "밀실 조건의 시작점이다.", 4, ["jihoo"]) },
    { id: "br-tl-2214", time: "22:14~22:22", text: "실습실 A-3에서 방송실 PC 원격 접속과 final 폴더 수정이 발생.", chapter: "br-ch2", ...clue("핵심 시간대 22:14~22:22", "사건이 가능했던 시간대다.", 5, ["dohyun"]) },
    { id: "br-tl-2217", time: "22:17", text: "NAS final 폴더 수정 기록. edit-guest 계정 사용.", chapter: "br-ch2", ...clue("22:17 NAS 수정", "실제 파일 조작 시각이다.", 5, ["subin"]) },
    { id: "br-tl-2218", time: "22:18", text: "A-3 사진에 원격 화면과 도현의 헤드폰이 찍힘.", chapter: "br-ch3", ...clue("22:18 A-3 사진", "도현을 원격 접속 위치와 연결한다.", 5, ["dohyun", "narin"]) }
  ];
  const notes = [
    { id: "note-br-files", title: "파일 대조 메모", chapter: "br-ch4", description: "백업과 final 폴더를 비교한 표", items: [
      { id: "br-note-backup", label: "백업 원본", value: "3개 존재", text: "백업 폴더에는 빠진 원본 세 개가 남아 있다.", chapter: "br-ch4", ...clue("백업 원본 세 개", "삭제가 아니라 final 폴더 누락임을 보여준다.", 5, ["narin"]) },
      { id: "br-note-final-missing", label: "final 누락", value: "3개", text: "최종 상영본 폴더에서 세 컷이 빠졌다.", chapter: "br-ch4", ...clue("최종 누락 세 개", "최종 수량 답이다.", 5, ["subin"]) },
      { id: "br-note-audio", label: "음향 레이어", value: "도현 담당", text: "빠진 세 컷 모두 도현의 음향 레이어가 연결된 구간이다.", chapter: "br-ch4", ...clue("도현 음향 레이어 연결", "삭제 동기와 연결된다.", 5, ["dohyun"]) }
    ] },
    { id: "note-br-records", title: "접속 기록 메모", chapter: "br-ch5", description: "출입 기록과 원격 접속 기록", items: [
      { id: "br-note-door", label: "방송실 출입", value: "없음", text: "22:10 이후 22:40까지 방송실 출입 기록 없음.", chapter: "br-ch5", ...clue("물리 출입 없음", "잠긴 방 미스터리의 조건이다.", 4, ["jihoo"]) },
      { id: "br-note-remote", label: "원격 접속", value: "A-3", text: "NAS 로그의 IP가 3층 실습실 A-3로 찍혔다.", chapter: "br-ch5", ...clue("원격 접속 A-3", "밀실의 해법이다.", 5, ["dohyun"]) },
      { id: "br-note-auto", label: "자동 로그인", value: "edit-guest", text: "방송실 PC가 guest 계정으로 자동 로그인 상태였다.", chapter: "br-ch5", ...clue("edit-guest 자동 로그인", "도현이 편집장 계정 없이 접속할 수 있었던 이유다.", 4, ["jihoo"]) }
    ] },
    { id: "note-br-final", title: "최종 연결 메모", chapter: "br-ch6", description: "최종 추리용 요약", items: [
      { id: "br-note-final-time", label: "핵심 시간대", value: "22:14~22:22", text: "원격 접속, NAS 수정, A-3 사진이 겹친 시간.", chapter: "br-ch6", ...clue("최종 핵심 시간대", "사건이 가능했던 시간대다.", 5, ["dohyun"]) },
      { id: "br-note-final-lie", label: "도현의 거짓말", value: "음향 확인만 했다", text: "도현은 확인만 했다고 했지만 final 폴더가 수정됐다.", chapter: "br-ch6", ...clue("도현의 거짓말 정리", "파일 조작을 숨긴 핵심 거짓말이다.", 5, ["dohyun"]) }
    ] }
  ];
  return {
    id: "locked-broadcast-room",
    title: "잠긴 방송실의 사라진 원본",
    summary: "잠긴 방송실 안 PC에서 최종 상영본 원본 컷 세 개가 사라졌다.",
    coverImage: "assets/case-covers/broadcast-room.svg",
    themeColor: "#7dd3fc",
    tagline: "잠긴 방 안에서 파일만 사라졌다.",
    estimatedTime: "20~40분",
    introCopy: "문은 잠겨 있었고 아무도 들어가지 않았다. 그런데 파일은 바뀌었다. 출입 기록, NAS 로그, 사진 속 원격 화면을 연결해 밀실의 해법을 찾으세요.",
    chapters,
    characters,
    rooms,
    notes,
    timeline,
    checkpointQuestions: [
      { id: "br-cq1", chapter: "br-ch1", question: "잠긴 방송실 사건에서 가장 먼저 확인해야 할 것은?", choices: ["물리 출입 기록과 원격 접속 기록", "상영회 포스터 색상", "조명 스탠드 위치", "관객석 의자 수"], answerIndex: 0, explanation: "문이 잠겨 있었다면 물리 출입과 원격 접속을 함께 봐야 한다." },
      { id: "br-cq2", chapter: "br-ch2", question: "현재까지 밀실의 해법에 가장 가까운 것은?", choices: ["실습실 A-3 원격 접속", "방송실 창문 침입", "USB 분실", "상영장 조명 오류"], answerIndex: 0, explanation: "출입 기록은 없지만 A-3 원격 접속 기록이 남아 있다." },
      { id: "br-cq3", chapter: "br-ch3", question: "삭제된 메시지의 핵심 내용은?", choices: ["싱크 틀어진 부분만 빼면 된다는 말", "헤드폰 색이 마음에 든다는 말", "방송제 포스터 수정", "간식 주문"], answerIndex: 0, explanation: "빠진 컷이 도현의 음향 싱크 구간과 연결된다." },
      { id: "br-cq4", chapter: "br-ch4", question: "최종 상영본에서 빠진 원본 컷은 몇 개인가?", choices: ["3개", "1개", "5개", "8개"], answerIndex: 0, explanation: "백업에는 남아 있지만 final 폴더에서 빠진 컷은 세 개다." },
      { id: "br-cq5", chapter: "br-ch5", question: "파일을 뺀 사람과 접근 조건을 만든 사람은?", choices: ["도현 / 지후", "지후 / 도현", "수빈 / 나린", "민서 / 은재"], answerIndex: 0, explanation: "도현은 원격으로 파일을 뺐고, 지후는 자동 로그인 실수를 숨겼다." }
    ],
    finalQuestions: {
      culpritQuestion: { question: "원본 컷을 final 폴더에서 뺀 사람은 누구인가?", answerCharacterId: "dohyun" },
      amountQuestion: { question: "최종 상영본에서 빠진 원본 컷은 몇 개인가?", answer: "3", acceptedAnswers: ["3", "3개", "세개", "세 개"], placeholder: "예: 3개" },
      timeQuestion: { question: "원격 조작이 가능했던 핵심 시간대는?", answer: "22:14~22:22", acceptedAnswers: ["22:14~22:22", "22:14-22:22", "22시14분~22시22분", "10시14분~10시22분"], placeholder: "예: 22:14~22:22" },
      evidenceQuestion: { question: "결정적 단서 3개를 선택하시오.", requiredClueIds: ["br-archive-001", "br-archive-002", "br-note-final-time"] }
    },
    ending: {
      culpritId: "dohyun",
      culpritName: "도현",
      amountLabel: "빠진 원본 컷 수",
      amount: "3개",
      keyTimeLabel: "핵심 시간대",
      keyTime: "22:14~22:22",
      truth: "도현은 음향 싱크 실수가 드러날까 봐 실습실 A-3에서 방송실 PC에 원격 접속해 final 폴더에서 원본 컷 세 개를 뺐다.",
      explanation: "방송실은 22:10 이후 잠겨 있었고 물리 출입 기록도 없다. 그래서 처음에는 밀실처럼 보이지만, 실제 해법은 원격 접속이다.\n\n지후는 edit-guest 자동 로그인을 꺼야 했지만 잊었고, 이 실수를 숨겼다. 그 덕분에 실습실 A-3의 원격 바로가기에서 방송실 PC로 접속할 수 있었다.\n\nNAS 로그는 22:17에 final 폴더가 A-3 IP에서 수정됐다고 말한다. 22:18 사진에는 원격 화면과 도현의 헤드폰이 함께 보이고, 빠진 세 컷은 모두 도현의 음향 싱크 문제가 있던 구간이다. 도현은 상영 전에 다시 넣으려 했다고 말하지만, 원본 컷을 뺀 사람은 도현이다."
    },
    gradeTargetTrueClues: 18,
    premiumPacks: ["방송제 확장팩", "잠긴 방 미스터리팩", "디지털 포렌식팩"]
  };
}

function createAnonymousStory() {
  const chapters = [
    { id: "an-ch1", title: "Chapter 1. 익명 계정의 글", intro: "학과 익명 계정에 조작된 대화 캡처가 올라왔다.", unlocks: ["room-an-main"], checkpointQuestionId: "an-cq1" },
    { id: "an-ch2", title: "Chapter 2. 캡처 네 장", intro: "게시글의 캡처 수와 원본 대화 흐름이 맞지 않는다.", unlocks: ["room-an-post", "timeline"], checkpointQuestionId: "an-cq2" },
    { id: "an-ch3", title: "Chapter 3. 예약 게시 시간", intro: "익명 계정 글이 수동 게시가 아니라 예약 게시였다는 흔적이 나온다.", unlocks: ["room-an-haerin-arin", "room-an-daeun-friend"], checkpointQuestionId: "an-cq3" },
    { id: "an-ch4", title: "Chapter 4. 관리자 화면의 반사", intro: "사진 속 노트북 반사와 접속 로그가 한 사람을 가리킨다.", unlocks: ["note-an-captures", "room-an-jun-minseok"], checkpointQuestionId: "an-cq4" },
    { id: "an-ch5", title: "Chapter 5. 지워진 초안", intro: "한 명은 공지 실수를 숨겼고, 다른 한 명은 그 실수를 덮으려 캡처를 조작했다.", unlocks: ["room-an-archive", "note-an-records"], checkpointQuestionId: "an-cq5" },
    { id: "an-ch6", title: "Chapter 6. 최종 추리", intro: "익명 계정의 운영자와 조작 구조를 제출한다.", unlocks: ["note-an-final", "final"], checkpointQuestionId: null }
  ];
  const characters = [
    { id: "haerin", name: "해린", role: "학생회 홍보", description: "학과 공식 공지를 맡는다. 일정 오류를 바로잡으려 한다.", color: "#fbbf24" },
    { id: "ijun", name: "이준", role: "익명 계정 공동관리자", description: "익명 계정 예약 게시 권한이 있다. 실수를 덮으려 한다.", color: "#fb7185" },
    { id: "arin", name: "아린", role: "행사 신청자", description: "조작 캡처의 피해자. 원본 대화 일부를 갖고 있다.", color: "#93c5fd" },
    { id: "minseok", name: "민석", role: "서버 담당", description: "접속 IP와 예약 게시 로그를 확인한다.", color: "#86efac" },
    { id: "daeun", name: "다은", role: "디자인 담당", description: "카드뉴스 시안을 만들며 관리자 화면을 우연히 찍었다.", color: "#5eead4" },
    { id: "seowoo", name: "서우", role: "총무", description: "단톡방 분위기를 수습하려 하지만 말을 아낀다.", color: "#a78bfa" },
    { id: "gaon", name: "가온", role: "다은의 친구", description: "사진 속 반사 화면을 확대해 확인해 준다.", color: "#f0abfc", suspect: false }
  ];
  const rooms = [
    { id: "room-an-main", title: "학과 행사 운영방", type: "group", description: "익명 계정 글을 확인하는 단체방", messages: [
      sys("an-main-001", "09:00", "학과 행사 운영방에 새 메시지가 있습니다.", "an-ch1"),
      msg("an-main-002", "haerin", "09:02", "익명 계정에 아린이 대기 명단을 조작했다는 글 올라왔어.", "an-ch1", clue("익명 계정의 조작 의혹", "사건은 익명 계정 게시글에서 시작된다.", 3, ["haerin", "arin"])),
      msg("an-main-003", "arin", "09:03", "나 그런 말 한 적 없어. 캡처가 이상해.", "an-ch1"),
      msg("an-main-004", "ijun", "09:03", "일단 글 내리면 더 의심받지 않을까?", "an-ch1"),
      msg("an-main-005", "seowoo", "09:04", "감정 말고 원본부터 보자.", "an-ch1"),
      msg("an-main-006", "minseok", "09:05", "익명 계정은 예약 게시 기능 켜져 있어.", "an-ch1", clue("예약 게시 기능", "수동 게시가 아닐 가능성을 연다.", 3, ["minseok"])),
      msg("an-main-007", "daeun", "09:06", "카드뉴스 작업하다 관리자 화면 찍힌 사진 있을지도.", "an-ch1"),
      msg("an-main-008", "arin", "09:07", "게시글 캡처는 네 장인데 원본 대화는 이어지지 않아.", "an-ch1", clue("조작 캡처 네 장", "최종 답의 수량은 네 장이다.", 5, ["arin"])),
      msg("an-main-009", "haerin", "09:08", "네 장 모두 같은 배경인데 시간 간격이 이상해.", "an-ch1"),
      msg("an-main-010", "ijun", "09:09", "캡처 편집 흔적까지는 너무 간 거 아냐?", "an-ch1"),
      msg("an-main-011", "minseok", "09:10", "아니. 메타데이터 보면 편집 앱 흔적 남을 수 있어.", "an-ch1"),
      photo("an-main-012", "daeun", "09:11", "[사진] 카드뉴스 작업 책상 23:46", "노트북 화면 반사에 익명 계정 관리자 페이지와 예약 게시 버튼이 희미하게 보인다.", "an-ch1", clue("23:46 관리자 화면 반사", "누군가 예약 게시 직전 관리자 화면을 열어 두었다.", 5, ["daeun"])),

      msg("an-main-013", "minseok", "10:00", "게시글은 23:50 예약 게시로 찍혀 있어.", "an-ch2", clue("23:50 예약 게시", "핵심 시간대와 연결되는 게시 방식이다.", 5, ["minseok"])),
      msg("an-main-014", "haerin", "10:01", "예약 걸 수 있는 사람은 나, 이준, 서우 셋이야.", "an-ch2"),
      msg("an-main-015", "seowoo", "10:02", "난 23:30 이후 폰 꺼놨어. 배터리 1퍼였음.", "an-ch2"),
      msg("an-main-016", "ijun", "10:03", "난 공지 초안만 확인했어.", "an-ch2"),
      msg("an-main-017", "arin", "10:04", "근데 캡처 네 장 중 두 장은 내가 보낸 적 없는 문장이야.", "an-ch2", clue("원본에 없는 문장", "캡처 일부가 조작됐음을 보여준다.", 5, ["arin"])),
      msg("an-main-018", "daeun", "10:05", "사진 반사에 보이는 닉네임 끝이 '준' 같아.", "an-ch2", clue("반사 화면의 닉네임 끝", "관리자 화면 사용자를 이준 쪽으로 좁힌다.", 3, ["daeun", "ijun"])),
      msg("an-main-019", "ijun", "10:06", "그건 너무 흐릿한데.", "an-ch2"),
      msg("an-main-020", "minseok", "10:07", "흐릿해도 접속 로그랑 같이 보면 돼.", "an-ch2"),

      sys("an-main-021", "11:00", "이준님이 메시지를 삭제했습니다.", "an-ch3", clue("삭제된 예약 글 메시지", "삭제 시점은 예약 게시 권한 이야기가 나온 직후다.", 2, ["ijun"])),
      msg("an-main-022", "haerin", "11:01", "방금 '예약만 잠깐 바꿨다'고 쓰지 않았어?", "an-ch3", clue("삭제 전 예약 변경 발언", "이준이 예약 게시를 건드렸음을 보여준다.", 5, ["ijun", "haerin"])),
      msg("an-main-023", "ijun", "11:02", "말 잘못 쓴 거야.", "an-ch3"),
      msg("an-main-024", "arin", "11:03", "내 캡처는 누가 잘라 붙인 거고, 예약도 네가 건드렸네.", "an-ch3"),
      msg("an-main-025", "seowoo", "11:04", "공지 실수는 내가 숨긴 거 맞아. 근데 캡처는 아니야.", "an-ch3", clue("서우의 공지 실수", "서우는 범인이 아니라 공지 누락을 숨긴 사람이다.", 3, ["seowoo"])),

      msg("an-main-026", "minseok", "14:00", "원본 대화랑 비교하면 조작된 캡처는 네 장이야.", "an-ch4", clue("조작 캡처 네 장 확정", "최종 수량 답이다.", 5, ["minseok"])),
      msg("an-main-027", "arin", "14:01", "1번은 내 말 앞뒤가 잘렸고, 2번이랑 3번은 문장이 바뀌었어.", "an-ch4"),
      msg("an-main-028", "daeun", "14:02", "4번은 날짜줄이 합성된 것 같아.", "an-ch4", clue("날짜줄 합성", "캡처 조작 방식 중 하나다.", 4, ["daeun"])),
      msg("an-main-029", "ijun", "14:03", "그걸 내가 왜 해.", "an-ch4"),
      msg("an-main-030", "haerin", "14:04", "네가 23:48에 관리자 화면 열어 둔 사진이 있어.", "an-ch4", clue("23:48 관리자 화면", "이준이 핵심 시간대에 관리자 화면을 열어 둔 정황이다.", 5, ["ijun", "haerin"])),

      msg("an-main-031", "seowoo", "16:10", "내가 행사 공지 시간을 잘못 올린 건 숨겼어. 미안.", "an-ch5"),
      msg("an-main-032", "haerin", "16:11", "그건 공지 실수고, 조작 캡처는 별개야.", "an-ch5"),
      msg("an-main-033", "ijun", "16:12", "다들 실수한 건데 나만 몰아가는 거 아니야?", "an-ch5"),
      msg("an-main-034", "minseok", "16:13", "접속 로그는 실수가 아니라 기록이야.", "an-ch5"),
      msg("an-main-035", "ijun", "17:20", "게시 직전에 내리려고 했어.", "an-ch6", clue("이준의 시인", "예약 게시와 조작 캡처를 건드렸다는 사실상 인정이다.", 5, ["ijun"])),
      msg("an-main-036", "arin", "17:21", "내리려고 했어도 올린 건 올린 거야.", "an-ch6")
    ] },
    { id: "room-an-post", title: "익명 계정 로그방", type: "group", description: "게시글 예약과 접속 로그를 보는 방", messages: [
      msg("an-post-001", "minseok", "10:20", "23:40 로그인, 23:46 초안 저장, 23:50 예약 게시.", "an-ch2", clue("게시 로그 23:40~23:50", "핵심 시간대를 좁힌다.", 5, ["minseok"])),
      msg("an-post-002", "haerin", "10:21", "접속 위치는 학생회실 노트북?", "an-ch2"),
      msg("an-post-003", "minseok", "10:22", "응. IP는 학생회실 공유기.", "an-ch2", clue("학생회실 공유기 IP", "관리자 화면 사진 위치와 맞는다.", 4, ["minseok"])),
      msg("an-post-004", "daeun", "10:23", "그 시간 학생회실에 나랑 이준 있었어.", "an-ch2", clue("학생회실의 이준", "이준이 핵심 위치에 있었다.", 4, ["daeun", "ijun"])),
      msg("an-post-005", "ijun", "10:24", "다은은 디자인했고 난 그냥 옆에 있었어.", "an-ch2"),
      msg("an-post-006", "minseok", "10:25", "초안 저장 계정은 admin-jun.", "an-ch2", clue("admin-jun 계정", "예약 게시 계정이 이준 쪽과 직접 연결된다.", 5, ["ijun"]))
    ] },
    { id: "room-an-haerin-arin", title: "해린과 아린", type: "private", description: "원본 대화와 조작 캡처를 비교하는 1:1", messages: [
      msg("an-ha-001", "arin", "11:20", "원본 대화 보내줄게. 말 순서가 완전 달라.", "an-ch3"),
      msg("an-ha-002", "haerin", "11:21", "익명 글 2번 캡처는 네 문장이 아니네.", "an-ch3", clue("2번 캡처 문장 불일치", "캡처가 원본과 다르다.", 4, ["arin"])),
      msg("an-ha-003", "arin", "11:22", "3번 캡처는 내가 보낸 이모티콘 자리에 문장이 들어갔어.", "an-ch3", clue("3번 캡처 이모티콘 자리", "편집으로 문장이 삽입된 흔적이다.", 4, ["arin"])),
      msg("an-ha-004", "haerin", "11:23", "날짜줄까지 다르면 네 장 다 봐야겠다.", "an-ch3"),
      msg("an-ha-005", "arin", "11:24", "내가 잘못한 것처럼 보이게 필요한 부분만 붙였어.", "an-ch3", clue("의도적 맥락 삭제", "단순 실수가 아니라 조작 의도가 있다.", 5, ["arin"]))
    ] },
    { id: "room-an-daeun-friend", title: "다은과 가온", type: "private", description: "사진 속 반사 화면을 확인한 대화", messages: [
      photo("an-dg-001", "daeun", "11:30", "[사진] 23:46 카드뉴스 작업 책상", "컵 표면에 노트북 화면이 반사되어 있고, 익명 계정 예약 게시 화면과 admin-jun 글자가 희미하게 보인다.", "an-ch3", clue("23:46 admin-jun 반사", "관리자 화면과 계정명이 사진에 남았다.", 5, ["daeun", "ijun"])),
      msg("an-dg-002", "gaon", "11:31", "확대하면 admin-jun으로 보여.", "an-ch3", clue("admin-jun 판독", "이준 계정과 연결된다.", 5, ["gaon", "ijun"])),
      msg("an-dg-003", "daeun", "11:32", "내 디자인 화면 옆 탭에 떠 있던 거였네.", "an-ch3"),
      msg("an-dg-004", "gaon", "11:33", "상단 시간이 23:46이야.", "an-ch3", clue("사진 시간 23:46", "초안 저장 시간과 맞물린다.", 4, ["gaon"])),
      msg("an-dg-005", "daeun", "11:34", "그때 학생회실에 이준이 있었어.", "an-ch3")
    ] },
    { id: "room-an-jun-minseok", title: "이준과 민석", type: "private", description: "예약 게시 권한을 두고 주고받은 대화", messages: [
      msg("an-jm-001", "ijun", "23:38", "익명 계정 예약글 취소하려면 어디서 해?", "an-ch4", clue("예약글 취소 질문", "이준이 예약 게시 화면을 다뤘다는 정황이다.", 4, ["ijun"])),
      msg("an-jm-002", "minseok", "23:39", "관리자 메뉴에서 예약 탭.", "an-ch4"),
      msg("an-jm-003", "ijun", "23:41", "초안만 봤어. 올릴 생각은 없었어.", "an-ch4", clue("초안만 봤다는 말", "예약 게시 기록과 충돌한다.", 3, ["ijun"])),
      msg("an-jm-004", "minseok", "23:42", "초안 저장하면 로그 남아.", "an-ch4"),
      msg("an-jm-005", "ijun", "23:43", "로그까지 보진 말자.", "an-ch4", clue("로그 회피", "이준이 접속 기록 확인을 꺼린다.", 3, ["ijun"]))
    ] },
    { id: "room-an-archive", title: "디지털 자료 보관함", type: "archive", description: "로그와 캡처 분석 자료", messages: [
      file("an-archive-001", "minseok", "16:30", "[파일] 익명 계정 접속 로그.txt", "23:40 로그인, 23:46 초안 저장, 23:50 예약 게시. 계정 admin-jun.", "an-ch5", clue("결정적 로그: admin-jun", "이준 계정이 예약 게시를 실행했다.", 5, ["ijun"])),
      photo("an-archive-002", "daeun", "16:31", "[사진] 23:46 관리자 화면 반사", "컵 표면 반사에 예약 게시 화면과 admin-jun 문자가 보인다.", "an-ch5", clue("결정적 사진: 관리자 화면 반사", "사진 단서가 접속 로그와 연결된다.", 5, ["daeun", "ijun"])),
      file("an-archive-003", "arin", "16:32", "[파일] 원본 대화 대조표.txt", "익명 글 캡처 네 장 중 네 장 모두 자르기, 문장 삽입, 날짜줄 합성 흔적이 있음.", "an-ch5", clue("원본 대화 대조표", "조작된 캡처 수 네 장을 확정한다.", 5, ["arin"])),
      msg("an-archive-004", "seowoo", "16:33", "공지 시간을 잘못 올린 건 내 실수야. 그걸 들킬까 봐 말 못 했어.", "an-ch5", clue("서우의 공지 실수 인정", "서우는 범인이 아니라 미끼 의심점이다.", 3, ["seowoo"]))
    ] }
  ];
  const timeline = [
    { id: "an-tl-2340", time: "23:40", text: "익명 계정 admin-jun 로그인.", chapter: "an-ch2", ...clue("23:40 admin-jun 로그인", "이준 계정이 핵심 시간대에 접속했다.", 5, ["ijun"]) },
    { id: "an-tl-2346", time: "23:46", text: "조작 캡처 초안 저장. 같은 시각 다은 사진에 관리자 화면이 반사됨.", chapter: "an-ch3", ...clue("23:46 초안 저장", "사진과 로그가 같은 시각을 가리킨다.", 5, ["daeun", "ijun"]) },
    { id: "an-tl-2350", time: "23:50", text: "익명 계정 게시글 예약 게시.", chapter: "an-ch2", ...clue("23:50 예약 게시", "최종 게시 방식과 시각이다.", 5, ["minseok"]) },
    { id: "an-tl-delete", time: "다음날 11:00", text: "이준이 예약글 관련 메시지를 삭제.", chapter: "an-ch3", ...clue("삭제된 예약 변경 발언", "이준이 예약 게시 조작을 의식했다.", 3, ["ijun"]) }
  ];
  const notes = [
    { id: "note-an-captures", title: "캡처 대조 메모", chapter: "an-ch4", description: "익명 글 캡처와 원본 대화를 비교한 표", items: [
      { id: "an-note-cap-count", label: "조작 캡처", value: "4장", text: "네 장 모두 자르기나 문장 삽입 흔적이 있다.", chapter: "an-ch4", ...clue("조작 캡처 네 장", "최종 수량 답이다.", 5, ["arin"]) },
      { id: "an-note-cap-two", label: "2번 캡처", value: "문장 불일치", text: "원본에 없는 문장이 들어갔다.", chapter: "an-ch4", ...clue("2번 캡처 불일치", "조작 방식 중 하나다.", 4, ["arin"]) },
      { id: "an-note-cap-date", label: "4번 캡처", value: "날짜줄 합성", text: "날짜줄 위치가 원본 UI와 다르다.", chapter: "an-ch4", ...clue("날짜줄 합성", "조작 흔적이다.", 4, ["daeun"]) }
    ] },
    { id: "note-an-records", title: "예약 게시 기록", chapter: "an-ch5", description: "로그와 사진 시간을 연결한 메모", items: [
      { id: "an-note-admin", label: "관리자 계정", value: "admin-jun", text: "초안 저장과 예약 게시에 쓰인 계정.", chapter: "an-ch5", ...clue("관리자 계정 admin-jun", "이준과 직접 연결된다.", 5, ["ijun"]) },
      { id: "an-note-window", label: "핵심 시간대", value: "23:40~23:50", text: "로그인, 초안 저장, 예약 게시가 이어진 시간대.", chapter: "an-ch5", ...clue("핵심 시간대 23:40~23:50", "사건이 가능했던 시간대다.", 5, ["ijun"]) },
      { id: "an-note-photo", label: "반사 사진", value: "23:46", text: "관리자 화면이 컵 표면에 반사된 사진.", chapter: "an-ch5", ...clue("23:46 반사 사진", "로그와 시각이 일치한다.", 5, ["daeun"]) }
    ] },
    { id: "note-an-final", title: "최종 연결 메모", chapter: "an-ch6", description: "최종 추리용 요약", items: [
      { id: "an-note-final-count", label: "조작 캡처 수", value: "4장", text: "익명 글에 쓰인 캡처 네 장이 모두 조작됐다.", chapter: "an-ch6", ...clue("최종 조작 캡처 수", "최종 수량 답이다.", 5, ["arin"]) },
      { id: "an-note-final-time", label: "핵심 시간대", value: "23:40~23:50", text: "admin-jun 로그인부터 예약 게시까지 이어진 시간.", chapter: "an-ch6", ...clue("최종 핵심 시간대", "사건이 가능했던 시간대다.", 5, ["ijun"]) },
      { id: "an-note-final-lie", label: "이준의 거짓말", value: "초안만 봤다", text: "초안만 봤다는 말은 예약 게시 로그와 충돌한다.", chapter: "an-ch6", ...clue("이준의 거짓말 정리", "조작 게시를 숨긴 핵심 거짓말이다.", 5, ["ijun"]) }
    ] }
  ];
  return {
    id: "anonymous-account-capture",
    title: "익명 계정의 조작 캡처",
    summary: "학과 익명 계정에 올라온 조작 캡처 네 장의 작성자를 찾는다.",
    coverImage: "assets/case-covers/anonymous-capture.svg",
    themeColor: "#c4b5fd",
    tagline: "캡처 네 장은 누가 조작했나?",
    estimatedTime: "20~40분",
    introCopy: "실제 범죄가 아닌 캠퍼스 커뮤니티 오해와 조작 캡처 사건입니다. 예약 게시 로그, 사진 속 반사 화면, 원본 대화 대조표를 연결하세요.",
    chapters,
    characters,
    rooms,
    notes,
    timeline,
    checkpointQuestions: [
      { id: "an-cq1", chapter: "an-ch1", question: "먼저 확인해야 할 자료는?", choices: ["익명 글 캡처와 원본 대화", "행사 포스터 색상", "학생회실 의자 위치", "간식 주문 내역"], answerIndex: 0, explanation: "조작 여부는 캡처와 원본 대화 대조에서 시작된다." },
      { id: "an-cq2", chapter: "an-ch2", question: "게시 방식에서 중요한 단서는?", choices: ["23:50 예약 게시", "오전 9시 단톡방", "행사 이름", "카드뉴스 색상"], answerIndex: 0, explanation: "예약 게시라면 게시 직전 관리자 로그를 봐야 한다." },
      { id: "an-cq3", chapter: "an-ch3", question: "삭제된 메시지의 핵심은?", choices: ["예약만 잠깐 바꿨다는 말", "점심 메뉴", "디자인 폰트", "행사 장소 안내"], answerIndex: 0, explanation: "이준은 예약 게시를 건드렸다는 말을 지웠다." },
      { id: "an-cq4", chapter: "an-ch4", question: "조작된 캡처는 몇 장인가?", choices: ["4장", "1장", "2장", "7장"], answerIndex: 0, explanation: "원본 대화 대조 결과 네 장 모두 조작 흔적이 있다." },
      { id: "an-cq5", chapter: "an-ch5", question: "캡처를 올린 사람과 공지 실수를 숨긴 사람은?", choices: ["이준 / 서우", "서우 / 이준", "아린 / 해린", "다은 / 민석"], answerIndex: 0, explanation: "이준은 admin-jun 예약 게시와 연결되고, 서우는 공지 시간 실수를 숨긴 사람이다." }
    ],
    finalQuestions: {
      culpritQuestion: { question: "조작 캡처를 예약 게시한 사람은 누구인가?", answerCharacterId: "ijun" },
      amountQuestion: { question: "조작된 캡처는 몇 장인가?", answer: "4", acceptedAnswers: ["4", "4장", "네장", "네 장"], placeholder: "예: 4장" },
      timeQuestion: { question: "예약 게시 조작이 가능했던 핵심 시간대는?", answer: "23:40~23:50", acceptedAnswers: ["23:40~23:50", "23:40-23:50", "23시40분~23시50분", "11시40분~11시50분"], placeholder: "예: 23:40~23:50" },
      evidenceQuestion: { question: "결정적 단서 3개를 선택하시오.", requiredClueIds: ["an-archive-001", "an-archive-002", "an-note-final-count"] }
    },
    ending: {
      culpritId: "ijun",
      culpritName: "이준",
      amountLabel: "조작 캡처 수",
      amount: "4장",
      keyTimeLabel: "핵심 시간대",
      keyTime: "23:40~23:50",
      truth: "이준은 공지 시간 실수를 덮으려 익명 계정 관리자 권한으로 조작 캡처 네 장을 예약 게시했다.",
      explanation: "익명 글에 쓰인 캡처 네 장은 모두 원본 대화와 맞지 않는다. 문장 삽입, 맥락 삭제, 날짜줄 합성 흔적이 동시에 나온다.\n\n서우는 행사 공지 시간을 잘못 올린 실수를 숨겼지만, 익명 계정 예약 게시와 조작 캡처를 실행한 사람은 아니다. 핵심은 23:40~23:50이다. 이 시간에 admin-jun 계정이 로그인했고, 23:46 초안 저장과 23:50 예약 게시가 이어졌다.\n\n다은의 사진 속 컵 반사에는 관리자 화면과 admin-jun 문자가 남아 있고, 이준은 예약글을 잠깐 바꿨다는 메시지를 지웠다. 결국 조작 캡처를 예약 게시한 사람은 이준이다."
    },
    gradeTargetTrueClues: 18,
    premiumPacks: ["익명 계정 확장팩", "SNS 괴문서팩", "디지털 단서팩"]
  };
}

const STORY = createFestivalStory();
const STORIES = [STORY, createBroadcastStory(), createAnonymousStory()];
