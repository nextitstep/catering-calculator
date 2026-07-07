import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import {
  Button,
  Input,
  Menu as FluentMenu,
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
  ArrowUpload24Regular,
  MoreHorizontal24Regular,
  Search24Regular,
} from '@fluentui/react-icons';
import { useMenusStore } from '@/features/menus/MenusContext';
import { MenuCard } from '@/features/menus/components/MenuCard';
import { TextPromptDialog } from '@/shared/components/TextPromptDialog';
import { useAppToaster } from '@/shared/components/ToasterProvider';
import type { Menu } from '@/types';

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
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '12px',
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

export function MenusPage() {
  const styles = useStyles();
  const navigate = useNavigate();
  const { notify } = useAppToaster();
  const { menus, createMenu, renameMenu, duplicateMenu, deleteMenu, toggleFavorite, importMenu } =
    useMenusStore();

  const [search, setSearch] = useState('');
  const [renameTarget, setRenameTarget] = useState<Menu | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return menus;
    return menus.filter(
      (m) => m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q)
    );
  }, [menus, search]);

  function handleOpen(menu: Menu) {
    navigate(`/menus/${menu.id}`);
  }

  function handleExport(menu: Menu) {
    const blob = new Blob([JSON.stringify(menu, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${menu.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as Menu;
        if (!parsed.name || !Array.isArray(parsed.ingredients)) {
          throw new Error('Invalid menu file');
        }
        importMenu(parsed);
        notify({ title: `Imported "${parsed.name}"`, intent: 'success' });
      } catch {
        notify({
          title: 'Import failed',
          body: 'That file is not a valid menu JSON.',
          intent: 'error',
        });
      }
    };
    reader.readAsText(file);
  }

  return (
    <div>
      <div className={styles.header}>
        <Title2>Menus</Title2>
        <Input
          className={styles.search}
          contentBefore={<Search24Regular />}
          placeholder="Search menus..."
          value={search}
          onChange={(_, data) => setSearch(data.value)}
        />
        <Button
          className={styles.desktopAdd}
          appearance="primary"
          icon={<Add24Filled />}
          onClick={() => setCreateOpen(true)}
        >
          New Menu
        </Button>
        <FluentMenu>
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
            </MenuList>
          </MenuPopover>
        </FluentMenu>
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
        <div className={styles.empty}>No menus match your search.</div>
      ) : (
        <div className={styles.grid}>
          <AnimatePresence>
            {filtered.map((menu) => (
              <MenuCard
                key={menu.id}
                menu={menu}
                onOpen={() => handleOpen(menu)}
                onToggleFavorite={() => toggleFavorite(menu.id)}
                onRename={() => setRenameTarget(menu)}
                onDuplicate={() => duplicateMenu(menu.id)}
                onDelete={() => deleteMenu(menu.id)}
                onExport={() => handleExport(menu)}
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
        aria-label="New Menu"
      />

      <TextPromptDialog
        open={createOpen}
        title="New Menu"
        label="Menu name"
        confirmText="Create"
        onCancel={() => setCreateOpen(false)}
        onConfirm={(name) => {
          const id = createMenu(name);
          setCreateOpen(false);
          navigate(`/menus/${id}`);
        }}
      />

      <TextPromptDialog
        open={renameTarget !== null}
        title="Rename Menu"
        label="Menu name"
        initialValue={renameTarget?.name}
        onCancel={() => setRenameTarget(null)}
        onConfirm={(name) => {
          if (renameTarget) renameMenu(renameTarget.id, name);
          setRenameTarget(null);
        }}
      />
    </div>
  );
}
