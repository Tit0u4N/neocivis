import { Terminal } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Link } from '@/components/ui/link';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { useColor } from '@/hooks/useColor';

export default function HomeScreen() {
  const green = useColor('green');
  const muted = useColor('muted');
  const { t } = useTranslation();

  return (
    <View
      style={{
        flex: 1,
        gap: 16,
        padding: 24,
        justifyContent: 'center',
      }}
    >
      <Text
        variant="heading"
        style={{
          textAlign: 'center',
        }}
      >
        {t('home.title')}
      </Text>

      <View
        style={{
          marginBottom: 20,
        }}
      >
        <Card>
          <View
            style={{
              gap: 8,
              marginBottom: 16,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Icon name={Terminal} />

            <Text
              variant="body"
              style={{
                fontWeight: '600',
              }}
            >
              {t('home.card.title')}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: muted,
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 8,
              marginBottom: 16,
              minWidth: '100%',
            }}
          >
            <Text
              variant="caption"
              style={{
                color: green,
                fontFamily: 'monospace',
                fontSize: 16,
                textAlign: 'center',
              }}
            >
              npx bna-ui add avatar
            </Text>
          </View>
          <Text
            variant="caption"
            style={{
              textAlign: 'center',
              opacity: 0.7,
            }}
          >
            {t('home.card.description')}
          </Text>
        </Card>
      </View>

      <Link asChild={true} href="/sheet">
        <Button>{t('home.openSheet')}</Button>
      </Link>
    </View>
  );
}
