import { BulbOutlined, DollarOutlined, ReloadOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Flex, Space, Typography } from 'antd';
import layoutStyles from '@/shared/ui/layout.module.css';
import styles from './AiAssistantCard.module.css';

type DescriptionSuggestion = {
  description: string;
  suggestions: string[];
};

type PriceSuggestion = {
  price: number;
  rationale: string;
};

export const AiAssistantCard = ({
  hasDescription,
  descriptionSuggestion,
  priceSuggestion,
  loadingDescription,
  loadingPrice,
  onGenerateDescription,
  onApplyDescription,
  onEstimatePrice,
  onApplyPrice,
}: {
  hasDescription: boolean;
  descriptionSuggestion: DescriptionSuggestion | null;
  priceSuggestion: PriceSuggestion | null;
  loadingDescription: boolean;
  loadingPrice: boolean;
  onGenerateDescription: () => void;
  onApplyDescription: () => void;
  onEstimatePrice: () => void;
  onApplyPrice: () => void;
}) => (
  <Card className={layoutStyles.panelCard} title="AI-инструменты">
    <Flex vertical gap={20}>
      <Space direction="vertical" size={10}>
        <Button
          icon={<BulbOutlined />}
          loading={loadingDescription}
          onClick={onGenerateDescription}>
          {hasDescription ? 'Улучшить описание' : 'Придумать описание'}
        </Button>
        {descriptionSuggestion ? (
          <Alert
            type="info"
            showIcon
            message="Предложение по описанию"
            description={
              <Space direction="vertical" size={8}>
                <Typography.Paragraph className={styles.aiResult} style={{ margin: 0 }}>
                  {descriptionSuggestion.description}
                </Typography.Paragraph>
                {descriptionSuggestion.suggestions.map((suggestion) => (
                  <Typography.Text key={suggestion} type="secondary">
                    • {suggestion}
                  </Typography.Text>
                ))}
                <Button icon={<ReloadOutlined />} onClick={onApplyDescription}>
                  Применить в форму
                </Button>
              </Space>
            }
          />
        ) : null}
      </Space>

      <Space direction="vertical" size={10}>
        <Button icon={<DollarOutlined />} loading={loadingPrice} onClick={onEstimatePrice}>
          Узнать рыночную цену
        </Button>
        {priceSuggestion ? (
          <Alert
            type="success"
            showIcon
            message={`Рекомендованная цена: ${new Intl.NumberFormat('ru-RU').format(
              priceSuggestion.price,
            )} ₽`}
            description={
              <Space direction="vertical" size={8}>
                <Typography.Text>{priceSuggestion.rationale}</Typography.Text>
                <Button onClick={onApplyPrice}>Применить цену</Button>
              </Space>
            }
          />
        ) : null}
      </Space>
    </Flex>
  </Card>
);
