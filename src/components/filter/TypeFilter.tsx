import Select, { type MultiValue, type StylesConfig } from "react-select";
import { capitalize } from "../../libs/helper";
import type { Filters } from "../../types/filters";
import type { PokemonType } from "../../types/pokemon";

type Option = {
  value: string;
  label: string;
};

interface TypeFilterProps {
  filters: Filters;
  update: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  types: PokemonType[];
}

export default function TypeFilter({
  filters,
  update,
  types,
}: TypeFilterProps) {
  const options: Option[] = (types || []).map((t) => ({
    value: t.name,
    label: capitalize(t.name),
  }));

  const customStyles: StylesConfig<Option, true> = {
    control: (base, state) => ({
      ...base,
      backgroundColor: "rgba(0,0,0,0.2)",
      borderColor: state.isFocused
        ? "rgba(59,130,246,1)"
        : "rgba(255,255,255,0.2)",
      boxShadow: state.isFocused
        ? "0 0 0 2px rgba(59,130,246,0.5)"
        : "none",
      "&:hover": {
        borderColor: "rgba(255,255,255,0.35)",
      },
    }),

    menu: (base) => ({
      ...base,
      backgroundColor: "rgba(0,0,0,0.85)",
      border: "1px solid rgba(255,255,255,0.1)",
      backdropFilter: "blur(6px)",
    }),

    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused
        ? "rgba(255,255,255,0.1)"
        : "transparent",
      color: "white",
      cursor: "pointer",
    }),

    multiValue: (base) => ({
      ...base,
      backgroundColor: "rgba(255,255,255,0.2)",
    }),

    multiValueLabel: (base) => ({
      ...base,
      color: "white",
    }),

    multiValueRemove: (base) => ({
      ...base,
      color: "white",
      ":hover": {
        backgroundColor: "rgba(255,255,255,0.2)",
        color: "white",
      },
    }),

    singleValue: (base) => ({
      ...base,
      color: "white",
    }),

    input: (base) => ({
      ...base,
      color: "white",
    }),

    placeholder: (base) => ({
      ...base,
      color: "rgba(255,255,255,0.4)",
    }),
  };

  return (
    <div className="flex flex-col w-60">
      <label className="text-sm mb-1">Types</label>
      <Select<Option, true>
        isMulti
        options={options}
        value={options.filter((o) => filters.types.includes(o.value))}
        onChange={(selected: MultiValue<Option>) =>
          update(
            "types",
            selected.map((s) => s.value)
          )
        }
        placeholder="Filter by types..."
        styles={customStyles}
        classNamePrefix="type-select"
      />
    </div>
  );
}
