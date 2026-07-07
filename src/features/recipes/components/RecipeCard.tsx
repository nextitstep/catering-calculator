import { motion } from 'framer-motion';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Menu,
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
  Copy24Regular,
  Delete24Regular,
  Edit24Regular,
  MoreHorizontal24Regular,
  Star24Filled,
  Star24Regular,
} from '@fluentui/react-icons';
import type { Recipe } from '@/types';
import { computeRecipeMetrics } from '@/features/costing/calculations';
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

interface RecipeCardProps {
  recipe: Recipe;
  isActive: boolean;
  onOpen: () => void;
  onToggleFavorite: () => void;
  onRename: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function RecipeCard({
  recipe,
  isActive,
  onOpen,
  onToggleFavorite,
  onRename,
  onDuplicate,
  onDelete,
}: RecipeCardProps) {
  const styles = useStyles();
  const metrics = computeRecipeMetrics(recipe);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      style={{ height: '100%' }}
    >
      <Card
        className={styles.card}
        style={
          isActive
            ? { borderColor: tokens.colorBrandStroke1, borderWidth: '2px' }
            : undefined
        }
        onClick={onOpen}
      >
        <CardHeader
          header={
            <div className={styles.headerRow}>
              <Title3>{recipe.name}</Title3>
              <div className={styles.actions} onClick={(e) => e.stopPropagation()}>
                <Button
                  appearance="subtle"
                  size="small"
                  shape="circular"
                  icon={recipe.favorite ? <Star24Filled /> : <Star24Regular />}
                  onClick={onToggleFavorite}
                  aria-label="Toggle favorite"
                />
                <Menu>
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
                      <MenuItem icon={<Delete24Regular />} onClick={onDelete}>
                        Delete
                      </MenuItem>
                    </MenuList>
                  </MenuPopover>
                </Menu>
              </div>
            </div>
          }
        />
        {recipe.description ? (
          <Text className={styles.description}>{recipe.description}</Text>
        ) : null}
        <div className={styles.meta}>
          <Badge appearance="outline" color="informative">
            {recipe.portions} portions
          </Badge>
          <Badge appearance="outline" color={metrics.margin >= 0 ? 'success' : 'danger'}>
            {metrics.margin.toFixed(1)}% margin
          </Badge>
          <Badge appearance="outline">{formatMoney(metrics.costPerPortion)} / portion</Badge>
        </div>
      </Card>
    </motion.div>
  );
}
