import './styles/global.css';

import { GameApp } from './app/GameApp.ts';

const root = document.querySelector<HTMLDivElement>('#app');

if (!root) {
  throw new Error('Root element #app was not found.');
}

const app = new GameApp(root);
app.start();