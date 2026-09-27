import type { Locale } from '.';

/** Strings for the interactive pieces inside articles. `{n}`/`{total}`/`{p}` are placeholders. */
export const widgets = {
  en: {
    m10Search: 'Search a 4-digit number', m10Placeholder: 'e.g. 0001, 1234…', m10Showing: '{n} of {total} solutions', m10Loading: 'Loading 10,000 solutions…',
    lpDob: 'Date of birth', lpStart: 'Started the activity on', lpPct: 'Share of your life', lpClaim: 'You can claim it on', lpAge: 'You’ll be {age} years old',
    lpPrompt: 'Enter both dates to see your result.', lpBefore: 'The start date can’t be before your birth.', lpGoogle: 'Google Calendar', lpIcs: 'Apple / Outlook (.ics)',
    lpEvent: 'I’ve now done this for {p}% of my life', lpPast: 'Already reached, on',
    diagram: 'Data flow: keystrokes are buffered, classified, and routed through two paths — continuous mood updates and synchronous blocking on Enter.',
  },
  fr: {
    m10Search: 'Chercher un nombre à 4 chiffres', m10Placeholder: 'ex. 0001, 1234…', m10Showing: '{n} solutions sur {total}', m10Loading: 'Chargement des 10 000 solutions…',
    lpDob: 'Date de naissance', lpStart: 'Début de l’activité', lpPct: 'Part de votre vie', lpClaim: 'Vous pourrez le dire le', lpAge: 'Vous aurez {age} ans',
    lpPrompt: 'Renseignez les deux dates pour voir le résultat.', lpBefore: 'La date de début ne peut pas précéder votre naissance.', lpGoogle: 'Google Agenda', lpIcs: 'Apple / Outlook (.ics)',
    lpEvent: 'Je fais ça depuis {p} % de ma vie', lpPast: 'Déjà atteint, le',
    diagram: 'Flux de données : les frappes sont mises en mémoire tampon, classées, puis suivent deux chemins — mise à jour continue de l’humeur, et blocage synchrone sur Entrée.',
  },
  de: {
    m10Search: 'Eine vierstellige Zahl suchen', m10Placeholder: 'z. B. 0001, 1234…', m10Showing: '{n} von {total} Lösungen', m10Loading: '10.000 Lösungen werden geladen…',
    lpDob: 'Geburtsdatum', lpStart: 'Beginn der Aktivität', lpPct: 'Anteil deines Lebens', lpClaim: 'Das kannst du sagen am', lpAge: 'Du wirst {age} Jahre alt sein',
    lpPrompt: 'Gib beide Daten ein, um dein Ergebnis zu sehen.', lpBefore: 'Das Startdatum kann nicht vor deiner Geburt liegen.', lpGoogle: 'Google Kalender', lpIcs: 'Apple / Outlook (.ics)',
    lpEvent: 'Ich mache das jetzt seit {p} % meines Lebens', lpPast: 'Bereits erreicht, am',
    diagram: 'Datenfluss: Tastenanschläge werden gepuffert, klassifiziert und über zwei Wege geleitet — kontinuierliche Stimmungs-Updates und synchrones Blockieren bei Enter.',
  },
  es: {
    m10Search: 'Busca un número de 4 cifras', m10Placeholder: 'p. ej. 0001, 1234…', m10Showing: '{n} de {total} soluciones', m10Loading: 'Cargando 10 000 soluciones…',
    lpDob: 'Fecha de nacimiento', lpStart: 'Empezaste la actividad el', lpPct: 'Porcentaje de tu vida', lpClaim: 'Podrás decirlo el', lpAge: 'Tendrás {age} años',
    lpPrompt: 'Introduce ambas fechas para ver el resultado.', lpBefore: 'La fecha de inicio no puede ser anterior a tu nacimiento.', lpGoogle: 'Google Calendar', lpIcs: 'Apple / Outlook (.ics)',
    lpEvent: 'Ya llevo el {p} % de mi vida haciendo esto', lpPast: 'Ya alcanzado, el',
    diagram: 'Flujo de datos: las pulsaciones se almacenan, se clasifican y siguen dos caminos: actualización continua del ánimo y bloqueo síncrono al pulsar Intro.',
  },
  zh: {
    m10Search: '搜索一个四位数', m10Placeholder: '例如 0001、1234…', m10Showing: '共 {total} 个解，显示 {n} 个', m10Loading: '正在加载 10000 个解…',
    lpDob: '出生日期', lpStart: '开始这项活动的日期', lpPct: '占你人生的比例', lpClaim: '你可以在这一天这么说', lpAge: '那时你 {age} 岁',
    lpPrompt: '填写两个日期即可看到结果。', lpBefore: '开始日期不能早于出生日期。', lpGoogle: 'Google 日历', lpIcs: 'Apple / Outlook (.ics)',
    lpEvent: '这件事我已经做了人生的 {p}%', lpPast: '已经达成，在',
    diagram: '数据流：按键先被缓冲、分类，然后分两路处理——持续更新情绪，以及按下回车时同步拦截。',
  },
  ko: {
    m10Search: '네 자리 숫자 검색', m10Placeholder: '예: 0001, 1234…', m10Showing: '전체 {total}개 중 {n}개', m10Loading: '해답 10,000개를 불러오는 중…',
    lpDob: '생년월일', lpStart: '활동을 시작한 날', lpPct: '인생에서 차지하는 비율', lpClaim: '이렇게 말할 수 있는 날', lpAge: '그때 나이는 {age}세',
    lpPrompt: '두 날짜를 입력하면 결과가 나옵니다.', lpBefore: '시작일은 생년월일보다 앞설 수 없습니다.', lpGoogle: 'Google 캘린더', lpIcs: 'Apple / Outlook (.ics)',
    lpEvent: '이 일을 한 지 인생의 {p}%가 되었다', lpPast: '이미 달성, 날짜',
    diagram: '데이터 흐름: 키 입력은 버퍼에 쌓이고 분류된 뒤 두 경로로 나뉩니다 — 계속되는 기분 업데이트, 그리고 Enter를 누를 때의 동기 차단.',
  },
} satisfies Record<Locale, Record<string, string>>;
