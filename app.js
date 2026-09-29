const dayNames = ["НЕДІЛЯ", "ПОНЕДІЛОК", "ВІВТОРОК", "СЕРЕДА", "ЧЕТВЕР", "П'ЯТНИЦЯ", "СУБОТА"];

// Функція для визначення часу пари
function getLessonTime(num) {
    const times = {
        1: "08:00 - 09:20",
        2: "09:30 - 10:50",
        3: "11:10 - 12:30",
        4: "12:40 - 14:00",
        5: "14:10 - 15:30"
    };
    return times[num] || "08:00";
}

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
    if (!targetGroup) { output.innerHTML = "<p style='color:#64748b; margin-top:20px;'>Групу не знайдено. Спробуйте: ОО-73-І</p>"; return; }

    // ЛОГІКА: Якщо дати порожні — просто виводимо стабільний тиждень Пн-Пт без прив'язки до чисел місяця
    if (!startVal || !endVal || isNaN(new Date(startVal).getTime()) || isNaN(new Date(endVal).getTime())) {
        for (let dayNum = 1; dayNum <= 5; dayNum++) {
            let allLessons = db[targetGroup].lessons[dayNum] || [];
            let dayCard = document.createElement('div');
            dayCard.className = 'generated-day';
            dayCard.innerHTML = `<div class="day-header"><span class="day-name">📅 ${dayNames[dayNum]} — ${targetGroup}</span></div>`;
            
            if (allLessons.length === 0) { dayCard.innerHTML += `<div class="no-lessons">Пар немає</div>`; } 
            else {
                allLessons.forEach(l => {
                    let lessonClass = l.canceled ? 'lesson canceled' : 'lesson';
                    let subStyle = l.canceled ? 'style="text-decoration: line-through; color: #888;"' : '';
                    let badge = l.canceled ? `<span class="cancel-badge">ВІДМІНЕНО</span>` : '';
                    let timeRange = getLessonTime(l.num);
                    dayCard.innerHTML += `<div class="${lessonClass}"><span class="time">${l.num} пара (${timeRange})</span> ${badge}<div class="subject" ${subStyle}>${l.sub}</div><div class="teacher">${l.t}</div></div>`;
                });
            }
            output.appendChild(dayCard);
        }
        return;
    }

    // Якщо студент САМ обрав період дат в календарі
    let start = new Date(startVal); let end = new Date(endVal);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        let currentDayOfWeek = d.getDay(); if (currentDayOfWeek === 0 || currentDayOfWeek === 6) continue;
        let dateNum = d.getDate();
        let allLessons = db[targetGroup].lessons[currentDayOfWeek] || [];

        if (allLessons.length > 0) {
            let dayCard = document.createElement('div'); dayCard.className = 'generated-day';
            let formattedDate = String(dateNum).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0');
            dayCard.innerHTML = `<div class="day-header"><span class="day-name">📅 ${dayNames[currentDayOfWeek]} (${formattedDate}) — ${targetGroup}</span></div>`;
            
            allLessons.forEach(l => {
                let lessonClass = l.canceled ? 'lesson canceled' : 'lesson'; 
                let subStyle = l.canceled ? 'style="text-decoration: line-through; color: #888;"' : '';
                let badge = l.canceled ? `<span class="cancel-badge">ВІДМІНЕНО</span>` : '';
                let timeRange = getLessonTime(l.num);
                dayCard.innerHTML += `<div class="${lessonClass}"><span class="time">${l.num} пара (${timeRange})</span> ${badge}<div class="subject" ${subStyle}>${l.sub}</div><div class="teacher">${l.t}</div></div>`;
            });
            output.appendChild(dayCard);
        }
    }
}

window.onload = function() {
    // ДАТИ ПРИ ЗАХОДІ ПОВНІСТЮ ПОРОЖНІ ЗА ТВОЇМ БАЖАННЯМ
    document.getElementById('start-date').value = "";
    document.getElementById('end-date').value = "";
    Telegram.WebApp.ready(); 
    Telegram.WebApp.expand();
}
