import axios, { AxiosResponse } from 'axios';
import { getConnection } from 'typeorm';
import { User } from '../entity/User';
import { DataParser, Maybe } from '../types';
import { isDefined } from '../utils/type-helpers';
/*eslint no-constant-condition: ["error", { "checkLoops": false }]*/

const baseURL = 'https://reqres.in/api';

interface PagedResponse<T> {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  data?: Maybe<T>[];
}

interface ReqResUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string;
}

class ReqResService implements DataParser {
  private axios = axios.create({ baseURL });

  async parseData(): Promise<void> {
    console.log('Starting load data from reqres.net');
    await this.getDataAndSave();
    console.log('Data successfully loaded from reqres.net');
  }
  private getDataAndSave = async () => {
    let page = 1;
    while (true) {
      const { data }: AxiosResponse<PagedResponse<ReqResUser>> =
        await this.axios.get('/users', {
          params: {
            page,
          },
        });

      const users =
        data.data?.filter(isDefined).map((x) => this.userConverter(x)) || [];
      await getConnection().getRepository(User).save(users);

      if (page < data.total_pages) {
        page++;
      } else {
        break;
      }
    }
  };

  private userConverter = (user: ReqResUser): User => {
    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      avatar: user.avatar,
    };
  };
}

export default ReqResService;
