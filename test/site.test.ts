import puppeteer from 'puppeteer';
import { parseTableData } from '../src/utils/puppeteer-helpers';

test('Table parser', async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--disable-notifications'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1900, height: 1200 });
  await page.goto(
    'https://uh.edu/infotech/services/web-services/cms/cms-how-tos/work-with-html-tables/#tablestripedstyle',
    {
      waitUntil: 'load',
    },
  );

  const data = await parseTableData(
    page,
    'table.table-responsive',
    TestColumns,
  );

  await browser.close();

  expect(data).toEqual(expect.arrayContaining(expectedData));
  expect(expectedData).toEqual(expect.arrayContaining(data));

}, 20000);

enum TestColumns {
  'Col 1 Header',
  'Col 2 Header',
  'Col 3 Header',
  'Col 5 Header',
}

const expectedData = [
  {
    'Col 1 Header': 'Row 1 - Column 1',
    'Col 2 Header': 'Row 1 - Column 2',
    'Col 3 Header': 'Row 1 - Column 3',
    'Col 5 Header': 'Row 1 - Column 5',
  },
  {
    'Col 1 Header': 'Row 2 - Column 1',
    'Col 2 Header': 'Row 2 - Column 2',
    'Col 3 Header': 'Row 2 - Column 3',
    'Col 5 Header': 'Row 2 - Column 5',
  },
  {
    'Col 1 Header': 'Row 3 - Column 1',
    'Col 2 Header': 'Row 3 - Column 2',
    'Col 3 Header': 'Row 3 - Column 3',
    'Col 5 Header': 'Row 3 - Column 5',
  },
  {
    'Col 1 Header': 'Row 4 - Column 1',
    'Col 2 Header': 'Row 4 - Column 2',
    'Col 3 Header': 'Row 4 - Column 3',
    'Col 5 Header': 'Row 4 - Column 5',
  },
];
