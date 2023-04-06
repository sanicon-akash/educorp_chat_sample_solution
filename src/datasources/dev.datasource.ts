import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'dev',
  connector: 'mysql',
  url: '',
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: 'akash@1234',
  database: 'akashdb1'
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class DevDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'dev';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.dev', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
