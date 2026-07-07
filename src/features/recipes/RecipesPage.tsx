import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import {
  Button,
  Input,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Title2,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import {
  Add24Filled,
  ArrowDownload24Regular,
  ArrowUpload24Regular,
  MoreHorizontal24Regular,
  Search24Regular,
} from '@fluentui/react-icons';
import { useRecipesStore } from '@/features/recipes/RecipesContext';
import { RecipeCard } from '@/features/recipes/components/RecipeCard';
import { TextPromptDialog } from '@/shared/components/TextPromptDialog';
import { useAppToaster } from '@/shared/components/ToasterProvider';
import type { Recipe } from '@/types';

const useStyles = makeStyles({
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    marginBottom: '16px',
    flexWrap: 'wrap',
  },
  search: {
    flex: 1,
    minWidth: '200px',
    maxWidth: '360px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '12px',
    '@media (min-width: 640px)': {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
    '@media (min-width: 1100px)': {
      gridTemplateColumns: 'repeat(3, 1fr)',
    },
  },
  fab: {
    position: 'fixed',
    right: '20px',
    bottom: '84px',
    zIndex: 90,
    boxShadow: tokens.shadow16,
    '@media (min-width: 720px)': {
      display: 'none',
    },
  },
  desktopAdd: {
    display: 'none',
    '@media (min-width: 720px)': {
      display: 'inline-flex',
    },
  },
  empty: {
    textAlign: 'center',
    color: tokens.colorNeutralForeground3,
    padding: '48px 0',
  },
});

export function RecipesPage() {
  const styles = useStyles();
  const navigate = useNavigate();
  const { notify } = useAppToaster();
  const {
    recipes,
    activeRecipeId,
    setActiveRecipeId,
    createRecipe,
    renameRecipe,
    duplicateRecipe,
    deleteRecipe,
    toggleFavorite,
    importRecipe,
  } = useRecipesStore();

  const [search, setSearch] = useState('');
  const [renameTarget, setRenameTarget] = useState<Recipe | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return recipes;
    return recipes.filter(
      (r) => r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)
    );
  }, [recipes, search]);

  function handleOpen(recipe: Recipe) {
    setActiveRecipeId(recipe.id);
    navigate('/ingredients');
  }

  function handleExport(recipe: Recipe) {
    const blob = new Blob([JSON.stringify(recipe, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${recipe.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as Recipe;
        if (!parsed.name || !Array.isArray(parsed.ingredients)) {
          throw new Error('Invalid recipe file');
        }
        importRecipe(parsed);
        notify({ title: `Imported "${parsed.name}"`, intent: 'success' });
      } catch {
        notify({
          title: 'Import failed',
          body: 'That file is not a valid recipe JSON.',
          intent: 'error',
        });
      }
    };
    reader.readAsText(file);
  }

  return (
    <div>
      <div className={styles.header}>
        <Title2>Recipes</Title2>
        <Input
          className={styles.search}
          contentBefore={<Search24Regular />}
          placeholder="Search recipes..."
          value={search}
          onChange={(_, data) => setSearch(data.value)}
        />
        <Button
          className={styles.desktopAdd}
          appearance="primary"
          icon={<Add24Filled />}
          onClick={() => setCreateOpen(true)}
        >
          New Recipe
        </Button>
        <Menu>
          <MenuTrigger disableButtonEnhancement>
            <Button appearance="subtle" icon={<MoreHorizontal24Regular />} aria-label="More" />
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              <MenuItem
                icon={<ArrowUpload24Regular />}
                onClick={() => fileInputRef.current?.click()}
              >
                Import JSON
              </MenuItem>
              <MenuItem
                icon={<ArrowDownload24Regular />}
                disabled={!activeRecipeId}
                onClick={() => {
                  const active = recipes.find((r) => r.id === activeRecipeId);
                  if (active) handleExport(active);
                }}
              >
                Export active recipe JSON
              </MenuItem>
            </MenuList>
          </MenuPopover>
        </Menu>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImportFile(file);
            e.target.value = '';
          }}
        />
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>No recipes match your search.</div>
      ) : (
        <div className={styles.grid}>
          <AnimatePresence>
            {filtered.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                isActive={recipe.id === activeRecipeId}
                onOpen={() => handleOpen(recipe)}
                onToggleFavorite={() => toggleFavorite(recipe.id)}
                onRename={() => setRenameTarget(recipe)}
                onDuplicate={() => duplicateRecipe(recipe.id)}
                onDelete={() => deleteRecipe(recipe.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <Button
        className={styles.fab}
        appearance="primary"
        shape="circular"
        size="large"
        icon={<Add24Filled />}
        onClick={() => setCreateOpen(true)}
        aria-label="New Recipe"
      />

      <TextPromptDialog
        open={createOpen}
        title="New Recipe"
        label="Recipe name"
        confirmText="Create"
        onCancel={() => setCreateOpen(false)}
        onConfirm={(name) => {
          createRecipe(name);
          setCreateOpen(false);
          navigate('/ingredients');
        }}
      />

      <TextPromptDialog
        open={renameTarget !== null}
        title="Rename Recipe"
        label="Recipe name"
        initialValue={renameTarget?.name}
        onCancel={() => setRenameTarget(null)}
        onConfirm={(name) => {
          if (renameTarget) renameRecipe(renameTarget.id, name);
          setRenameTarget(null);
        }}
      />
    </div>
  );
}
