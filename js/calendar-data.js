/**
 * Lab Calendar Data
 *
 * HOW TO ADD EVENTS:
 * 1. Routine Events: Add to the `routineEvents` array.
 *    - day: 0 (Sunday) to 6 (Saturday)
 *    - title: "Event Name"
 *    - time: "Start - End"
 *    - location: "Room/Building"
 *
 * 2. Specific Events: Add to the `specificEvents` object.
 *    - Key: "YYYY-MM-DD"
 *    - Value: { title: "Event Name", description: "Details", time: "Start - End", location: "If different" }
 *
 * 3. Lunar Calendar Festivals: Update `lunarFestivals` object yearly
 *    - Lunar dates change each year, so manual updates are needed
 */

const routineEvents = [
    {
        day: 4, // Thursday
        title: "Group Meeting",
        time: "09:30 - 12:00",
        location: "NYCU TKP Photonic Bldg Rm 316",
        description: "Weekly lab group meeting."
    }
];

// Fixed holidays that occur on the same date every year
const fixedHolidays = {
    "01-01": { title: "New Year's Day (元旦)", description: "Lab Closed", type: "holiday" },
    "02-28": { title: "228 Peace Memorial Day (和平紀念日)", description: "National Holiday", type: "holiday" },
    "10-10": { title: "National Day (雙十節)", description: "Republic of China National Day", type: "holiday" },
};

