(() => {
  const EUR_TO_BYN = 55.61 / 16.8;
  const SERVICE_EUR = 16.8;
  const CONSULAR_EUR = 35;

  const byn = (eur) => Math.ceil(eur * EUR_TO_BYN);
  const formatEur = (n) =>
    Math.round(Number(n)).toLocaleString("ru-RU", { maximumFractionDigits: 0 });
  const money = (eur) => `${formatEur(eur)} € (~${byn(eur)} BYN)`;

  const $ = (id) => document.getElementById(id);

  // --- Help / services calculator (init first so quiz bugs can't block it) ---
  const helpAdults = $("help-adults");
  const helpKids = $("help-kids");
  const helpBooking = $("help-booking");
  const helpDocs = $("help-docs");
  const helpResult = $("help-result");

  function renderHelp() {
    if (!helpAdults || !helpKids || !helpBooking || !helpDocs || !helpResult) return;
    const adults = Math.max(0, Number(helpAdults.value) || 0);
    const kids = Math.max(0, Number(helpKids.value) || 0);
    const people = adults + kids;
    const booking = helpBooking.checked ? adults * 50 : 0;
    const docs = helpDocs.checked ? people * 100 : 0;
    const total = booking + docs;

    helpResult.innerHTML = `
      <div class="lines">
        <div>Запись: ${booking} BYN <span class="pay-note">(оплачивается в день записи)</span></div>
        <div>Документы: ${docs} BYN <span class="pay-note">(оплачивается на шаге 3, когда выбрана дата подачи)</span></div>
      </div>
      <div class="total">Итого за помощь: ${total} BYN</div>
    `;
  }

  [helpAdults, helpKids, helpBooking, helpDocs].forEach((el) => {
    if (!el) return;
    el.addEventListener("input", renderHelp);
    el.addEventListener("change", renderHelp);
  });
  renderHelp();

  // --- DIY / Help choice tabs ---
  const choiceTabs = document.querySelectorAll(".choice-tab");
  const panelDiy = $("panel-diy");
  const panelHelp = $("panel-help");

  function setChoice(which) {
    choiceTabs.forEach((tab) => {
      const on = tab.dataset.choice === which;
      tab.classList.toggle("is-active", on);
      tab.setAttribute("aria-selected", String(on));
    });
    if (panelDiy) panelDiy.hidden = which !== "diy";
    if (panelHelp) panelHelp.hidden = which !== "help";
  }

  choiceTabs.forEach((tab) => {
    tab.addEventListener("click", () => setChoice(tab.dataset.choice));
  });

  // --- Fee calculator ---
  const feeAdults = $("fee-adults");
  const feeKids = $("fee-kids");
  const feeResult = $("fee-result");

  function renderFees() {
    if (!feeAdults || !feeKids || !feeResult) return;
    const adults = Math.max(0, Number(feeAdults.value) || 0);
    const kids = Math.max(0, Number(feeKids.value) || 0);
    const consular = adults * CONSULAR_EUR;
    const service = (adults + kids) * SERVICE_EUR;
    const total = consular + service;
    feeResult.innerHTML = `
      <div class="lines">
        <div>Консульский сбор: ${money(consular)} <span class="pay-note">(ребёнок до 12 лет — бесплатно)</span></div>
        <div>Сервисный сбор VFS: ${money(service)}</div>
      </div>
      <div class="total">Итого ориентир: ${money(total)}</div>
    `;
  }

  [feeAdults, feeKids].forEach((el) => el && el.addEventListener("input", renderFees));
  renderFees();

  // --- Bank / means calculator ---
  const bankDays = $("bank-days");
  const bankPeople = $("bank-people");
  const bankHotel = $("bank-hotel");
  const bankTickets = $("bank-tickets");
  const bankResult = $("bank-result");

  function meansPerPerson(days, people) {
    const group = people >= 2;
    if (days <= 5) return group ? 212.81 : 269.6;
    if (days <= 10) return (group ? 26.33 : 44.93) * days;
    if (days <= 20) {
      const fixed = group ? 25.82 : 51.64;
      const daily = group ? 22.21 : 36.67;
      return fixed + daily * days;
    }
    const fixed = group ? 118.79 : 206.58;
    const daily = group ? 17.04 : 27.89;
    return fixed + daily * days;
  }

  function renderBank() {
    if (!bankDays || !bankPeople || !bankResult) return;
    const days = Math.max(1, Number(bankDays.value) || 1);
    const people = Math.max(1, Number(bankPeople.value) || 1);
    const hotel = Math.max(0, Number(bankHotel && bankHotel.value) || 0);
    const tickets = Math.max(0, Number(bankTickets && bankTickets.value) || 0);
    const per = meansPerPerson(days, people);
    const stay = per * people;
    const total = stay + hotel + tickets;
    bankResult.innerHTML = `
      <div class="lines">
        <div>Средства на пребывание: ${money(stay)}</div>
        <div>Отель: ${money(hotel)}</div>
        <div>Билеты: ${money(tickets)}</div>
        <div>Людей: ${people}, дней: ${days}</div>
      </div>
      <div class="total">Минимум на выписку: ${money(total)}</div>
    `;
  }

  [bankDays, bankPeople, bankHotel, bankTickets].forEach(
    (el) => el && el.addEventListener("input", renderBank)
  );
  renderBank();

  // --- Accordions ---
  document.querySelectorAll(".accordion-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.acc;
      const panel = $(`acc-${id}`);
      if (!panel) return;
      const open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      panel.hidden = open;
    });
  });

  // --- Document quiz ---
  const baseDocs = [
    "Паспорт (выдан ≤10 лет, ≥2 пустые страницы, действует ≥3 месяца после выезда) + копия страниц с данными",
    "Анкета на визу типа C — заполненная и подписанная",
    "1 фото ICAO 35×45 мм (вклеить в анкету)",
    "Копии ранее выданных виз (если были)",
    "Медицинская страховка Шенген, покрытие от 30 000 € на весь срок первой поездки",
    "Бронь жилья в Италии на всех заявителей или приглашение + копия документа приглашающего",
    "Транспорт туда-обратно: авиа/автобус или документы на авто (см. ниже, если едете на машине)",
    "Копия паспорта: стр. 31–33 (обычный) или разворот с фото (биометрический)",
    "Копии шенгенских виз за последние 3 года (если были)",
  ];

  const workDocs = {
    employed:
      "Найм: справка с работы (должность, дата приёма, зарплата за 3 месяца, печать) + выписка с остатком (срок ≤1 мес.)",
    ip: "ИП: свидетельство регистрации + налоговая декларация за последний период + страница с электронным ключом + выписка с личного счёта (не р/с ИП), срок ≤1 мес.",
    self: "Самозанятый: справка из налоговой или чеки оплаты налога + выписка с остатком (срок ≤1 мес.); в анкете — самозанятый и вид деятельности",
    unemployed:
      "Безработный: копия трудовой (личные данные + места работы за 3 года) + спонсорский пакет (заявление, копия паспорта спонсора, его финансы, родство). Если спонсор-супруг едет с вами в тот же день — упрощённый комплект",
  };

  const quizStart = $("quiz-start");
  const quizForm = $("quiz-form");
  const docList = $("doc-list");
  const docHint = $("doc-hint");

  if (quizStart && quizForm && docList && docHint) {
    const fields = {
      minor: quizForm.querySelector('[data-step="minor"]'),
      work: quizForm.querySelector('[data-step="work"]'),
      car: quizForm.querySelector('[data-step="car"]'),
      italy: quizForm.querySelector('[data-step="italy"]'),
    };

    function getVal(name) {
      const el = quizForm.querySelector(`input[name="${name}"]:checked`);
      return el ? el.value : null;
    }

    function buildDocs() {
      const adult = getVal("adult");
      const minorMode = getVal("minorMode");
      const work = getVal("work");
      const car = getVal("car");
      const italy = getVal("italy");
      const items = baseDocs.map((t) => ({ text: t, optional: false }));

      if (adult === "yes" && work) items.push({ text: workDocs[work], optional: false });

      if (adult === "no") {
        items.push({
          text: "Несовершеннолетний: оригинал и копия свидетельства о рождении; копии документов родителей и их виз/ВНЖ (если есть)",
          optional: false,
        });
        items.push({
          text: "Анкету несовершеннолетнего подписывают родители (по правилам подачи)",
          optional: false,
        });
        items.push({
          text: "Справка из школы/вуза (если учитесь) + копия ученического/студенческого при наличии",
          optional: false,
        });
        items.push({
          text: "Финансы ребёнка: спонсорское письмо родителя. Если родитель-спонсор подаётся вместе — обычно достаточно письма; иначе полный спонсорский пакет",
          optional: false,
        });
        if (minorMode === "one") {
          items.push({
            text: "С одним родителем: нотариальное согласие второго родителя на выезд (лучше до 18 лет) либо документы об отсутствии второго родителя",
            optional: false,
          });
        }
        if (minorMode === "none") {
          items.push({
            text: "Без родителей: нотариальное согласие обоих родителей на выезд с указанным сопровождающим + копия его паспорта/визы и подтверждение родства при необходимости",
            optional: false,
          });
        }
        if (minorMode === "both") {
          items.push({
            text: "С обоими родителями: согласие на выезд обычно не нужно; на подаче — родители / опекун по документам",
            optional: false,
          });
        }
      }

      if (car === "yes") {
        items.push({
          text: "На авто: копия техпаспорта и водительского удостоверения владельца; въезд через Польшу. Авто должно быть на заявителя/едущих с ним — доверенности на чужое/фирменное авто сейчас не проходят. Владелец должен быть вписан в брони жилья",
          optional: false,
        });
      }

      if (italy === "yes") {
        items.push({
          text: "По желанию: доказательства прошлых поездок в Италию (оплаты с ФИО, билеты, жильё, музеи и т.п.) — до 4 двусторонних листов, всё читаемо",
          optional: true,
        });
      }

      return items;
    }

    function renderDocs(started) {
      const adult = getVal("adult");
      docList.innerHTML = "";
      buildDocs().forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item.text;
        if (item.optional) li.classList.add("tag-optional");
        docList.appendChild(li);
      });

      if (!started) {
        docHint.textContent =
          "Нажмите кнопку, чтобы начать. Базовый список появится сразу и будет уточняться.";
        return;
      }

      const pending = [];
      if (!adult) pending.push("возраст");
      else if (adult === "no" && !getVal("minorMode")) pending.push("как подаётся ребёнок");
      if (adult === "yes" && !getVal("work")) pending.push("статус работы");
      if (!getVal("car")) pending.push("авто");
      if (!getVal("italy")) pending.push("были ли в Италии");

      docHint.textContent = pending.length
        ? `Список уже собирается. Ещё уточните: ${pending.join(", ")}.`
        : "Список под вашу ситуацию готов. Сверьте с методичкой в @italyrbdaty перед подачей.";
    }

    function syncSteps() {
      const adult = getVal("adult");
      if (fields.minor) fields.minor.hidden = adult !== "no";
      if (fields.work) fields.work.hidden = adult !== "yes";
      const readyForCar =
        (adult === "yes" && getVal("work")) || (adult === "no" && getVal("minorMode"));
      if (fields.car) fields.car.hidden = !readyForCar;
      if (fields.italy) fields.italy.hidden = !getVal("car");
      renderDocs(true);
    }

    quizStart.addEventListener("click", () => {
      quizForm.hidden = false;
      quizStart.hidden = true;
      renderDocs(true);
    });

    quizForm.addEventListener("change", syncSteps);
  }
})();
