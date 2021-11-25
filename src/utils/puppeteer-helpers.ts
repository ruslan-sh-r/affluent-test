import { Page } from 'puppeteer';

/**
 * Find table by id on the page and convert rows into objects array.
 * @param page
 * @param tableId
 * @param mapping mapping between table column names and corresponding object properties.
 * @returns
 */
export const parseTableData = async <T extends Record<string, keyof T>>(
  page: Page,
  tableId: string,
  mapping: Record<string, keyof T>,
): Promise<T[]> => {
  const columnIdxMapping: Record<keyof T, number> = (await page.$$eval(
    `${tableId} thead th`,
    (elements: any, colMapping: any) => {
      return elements.reduce(
        (idxMapping: Record<keyof T, number>, x: any, i: number) => {
          const prop = colMapping[x.innerText] as keyof T;
          if (prop) {
            idxMapping[prop] = i;
          }
          return idxMapping;
        },
        {} as Record<keyof T, number>,
      );
    },
    mapping as any,
  )) as any;

  const resObjects: T[] = await Promise.all(
    (
      await page.$$(`${tableId} tbody tr`)
    ).map(async (row: any) => {
      const columns: string[] = await row.$$eval('td', (columnElements: any) =>
        columnElements.map((x: any) => x.innerText),
      );

      const resObj = <T>{};
      for (const key in columnIdxMapping) {
        const idx: number = columnIdxMapping[key];
        resObj[key] = <any>columns[idx];
      }

      return resObj;
    }),
  );

  return resObjects;
};
