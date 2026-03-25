import type { Meta, StoryObj } from '@storybook/react-vite';
import { createKcPageStory } from '../../KcPageStory';

const { KcPageStory } = createKcPageStory({ pageId: 'register.ftl' });

const meta = {
  title: 'citizen/register.ftl',
  component: KcPageStory,
} satisfies Meta<typeof KcPageStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <KcPageStory kcContext={{ themeName: 'citizen' }} />,
};

export const InEnglish: Story = {
  render: () => (
    <KcPageStory
      kcContext={{
        themeName: 'citizen',
        locale: { currentLanguageTag: 'en', supported: [], rtl: false },
      }}
    />
  ),
};
