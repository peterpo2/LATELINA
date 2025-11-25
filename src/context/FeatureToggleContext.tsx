import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

interface FeatureToggleContextValue {
  prescriptionFeaturesEnabled: boolean;
  setPrescriptionFeaturesEnabled: (enabled: boolean) => void;
}

const FeatureToggleContext = createContext<FeatureToggleContextValue | undefined>(undefined);

const STORAGE_KEY = 'featureToggle.prescriptionEnabled';

export const FeatureToggleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prescriptionFeaturesEnabled, setPrescriptionFeaturesEnabledState] = useState<boolean>(() => {
    if (typeof window === 'undefined') {
      return true;
    }

    try {
      const storedValue = window.localStorage.getItem(STORAGE_KEY);
      if (storedValue === null) {
        return true;
      }
      return storedValue === 'true';
    } catch (error) {
      console.warn('Unable to read feature toggle state from storage.', error);
      return true;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, prescriptionFeaturesEnabled ? 'true' : 'false');
    } catch (error) {
      console.warn('Unable to persist feature toggle state.', error);
    }
  }, [prescriptionFeaturesEnabled]);

  const setPrescriptionFeaturesEnabled = useCallback((enabled: boolean) => {
    setPrescriptionFeaturesEnabledState(enabled);
  }, []);

  const value = useMemo(
    () => ({ prescriptionFeaturesEnabled, setPrescriptionFeaturesEnabled }),
    [prescriptionFeaturesEnabled, setPrescriptionFeaturesEnabled]
  );

  return (
    <FeatureToggleContext.Provider value={value}>
      {children}
    </FeatureToggleContext.Provider>
  );
};

export const useFeatureToggles = () => {
  const context = useContext(FeatureToggleContext);
  if (!context) {
    throw new Error('useFeatureToggles must be used within a FeatureToggleProvider');
  }

  return context;
};
