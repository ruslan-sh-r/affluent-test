import { DataParser } from '../types';
import puppeteer from 'puppeteer';
import { DateInfo } from '../entity/DateInfo';
import { parseTableData } from '../utils/puppeteer-helpers';
import ProgressBar from 'progress';
import { isDefined } from '../utils/type-helpers';

const username = 'developertest@affluent.io';
const password = 'Wn4F6g*N88EPiOyW';

class AffluService implements DataParser {
  async parseData(): Promise<void> {
    const bar = new ProgressBar(
      'Getting data from afflu.net [:bar] :percent ',
      {
        total: 10,
      },
    );

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--disable-notifications'],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1900, height: 1200 });
    bar.tick();
    await page.goto('https://develop.pub.afflu.net', {
      waitUntil: 'load',
    });
    bar.tick();
    await page.type('[name=username]', username);
    await page.type('[name=password]', password);
    // go to dates info page
    await Promise.all([page.click('[type=submit]'), page.waitForNavigation()]);
    bar.tick();
    await page.goto('https://develop.pub.afflu.net/list?type=dates', {
      waitUntil: 'load',
    });
    bar.tick();
    // set date range
    await page.click('#datepicker');
    const startInput = await page.$('[name=daterangepicker_start]');
    if (!startInput)
      throw new Error(`Can't find daterangepicker_start element`);
    await startInput.click({ clickCount: 3 });
    await startInput.type('10/01/2020');
    const endInput = await page.$('[name=daterangepicker_end]');
    if (!endInput) throw new Error(`Can't find daterangepicker_end element`);
    await endInput.click({ clickCount: 3 });
    await endInput.type('10/30/2020');
    await page.click('.daterangepicker .applyBtn');
    bar.tick();
    await page.waitForNetworkIdle();
    bar.tick();

    // fetch all table data
    await page.click('#DataTables_Table_0_length button');
    await page.click(
      '#DataTables_Table_0_length .dropdown-menu li:last-child a',
    );
    await page.waitForNetworkIdle();
    bar.tick();

    // parse table data
    const data: Record<keyof typeof DateInfoColumns, string>[] =
      await parseTableData(page, '#DataTables_Table_0', DateInfoColumns);
    bar.tick();

    await browser.close();
    bar.tick();

    // save data to db
    const dateInfos: DateInfo[] = data.map(dateInfoConverter).filter(isDefined);
    console.log(dateInfos); // remove
    //await getConnection().getRepository(DateInfo).save(dateInfos);
    bar.tick();

    console.log('Data successfully loaded from afflu.net');
  }
}

enum DateInfoColumns {
  Date,
  'Commissions - Total',
  'Sales - Net',
  'Leads - Net',
  Clicks,
  EPC,
  Impressions,
  CR,
}

const dateInfoConverter = (
  info: Record<keyof typeof DateInfoColumns, string>,
): DateInfo | undefined => {
  try {
    return {
      date: new Date(info.Date),
      commisions: info['Commissions - Total'],
      sales: +info['Sales - Net'],
      leads: +info['Leads - Net'],
      clics: +info.Clicks,
      epc: info.EPC,
      impressions: +info.Impressions,
      cr: info.CR,
    };
  } catch (error) {
    console.log(`Can't convert date info: ${info}`, error);
    return undefined;
  }
};

export default AffluService;
