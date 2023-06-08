import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n
  .use(initReactI18next) 
  .init({
    resources: {
      en: {
        translation: {
          // English translations go here
          Payed: "Payed",
        },
      },
      fr: {
        translation: {
          // French translations go here
          Payed:"Payé",
          EnCoursDeRattrapage:"À recontacter",
          Validated: "Validé",
          Error:"Annulée",
          ToConfirm:"À confirmer"
        },
      },
      // Other languages can be added here
    },
    lng: "fr",
    fallbackLng: "fr",
    interpolation: {
      escapeValue: false, 
    },
  });

export default i18n;