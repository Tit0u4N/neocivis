import type { Meta, StoryObj } from '@storybook/react-vite';
import { ExecuteActionsEmail } from './ExecuteActionsEmail';

const meta = {
  title: 'email/executeActions',
  component: ExecuteActionsEmail,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div style={{ backgroundColor: '#f1f5f9', minHeight: '100vh', padding: '32px 16px', boxSizing: 'border-box' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ExecuteActionsEmail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CitizenApp: Story = {
  name: 'Citizen App (neocivis-citizen-app)',
  args: {
    clientId: 'neocivis-citizen-app',
    firstName: 'Marie',
    linkExpiration: '5 minutes',
    link: 'https://auth.neocivis.cloud/realms/neocivis-dev/login-actions/action-token?...',
    year: 2025,
  },
};

export const TownHallApp: Story = {
  name: 'Town Hall App (neocivis-townhall-app)',
  args: {
    clientId: 'neocivis-townhall-app',
    firstName: 'Jean-Pierre',
    linkExpiration: '5 minutes',
    link: 'https://auth.neocivis.cloud/realms/neocivis-dev/login-actions/action-token?...',
    year: 2025,
  },
};
