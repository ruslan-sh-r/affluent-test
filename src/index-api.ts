import 'reflect-metadata';
import { createConnection } from 'typeorm';
import ReqResService from './services/req-res-service';

(async () => {
  try {
    await createConnection();
    const reqResService = new ReqResService();
    await reqResService.parseData();
  } catch (error) {
    console.log('Error occured', error);
  } finally {
    process.exit();
  }
})();
