"use client";

import { UserCircle } from "lucide-react";
import type { CharacterFormData } from "@/lib/types";

interface CharacterPreviewProps {
  formData: CharacterFormData;
}

export default function CharacterPreview({ formData }: CharacterPreviewProps) {
  return (
    <div className="mt-8 space-y-4">
      <div className="text-sm font-medium text-foreground">Preview</div>
      <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden relative border border-border">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
          {formData.avatarPreview ? (
            <div className="w-16 h-16 rounded-full overflow-hidden mb-2">
              <img
                src={formData.avatarPreview || "/placeholder.svg"}
                alt="Character Avatar"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-2">
              <UserCircle className="h-8 w-8 text-primary-foreground" />
            </div>
          )}
          <div className="font-medium text-sm text-foreground">
            {formData.nickname || "Your Character"}
          </div>
          <div className="text-sm text-muted-foreground mt-1 line-clamp-3">
            {formData.introduction || "Add an introduction to see it here"}
          </div>
        </div>
      </div>
    </div>
  );
}
