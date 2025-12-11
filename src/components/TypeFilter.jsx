import Select from "react-select";
import { capitalize } from "../libs/helper";

export default function TypeFilter({ filters, update, types }) {
  const options = (types || []).map((t) => ({
    value: t.name,
    label: capitalize(t.name),
  }));

  return (
    <div className="flex flex-col w-60">
      <label className="text-sm mb-1">Types</label>
      <Select
        isMulti
        options={options}
        value={options.filter((o) => filters.types?.includes(o.value))}
        onChange={(selected) =>
          update(
            "types",
            selected.map((s) => s.value)
          )
        }
        className="text-black"
        classNamePrefix="type-select"
        placeholder="Filter by types..."
      />
    </div>
  );
}
