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

export type LessonType = "lecture" | "laboratory" | "practical" | "exam";
export type WeekType = "ODD" | "EVEN";

export interface ScheduleItem {
    id: number;
    subject: string;
    professor: string;
    type: LessonType;
    classroom: string;
    timeStart: string;
    timeEnd: string;
    day: string;
    online: boolean;
    weekType: WeekType;
}

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

export interface GroupSchedule {
    days: {
        day: string;
        classes: {
            weeks: {
                even?: {
                    subjectForSite: string;
                    teacher: {
                        surname: string;
                        name: string;
                        patronymic?: string;
                    };
                    lessonType: string;
                    room: {
                        name: string;
                    };
                };
                odd?: {
                    subjectForSite: string;
                    teacher: {
                        surname: string;
                        name: string;
                        patronymic?: string;
                    };
                    lessonType: string;
                    room: {
                        name: string;
                    };
                };
            };
            class: {
                id: number;
                startTime: string;
                endTime: string;
                class_name: string;
            };
        }[];
    }[];
}

export interface TimeSlot {
    start: string;
    end: string;
}

export interface ClassInfo {
    subject: string;
    professor: string;
    type: LessonType;
    room: string;
    online: boolean;
    timeSlot: TimeSlot;
    day: string;
}