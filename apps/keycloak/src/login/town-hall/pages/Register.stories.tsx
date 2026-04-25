import type { Meta, StoryObj } from '@storybook/react-vite';
import { createKcPageStory } from '../../KcPageStory';

const { KcPageStory } = createKcPageStory({ pageId: 'register.ftl' });

const meta = {
  title: 'town-hall/register.ftl',
  component: KcPageStory,
} satisfies Meta<typeof KcPageStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <KcPageStory kcContext={{ themeName: 'town-hall' }} />,
};
