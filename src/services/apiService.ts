import { ScheduleItem, Semester, GroupSchedule, SemesterGroup } from "@/lib/types";

// API base URL with CORS proxy
const API_BASE_URL = 'https://v0-http-proxy-server.vercel.app/api/proxy';

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
    return [];
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
          // Define types for the response structure to avoid using 'any'
          const flatSchedule: ScheduleItem[] = [];
          (json.schedule as GroupSchedule[]).forEach((groupSchedule: GroupSchedule) => {
            groupSchedule.days.forEach(dayEntry => {
              const day: string = dayEntry.day;
              dayEntry.classes.forEach(classEntry => {
                (['even', 'odd'] as const).forEach((weekKey) => {
                  const weekData = classEntry.weeks[weekKey];
                  if (weekData) {
                    flatSchedule.push({
                      id: Number(`${classEntry.class.id}${weekKey === 'even' ? '0' : '1'}`), // composite id
                      subject: weekData.subjectForSite,
                      professor: `${weekData.teacher.surname} ${weekData.teacher.name} ${weekData.teacher.patronymic ?? ''}`.trim(),
                      type: weekData.lessonType.toLowerCase() as "lecture" | "laboratory" | "practical" | "exam",
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
    
    return [];
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
