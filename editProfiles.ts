import { EditProfile } from '../types';

const STORAGE_KEY = 'edit_profiles';

export const loadProfiles = (): EditProfile[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load edit profiles:', error);
    return [];
  }
};

export const saveProfile = (profile: EditProfile): void => {
  try {
    const profiles = loadProfiles();
    const existingIndex = profiles.findIndex(p => p.id === profile.id);
    
    if (existingIndex >= 0) {
      profiles[existingIndex] = profile;
    } else {
      profiles.push(profile);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  } catch (error) {
    console.error('Failed to save edit profile:', error);
    throw new Error('Failed to save profile');
  }
};

export const deleteProfile = (id: string): void => {
  try {
    const profiles = loadProfiles().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  } catch (error) {
    console.error('Failed to delete edit profile:', error);
    throw new Error('Failed to delete profile');
  }
};