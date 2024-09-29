import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module'; // 导入 AppModule

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
