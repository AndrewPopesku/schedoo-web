// API base URL with CORS proxy
const API_BASE_URL = 'https://v0-http-proxy-server.vercel.app/api/proxy';

// For development/testing, we'll use local mock data if API is unreachable
// Sample mock data for semesters
const MOCK_SEMESTERS = [
  {
    id: 57,
    description: "2 семестр 24/25",
    year: 2025,
    startDay: "17/02/2025",
    endDay: "23/05/2025",
    currentSemester: true,
    defaultSemester: true,
    disable: false,
    semester_days: [
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY"
    ],
    semester_classes: [
      {
        id: 1,
        startTime: "08:20",
        endTime: "09:40",
        class_name: "1"
      },
      {
        id: 2,
        startTime: "09:50",
        endTime: "11:10",
        class_name: "2"
      },
      {
        id: 3,
        startTime: "11:30",
        endTime: "12:50",
        class_name: "3"
      },
      {
        id: 4,
        startTime: "13:00",
        endTime: "14:20",
        class_name: "4"
      }
    ],
    semester_groups: [
      {
        id: 30,
        disable: false,
        title: "101-А"
      },
      {
        id: 29,
        disable: false,
        title: "101-Б"
      },
      {
        id: 40,
        disable: false,
        title: "302"
      },
      {
        id: 41,
        disable: false,
        title: "312"
      }
    ]
  }
];

// Mock schedule data
const MOCK_SCHEDULE = [
  {
    id: 1,
    subject: "Числові методи",
    professor: "Бєгун Ярослав Йосипович",
    type: "lecture",
    classroom: "1 к. 18 ауд.",
    timeStart: "08:20",
    timeEnd: "09:40",
    day: "WEDNESDAY",
    online: false,
    weekType: "EVEN"
  },
  {
    id: 2,
    subject: "Системне програмування",
    professor: "Сопронюк Тетяна Миколаївна",
    type: "lecture",
    classroom: "1 к. 39 ауд.",
    timeStart: "09:50",
    timeEnd: "11:10",
    day: "MONDAY",
    online: false,
    weekType: "EVEN"
  },
  {
    id: 3,
    subject: "Теорія інформації та кодування",
    professor: "Шелепюк Богдан Дмитрович",
    type: "lecture",
    classroom: "1 к. 23 ауд.",
    timeStart: "09:50",
    timeEnd: "11:10",
    day: "WEDNESDAY",
    online: false,
    weekType: "EVEN"
  },
  {
    id: 4,
    subject: "Серверна мова PHP",
    professor: "Скутар Ігор Дмитрович",
    type: "laboratory",
    classroom: "1 к. 19 ауд.",
    timeStart: "09:50",
    timeEnd: "11:10",
    day: "THURSDAY",
    online: false,
    weekType: "EVEN"
  },
  {
    id: 5,
    subject: "Теорія інформації та кодування",
    professor: "Шелепюк Богдан Дмитрович",
    type: "laboratory",
    classroom: "1 к. 23 ауд.",
    timeStart: "11:30",
    timeEnd: "12:50",
    day: "WEDNESDAY",
    online: false,
    weekType: "EVEN"
  },
  {
    id: 6,
    subject: "Платформи корпоративних інформаційних систем",
    professor: "Мельник Галина Василівна",
    type: "lecture",
    classroom: "",
    timeStart: "09:50",
    timeEnd: "11:10",
    day: "FRIDAY",
    online: true,
    weekType: "ODD"
  }
];

// Types
export interface SemesterClass {
  id: number;
  startTime: string;
  endTime: string;
  class_name: string;
}

export interface SemesterGroup {
  id: number;
  disable: boolean;
  title: string;
}

export interface Semester {
  id: number;
  description: string;
  year: number;
  startDay: string;
  endDay: string;
  currentSemester: boolean;
  defaultSemester: boolean;
  disable: boolean;
  semester_days: string[];
  semester_classes: SemesterClass[];
  semester_groups: SemesterGroup[];
}

