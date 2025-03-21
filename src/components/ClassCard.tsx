"use client";

import { Card } from "@/components/ui/card";
import { ClassInfo } from "@/lib/types";

export default function ClassCard({ classInfo }: { classInfo: ClassInfo }) {
  // Get the appropriate tag class based on class type
  const getTagClass = (type: string) => {
    switch (type) {
      case "lecture":
        return "lecture-tag";
      case "laboratory":
        return "laboratory-tag";
      case "practical":
        return "practical-tag";
      case "exam":
        return "exam-tag";
      default:
        return "lecture-tag";
    }
  };

  return (
    <Card className="h-full min-h-[9rem] p-4 flex flex-col hover:shadow-md transition-shadow border border-gray-200">
      {/* Subject - using our custom line clamping and word wrapping */}
      <div className="text-sm md:text-base font-medium mb-3 text-gray-800 schedoo-line-clamp-2 schedoo-wrap-anywhere">
        {classInfo.subject}
      </div>

      {/* Professor - using our custom truncation */}
      <div className="text-xs md:text-sm text-gray-600 italic mb-3 schedoo-truncate">
        {classInfo.professor}
      </div>

      <div className="mt-auto flex flex-col">
        <div className="flex flex-wrap gap-2 mb-2">
          {/* Tag for class type */}
          <span className={`inline-block px-2 py-0.5 text-xs rounded-sm ${getTagClass(classInfo.type)}`}>
            #{classInfo.type}
          </span>

          {/* Room information */}
          {classInfo.room && (
            <span className="text-xs text-gray-500 schedoo-truncate">
              {classInfo.room}
            </span>
          )}
        </div>

        {/* Online indicator */}
        {classInfo.online && (
          <div className="text-xs text-blue-600">
            Проводиться онлайн
          </div>
        )}
      </div>
    </Card>
  );
}
