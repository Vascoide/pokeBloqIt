import React from "react";
import { screen } from "@testing-library/react";
import { renderWithAppProviders } from "./test-utils";
import FiltersBar from "../components/FiltersBar";

test("renders FiltersBar correctly", () => {
  renderWithAppProviders(
    <FiltersBar
      filters={{ name: "", type: "" }}
      onChange={() => {}}
      viewMode="grid"
      onViewModeChange={() => {}}
    />
  );

  expect(screen.getByText(/search/i)).toBeInTheDocument();
});
