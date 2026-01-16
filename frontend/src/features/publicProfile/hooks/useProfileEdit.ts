import { useState } from "react";

export const useProfileEdit = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const startEditing = () => setIsEditing(true);
  const cancelEditing = () => setIsEditing(false);

  const saveChanges = async (saveProfile: () => Promise<void>) => {
    setIsSaving(true);
    try {
      await saveProfile();
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isEditing,
    isSaving,
    startEditing,
    cancelEditing,
    saveChanges,
  };
};
