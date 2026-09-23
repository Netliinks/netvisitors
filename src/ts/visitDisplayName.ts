// @ts-nocheck

/** El RUC se registra sin nombres personales; en ese caso se muestra la razón social validada. */
export const getVisitDisplayName = (visit: any): string => {
  const personalName = [visit?.firstName, visit?.firstLastName, visit?.secondLastName]
    .map((value) => String(value ?? '').trim())
    .filter(Boolean)
    .join(' ');

  return personalName || String(visit?.legalName ?? '').trim();
};
