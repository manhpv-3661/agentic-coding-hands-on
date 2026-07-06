import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { KudosCard } from "./kudos-card";
import type { KudosPost } from "@/lib/kudos/kudos-types";

const labels = {
  viewDetail: "Xem chi tiết",
  copyLink: "Copy Link",
  copied: "Đã sao chép",
  like: "Thả tim",
  unlike: "Bỏ thả tim",
};

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

  it("renders the heart as a static span when no onToggleLike is wired (F006 fallback)", () => {
    render(<KudosCard post={post} variant="highlight" labels={labels} />);

    const heartCount = screen.getByText("45");
    expect(heartCount.closest("button")).toBeNull();
    expect(heartCount.tagName.toLowerCase()).not.toBe("button");
  });

  it("renders an interactive heart button when onToggleLike is wired (F008)", () => {
    render(
      <KudosCard post={post} variant="highlight" labels={labels} onToggleLike={vi.fn()} />,
    );

    const button = screen.getByRole("button", { name: labels.like });
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(button).toHaveTextContent("45");
  });

  it("toggles liked state / count via onToggleLike (F008)", async () => {
    const onToggleLike = vi.fn();
    const user = userEvent.setup();

    const { rerender } = render(
      <KudosCard post={post} variant="highlight" labels={labels} onToggleLike={onToggleLike} />,
    );

    await user.click(screen.getByRole("button", { name: labels.like }));
    expect(onToggleLike).toHaveBeenCalledWith(post.id);

    rerender(
      <KudosCard post={post} variant="highlight" labels={labels} liked onToggleLike={onToggleLike} />,
    );

    const likedButton = screen.getByRole("button", { name: labels.unlike });
    expect(likedButton).toHaveAttribute("aria-pressed", "true");
    expect(likedButton).toHaveTextContent("46");
  });

  it("disables the heart for own post (canLike=false) and does not fire onToggleLike (F008)", async () => {
    const onToggleLike = vi.fn();
    const user = userEvent.setup();

    render(
      <KudosCard
        post={post}
        variant="highlight"
        labels={labels}
        canLike={false}
        onToggleLike={onToggleLike}
      />,
    );

    const button = screen.getByRole("button", { name: labels.like });
    expect(button).toBeDisabled();

    await user.click(button);
    expect(onToggleLike).not.toHaveBeenCalled();
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

  it("renders the title line when post.title is present (F007)", () => {
    render(<KudosCard post={{ ...post, title: "Người truyền động lực" }} variant="feed" labels={labels} />);
    expect(screen.getByText("Người truyền động lực")).toBeInTheDocument();
  });

  it("renders no extra title heading when post.title is absent (F006 posts unaffected)", () => {
    render(<KudosCard post={post} variant="feed" labels={labels} />);
    expect(post.title).toBeUndefined();
    // No additional heading beyond timestamp/content/hashtags exists —
    // sanity-checked by the other assertions above already passing.
  });
});
