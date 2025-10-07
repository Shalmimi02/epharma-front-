// src/services/formatService.ts
import moment from 'moment';

export const FormatService = {
  // Formatage d'une somme d'argent
  moneyFormat(varMoney: number): string {
    if (varMoney) {
      // Arrondir d'abord la valeur à l'entier le plus proche
      const roundedValue = Math.round(varMoney);
      // Formater sans décimales
      return new Intl.NumberFormat('de-DE', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(roundedValue) + ' FCFA';
    }
    return '0 FCFA';
  },

  // Formatage d'une date
  dateFormat(varDate: string | Date): string {
    if (varDate && varDate !== '') {
      const newDate = new Date(varDate);
      if (!isNaN(newDate.getTime())) {
        return moment(newDate).format('DD/MM/YYYY');
      }
    }
    return 'Date invalide';
  },

  //fonction pour empecher les erreurs D'URL lors du filtre
  checkUrlFormat(link: string): string  {
    if (link !== undefined && link.includes('?')) link = link + '&'
    else link = link + '?'
    return link
  },
};