export interface ScheduleItem {
  id: number;
  subject: string;
  professor: string;
  type: "lecture" | "laboratory" | "practical" | "exam";
  classroom: string;
  timeStart: string;
  timeEnd: string;
  day: string;
  online: boolean;
  weekType: "ODD" | "EVEN" | "EVERY";
}

// API functions
export const fetchSemesters = async (): Promise<Semester[]> => {
  try {
    // Try to fetch from API first
    try {
      const response = await fetch(`${API_BASE_URL}/semesters`, {
        // mode: 'cors', // added to fix CORS error
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data: Semester[] = await response.json();
        return data.filter(semester => !semester.disable);
      }
    } catch (apiError) {
      console.error('API Error, falling back to mock data:', apiError);
    }

    // Fall back to mock data if API fails
    console.log('Using mock semester data');
    return MOCK_SEMESTERS.filter(semester => !semester.disable);
  } catch (error) {
    console.error('Error fetching semesters:', error);
    return [];
  }
};

// Get schedule for a specific group and semester
export const fetchSchedule = async (groupId: number, semesterId: number): Promise<ScheduleItem[]> => {
  try {
    // Try to fetch from API first
    try {
      const response = await fetch(`${API_BASE_URL}/schedules?groupId=${groupId}&semesterId=${semesterId}`, {
        // mode: 'cors', // uncomment if needed for CORS
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const json = await response.json();
        // Adapt endpoint: if response has nested schedule data, flatten it
        if (json.schedule && Array.isArray(json.schedule)) {
          const flatSchedule: ScheduleItem[] = [];
          json.schedule.forEach((groupSchedule: any) => {
            groupSchedule.days.forEach((dayEntry: any) => {
              const day: string = dayEntry.day;
              dayEntry.classes.forEach((classEntry: any) => {
                ['even', 'odd'].forEach((weekKey) => {
                  const weekData = classEntry.weeks[weekKey];
                  if (weekData) {
                    flatSchedule.push({
                      id: Number(`${classEntry.class.id}${weekKey === 'even' ? '0' : '1'}`), // composite id
                      subject: weekData.subjectForSite,
                      professor: `${weekData.teacher.surname} ${weekData.teacher.name} ${weekData.teacher.patronymic ?? ''}`.trim(),
                      type: weekData.lessonType.toLowerCase(), // map to lower-case type
                      classroom: weekData.room.name,
                      timeStart: classEntry.class.startTime,
                      timeEnd: classEntry.class.endTime,
                      day: day,
                      online: false, // default; adjust if online info available
                      weekType: weekKey.toUpperCase() as "EVEN" | "ODD"
                    });
                  }
                });
              });
            });
          });
          return flatSchedule;
        }
        // Fallback if structure does not match
        return await response.json();
      }
    } catch (apiError) {
      console.error('API Error, falling back to mock data:', apiError);
    }

    // Fall back to mock data if API fails
    console.log('Using mock schedule data');
    return MOCK_SCHEDULE;
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return [];
  }
};

// Helper functions
export const getCurrentSemester = (semesters: Semester[]): Semester | undefined => {
  return semesters.find(semester => semester.currentSemester) ||
         semesters.find(semester => semester.defaultSemester) ||
         semesters[0];
};

export const getActiveSemesterGroups = (semester: Semester | undefined): SemesterGroup[] => {
  if (!semester) return [];
  return semester.semester_groups.filter(group => !group.disable);
};

export const dayNameMap: Record<string, string> = {
  'MONDAY': 'Monday',
  'TUESDAY': 'Tuesday',
  'WEDNESDAY': 'Wednesday',
  'THURSDAY': 'Thursday',
  'FRIDAY': 'Friday',
  'SATURDAY': 'Saturday',
  'SUNDAY': 'Sunday'
};
