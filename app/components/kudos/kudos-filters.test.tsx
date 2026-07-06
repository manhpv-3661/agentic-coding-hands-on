import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { KudosFilters } from "./kudos-filters";

const labels = { hashtagLabel: "Hashtag", departmentLabel: "Phòng ban", allOption: "Tất cả" };

describe("KudosFilters", () => {
  it("renders both dropdowns with an all option plus the given options", () => {
    render(
      <KudosFilters
        value={{ hashtag: null, department: null }}
        onChange={vi.fn()}
        hashtagOptions={["#teamwork", "#innovation"]}
        departmentOptions={["Phòng Kỹ thuật", "Phòng Nhân sự"]}
        labels={labels}
      />,
    );

    expect(screen.getByRole("combobox", { name: /Hashtag/ })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: /Phòng ban/ })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "#teamwork" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Phòng Kỹ thuật" })).toBeInTheDocument();
  });

  it("calls onChange with the selected hashtag, keeping department unchanged", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(
      <KudosFilters
        value={{ hashtag: null, department: "Phòng Nhân sự" }}
        onChange={onChange}
        hashtagOptions={["#teamwork"]}
        departmentOptions={["Phòng Nhân sự"]}
        labels={labels}
      />,
    );

    await user.selectOptions(screen.getByRole("combobox", { name: /Hashtag/ }), "#teamwork");

    expect(onChange).toHaveBeenCalledWith({ hashtag: "#teamwork", department: "Phòng Nhân sự" });
  });

  it("resets to null when 'all' is selected", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(
      <KudosFilters
        value={{ hashtag: "#teamwork", department: null }}
        onChange={onChange}
        hashtagOptions={["#teamwork"]}
        departmentOptions={[]}
        labels={labels}
      />,
    );

    await user.selectOptions(screen.getByRole("combobox", { name: /Hashtag/ }), "Tất cả");

    expect(onChange).toHaveBeenCalledWith({ hashtag: null, department: null });
  });
});
