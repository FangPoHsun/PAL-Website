document.addEventListener('DOMContentLoaded', async () => {
    const calendarGrid = document.getElementById('calendar-grid');
    const monthDisplay = document.getElementById('current-month');
    const eventDetailsContainer = document.getElementById('event-details-content');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');

    // Exit if not on calendar page or required elements missing
    if (!calendarGrid || !monthDisplay || !eventDetailsContainer || !prevMonthBtn || !nextMonthBtn) return;

    // Check if the holiday reference data is loaded
    if (typeof specificEvents === 'undefined') {
        console.warn('Calendar data not loaded. Please ensure calendar-data.js is included before calendar.js');
        return;
    }

    // Load the editable events (admin panel) and merge them with the
    // holiday data from calendar-data.js
    let routineEvents = [];
    try {
        const res = await fetch('data/calendar.json?t=' + Date.now());
        const json = await res.json();
        routineEvents = (json.routineEvents || []).map(e => ({ ...e, day: Number(e.day) }));
        (json.labEvents || []).forEach(e => {
            if (e.date) specificEvents[e.date] = { type: 'event', ...e };
        });
    } catch (e) {
        console.error('Failed to load data/calendar.json — serve the site over HTTP, not file://', e);
    }

    let currentDate = new Date();

    const renderCalendar = (date) => {
        calendarGrid.innerHTML = '';
        const year = date.getFullYear();
        const month = date.getMonth();

        // Month Names
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];

        monthDisplay.textContent = `${monthNames[month]} ${year}`;

        // First day of usage month
        const firstDay = new Date(year, month, 1).getDay();
        // Days in month
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Previous month padding
        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('calendar-day', 'empty');
            calendarGrid.appendChild(emptyCell);
        }

        // Days — real buttons so the calendar is keyboard-operable
        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement('button');
            dayCell.type = 'button';
            dayCell.classList.add('calendar-day');

            const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const currentDayOfWeek = new Date(year, month, day).getDay();

            // Check events
            let hasEvent = false;
            let eventType = '';

            // Check routine
            const routine = routineEvents.find(e => e.day === currentDayOfWeek);
            if (routine) {
                hasEvent = true;
                eventType = 'routine';
            }

            // Check specific (overrides routine visual if needed, or co-exists)
            if (specificEvents[dateString]) {
                hasEvent = true;
                eventType = 'specific'; // Priority
            }

            // Today check
            const today = new Date();
            if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                dayCell.classList.add('today');
            }

            if (hasEvent) {
                dayCell.classList.add('has-event');
                if (eventType === 'specific') dayCell.classList.add('event-specific');
                if (eventType === 'routine') dayCell.classList.add('event-routine');
            }

            dayCell.textContent = day;
            dayCell.dataset.date = dateString;
            dayCell.addEventListener('click', () => {
                calendarGrid.querySelectorAll('.calendar-day.selected')
                    .forEach(c => c.classList.remove('selected'));
                dayCell.classList.add('selected');
                showEventDetails(dateString, currentDayOfWeek);
            });

            calendarGrid.appendChild(dayCell);
        }
    };

    const showEventDetails = (dateString, dayOfWeek) => {
        const specific = specificEvents[dateString];
        const routine = routineEvents.find(e => e.day === dayOfWeek);

        // Format Header Date
        const dateObj = new Date(dateString);
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        let html = `<h3>${dateObj.toLocaleDateString('en-US', options)}</h3>`;

        if (specific) {
            html += `
                <div class="event-card specific">
                    <h4>${specific.title}</h4>
                    <p><strong>Time:</strong> ${specific.time}</p>
                    <p><strong>Location:</strong> ${specific.location || 'See Details'}</p>
                    <p>${specific.description}</p>
                </div>
            `;
        }

        if (routine) {
            html += `
                <div class="event-card routine">
                    <h4>${routine.title} <span class="badge">Routine</span></h4>
                    <p><strong>Time:</strong> ${routine.time}</p>
                    <p><strong>Location:</strong> ${routine.location}</p>
                    <p>${routine.description}</p>
                </div>
            `;
        }

        if (!specific && !routine) {
            html += `<p>No events scheduled for this date.</p>`;
        }

        eventDetailsContainer.innerHTML = html;
        // (the clicked day cell manages its own .selected highlight)
    };

    // Listeners
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar(currentDate);
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(currentDate);
    });

    // --- Upcoming list: next routine meetings, holidays and lab events ---
    const upcomingList = document.getElementById('upcoming-list');
    const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const toDs = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    const renderUpcoming = () => {
        if (!upcomingList) return;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const horizon = 120 * 86400000;
        const items = [];

        Object.keys(specificEvents).forEach(ds => {
            const d = new Date(ds + 'T00:00:00');
            if (isNaN(d) || d < today || d - today > horizon) return;
            const ev = specificEvents[ds];
            items.push({ date: d, ds, title: ev.title, time: ev.time,
                         type: ev.type === 'holiday' ? 'holiday' : 'event' });
        });
        routineEvents.forEach(r => {
            for (let i = 0, n = 0; i < 28 && n < 3; i++) {
                const d = new Date(today);
                d.setDate(today.getDate() + i);
                if (d.getDay() === r.day) {
                    items.push({ date: d, ds: toDs(d), title: r.title, time: r.time, type: 'routine' });
                    n++;
                }
            }
        });
        items.sort((a, b) => a.date - b.date);

        const lang = localStorage.getItem('pallab-lang') || 'en';
        const fmt = d => d.toLocaleDateString(lang === 'zh' ? 'zh-TW' : 'en-US',
            { month: 'short', day: 'numeric', weekday: 'short' });

        if (!items.length) {
            upcomingList.innerHTML = `<li class="up-empty">${lang === 'zh' ? '近期沒有排定的行程。' : 'Nothing scheduled in the next few months.'}</li>`;
            return;
        }
        upcomingList.innerHTML = items.slice(0, 6).map(it => `
            <li><button type="button" class="up-item up-${it.type}" data-date="${it.ds}">
                <span class="up-date">${fmt(it.date)}</span>
                <span class="up-title">${esc(it.title)}</span>
                ${it.time && it.time !== 'All Day' ? `<span class="up-time">${esc(it.time)}</span>` : ''}
            </button></li>`).join('');
    };

    // Clicking an upcoming item jumps the calendar to that day
    if (upcomingList) {
        upcomingList.addEventListener('click', (e) => {
            const btn = e.target.closest('.up-item');
            if (!btn) return;
            const d = new Date(btn.dataset.date + 'T00:00:00');
            currentDate = new Date(d.getFullYear(), d.getMonth(), 1);
            renderCalendar(currentDate);
            const cell = calendarGrid.querySelector(`[data-date="${btn.dataset.date}"]`);
            if (cell) cell.click();
        });
    }

    // Initial Render: open on today, with what's coming up beneath
    renderCalendar(currentDate);
    renderUpcoming();
    const todayCell = calendarGrid.querySelector('.calendar-day.today');
    if (todayCell) todayCell.click();
});