// Lunar calendar festivals - dates vary by year
// Chinese Zodiac: 鼠牛虎兔龍蛇馬羊猴雞狗豬
const lunarFestivals = {
    // === 2025 Year of the Snake (蛇年) ===
    "2025-01-28": { title: "Chinese New Year's Eve (除夕)", description: "Lunar New Year's Eve - Family Reunion Dinner" },
    "2025-01-29": { title: "Chinese New Year (春節)", description: "Year of the Snake - 蛇年" },
    "2025-01-30": { title: "Spring Festival Day 2 (春節)", description: "Chinese New Year Holiday" },
    "2025-01-31": { title: "Spring Festival Day 3 (春節)", description: "Chinese New Year Holiday" },
    "2025-02-12": { title: "Lantern Festival (元宵節)", description: "15th day of Lunar New Year - 吃元宵、賞花燈" },
    "2025-04-04": { title: "Qingming Festival (清明節)", description: "Tomb Sweeping Day - 掃墓祭祖" },
    "2025-05-31": { title: "Dragon Boat Festival (端午節)", description: "5th day of 5th Lunar Month - 吃粽子、划龍舟" },
    "2025-10-06": { title: "Mid-Autumn Festival (中秋節)", description: "15th day of 8th Lunar Month - 賞月、吃月餅" },
    "2025-10-29": { title: "Double Ninth Festival (重陽節)", description: "9th day of 9th Lunar Month - 登高、敬老" },

    // === 2026 Year of the Horse (馬年) ===
    "2026-02-16": { title: "Chinese New Year's Eve (除夕)", description: "Lunar New Year's Eve - Family Reunion Dinner" },
    "2026-02-17": { title: "Chinese New Year (春節)", description: "Year of the Horse - 馬年" },
    "2026-02-18": { title: "Spring Festival Day 2 (春節)", description: "Chinese New Year Holiday" },
    "2026-02-19": { title: "Spring Festival Day 3 (春節)", description: "Chinese New Year Holiday" },
    "2026-03-03": { title: "Lantern Festival (元宵節)", description: "15th day of Lunar New Year - 吃元宵、賞花燈" },
    "2026-04-05": { title: "Qingming Festival (清明節)", description: "Tomb Sweeping Day - 掃墓祭祖" },
    "2026-06-19": { title: "Dragon Boat Festival (端午節)", description: "5th day of 5th Lunar Month - 吃粽子、划龍舟" },
    "2026-09-25": { title: "Mid-Autumn Festival (中秋節)", description: "15th day of 8th Lunar Month - 賞月、吃月餅" },
    "2026-10-18": { title: "Double Ninth Festival (重陽節)", description: "9th day of 9th Lunar Month - 登高、敬老" },

    // === 2027 Year of the Goat (羊年) ===
    "2027-02-05": { title: "Chinese New Year's Eve (除夕)", description: "Lunar New Year's Eve - Family Reunion Dinner" },
    "2027-02-06": { title: "Chinese New Year (春節)", description: "Year of the Goat - 羊年" },
    "2027-02-07": { title: "Spring Festival Day 2 (春節)", description: "Chinese New Year Holiday" },
    "2027-02-08": { title: "Spring Festival Day 3 (春節)", description: "Chinese New Year Holiday" },
    "2027-02-20": { title: "Lantern Festival (元宵節)", description: "15th day of Lunar New Year - 吃元宵、賞花燈" },
    "2027-04-05": { title: "Qingming Festival (清明節)", description: "Tomb Sweeping Day - 掃墓祭祖" },
    "2027-06-08": { title: "Dragon Boat Festival (端午節)", description: "5th day of 5th Lunar Month - 吃粽子、划龍舟" },
    "2027-09-15": { title: "Mid-Autumn Festival (中秋節)", description: "15th day of 8th Lunar Month - 賞月、吃月餅" },
    "2027-10-08": { title: "Double Ninth Festival (重陽節)", description: "9th day of 9th Lunar Month - 登高、敬老" },

    // === 2028 Year of the Monkey (猴年) ===
    "2028-01-25": { title: "Chinese New Year's Eve (除夕)", description: "Lunar New Year's Eve - Family Reunion Dinner" },
    "2028-01-26": { title: "Chinese New Year (春節)", description: "Year of the Monkey - 猴年" },
    "2028-01-27": { title: "Spring Festival Day 2 (春節)", description: "Chinese New Year Holiday" },
    "2028-01-28": { title: "Spring Festival Day 3 (春節)", description: "Chinese New Year Holiday" },
    "2028-02-09": { title: "Lantern Festival (元宵節)", description: "15th day of Lunar New Year - 吃元宵、賞花燈" },
    "2028-04-04": { title: "Qingming Festival (清明節)", description: "Tomb Sweeping Day - 掃墓祭祖" },
    "2028-05-28": { title: "Dragon Boat Festival (端午節)", description: "5th day of 5th Lunar Month - 吃粽子、划龍舟" },
    "2028-10-03": { title: "Mid-Autumn Festival (中秋節)", description: "15th day of 8th Lunar Month - 賞月、吃月餅" },
    "2028-10-26": { title: "Double Ninth Festival (重陽節)", description: "9th day of 9th Lunar Month - 登高、敬老" },

    // === 2029 Year of the Rooster (雞年) ===
    "2029-02-12": { title: "Chinese New Year's Eve (除夕)", description: "Lunar New Year's Eve - Family Reunion Dinner" },
    "2029-02-13": { title: "Chinese New Year (春節)", description: "Year of the Rooster - 雞年" },
    "2029-02-14": { title: "Spring Festival Day 2 (春節)", description: "Chinese New Year Holiday" },
    "2029-02-15": { title: "Spring Festival Day 3 (春節)", description: "Chinese New Year Holiday" },
    "2029-02-27": { title: "Lantern Festival (元宵節)", description: "15th day of Lunar New Year - 吃元宵、賞花燈" },
    "2029-04-04": { title: "Qingming Festival (清明節)", description: "Tomb Sweeping Day - 掃墓祭祖" },
    "2029-06-16": { title: "Dragon Boat Festival (端午節)", description: "5th day of 5th Lunar Month - 吃粽子、划龍舟" },
    "2029-09-22": { title: "Mid-Autumn Festival (中秋節)", description: "15th day of 8th Lunar Month - 賞月、吃月餅" },
    "2029-10-16": { title: "Double Ninth Festival (重陽節)", description: "9th day of 9th Lunar Month - 登高、敬老" },

    // === 2030 Year of the Dog (狗年) ===
    "2030-02-02": { title: "Chinese New Year's Eve (除夕)", description: "Lunar New Year's Eve - Family Reunion Dinner" },
    "2030-02-03": { title: "Chinese New Year (春節)", description: "Year of the Dog - 狗年" },
    "2030-02-04": { title: "Spring Festival Day 2 (春節)", description: "Chinese New Year Holiday" },
    "2030-02-05": { title: "Spring Festival Day 3 (春節)", description: "Chinese New Year Holiday" },
    "2030-02-17": { title: "Lantern Festival (元宵節)", description: "15th day of Lunar New Year - 吃元宵、賞花燈" },
    "2030-04-05": { title: "Qingming Festival (清明節)", description: "Tomb Sweeping Day - 掃墓祭祖" },
    "2030-06-05": { title: "Dragon Boat Festival (端午節)", description: "5th day of 5th Lunar Month - 吃粽子、划龍舟" },
    "2030-09-12": { title: "Mid-Autumn Festival (中秋節)", description: "15th day of 8th Lunar Month - 賞月、吃月餅" },
    "2030-10-05": { title: "Double Ninth Festival (重陽節)", description: "9th day of 9th Lunar Month - 登高、敬老" }
};

// Generate specific events by combining fixed holidays and lunar festivals
function generateSpecificEvents(startYear, endYear) {
    const events = {};

    // Add fixed holidays for each year
    for (let year = startYear; year <= endYear; year++) {
        for (const [monthDay, holiday] of Object.entries(fixedHolidays)) {
            const dateKey = `${year}-${monthDay}`;
            events[dateKey] = { ...holiday, time: "All Day" };
        }
    }

    // Add lunar festivals
    for (const [date, festival] of Object.entries(lunarFestivals)) {
        events[date] = { ...festival, time: "All Day", type: "holiday" };
    }

    return events;
}

// Generate events from 2025 to 2030
const specificEvents = generateSpecificEvents(2025, 2030);

// Export for usage if using modules (but we are using plain script tags for simplicity)
// window.calendarData = { routineEvents, specificEvents };
