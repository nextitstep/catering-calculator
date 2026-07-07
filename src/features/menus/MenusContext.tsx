import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Menu, MenuIngredient, Unit } from '@/types';
import { useLocalStorageState } from '@/shared/hooks/useLocalStorageState';
import { createSeedMenu } from '@/features/menus/seedData';
import { migrateLegacyRecipesIfNeeded } from '@/features/menus/migrateLegacyRecipes';
import { useCloudSync } from '@/features/sync/useCloudSync';
import { logAnalyticsEvent } from '@/shared/lib/firebase';

const STORAGE_KEY = 'catering-calc/menus';

function blankMenu(name = 'New Menu'): Menu {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name,
    description: '',
    portions: 10,
    ingredients: [],
    preferredSellPrice: 0,
    favorite: false,
    createdAt: now,
    updatedAt: now,
    lastOpenedAt: now,
  };
}

function blankIngredient(): MenuIngredient {
  return {
    id: crypto.randomUUID(),
    name: '',
    quantity: 1,
    unit: 'kg' as Unit,
  };
}

interface DeletedMenuState {
  menu: Menu;
  index: number;
}

interface MenusContextValue {
  menus: Menu[];
  recentMenus: Menu[];
  favoriteMenus: Menu[];
  createMenu: (name?: string) => string;
  renameMenu: (id: string, name: string) => void;
  duplicateMenu: (id: string) => string;
  deleteMenu: (id: string) => void;
  undoDelete: () => void;
  pendingDeletion: DeletedMenuState | null;
  dismissUndo: () => void;
  toggleFavorite: (id: string) => void;
  updateMenu: (id: string, updater: (menu: Menu) => Menu) => void;
  addIngredient: (menuId: string) => void;
  updateIngredient: (
    menuId: string,
    ingredientId: string,
    partial: Partial<MenuIngredient>
  ) => void;
  removeIngredient: (menuId: string, ingredientId: string) => void;
  updatePortions: (menuId: string, portions: number) => void;
  updatePreferredSellPrice: (menuId: string, price: number) => void;
  importMenu: (menu: Menu) => void;
  markOpened: (id: string) => void;
  cloudSync: ReturnType<typeof useCloudSync>;
}

const MenusContext = createContext<MenusContextValue | null>(null);

