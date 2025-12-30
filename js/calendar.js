document.addEventListener('DOMContentLoaded', () => {
    const calendarGrid = document.getElementById('calendar-grid');
    const monthDisplay = document.getElementById('current-month');
    const eventDetailsContainer = document.getElementById('event-details-content');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');

    // Exit if not on calendar page or required elements missing
    if (!calendarGrid || !monthDisplay || !eventDetailsContainer || !prevMonthBtn || !nextMonthBtn) return;

    // Check if calendar data is loaded
    if (typeof routineEvents === 'undefined' || typeof specificEvents === 'undefined') {
        console.warn('Calendar data not loaded. Please ensure calendar-data.js is included before calendar.js');
        return;
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

        // Days
        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement('div');
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
            dayCell.addEventListener('click', () => showEventDetails(dateString, currentDayOfWeek));

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

        // Highlight selected day
        const allDays = document.querySelectorAll('.calendar-day');
        allDays.forEach(d => d.classList.remove('selected'));
        // Find the day cell that was clicked (approximate way or pass element)
        // Re-selecting based on text content and logic is tricky, simpler to let user click visuals
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

    // Initial Render
    renderCalendar(currentDate);
});
