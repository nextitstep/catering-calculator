import { motion } from 'framer-motion';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Menu as FluentMenu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Text,
  Title3,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import {
  ArrowDownload24Regular,
  Copy24Regular,
  Delete24Regular,
  Edit24Regular,
  MoreHorizontal24Regular,
  Star24Filled,
  Star24Regular,
} from '@fluentui/react-icons';
import type { Menu } from '@/types';
import { formatMoney } from '@/shared/lib/currency';

const useStyles = makeStyles({
  card: {
    padding: '16px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    height: '100%',
  },
  headerRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '8px',
  },
  meta: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    color: tokens.colorNeutralForeground3,
  },
  description: {
    color: tokens.colorNeutralForeground3,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
});

interface MenuCardProps {
  menu: Menu;
  onOpen: () => void;
  onToggleFavorite: () => void;
  onRename: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onExport: () => void;
}

export function MenuCard({
  menu,
  onOpen,
  onToggleFavorite,
  onRename,
  onDuplicate,
  onDelete,
  onExport,
}: MenuCardProps) {
  const styles = useStyles();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      style={{ height: '100%' }}
    >
      <Card className={styles.card} onClick={onOpen}>
        <CardHeader
          header={
            <div className={styles.headerRow}>
              <Title3>{menu.name}</Title3>
              <div className={styles.actions} onClick={(e) => e.stopPropagation()}>
                <Button
                  appearance="subtle"
                  size="small"
                  shape="circular"
                  icon={menu.favorite ? <Star24Filled /> : <Star24Regular />}
                  onClick={onToggleFavorite}
                  aria-label="Toggle favorite"
                />
                <FluentMenu>
                  <MenuTrigger disableButtonEnhancement>
                    <Button
                      appearance="subtle"
                      size="small"
                      shape="circular"
                      icon={<MoreHorizontal24Regular />}
                      aria-label="More actions"
                    />
                  </MenuTrigger>
                  <MenuPopover>
                    <MenuList>
                      <MenuItem icon={<Edit24Regular />} onClick={onRename}>
                        Rename
                      </MenuItem>
                      <MenuItem icon={<Copy24Regular />} onClick={onDuplicate}>
                        Duplicate
                      </MenuItem>
                      <MenuItem icon={<ArrowDownload24Regular />} onClick={onExport}>
                        Export JSON
                      </MenuItem>
                      <MenuItem icon={<Delete24Regular />} onClick={onDelete}>
                        Delete
                      </MenuItem>
                    </MenuList>
                  </MenuPopover>
                </FluentMenu>
              </div>
            </div>
          }
        />
        {menu.description ? <Text className={styles.description}>{menu.description}</Text> : null}
        <div className={styles.meta}>
          <Badge appearance="outline" color="informative">
            {menu.portions} portions
          </Badge>
          <Badge appearance="outline">{menu.ingredients.length} ingredients</Badge>
          <Badge appearance="outline" color="brand">
            {formatMoney(menu.preferredSellPrice)}
          </Badge>
        </div>
      </Card>
    </motion.div>
  );
}
