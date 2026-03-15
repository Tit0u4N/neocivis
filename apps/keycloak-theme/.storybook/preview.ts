import '../src/assets/global.css';
import type { Preview } from 'storybook/preview-api';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'fullscreen',
    options: {
      storySort: [
        'citizen/login.ftl',
        'citizen/register.ftl',
        'citizen/login-reset-password.ftl',
        'citizen/login-update-password.ftl',
        'town-hall/login.ftl',
        'town-hall/register.ftl',
        'town-hall/login-reset-password.ftl',
        'town-hall/login-update-password.ftl',
      ],
    },
  },
};

export default preview;
