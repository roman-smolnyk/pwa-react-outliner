import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { CircleIcon } from "lucide-react";

describe("CircleIcon", () => {
  it("renders svg icon", () => {
    const { container } = render(<CircleIcon />);

    const svg = container.querySelector("svg");

    expect(svg).toBeTruthy();
  });
});
