import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RecipientSelect } from "./recipient-select";
import type { KudosPerson } from "@/lib/kudos/kudos-types";

const labels = { placeholder: "Chọn người nhận", search: "Tìm đồng nghiệp", error: "Vui lòng chọn người nhận." };

const options: KudosPerson[] = [
  { name: "Nguyễn Văn An", department: "Phòng Kỹ thuật", stars: 12 },
  { name: "Trần Thị Bình", department: "Phòng Thiết kế", stars: 18 },
];

describe("RecipientSelect", () => {
  it("shows the placeholder when no value is selected", () => {
    render(<RecipientSelect options={options} value={null} onChange={vi.fn()} labels={labels} />);
    expect(screen.getByText("Chọn người nhận")).toBeInTheDocument();
  });

  it("opens the listbox on trigger click and lists all options", async () => {
    const user = userEvent.setup();
    render(<RecipientSelect options={options} value={null} onChange={vi.fn()} labels={labels} />);

    await user.click(screen.getByRole("button", { name: /chọn người nhận/i }));

    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /Nguyễn Văn An/ })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /Trần Thị Bình/ })).toBeInTheDocument();
  });

  it("filters options by a case-insensitive substring of the search query", async () => {
    const user = userEvent.setup();
    render(<RecipientSelect options={options} value={null} onChange={vi.fn()} labels={labels} />);

    await user.click(screen.getByRole("button", { name: /chọn người nhận/i }));
    await user.type(screen.getByPlaceholderText("Tìm đồng nghiệp"), "bình");

    expect(screen.queryByRole("option", { name: /Nguyễn Văn An/ })).not.toBeInTheDocument();
    expect(screen.getByRole("option", { name: /Trần Thị Bình/ })).toBeInTheDocument();
  });

  it("calls onChange with the full person object and closes the list on selection", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<RecipientSelect options={options} value={null} onChange={onChange} labels={labels} />);

    await user.click(screen.getByRole("button", { name: /chọn người nhận/i }));
    await user.click(screen.getByRole("option", { name: /Nguyễn Văn An/ }));

    expect(onChange).toHaveBeenCalledWith(options[0]);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("renders the inline error text when the error prop is set", () => {
    render(
      <RecipientSelect options={options} value={null} onChange={vi.fn()} error={labels.error} labels={labels} />,
    );
    expect(screen.getByText(labels.error)).toBeInTheDocument();
  });

  it("closes the listbox on Escape", async () => {
    const user = userEvent.setup();
    render(<RecipientSelect options={options} value={null} onChange={vi.fn()} labels={labels} />);

    await user.click(screen.getByRole("button", { name: /chọn người nhận/i }));
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});
