import type { Meta, StoryObj } from '@storybook/react-vite';
import { createKcPageStory } from '../../KcPageStory';

const { KcPageStory } = createKcPageStory({ pageId: 'login.ftl' });

const meta = {
  title: 'town-hall/login.ftl',
  component: KcPageStory,
} satisfies Meta<typeof KcPageStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <KcPageStory kcContext={{ themeName: 'town-hall' }} />,
};

export const WithError: Story = {
  render: () => (
    <KcPageStory
      kcContext={{
        themeName: 'town-hall',
        messagesPerField: {
          existsError: (...fields: string[]) => fields.includes('username'),
          get: () => 'Identifiant ou mot de passe incorrect.',
          getFirstError: () => 'Identifiant ou mot de passe incorrect.',
          exists: () => true,
          printIfExists: () => '',
        },
      }}
    />
  ),
};

export const InEnglish: Story = {
  render: () => (
    <KcPageStory
      kcContext={{
        themeName: 'town-hall',
        locale: { currentLanguageTag: 'en', supported: [], rtl: false },
      }}
    />
  ),
};
