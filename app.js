const dayNames = ["НЕДІЛЯ", "ПОНЕДІЛОК", "ВІВТОРОК", "СЕРЕДА", "ЧЕТВЕР", "П'ЯТНИЦЯ", "СУБОТА"];

function normalizeText(str) {
    return str.toUpperCase().replace(/0/g, 'О').replace(/00/g, 'ОО').replace(/[ІНЛИ]/g, 'I').trim();
}

function generateSchedule() {
    let rawQuery = document.getElementById('universal-search').value;
    let query = normalizeText(rawQuery);
    const selectedCourse = document.getElementById('course-select').value;
    const startVal = document.getElementById('start-date').value;
    const endVal = document.getElementById('end-date').value;
    const output = document.getElementById('schedule-output');
    
    output.innerHTML = "";
    if (!query) { output.innerHTML = "<p style='color:#64748b; margin-top:20px;'>Введіть назву групи для пошуку.</p>"; return; }

    let targetGroup = null;
    for (let gName in db) {
        let normGName = normalizeText(gName);
        if (selectedCourse !== "all" && db[gName].course !== selectedCourse) continue;
        if (normGName === query || normGName.includes(query) || query.includes(normGName)) { targetGroup = gName; break; }
    }
    if (!targetGroup) { output.innerHTML = "<p style='color:#64748b; margin-top:20px;'>Групу не знайдено. Спробуйте написати: ОО-73-І</p>"; return; }

    if (!startVal || !endVal || isNaN(new Date(startVal).getTime()) || isNaN(new Date(endVal).getTime())) {
        for (let dayNum = 1; dayNum <= 5; dayNum++) {
            let allLessons = db[targetGroup].lessons[dayNum] || [];
            let dayCard = document.createElement('div');
            dayCard.className = 'generated-day';
            dayCard.innerHTML = `<div class="day-header"><span class="day-name">📅 ${dayNames[dayNum]} (Основний розклад) — ${targetGroup}</span></div>`;
            if (allLessons.length === 0) { dayCard.innerHTML += `<div class="no-lessons">Пар немає</div>`; } 
            else {
                allLessons.forEach(l => {
                    let lessonClass = l.canceled ? 'lesson canceled' : 'lesson';
                    let subStyle = l.canceled ? 'style="text-decoration: line-through; color: #888;"' : '';
                    let badge = l.canceled ? `<span class="cancel-badge">ВІДМІНЕНО</span>` : '';
                    dayCard.innerHTML += `<div class="${lessonClass}"><span class="time">${l.num} пара</span> ${badge}<div class="subject" ${subStyle}>${l.sub}</div><div class="teacher">${l.t}</div></div>`;
                });
            }
            output.appendChild(dayCard);
        }
        return;
    }

    let start = new Date(startVal); let end = new Date(endVal);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        let currentDayOfWeek = d.getDay(); if (currentDayOfWeek === 0 || currentDayOfWeek === 6) continue;
        let dateNum = d.getDate(); let isEvenNumber = dateNum % 2 === 0; let dayWeekType = isEvenNumber ? "even" : "odd";
        let allLessons = db[targetGroup].lessons[currentDayOfWeek] || [];
        let activeLessons = allLessons.filter(l => l.type === "always" || l.type === dayWeekType);

        if (activeLessons.length > 0) {
            let dayCard = document.createElement('div'); dayCard.className = 'generated-day';
            let formattedDate = String(dateNum).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0');
            dayCard.innerHTML = `<div class="day-header"><span class="day-name">📅 ${dayNames[currentDayOfWeek]} (${formattedDate}) — ${targetGroup}</span><span class="day-type" style="background:${isEvenNumber ? 'rgba(6, 182, 212, 0.15)' : 'rgba(139, 92, 246, 0.15)'}; color:${isEvenNumber ? '#06b6d4' : '#8b5cf6'}">${isEvenNumber ? 'Чисельник' : 'Знаменник'}</span></div>`;
            activeLessons.forEach(l => {
                let lessonClass = l.canceled ? 'lesson canceled' : 'lesson'; let subStyle = l.canceled ? 'style="text-decoration: line-through; color: #888;"' : '';
                let badge = l.canceled ? `<span class="cancel-badge">ВІДМІНЕНО</span>` : (l.type === 'even' ? '<span class="week-indicator type-even">Чис</span>' : (l.type === 'odd' ? '<span class="week-indicator type-odd">Знам</span>' : ''));
                dayCard.innerHTML += `<div class="${lessonClass}"><span class="time">${l.num} пара</span> ${badge}<div class="subject" ${subStyle}>${l.sub}</div><div class="teacher">${l.t}</div></div>`;
            });
            output.appendChild(dayCard);
        }
    }
}

window.onload = function() {
    const today = new Date(); const nextWeek = new Date(); nextWeek.setDate(today.getDate() + 7);
    let y1 = today.getFullYear(); let m1 = String(today.getMonth() + 1).padStart(2, '0'); let d1 = String(today.getDate()).padStart(2, '0');
    document.getElementById('start-date').value = `${y1}-${m1}-${d1}`;
    let y2 = nextWeek.getFullYear(); let m2 = String(nextWeek.getMonth() + 1).padStart(2, '0'); let d2 = String(nextWeek.getDate()).padStart(2, '0');
    document.getElementById('end-date').value = `${y2}-${m2}-${d2}`;
    generateSchedule();
}