export function MenusProvider({ children }: { children: ReactNode }) {
  const [menus, setMenus] = useLocalStorageState<Menu[]>(
    STORAGE_KEY,
    () => migrateLegacyRecipesIfNeeded() ?? [createSeedMenu()]
  );
  const [pendingDeletion, setPendingDeletion] = useState<DeletedMenuState | null>(null);
  const cloudSync = useCloudSync(menus, setMenus);

  // Backfill fields added after some users already had data in localStorage.
  useEffect(() => {
    setMenus((prev) => {
      let changed = false;
      const next = prev.map((m) => {
        if (m.preferredSellPrice == null) {
          changed = true;
          return { ...m, preferredSellPrice: 0 };
        }
        return m;
      });
      return changed ? next : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const touch = useCallback((menu: Menu): Menu => {
    return { ...menu, updatedAt: new Date().toISOString() };
  }, []);

  const markOpened = useCallback(
    (id: string) => {
      setMenus((prev) =>
        prev.map((m) => (m.id === id ? { ...m, lastOpenedAt: new Date().toISOString() } : m))
      );
    },
    [setMenus]
  );

  const createMenu = useCallback(
    (name?: string) => {
      const menu = blankMenu(name);
      setMenus((prev) => [menu, ...prev]);
      logAnalyticsEvent('menu_created');
      return menu.id;
    },
    [setMenus]
  );

  const renameMenu = useCallback(
    (id: string, name: string) => {
      setMenus((prev) => prev.map((m) => (m.id === id ? touch({ ...m, name }) : m)));
    },
    [setMenus, touch]
  );

  const duplicateMenu = useCallback(
    (id: string) => {
      let newId = '';
      setMenus((prev) => {
        const source = prev.find((m) => m.id === id);
        if (!source) return prev;
        const now = new Date().toISOString();
        const copy: Menu = {
          ...source,
          id: crypto.randomUUID(),
          name: `${source.name} (Copy)`,
          ingredients: source.ingredients.map((i) => ({ ...i, id: crypto.randomUUID() })),
          favorite: false,
          createdAt: now,
          updatedAt: now,
          lastOpenedAt: now,
        };
        newId = copy.id;
        const sourceIndex = prev.findIndex((m) => m.id === id);
        const next = [...prev];
        next.splice(sourceIndex + 1, 0, copy);
        return next;
      });
      logAnalyticsEvent('menu_duplicated');
      return newId;
    },
    [setMenus]
  );

  const deleteMenu = useCallback(
    (id: string) => {
      setMenus((prev) => {
        const index = prev.findIndex((m) => m.id === id);
        if (index === -1) return prev;
        setPendingDeletion({ menu: prev[index], index });
        return prev.filter((m) => m.id !== id);
      });
      logAnalyticsEvent('menu_deleted');
    },
    [setMenus]
  );

  const undoDelete = useCallback(() => {
    setPendingDeletion((pending) => {
      if (!pending) return pending;
      setMenus((prev) => {
        const next = [...prev];
        next.splice(pending.index, 0, pending.menu);
        return next;
      });
      return null;
    });
  }, [setMenus]);

  const dismissUndo = useCallback(() => setPendingDeletion(null), []);

  const toggleFavorite = useCallback(
    (id: string) => {
      setMenus((prev) =>
        prev.map((m) => (m.id === id ? touch({ ...m, favorite: !m.favorite }) : m))
      );
    },
    [setMenus, touch]
  );

  const updateMenu = useCallback(
    (id: string, updater: (menu: Menu) => Menu) => {
      setMenus((prev) => prev.map((m) => (m.id === id ? touch(updater(m)) : m)));
    },
    [setMenus, touch]
  );

  const addIngredient = useCallback(
    (menuId: string) => {
      updateMenu(menuId, (m) => ({ ...m, ingredients: [...m.ingredients, blankIngredient()] }));
    },
    [updateMenu]
  );

  const updateIngredient = useCallback(
    (menuId: string, ingredientId: string, partial: Partial<MenuIngredient>) => {
      updateMenu(menuId, (m) => ({
        ...m,
        ingredients: m.ingredients.map((i) => (i.id === ingredientId ? { ...i, ...partial } : i)),
      }));
    },
    [updateMenu]
  );

  const removeIngredient = useCallback(
    (menuId: string, ingredientId: string) => {
      updateMenu(menuId, (m) => ({
        ...m,
        ingredients: m.ingredients.filter((i) => i.id !== ingredientId),
      }));
    },
    [updateMenu]
  );

  const updatePortions = useCallback(
    (menuId: string, portions: number) => {
      updateMenu(menuId, (m) => ({ ...m, portions: Math.max(0, portions) }));
    },
    [updateMenu]
  );

  const updatePreferredSellPrice = useCallback(
    (menuId: string, price: number) => {
      updateMenu(menuId, (m) => ({ ...m, preferredSellPrice: Math.max(0, price) }));
    },
    [updateMenu]
  );

  const importMenu = useCallback(
    (menu: Menu) => {
      const now = new Date().toISOString();
      const imported: Menu = {
        ...menu,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
        lastOpenedAt: now,
      };
      setMenus((prev) => [imported, ...prev]);
    },
    [setMenus]
  );

  const recentMenus = useMemo(
    () =>
      [...menus]
        .sort((a, b) => (b.lastOpenedAt ?? b.updatedAt).localeCompare(a.lastOpenedAt ?? a.updatedAt))
        .slice(0, 5),
    [menus]
  );

  const favoriteMenus = useMemo(() => menus.filter((m) => m.favorite), [menus]);

  const value: MenusContextValue = {
    menus,
    recentMenus,
    favoriteMenus,
    createMenu,
    renameMenu,
    duplicateMenu,
    deleteMenu,
    undoDelete,
    pendingDeletion,
    dismissUndo,
    toggleFavorite,
    updateMenu,
    addIngredient,
    updateIngredient,
    removeIngredient,
    updatePortions,
    updatePreferredSellPrice,
    importMenu,
    markOpened,
    cloudSync,
  };

  return <MenusContext.Provider value={value}>{children}</MenusContext.Provider>;
}

export function useMenusStore(): MenusContextValue {
  const ctx = useContext(MenusContext);
  if (!ctx) throw new Error('useMenusStore must be used within MenusProvider');
  return ctx;
}
