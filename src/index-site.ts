import 'reflect-metadata';
import { createConnection } from 'typeorm';
import AffluService from './services/afflu-service';

(async () => {
  try {
    await createConnection();
    const affluService = new AffluService();
    await affluService.parseData();
  } catch (error) {
    console.log('Error occured', error);
  } finally {
    process.exit();
  }
})();
