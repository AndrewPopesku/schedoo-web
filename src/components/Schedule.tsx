"use client";

import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ScheduleGrid from "@/components/ScheduleGrid";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  fetchSemesters,
  getCurrentSemester,
  getActiveSemesterGroups,
  Semester,
  SemesterGroup
} from "@/services/apiService";

export default function Schedule() {
  const [weekType, setWeekType] = useState<"ODD" | "EVEN">("EVEN");
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<Semester | undefined>(undefined);
  const [groups, setGroups] = useState<SemesterGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Fetch semesters on component mount
  useEffect(() => {
    const loadSemesters = async () => {
      setLoading(true);
      try {
        const semestersData = await fetchSemesters();
        setSemesters(semestersData);

        // Set default semester
        const currentSemester = getCurrentSemester(semestersData);
        setSelectedSemester(currentSemester);

        // Set groups for selected semester
        if (currentSemester) {
          const semesterGroups = getActiveSemesterGroups(currentSemester);
          setGroups(semesterGroups);

          // Select first group by default
          if (semesterGroups.length > 0) {
            setSelectedGroup(semesterGroups[0].title);
          }
        }
      } catch (error) {
        console.error("Failed to load semesters:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSemesters();
  }, []);

  // Update groups when semester changes
  const handleSemesterChange = (semesterId: string) => {
    const semester = semesters.find(s => s.id.toString() === semesterId);
    setSelectedSemester(semester);

    if (semester) {
      const semesterGroups = getActiveSemesterGroups(semester);
      setGroups(semesterGroups);

      // Reset selected group
      if (semesterGroups.length > 0) {
        setSelectedGroup(semesterGroups[0].title);
      } else {
        setSelectedGroup("");
      }
    }
  };

  const handleGroupChange = (groupTitle: string) => {
    setSelectedGroup(groupTitle);
  };

  const handleToggle = (value: string) => {
    if (value) {
      setWeekType(value as "ODD" | "EVEN");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-blue-500">Loading schedule data...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-wrap gap-4 mb-6 p-2 items-center justify-center sm:justify-start">
        <div className="order-1 sm:order-none">
          <ToggleGroup
            type="single"
            defaultValue="EVEN"
            value={weekType}
            onValueChange={handleToggle}
            className="rounded-md overflow-hidden border-none"
          >
            <ToggleGroupItem
              value="ODD"
              aria-label="Toggle odd weeks"
              className="rounded-none border-r"
            >
              ODD
            </ToggleGroupItem>
            <ToggleGroupItem
              value="EVEN"
              aria-label="Toggle even weeks"
              className="rounded-none"
            >
              EVEN
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="w-full sm:w-auto min-w-36 order-3 sm:order-none">
          <Select
            value={selectedSemester?.id.toString()}
            onValueChange={handleSemesterChange}
          >
            <SelectTrigger className="border-gray-300">
              <SelectValue placeholder="Select semester" />
            </SelectTrigger>
            <SelectContent>
              {semesters.map((semester) => (
                <SelectItem
                  key={semester.id}
                  value={semester.id.toString()}
                >
                  {semester.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-auto min-w-28 order-2 sm:order-none">
          <Select
            value={selectedGroup}
            onValueChange={handleGroupChange}
            disabled={groups.length === 0}
          >
            <SelectTrigger className="border-gray-300">
              <SelectValue placeholder="Select group" />
            </SelectTrigger>
            <SelectContent>
              {groups.map((group) => (
                <SelectItem
                  key={group.id}
                  value={group.title}
                >
                  {group.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedSemester && (
        <ScheduleGrid
          semesterId={selectedSemester.id}
          groupId={groups.find(g => g.title === selectedGroup)?.id || 0}
          weekType={weekType}
          semesterDays={selectedSemester.semester_days}
          semesterClasses={selectedSemester.semester_classes}
        />
      )}
    </div>
  );
}
