import { FilterGroupConfig } from "../search";
import { AREAS, SUBAREAS, STATUS, LANGUAGES } from "@/constants/books";

const filterGroupsConfig: FilterGroupConfig[] = [
  {
    key: "area",
    label: "Área",
    type: "checkbox",
    options: AREAS.map(area => area),
  },
  {
    key: "subarea",
    label: "Subárea",
    type: "checkbox",
    options: (groups) => {
      const areaGroup = groups.find(g => g.key === "area");
      let subareas: string[] = [];
      (areaGroup.type === "checkbox" && areaGroup.selected || [])
        .forEach(area => {
          subareas = (SUBAREAS[area]?.map(subarea => subarea) || []);
        }
      );
      return subareas;
    },
  },
  {
    key: "status",
    label: "Status",
    type: "checkbox",
    options: STATUS.map(status => status),
  },
  //{ não implementado ainda no backend
  //  key: "language",
  //  label: "Idioma",
  //  type: "checkbox",
  //  options: LANGUAGES.map(lang => lang),
  //},
];

export default filterGroupsConfig;