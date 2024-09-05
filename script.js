document.addEventListener("DOMContentLoaded", function () {
    const habitInput = document.getElementById("habit-input");
    const addHabitBtn = document.getElementById("add-habit-btn");
    const habitList = document.getElementById("habit-list");
    const exportBtn = document.getElementById("export-btn");

    let habits = JSON.parse(localStorage.getItem("habits")) || [];

    // Helper function to get today's day index (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    function getTodayDayIndex() {
        return new Date().getDay();
    }

    // Render habits
    function renderHabits() {
        habitList.innerHTML = "";
        const todayIndex = getTodayDayIndex();

        habits.forEach((habit, index) => {
            const habitElement = document.createElement("li");
            habitElement.classList.add("habit");

            const habitDays = habit.days || Array(7).fill(false);

            habitElement.innerHTML = `
                <span>${habit.name} - Streak: ${habit.streak}</span>
                <div class="habit-days">
                    ${habitDays.map((completed, dayIndex) => `
                        <button class="${completed ? 'completed' : ''} ${dayIndex !== todayIndex ? 'disabled' : ''}" 
                                onclick="markDay(${index}, ${dayIndex})">
                            ${getDayName(dayIndex)}
                        </button>
                    `).join('')}
                </div>
                <button onclick="deleteHabit(${index})">Delete</button>
            `;

            habitList.appendChild(habitElement);
        });
    }

    // Add a new habit
    addHabitBtn.addEventListener("click", () => {
        const habitName = habitInput.value.trim();
        if (habitName) {
            habits.push({
                name: habitName,
                streak: 0,
                days: Array(7).fill(false), // Track completed days
                lastCompletedDay: null // For tracking the last consecutive day
            });
            habitInput.value = "";
            updateLocalStorage();
            renderHabits();
        }
    });

    // Delete a habit
    window.deleteHabit = function (index) {
        habits.splice(index, 1);
        updateLocalStorage();
        renderHabits();
    };

    // Mark the current day complete and update streak
    window.markDay = function (habitIndex, dayIndex) {
        const habit = habits[habitIndex];
        const todayIndex = getTodayDayIndex();

        // Only allow marking the current day
        if (dayIndex !== todayIndex) {
            return;
        }

        // If the day is already completed, prevent further marking
        if (habit.days[dayIndex]) {
            alert("You have already marked this day as completed.");
            return;
        }

        // Mark the day as completed
        habit.days[dayIndex] = true;

        // Update streak logic based on consecutive completion
        if (habit.lastCompletedDay === null || isConsecutiveDay(habit.lastCompletedDay, dayIndex)) {
            habit.streak += 1; // Increment streak if consecutive
        } else {
            habit.streak = 1; // Reset streak if non-consecutive
        }

        habit.lastCompletedDay = dayIndex; // Update last completed day
        updateLocalStorage();
        renderHabits();
    };

    // Check if the previous completed day is consecutive
    function isConsecutiveDay(lastDay, currentDay) {
        // Check if the current day is immediately after the last day (considering the week cycle)
        return (currentDay === (lastDay + 1) % 7);
    }

    // Update local storage
    function updateLocalStorage() {
        localStorage.setItem("habits", JSON.stringify(habits));
    }

    // Export data
    exportBtn.addEventListener("click", () => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + habits.map(h => `${h.name},${h.streak},${h.days.join(',')}`).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "habits.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // Utility function to get day name by index
    function getDayName(dayIndex) {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        return days[dayIndex];
    }

    renderHabits();
});
