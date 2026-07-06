import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { KudosCard } from "./kudos-card";
import type { KudosPost } from "@/lib/kudos/kudos-types";

const labels = { viewDetail: "Xem chi tiết", copyLink: "Copy Link", copied: "Đã sao chép" };

const post: KudosPost = {
  id: "kudos-1",
  sender: { name: "Nguyễn Văn An", department: "Phòng Kỹ thuật", stars: 12 },
  recipient: { name: "Trần Thị Bình", department: "Phòng Thiết kế", stars: 18 },
  timestamp: "09:30 - 12/25/2025",
  content: "Cảm ơn bạn đã hỗ trợ team rất nhiều trong dịp này.",
  hashtags: ["#teamwork", "#dedication"],
  imageCount: 3,
  hearts: 45,
};

describe("KudosCard", () => {
  it("renders sender/recipient names, content, hearts count, and copy link", () => {
    render(<KudosCard post={post} variant="highlight" labels={labels} />);

    expect(screen.getByText("Nguyễn Văn An")).toBeInTheDocument();
    expect(screen.getByText("Trần Thị Bình")).toBeInTheDocument();
    expect(screen.getByText(post.content)).toBeInTheDocument();
    expect(screen.getByText("45")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy Link" })).toBeInTheDocument();
  });

  it("renders the heart count as a static span, never a button (out of scope)", () => {
    render(<KudosCard post={post} variant="highlight" labels={labels} />);

    const heartCount = screen.getByText("45");
    expect(heartCount.closest("button")).toBeNull();
    expect(heartCount.tagName.toLowerCase()).not.toBe("button");
  });

  it("highlight variant shows 'Xem chi tiết' as static text with no href", () => {
    render(<KudosCard post={post} variant="highlight" labels={labels} />);

    const viewDetail = screen.getByText("Xem chi tiết");
    expect(viewDetail.tagName.toLowerCase()).not.toBe("a");
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("highlight variant renders static hashtags and no image gallery", () => {
    render(<KudosCard post={post} variant="highlight" labels={labels} />);

    expect(screen.getByText("#teamwork")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "#teamwork" })).not.toBeInTheDocument();
  });

  it("feed variant renders clickable hashtags that call onHashtagClick", async () => {
    const onHashtagClick = vi.fn();
    const user = userEvent.setup();

    render(
      <KudosCard post={post} variant="feed" labels={labels} onHashtagClick={onHashtagClick} />,
    );

    await user.click(screen.getByRole("button", { name: "#teamwork" }));
    expect(onHashtagClick).toHaveBeenCalledWith("#teamwork");
  });

  it("feed variant renders the image gallery and no 'Xem chi tiết' CTA", () => {
    render(<KudosCard post={post} variant="feed" labels={labels} />);

    expect(screen.queryByText("Xem chi tiết")).not.toBeInTheDocument();
  });

  it("does not render any link or navigation affordance on avatars/names", () => {
    render(<KudosCard post={post} variant="feed" labels={labels} />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
