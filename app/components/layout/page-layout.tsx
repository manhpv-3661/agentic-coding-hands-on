import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

const GUTTER_CLASS = "w-full px-6 sm:px-10 lg:px-36";

const CONTENT_WIDTH_CLASS = {
  1120: "max-w-[1120px]",
  1152: "max-w-[1152px]",
  1224: "max-w-[1224px]",
} as const;

type ContentWidth = keyof typeof CONTENT_WIDTH_CLASS;

type LayoutProps<T extends ElementType> = {
  as?: T;
  className?: string;
  children: ReactNode;
};

type PolymorphicProps<T extends ElementType> = LayoutProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof LayoutProps<T>>;

function joinClasses(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function PageGutter<T extends ElementType = "div">({
  as,
  className,
  children,
  ...props
}: PolymorphicProps<T>) {
  const Tag = as ?? "div";

  return (
    <Tag className={joinClasses(GUTTER_CLASS, className)} {...props}>
      {children}
    </Tag>
  );
}

export type ContentFrameProps<T extends ElementType = "div"> = PolymorphicProps<T> & {
  width: ContentWidth;
};

export function ContentFrame<T extends ElementType = "div">({
  as,
  className,
  width,
  children,
  ...props
}: ContentFrameProps<T>) {
  const Tag = as ?? "div";

  return (
    <Tag
      className={joinClasses("mx-auto w-full", CONTENT_WIDTH_CLASS[width], className)}
      {...props}
    >
      {children}
    </Tag>
  );
}
