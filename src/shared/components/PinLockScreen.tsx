import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button, Card, Field, Input, Text, Title2, makeStyles, tokens } from '@fluentui/react-components';
import { LockClosed24Filled } from '@fluentui/react-icons';

const useStyles = makeStyles({
  root: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    backgroundColor: tokens.colorNeutralBackground3,
  },
  card: {
    padding: '32px',
    maxWidth: '360px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    textAlign: 'center',
  },
  icon: {
    width: '56px',
    height: '56px',
    borderRadius: tokens.borderRadiusCircular,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground1,
    fontSize: '28px',
  },
  form: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  error: {
    color: tokens.colorPaletteRedForeground1,
  },
});

export function PinLockScreen({ onUnlock }: { onUnlock: (pin: string) => boolean }) {
  const styles = useStyles();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = onUnlock(pin.trim());
    if (!ok) {
      setError(true);
      setPin('');
      setShakeKey((k) => k + 1);
    }
  }

  return (
    <div className={styles.root}>
      <motion.div
        key={shakeKey}
        animate={error ? { x: [0, -8, 8, -8, 8, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        <Card className={styles.card}>
          <div className={styles.icon}>
            <LockClosed24Filled />
          </div>
          <Title2>Cost Calculator</Title2>
          <Text>Enter the PIN to continue</Text>
          <form className={styles.form} onSubmit={handleSubmit}>
            <Field validationState={error ? 'error' : 'none'} validationMessage={error ? 'Incorrect PIN' : undefined}>
              <Input
                type="password"
                inputMode="numeric"
                autoFocus
                size="large"
                value={pin}
                onChange={(_, data) => {
                  setPin(data.value);
                  setError(false);
                }}
              />
            </Field>
            <Button type="submit" appearance="primary" size="large" disabled={!pin.trim()}>
              Unlock
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
