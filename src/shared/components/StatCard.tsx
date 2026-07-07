import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Card, Text, tokens, makeStyles, mergeClasses } from '@fluentui/react-components';
import { AnimatedNumber } from '@/shared/components/AnimatedNumber';

export type TrendTone = 'positive' | 'negative' | 'neutral';

const useStyles = makeStyles({
  card: {
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    height: '100%',
    minWidth: 0,
  },
  topRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: tokens.borderRadiusCircular,
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground1,
    flexShrink: 0,
  },
  value: {
    fontSize: tokens.fontSizeHero800,
    fontWeight: tokens.fontWeightSemibold,
    lineHeight: tokens.lineHeightHero800,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  label: {
    color: tokens.colorNeutralForeground3,
  },
  positive: { color: tokens.colorPaletteGreenForeground1 },
  negative: { color: tokens.colorPaletteRedForeground1 },
  neutral: { color: tokens.colorNeutralForeground3 },
});

interface StatCardProps {
  icon: ReactNode;
  value: number;
  label: string;
  format?: (v: number) => string;
  trend?: TrendTone;
  delay?: number;
}

export function StatCard({ icon, value, label, format, trend = 'neutral', delay = 0 }: StatCardProps) {
  const styles = useStyles();
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: 'easeOut' }}
      style={{ height: '100%' }}
    >
      <Card className={styles.card}>
        <div className={styles.topRow}>
          <div className={styles.iconWrap}>{icon}</div>
        </div>
        <Text className={mergeClasses(styles.value, styles[trend])}>
          <AnimatedNumber value={value} format={format} />
        </Text>
        <Text size={200} className={styles.label}>
          {label}
        </Text>
      </Card>
    </motion.div>
  );
}
