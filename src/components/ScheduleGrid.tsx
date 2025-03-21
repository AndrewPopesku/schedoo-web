"use client";

import React, { useState, useEffect, useMemo } from "react";
import ClassCard from "@/components/ClassCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  fetchSchedule,
  dayNameMap
} from "@/services/apiService";
import { SemesterClass } from "@/lib/types";

// Types for ScheduleGrid props
interface ScheduleGridProps {
  semesterId: number;
  groupId: number;
  weekType: "ODD" | "EVEN";
  semesterDays: string[];
  semesterClasses: SemesterClass[];
}

// Types for schedule data
interface ScheduleClassItem {
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

interface ClassInfo {
  subject: string;
  professor: string;
  type: "lecture" | "laboratory" | "practical" | "exam";
  room: string;
  online: boolean;
  timeSlot: {
    start: string;
    end: string;
  };
  day: string;
}

interface WeekDay {
  name: string;
  date: string;
  current: boolean;
  value: string;
}

export default function ScheduleGrid({
  semesterId,
  groupId,
  weekType,
  semesterDays,
  semesterClasses
}: ScheduleGridProps) {
  const [scheduleData, setScheduleData] = useState<ScheduleClassItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState<string>("");
  const [weekDays, setWeekDays] = useState<WeekDay[]>([]);

  // Format day name for display
  const formatDayName = (day: string) => {
    return dayNameMap[day] || day;
  };

  // Process semester days into weekDays
  useEffect(() => {
    const formattedWeekDays = semesterDays.map(day => ({
      name: formatDayName(day),
      date: "", // We don't have date information from the API
      current: day === "WEDNESDAY", // Just keep Wednesday as default active day
      value: day.toLowerCase()
    }));

    setWeekDays(formattedWeekDays);

    // Set initial active day
    if (formattedWeekDays.length > 0) {
      // Find the current day or use the first available day
      const current = formattedWeekDays.find(day => day.current) || formattedWeekDays[0];
      setActiveDay(current.value);
    }
  }, [semesterDays]);

  // Fetch schedule data when semesterId or groupId changes
  useEffect(() => {
    const getScheduleData = async () => {
      if (!semesterId || !groupId) return;

      setLoading(true);
      setError(null);

      try {
        const data = await fetchSchedule(groupId, semesterId);
        if (data.length > 0) {
          setScheduleData(data);
        } else {
          setError("No schedule data available");
        }
      } catch (err) {
        setError("Failed to load schedule data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getScheduleData();
  }, [semesterId, groupId]);

  // Convert schedule data to our ClassInfo format
  const formatScheduleData = useMemo(() => {
    if (!scheduleData.length) return [];

    return scheduleData
      .filter(item => item.weekType === weekType || item.weekType === "EVERY")
      .map(item => ({
        subject: item.subject,
        professor: item.professor,
        type: item.type as "lecture" | "laboratory",
        room: item.classroom,
        online: item.online,
        timeSlot: {
          start: item.timeStart,
          end: item.timeEnd
        },
        day: formatDayName(item.day)
      }));
  }, [scheduleData, weekType]);

  // Get all classes for a specific day
  const getClassesForDay = (day: string): ClassInfo[] => {
    return formatScheduleData.filter(cls =>
      cls.day.toLowerCase() === day.toLowerCase()
    );
  };

  // Find classes for a specific time slot and day
  const getClassForTimeSlotAndDay = (timeSlot: SemesterClass, day: string): ClassInfo | null => {
    return formatScheduleData.find(cls =>
      cls.timeSlot.start === timeSlot.startTime &&
      cls.timeSlot.end === timeSlot.endTime &&
      cls.day.toLowerCase() === formatDayName(day).toLowerCase()
    ) || null;
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-blue-500">Loading schedule...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center p-8 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Mobile view - tabs for days */}
      <div className="md:hidden">
        <Tabs defaultValue={activeDay} onValueChange={setActiveDay} className="w-full">
          <TabsList className="w-full grid" style={{ gridTemplateColumns: `repeat(${weekDays.length}, 1fr)` }}>
            {weekDays.map((day) => (
              <TabsTrigger
                key={day.value}
                value={day.value}
                className="text-xs py-1 px-1"
              >
                {day.name.substring(0, 3)}
              </TabsTrigger>
            ))}
          </TabsList>

          {weekDays.map((day) => {
            const dayClasses = getClassesForDay(day.name);

            return (
              <TabsContent key={day.value} value={day.value} className="mt-4">
                <div className="space-y-6">
                  {dayClasses.length > 0 ? (
                    dayClasses.map((classInfo, idx) => (
                      <div key={`mobile-${day.value}-${idx}`} className="flex items-center space-x-4">
                        <div className="text-xs text-right font-medium text-gray-500 w-14 flex flex-col items-center">
                          <div>{classInfo.timeSlot.start}</div>
                          <div className="h-6 border-l border-gray-300 my-1"></div>
                          <div>{classInfo.timeSlot.end}</div>
                        </div>
                        <div className="flex-1">
                          <ClassCard classInfo={classInfo} />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      No classes for this day
                    </div>
                  )}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>

      {/* Desktop view - full grid */}
      <div className="hidden md:block overflow-x-auto">
        <div className="min-w-[960px]">
          {/* Days of the week header */}
          <div className="grid mb-6" style={{
            gridTemplateColumns: `120px repeat(${weekDays.length}, 1fr)`
          }}>
            <div></div> {/* Empty cell for time column */}
            {weekDays.map((day, index) => (
              <div
                key={index}
                className={`flex flex-col items-center py-2 ${day.current ? 'text-blue-500' : ''}`}
              >
                <div className={`text-base font-medium ${day.current ? 'font-bold' : ''}`}>
                  {day.name}
                </div>
                {day.current && <div className="w-3 h-3 rounded-full bg-blue-500 mt-1"></div>}
              </div>
            ))}
          </div>

          {/* Time slots and classes */}
          <div className="grid gap-y-6 gap-x-3" style={{
            gridTemplateColumns: `120px repeat(${weekDays.length}, 1fr)`
          }}>
            {semesterClasses.map((timeSlot, rowIndex) => (
              <React.Fragment key={`row-${rowIndex}`}>
                {/* Time column with vertical line connecting start and end times */}
                <div className="flex items-center justify-center h-[140px]">
                  <div className="flex flex-col items-center">
                    <div className="text-right font-medium text-gray-700">{timeSlot.startTime}</div>
                    <div className="h-8 border-l border-gray-300 my-1"></div>
                    <div className="text-right font-medium text-gray-700">{timeSlot.endTime}</div>
                  </div>
                </div>

                {/* Class cells for each day */}
                {weekDays.map((day, dayIndex) => {
                  const classInfo = getClassForTimeSlotAndDay(timeSlot, day.value);

                  return (
                    <div key={`class-${rowIndex}-${dayIndex}`} className="h-[140px]">
                      {classInfo ? (
                        <ClassCard classInfo={classInfo} />
                      ) : (
                        <div className="h-full"></div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
