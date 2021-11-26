import { Page } from 'puppeteer';

/**
 * Find table by id on the page and convert rows into objects array.
 * @param page
 * @param tableId
 * @param mapping enum with desired column names. If column doesn't have a name then use template 'column{index}' - where index is a column number starting from 0.
 * @returns
 */
export const parseTableData = async <
  T extends keyof TEnum,
  TEnum extends Record<T, string | number>,
>(
  page: Page,
  tableId: string,
  mapping: TEnum,
): Promise<Record<T, string>[]> => {
  const columnIdxMapping: Record<T, number> = await page.$$eval(
    `${tableId} thead th`,
    (elements: any, colMapping: any) => {
      return elements.reduce(
        (idxMapping: Record<T, number>, x: any, i: number) => {
          const columnName = x.innerText || `$column${i}`;
          if (colMapping[columnName] != undefined) {
            idxMapping[columnName as T] = i;
          }
          return idxMapping;
        },
        {},
      );
    },
    mapping as any,
  );

  const resObjects = await Promise.all(
    (
      await page.$$(`${tableId} tbody tr`)
    ).map(async (row: any) => {
      const columnValues: string[] = await row.$$eval(
        'td',
        (columnElements: any) => columnElements.map((x: any) => x.innerText),
      );

      const resObj = <Record<T, string>>{};
      for (const key in columnIdxMapping) {
        const idx: number = columnIdxMapping[key];
        resObj[key] = columnValues[idx];
      }

      return resObj;
    }),
  );

  return resObjects;
};
