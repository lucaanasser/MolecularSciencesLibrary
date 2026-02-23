import { useState, useMemo } from "react";

export function useFilters(initialGroups) {
  const [groups, setGroups] = useState(() =>
    initialGroups.map(group => {
      if (group.type === "checkbox") {
        return { ...group, selected: group.selected ?? [] };
      }
      if (group.type === "input") {
        return { ...group, value: group.value ?? "" };
      }
      return group;
    })
  );
  
  const setCheckbox = (groupKey, opt) => {
    setGroups(prev =>
      prev.map(group =>
        group.key === groupKey
          ? {
              ...group,
              selected: group.selected.includes(opt)
                ? group.selected.filter(v => v !== opt)
                : [...group.selected, opt],
            }
          : group
      )
    );
  };

  const setInput = (groupKey, value) => {
    setGroups(prev =>
      prev.map(group =>
        group.key === groupKey
          ? { ...group, value }
          : group
      )
    );
  };

  const clearAll = () => {
    setGroups(prev =>
      prev.map(group =>
        group.type === "checkbox"
          ? { ...group, selected: [] }
          : group.type === "input"
          ? { ...group, value: "" }
          : group
      )
    );
  };

  const getOptions = group => {
    if (typeof group.options === "function") {
      return group.options(groups);
    }
    return group.options;
  };

  // Monta o objeto plano de filtros
  const filters = useMemo(() => {
    const filtersObj: Record<string, any> = {};
    groups.forEach(group => {
      if (group.type === "checkbox" && group.selected.length > 0) {
        filtersObj[group.key] = group.selected;
      }
      if (group.type === "input" && group.value) {
        filtersObj[group.key] = group.value;
      }
    });
    return filtersObj;
  }, [groups]);

  return {
    groups,
    filters,
    setCheckbox,
    setInput,
    clearAll,
    getOptions,
  };
}