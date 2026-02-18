import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { createPortal } from "react-dom";
import { serverApi } from "../../lib/config";

interface AnimationState {
  isAnimating: boolean;
  from: { x: number; y: number };
  to: { x: number; y: number };
  imageUrl: string;
}

interface AddToCartAnimationContextType {
  triggerAnimation: (sourceElement: HTMLElement, imagePath: string) => void;
}

const AddToCartAnimationContext = createContext<AddToCartAnimationContextType | null>(null);

export function AddToCartAnimationProvider({ children }: { children: ReactNode }) {
  const [anim, setAnim] = useState<AnimationState | null>(null);

  const triggerAnimation = useCallback((sourceElement: HTMLElement | null, imagePath: string) => {
    if (!sourceElement) return;
    const cartEl = document.getElementById("cart-icon");
    if (!cartEl) return;

    const sourceRect = sourceElement.getBoundingClientRect();
    const cartRect = cartEl.getBoundingClientRect();

    const from = {
      x: sourceRect.left + sourceRect.width / 2,
      y: sourceRect.top + sourceRect.height / 2,
    };
    const to = {
      x: cartRect.left + cartRect.width / 2,
      y: cartRect.top + cartRect.height / 2,
    };

    const fullImageUrl = imagePath.startsWith("http") ? imagePath : `${serverApi}/${imagePath}`;

    setAnim({
      isAnimating: true,
      from,
      to,
      imageUrl: fullImageUrl,
    });

    setTimeout(() => setAnim(null), 600);
  }, []);

  const flyElement = anim && (
    <div
      className="add-to-cart-fly"
      style={{
        "--fly-from-x": `${anim.from.x}px`,
        "--fly-from-y": `${anim.from.y}px`,
        "--fly-to-x": `${anim.to.x}px`,
        "--fly-to-y": `${anim.to.y}px`,
      } as React.CSSProperties}
    >
      <img src={anim.imageUrl} alt="" />
    </div>
  );

  return (
    <AddToCartAnimationContext.Provider value={{ triggerAnimation }}>
      {children}
      {anim && createPortal(flyElement, document.body)}
    </AddToCartAnimationContext.Provider>
  );
}

export function useAddToCartAnimation() {
  const ctx = useContext(AddToCartAnimationContext);
  return ctx;
}
